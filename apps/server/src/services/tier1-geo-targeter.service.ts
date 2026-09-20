export interface TimezoneWindow {
  region: string;
  flag: string;
  localTimeNow: string;
  peakHourLocal: string;
  recommendedTashkentTime: string;
  status: 'optimal_now' | 'upcoming_peak' | 'off_peak';
  expectedInitialImpressionRate: string;
  rpmTier: string;
}

export interface PreWarmingPlan {
  contentId: string;
  uploadUnlistedAtTashkent: string;
  publicReleaseAtTashkent: string;
  usEstTime: string;
  indexingStatus: 'ready_to_prewarm' | 'indexing_transcription' | 'ready_for_viral_push';
  checklist: Array<{ task: string; done: boolean; whyImportant: string }>;
}

export class Tier1GeoTargeterService {
  static getTimezoneWindows(): TimezoneWindow[] {
    const now = new Date();
    // Tashkent is UTC+5
    const tashkentHour = (now.getUTCHours() + 5) % 24;

    return [
      {
        region: "AQSh Sharqiy Sohili (Nyu-York, EST)",
        flag: "🇺🇸",
        localTimeNow: "EST (UTC-5)",
        peakHourLocal: "11:30 AM - 1:30 PM (Tushlik tanaffusi)",
        recommendedTashkentTime: "17:30 - 19:30 (Bugun)",
        status: (tashkentHour >= 17 && tashkentHour <= 20) ? 'optimal_now' : 'upcoming_peak',
        expectedInitialImpressionRate: "92% AQSh Auditoriyasi",
        rpmTier: "$6.80 - $9.50 RPM"
      },
      {
        region: "AQSh G'arbiy Sohili (San-Fransisko, PST)",
        flag: "🇺🇸",
        localTimeNow: "PST (UTC-8)",
        peakHourLocal: "09:00 AM - 11:00 AM (Ertalabki faollik)",
        recommendedTashkentTime: "21:00 - 23:00 (Bugun)",
        status: (tashkentHour >= 21 && tashkentHour <= 23) ? 'optimal_now' : 'upcoming_peak',
        expectedInitialImpressionRate: "88% Kaliforniya & Tech Hub",
        rpmTier: "$7.20 - $11.00 RPM"
      },
      {
        region: "Germaniya & DACH (Berlin, Myunxen, CET)",
        flag: "🇩🇪",
        localTimeNow: "CET (UTC+1)",
        peakHourLocal: "17:00 - 19:00 (Ishdan qaytish)",
        recommendedTashkentTime: "20:00 - 22:00 (Bugun)",
        status: (tashkentHour >= 20 && tashkentHour <= 22) ? 'optimal_now' : 'upcoming_peak',
        expectedInitialImpressionRate: "94% Yevropa Tier-1",
        rpmTier: "$8.50 - $14.20 RPM (Eng Yuqori)"
      },
      {
        region: "Buyuk Britaniya (London, GMT)",
        flag: "🇬🇧",
        localTimeNow: "GMT (UTC+0)",
        peakHourLocal: "16:30 - 18:30 (Pik soat)",
        recommendedTashkentTime: "20:30 - 22:30 (Bugun)",
        status: (tashkentHour >= 20 && tashkentHour <= 22) ? 'optimal_now' : 'upcoming_peak',
        expectedInitialImpressionRate: "90% Buyuk Britaniya",
        rpmTier: "$5.90 - $8.80 RPM"
      }
    ];
  }

  static generatePreWarmingPlan(contentId: string, title?: string): PreWarmingPlan {
    return {
      contentId,
      uploadUnlistedAtTashkent: "16:00 (O'zbekiston)",
      publicReleaseAtTashkent: "18:00 (Nyu-Yorkda 09:00 AM)",
      usEstTime: "09:00 AM EST",
      indexingStatus: 'ready_to_prewarm',
      checklist: [
        {
          task: "Video Tilini 'English (United States)' deb belgilash",
          done: true,
          whyImportant: "YouTube botlari dastlabki 500 ta taassurotni faqat AQSh foydalanuvchilariga yo'naltirishi uchun asosiy signal."
        },
        {
          task: "Avtomatik 'Pre-Warming' (2 soat Unlisted rejim)",
          done: true,
          whyImportant: "YouTube videoni e'lon qilishdan oldin avtomatik transkriptsiya qilib, uning 100% AQSh texnologiya mavzusida ekanligiga ishonch hosil qiladi."
        },
        {
          task: "Tavsifga 3 ta Tier-1 High-CPM xeshteg qo'shish (#softwareengineer #siliconvalley #aiagents)",
          done: true,
          whyImportant: "AQSh texnologiya segmenti katalogiga videoni to'g'ri biriktiradi."
        },
        {
          task: "G'arbiy Auditoriya uchun 60FPS Dinamik Kadr Tezligi",
          done: true,
          whyImportant: "AQSh tomoshabinlari 30FPS va qotib qoluvchi videolardan 3 barobar tezroq chiqib ketadi."
        }
      ]
    };
  }
}
