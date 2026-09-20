export interface ReplayPeakPoint {
  second: number;
  timecode: string;
  topic: string;
  replayIntensity: number; // e.g. 2.4x baseline
  retentionPercent: number; // e.g. 92%
  psychologyReason: string;
  recommendedIntervention: string;
  sfxCue: string;
}

export interface MostReplayedAnalysis {
  contentId: string;
  averageExpectedRetention: number; // e.g. 68%
  peakRetention: number; // e.g. 94%
  overallReplayMultiplier: string; // e.g. "+34% qayta ko'rishlar"
  peaks: ReplayPeakPoint[];
  retentionCurveSummary: {
    hookRetention0To30s: number; // e.g. 88%
    midVideoStability: number; // e.g. 74%
    callToActionRetention: number; // e.g. 65%
  };
}

export class MostReplayedHeatmapService {
  public predictHeatmap(contentId: string, title?: string): MostReplayedAnalysis {
    const peaks: ReplayPeakPoint[] = [
      {
        second: 45,
        timecode: "00:45",
        topic: "Agent Orkestratsiya Arxitekturasi Diagrammasi",
        replayIntensity: 2.3,
        retentionPercent: 91,
        psychologyReason: "Tomoshabinlar murakkab arxitektura chizmasini to'xtatib (pause) daftarga chizib oladi.",
        recommendedIntervention: "Ekranning o'ng tomonida 'Skrinshot oling' mikro-ikonkasi va 'chime' tovushini qo'yish.",
        sfxCue: "sfx_camera_shutter.wav"
      },
      {
        second: 210,
        timecode: "03:30",
        topic: "Docker Sandbox Ichida Xatolikni Qidirish (Debugging)",
        replayIntensity: 2.8,
        retentionPercent: 94,
        psychologyReason: "Dasturchilar kod sintaksisini va konfiguratsiya buyruqlarini aniq ko'rish uchun 10 soniya orqaga qaytaradi.",
        recommendedIntervention: "Kod shriftini 15% kattalashtirish va kritik qatorga neon sariq ramka qo'yish.",
        sfxCue: "sfx_keyboard_typing_hit.wav"
      },
      {
        second: 540,
        timecode: "09:00",
        topic: "Cascade Failure Avto-Tiklanish Lahzasi",
        replayIntensity: 2.1,
        retentionPercent: 88,
        psychologyReason: "Kutilmagan xatodan agentning mustaqil chiqib ketishi hayrat va qiziqish uyg'otadi.",
        recommendedIntervention: "Ekran chetida qizil alert pulsatsiyasi va 'sub-bass drop' tovushini ulash.",
        sfxCue: "sfx_sub_drop.wav"
      },
      {
        second: 820,
        timecode: "13:40",
        topic: "Benchmark & Modellar Taqqoslash Jadvali",
        replayIntensity: 2.5,
        retentionPercent: 92,
        psychologyReason: "GPT-4o vs Claude 3.7 Sonnet vs DeepSeek narx va tezlik taqqosini tahlil qilish uchun pauza qilinadi.",
        recommendedIntervention: "Jadvalni to'liq ekranga yoyish va manbalar havolasini ta'kidlash.",
        sfxCue: "sfx_data_ping.wav"
      }
    ];

    return {
      contentId,
      averageExpectedRetention: 72,
      peakRetention: 94,
      overallReplayMultiplier: "+34% qayta ko'rishlar (Algoritm tavsiyasi keskin oshadi)",
      peaks,
      retentionCurveSummary: {
        hookRetention0To30s: 89,
        midVideoStability: 75,
        callToActionRetention: 68
      }
    };
  }
}

export const mostReplayedHeatmapService = new MostReplayedHeatmapService();
