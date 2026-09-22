import { Router, Request, Response } from 'express';
import { pexelsBrollService } from '../services/pexels-broll.service';

const router = Router();

// Test a Pexels API key live
router.post('/test-key', async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ success: false, error: 'API kaliti kiritilmadi' });
    }
    const result = await pexelsBrollService.testApiKey(apiKey);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Server xatosi' });
  }
});

// Search Pexels portrait videos for topic
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) || 'technology coding artificial intelligence';
    const workspaceId = (req.headers['x-workspace-id'] as string) || (req.query.workspaceId as string) || 'default';
    const limit = parseInt((req.query.limit as string) || '6', 10);
    const orientation = ((req.query.orientation as string) === 'landscape') ? 'landscape' : 'portrait';

    const videos = await pexelsBrollService.searchPortraitVideos(query, workspaceId, limit, orientation);
    return res.json({
      success: true,
      query,
      count: videos.length,
      videos: videos.map(v => ({
        id: v.id,
        duration: v.duration,
        image: v.image,
        width: v.width,
        height: v.height,
        url: v.url,
        videoFiles: (v.video_files || []).map(f => ({
          quality: f.quality,
          width: f.width,
          height: f.height,
          link: f.link
        }))
      }))
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Qidiruvda xatolik' });
  }
});

// Check configuration status for workspace
router.get('/status', (req: Request, res: Response) => {
  const workspaceId = (req.headers['x-workspace-id'] as string) || (req.query.workspaceId as string) || 'default';
  const isConfigured = pexelsBrollService.isConfigured(workspaceId);
  return res.json({
    configured: isConfigured,
    provider: 'pexels_broll',
    freeUnlimited: true
  });
});

export default router;
