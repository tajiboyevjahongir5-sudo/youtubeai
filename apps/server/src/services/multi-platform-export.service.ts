import fs from 'fs';
import path from 'path';

export interface PlatformPackage {
  platform: 'youtube_shorts' | 'instagram_reels' | 'tiktok';
  platformName: string;
  badge: string;
  icon: string;
  maxDurationSec: number;
  aspectRatio: string;
  safeZoneMargins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  tailoredTitle: string;
  tailoredDescription: string;
  hashtags: string[];
  ctaCopy: string;
  tips: string[];
}

/**
 * Builds custom multi-platform distribution packages for a video project
 */
export function buildMultiPlatformPackages(content: {
  title: string;
  description: string;
  script?: string;
  videoUrl?: string;
}): Record<string, PlatformPackage> {
  const baseTitle = content.title || 'Top 5 AI Tools in 2026';

  return {
    youtube_shorts: {
      platform: 'youtube_shorts',
      platformName: 'YouTube Shorts',
      badge: 'Asosiy Algoritm',
      icon: 'Youtube',
      maxDurationSec: 60,
      aspectRatio: '9:16 (1080x1920)',
      safeZoneMargins: {
        top: 140,     // Channel & search bar
        bottom: 200,  // Video progress & title
        left: 80,
        right: 120    // Like, comment, share column
      },
      tailoredTitle: `${baseTitle} #Shorts`,
      tailoredDescription: `${content.description}\n\n🔥 Yangi AI vositalari va agentlar haqida har kuni birinchi bo'lib bilish uchun kanalga obuna bo'ling!`,
      hashtags: ['#Shorts', '#AI', '#Tech', '#SuniyIntellekt', '#2026', '#Automation'],
      ctaCopy: "Kanalga obuna bo'ling va qo'ng'iroqchani bosing!",
      tips: [
        "Birinchi 3 soniyada to'xtatuvchi vizual alert (Pattern Interrupt) bo'lishi shart.",
        "Qadalgan izoh (Pinned Comment) orqali munozara boshlang."
      ]
    },
    instagram_reels: {
      platform: 'instagram_reels',
      platformName: 'Instagram Reels',
      badge: '+45% Virallik',
      icon: 'Smartphone',
      maxDurationSec: 90,
      aspectRatio: '9:16 (1080x1920)',
      safeZoneMargins: {
        top: 160,     // Story/reels top header
        bottom: 260,  // Caption, audio track and profile bar
        left: 80,
        right: 130    // Heart, message, share, audio disc
      },
      tailoredTitle: baseTitle,
      tailoredDescription: `🔥 ${baseTitle}\n\nUshbu sun'iy intellekt vositalari bilan 2026 yilda vaqtingizni 10 barobargacha tejang.\n\n👇 Izohlarda "AI" deb yozing, to'liq havolalarni DM'ga yuboramiz!\n\nSaqlab qo'yishni (Save) unutmang 🔖`,
      hashtags: [
        '#reels', '#ai', '#texnologiya', '#foydali', '#dasturlash',
        '#artificialintelligence', '#chatgpt', '#biznes', '#startup',
        '#reelsviral', '#uzbekistan', '#tashkent', '#kelajak', '#ituz', '#automation'
      ],
      ctaCopy: 'Izohlarda "AI" so\'zini qoldiring yoki videoni do\'stlarga ulashing!',
      tips: [
        "Instagramda pastki 260px qismda subtitrlar bo'lmasligi kerak (caption to'sib qo'yadi).",
        "Izoh qoldirishga undovchi 'Comment keyword' triggeri ko'rishlarni 3 barobar oshiradi."
      ]
    },
    tiktok: {
      platform: 'tiktok',
      platformName: 'TikTok',
      badge: 'Eng Tez O\'sish',
      icon: 'Tv',
      maxDurationSec: 60,
      aspectRatio: '9:16 (1080x1920)',
      safeZoneMargins: {
        top: 120,     // Live / Following / FYP tabs
        bottom: 280,  // Username, full caption and audio marquee
        left: 80,
        right: 140    // Profile avatar (+), Like, Comment, Bookmark, Share
      },
      tailoredTitle: baseTitle,
      tailoredDescription: `Buni bilmasdan 2026 yilda qolib ketmang... 🤫 Siz qaysi birini ishlatasiz? #fyp #ai #tech #learnontiktok`,
      hashtags: ['#fyp', '#foryou', '#ai', '#techtok', '#learnontiktok', '#viral', '#uzb', '#secret'],
      ctaCopy: "Profilga kiring va yangi sirlarni o'tkazib yubormang!",
      tips: [
        "O'ng tomondagi tugmalar (Like/Share) matnni to'sib qo'ymasligi uchun yozuvlarni chaproqqa oling.",
        "Trenddagi TikTok fon audio musiqasidan foydalanish videoni 'For You'ga tez chiqaradi."
      ]
    }
  };
}
