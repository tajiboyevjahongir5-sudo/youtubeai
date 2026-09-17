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
  const workspaceId = req.workspaceId || req.params.id || (req.query.workspaceId as string) || 'default';
  const state = Buffer.from(JSON.stringify({ workspaceId })).toString('base64url');
  const url = youtubeService.getAuthUrl(state);
  res.json({ url });
});

router.get('/status', (req: Request, res: Response) => {
  const workspaceId = req.workspaceId || req.params.id || (req.query.workspaceId as string) || 'default';
  const isAuth = youtubeService.isAuthenticated(workspaceId);
  const channel = youtubeService.loadChannelInfo(workspaceId);
  res.json({
    workspaceId,
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
  const rawState = req.query.state as string;
  let workspaceId = 'default';
  if (rawState) {
    try {
      const parsed = JSON.parse(Buffer.from(rawState, 'base64url').toString('utf-8'));
      if (parsed.workspaceId) workspaceId = parsed.workspaceId;
    } catch (e) {
      console.warn('OAuth state parsing error:', e);
    }
  }

  if (code) {
    try {
      console.log(`🔄 [${workspaceId}] YouTube OAuth callback qabul qilindi, token olinmoqda...`);
      const tokens = await youtubeService.getToken(code);
      youtubeService.saveTokens(workspaceId, tokens);

      const channelInfo = await youtubeService.getChannelInfo(workspaceId, tokens.access_token, tokens.refresh_token);
      if (channelInfo) {
        youtubeService.saveChannelInfo(workspaceId, channelInfo);
      }
      
      const channelTitle = channelInfo?.snippet?.title || 'YouTube Kanal';
      console.log(`✅ [${workspaceId}] YouTube OAuth muvaffaqiyatli ulandi va saqlandi: ${channelTitle}`);
      return res.redirect(`${env.FRONTEND_URL}/integrations?connected=true&workspaceId=${workspaceId}`);
    } catch (err: any) {
      console.error(`❌ [${workspaceId}] YouTube OAuth callback error:`, err?.message || err);
      return res.redirect(`${env.FRONTEND_URL}/integrations?error=oauth_failed&workspaceId=${workspaceId}`);
    }
  }

  res.send('<html><body style="background:#09090d;color:#fff;font-family:sans-serif;text-align:center;padding:50px;"><h2>YouTube OAuth ulanishi bajarildi!</h2><p><a href="https://jpilotweb.up.railway.app/integrations" style="color:#ff0000;">Integratsiyalar sahifasiga qaytish</a></p></body></html>');
});

router.post('/disconnect', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || req.params.id || (req.body?.workspaceId as string) || 'default';
    youtubeService.clearTokens(workspaceId);
    res.json({ success: true, message: `YouTube kanal uzildi (${workspaceId})` });
  } catch (error) {
    next(error);
  }
});

router.get('/channel', async (req: Request, res: Response, next: NextFunction) => {
  const workspaceId = req.workspaceId || req.params.id || (req.query.workspaceId as string) || 'default';
  const isAuth = youtubeService.isAuthenticated(workspaceId);
  const savedChannel = youtubeService.loadChannelInfo(workspaceId);

  if (isAuth && savedChannel) {
    return res.json({
      id: savedChannel.id || `yt_${workspaceId}`,
      workspaceId,
      channelId: savedChannel.id,
      channelTitle: savedChannel.snippet?.title || 'YouTube Kanal',
      thumbnailUrl: savedChannel.snippet?.thumbnails?.default?.url,
      subscriberCount: parseInt(savedChannel.statistics?.subscriberCount || '0', 10),
      videoCount: parseInt(savedChannel.statistics?.videoCount || '0', 10),
      viewCount: parseInt(savedChannel.statistics?.viewCount || '0', 10),
      connectionStatus: 'connected',
      lastSyncAt: new Date().toISOString()
    });
  }

  res.json({
    id: `yt_${workspaceId}`,
    workspaceId,
    channelId: '',
    channelTitle: 'YouTube Kanal Ulanmagan',
    subscriberCount: 0,
    videoCount: 0,
    viewCount: 0,
    connectionStatus: 'disconnected',
    lastSyncAt: null
  });
});

export default router;
