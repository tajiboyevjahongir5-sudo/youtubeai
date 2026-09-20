import { Router } from 'express';
import { competitorSpyService } from '../services/competitor-spy.service';
import { thumbnailStudioService } from '../services/thumbnail-studio.service';
import { communityAutopilotService } from '../services/community-autopilot.service';
import { calendarMatrixService } from '../services/calendar-matrix.service';
import { generateKaraokeTimings, exportSubtitleFormat, KARAOKE_STYLES } from '../services/karaoke-captions.service';
import { generateSmartSfxTimeline, buildDuckingTimeline, DUCKING_PRESETS } from '../services/audio-ducker.service';
import { get24HourVelocity, getRetentionCurve, evaluateABSplitTest } from '../services/youtube-analytics-ab.service';
import { getDailyTrends } from '../services/daily-trend-autopilot.service';
import { buildMultiPlatformPackages } from '../services/multi-platform-export.service';
import { searchBRoll, matchBRollForScenes } from '../services/broll-manager.service';
import { getVideoComments, generateReplyForComment } from '../services/comment-autopilot.service';
import { stitchShortsToLongForm } from '../services/shorts-stitching.service';
import { calculateEarningsForecast } from '../services/monetization-forecaster.service';
import { getCustomVoices, saveCustomVoice } from '../services/voice-clone.service';

const router = Router();

// ==========================================
// 1. COMPETITOR SPY & BENCHMARK
// ==========================================

router.get('/competitors', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const list = competitorSpyService.getCompetitors(workspaceId);
  res.json({ success: true, competitors: list });
});

router.post('/competitors', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const { handle, title } = req.body || {};
  if (!handle) {
    return res.status(400).json({ success: false, error: 'Kanal handle (masalan, @Fireship) kiritilishi shart' });
  }
  const channel = competitorSpyService.addCompetitor(workspaceId, handle, title);
  res.json({ success: true, channel });
});

router.delete('/competitors/:handle', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const removed = competitorSpyService.removeCompetitor(workspaceId, req.params.handle);
  res.json({ success: true, removed });
});

router.get('/competitors/outliers', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const outliers = competitorSpyService.getOutlierVideos(workspaceId);
  res.json({ success: true, outliers });
});

router.post('/competitors/adapt/:videoId', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const newItem = competitorSpyService.adaptVideoToWorkspace(workspaceId, req.params.videoId);
  if (!newItem) {
    return res.status(404).json({ success: false, error: 'Raqobatchi videosi topilmadi' });
  }
  res.json({ success: true, newItem });
});

// ==========================================
// 2. AI VISUAL THUMBNAIL STUDIO
// ==========================================

router.post('/thumbnail-studio/generate', (req, res) => {
  const { contentId, title, format, customHeadline, customBadge } = req.body || {};
  if (!contentId || !title) {
    return res.status(400).json({ success: false, error: 'contentId va title talab qilinadi' });
  }
  const variants = thumbnailStudioService.generateVariants(contentId, {
    title,
    format: format || 'landscape',
    customHeadline,
    customBadge
  });
  res.json({ success: true, variants });
});

router.post('/thumbnail-studio/apply/:contentId', async (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const { contentId } = req.params;
  const { thumbnailUrl } = req.body || {};
  if (!thumbnailUrl) {
    return res.status(400).json({ success: false, error: 'thumbnailUrl talab qilinadi' });
  }
  const result = await thumbnailStudioService.applyThumbnailToContent(contentId, thumbnailUrl, workspaceId);
  res.json({ success: result.success, youtubeUpdated: result.youtubeUpdated });
});

// ==========================================
// 3. YOUTUBE COMMUNITY TAB AUTOPILOT
// ==========================================

