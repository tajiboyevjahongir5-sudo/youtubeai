import fs from 'fs';
import path from 'path';
import { contentStore, ContentItemRecord } from './content-store.service';
import { youtubeService } from './youtube.service';
import { VideoRenderService } from './video-render.service';
import { aiService } from './ai.service';
import { db } from '../db';
import { publishingJobs, workspaces } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const videoRenderService = new VideoRenderService();

export interface AutoPublishSettings {
  enabled: boolean;
  approvalMode: 'manual' | 'auto';
  autoGenerateIfEmpty: boolean;
  dailyTarget: number;
  timezone: string;
  publishTimes: string[]; // e.g. ["14:00", "20:00"]
  videoFormat: 'shorts' | 'long_form';
  niche: string;
  subNiches?: string;
  audience?: string;
  englishVariant?: string;
  tone?: string;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SETTINGS_DIR = path.join(DATA_DIR, 'settings');
const LOGS_DIR = path.join(DATA_DIR, 'scheduler_logs');

if (!fs.existsSync(SETTINGS_DIR)) fs.mkdirSync(SETTINGS_DIR, { recursive: true });
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

export function getWorkspaceSettings(workspaceId: string): AutoPublishSettings {
  const filePath = path.join(SETTINGS_DIR, `${workspaceId}.json`);
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {}
  }
  return {
    enabled: true,
    approvalMode: 'auto',
    autoGenerateIfEmpty: true,
    dailyTarget: 2,
    timezone: 'Asia/Tashkent',
    publishTimes: ['14:00', '20:00'],
    videoFormat: 'shorts',
    niche: 'AI Tools & Tech 2026',
    subNiches: 'Coding, SaaS, Productivity, Python',
    audience: 'US, UK, Canada tech professionals',
    englishVariant: 'us',
    tone: 'professional'
  };
}

