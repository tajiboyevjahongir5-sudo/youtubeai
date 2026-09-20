export interface PremiereSchedulePlan {
  contentId: string;
  isPremiereEnabled: boolean;
  scheduledTimeISO: string;
  formattedTashkentTime: string;
  formattedNewYorkTime: string;
  countdownTheme: 'cinematic_scifi' | 'cyberpunk_glitch' | 'minimal_tech' | 'epic_orchestral';
  countdownDurationSeconds: 120;
  audienceNotificationFlow: {
    thirtyMinutesBefore: string;
    twoMinutesCountdown: string;
    premiereLiveBlast: string;
  };
  expectedAudienceMultiplier: string;
  launchChecklist: string[];
}

export class PremiereSchedulerService {
  public getSchedulePlan(contentId: string): PremiereSchedulePlan {
    const now = new Date();
    // Rejalashtirilgan vaqt: bugun yoki ertaga kechki soat 19:00 (Toshkent vaqti) = 10:00 AM Nyu-York
    const scheduledDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    scheduledDate.setHours(19, 0, 0, 0);

    return {
      contentId,
      isPremiereEnabled: true,
      scheduledTimeISO: scheduledDate.toISOString(),
      formattedTashkentTime: `${scheduledDate.toLocaleDateString('uz-UZ')} 19:00 (Toshkent vaqti)`,
      formattedNewYorkTime: `10:00 AM EST (AQSh Tier-1 Faoliyati Cho'qqisi)`,
      countdownTheme: "cinematic_scifi",
      countdownDurationSeconds: 120,
      audienceNotificationFlow: {
        thirtyMinutesBefore: "🔔 YouTube barcha obunachilarga: 'Premyera 30 daqiqadan so'ng boshlanadi!' deb push-bildirishnoma jo'natadi",
        twoMinutesCountdown: "⏳ 2 daqiqalik 4K kiberpank hisoblagich (Countdown) efirga chiqadi va odamlar chatga to'plana boshlaydi",
        premiereLiveBlast: "🚀 Video boshlanadi va dastlabki 10 daqiqada bir vaqtning o'zida yuzlab tomoshabinlar kiradi"
      },
      expectedAudienceMultiplier: "Oddiy yuklashga nisbatan +240% dastlabki 2 soatlik tomoshabinlar oqimi",
      launchChecklist: [
        "16:9 4K AV1 video renderlangan va tayyor",
        "Jonli chat moderatsiyasi va avto-javoblar faollashtirilgan",
        "2 daqiqalik kinematik hisoblagich mavzusi sozlangan",
        "YouTube Studio Scheduled Premiere rejimi tasdiqlangan"
      ]
    };
  }
}

export const premiereSchedulerService = new PremiereSchedulerService();
