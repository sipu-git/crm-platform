import { ChatGoogle } from '@langchain/google';
import { env } from '../shared/configs/env.js';
import { ApiError } from '../shared/utils/ApiError.js';

function statusCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const candidate = error as { status?: unknown; statusCode?: unknown; response?: { status?: unknown } };
  for (const value of [candidate.status, candidate.statusCode, candidate.response?.status]) {
    if (typeof value === 'number') return value;
  }
  return undefined;
}

function isRetryable(error: unknown): boolean {
  const status = statusCode(error);
  return status === 429 || (status !== undefined && status >= 500 && status <= 599);
}

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function withLlmRetries<T>(operation: () => Promise<T>,
  options: { maxRetries: number; sleep?: (milliseconds: number) => Promise<void> },
): Promise<T> {
  const sleep = options.sleep ?? pause;

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryable(error) || attempt >= options.maxRetries) throw error;
      const delay = Math.min(5000, 300 * 2 ** attempt) + Math.floor(Math.random() * 200);
      await sleep(delay);
    }
  }
}

/** Returns the shared Gemini model used by LangChain chains, agents, and graphs. */
export function getLlmModel(): ChatGoogle {
  if (!env.gemini.apiKey) {
    throw new ApiError(503, 'Set GEMINI_API_KEY to your Google AI Studio API key before using AI features.');
  }

  return new ChatGoogle({
    apiKey: env.gemini.apiKey,
    model: env.llm.modelId,
    platformType: 'gai',
    maxRetries: 0,
  });
}

