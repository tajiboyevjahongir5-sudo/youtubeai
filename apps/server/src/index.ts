import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './env';
import routes from './routes';
import { errorHandler } from './middleware/error-handler';
import { clerkMiddleware } from '@clerk/express';
import { db } from './db';
import { sql } from 'drizzle-orm';
import './jobs/worker';
import './services/scheduler.service';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
import path from 'path';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static media files for video player and previews
const publicDir = path.resolve(__dirname, '../public');
app.use('/media', express.static(publicDir));
app.use(express.static(publicDir));

// Health check endpoint (available without auth)
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'mock/local';
  }
  res.json({
    status: 'ok',
    product: 'Jpilot',
    db: dbStatus,
    env: env.NODE_ENV,
  });
});

// Auth middleware - use Clerk if keys configured, otherwise mock dev user
if (env.CLERK_SECRET_KEY && !env.CLERK_SECRET_KEY.includes('placeholder')) {
  app.use(clerkMiddleware());
} else {
  app.use((req, res, next) => {
    (req as any).auth = { userId: 'user_dev_workspace', sessionId: 'sess_dev' };
    next();
  });
}

app.use('/api', routes);

app.use(errorHandler);

process.on('uncaughtException', (err) => {
  console.error('❌ [Server] Kutilmagan xatolik (server to\'xtamaydi):', err?.message || err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [Server] Qaytarilmagan Promise xatosi:', reason);
});

const port = Number(process.env.PORT) || Number(env.PORT) || 3000;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Jpilot Server listening on 0.0.0.0:${port} (NODE_ENV: ${process.env.NODE_ENV || env.NODE_ENV || 'production'})`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
