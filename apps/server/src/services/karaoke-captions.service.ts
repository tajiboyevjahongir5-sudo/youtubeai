import fs from 'fs';
import path from 'path';

export type KaraokeStyleId = 'hormozi' | 'cyber_neon' | 'minimal_tech' | 'impact_bold';

export interface KaraokeStyleConfig {
  id: KaraokeStyleId;
  name: string;
  tagline: string;
  fontFamily: string;
  activeColor: string;
  inactiveColor: string;
  outlineColor: string;
  glowColor?: string;
  badge: string;
  animation: 'pop_bounce' | 'neon_glow' | 'fade_slide' | 'zoom_punch';
}

export const KARAOKE_STYLES: KaraokeStyleConfig[] = [
  {
    id: 'hormozi',
    name: 'Alex Hormozi Clean',
    tagline: 'Yorqin sariq so\'z, to\'q fon konturi va sakrash effekti',
    fontFamily: 'Montserrat Black / Arial Black',
    activeColor: '#FFE600',
    inactiveColor: '#FFFFFF',
    outlineColor: '#000000',
    glowColor: 'rgba(255, 230, 0, 0.4)',
    badge: '🔥 Shorts 1-O\'rin',
    animation: 'pop_bounce'
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Neon Glow',
    tagline: 'Moviy va elektr pushti neon nurli futuristik yozuv',
    fontFamily: 'Segoe UI Bold / Impact',
    activeColor: '#00F0FF',
    inactiveColor: '#E0E7FF',
    outlineColor: '#0A0A1E',
    glowColor: 'rgba(0, 240, 255, 0.7)',
    badge: '⚡ Tech & AI',
    animation: 'neon_glow'
  },
  {
    id: 'minimal_tech',
    name: 'Minimalist Silicon Valley',
    tagline: 'Sodda, oqlangan oq-qora kontrastli zamonaviy estetika',
    fontFamily: 'Inter / Helvetica Neue',
    activeColor: '#FFFFFF',
    inactiveColor: 'rgba(255, 255, 255, 0.45)',
    outlineColor: '#18181B',
    glowColor: 'rgba(255, 255, 255, 0.2)',
    badge: '💎 Premium SaaS',
    animation: 'fade_slide'
  },
  {
    id: 'impact_bold',
    name: 'Impact Punch Alert',
    tagline: 'Qizil/alvon ogohlantiruvchi kuchli gipnozli sarlavhalar',
    fontFamily: 'Impact / Arial Black',
    activeColor: '#FF2A55',
    inactiveColor: '#FEE2E2',
    outlineColor: '#000000',
    glowColor: 'rgba(255, 42, 85, 0.6)',
    badge: '🚨 Viral Pattern',
    animation: 'zoom_punch'
  }
];

export interface WordToken {
  word: string;
  startMs: number;
  endMs: number;
  isKeyword: boolean;
  highlightColor?: string;
}

export interface CaptionSegment {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  words: WordToken[];
}

const KEYWORD_PATTERNS = [
  /\b(ai|sun'iy|intellekt|agent|agentlar|2026|100%|bepul|sir|noqonuniy|inqilob|avtomat|avtomatlashtirish|pul|daromad|stop|to'xtang|diqqat|muhim)\b/i,
  /\b(free|illegal|secret|money|future|chatgpt|deepseek|claude|gemini|breakthrough)\b/i
];

/**
 * Parses a script and generates precise millisecond-level word timings
 */
