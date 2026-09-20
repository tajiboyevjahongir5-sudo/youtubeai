import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env';
import * as schema from './schema';

const pool = new Pool({
  connectionString: env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/jpilot',
});

pool.on('error', (err) => {
  console.warn('⚠️ [Database] PostgreSQL pool xabari (xizmat to\'xtamaydi):', err.message);
});

export const db = drizzle(pool, { schema });
