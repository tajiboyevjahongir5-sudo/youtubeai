export interface RetentionDataPoint {
  second: number;
  retentionPercent: number;
  benchmarkPercent: number;
  status: 'safe' | 'warning' | 'critical';
  sceneTitle?: string;
}

export interface DropOffAlert {
  timestamp: string;
  second: number;
  dropAmount: string;
  zone: string;
  cause: string;
  aiFix: string;
  impact: 'high' | 'medium';
}

export interface VideoRetentionReport {
  contentId: string;
  durationSeconds: number;
  averagePercentageViewed: number; // e.g. 81.2
  retentionScore: number; // e.g. 88
  viralVerdict: string;
  curve: RetentionDataPoint[];
  dropOffAlerts: DropOffAlert[];
  recommendations: string[];
}

export function generateRetentionReport(contentId: string, duration = 56): VideoRetentionReport {
  const curve: RetentionDataPoint[] = [];
  
  // Baseline decay curve algorithm
  let currentVal = 100;
  for (let s = 0; s <= duration; s += 2) {
    let decay = 0;
    if (s === 0) decay = 0;
    else if (s <= 4) decay = 3.5; // initial hook drop
    else if (s <= 14) decay = 0.8; // steady engagement
    else if (s <= 20) decay = 2.2; // mid scene transition
    else if (s <= 44) decay = 0.6; // content delivery
    else decay = 1.4; // outro

    currentVal = Math.max(45, Math.round((currentVal - decay) * 10) / 10);
    
    // Benchmarks for viral Shorts (>80% APV)
    const benchmark = Math.max(55, Math.round((100 - (s * 0.75)) * 10) / 10);

    let status: 'safe' | 'warning' | 'critical' = 'safe';
    if (currentVal < benchmark - 6) status = 'critical';
    else if (currentVal < benchmark - 2) status = 'warning';

    curve.push({
      second: s,
      retentionPercent: currentVal,
      benchmarkPercent: benchmark,
      status
    });
  }

  const avgRetention = Math.round(
    (curve.reduce((acc, p) => acc + p.retentionPercent, 0) / curve.length) * 10
  ) / 10;

  const dropOffAlerts: DropOffAlert[] = [
    {
      timestamp: '0:02',
      second: 2,
      dropAmount: '-8.5%',
      zone: 'Pattern Interrupt & Hook',
      cause: 'Tomoshabin birinchi 2 soniyada vizual qiziqish sezmasa tez o\'tkazib yuboradi.',
      aiFix: 'Qizil neon pill va kuchli sub-drop audio zarbani 0.15s dan boshlang.',
      impact: 'high'
    },
    {
      timestamp: '0:18',
      second: 18,
      dropAmount: '-4.8%',
      zone: '2-Sahna O\'tish Nuqtasi',
      cause: 'Kadr statik holatda 4 soniyadan ko\'proq harakatsiz qolgani sababli e\'tibor pasaygan.',
      aiFix: 'Ken-Burns kamera masshtablash (Zoom-in 1.0 -> 1.08) va oq chiroq (flash transition) qo\'shildi.',
      impact: 'medium'
    },
    {
      timestamp: '0:48',
      second: 48,
      dropAmount: '-6.2%',
      zone: 'Obuna & Yakuniy Outro',
      cause: 'Tomoshabin video tugayotganini his qilganida darhol keyingi Shorts\'ga o\'tib ketadi.',
      aiFix: 'Xulosa o\'rniga munozarali savol bering va videoni birinchi sekundga bevosita tutashtiruvchi loop qiling.',
      impact: 'high'
    }
  ];

  const recommendations = [
    '0-3 soniyada kamera Punch Zoom (1.2x -> 1.05x) harakati ushlab qolishni 14% ga oshiradi.',
    'Orqa fon musiqasini gapirilayotgan soniyalarda -10dB ga pasaytirish (Auto-ducking) diksiyani kristal toza qiladi.',
    'Har 6 soniyada yangi vizual rag\'bat (Terminal animatsiyasi yoki SFX whoosh) berish lozim.'
  ];

  return {
    contentId,
    durationSeconds: duration,
    averagePercentageViewed: avgRetention,
    retentionScore: avgRetention >= 80 ? 94 : (avgRetention >= 70 ? 86 : 72),
    viralVerdict: avgRetention >= 75 ? '🔥 Viral Algoritm Zonasida (APV > 75%)' : '⚠️ O\'rtacha Natija (Optimizatsiya tavsiya etiladi)',
    curve,
    dropOffAlerts,
    recommendations
  };
}
