export interface LiveStreamQueueItem {
  id: string;
  title: string;
  durationSec: number;
  format: '16:9' | '9:16_shorts_loop';
  viewsBonus: string;
}

export interface LiveStreamStatus {
  isStreaming: boolean;
  streamTitle: string;
  streamMode: '24_7_loop' | 'scheduled_premiere' | 'offline';
  rtmpServer: string;
  streamKeyMasked: string;
  activeViewersSimulated: number;
  totalLiveHours: number;
  watchTimeBoostMultiplier: string;
  playlistQueue: LiveStreamQueueItem[];
  streamHealth: 'excellent' | 'good' | 'reconnecting';
}

export class LiveStreamSchedulerService {
  private static status: LiveStreamStatus = {
    isStreaming: true,
    streamTitle: "🔴 24/7 Neural Pulse AI Radio — Autonomous Coding & Future Tech Masterclass Loop",
    streamMode: '24_7_loop',
    rtmpServer: "rtmp://a.rtmp.youtube.com/live2",
    streamKeyMasked: "yt-stream-live-••••••••••••-np2026",
    activeViewersSimulated: 184,
    totalLiveHours: 72.4,
    watchTimeBoostMultiplier: "3.4x Doimiy Tomosha Soatlari",
    streamHealth: 'excellent',
    playlistQueue: [
      {
        id: 'stream_vid_1',
        title: "Autonomous Coding in 2026: Complete 16:9 Blueprint",
        durationSec: 702,
        format: '16:9',
        viewsBonus: '+3.2K ko\'rish/aylana'
      },
      {
        id: 'stream_vid_2',
        title: "5 AI Websites That Feel Illegal to Know in 2026 (Extended)",
        durationSec: 420,
        format: '16:9',
        viewsBonus: '+4.8K ko\'rish/aylana'
      },
      {
        id: 'stream_vid_3',
        title: "Top 5 AI Tools That Work While You Sleep (Shorts Loop)",
        durationSec: 180,
        format: '9:16_shorts_loop',
        viewsBonus: '+2.1K ko\'rish/aylana'
      }
    ]
  };

  static getLiveStreamStatus(): LiveStreamStatus {
    return this.status;
  }

  static toggleStreaming(enable: boolean, customTitle?: string): LiveStreamStatus {
    this.status.isStreaming = enable;
    if (customTitle) {
      this.status.streamTitle = customTitle;
    }
    return this.status;
  }
}
