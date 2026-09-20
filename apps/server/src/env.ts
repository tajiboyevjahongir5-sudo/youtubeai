import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const emptyToUndefined = (val: unknown) => 
  typeof val === 'string' && val.trim() === '' ? undefined : val;

const envSchema = z.object({
  PORT: z.preprocess(emptyToUndefined, z.string().default('3000')),
  NODE_ENV: z.preprocess(emptyToUndefined, z.string().default('development')),
  DATABASE_URL: z.preprocess(emptyToUndefined, z.string().optional()),
  CLERK_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  JWT_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  REDIS_URL: z.preprocess(emptyToUndefined, z.string().optional()),
  TELEGRAM_BOT_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  GEMINI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  GROQ_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  OPENROUTER_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  DEEPSEEK_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  YOUTUBE_CLIENT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  YOUTUBE_CLIENT_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  YOUTUBE_REDIRECT_URI: z.preprocess(emptyToUndefined, z.string().optional()),
  FRONTEND_URL: z.preprocess(emptyToUndefined, z.string().default('http://localhost:5173')),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.warn('⚠️ [Config] Environment variable parsing notice:', _env.error.format());
}

export const env = _env.success ? _env.data : {
  PORT: process.env.PORT || '3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || undefined,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || undefined,
  JWT_SECRET: process.env.JWT_SECRET || undefined,
  REDIS_URL: process.env.REDIS_URL || undefined,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || undefined,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || undefined,
  GROQ_API_KEY: process.env.GROQ_API_KEY || undefined,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || undefined,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || undefined,
  YOUTUBE_CLIENT_ID: process.env.YOUTUBE_CLIENT_ID || undefined,
  YOUTUBE_CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET || undefined,
  YOUTUBE_REDIRECT_URI: process.env.YOUTUBE_REDIRECT_URI || undefined,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};
