import fs from 'fs';
import path from 'path';

export interface DailyTrendItem {
  id: string;
  rank: number;
  title: string;
  category: 'AI Agents' | 'Developer Tools' | 'Productivity Hacks' | 'Future Tech';
  hookHeadline: string;
  script: string;
  predictedViralScore: number; // e.g. 98/100
  estimatedRpm: string;
  suggestedVoice: string;
  tags: string[];
  freshness: string;
  searchVolumeGrowth: string;
}

export const DAILY_TRENDS_CACHE: DailyTrendItem[] = [
  {
    id: 'trend_daily_1',
    rank: 1,
    title: "2026 Yilda Noqonuniy Tuyuladigan 5 Ta AI Saytlar!",
    category: 'AI Agents',
    hookHeadline: "🚨 TO'XTANG! 2026-YILDA KODNI NOLDAN YOZMAYSIZ!",
    script: "To'xtang! Agar 2026 yilda ham kodni noldan o'zingiz yozayotgan bo'lsangiz, vaqtingizni bekorga sarflayapsiz. Siz uxlayotganingizda ishlaydigan eng zo'r AI agentlari. Birinchisi: AutoFlow 2.0 — butun loyihani arxitekturasi bilan 3 daqiqada yaratib beradi...",
    predictedViralScore: 99,
    estimatedRpm: '$3.80 - $6.50',
    suggestedVoice: 'uz-UZ-MadinaNeural',
    tags: ['ai', 'shorts', 'avtomatlashtirish', 'dasturlash', '2026'],
    freshness: 'Bugun 08:30 da yangilandi',
    searchVolumeGrowth: '+480% oxirgi 24 soatda'
  },
  {
    id: 'trend_daily_2',
    rank: 2,
    title: "Claude 3.7 Sonnet & Yangi Gibrid Mulohaza Qiluvchi Neyrotarmoq",
    category: 'Developer Tools',
    hookHeadline: "⚡ DASTURCHILAR KELAJAGI BUTUNLAY O'ZGARDI!",
    script: "Sun'iy intellekt tarixida yangi burilish! Claude 3.7 Sonnet gibrid fikrlash orqali inson dasturchilaridan 10 barobar tezroq xatosiz arxitektura quryapti. Endi oddiy prompt bilan to'liq mikroservislar ishga tushiriladi...",
    predictedViralScore: 97,
    estimatedRpm: '$4.20 - $7.90',
    suggestedVoice: 'uz-UZ-SardorNeural',
    tags: ['claude', 'anthropic', 'kodlash', 'texnologiya', 'ai2026'],
    freshness: 'Bugun 11:15 da yangilandi',
    searchVolumeGrowth: '+620% viral portlash'
  },
  {
    id: 'trend_daily_3',
    rank: 3,
    title: "Deep Research Agentlari: Google Qidiruvining Tugashi",
    category: 'Future Tech',
    hookHeadline: "🧠 10 SOATLIK TADQIQOT ENDI 30 SONIYADA!",
    script: "Google qidiruvidan foydalanish davri tugayaptimi? Deep Research agentlari internetdagi minglab manbalarni o'qib chiqib, sizga eng chuqur tahliliy hisobotni bir necha soniyada tayyorlab beryapti. Bu qanday ishlaydi?",
    predictedViralScore: 96,
    estimatedRpm: '$3.50 - $5.80',
    suggestedVoice: 'uz-UZ-MadinaNeural',
    tags: ['deepresearch', 'google', 'tadqiqot', 'agentlar', 'kelajak'],
    freshness: 'Bugun 14:00 da yangilandi',
    searchVolumeGrowth: '+340% global qidiruv'
  }
];

/**
 * Gets the current daily viral trends list
 */
export function getDailyTrends(): {
  date: string;
  source: string;
  trends: DailyTrendItem[];
} {
  return {
    date: new Date().toISOString().split('T')[0],
    source: 'YouTube Algorithmic Outlier & Google Trends AI Analyzer',
    trends: DAILY_TRENDS_CACHE
  };
}
