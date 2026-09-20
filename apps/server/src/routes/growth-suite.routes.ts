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
import { AudienceSimulatorService } from '../services/audience-simulator.service';
import { ThumbnailHeatmapService } from '../services/thumbnail-heatmap.service';
import { HandsfreeFactoryService } from '../services/handsfree-factory.service';
import { CompetitorRadarService } from '../services/competitor-radar.service';
import { DualHostDebateService } from '../services/dual-host-debate.service';
import { Tier1GeoTargeterService } from '../services/tier1-geo-targeter.service';
import { SiliconValleyPolishService } from '../services/silicon-valley-polish.service';
import { CommercialIntentSeoService } from '../services/commercial-intent-seo.service';
import { MultiAudioPackService } from '../services/multi-audio-pack.service';
import { CopyrightShieldService } from '../services/copyright-shield.service';
import { VideoQualityEnhancerService } from '../services/video-quality-enhancer.service';
import { BingeLoopLinkerService } from '../services/binge-loop-linker.service';
import { VisualMotionEngineService } from '../services/visual-motion-engine.service';
import { AlgorithmPulseService } from '../services/algorithm-pulse.service';
import { ShortsAudioTrendRadarService } from '../services/shorts-audio-trend-radar.service';
import { SmartChapterSeoService } from '../services/smart-chapter-seo.service';
import { LiveStreamSchedulerService } from '../services/livestream-scheduler.service';

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

// ==========================================
// 15. AUDIENCE SIMULATOR & HOOK STRESS-TEST
// ==========================================

router.post('/audience-simulator/test', (req, res) => {
  const { script, topic } = req.body || {};
  const testResult = AudienceSimulatorService.simulateAudience(script || '', topic || '');
  res.json({ success: true, ...testResult });
});

// ==========================================
// 16. SMART THUMBNAIL HEATMAP & EYE-TRACKING
// ==========================================

router.post('/thumbnail-heatmap/analyze', (req, res) => {
  const { thumbnailUrl, title } = req.body || {};
  const analysis = ThumbnailHeatmapService.analyzeThumbnail(thumbnailUrl || '', title || '');
  res.json({ success: true, analysis });
});

// ==========================================
// 17. AUTONOMOUS HANDSFREE CONTENT FACTORY
// ==========================================

router.get('/handsfree/config', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const config = HandsfreeFactoryService.getConfig(workspaceId);
  const recentJobs = HandsfreeFactoryService.getRecentJobs(workspaceId);
  res.json({ success: true, config, recentJobs });
});

router.post('/handsfree/config', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const updated = HandsfreeFactoryService.saveConfig(workspaceId, req.body || {});
  res.json({ success: true, config: updated });
});

router.post('/handsfree/trigger-now', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const result = HandsfreeFactoryService.triggerNow(workspaceId);
  res.json(result);
});

// ==========================================
// 18. COMPETITOR RADAR & VIRAL OUTLIERS
// ==========================================

router.get('/competitors/radar', (req, res) => {
  const channels = CompetitorRadarService.getMonitoredChannels();
  const outliers = CompetitorRadarService.getViralOutliers();
  res.json({ success: true, channels, outliers });
});

// ==========================================
// 19. DUAL-HOST AI DEBATE STUDIO
// ==========================================

router.post('/dual-host/generate', (req, res) => {
  const { topic, language, criticGender } = req.body || {};
  if (!topic) {
    return res.status(400).json({ success: false, error: 'Bahs mavzusi kiritilishi shart' });
  }
  const project = DualHostDebateService.generateDebate(topic, language || 'uz', criticGender || 'female');
  res.json({ success: true, project });
});

// ==========================================
// 20. TIER-1 GEO-TIMEZONE SMART SCHEDULER
// ==========================================

router.get('/tier1/schedule-windows', (req, res) => {
  const windows = Tier1GeoTargeterService.getTimezoneWindows();
  res.json({ success: true, windows });
});

router.get('/tier1/pre-warming/:contentId', (req, res) => {
  const { contentId } = req.params;
  const title = req.query.title as string | undefined;
  const plan = Tier1GeoTargeterService.generatePreWarmingPlan(contentId, title);
  res.json({ success: true, plan });
});

