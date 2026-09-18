import fs from 'fs';
import path from 'path';
import { contentStore } from './content-store.service';

export interface SeriesEpisode {
  episodeNumber: number;
  videoId: string;
  title: string;
  addedAt: string;
}

export interface VideoSeries {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  category: string;
  badge: string;
  targetEpisodes: number;
  episodes: SeriesEpisode[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoSeriesContext {
  inSeries: boolean;
  series?: VideoSeries;
  episodeNumber?: number;
  totalEpisodes?: number;
  prevEpisode?: SeriesEpisode;
  nextEpisode?: SeriesEpisode;
  bingeComment?: string;
  outroTeaser?: string;
}

const getSeriesDir = () => path.resolve(process.cwd(), 'data/series');

export class SeriesService {
  private memoryStore: Map<string, VideoSeries[]> = new Map();

  constructor() {
    try {
      const dir = getSeriesDir();
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (e) {}
  }

  private getFilePath(workspaceId: string): string {
    return path.join(getSeriesDir(), `${workspaceId}.json`);
  }

  private getDefaults(workspaceId: string): VideoSeries[] {
    return [
      {
        id: 'series_ai_tools_2026',
        workspaceId,
        title: 'Top 100 Yashirin AI Saytlar',
        description: 'Dasturchilar va frilanserlar uchun 2026-yilning eng sara AI vositalari seriyasi',
        category: 'AI Tools',
        badge: '10-Qismli Serial',
        targetEpisodes: 10,
        episodes: [
          {
            episodeNumber: 1,
            videoId: 'preset_deepseek_r1_local',
            title: 'DeepSeek R1 ni 100% Bepul va Offline Ishlatish',
            addedAt: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            episodeNumber: 2,
            videoId: 'preset_claude_37_sonnet',
            title: 'Claude 3.7 Sonnet Hybrid Reasoning Kuchi',
            addedAt: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'series_cybersecurity_2026',
        workspaceId,
        title: '2026 Kiberxavfsizlik & Darknet Sirlari',
        description: 'Internetdagi eng maxfiy protokollar va tizim himoyasi sirlari',
        category: 'Cybersecurity',
        badge: 'Eksklyuziv Serial',
        targetEpisodes: 8,
        episodes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'series_coding_agents_2026',
        workspaceId,
        title: 'AI Dasturlash & Avtonom Agentlar',
        description: 'Kodni 10 barobar tezroq yozuvchi eng yangi avtonom agentlar',
        category: 'Coding',
        badge: 'Dasturchilar Uchun',
        targetEpisodes: 12,
        episodes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  getSeriesList(workspaceId: string): VideoSeries[] {
    const filePath = this.getFilePath(workspaceId);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.memoryStore.set(workspaceId, parsed);
          return parsed;
        }
      } catch (e) {}
    }

    if (this.memoryStore.has(workspaceId)) {
      return this.memoryStore.get(workspaceId)!;
    }

    const defaults = this.getDefaults(workspaceId);
    this.saveSeriesList(workspaceId, defaults);
    return defaults;
  }

  private saveSeriesList(workspaceId: string, list: VideoSeries[]): void {
    this.memoryStore.set(workspaceId, list);
    try {
      const filePath = this.getFilePath(workspaceId);
      fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[SeriesService] Could not save series file:', e);
    }
  }

  createSeries(workspaceId: string, data: { title: string; description: string; category?: string; badge?: string; targetEpisodes?: number }): VideoSeries {
    const list = this.getSeriesList(workspaceId);
    const id = `series_${Date.now()}`;
    const newSeries: VideoSeries = {
      id,
      workspaceId,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category || 'General AI',
      badge: data.badge || `${data.targetEpisodes || 10}-Qismli Serial`,
      targetEpisodes: data.targetEpisodes || 10,
      episodes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.push(newSeries);
    this.saveSeriesList(workspaceId, list);
    return newSeries;
  }

  addEpisode(workspaceId: string, seriesId: string, videoId: string, title?: string): VideoSeries {
    const list = this.getSeriesList(workspaceId);
    const series = list.find(s => s.id === seriesId);
    if (!series) {
      throw new Error(`Series not found: ${seriesId}`);
    }

    const item = contentStore.getById(videoId);
    const epTitle = title || item?.title || 'Episode';

    // Check if already in series
    const existingIndex = series.episodes.findIndex(e => e.videoId === videoId);
    if (existingIndex >= 0) {
      series.episodes[existingIndex].title = epTitle;
    } else {
      const nextEpNum = series.episodes.length + 1;
      series.episodes.push({
        episodeNumber: nextEpNum,
        videoId,
        title: epTitle,
        addedAt: new Date().toISOString()
      });
    }

    series.updatedAt = new Date().toISOString();
    this.saveSeriesList(workspaceId, list);

    // Also update item metadata in contentStore
    try {
      const epNum = series.episodes.find(e => e.videoId === videoId)?.episodeNumber || 1;
      const context = this.getVideoSeriesContext(workspaceId, videoId);
      contentStore.updateItem(videoId, {
        pinnedComment: context.bingeComment || item?.pinnedComment
      });
    } catch (e) {}

    return series;
  }

  getVideoSeriesContext(workspaceId: string, videoId: string): VideoSeriesContext {
    const list = this.getSeriesList(workspaceId);

    for (const s of list) {
      const epIndex = s.episodes.findIndex(e => e.videoId === videoId);
      if (epIndex >= 0) {
        const currentEp = s.episodes[epIndex];
        const prevEp = epIndex > 0 ? s.episodes[epIndex - 1] : undefined;
        const nextEp = epIndex < s.episodes.length - 1 ? s.episodes[epIndex + 1] : undefined;

        let bingeComment = `🎬 SERIAL: "${s.title}" (Epizod #${currentEp.episodeNumber} / ${s.targetEpisodes})\n\n`;
        if (prevEp) {
          bingeComment += `⏮️ Oldingi qism (#${prevEp.episodeNumber}): ${prevEp.title}\n`;
        }
        if (nextEp) {
          bingeComment += `⏭️ Keyingi qism (#${nextEp.episodeNumber}): ${nextEp.title}\n`;
        } else {
          bingeComment += `⏭️ Keyingi qism (#${currentEp.episodeNumber + 1}) tez orada chiqadi! O'tkazib yubormaslik uchun obuna bo'ling 🔔\n`;
        }
        bingeComment += `\n💬 Siz ushbu vosita haqida nima deb o'ylaysiz? Izohlarda fikringizni qoldiring! 👇`;

        const outroTeaser = nextEp 
          ? `Epizod #${nextEp.episodeNumber} chiqdi! Kanalda ko'ring`
          : `Keyingi qism (#${currentEp.episodeNumber + 1}) tez orada chiqadi!`;

        return {
          inSeries: true,
          series: s,
          episodeNumber: currentEp.episodeNumber,
          totalEpisodes: s.targetEpisodes,
          prevEpisode: prevEp,
          nextEpisode: nextEp,
          bingeComment,
          outroTeaser
        };
      }
    }

    return { inSeries: false };
  }
}

export const seriesService = new SeriesService();
