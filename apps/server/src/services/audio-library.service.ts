export interface AudioMoodItem {
  id: string;
  name: string;
  bpm: number;
  energyLevel: 'High' | 'Medium' | 'Calm' | 'Extreme';
  genre: string;
  idealFor: string;
  tags: string[];
  badge: string;
  color: string;
  previewNote: string;
}

export const AUDIO_MOODS: AudioMoodItem[] = [
  {
    id: 'neon_pulse',
    name: '🔥 Neon Pulse (Standart)',
    bpm: 128,
    energyLevel: 'High',
    genre: 'Cyber Electronic Pulse',
    idealFor: 'Neural Pulse AI rasmiy brend saundtreki. Texnologik va nufuzli AI tahlillari.',
    tags: ['ai', 'tech', 'general', 'standard', 'pulse'],
    badge: 'Signature',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400',
    previewNote: '128 BPM • Sub-Bass Drop • Zero-Clipping Ducking'
  },
  {
    id: 'cyberpunk_phonk',
    name: '⚡ Cyberpunk Drift Phonk',
    bpm: 138,
    energyLevel: 'Extreme',
    genre: 'Brazilian / Drift Phonk',
    idealFor: 'Kiberxavfsizlik, "illegal" tuyuladigan saytlar, shoshilinch AI buzilishlar va tezkor hooklar.',
    tags: ['coding', 'hacker', 'illegal', 'urgent', 'phonk', 'drift', 'terminal'],
    badge: 'Viral TikTok #1',
    color: 'from-purple-500/20 to-rose-500/20 border-purple-500/40 text-purple-400',
    previewNote: '138 BPM • Heavy Distorted Bass • Aggressive Snare'
  },
  {
    id: 'dark_synthwave',
    name: '🌌 Dark Synthwave 2026',
    bpm: 118,
    energyLevel: 'Medium',
    genre: 'Retro-Futuristic Synthwave',
    idealFor: 'Chuqur neyron tarmoqlar, sun\'iy aql falsafasi, Linux va kelajak arxitekturasi.',
    tags: ['future', 'dark', 'robotics', 'deepseek', 'synthwave'],
    badge: 'Cinematic',
    color: 'from-indigo-500/20 to-cyan-500/20 border-indigo-500/40 text-indigo-400',
    previewNote: '118 BPM • Analog Arpeggiator • Deep Moog Bass'
  },
  {
    id: 'epic_cinematic',
    name: '🎬 Epic Cinematic Hybrid',
    bpm: 124,
    energyLevel: 'High',
    genre: 'Hybrid Orchestral & Sub-Bass',
    idealFor: 'Global AI poygasi, katta kompaniyalar kurashi va 2026 texnologik inqiloblar.',
    tags: ['revolution', 'epic', 'war', 'agents', 'enterprise'],
    badge: 'High Drama',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400',
    previewNote: '124 BPM • Brass Swells • Massive Impact Boom'
  },
  {
    id: 'lofi_chill',
    name: '☕ Lo-Fi Tech Chill',
    bpm: 92,
    energyLevel: 'Calm',
    genre: 'Chillhop / Lo-Fi Coding Beats',
    idealFor: 'Batafsil kodlash darsliklari, mahsuldorlik maslahatlari va passiv daromad strategiyalari.',
    tags: ['tutorial', 'coding', 'productivity', 'chill', 'lofi'],
    badge: 'Study & Focus',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400',
    previewNote: '92 BPM • Vinyl Crackle • Warm Rhodes Piano'
  }
];

export function getAudioMoods(): AudioMoodItem[] {
  return AUDIO_MOODS;
}

export function matchMoodForTopic(topic: string): AudioMoodItem {
  const t = topic.toLowerCase();
  if (t.includes('illegal') || t.includes('hack') || t.includes('urgent') || t.includes('fast') || t.includes('die')) {
    return AUDIO_MOODS.find(m => m.id === 'cyberpunk_phonk') || AUDIO_MOODS[0];
  }
  if (t.includes('future') || t.includes('agent') || t.includes('deep') || t.includes('death')) {
    return AUDIO_MOODS.find(m => m.id === 'dark_synthwave') || AUDIO_MOODS[0];
  }
  if (t.includes('revolution') || t.includes('billion') || t.includes('epic') || t.includes('war')) {
    return AUDIO_MOODS.find(m => m.id === 'epic_cinematic') || AUDIO_MOODS[0];
  }
  if (t.includes('tutorial') || t.includes('how to') || t.includes('step') || t.includes('beginner')) {
    return AUDIO_MOODS.find(m => m.id === 'lofi_chill') || AUDIO_MOODS[0];
  }
  return AUDIO_MOODS[0];
}
