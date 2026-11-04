import dns from 'node:dns';
import type { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { RunnableLambda, type RunnableConfig } from '@langchain/core/runnables';
import { ChatGoogle } from '@langchain/google';
import type { ZodType } from 'zod';
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
  if (error instanceof InvalidStructuredOutputError) return true;
  const status = statusCode(error);
  // A brief retry can recover from Gemini's transient capacity 503s. Do not
  // retry timeouts: a second full timeout can exceed the client's request limit.
  if (status === 429 || status === 503) return true;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('high demand') ||
      msg.includes('temporarily') ||
      msg.includes('503') ||
      msg.includes('econnreset')
    ) {
      return true;
    }
  }
  return false;
}

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

class InvalidStructuredOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStructuredOutputError';
  }
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
        if (error instanceof InvalidStructuredOutputError) {
          throw new ApiError(502, 'The AI service returned an invalid response. Please try again.');
        }
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

/** Returns the shared Gemini model used by LangChain chains, agents, and graphs. */
export function getLlmModel(overrideModel?: string): ChatGoogle {
  if (!env.google.apiKey) {
    throw new ApiError(503, 'Set GEMINI_API_KEY before using AI features.');
  }

  return new ChatGoogle({
    apiKey: env.google.apiKey,
    model: overrideModel || env.llm.modelId,
    temperature: 0.2,
    maxOutputTokens: 1024,
    thinkingLevel: 'minimal',
    maxRetries: 0,
  });
}

export function getStructuredLlmModel<Output extends Record<string, unknown>>(schema: ZodType<Output>) {
  const structuredModel = getLlmModel().withStructuredOutput(schema, { method: 'functionCalling' });
  return RunnableLambda.from<BaseLanguageModelInput, Output>(async (input, config?: RunnableConfig) => {
    let result: unknown;
    try {
      result = await structuredModel.invoke(input, config);
    } catch (error) {
      if (isZodValidationError(error)) {
        throw new InvalidStructuredOutputError(`Model ${env.llm.modelId} returned invalid structured output.`);
      }
      throw error;
    }

    const parsed = schema.safeParse(result);
    if (!parsed.success) {
      throw new InvalidStructuredOutputError(`Model ${env.llm.modelId} did not return the expected structured output.`);
    }
    return parsed.data;
  });
}

function isZodValidationError(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'issues' in error
    && Array.isArray((error as { issues?: unknown }).issues);
}
