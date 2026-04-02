import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from 'ai';
import { getModel, markRateLimited, markSuccess } from '@/lib/ai/llm-router';
import { dealershipTools } from '@/lib/ai/tools';
import { getSystemPrompt } from '@/lib/ai/system-prompt';
import { createAdminClient } from '@/lib/supabase/admin';
import type { BotSettings } from '@/lib/types';

export const maxDuration = 35;

/** Timeout per LLM attempt — abort cleanly if the provider hangs */
const PROVIDER_TIMEOUT_MS = 20_000;

/**
 * Fetch bot settings from Supabase. Returns null if unavailable.
 */
async function fetchBotSettings(): Promise<BotSettings | null> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from('bot_settings').select('*').limit(1).single();
    return data as BotSettings | null;
  } catch {
    return null;
  }
}

/**
 * POST /api/chat
 * Streaming AI chat endpoint for the TyFix chatbot.
 * Uses triple-LLM failover with dealership tools.
 */
export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages are required', { status: 400 });
    }

    // Fetch admin-configured bot settings
    const botSettings = await fetchBotSettings();

    // If the bot is disabled, return a friendly message
    if (botSettings && !botSettings.bot_enabled) {
      return new Response(
        JSON.stringify({
          error: "We're not taking chat messages right now. Give us a call at (555) 123-4567!",
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build the system prompt from settings (falls back to defaults if null)
    const systemPrompt = getSystemPrompt(botSettings);

    // Use admin-configured model params or defaults
    const temperature = botSettings?.temperature ?? 0.8;
    const maxOutputTokens = botSettings?.max_tokens ?? 300;
    const frequencyPenalty = botSettings?.frequency_penalty ?? 0.5;
    const presencePenalty = botSettings?.presence_penalty ?? 0.4;

    // Convert messages once (reused across retries)
    const modelMessages = await convertToModelMessages(messages);

    // Try up to 3 providers
    const providers = ['primary', 'fallback', 'overflow'] as const;
    let lastError: Error | null = null;

    for (const attempt of providers) {
      const { model, providerName } = getModel();

      try {
        const result = streamText({
          model,
          system: systemPrompt,
          messages: modelMessages,
          tools: dealershipTools,
          stopWhen: stepCountIs(5),
          maxOutputTokens,
          temperature,
          frequencyPenalty,
          presencePenalty,
          abortSignal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
          onError: ({ error }) => {
            console.error(`[AI Bot] ${providerName} stream error:`, error);
          },
          onFinish: () => {
            markSuccess(providerName);
          },
        });

        return result.toUIMessageStreamResponse();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const isTimeout = lastError.name === 'TimeoutError' || lastError.name === 'AbortError';
        console.error(
          `[AI Bot] ${providerName} failed (attempt: ${attempt}${isTimeout ? ', timeout' : ''}):`,
          lastError.message
        );

        // Route to cooldown based on error type
        const status = (error as { status?: number })?.status;
        if (status === 429) {
          markRateLimited(providerName, 60_000);
        } else if (isTimeout) {
          markRateLimited(providerName, 15_000);
        } else {
          markRateLimited(providerName, 30_000);
        }
      }
    }

    // All providers failed
    console.error('[AI Bot] All LLM providers failed:', lastError?.message);
    return new Response(
      JSON.stringify({
        error: 'Our AI assistant is temporarily busy. Please try again in a moment or call us at (555) 123-4567.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI Bot] Request error:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
