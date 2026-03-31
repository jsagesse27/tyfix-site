import {
  streamText,
  convertToModelMessages,
  stepCountIs,
  type UIMessage,
} from 'ai';
import { getModel, markRateLimited, markSuccess } from '@/lib/ai/llm-router';
import { dealershipTools } from '@/lib/ai/tools';
import { getSystemPrompt } from '@/lib/ai/system-prompt';

export const maxDuration = 30;

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

    // Try up to 3 providers
    const providers = ['primary', 'fallback', 'overflow'] as const;
    let lastError: Error | null = null;

    for (const attempt of providers) {
      const { model, providerName } = getModel();

      try {
        const result = streamText({
          model,
          system: getSystemPrompt(),
          messages: await convertToModelMessages(messages),
          tools: dealershipTools,
          stopWhen: stepCountIs(5),
          maxOutputTokens: 300,
          temperature: 0.8,
          onError: ({ error }) => {
            console.error(`[AI Bot] ${providerName} error:`, error);
          },
          onFinish: () => {
            markSuccess(providerName);
          },
        });

        return result.toUIMessageStreamResponse();
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[AI Bot] ${providerName} failed (attempt: ${attempt}):`, lastError.message);

        // Check for rate limit (429) or server error (5xx)
        const status = (error as { status?: number })?.status;
        if (status === 429) {
          markRateLimited(providerName, 60_000); // 1 minute cooldown
        } else {
          markRateLimited(providerName, 30_000); // 30s cooldown for other errors
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
