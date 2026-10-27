import dns from 'node:dns';
import { ChatOpenAI } from '@langchain/openai';
import { env } from '../shared/configs/env.js';
import { ApiError } from '../shared/utils/ApiError.js';

// Ensure undici and node fetch use IPv4 first to avoid 30s+ IPv6 connection delays on Windows/Render
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignore in environments where not supported
}

function statusCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const candidate = error as { status?: unknown; statusCode?: unknown; response?: { status?: unknown } };
  for (const value of [candidate.status, candidate.statusCode, candidate.response?.status]) {
    if (typeof value === 'number') return value;
  }
  return undefined;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') return true;
    const msg = error.message.toLowerCase();
    if (
      msg.includes('timeout') ||
      msg.includes('aborted') ||
      msg.includes('high demand') ||
      msg.includes('temporarily') ||
      msg.includes('503') ||
      msg.includes('econnreset')
    ) {
      return true;
    }
  }
  const status = statusCode(error);
  return status === 429 || (status !== undefined && status >= 500 && status <= 599);
}

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function withLlmRetries<T>(
  operation: () => Promise<T>,
  options: { maxRetries: number; sleep?: (milliseconds: number) => Promise<void> },
): Promise<T> {
  const sleep = options.sleep ?? pause;

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isRetryable(error) || attempt >= options.maxRetries) {
        if (error instanceof Error && (error.name === 'TimeoutError' || error.message.includes('timeout') || error.message.includes('aborted'))) {
          throw new ApiError(504, 'The AI request timed out. Please try again.');
        }
        if (error instanceof Error && (error.message.includes('high demand') || error.message.includes('503'))) {
          throw new ApiError(503, 'The AI service is experiencing high demand. Please try again in a few moments.');
        }
        throw error;
      }
      const delay = Math.min(3000, 400 * 2 ** attempt) + Math.floor(Math.random() * 200);
      await sleep(delay);
    }
  }
}

/** Returns the shared NVIDIA Nemotron model used by LangChain chains, agents, and graphs. */
export function getLlmModel(overrideModel?: string): ChatOpenAI {
  if (!env.nvidia.apiKey) {
    throw new ApiError(503, 'Set NVIDIA_API_KEY to your NVIDIA API key before using AI features.');
  }

  return new ChatOpenAI({
    apiKey: env.nvidia.apiKey,
    model: overrideModel || env.llm.modelId,
    configuration: {
      baseURL: 'https://integrate.api.nvidia.com/v1',
    },
    temperature: 0.2,
    maxTokens: 4096,
    maxRetries: 0,
  });
}
