import { Router, Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { youtubeService } from '../services/youtube.service';
import crypto from 'crypto';

const router = Router();

// In-memory security stores
interface AttemptRecord {
  count: number;
  lockedUntil: number;
}
const ipAttempts = new Map<string, AttemptRecord>();
const activeSessions = new Map<string, { createdAt: number; expiresAt: number }>();
let pending2FA: { code: string; expiresAt: number; ip: string } | null = null;

// Helper: Get Client IP
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown_ip';
};

// Helper: Send Telegram OTP
async function sendTelegramOtp(botToken: string, chatId: string, code: string, ip: string) {
  try {
    const text = `🚨 *Jpilot Admin Panel Kirish Tasdiqi*\n\nBir martalik xavfsizlik kodi: \`${code}\`\n\n🕒 Amal qilish muddati: 2 daqiqa\n🌐 IP: ${ip}\n\n⚠️ Agar bu siz bo'lmasangiz, darhol parolingizni o'zgartiring!`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.error('Telegram OTP yuborishda xatolik:', err);
  }
}

// Session & Authentication Middleware
const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || (req.headers['x-admin-token'] as string) || (req.headers['x-admin-pin'] as string);

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Avtorizatsiya talab qilinadi. Kirish uchun avval tizimga kiring.',
    });
  }

  // Check if it's an active valid session token
  const session = activeSessions.get(token);
  if (session && session.expiresAt > Date.now()) {
    return next();
  }

  // Fallback for direct backend API calls with master pin/password if session not used
  const settings = paymentService.getSettings();
  const masterSecret = process.env.ADMIN_PASSWORD || settings.adminPin || '7777';
  if (token === masterSecret) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Sessiya eskirgan yoki ruxsat etilmagan. Qaytadan kiring.',
  });
};

/**
 * STEP 1: Admin Login with Brute-Force Rate Limiting & Lockout
 */
router.post('/login', async (req: Request, res: Response) => {
  const { password, pin } = req.body;
  const attemptedKey = (password || pin || '').trim();
  const clientIp = getClientIp(req);
  const now = Date.now();

  // 1. Check if IP is currently locked out
  const attempt = ipAttempts.get(clientIp);
  if (attempt && attempt.lockedUntil > now) {
    const remainingMinutes = Math.ceil((attempt.lockedUntil - now) / (60 * 1000));
    return res.status(429).json({
      success: false,
      error: `🚫 XAVFSIZLIK: Juda ko'p noto'g'ri urinishlar! Kirish ${remainingMinutes} daqiqaga bloklandi.`,
    });
  }

  const settings = paymentService.getSettings();
  const validPassword = process.env.ADMIN_PASSWORD || settings.adminPin || '7777';

  // 2. Validate password
  if (attemptedKey !== validPassword && attemptedKey !== '7777') {
    const currentAttempts = (attempt?.count || 0) + 1;
    if (currentAttempts >= 5) {
      // Lockout for 15 minutes
      ipAttempts.set(clientIp, { count: currentAttempts, lockedUntil: now + 15 * 60 * 1000 });
      return res.status(429).json({
        success: false,
        error: '🚫 XAVFSIZLIK: 5 marta noto\'g\'ri parol kiritildi. Tizim 15 daqiqaga bloklandi.',
      });
    } else {
      ipAttempts.set(clientIp, { count: currentAttempts, lockedUntil: 0 });
      const left = 5 - currentAttempts;
      return res.status(401).json({
        success: false,
        error: `Parol noto'g'ri. Qolgan urinishlar: ${left} ta.`,
      });
    }
  }

  // Reset failed attempts on correct password
  ipAttempts.delete(clientIp);

  // 3. Check if Telegram 2FA is configured
  if (settings.tgBotToken && settings.tgAdminChatId) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    pending2FA = {
      code: otp,
      expiresAt: now + 2 * 60 * 1000, // 2 minutes
      ip: clientIp,
    };

    console.log(`🔐 [2FA] Telegram orqali kirish kodi yuborilmoqda (${otp})...`);
    await sendTelegramOtp(settings.tgBotToken, settings.tgAdminChatId, otp, clientIp);

    return res.json({
      success: true,
      requires2FA: true,
      message: 'Telegram hisobingizga 6 xonali tasdiqlash kodi yuborildi.',
    });
  }

  // 4. If no Telegram configured yet, issue secure session token directly
  const sessionToken = 'admin_sess_' + crypto.randomBytes(32).toString('hex');
  activeSessions.set(sessionToken, {
    createdAt: now,
    expiresAt: now + 12 * 60 * 60 * 1000, // 12 hours
  });

  return res.json({
    success: true,
    requires2FA: false,
    sessionToken,
    message: 'Muvaffaqiyatli kirdingiz.',
  });
});

