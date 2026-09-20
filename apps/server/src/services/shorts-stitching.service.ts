import fs from 'fs';
import path from 'path';

export interface StitchedChapter {
  id: string;
  timestamp: string; // e.g. "01:15"
  second: number;
  title: string;
  sourceShortId?: string;
  summary: string;
  transitionEffect: 'cinematic_fade' | 'glitch_zoom' | 'flash_cut';
}

export interface StitchedLongFormProject {
  id: string;
  title: string;
  durationFormatted: string; // e.g. "11:20"
  durationSec: number;
  aspectRatio: '16:9 (Landscape 1080p)';
  introScript: string;
  outroScript: string;
  chapters: StitchedChapter[];
  fullDescription: string;
  predictedWatchTimeHours: number;
  predictedRpm: string;
}

/**
 * Compiles a series of Shorts into a cohesive 16:9 Long-Form project
 */
export function stitchShortsToLongForm(params: {
  shortsList: Array<{ id: string; title: string; script?: string }>;
  customTheme?: string;
}): StitchedLongFormProject {
  const shorts = params.shortsList.slice(0, 5);
  const theme = params.customTheme || 'Autonomous AI Software & Coding in 2026';

  let currentSec = 75; // 1m15s intro
  const chapters: StitchedChapter[] = [
    {
      id: 'ch_intro',
      timestamp: '00:00',
      second: 0,
      title: '1. The Paradigm Shift (AI Inqilobi Kirish)',
      summary: 'Dasturchilar va IT sohasining 2026 yildagi tub burilishi',
      transitionEffect: 'cinematic_fade'
    }
  ];

  shorts.forEach((item, idx) => {
    const min = Math.floor(currentSec / 60);
    const sec = currentSec % 60;
    const ts = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

    chapters.push({
      id: `ch_${item.id || idx + 1}`,
      timestamp: ts,
      second: currentSec,
      title: `${idx + 2}. ${item.title.replace(/#\w+/g, '').trim()}`,
      sourceShortId: item.id,
      summary: `Amaliy tahlil va chuqur arxitektura tushuntirilishi`,
      transitionEffect: idx % 2 === 0 ? 'glitch_zoom' : 'flash_cut'
    });

    currentSec += 110; // ~1m50s deep dive per chapter
  });

  const outroMin = Math.floor(currentSec / 60);
  const outroSec = currentSec % 60;
  chapters.push({
    id: 'ch_outro',
    timestamp: `${String(outroMin).padStart(2, '0')}:${String(outroSec).padStart(2, '0')}`,
    second: currentSec,
    title: `${chapters.length + 1}. Xulosa & 2027 Yilgi Bashorat`,
    summary: 'Xulosa, strategik xulosa va keyingi qadamlar',
    transitionEffect: 'cinematic_fade'
  });

  currentSec += 45; // outro duration

  const totalMin = Math.floor(currentSec / 60);
  const totalSec = currentSec % 60;
  const durationFormatted = `${String(totalMin).padStart(2, '0')}:${String(totalSec).padStart(2, '0')}`;

  const fullDescription = `🔥 ${theme} — To'liq Hujjatli Qo'llanma (2026)\n\nUshbu 16:9 yirik videoda 2026 yilda dasturchilar va kompaniyalar ishini 10 barobarga tezlashtiruvchi eng kuchli sun'iy intellekt tizimlari bir joyga jamlangan.\n\n⏱️ BOB VA TIMESTAMP VAQTLARI:\n${chapters.map(c => `${c.timestamp} - ${c.title}`).join('\n')}\n\nKanalga obuna bo'ling va qo'ng'iroqchani bosing!`;

  return {
    id: `long_${Date.now()}`,
    title: `The Complete Guide to ${theme} (10x Developer Blueprint)`,
    durationFormatted,
    durationSec: currentSec,
    aspectRatio: '16:9 (Landscape 1080p)',
    introScript: "Welcome to the definitive breakdown of modern autonomous AI software. Today, we are connecting the dots across the five breakthrough engines that are completely redefining how applications are built...",
    outroScript: "The developers who master these autonomous workflows today will lead the technology companies of tomorrow. Which tool will you adopt first? Subscribe and see you in the next masterclass.",
    chapters,
    fullDescription,
    predictedWatchTimeHours: 1420,
    predictedRpm: '$6.50 - $11.80'
  };
}
