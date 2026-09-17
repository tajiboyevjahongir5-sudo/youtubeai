import { google, youtube_v3 } from 'googleapis';
import { env } from '../env';
import fs from 'fs';
import path from 'path';

export interface IYouTubeService {
  getAuthUrl(): string;
  getToken(code: string): Promise<any>;
  getChannelInfo(accessToken?: string, refreshToken?: string): Promise<any>;
  uploadVideo(videoPath: string, metadata: any, accessToken?: string, refreshToken?: string): Promise<any>;
  getAnalytics(accessToken?: string, refreshToken?: string, channelId?: string): Promise<any>;
  saveTokens(tokens: any): void;
  loadTokens(): any;
  saveChannelInfo(info: any): void;
  loadChannelInfo(): any;
  isAuthenticated(): boolean;
  clearTokens(): void;
}

export class YouTubeService implements IYouTubeService {
  private tokenPath: string;
  private backupTokenPath: string;
  private channelPath: string;

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        // ignore
      }
    }
    this.tokenPath = path.join(dataDir, 'youtube_token.json');
    this.backupTokenPath = 'C:\\Users\\user\\Downloads\\youtube_tokens.json';
    this.channelPath = path.join(dataDir, 'youtube_channel.json');
  }

  saveTokens(tokens: any) {
    try {
      const existing = this.loadTokens() || {};
      const merged = { ...existing, ...tokens, savedAt: new Date().toISOString() };
      
      const dir = path.dirname(this.tokenPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.tokenPath, JSON.stringify(merged, null, 2), 'utf-8');
      try {
        fs.writeFileSync(this.backupTokenPath, JSON.stringify(merged, null, 2), 'utf-8');
      } catch (be) {}
      console.log('✅ YouTube OAuth tokenlari muvaffaqiyatli saqlandi:', this.tokenPath);
    } catch (e) {
      console.error('❌ Tokenni faylga saqlashda xatolik:', e);
    }
  }

  loadTokens(): any {
    try {
      if (fs.existsSync(this.tokenPath)) {
        const data = fs.readFileSync(this.tokenPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {}

    try {
      if (fs.existsSync(this.backupTokenPath)) {
        const data = fs.readFileSync(this.backupTokenPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (e) {}

    return null;
  }

  saveChannelInfo(info: any) {
    try {
      const dir = path.dirname(this.channelPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.channelPath, JSON.stringify(info, null, 2), 'utf-8');
    } catch (e) {
      console.error('❌ Kanal ma\'lumotlarini saqlashda xatolik:', e);
    }
  }

  loadChannelInfo(): any {
    try {
      if (fs.existsSync(this.channelPath)) {
        return JSON.parse(fs.readFileSync(this.channelPath, 'utf-8'));
      }
    } catch (e) {}
    return null;
  }

  isAuthenticated(): boolean {
    const tokens = this.loadTokens();
    return !!(tokens && (tokens.access_token || tokens.refresh_token));
  }

  clearTokens(): void {
    try {
      if (fs.existsSync(this.tokenPath)) fs.unlinkSync(this.tokenPath);
      if (fs.existsSync(this.backupTokenPath)) fs.unlinkSync(this.backupTokenPath);
      if (fs.existsSync(this.channelPath)) fs.unlinkSync(this.channelPath);
    } catch (e) {}
  }

  getClient(accessToken?: string, refreshToken?: string) {
    const oauth2Client = new google.auth.OAuth2(
      env.YOUTUBE_CLIENT_ID,
      env.YOUTUBE_CLIENT_SECRET,
      env.YOUTUBE_REDIRECT_URI
    );

    const storedTokens = this.loadTokens();
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
      console.log('🔄 YouTube tokenlari yangilandi, faylga yozilmoqda...');
      this.saveTokens(newTokens);
    });

    return oauth2Client;
  }

  getAuthUrl() {
    const client = new google.auth.OAuth2(
      env.YOUTUBE_CLIENT_ID,
      env.YOUTUBE_CLIENT_SECRET,
      env.YOUTUBE_REDIRECT_URI
    );
    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
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

  async getChannelInfo(accessToken?: string, refreshToken?: string) {
    const auth = this.getClient(accessToken, refreshToken);
    const youtube = google.youtube({ version: 'v3', auth });
    const response = await youtube.channels.list({ part: ['snippet', 'statistics'], mine: true });
    return response.data.items?.[0];
  }

  async uploadVideo(videoPath: string, metadata: any, accessToken?: string, refreshToken?: string) {
    const auth = this.getClient(accessToken, refreshToken);
    const youtube = google.youtube({ version: 'v3', auth });
    
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video fayli topilmadi: ${videoPath}`);
    }

    const fileSize = fs.statSync(videoPath).size;
    console.log(`📤 [YouTube API] Yuklash boshlanmoqda: ${videoPath} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);
    console.log(`🎬 [YouTube API] Sarlavha: "${metadata.title}"`);

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
        console.log(`⏳ [YouTube Upload]: ${progress}% (${evt.bytesRead} / ${fileSize} bayt)`);
      }
    });

    console.log(`🎉 [YouTube API] Muvaffaqiyatli yuklandi! Video ID: ${res.data.id}`);
    return res.data;
  }

  async getAnalytics(accessToken?: string, refreshToken?: string, channelId?: string) {
    const auth = this.getClient(accessToken, refreshToken);
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
  getAuthUrl() { return 'https://mock.auth.url'; }
  async getToken(code: string) { return { access_token: 'mock_access', refresh_token: 'mock_refresh', expiry_date: 1234567890 }; }
  async getChannelInfo() { return { id: 'mock_channel_id', snippet: { title: 'Mock Channel' }, statistics: { subscriberCount: 100 } }; }
  async uploadVideo(videoPath: string, metadata: any) { return { id: 'mock_video_id', snippet: { title: metadata?.title } }; }
  async getAnalytics() { return { rows: [['2026-01-01', 100, 200, 120, 50, 10]] }; }
  saveTokens() {}
  loadTokens() { return { access_token: 'mock_access' }; }
  saveChannelInfo() {}
  loadChannelInfo() { return null; }
  isAuthenticated() { return true; }
  clearTokens() {}
}

export function createYouTubeService(): IYouTubeService {
  if (env.YOUTUBE_CLIENT_ID && env.YOUTUBE_CLIENT_SECRET) {
    return new YouTubeService();
  }
  console.warn('⚠️ No YOUTUBE_CLIENT_ID provided. Using MockYouTubeService.');
  return new MockYouTubeService();
}

export const youtubeService = createYouTubeService();
