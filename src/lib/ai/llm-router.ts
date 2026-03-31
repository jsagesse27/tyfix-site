import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LanguageModel } from 'ai';

/**
 * TyFix AI Bot — Triple-LLM Failover Router
 *
 * Priority: Groq (fastest) → Gemini (generous free tier) → Cerebras (overflow)
 * On 429 or error, falls through to next provider.
 */

interface ProviderState {
  name: string;
  rateLimitedUntil: number; // timestamp when rate limit expires
  errorCount: number;
}

const providerStates: Record<string, ProviderState> = {
  groq: { name: 'groq', rateLimitedUntil: 0, errorCount: 0 },
  gemini: { name: 'gemini', rateLimitedUntil: 0, errorCount: 0 },
  cerebras: { name: 'cerebras', rateLimitedUntil: 0, errorCount: 0 },
};

// Initialize providers
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const cerebras = createOpenAICompatible({
  name: 'cerebras',
  baseURL: 'https://api.cerebras.ai/v1',
  apiKey: process.env.CEREBRAS_API_KEY,
});

interface ModelChoice {
  model: LanguageModel;
  providerName: string;
}

/**
 * Returns the best available LLM model based on current rate-limit state.
 * Falls through: Groq → Gemini → Cerebras
 */
export function getModel(): ModelChoice {
  const now = Date.now();

  // Try Groq first (fastest TTFT, sub-200ms)
  if (now > providerStates.groq.rateLimitedUntil) {
    return {
      model: groq('llama-3.3-70b-versatile'),
      providerName: 'groq',
    };
  }

  // Fallback to Gemini (most generous RPD)
  if (now > providerStates.gemini.rateLimitedUntil) {
    return {
      model: google('gemini-2.0-flash'),
      providerName: 'gemini',
    };
  }

  // Overflow to Cerebras (1M tokens/day)
  if (now > providerStates.cerebras.rateLimitedUntil) {
    return {
      model: cerebras('llama-3.3-70b'),
      providerName: 'cerebras',
    };
  }

  // All rate-limited, use the one that expires soonest
  const sorted = Object.values(providerStates).sort(
    (a, b) => a.rateLimitedUntil - b.rateLimitedUntil
  );

  const soonest = sorted[0].name;
  if (soonest === 'groq') return { model: groq('llama-3.3-70b-versatile'), providerName: 'groq' };
  if (soonest === 'gemini') return { model: google('gemini-2.0-flash'), providerName: 'gemini' };
  return { model: cerebras('llama-3.3-70b'), providerName: 'cerebras' };
}

/**
 * Mark a provider as rate-limited. It will be skipped for the cooldown duration.
 */
export function markRateLimited(providerName: string, cooldownMs: number = 60_000) {
  if (providerStates[providerName]) {
    providerStates[providerName].rateLimitedUntil = Date.now() + cooldownMs;
    providerStates[providerName].errorCount++;
  }
}

/**
 * Reset a provider's rate limit state (e.g., after a successful request).
 */
export function markSuccess(providerName: string) {
  if (providerStates[providerName]) {
    providerStates[providerName].rateLimitedUntil = 0;
    providerStates[providerName].errorCount = 0;
  }
}