export function generateKaraokeTimings(
  script: string,
  styleId: KaraokeStyleId = 'hormozi',
  totalDurationSec: number = 50
): {
  style: KaraokeStyleConfig;
  segments: CaptionSegment[];
  totalWords: number;
  wordsPerMinute: number;
} {
  const style = KARAOKE_STYLES.find(s => s.id === styleId) || KARAOKE_STYLES[0];
  const cleanedScript = script.replace(/\s+/g, ' ').trim();
  const sentences = cleanedScript
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 0);

  const allWords = cleanedScript.split(/\s+/).filter(w => w.length > 0);
  const totalWords = allWords.length || 1;
  const wordsPerMinute = Math.round((totalWords / (totalDurationSec || 50)) * 60);

  const msPerWord = (totalDurationSec * 1000) / totalWords;
  let currentMs = 400; // Small intro delay for pattern interrupt

  const segments: CaptionSegment[] = [];

  // Break into bite-sized segments (3-6 words per line for high shorts retention)
  let wordIdx = 0;
  let segmentId = 1;

  while (wordIdx < allWords.length) {
    // 3 to 5 words per flash card
    const chunkSize = Math.min(allWords.length - wordIdx, wordIdx % 2 === 0 ? 4 : 5);
    const chunkWords = allWords.slice(wordIdx, wordIdx + chunkSize);
    const segmentStartMs = currentMs;

    const words: WordToken[] = chunkWords.map((rawWord) => {
      const cleanWord = rawWord.trim();
      const startMs = currentMs;
      const endMs = currentMs + msPerWord * 0.95;
      currentMs += msPerWord;

      const isKeyword = KEYWORD_PATTERNS.some(rx => rx.test(cleanWord));
      let highlightColor: string | undefined = undefined;

      if (isKeyword) {
        highlightColor = style.id === 'cyber_neon' ? '#00FF9D' : (style.id === 'impact_bold' ? '#FFE600' : '#00F0FF');
      }

      return {
        word: cleanWord,
        startMs: Math.round(startMs),
        endMs: Math.round(endMs),
        isKeyword,
        highlightColor
      };
    });

    const segmentEndMs = currentMs;

    segments.push({
      id: `seg_${segmentId++}`,
      startMs: Math.round(segmentStartMs),
      endMs: Math.round(segmentEndMs),
      text: chunkWords.join(' '),
      words
    });

    wordIdx += chunkSize;
    currentMs += 100; // brief natural pause between phrases
  }

  return {
    style,
    segments,
    totalWords,
    wordsPerMinute
  };
}

/**
 * Exports karaoke timings to standard SRT or ASS format
 */
export function exportSubtitleFormat(
  segments: CaptionSegment[],
  format: 'srt' | 'vtt' | 'ass' = 'srt'
): string {
  if (format === 'vtt') {
    let out = 'WEBVTT\n\n';
    segments.forEach((seg, idx) => {
      const formatTime = (ms: number) => {
        const d = new Date(ms);
        return d.toISOString().substr(11, 12);
      };
      out += `${idx + 1}\n${formatTime(seg.startMs)} --> ${formatTime(seg.endMs)}\n${seg.text}\n\n`;
    });
    return out;
  }

  if (format === 'ass') {
    let out = `[Script Info]
Title: Neural Pulse AI Karaoke Captions
ScriptType: v4.00+
Collisions: Normal
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: KaraokeHormozi,Arial Black,48,&H00FFFFFF,&H0000E6FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,2,2,80,80,480,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
    segments.forEach((seg) => {
      const toAssTime = (ms: number) => {
        const hours = Math.floor(ms / 3600000);
        const mins = Math.floor((ms % 3600000) / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        const centis = Math.floor((ms % 1000) / 10);
        return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
      };

      const karaokeText = seg.words.map(w => {
        const durCenti = Math.round((w.endMs - w.startMs) / 10);
        return `{\\k${durCenti}}${w.word}`;
      }).join(' ');

      out += `Dialogue: 0,${toAssTime(seg.startMs)},${toAssTime(seg.endMs)},KaraokeHormozi,,0,0,0,,${karaokeText}\n`;
    });
    return out;
  }

  // Default SRT
  let srt = '';
  segments.forEach((seg, idx) => {
    const toSrtTime = (ms: number) => {
      const hours = Math.floor(ms / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      const secs = Math.floor((ms % 60000) / 1000);
      const millis = ms % 1000;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
    };
    srt += `${idx + 1}\n${toSrtTime(seg.startMs)} --> ${toSrtTime(seg.endMs)}\n${seg.text}\n\n`;
  });
  return srt;
}
