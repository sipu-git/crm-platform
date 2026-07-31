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
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET_KEY'),
    refreshSecret: required('JWT_REFRESH_SECRET_KEY'),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY ?? '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  },
};
