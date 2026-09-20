export interface MidrollCue {
  timestamp: string; // e.g. "02:30"
  seconds: number;
  pauseReason: string;
  expectedViewerDropoffRisk: 'low' | 'minimal' | 'zero';
  adFormat: 'skippable_video' | 'bumper_or_non_skippable';
}

export interface MidrollPlan {
  contentId: string;
  totalDurationText: string;
  eligibleForMidrolls: boolean; // >= 8 minutes
  midrollCount: number;
  cues: MidrollCue[];
  estimatedRpmWithoutMidrolls: string;
  estimatedRpmWithMidrolls: string;
  netRevenueMultiplier: string;
  monetizationAdvice: string;
}

export class MidrollAdOptimizerService {
  static getMidrollPlan(contentId: string, durationSec: number = 720): MidrollPlan {
    const isEligible = durationSec >= 480; // 8 minutes = 480s

    const cues: MidrollCue[] = [
      {
        timestamp: "02:30",
        seconds: 150,
        pauseReason: "1-Akt (Hook & Muammo) tugashi, 2-Akt (Arxitektura amaliyoti) boshlanishidagi tabiiy pauza",
        expectedViewerDropoffRisk: 'zero',
        adFormat: 'skippable_video'
      },
      {
        timestamp: "05:15",
        seconds: 315,
        pauseReason: "Asosiy kod generatsiyasi demo tanaffusi va xulosa nuqtasi",
        expectedViewerDropoffRisk: 'minimal',
        adFormat: 'skippable_video'
      },
      {
        timestamp: "08:20",
        seconds: 500,
        pauseReason: "Kutilmagan xatolik tahlili va 4-Akt (Ishlab chiqarishga chiqarish) o'rtasidagi chegara",
        expectedViewerDropoffRisk: 'minimal',
        adFormat: 'skippable_video'
      },
      {
        timestamp: "10:45",
        seconds: 645,
        pauseReason: "Xulosa va yakuniy tavsiyalarga o'tishdan oldingi reklama",
        expectedViewerDropoffRisk: 'low',
        adFormat: 'bumper_or_non_skippable'
      }
    ];

    return {
      contentId,
      totalDurationText: `${Math.floor(durationSec / 60)} daqiqa ${durationSec % 60} soniya`,
      eligibleForMidrolls: isEligible,
      midrollCount: cues.length,
      cues,
      estimatedRpmWithoutMidrolls: "$8.20 RPM (Faqat kirish va chiqish reklamasi)",
      estimatedRpmWithMidrolls: "$22.80 - $26.50 RPM (4x Optimal Mid-Rolls)",
      netRevenueMultiplier: "2.8x - 3.2x Daromad O'sishi",
      monetizationAdvice: "Tabiiy pauza nuqtalariga qo'yilgan reklamalar tomoshabinni bezdirmaydi va videodan olinadigan sof daromadni 3 barobarga oshiradi."
    };
  }
}
