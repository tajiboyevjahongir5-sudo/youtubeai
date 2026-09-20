export interface TrendingAudioTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genre: 'Cyberpunk Synth' | 'Tech Minimal' | 'Drill Phonk' | 'Cinematic Future Bass' | 'Lo-Fi Chill';
  viralityIndex: number; // 0 - 100
  shortsUsageCount: string; // e.g. "450K+ Shorts"
  recommendedMood: string;
  youtubeAudioLibraryId: string;
  isCopyrightSafe: boolean;
  duckingLevel: number; // recommended background volume (e.g. 0.12)
}

export interface AudioRadarAnalysis {
  activeTrendingTracks: TrendingAudioTrack[];
  recommendedTrackForTopic: TrendingAudioTrack;
  bpmSyncGuideline: string;
  retentionImpact: string;
}

export class ShortsAudioTrendRadarService {
  private static tracks: TrendingAudioTrack[] = [
    {
      id: 'track_cyber_pulse',
      title: 'Neural Matrix 2026 (Velocity Edit)',
      artist: 'KiberSound Lab',
      bpm: 128,
      genre: 'Cyberpunk Synth',
      viralityIndex: 98,
      shortsUsageCount: '620K+ Shorts',
      recommendedMood: 'Tezkor AI kodlash, yangiliklar va kiberxavfsizlik mavzulari',
      youtubeAudioLibraryId: 'YT-AUDIO-CYBER-9821',
      isCopyrightSafe: true,
      duckingLevel: 0.11
    },
    {
      id: 'track_dark_phonk',
      title: 'Echo Drift (Midnight Tech Rework)',
      artist: 'DriftCore AI',
      bpm: 140,
      genre: 'Drill Phonk',
      viralityIndex: 95,
      shortsUsageCount: '840K+ Shorts',
      recommendedMood: '0-3s Pattern Interrupt va agressiv diqqatni ushlash',
      youtubeAudioLibraryId: 'YT-AUDIO-PHONK-5142',
      isCopyrightSafe: true,
      duckingLevel: 0.09
    },
    {
      id: 'track_minimal_focus',
      title: 'Silicon Horizon (Deep Focus)',
      artist: 'Aura Minimal',
      bpm: 110,
      genre: 'Tech Minimal',
      viralityIndex: 91,
      shortsUsageCount: '310K+ Shorts',
      recommendedMood: 'Batafsil tushuntirish, tutorial va arxitektura tahlili',
      youtubeAudioLibraryId: 'YT-AUDIO-MINIMAL-8120',
      isCopyrightSafe: true,
      duckingLevel: 0.13
    },
    {
      id: 'track_future_bass',
      title: 'Quantum Leap (Sub-Bass Drop)',
      artist: 'Pulsewave',
      bpm: 135,
      genre: 'Cinematic Future Bass',
      viralityIndex: 94,
      shortsUsageCount: '490K+ Shorts',
      recommendedMood: 'Katta modellar, GPU datatsentrlar va kelajak texnologiyalari',
      youtubeAudioLibraryId: 'YT-AUDIO-FUTURE-3319',
      isCopyrightSafe: true,
      duckingLevel: 0.10
    }
  ];

  static getTrendingAudio(topic?: string): AudioRadarAnalysis {
    const selected = this.tracks[0];
    return {
      activeTrendingTracks: this.tracks,
      recommendedTrackForTopic: selected,
      bpmSyncGuideline: `128 BPM ritmda har bir kadr almashuvi t=${(60 / 128).toFixed(2)}s va t=${(120 / 128).toFixed(2)}s da saundtrek ritmiga 100% tushadi.`,
      retentionImpact: '+28% Shorts tavsiyalar lentasida ko\'tarilish tezligi'
    };
  }
}
