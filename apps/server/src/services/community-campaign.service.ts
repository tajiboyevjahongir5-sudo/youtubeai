export interface CommunityPost {
  phase: 'pre_launch_24h' | 'launch_hour' | 'followup_48h';
  phaseTitle: string;
  timingNotice: string;
  type: 'poll' | 'image_post' | 'discussion';
  headline: string;
  bodyText: string;
  pollOptions?: string[];
  suggestedImagePrompt?: string;
  targetObjective: string;
  expectedImpressionBoost: string;
}

export interface CommunityCampaignPackage {
  contentId: string;
  videoTitle: string;
  campaignStatus: 'ready' | 'scheduled';
  totalPosts: number;
  expectedInitialVelocityBoost: string;
  posts: CommunityPost[];
}

export class CommunityCampaignService {
  public generateCampaign(contentId: string, videoTitle?: string): CommunityCampaignPackage {
    const title = videoTitle || "Autonomous AI Agents 2026: Production Masterclass";

    const posts: CommunityPost[] = [
      {
        phase: "pre_launch_24h",
        phaseTitle: "24 Soat Oldin: Intizorlik So'rovnomasi (Pre-Launch Poll)",
        timingNotice: "Video chiqishidan 24 soat oldin (YouTube obunachilarni faollashtirish)",
        type: "poll",
        headline: "Ertaga kanalimizda 12 daqiqalik yirik AI Masterclass chiqmoqda! 🔥",
        bodyText: "Biz to'liq mustaqil AI Agentlarni Docker va TypeScriptda noldan quramiz. Sizningcha, ushbu agent eng birinchi qaysi vazifani avtomatik yechishi kerak?",
        pollOptions: [
          "1. To'liq veb-saytni skanerlab tahlil qilish",
          "2. Kod yozib, xatosini o'zi tuzatish (Self-healing)",
          "3. Moliyaviy bozorlar ma'lumotlarini saralash",
          "4. Barcha 3 tasini birdaniga sinab ko'rish 🚀"
        ],
        targetObjective: "Obunachilarning 15-20% ini post orqali uyg'otib, videoning premyerasi uchun qiziqish uyg'otish",
        expectedImpressionBoost: "+25,000 - +50,000 oldindan faollik"
      },
      {
        phase: "launch_hour",
        phaseTitle: "Premyera Soati: Jonli Anons & Rasm Posti (Launch Hour Blast)",
        timingNotice: "Video premyerasi boshlangan birinchi daqiqalarda",
        type: "image_post",
        headline: "YANGI MASTERCLASS CHIQDI: Autonomous AI Agents 2026! 🚀",
        bodyText: `Nega 90% sun'iy idrok agentlari ishlab chiqarishda qulaydi? O'z xatosini o'zi tuzatuvchi tizimni qanday qurish mumkin?

To'liq 12 daqiqalik amaliy masterclass hoziroq kanalda! Barcha Docker fayllar va manba kodlari GitHub'da ochiq.

👉 Videoni hoziroq tomosha qiling va birinchi 100 ta izohga shaxsan javob beraman!`,
        suggestedImagePrompt: "High contrast YouTube Community banner, neon cyberpunk theme, Host Alex holding holographic terminal, text 'OUT NOW: PRODUCTION MASTERCLASS'",
        targetObjective: "Dastlabki 2 soat ichida (Velocity) maksimal kliklar va ko'rishlar oqimini yaratish",
        expectedImpressionBoost: "Algoritm tavsiyasiga chiqish tezligini 3 barobarga oshiradi"
      },
      {
        phase: "followup_48h",
        phaseTitle: "48 Soat Keyin: Natijalar & Bahs So'rovnomasi (Sustained Momentum)",
        timingNotice: "Video chiqqanidan 2 kun o'tgach (Ikkinchi to'lqinni uyg'otish)",
        type: "discussion",
        headline: "Oxirgi masterclassimizdagi kodni sinab ko'rdingizmi? 💡",
        bodyText: "GitHub repozitoriyamizdagi self-healing kodni ishga tushirgan dasturchilar qanday natija oldi? Qaysi qismi siz uchun eng qiyin yoki qiziq bo'ldi? Fikrlaringiz asosida keyingi 2-qismni rejalashtiramiz!",
        pollOptions: [
          "O'rnatdim, Docker sandbox a'lo darajada ishladi!",
          "Xatolik yuz berdi, izohda savolim bor",
          "Hali ko'rmadim, bugun kechqurun ko'raman",
          "2-qismni (Kubernetes deploy) kutyapman 🔥"
        ],
        targetObjective: "Eski videoga yangi tomoshabinlar jalb qilib, tomosha egri chizig'ini (Retention Curve) tushib ketishdan saqlash",
        expectedImpressionBoost: "+30% doimiy (evergreen) ko'rishlar oqimi"
      }
    ];

    return {
      contentId,
      videoTitle: title,
      campaignStatus: "ready",
      totalPosts: posts.length,
      expectedInitialVelocityBoost: "Dastlabki 24 soat ichida +180% ko'proq tomoshabinlar jalb etiladi",
      posts
    };
  }
}

export const communityCampaignService = new CommunityCampaignService();