// ==========================================
// 21. SILICON VALLEY SLANG & VOCABULARY POLISH
// ==========================================

router.post('/tier1/silicon-valley-polish', (req, res) => {
  const { script } = req.body || {};
  const result = SiliconValleyPolishService.polishScript(script || '');
  res.json({ success: true, ...result });
});

// ==========================================
// 22. COMMERCIAL INTENT & HIGH-CPM REKLAMA MAGNETI
// ==========================================

router.post('/tier1/commercial-intent-seo', (req, res) => {
  const { title, script } = req.body || {};
  const result = CommercialIntentSeoService.optimizeForTier1Monetization(title || '', script || '');
  res.json({ success: true, ...result });
});

// ==========================================
// 23. YOUTUBE MULTI-LANGUAGE AUDIO PACK
// ==========================================

router.get('/tier1/multi-audio/:contentId', (req, res) => {
  const { contentId } = req.params;
  const title = (req.query.title as string) || "Neural Pulse AI";
  const bundle = MultiAudioPackService.getMultiAudioBundle(contentId, title);
  res.json({ success: true, bundle });
});

// ==========================================
// 24. SMART CONTENT ID & MUALLIFLIK HUQUQI QALQONI
// ==========================================

router.get('/copyright-shield/scan/:contentId', (req, res) => {
  const { contentId } = req.params;
  const audioUrl = req.query.audioUrl as string | undefined;
  const result = CopyrightShieldService.scanProject(contentId, audioUrl);
  res.json({ success: true, result });
});

// ==========================================
// 25. 4K AV1/VP9 BITRATE & KRISTALL TINIQLIK PROFILI
// ==========================================

router.get('/video-quality/profiles', (req, res) => {
  const isLong = req.query.isLong === 'true';
  const analysis = VideoQualityEnhancerService.getQualityProfiles(isLong);
  res.json({ success: true, analysis });
});

// ==========================================
// 26. BINGE-LOOP & ALOQADOR VIDEO ULASH TIZIMI
// ==========================================

router.get('/binge-loop/plan/:contentId', (req, res) => {
  const { contentId } = req.params;
  const title = (req.query.title as string) || "Neural Pulse AI";
  const plan = BingeLoopLinkerService.getBingeLoopPlan(contentId, title);
  res.json({ success: true, plan });
});

// ==========================================
// 27. 2.5D PARALLAKS & KEN BURNS HARAKAT DVIGATELI
// ==========================================

router.get('/visual-motion/presets', (_req, res) => {
  const presets = VisualMotionEngineService.getMotionPresets();
  res.json({ success: true, presets });
});

// ==========================================
// 28. KANAL SALOMATLIGI & ALGORITM DIAGNOSTIKASI
// ==========================================

router.get('/algorithm-pulse/health', (req, res) => {
  const workspaceId = (req as any).workspaceId || (req.headers['x-workspace-id'] as string) || 'default';
  const report = AlgorithmPulseService.getChannelHealth(workspaceId);
  res.json({ success: true, report });
});

// ==========================================
// 29. YOUTUBE SHORTS AUDIO TREND RADAR
// ==========================================

router.get('/audio-trends', (req, res) => {
  const topic = req.query.topic as string | undefined;
  const analysis = ShortsAudioTrendRadarService.getTrendingAudio(topic);
  res.json({ success: true, ...analysis });
});

// ==========================================
// 30. GOOGLE SEARCH KEY MOMENTS & SMART CHAPTERS
// ==========================================

router.get('/smart-chapters/:contentId', (req, res) => {
  const { contentId } = req.params;
  const title = req.query.title as string | undefined;
  const report = SmartChapterSeoService.generateChapters(contentId, title);
  res.json({ success: true, report });
});

// ==========================================
// 31. 24/7 NON-STOP LIVE STREAM RADIO
// ==========================================

router.get('/livestream/status', (_req, res) => {
  const status = LiveStreamSchedulerService.getLiveStreamStatus();
  res.json({ success: true, status });
});

router.post('/livestream/toggle', (req, res) => {
  const { enable, title } = req.body || {};
  const status = LiveStreamSchedulerService.toggleStreaming(Boolean(enable), title);
  res.json({ success: true, status });
});

export default router;
