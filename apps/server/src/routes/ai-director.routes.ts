import { Router, Request, Response, NextFunction } from 'express';
import { aiDirectorService } from '../services/ai-director.service';

const router = Router({ mergeParams: true });

// Get live Director dashboard status & all models telemetry
router.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.params as any).id || (req.query.workspaceId as string) || 'default';
    const data = await aiDirectorService.getDirectorDashboard(workspaceId);
    res.json({ success: true, data });
  } catch (err: any) {
    console.error('AI Director status error:', err);
    res.status(500).json({ error: err.message || 'AI Director status retrieval failed' });
  }
});

// Run full proactive audit across all AI models
router.post('/audit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.params as any).id || (req.query.workspaceId as string) || 'default';
    console.log(`🤖 [Bosh AI Direktor] "${workspaceId}" ishchi maydonida barcha AI modellari auditi boshlandi...`);
    const result = await aiDirectorService.runFullDirectorAudit(workspaceId);
    res.json({ success: true, result });
  } catch (err: any) {
    console.error('AI Director audit error:', err);
    res.status(500).json({ error: err.message || 'AI Director audit failed' });
  }
});

// Trigger self-healing & optimization
router.post('/heal', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.workspaceId || (req.params as any).id || (req.query.workspaceId as string) || 'default';
    console.log(`🛠️ [Bosh AI Direktor] "${workspaceId}" tizimida avtomat o'z-o'zini tiklash va profilaktika boshlandi...`);
    const result = await aiDirectorService.healAndOptimize(workspaceId);
    res.json({ success: true, result });
  } catch (err: any) {
    console.error('AI Director heal error:', err);
    res.status(500).json({ error: err.message || 'AI Director self-heal failed' });
  }
});

export default router;