export function saveWorkspaceSettings(workspaceId: string, settings: Partial<AutoPublishSettings>): AutoPublishSettings {
  const current = getWorkspaceSettings(workspaceId);
  const updated = { ...current, ...settings };
  const filePath = path.join(SETTINGS_DIR, `${workspaceId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export class SchedulerService {
  private timer: NodeJS.Timeout | null = null;
  private isTicking: boolean = false;
  private publishedSlotsToday = new Set<string>();
  private lastDateKey: string = '';

  constructor() {
    // Automatically start the background scheduler loop
    this.start();
  }

  public start() {
    if (this.timer) return;
    console.log('⏰ [Auto-Scheduler] Jpilot kunlik avtomatlashtirilgan video nashr qilish xizmati ishga tushdi.');
    
    // Initial check after 4 seconds
    setTimeout(() => {
      this.tick().catch(err => console.error('Scheduler initial tick error:', err));
    }, 4000);

    // Check every 25 seconds for precise on-time publishing
    this.timer = setInterval(() => {
      this.tick().catch(err => console.error('Scheduler interval tick error:', err));
    }, 25000);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async tick() {
    if (this.isTicking) return;
    this.isTicking = true;

    try {
      // 1. Process specifically scheduled items (scheduledAt <= now)
      await this.processScheduledItems();

      // 2. Process workspace daily auto-pilot slots
      await this.processDailyAutoPilot();
    } catch (err) {
      console.error('❌ [Auto-Scheduler] Xatolik yuz berdi:', err);
    } finally {
      this.isTicking = false;
    }
  }

  /**
   * 1. Checks all items with status: 'scheduled' whose scheduledAt time has arrived
   */
  private async processScheduledItems() {
    const now = new Date();
    // Get all items across known workspaces
    const candidateWorkspaces = ['ws_j7ktjxw0', 'default'];
    // Also discover workspaces from settings directory
    try {
      const files = fs.readdirSync(SETTINGS_DIR);
      for (const f of files) {
        if (f.endsWith('.json')) {
          const ws = f.replace('.json', '');
          if (!candidateWorkspaces.includes(ws)) candidateWorkspaces.push(ws);
        }
      }
    } catch (e) {}

    for (const wsId of candidateWorkspaces) {
      const items = contentStore.getAll(wsId);
      for (const item of items) {
        if (item.status === 'scheduled' && item.scheduledAt) {
          const schedTime = new Date(item.scheduledAt).getTime();
          if (schedTime <= now.getTime()) {
            console.log(`⏰ [Auto-Scheduler] "${item.title}" rejalashtirilgan vaqti yetib keldi (${item.scheduledAt}). Yuklash boshlanmoqda...`);
            await this.publishItem(item);
          }
        }
      }
    }
  }

  /**
   * 2. Daily Auto-Pilot: Automatically publishes at designated daily hours (e.g. 14:00, 20:00)
   */
  private async processDailyAutoPilot() {
    const now = new Date();
    // Reset published slots at midnight
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (this.lastDateKey !== dateKey) {
      this.publishedSlotsToday.clear();
      this.lastDateKey = dateKey;
    }

    const candidateWorkspaces = ['ws_j7ktjxw0', 'default'];
    try {
      const files = fs.readdirSync(SETTINGS_DIR);
      for (const f of files) {
        if (f.endsWith('.json')) {
          const ws = f.replace('.json', '');
          if (!candidateWorkspaces.includes(ws)) candidateWorkspaces.push(ws);
        }
      }
    } catch (e) {}

    for (const wsId of candidateWorkspaces) {
      // Check if YouTube is authenticated for this workspace
      if (!youtubeService.isAuthenticated(wsId)) {
        continue;
      }

      const settings = getWorkspaceSettings(wsId);
      if (!settings.enabled || settings.approvalMode !== 'auto') {
        continue;
      }

      // Format current time in workspace timezone
      const timeInTz = this.getCurrentTimeInTimezone(settings.timezone || 'Asia/Tashkent');
      const currentHour = timeInTz.hours;
      const currentMinute = timeInTz.minutes;

      for (const timeSlot of settings.publishTimes) {
        const [slotHourStr, slotMinStr] = timeSlot.split(':');
        const slotHour = parseInt(slotHourStr, 10);
        const slotMin = parseInt(slotMinStr || '0', 10);

        const slotKey = `${wsId}_${dateKey}_${timeSlot}`;

        // Check if current time is within slot window (e.g. within 20 minutes of slot time)
        const minuteDiff = (currentHour * 60 + currentMinute) - (slotHour * 60 + slotMin);
        const isTimeForSlot = minuteDiff >= 0 && minuteDiff < 25;

        if (isTimeForSlot && !this.publishedSlotsToday.has(slotKey)) {
          console.log(`🤖 [Auto-Pilot] ${wsId} uchun ${timeSlot} vaqti keldi! Avtomatik video nashr jarayoni boshlandi.`);
          this.publishedSlotsToday.add(slotKey);

          // 1. Fetch channel's already uploaded videos to prevent ANY duplicate upload
          let liveInfo = await youtubeService.getLiveStats(wsId);
          if (!liveInfo) {
            liveInfo = youtubeService.loadChannelInfo(wsId);
          }
          const uploadedTitles = new Set<string>(
            (liveInfo?.recentVideos || []).map((v: any) =>
              (v.title || '').toLowerCase().replace(/#shorts/gi, '').replace(/[^a-z0-9]/g, '').trim()
            )
          );

          // 2. Find ready item that has NOT been uploaded yet
          const candidates = contentStore.getAll(wsId).filter(i => {
            if (i.status === 'published' || i.status === 'failed') return false;
            const normTitle = (i.title || '').toLowerCase().replace(/#shorts/gi, '').replace(/[^a-z0-9]/g, '').trim();
            if (uploadedTitles.has(normTitle)) {
              // Synchronize state: mark as published in store
              contentStore.updateItem(i.id, { status: 'published' });
              return false;
            }
            return i.status === 'approved' || i.status === 'review';
          });

          let readyItem: ContentItemRecord | null = candidates[0] || null;
          
          if (!readyItem && settings.autoGenerateIfEmpty) {
            console.log(`✨ [Auto-Pilot] Navbatda yangi video yo'q. Gemini yangi viral mavzuni generatsiya qilmoqda...`);
            try {
              const viralTopicPool = [
                'Top 5 Autonomous Coding Agents in 2026',
                'Claude 3.7 vs Gemini 2.0: Real World Coding Benchmark',
                '5 AI Websites That Feel Completely Illegal to Know',
                'How AI Agents Will Replace Traditional Software by 2027',
                'The Secret AI Tool Every Solo Founder Uses in 2026',
                'Why Most Developers Are Coding 10x Faster with AI Swarms',
                'Stop Doing This Manually! Autonomous AI Automation Blueprint',
                'Top 3 Open Source AI Models That Beat GPT-4 in 2026'
              ];

              let selectedTitle = viralTopicPool.find(t => {
                const norm = t.toLowerCase().replace(/[^a-z0-9]/g, '');
                return !uploadedTitles.has(norm);
              }) || `AI Breakthrough 2026: ${dateKey} Automation Blueprint`;

              const freshItem = contentStore.generateTailoredItem({
                id: `item_auto_${Date.now()}`,
                workspaceId: wsId,
                title: `${selectedTitle} #Shorts`,
                videoFormat: settings.videoFormat || 'shorts',
                contentPillar: 'educational',
                status: 'review'
              });
              
              // Generate script using AI with learned directives
              try {
                const aiGen = await aiService.generateScript({
                  workspaceId: wsId,
                  title: selectedTitle,
                  videoFormat: settings.videoFormat || 'shorts',
                  contentPillar: 'educational'
                });
                if (aiGen) {
                  freshItem.script = aiGen.script || freshItem.script;
                  freshItem.scenes = (aiGen.scenes && aiGen.scenes.length > 0) ? aiGen.scenes : freshItem.scenes;
                  freshItem.description = aiGen.description || freshItem.description;
                  freshItem.tags = aiGen.tags || freshItem.tags;
                  freshItem.pinnedComment = aiGen.pinnedComment || freshItem.pinnedComment;
                  freshItem.titleVariants = aiGen.titleVariants || freshItem.titleVariants;
                }
              } catch (aiErr) {
                console.warn('AI script generation warning in auto-pilot:', aiErr);
              }

              contentStore.setItem(freshItem);
              readyItem = freshItem;
            } catch (genErr) {
              console.error(`❌ [Auto-Pilot] Yangi mavzu yaratishda xatolik:`, genErr);
            }
          }

          if (readyItem) {
            await this.publishItem(readyItem);
          } else {
            console.warn(`⚠️ [Auto-Pilot] ${wsId} uchun nashr etishga yangi video topilmadi.`);
          }
        }
      }
    }
  }

  /**
   * Publishes a content item to YouTube automatically:
   * 1. Checks YouTube Anti-Duplicate Shield
   * 2. Checks/renders video MP4 specifically for this item
   * 3. Uploads via YouTube API
   * 4. Sets Pinned Comment
   * 5. Sets Custom Thumbnail
   * 6. Updates status to 'published'
   */
  public async publishItem(item: ContentItemRecord): Promise<{ success: boolean; youtubeUrl?: string; error?: string }> {
    const workspaceId = item.workspaceId || 'ws_j7ktjxw0';
    console.log(`🚀 [Auto-Scheduler] "${item.title}" (${item.id}) YouTube'ga yuklash boshlandi...`);

    if (!youtubeService.isAuthenticated(workspaceId)) {
      console.warn(`⚠️ [Auto-Scheduler] Workspace "${workspaceId}" YouTube kanali ulanmagan!`);
      contentStore.updateItem(item.id, { status: 'failed' });
      return { success: false, error: 'YouTube kanal ulanmagan' };
    }

    // 0. Anti-Duplicate Protection: Check if this video has already been published to YouTube
    const titleNormalized = (item.title || '').toLowerCase().replace(/#shorts/gi, '').replace(/[^a-z0-9]/g, '').trim();
    let liveInfo = await youtubeService.getLiveStats(workspaceId);
    if (!liveInfo) {
      liveInfo = youtubeService.loadChannelInfo(workspaceId);
    }
    const existingVideo = (liveInfo?.recentVideos || []).find((v: any) => {
      const vNorm = (v.title || '').toLowerCase().replace(/#shorts/gi, '').replace(/[^a-z0-9]/g, '').trim();
      return vNorm === titleNormalized;
    });

    if (existingVideo) {
      console.warn(`🛡️ [Anti-Duplicate Shield] "${item.title}" allaqachon YouTube kanalida mavjud (ID: ${existingVideo.id})! Takroriy yuklash to'xtatildi.`);
      contentStore.updateItem(item.id, {
        status: 'published',
        publishedAt: existingVideo.publishedAt || new Date().toISOString(),
        youtubeVideoId: existingVideo.id,
        youtubeUrl: `https://youtube.com/shorts/${existingVideo.id}`
      });
      return { success: false, error: 'Video allaqachon YouTube kanalida mavjud (takrorlanish oldi olindi)' };
    }

    // 1. Locate or render MP4 video specifically for this item
    const candidatePaths = [
      path.resolve(process.cwd(), 'apps/server/public/videos', `${item.id}.mp4`),
      path.resolve(process.cwd(), 'public/videos', `${item.id}.mp4`),
      path.resolve(process.cwd(), 'apps/web/public/videos', `${item.id}.mp4`),
      path.resolve(process.cwd(), '../web/public/videos', `${item.id}.mp4`),
      item.videoUrl ? path.resolve(process.cwd(), item.videoUrl.replace(/^\//, '')) : ''
    ].filter(Boolean) as string[];

    let videoPath = candidatePaths.find(p => fs.existsSync(p));

    // Fallback ONLY for item_1 legacy video file
    if (!videoPath && item.id === 'item_1') {
      const legacyPaths = [
        'C:\\Users\\user\\Downloads\\neural_pulse_short.mp4',
        path.resolve(process.cwd(), 'public/neural_pulse_short.mp4')
      ];
      videoPath = legacyPaths.find(p => fs.existsSync(p));
    }

    if (!videoPath) {
      console.log(`🎬 [Auto-Scheduler] "${item.title}" uchun video MP4 fayli topilmadi. Mavzuga mos dinamik audio-vizual render boshlanmoqda...`);
      try {
        const renderRes = await videoRenderService.renderVideo(item);
        if (renderRes && renderRes.videoUrl) {
          const expectedPath = path.resolve(process.cwd(), 'public/videos', `${item.id}.mp4`);
          const serverPath = path.resolve(process.cwd(), 'apps/server/public/videos', `${item.id}.mp4`);
          if (fs.existsSync(expectedPath)) videoPath = expectedPath;
          else if (fs.existsSync(serverPath)) videoPath = serverPath;
        }
      } catch (renderErr) {
        console.error(`❌ [Auto-Scheduler] Render xatosi:`, renderErr);
      }
    }

    if (!videoPath) {
      console.error(`❌ [Auto-Scheduler] "${item.title}" uchun video fayli yaratib bo'lmadi!`);
      contentStore.updateItem(item.id, { status: 'failed' });
      return { success: false, error: 'Video fayl mavjud emas' };
    }

    // 2. Upload to YouTube
    try {
      const metadata = {
        title: item.title || 'Neural Pulse AI #shorts',
        description: item.description || `Stop trading your time for money. Autonomous AI tools run 24/7!\n\n#shorts #ai #automation #tech`,
        tags: item.tags || ['shorts', 'ai', 'automation', 'productivity'],
        pinnedComment: item.pinnedComment || `Which AI tool or architecture will you test first? Comment below and subscribe! 👇`,
        relatedVideoId: item.relatedVideoId,
        thumbnailPath: fs.existsSync(videoPath.replace('.mp4', '_thumb.jpg')) ? videoPath.replace('.mp4', '_thumb.jpg') : undefined,
        privacyStatus: 'public',
        categoryId: '28'
      };

      const uploadResult = await youtubeService.uploadVideo(workspaceId, videoPath, metadata);
      const videoId = uploadResult.id;
      const youtubeUrl = `https://youtube.com/shorts/${videoId}`;

      contentStore.updateItem(item.id, {
        status: 'published',
        publishedAt: new Date().toISOString(),
        youtubeVideoId: videoId,
        youtubeUrl
      });

      // Update publishingJobs if exists
      try {
        await db.update(publishingJobs)
          .set({ status: 'completed', completedAt: new Date() })
          .where(eq(publishingJobs.contentItemId, item.id));
      } catch (e) {}

      // Write log entry
      const logEntry = {
        timestamp: new Date().toISOString(),
        workspaceId,
        itemId: item.id,
        title: item.title,
        youtubeVideoId: videoId,
        youtubeUrl,
        status: 'published'
      };
      fs.appendFileSync(path.join(LOGS_DIR, 'publishing.log'), JSON.stringify(logEntry) + '\n', 'utf-8');

      console.log(`🎉 [Auto-Scheduler] "${item.title}" muvaffaqiyatli YouTube'ga yuklandi!`);
      console.log(`🔗 Havola: ${youtubeUrl}`);
      return { success: true, youtubeUrl };
    } catch (uploadErr: any) {
      console.error(`❌ [Auto-Scheduler] YouTube API orqali yuklashda xatolik:`, uploadErr?.message || uploadErr);
      contentStore.updateItem(item.id, { status: 'failed' });
      return { success: false, error: uploadErr?.message || 'Yuklashda xatolik' };
    }
  }

  private getCurrentTimeInTimezone(timezone: string): { hours: number; minutes: number } {
    try {
      const date = new Date();
      const invDate = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }).format(date);
      const [hStr, mStr] = invDate.split(':');
      return { hours: parseInt(hStr, 10), minutes: parseInt(mStr, 10) };
    } catch (e) {
      const now = new Date();
      return { hours: now.getHours(), minutes: now.getMinutes() };
    }
  }

  /**
   * Preserved for route compatibility
   */
  async scheduleJob(jobId: string, data: any, delay: number) {
    console.log(`[Scheduler] Job ${jobId} scheduled with delay ${delay}ms`);
  }

  /**
   * Calculates daily upload slots based on upload target and timezone.
   */
  calculatePublishingSlots(dailyTarget: number = 2, timezone: string = 'Asia/Tashkent'): Date[] {
    const defaultHoursUtc = [14, 21];
    const now = new Date();
    const slots: Date[] = [];

    for (let i = 0; i < dailyTarget; i++) {
      const slot = new Date(now);
      const targetHourUtc = defaultHoursUtc[i % defaultHoursUtc.length] ?? 14 + (i * 4);
      slot.setUTCHours(targetHourUtc, 0, 0, 0);
      if (slot.getTime() <= now.getTime()) {
        slot.setUTCDate(slot.getUTCDate() + 1);
      }
      slots.push(slot);
    }

    return slots;
  }
}

export const schedulerService = new SchedulerService();
