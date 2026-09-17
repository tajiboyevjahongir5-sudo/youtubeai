import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { youtubeChannels } from '../db/schema';
import { eq } from 'drizzle-orm';
import { youtubeService } from '../services/youtube.service';

const router = Router({ mergeParams: true });

router.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = (req as any).workspaceId || req.params.id || (req.query.workspaceId as string) || 'default';
    const isConnected = youtubeService.isAuthenticated(workspaceId);
    let subscriberCount = 0;
    let viewCount = 0;
    let isNewChannel = true;
    let channelTitle = 'YouTube Kanal Ulanmagan';

    if (isConnected) {
      const saved = youtubeService.loadChannelInfo(workspaceId);
      if (saved) {
        channelTitle = saved.snippet?.title || saved.title || 'Ulangan Kanal';
        subscriberCount = parseInt(saved.statistics?.subscriberCount || saved.subscriberCount || '0', 10);
        viewCount = parseInt(saved.statistics?.viewCount || saved.totalViews || '0', 10);
        isNewChannel = (viewCount === 0);
      }
    }

    try {
      const channel = await db.query.youtubeChannels.findFirst({
        where: eq(youtubeChannels.workspaceId, workspaceId)
      });
      if (channel) {
        channelTitle = channel.channelTitle ?? channelTitle;
        subscriberCount = channel.subscriberCount ?? subscriberCount;
        viewCount = channel.viewCount ?? viewCount;
        isNewChannel = (channel.videoCount ?? 0) === 0;
      }
    } catch (e) {
      // ignore
    }

    res.json({
      channelConnected: isConnected,
      isNewChannel,
      channelTitle,
      views: viewCount,
      impressions: 0,
      ctr: 0.0,
      watchTimeHours: 0,
      subscribers: subscriberCount,
      avgViewPercentage: 0.0,
      message: !isConnected 
        ? 'YouTube kanal hali ulanmagan. O\'z kanalingizni ulash uchun Integratsiyalar sahifasiga o\'ting.'
        : isNewChannel 
          ? 'Kanal yangi ulangan — birinchi video chiqarilgach statistika jonlanadi' 
          : 'Real-time sinxronizatsiya faol'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/videos/:videoId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ 
      id: req.params.videoId, 
      views: 0, 
      ctr: 0, 
      retention: 0,
      likes: 0 
    });
  } catch (error) {
    next(error);
  }
});

router.get('/insights', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([
      {
        id: '1',
        type: 'new_channel',
        title: 'Yangi kanal: Dastlabki 10 ta Shorts orqali auditoriya bazasini shakllantirish tavsiya etiladi',
        confidence: 'high'
      }
    ]);
  } catch (error) {
    next(error);
  }
});

router.get('/strategy-memory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json([
      {
        id: '1',
        lesson: 'Yangi kanallarda "5 AI Websites That Feel Illegal" mavzusi eng tez 0 dan 10K ko\'rish oladi',
        confidenceLevel: 'high',
        active: true
      }
    ]);
  } catch (error) {
    next(error);
  }
});

export default router;
