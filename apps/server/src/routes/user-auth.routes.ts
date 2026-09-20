import { Router } from 'express';
import { userAuthService } from '../services/user-auth.service';

const router = Router();

router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, error: 'Ism kamida 2 harfdan iborat bo\'lishi kerak' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Yaroqli email manzilini kiriting' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
    }

    try {
      const { token, user } = userAuthService.register(name, email, password);
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          workspaceId: user.workspaceId
        }
      });
    } catch (e: any) {
      if (e.message === 'Email already exists') {
        return res.status(400).json({ success: false, error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
      }
      throw e;
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Xatolik yuz berdi' });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email va parolni kiriting' });
    }

    try {
      const { token, user } = userAuthService.login(email, password);
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          workspaceId: user.workspaceId
        }
      });
    } catch (e: any) {
      return res.status(401).json({ success: false, error: 'Email yoki parol noto\'g\'ri' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Xatolik yuz berdi' });
  }
});

router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Avtorizatsiyadan o\'tmagan' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = userAuthService.verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, error: 'Yaroqsiz yoki muddati o\'tgan token' });
    }

    const user = userAuthService.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Foydalanuvchi topilmadi' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId: user.workspaceId
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ success: false, error: 'Xatolik yuz berdi' });
  }
});

export default router;
