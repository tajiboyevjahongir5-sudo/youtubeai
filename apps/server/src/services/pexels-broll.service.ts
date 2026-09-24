import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { getWorkspaceSettings } from './workspace-settings.service';
import { ContentItemRecord } from './content-store.service';

export interface PexelsVideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  fps: number;
  link: string;
}

export interface PexelsVideoItem {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  image: string;
  video_files: PexelsVideoFile[];
}

export interface PexelsSearchResult {
  page: number;
  per_page: number;
  total_results: number;
  videos: PexelsVideoItem[];
}

// Built-in English keywords mapper for high-relevance video queries
const KEYWORD_MAP: Record<string, string> = {
  'sun\'iy intellekt': 'artificial intelligence humanoid robot tech',
  'suniy intellekt': 'artificial intelligence futuristic digital',
  'ai': 'artificial intelligence cyber technology',
  'dasturlash': 'coding software developer programming screen',
  'dasturchi': 'software engineer coding computer screen',
  'kiberxavfsizlik': 'cybersecurity hacker server matrix code',
  'xaker': 'cyber hacker matrix code terminal',
  'server': 'datacenter server flashing lights',
  'bulut': 'cloud computing network technology',
  'datacenter': 'datacenter futuristic server racks',
  'biznes': 'modern technology finance business digital',
  'pul': 'wealth cryptocurrency digital finance success',
  'crypto': 'cryptocurrency bitcoin trading blockchain',
  'robot': 'futuristic robot android cyber',
  'avtomatlashtirish': 'automation machine technology digital workflow',
  'python': 'python programming code software screen',
  'deepseek': 'artificial intelligence neural network data',
  'chatgpt': 'artificial intelligence typing computer futuristic',
  'gemini': 'futuristic artificial intelligence technology glowing',
  'gadjet': 'futuristic technology smartphone hardware',
  'agent': 'autonomous ai agent futuristic technology',
  'prompt': 'software developer typing command code prompt',
  'model': 'supercomputer neural network artificial intelligence',
  'kod': 'software developer programming code matrix',
  'terminal': 'linux terminal developer matrix coding',
  'kompyuter': 'high tech computer modern workspace neon',
  'benchmark': 'supercomputer performance data analytics telemetry'
};

export class PexelsBrollService {
  private getCacheDir(): string {
    const candidates = [
      path.resolve(process.cwd(), 'apps/server/public/assets/broll'),
      path.resolve(__dirname, '../../public/assets/broll'),
      path.resolve(__dirname, '../public/assets/broll'),
      path.resolve(process.cwd(), 'public/assets/broll')
    ];
    for (const c of candidates) {
      if (!fs.existsSync(c)) {
        try { fs.mkdirSync(c, { recursive: true }); } catch (e) {}
      }
      return c;
    }
    return candidates[0];
  }

  public getEffectiveApiKey(_workspaceId?: string): string | undefined {
    // Server-side only — foydalanuvchi hech qanday kalit kiritmaydi
    return process.env.PEXELS_API_KEY || undefined;
  }

  public isConfigured(_workspaceId?: string): boolean {
    const key = this.getEffectiveApiKey();
    return !!(key && key.length > 10);
  }

