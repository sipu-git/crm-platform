import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: required('DATABASE_URL'),
  // clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  clientUrl: process.env.PRODUCTION_URL ?? 'https://crm-platform-weld.vercel.app',
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET_KEY'),
    refreshSecret: required('JWT_REFRESH_SECRET_KEY'),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY ?? '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  },
  aws: {
    region: process.env.AWS_REGION ?? 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
  gemini: {
    apiKey: (process.env.GEMINI_API_KEY ?? '').trim(),
  },
  llm: {
    modelId: (process.env.GEMINI_MODEL_ID ?? 'gemini-3.8-flash').trim(),
    timeoutMs: Number(process.env.LLM_TIMEOUT_MS ?? 30000),
    maxRetries: Number(process.env.LLM_MAX_RETRIES ?? 2),
  },
};

if (!env.llm.modelId) {
  throw new Error('GEMINI_MODEL_ID must not be empty.');
}
if (!Number.isInteger(env.llm.timeoutMs) || env.llm.timeoutMs < 1000 || env.llm.timeoutMs > 120000) {
  throw new Error('LLM_TIMEOUT_MS must be an integer between 1000 and 120000.');
}
if (!Number.isInteger(env.llm.maxRetries) || env.llm.maxRetries < 0 || env.llm.maxRetries > 5) {
  throw new Error('LLM_MAX_RETRIES must be an integer between 0 and 5.');
}
