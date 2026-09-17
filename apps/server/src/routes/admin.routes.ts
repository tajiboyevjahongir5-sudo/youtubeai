import { Router, Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { youtubeService } from '../services/youtube.service';

const router = Router();

// PIN Protection Middleware for Admin Panel
const requireAdminPin = (req: Request, res: Response, next: NextFunction) => {
  const pin = req.headers['x-admin-pin'] || req.query.pin;
  const settings = paymentService.getSettings();

  if (!pin || pin !== settings.adminPin) {
    return res.status(401).json({
      success: false,
      error: 'Noto\'g\'ri PIN kod. Admin panelga kirish rad etildi.',
    });
  }
  next();
};

/**
 * Verify PIN for login
 */
router.post('/login', (req: Request, res: Response) => {
  const { pin } = req.body;
  const settings = paymentService.getSettings();

  if (pin === settings.adminPin) {
    return res.json({ success: true, message: 'Kirish muvaffaqiyatli' });
  }
  return res.status(401).json({ success: false, error: 'PIN kod noto\'g\'ri' });
});

// All routes below require PIN verification
router.use(requireAdminPin);

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
