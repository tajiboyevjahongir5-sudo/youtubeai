import { google, youtube_v3 } from 'googleapis';
import { env } from '../env';
import fs from 'fs';
import path from 'path';

export interface IYouTubeService {
  getAuthUrl(state?: string): string;
  getToken(code: string): Promise<any>;
  getChannelInfo(workspaceId: string, accessToken?: string, refreshToken?: string): Promise<any>;
  uploadVideo(workspaceId: string, videoPath: string, metadata: any, accessToken?: string, refreshToken?: string): Promise<any>;
  getAnalytics(workspaceId: string, accessToken?: string, refreshToken?: string, channelId?: string): Promise<any>;
  saveTokens(workspaceId: string, tokens: any): void;
  loadTokens(workspaceId: string): any;
  saveChannelInfo(workspaceId: string, info: any): void;
  loadChannelInfo(workspaceId: string): any;
  isAuthenticated(workspaceId: string): boolean;
  clearTokens(workspaceId: string): void;
}

export class YouTubeService implements IYouTubeService {
  private tokensDir: string;
  private channelsDir: string;
  private legacyTokenPath: string;
  private legacyChannelPath: string;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    this.tokensDir = path.join(dataDir, 'tokens');
    this.channelsDir = path.join(dataDir, 'channels');
    this.legacyTokenPath = path.join(dataDir, 'youtube_token.json');
    this.legacyChannelPath = path.join(dataDir, 'youtube_channel.json');

    try {
      if (!fs.existsSync(this.tokensDir)) fs.mkdirSync(this.tokensDir, { recursive: true });
      if (!fs.existsSync(this.channelsDir)) fs.mkdirSync(this.channelsDir, { recursive: true });
    } catch (e) {}
  }

  private sanitizeId(workspaceId: string): string {
    return (workspaceId || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  private getTokenFilePath(workspaceId: string): string {
    const id = this.sanitizeId(workspaceId);
    return path.join(this.tokensDir, `${id}.json`);
  }

  private getChannelFilePath(workspaceId: string): string {
    const id = this.sanitizeId(workspaceId);
    return path.join(this.channelsDir, `${id}.json`);
  }

  saveTokens(workspaceId: string, tokens: any) {
    try {
      const existing = this.loadTokens(workspaceId) || {};
      const merged = { ...existing, ...tokens, workspaceId, savedAt: new Date().toISOString() };
      
      const filePath = this.getTokenFilePath(workspaceId);
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
      
      if (workspaceId === 'default') {
        try {
          fs.writeFileSync(this.legacyTokenPath, JSON.stringify(merged, null, 2), 'utf-8');
        } catch (e) {}
      }
      console.log(`✅ [${workspaceId}] YouTube OAuth tokenlari saqlandi:`, filePath);
    } catch (e) {
      console.error(`❌ [${workspaceId}] Token saqlashda xatolik:`, e);
    }
  }

  loadTokens(workspaceId: string): any {
    try {
      const filePath = this.getTokenFilePath(workspaceId);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
      
      if (workspaceId === 'default' && fs.existsSync(this.legacyTokenPath)) {
        return JSON.parse(fs.readFileSync(this.legacyTokenPath, 'utf-8'));
      }
    } catch (e) {
      console.error(`❌ [${workspaceId}] Token o'qishda xatolik:`, e);
    }
    return null;
  }

  saveChannelInfo(workspaceId: string, info: any) {
    try {
      const filePath = this.getChannelFilePath(workspaceId);
      fs.writeFileSync(filePath, JSON.stringify(info, null, 2), 'utf-8');
      if (workspaceId === 'default') {
        try {
          fs.writeFileSync(this.legacyChannelPath, JSON.stringify(info, null, 2), 'utf-8');
        } catch (e) {}
      }
      console.log(`✅ [${workspaceId}] Kanal ma'lumotlari saqlandi:`, filePath);
    } catch (e) {
      console.error(`❌ [${workspaceId}] Kanal ma'lumotlarini saqlashda xatolik:`, e);
    }
  }

  loadChannelInfo(workspaceId: string): any {
    try {
      const filePath = this.getChannelFilePath(workspaceId);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
      if (workspaceId === 'default' && fs.existsSync(this.legacyChannelPath)) {
        return JSON.parse(fs.readFileSync(this.legacyChannelPath, 'utf-8'));
      }
    } catch (e) {}
    return null;
  }

  isAuthenticated(workspaceId: string): boolean {
    const tokens = this.loadTokens(workspaceId);
    return !!(tokens && (tokens.access_token || tokens.refresh_token));
  }

  clearTokens(workspaceId: string): void {
    try {
      const tokenPath = this.getTokenFilePath(workspaceId);
      const channelPath = this.getChannelFilePath(workspaceId);
      if (fs.existsSync(tokenPath)) fs.unlinkSync(tokenPath);
      if (fs.existsSync(channelPath)) fs.unlinkSync(channelPath);
      if (workspaceId === 'default') {
        if (fs.existsSync(this.legacyTokenPath)) fs.unlinkSync(this.legacyTokenPath);
        if (fs.existsSync(this.legacyChannelPath)) fs.unlinkSync(this.legacyChannelPath);
      }
      console.log(`🗑️ [${workspaceId}] YouTube tokenlari o'chirildi.`);
    } catch (e) {}
  }

  getClient(workspaceId: string, accessToken?: string, refreshToken?: string) {
    const oauth2Client = new google.auth.OAuth2(
      env.YOUTUBE_CLIENT_ID,
      env.YOUTUBE_CLIENT_SECRET,
      env.YOUTUBE_REDIRECT_URI
    );

    const storedTokens = this.loadTokens(workspaceId);
    const creds: any = {};
    if (storedTokens) {
      Object.assign(creds, storedTokens);
    }
    if (accessToken) creds.access_token = accessToken;
    if (refreshToken) creds.refresh_token = refreshToken;

    if (Object.keys(creds).length > 0) {
      oauth2Client.setCredentials(creds);
    }

    oauth2Client.on('tokens', (newTokens) => {
      console.log(`🔄 [${workspaceId}] YouTube tokenlari yangilandi, saqlanmoqda...`);
      this.saveTokens(workspaceId, newTokens);
    });

    return oauth2Client;
  }

  getAuthUrl(state?: string) {
    const client = new google.auth.OAuth2(
      env.YOUTUBE_CLIENT_ID,
      env.YOUTUBE_CLIENT_SECRET,
      env.YOUTUBE_REDIRECT_URI
    );
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      state: state || '',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly'
      ]
    });
  }

  async getToken(code: string) {
    const client = new google.auth.OAuth2(
      env.YOUTUBE_CLIENT_ID,
      env.YOUTUBE_CLIENT_SECRET,
      env.YOUTUBE_REDIRECT_URI
    );
    const { tokens } = await client.getToken(code);
    return tokens;
  }

  async getChannelInfo(workspaceId: string, accessToken?: string, refreshToken?: string) {
    const auth = this.getClient(workspaceId, accessToken, refreshToken);
    const youtube = google.youtube({ version: 'v3', auth });
    const response = await youtube.channels.list({ part: ['snippet', 'statistics'], mine: true });
    return response.data.items?.[0];
  }

  async uploadVideo(workspaceId: string, videoPath: string, metadata: any, accessToken?: string, refreshToken?: string) {
    if (!this.isAuthenticated(workspaceId)) {
      throw new Error(`Ushbu foydalanuvchi (${workspaceId}) YouTube hisobiga ulanmagan!`);
    }

    const auth = this.getClient(workspaceId, accessToken, refreshToken);
    const youtube = google.youtube({ version: 'v3', auth });
    
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video fayli topilmadi: ${videoPath}`);
    }

    const fileSize = fs.statSync(videoPath).size;
    console.log(`📤 [YouTube API - ${workspaceId}] Yuklash boshlanmoqda: ${videoPath} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);
    console.log(`🎬 [YouTube API - ${workspaceId}] Sarlavha: "${metadata.title}"`);

    const res = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: { 
          title: metadata.title, 
          description: metadata.description, 
          tags: metadata.tags || ['shorts', 'ai', 'neural pulse'],
          categoryId: metadata.categoryId || '28',
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en'
        },
        status: { 
          privacyStatus: metadata.privacyStatus || 'public',
          selfDeclaredMadeForKids: false
        },
      },
      media: { 
        body: fs.createReadStream(videoPath) 
      },
    }, {
      onUploadProgress: (evt: any) => {
        const progress = Math.round((evt.bytesRead / fileSize) * 100);
        console.log(`⏳ [YouTube Upload - ${workspaceId}]: ${progress}% (${evt.bytesRead} / ${fileSize} bayt)`);
      }
    });

    console.log(`🎉 [YouTube API - ${workspaceId}] Muvaffaqiyatli yuklandi! Video ID: ${res.data.id}`);
    return res.data;
  }

  async getAnalytics(workspaceId: string, accessToken?: string, refreshToken?: string, channelId?: string) {
    const auth = this.getClient(workspaceId, accessToken, refreshToken);
    const analytics = google.youtubeAnalytics({ version: 'v2', auth });
    const res = await analytics.reports.query({
      ids: `channel==MINE`,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained',
      dimensions: 'day',
    });
    return res.data;
  }
}

