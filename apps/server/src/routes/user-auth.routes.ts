import { Router, Request, Response } from 'express';
import { userAuthService } from '../services/user-auth.service';

const router = Router();

// In-Memory Rate Limiter for Login/Register (Lockout after 5 failed attempts for 15 minutes)
interface AttemptRecord {
  count: number;
  lockoutUntil: number;
}
const attemptsMap = new Map<string, AttemptRecord>();

const getClientKey = (req: Request, identifier?: string): string => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  return identifier ? `${ip}_${identifier.toLowerCase().trim()}` : ip;
};

const checkRateLimit = (key: string): boolean => {
  const now = Date.now();
  const record = attemptsMap.get(key);
  if (!record) return true;
  if (record.lockoutUntil > now) return false;
  if (record.lockoutUntil <= now && record.count >= 5) {
    attemptsMap.delete(key);
    return true;
  }
  return true;
};

const recordFailedAttempt = (key: string) => {
  const now = Date.now();
  const record = attemptsMap.get(key) || { count: 0, lockoutUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockoutUntil = now + 15 * 60 * 1000; // 15 minutes lockout
  }
  attemptsMap.set(key, record);
};

const resetAttempts = (key: string) => {
  attemptsMap.delete(key);
};

const setAuthCookie = (res: Response, token: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('jpilot_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
  });
};

const extractToken = (req: Request): string | null => {
  if (req.cookies && req.cookies.jpilot_token) {
    return req.cookies.jpilot_token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
};

router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    const rateKey = getClientKey(req, email);

    if (!checkRateLimit(rateKey)) {
      return res.status(429).json({
        success: false,
        error: 'Juda ko‘p muvaffaqiyatsiz urinishlar. Iltimos, 15 daqiqadan so‘ng qayta urinib ko‘ring.',
      });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Ism kamida 2 ta harfdan iborat bo‘lishi kerak' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Yaroqli email manzilini kiriting' });
    }

    if (!password || password.length < 10) {
      return res.status(400).json({ success: false, error: 'Parol xavfsizlik talablariga binoan kamida 10 ta belgidan iborat bo‘lishi kerak' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (password.toLowerCase().includes(cleanEmail.split('@')[0]) || password.toLowerCase().includes(name.toLowerCase().trim())) {
      return res.status(400).json({ success: false, error: 'Parol sifatida ism yoki email qismini ishlatish mumkin emas' });
    }

    try {
      const { token, user } = userAuthService.register(name, email, password);
      resetAttempts(rateKey);
      setAuthCookie(res, token);

      return res.json({
        success: true,
        token, // For non-browser or mobile clients
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          workspaceId: user.workspaceId,
        },
      });
    } catch (e: any) {
      if (e.message === 'Email already exists') {
        return res.status(400).json({ success: false, error: 'Ushbu email manzili allaqachon ro‘yxatdan o‘tgan' });
      }
      throw e;
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Tizimda xatolik yuz berdi' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const rateKey = getClientKey(req, email);

    if (!checkRateLimit(rateKey)) {
      return res.status(429).json({
        success: false,
        error: 'Xavfsizlik tizimi: Juda ko‘p muvaffaqiyatsiz urinishlar. Iltimos, 15 daqiqadan so‘ng qayta urinib ko‘ring.',
      });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email va parolni kiriting' });
    }

    try {
      const { token, user } = userAuthService.login(email, password);
      resetAttempts(rateKey);
      setAuthCookie(res, token);

      return res.json({
        success: true,
        token, // For non-browser / mobile clients
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          workspaceId: user.workspaceId,
        },
      });
    } catch (e: any) {
      recordFailedAttempt(rateKey);
      return res.status(401).json({ success: false, error: 'Noto‘g‘ri email yoki parol' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Tizimda xatolik yuz berdi' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('jpilot_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res.json({ success: true, message: 'Tizimdan muvaffaqiyatli chiqildi' });
});

router.get('/me', (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' });
    }

    const decoded = userAuthService.verifyToken(token);
    const userId = decoded?.sub || decoded?.id;

    if (!decoded || !userId) {
      return res.status(401).json({ success: false, error: 'Yaroqsiz yoki muddati o‘tgan token' });
    }

    const user = userAuthService.getUserById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Foydalanuvchi topilmadi' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId: user.workspaceId,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ success: false, error: 'Tizimda xatolik yuz berdi' });
  }
});

router.post('/change-password', (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Avtorizatsiyadan o‘tilmagan' });
    }

    const decoded = userAuthService.verifyToken(token);
    const userId = decoded?.sub || decoded?.id;

    if (!decoded || !userId) {
      return res.status(401).json({ success: false, error: 'Yaroqsiz yoki muddati o‘tgan sessiya' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 10) {
      return res.status(400).json({ success: false, error: 'Yangi parol kamida 10 ta belgidan iborat bo‘lishi kerak' });
    }

    try {
      const result = userAuthService.changePassword(userId, currentPassword, newPassword);
      return res.json(result);
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message || 'Parolni yangilashda xatolik yuz berdi' });
    }
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, error: 'Xatolik yuz berdi' });
  }
});

export default router;
