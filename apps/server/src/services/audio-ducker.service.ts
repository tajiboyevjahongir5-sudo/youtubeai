import fs from 'fs';
import path from 'path';

export interface DuckingProfileSettings {
  mode: 'aggressive_viral' | 'cinematic_podcast' | 'balanced_clean';
  voiceVolume: number;        // e.g. 0.90
  musicVolumeNormal: number;  // e.g. 0.35
  musicVolumeDucked: number;  // e.g. 0.10
  sfxVolume: number;          // e.g. 0.55
  attackMs: number;           // e.g. 150ms
  releaseMs: number;          // e.g. 300ms
  limiterPeakDb: number;      // e.g. -0.98dB
}

export const DUCKING_PRESETS: Record<string, DuckingProfileSettings> = {
  aggressive_viral: {
    mode: 'aggressive_viral',
    voiceVolume: 0.95,
    musicVolumeNormal: 0.38,
    musicVolumeDucked: 0.09,
    sfxVolume: 0.60,
    attackMs: 100,
    releaseMs: 250,
    limiterPeakDb: -0.8
  },
  cinematic_podcast: {
    mode: 'cinematic_podcast',
    voiceVolume: 0.88,
    musicVolumeNormal: 0.28,
    musicVolumeDucked: 0.12,
    sfxVolume: 0.40,
    attackMs: 200,
    releaseMs: 400,
    limiterPeakDb: -1.2
  },
  balanced_clean: {
    mode: 'balanced_clean',
    voiceVolume: 0.90,
    musicVolumeNormal: 0.32,
    musicVolumeDucked: 0.11,
    sfxVolume: 0.50,
    attackMs: 150,
    releaseMs: 320,
    limiterPeakDb: -1.0
  }
};

export interface SfxCuePoint {
  id: string;
  type: 'sub_drop' | 'whoosh' | 'pop' | 'cash_register' | 'glitch' | 'bell';
  timeSec: number;
  label: string;
  volume: number;
  audioFileName: string;
  reason: string;
}

/**
 * Automatically creates a synchronized SFX timeline tailored to the video scenes
 */
export function generateSmartSfxTimeline(
  scenes: Array<{ id: string; time: number; title?: string; tag?: string }>,
  totalDurationSec: number = 50
): SfxCuePoint[] {
  const cues: SfxCuePoint[] = [];

  // 1. Initial 0.15s Pattern Interrupt Sub-drop & fast whoosh
  cues.push({
    id: 'sfx_hook_sub',
    type: 'sub_drop',
    timeSec: 0.15,
    label: 'Deep Sub-bass Drop',
    volume: 0.75,
    audioFileName: 'sub_drop.wav',
    reason: '0-3 soniyalik gipnozli diqqat ushlash (Pattern Interrupt)'
  });

  cues.push({
    id: 'sfx_hook_whoosh',
    type: 'whoosh',
    timeSec: 0.25,
    label: 'Punch Zoom Whoosh',
    volume: 0.55,
    audioFileName: 'whoosh.wav',
    reason: 'Kamera zumi va birinchi ogohlantirish belgisi bilan sinxron'
  });

  // 2. Scene transitions
  (scenes || []).forEach((scene, idx) => {
    if (scene.time > 1 && scene.time < totalDurationSec - 3) {
      cues.push({
        id: `sfx_scene_${idx + 1}`,
        type: idx % 2 === 0 ? 'whoosh' : 'glitch',
        timeSec: scene.time,
        label: `${scene.title || `Sahna ${idx + 1}`} O'tish Tovushi`,
        volume: 0.50,
        audioFileName: idx % 2 === 0 ? 'whoosh.wav' : 'glitch.wav',
        reason: 'Kadr almashinuvi va oq chaqnash (flash cut) bilan sinxron'
      });

      // Additional UI pop for metrics or tools
      if (idx === 1 || idx === 3) {
        cues.push({
          id: `sfx_pop_${idx}`,
          type: 'pop',
          timeSec: scene.time + 1.2,
          label: 'UI Karta Pop Tovushi',
          volume: 0.45,
          audioFileName: 'pop.wav',
          reason: 'Ekranda ilova kartochkasi yoki ko\'rsatkich chiqqanda'
        });
      }
    }
  });

  // 3. Outro CTA Subscribe Bell
  const outroTime = Math.max(totalDurationSec - 5, 45);
  cues.push({
    id: 'sfx_outro_bell',
    type: 'bell',
    timeSec: outroTime,
    label: 'Oltin Qo\'ng\'iroq (Subscribe Bell)',
    volume: 0.65,
    audioFileName: 'bell.wav',
    reason: 'YouTube obuna tugmasi va qo\'ng\'iroqcha animatsiyasi paytida'
  });

  return cues.sort((a, b) => a.timeSec - b.timeSec);
}

/**
 * Calculates ducking timeline points
 */
export function buildDuckingTimeline(
  cues: SfxCuePoint[],
  durationSec: number = 50,
  presetKey: string = 'aggressive_viral'
) {
  const preset = DUCKING_PRESETS[presetKey] || DUCKING_PRESETS.aggressive_viral;

  // Key ducking nodes
  const timelinePoints = [
    { time: 0, musicLevel: preset.musicVolumeNormal, voiceLevel: 0, state: 'intro' },
    { time: 0.8, musicLevel: preset.musicVolumeDucked, voiceLevel: preset.voiceVolume, state: 'speech_active' },
    { time: durationSec - 4, musicLevel: preset.musicVolumeDucked, voiceLevel: preset.voiceVolume, state: 'speech_active' },
    { time: durationSec - 1, musicLevel: preset.musicVolumeNormal, voiceLevel: 0, state: 'outro_swell' },
    { time: durationSec, musicLevel: 0, voiceLevel: 0, state: 'fadeout' }
  ];

  return {
    preset,
    timelinePoints,
    cuesCount: cues.length,
    estimatedPeakDb: preset.limiterPeakDb
  };
}