  /**
   * Translates Uzbek / Russian / general title keywords into high-yield Pexels search query
   */
  public extractSearchQuery(text: string): string {
    const lower = text.toLowerCase();
    
    // Check known dictionary
    for (const [k, v] of Object.entries(KEYWORD_MAP)) {
      if (lower.includes(k)) {
        return v;
      }
    }

    // Strip hashtags, symbols, and non-topic stop words
    const cleaned = lower
      .replace(/#\w+/g, '')
      .replace(/http\S+/g, '')
      .replace(/[^a-z0-9\s]/gi, ' ')
      .replace(/\b(eng|yangi|top|video|uchun|haqida|bilan|qanday|qilish|sirlari|2026|100|ta|shorts|viral|best|how|to|in|of|and|the|a|an)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const words = cleaned.split(' ').filter(w => w.length > 2);
    if (words.length > 0) {
      return `${words.slice(0, 3).join(' ')} technology`;
    }

    return 'futuristic artificial intelligence technology';
  }

  /**
   * Searches Pexels for vertical portrait videos (9:16)
   */
  public async searchPortraitVideos(
    query: string,
    workspaceId?: string,
    limit: number = 5,
    orientation: 'portrait' | 'landscape' = 'portrait'
  ): Promise<PexelsVideoItem[]> {
    const apiKey = this.getEffectiveApiKey(workspaceId);
    if (!apiKey) {
      return [];
    }

    const cleanQuery = this.extractSearchQuery(query);
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(cleanQuery)}&orientation=${orientation}&per_page=${limit}&size=medium`;

    return new Promise((resolve) => {
      const req = https.get(
        url,
        {
          headers: {
            Authorization: apiKey,
            'User-Agent': 'Jpilot-Studio-Engine/2026'
          },
          timeout: 8000
        },
        (res) => {
          let rawData = '';
          res.on('data', (chunk) => { rawData += chunk; });
          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                const parsed: PexelsSearchResult = JSON.parse(rawData);
                resolve(parsed.videos || []);
              } else {
                console.warn(`[PexelsService] API javob kodi: ${res.statusCode}`);
                resolve([]);
              }
            } catch (e) {
              resolve([]);
            }
          });
        }
      );

      req.on('error', (err) => {
        console.warn('[PexelsService] So\'rov xatosi:', err.message);
        resolve([]);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve([]);
      });
    });
  }

  /**
   * Downloads a video clip to local disk with strict 12s timeout
   */
  public async downloadClip(fileUrl: string, targetPath: string): Promise<boolean> {
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 100000) {
      return true; // Already downloaded and valid
    }

    return new Promise((resolve) => {
      const fileStream = fs.createWriteStream(targetPath);
      const getter = fileUrl.startsWith('https') ? https : http;

      const req = getter.get(fileUrl, { timeout: 12000 }, (response) => {
        // Follow redirects
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          fileStream.close();
          try { if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath); } catch (e) {}
          return this.downloadClip(response.headers.location, targetPath).then(resolve);
        }

        if (response.statusCode !== 200) {
          fileStream.close();
          try { if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath); } catch (e) {}
          return resolve(false);
        }

        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close(() => {
            const sz = fs.existsSync(targetPath) ? fs.statSync(targetPath).size : 0;
            if (sz > 50000) {
              resolve(true);
            } else {
              try { if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath); } catch (e) {}
              resolve(false);
            }
          });
        });
      });

      req.on('error', () => {
        fileStream.close();
        try { if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath); } catch (e) {}
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        fileStream.close();
        try { if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath); } catch (e) {}
        resolve(false);
      });
    });
  }

  /**
   * Main pipeline helper: fetches and downloads up to 5 authentic topic-tailored clips for an item
   */
  public async getOrFetchTopicClips(
    item: ContentItemRecord,
    maxClips: number = 5
  ): Promise<string[]> {
    const cacheDir = this.getCacheDir();
    const isLong = item.videoFormat === 'long_form';
    const orientation = isLong ? 'landscape' : 'portrait';

    const defaultQuery = item.title + ' ' + (item.tags && Array.isArray(item.tags) ? item.tags.join(' ') : '');
    const downloadedClips: string[] = [];

    // Check if we already have downloaded clips for this item
    for (let i = 1; i <= maxClips; i++) {
      const candidate = path.join(cacheDir, `${item.id}_scene_${i}.mp4`);
      if (fs.existsSync(candidate) && fs.statSync(candidate).size > 100000) {
        downloadedClips.push(candidate);
      }
    }

    if (downloadedClips.length >= 3) {
      return downloadedClips;
    }

    // Attempt Pexels fetch if configured
    if (this.isConfigured(item.workspaceId)) {
      try {
        console.log(`🎥 [Pexels B-Roll] "${item.title}" uchun 5 ta sahna uchun 9:16 vertikal HD videolar qidirilmoqda...`);

        // Generate per-scene targeted queries
        const sceneQueries = [
          item.title,
          (item.scenes && item.scenes[1] && item.scenes[1].title) || 'coding developer software',
          (item.scenes && item.scenes[2] && item.scenes[2].title) || 'futuristic technology algorithm matrix',
          (item.scenes && item.scenes[3] && item.scenes[3].title) || 'digital analytics charts success',
          (item.scenes && item.scenes[4] && item.scenes[4].title) || 'modern technology subscribe community'
        ];

        for (let i = 0; i < maxClips; i++) {
          const outClipPath = path.join(cacheDir, `${item.id}_scene_${i + 1}.mp4`);
          if (fs.existsSync(outClipPath) && fs.statSync(outClipPath).size > 100000) {
            downloadedClips.push(outClipPath);
            continue;
          }

          const q = sceneQueries[i] || defaultQuery;
          const videos = await this.searchPortraitVideos(q, item.workspaceId, 3, orientation);
          if (videos && videos.length > 0) {
            const v = videos[0];
            const files = v.video_files || [];
            const bestFile = files.find(f => f.width === 1080 && f.height === 1920) ||
                             files.find(f => f.width === 720 && f.height === 1280) ||
                             files.find(f => f.quality === 'hd') ||
                             files[0];

            if (bestFile && bestFile.link) {
              console.log(`⬇️ [Pexels B-Roll] Sahna ${i + 1}/5 klipi yuklab olinmoqda ("${q.slice(0, 30)}")...`);
              const ok = await this.downloadClip(bestFile.link, outClipPath);
              if (ok) {
                downloadedClips.push(outClipPath);
              }
            }
          }
        }
      } catch (err: any) {
        console.warn('⚠️ [Pexels B-Roll] Qidiruv/yuklash notice (zaxira kadrlar ishlatiladi):', err?.message || err);
      }
    }

    // If no Pexels clips were acquired, return high quality local fallback candidates based on topic
    if (downloadedClips.length === 0) {
      const publicAssets = path.resolve(process.cwd(), 'apps/server/public/assets');
      const tLower = defaultQuery.toLowerCase();
      let fallbackCandidate = path.join(publicAssets, 'clip_ai.webm');

      if (tLower.includes('server') || tLower.includes('cloud') || tLower.includes('datacenter') || tLower.includes('infra')) {
        fallbackCandidate = path.join(publicAssets, 'clip_datacenter.mp4');
      } else if (tLower.includes('secret') || tLower.includes('dark') || tLower.includes('hacker') || tLower.includes('cyber')) {
        fallbackCandidate = path.join(publicAssets, 'cyberpunk_hailuo.webm');
      }

      if (fs.existsSync(fallbackCandidate)) {
        downloadedClips.push(fallbackCandidate);
      }
    }

    return downloadedClips;
  }

  /**
   * Direct API key validator with real sample results for frontend verification
   */
  public async testApiKey(apiKey: string): Promise<{ success: boolean; message: string; sampleVideos?: any[] }> {
    if (!apiKey || apiKey.trim().length < 10) {
      return { success: false, message: "API kaliti kiritilmadi yoki juda qisqa" };
    }

    const cleanKey = apiKey.trim();
    const url = 'https://api.pexels.com/videos/search?query=technology+artificial+intelligence&orientation=portrait&per_page=3&size=medium';

    return new Promise((resolve) => {
      const req = https.get(
        url,
        {
          headers: {
            Authorization: cleanKey,
            'User-Agent': 'Jpilot-Studio-Engine/2026'
          },
          timeout: 8000
        },
        (res) => {
          let rawData = '';
          res.on('data', (chunk) => { rawData += chunk; });
          res.on('end', () => {
            try {
              if (res.statusCode === 200) {
                const parsed: PexelsSearchResult = JSON.parse(rawData);
                const samples = (parsed.videos || []).map(v => ({
                  id: v.id,
                  duration: v.duration,
                  image: v.image,
                  width: v.width,
                  height: v.height,
                  url: v.url
                }));
                resolve({
                  success: true,
                  message: `Pexels API muvaffaqiyatli ulandi! ${parsed.total_results || 0} ta vertikal video mavjud.`,
                  sampleVideos: samples
                });
              } else if (res.statusCode === 401) {
                resolve({ success: false, message: "Pexels API kaliti noto'g'ri (401 Unauthorized). Kalitni tekshiring." });
              } else {
                resolve({ success: false, message: `Pexels serveri ${res.statusCode} statusini qaytardi.` });
              }
            } catch (e: any) {
              resolve({ success: false, message: `Javobni o'qishda xatolik: ${e.message}` });
            }
          });
        }
      );

      req.on('error', (err) => {
        resolve({ success: false, message: `Tarmoq ulanish xatosi: ${err.message}` });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, message: "Pexels serveriga ulanish vaqti tugadi (Timeout)" });
      });
    });
  }
}

export const pexelsBrollService = new PexelsBrollService();
