import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { env } from './env';
import routes from './routes';
import { errorHandler } from './middleware/error-handler';
import { db } from './db';
import { sql } from 'drizzle-orm';
import './jobs/worker';
import './services/scheduler.service';

const app = express();

app.set('trust proxy', 1);

// Security Headers
app.use(helmet({ contentSecurityPolicy: false }));

// Whitelist-based CORS with credentials support
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://jpilot.uz',
  'https://www.jpilot.uz',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, server-to-server, curl)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.railway.app') ||
      origin.endsWith('jpilot.uz')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS xavfsizlik cheklovi: Ushbu origin taqiqlangan (${origin})`));
  },
  credentials: true,
}));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static media files for video player and previews
const publicDir = path.resolve(__dirname, '../public');
app.use('/media', express.static(publicDir));
app.use(express.static(publicDir));

// Health check endpoints
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
  }
  res.json({
    status: 'ok',
    product: 'Jpilot',
    db: dbStatus,
    env: env.NODE_ENV,
  });
});

app.get('/ready', async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ready', database: 'connected' });
  } catch (err: any) {
    res.status(503).json({ status: 'unready', database: 'disconnected', error: err?.message || 'Database unavailable' });
  }
});

// Primary API Routes
app.use('/api', routes);

// Static frontend serving: serves the React web app on GET / when dist exists
const webDistCandidates = [
  path.resolve(__dirname, '../../web/dist'),
  path.resolve(process.cwd(), 'apps/web/dist'),
  path.resolve(__dirname, '../public/dist')
];
for (const distPath of webDistCandidates) {
  if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
    console.log(`🌐 [Static Web] Web frontend ulangan dist papkasi topildi: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/media') || req.path.startsWith('/health') || req.path.startsWith('/ready')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
    break;
  }
}

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