export class MockYouTubeService implements IYouTubeService {
  getAuthUrl(state?: string) { return 'https://mock.auth.url?state=' + (state || ''); }
  async getToken(code: string) { return { access_token: 'mock_access', refresh_token: 'mock_refresh', expiry_date: 1234567890 }; }
  async getChannelInfo(workspaceId: string) { return { id: 'mock_channel_' + workspaceId, snippet: { title: 'Mock Channel ' + workspaceId }, statistics: { subscriberCount: 100 } }; }
  async uploadVideo(workspaceId: string, videoPath: string, metadata: any) { return { id: 'mock_video_id', snippet: { title: metadata?.title } }; }
  async getAnalytics(workspaceId: string) { return { rows: [['2026-01-01', 100, 200, 120, 50, 10]] }; }
  saveTokens(workspaceId: string, tokens: any) {}
  loadTokens(workspaceId: string) { return { access_token: 'mock_access' }; }
  saveChannelInfo(workspaceId: string, info: any) {}
  loadChannelInfo(workspaceId: string) { return null; }
  isAuthenticated(workspaceId: string) { return true; }
  clearTokens(workspaceId: string) {}
}

export function createYouTubeService(): IYouTubeService {
  if (env.YOUTUBE_CLIENT_ID && env.YOUTUBE_CLIENT_SECRET) {
    return new YouTubeService();
  }
  console.warn('⚠️ No YOUTUBE_CLIENT_ID provided. Using MockYouTubeService.');
  return new MockYouTubeService();
}

export const youtubeService = createYouTubeService();