router.get('/community-autopilot/posts/:contentId', async (req, res) => {
  const { contentId } = req.params;
  const title = (req.query.title as string) || 'Autonomous AI Agents 2026';
  try {
    const posts = await communityAutopilotService.generatePostsForVideo(contentId, title);
    res.json({ success: true, posts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/community-autopilot/generate', async (req, res) => {
  const { contentId, title } = req.body || {};
  try {
    const posts = await communityAutopilotService.generatePostsForVideo(
      contentId || 'custom',
      title || 'AI & Coding 2026'
    );
    res.json({ success: true, posts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. 30-DAY CALENDAR MATRIX & AUTO-FILL
// ==========================================

router.get('/calendar-matrix/heatmap', (req, res) => {
  const heatmap = calendarMatrixService.getTrafficHeatmap();
  res.json({ success: true, heatmap });
});

router.post('/calendar-matrix/autofill-30days', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const summary = calendarMatrixService.autoFill30Days(workspaceId);
  res.json({ success: true, summary });
});

// ==========================================
// 5. SMART AUTO-CAPTIONS & KARAOKE STUDIO
// ==========================================

router.get('/karaoke/styles', (req, res) => {
  res.json({ success: true, styles: KARAOKE_STYLES });
});

router.post('/karaoke/generate', (req, res) => {
  const { script, styleId, durationSec } = req.body || {};
  if (!script) {
    return res.status(400).json({ success: false, error: 'Skript matni kiritilishi shart' });
  }
  const result = generateKaraokeTimings(script, styleId, durationSec || 50);
  res.json({ success: true, ...result });
});

router.post('/karaoke/export', (req, res) => {
  const { segments, format } = req.body || {};
  if (!segments || !Array.isArray(segments)) {
    return res.status(400).json({ success: false, error: 'Segmentlar ro\'yxati talab qilinadi' });
  }
  const fileContent = exportSubtitleFormat(segments, format || 'srt');
  res.json({ success: true, format: format || 'srt', content: fileContent });
});

// ==========================================
// 6. AUDIO AUTO-DUCKER & SFX GENERATOR
// ==========================================

router.get('/audio-ducker/presets', (req, res) => {
  res.json({ success: true, presets: DUCKING_PRESETS });
});

router.post('/audio-ducker/timeline', (req, res) => {
  const { scenes, durationSec, preset } = req.body || {};
  const cues = generateSmartSfxTimeline(scenes || [], durationSec || 50);
  const ducking = buildDuckingTimeline(cues, durationSec || 50, preset || 'aggressive_viral');
  res.json({ success: true, cues, ducking });
});

// ==========================================
// 7. MULTI-PLATFORM REELS & TIKTOK EXPORT
// ==========================================

router.post('/multi-platform/packages', (req, res) => {
  const { title, description, script, videoUrl } = req.body || {};
  const packages = buildMultiPlatformPackages({ title, description, script, videoUrl });
  res.json({ success: true, packages });
});

// ==========================================
// 8. REAL-TIME YOUTUBE ANALYTICS & A/B SPLIT TEST
// ==========================================

router.get('/analytics/velocity/:contentId', (req, res) => {
  const { contentId } = req.params;
  const velocity = get24HourVelocity(contentId);
  res.json({ success: true, velocity });
});

router.get('/analytics/retention/:contentId', (req, res) => {
  const durationSec = Number(req.query.duration) || 50;
  const retention = getRetentionCurve(durationSec);
  res.json({ success: true, ...retention });
});

router.post('/analytics/ab-evaluate', (req, res) => {
  const { contentId, originalTitle, candidateTitle, originalThumbnail, candidateThumbnail } = req.body || {};
  if (!contentId || !originalTitle) {
    return res.status(400).json({ success: false, error: 'contentId va originalTitle talab qilinadi' });
  }
  const comparison = evaluateABSplitTest({
    contentId,
    originalTitle,
    candidateTitle,
    originalThumbnail,
    candidateThumbnail
  });
  res.json({ success: true, comparison });
});

// ==========================================
// 9. DAILY VIRAL TRENDS AUTOPILOT
// ==========================================

router.get('/daily-trends', (req, res) => {
  const data = getDailyTrends();
  res.json({ success: true, ...data });
});

// ==========================================
// 10. SMART B-ROLL FOOTAGE MANAGER
// ==========================================

router.get('/broll/list', (req, res) => {
  const query = req.query.query as string | undefined;
  const category = req.query.category as string | undefined;
  const list = searchBRoll(query, category);
  res.json({ success: true, footages: list });
});

router.post('/broll/match', (req, res) => {
  const { scenes } = req.body || {};
  const matched = matchBRollForScenes(scenes || []);
  res.json({ success: true, matched });
});

// ==========================================
// 11. AI SMART REPLY & COMMENT AUTOPILOT
// ==========================================

router.get('/comments/list/:contentId', (req, res) => {
  const { contentId } = req.params;
  const comments = getVideoComments(contentId);
  res.json({ success: true, comments });
});

router.post('/comments/reply', (req, res) => {
  const { commentText, tone } = req.body || {};
  if (!commentText) {
    return res.status(400).json({ success: false, error: 'commentText kiritilishi shart' });
  }
  const reply = generateReplyForComment(commentText, tone);
  res.json({ success: true, reply });
});

// ==========================================
// 12. SHORTS-TO-LONGFORM STITCHER
// ==========================================

router.post('/shorts-stitching/stitch', (req, res) => {
  const { shortsList, customTheme } = req.body || {};
  if (!shortsList || !Array.isArray(shortsList) || shortsList.length === 0) {
    return res.status(400).json({ success: false, error: 'Kamida 2 ta Shorts loyihasi talab qilinadi' });
  }
  const project = stitchShortsToLongForm({ shortsList, customTheme });
  res.json({ success: true, project });
});

// ==========================================
// 13. MONETIZATION & REAL RPM FORECASTER
// ==========================================

router.get('/monetization/forecast/:contentId', (req, res) => {
  const format = (req.query.format as any) || 'shorts';
  const durationSec = Number(req.query.durationSec) || 50;
  const primaryCountry = req.query.country as string | undefined;

  const forecast = calculateEarningsForecast({ durationSec, format, primaryCountry });
  res.json({ success: true, ...forecast });
});

// ==========================================
// 14. CUSTOM VOICE AVATAR STUDIO
// ==========================================

router.get('/voice-clones', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const voices = getCustomVoices(workspaceId);
  res.json({ success: true, voices });
});

router.post('/voice-clones', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const { name, language, gender, baseVoiceModel, fineTunePitch, fineTuneRate, clarityBoost } = req.body || {};
  if (!name) {
    return res.status(400).json({ success: false, error: 'Ovoz nomi talab qilinadi' });
  }
  const avatar = saveCustomVoice(workspaceId, {
    name,
    language: language || 'uz',
    gender: gender || 'male',
    baseVoiceModel: baseVoiceModel || 'uz-UZ-SardorNeural',
    fineTunePitch: fineTunePitch || '+0Hz',
    fineTuneRate: fineTuneRate || '+10%',
    clarityBoost: clarityBoost !== false
  });
  res.json({ success: true, avatar });
});

export default router;
