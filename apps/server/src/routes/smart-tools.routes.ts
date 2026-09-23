import path from 'path';
import { Router } from 'express';
import { getRenderProgress, clearRenderProgress } from '../services/render-progress.service';
import { duplicateContent, expandShortsToLongform } from '../services/content-duplicate.service';
import { analyzeScript } from '../services/script-suggestions.service';
import { generatePerformanceAlerts } from '../services/performance-alerts.service';
import { contentStore } from '../services/content-store.service';
import { videoRenderService } from '../services/video-render.service';

const router = Router();

// --- Real-time Render Progress ---
router.get('/render-progress/:contentId', (req, res) => {
  const progress = getRenderProgress(req.params.contentId);
  if (!progress) {
    return res.json({ success: true, status: 'idle', progress: null });
  }
  res.json({ success: true, ...progress });
});

// --- Reset Stuck Render ---
router.post('/content/:contentId/reset-render', (req, res) => {
  const contentId = req.params.contentId;
  clearRenderProgress(contentId);
  const updated = contentStore.updateItem(contentId, { status: 'idea' });
  res.json({ success: true, message: 'Render holati tozalandi', item: updated });
});

// --- Force Complete Render ---
router.post('/content/:contentId/force-complete', async (req, res) => {
  const contentId = req.params.contentId;
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const item = contentStore.getById(contentId, workspaceId);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Kontent topilmadi' });
  }
  const isLong = item.videoFormat === 'long_form';
  const outputPath = path.join(videoRenderService.getPublicVideosDir(), `${contentId}.mp4`);
  const outcome = await videoRenderService.guaranteedFallbackVideo(item, outputPath, isLong);
  res.json(outcome);
});

// --- Content Duplicate & Remix ---
router.post('/content/:contentId/duplicate', (req, res) => {
  const { newAngle, newFormat, prefixTitle } = req.body || {};
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const result = duplicateContent(req.params.contentId, workspaceId, { newAngle, newFormat, prefixTitle });
  if (!result) {
    return res.status(404).json({ success: false, error: 'Manba kontent topilmadi' });
  }
  res.json({ success: true, newItem: result });
});

// --- Shorts to Longform Expansion ---
router.post('/content/:contentId/expand-to-longform', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const result = expandShortsToLongform(req.params.contentId, workspaceId);
  if (!result) {
    return res.status(404).json({ success: false, error: 'Manba kontent topilmadi' });
  }
  res.json({ success: true, newItem: result });
});

// --- AI Script Suggestions ---
router.post('/script/suggestions', async (req, res) => {
  try {
    const { script, title, format } = req.body;
    if (!script || !title) {
      return res.status(400).json({ success: false, error: 'script va title talab qilinadi' });
    }
    const analysis = await analyzeScript(script, title, format || 'shorts');
    res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('[ScriptSuggestions] Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Post-Publish Performance Alerts ---
router.get('/content/:contentId/performance-alerts', (req, res) => {
  const { contentId } = req.params;
  const hoursSince = parseFloat(req.query.hours as string) || 12;
  const views = parseInt(req.query.views as string) || 140;
  const ctr = parseFloat(req.query.ctr as string) || 4.2;
  const retention = parseFloat(req.query.retention as string) || 72;
  const comments = parseInt(req.query.comments as string) || 3;
  const likes = parseInt(req.query.likes as string) || 12;
  const subGain = parseInt(req.query.subGain as string) || 2;

  const report = generatePerformanceAlerts(contentId, hoursSince, views, ctr, retention, comments, likes, subGain);
  res.json({ success: true, report });
});

export default router;