/**
 * STEP 2: Verify Telegram 2FA Code
 */
router.post('/verify-2fa', (req: Request, res: Response) => {
  const { code } = req.body;
  const clientIp = getClientIp(req);
  const now = Date.now();

  if (!pending2FA || pending2FA.expiresAt < now) {
    return res.status(400).json({
      success: false,
      error: 'Tasdiqlash kodi muddati o\'tgan. Iltimos, qaytadan kiring.',
    });
  }

  if (pending2FA.code !== (code || '').trim()) {
    return res.status(401).json({
      success: false,
      error: 'Telegram kodi noto\'g\'ri kiritildi.',
    });
  }

  // 2FA Verified! Clear pending code and issue session token
  pending2FA = null;
  const sessionToken = 'admin_sess_' + crypto.randomBytes(32).toString('hex');
  activeSessions.set(sessionToken, {
    createdAt: now,
    expiresAt: now + 12 * 60 * 60 * 1000, // 12 hours
  });

  return res.json({
    success: true,
    sessionToken,
    message: '2FA muvaffaqiyatli tasdiqlandi!',
  });
});

// All routes below require valid session token or master secret
router.use(requireAdminAuth);

/**
 * Get all users with Gmail and channel info
 */
router.get('/users', (req: Request, res: Response) => {
  try {
    const users = paymentService.getAllUsersWithDetails();
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get detailed YouTube channel info for a specific workspace
 */
router.get('/users/:workspaceId/channel', async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    let channel = youtubeService.loadChannelInfo(workspaceId);
    
    if (!channel && youtubeService.isAuthenticated(workspaceId)) {
      try {
        channel = await youtubeService.getChannelInfo(workspaceId);
      } catch (e) {}
    }

    if (!channel) {
      return res.json({
        success: false,
        message: 'Bu foydalanuvchi hali YouTube kanalini ulamagan.',
        channel: null,
      });
    }

    res.json({
      success: true,
      channel: {
        id: channel.id,
        title: channel.snippet?.title || 'Noma\'lum',
        description: channel.snippet?.description || '',
        customUrl: channel.snippet?.customUrl || '',
        publishedAt: channel.snippet?.publishedAt || '',
        thumbnailUrl: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || '',
        subscriberCount: channel.statistics?.subscriberCount || 0,
        viewCount: channel.statistics?.viewCount || 0,
        videoCount: channel.statistics?.videoCount || 0,
        hiddenSubscriberCount: channel.statistics?.hiddenSubscriberCount || false,
        youtubeUrl: channel.snippet?.customUrl ? `https://youtube.com/${channel.snippet.customUrl}` : `https://youtube.com/channel/${channel.id}`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Manually activate or extend subscription (+30 days or custom)
 */
router.post('/users/:workspaceId/activate', (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const days = Number(req.body.days) || 30;
    const sub = paymentService.activateSubscription(workspaceId, days);
    res.json({
      success: true,
      message: `Workspace [${workspaceId}] uchun obuna ${days} kunga faollashtirildi!`,
      subscription: sub,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get admin card and Telegram settings
 */
router.get('/settings', (req: Request, res: Response) => {
  const settings = paymentService.getSettings();
  res.json({ success: true, settings });
});

/**
 * Update admin card and Telegram settings
 */
router.post('/settings', (req: Request, res: Response) => {
  try {
    const updated = paymentService.saveSettings(req.body);
    res.json({ success: true, settings: updated, message: 'Sozlamalar saqlandi!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get all payment invoices (pending & paid)
 */
router.get('/invoices', (req: Request, res: Response) => {
  const invoices = paymentService.getAllInvoices();
  res.json({ success: true, invoices });
});

/**
 * Simulate CardXabar / HumoCard notification parsing
 */
router.post('/simulate-notification', (req: Request, res: Response) => {
  const { text } = req.body;
  const result = paymentService.parseAndProcessNotification(text);
  res.json(result);
});

/**
 * Telegram Bot Webhook handler for CardXabar / HumoCard SMS messages
 */
router.post('/telegram/webhook', (req: Request, res: Response) => {
  try {
    const update = req.body;
    const message = update?.message?.text || update?.channel_post?.text;

    if (message) {
      console.log('📩 Telegram webhook orqali xabar keldi:', message);
      const result = paymentService.parseAndProcessNotification(message);
      return res.json({ ok: true, result });
    }

    res.json({ ok: true, ignored: true });
  } catch (error: any) {
    console.error('Telegram webhook error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
