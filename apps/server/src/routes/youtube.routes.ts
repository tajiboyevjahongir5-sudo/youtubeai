import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { youtubeChannels } from '../db/schema';
import { eq } from 'drizzle-orm';
import { youtubeService } from '../services/youtube.service';
import { env } from '../env';

const router = Router({ mergeParams: true });

// In-memory cache for the connected channel if database is not active
let activeConnectedChannel: any = null;

router.get('/connect', (req: Request, res: Response) => {
  const url = youtubeService.getAuthUrl();
  res.json({ url });
});

router.get('/status', (req: Request, res: Response) => {
  const isAuth = youtubeService.isAuthenticated();
  const channel = youtubeService.loadChannelInfo();
  res.json({
    connected: isAuth,
    channel: channel ? {
      title: channel.snippet?.title,
      id: channel.id,
      subscribers: channel.statistics?.subscriberCount
    } : null
  });
});

router.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (code) {
    try {
      console.log('🔄 YouTube OAuth callback qabul qilindi, token olinmoqda...');
      const tokens = await youtubeService.getToken(code);
      youtubeService.saveTokens(tokens);

      const channelInfo = await youtubeService.getChannelInfo(tokens.access_token, tokens.refresh_token);
      if (channelInfo) {
        youtubeService.saveChannelInfo(channelInfo);
      }
      
      const channelTitle = channelInfo?.snippet?.title || 'Neural Pulse AI';
      const channelId = channelInfo?.id || ('UC_' + Date.now().toString(36));
      const subscriberCount = parseInt(channelInfo?.statistics?.subscriberCount || '0', 10);
      const videoCount = parseInt(channelInfo?.statistics?.videoCount || '0', 10);
      const viewCount = parseInt(channelInfo?.statistics?.viewCount || '0', 10);

      activeConnectedChannel = {
        id: channelId,
        workspaceId: req.workspaceId || 'default',
        channelId: channelId,
        channelTitle: channelTitle,
        subscriberCount: subscriberCount,
        videoCount: videoCount,
        viewCount: viewCount,
        connectionStatus: 'connected',
        lastSyncAt: new Date().toISOString()
      };

      try {
        await db.insert(youtubeChannels).values({
          id: `yt_${Date.now()}`,
          workspaceId: req.workspaceId || 'default',
          channelId: channelId,
          channelTitle: channelTitle,
          subscriberCount: subscriberCount,
          videoCount: videoCount,
          viewCount: viewCount,
          connectionStatus: 'connected',
          lastSyncAt: new Date()
        });
      } catch (dbErr) {
        // Non-blocking in dev mode
      }

      console.log(`✅ YouTube OAuth muvaffaqiyatli ulandi va saqlandi: ${channelTitle}`);
      return res.redirect(`${env.FRONTEND_URL}/integrations?connected=true`);
    } catch (err: any) {
      console.error('❌ YouTube OAuth callback error:', err?.message || err);
      return res.redirect(`${env.FRONTEND_URL}/integrations?error=oauth_failed`);
    }
  }

  res.send('<html><body style="background:#09090d;color:#fff;font-family:sans-serif;text-align:center;padding:50px;"><h2>YouTube OAuth ulanishi bajarildi!</h2><p><a href="http://localhost:5173/integrations" style="color:#ff0000;">Integratsiyalar sahifasiga qaytish</a></p></body></html>');
});

router.post('/disconnect', async (req: Request, res: Response, next: NextFunction) => {
  try {
    activeConnectedChannel = null;
    youtubeService.clearTokens();
    try {
      await db.delete(youtubeChannels).where(eq(youtubeChannels.workspaceId, req.workspaceId || 'default'));
    } catch (e) {
      // ignore
    }
    res.json({ success: true, message: 'YouTube kanal uzildi' });
  } catch (error) {
    next(error);
  }
});

router.get('/channel', async (req: Request, res: Response, next: NextFunction) => {
  const isAuth = youtubeService.isAuthenticated();
  const savedChannel = youtubeService.loadChannelInfo();

  if (savedChannel) {
    return res.json({
      id: savedChannel.id,
      workspaceId: req.workspaceId || 'default',
      channelId: savedChannel.id,
      channelTitle: savedChannel.snippet?.title || 'Neural Pulse AI',
      thumbnailUrl: savedChannel.snippet?.thumbnails?.default?.url,
      subscriberCount: parseInt(savedChannel.statistics?.subscriberCount || '0', 10),
      videoCount: parseInt(savedChannel.statistics?.videoCount || '0', 10),
      viewCount: parseInt(savedChannel.statistics?.viewCount || '0', 10),
      connectionStatus: isAuth ? 'connected' : 'disconnected',
      lastSyncAt: new Date().toISOString()
    });
  }

  if (activeConnectedChannel) {
    return res.json(activeConnectedChannel);
  }

  try {
    const channel = await db.query.youtubeChannels.findFirst({
      where: eq(youtubeChannels.workspaceId, req.workspaceId || 'default')
    });
    if (channel) {
      return res.json(channel);
    }
  } catch (error) {
    // fallback
  }

  res.json({
    id: 'yt_ch_1',
    workspaceId: req.workspaceId || 'default',
    channelId: 'UC_neural_pulse_ai',
    channelTitle: 'Neural Pulse AI',
    subscriberCount: 0,
    videoCount: 0,
    viewCount: 0,
    connectionStatus: isAuth ? 'connected' : 'disconnected',
    lastSyncAt: new Date().toISOString()
  });
});

export default router;
