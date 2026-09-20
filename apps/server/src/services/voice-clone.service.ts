import fs from 'fs';
import path from 'path';

export interface CustomVoiceAvatar {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female';
  baseVoiceModel: string;
  fineTunePitch: string;
  fineTuneRate: string;
  clarityBoost: boolean;
  sampleAudioUrl?: string;
  createdAt: string;
}

const VOICE_CLONES_DIR = path.resolve(process.cwd(), 'data', 'voice-clones');

function ensureDir() {
  if (!fs.existsSync(VOICE_CLONES_DIR)) {
    fs.mkdirSync(VOICE_CLONES_DIR, { recursive: true });
  }
}

/**
 * Saves a custom voice clone profile
 */
export function saveCustomVoice(workspaceId: string, profile: Omit<CustomVoiceAvatar, 'id' | 'createdAt'>): CustomVoiceAvatar {
  ensureDir();
  const id = `voice_${Date.now()}`;
  const avatar: CustomVoiceAvatar = {
    id,
    ...profile,
    createdAt: new Date().toISOString()
  };

  const file = path.join(VOICE_CLONES_DIR, `${workspaceId}_${id}.json`);
  fs.writeFileSync(file, JSON.stringify(avatar, null, 2), 'utf-8');
  return avatar;
}

/**
 * Gets custom voices for workspace
 */
export function getCustomVoices(workspaceId: string): CustomVoiceAvatar[] {
  ensureDir();
  const files = fs.readdirSync(VOICE_CLONES_DIR);
  const prefix = `${workspaceId}_`;
  const list: CustomVoiceAvatar[] = [];

  for (const f of files) {
    if (f.startsWith(prefix) && f.endsWith('.json')) {
      try {
        const raw = fs.readFileSync(path.join(VOICE_CLONES_DIR, f), 'utf-8');
        list.push(JSON.parse(raw));
      } catch {}
    }
  }

  // If none saved yet, return default creator profile
  if (list.length === 0) {
    list.push({
      id: 'voice_default_avatar',
      name: 'Alex Pro Avatar (Neural Pulse AI)',
      language: 'en',
      gender: 'male',
      baseVoiceModel: 'en-US-ChristopherNeural',
      fineTunePitch: '+1Hz',
      fineTuneRate: '+14%',
      clarityBoost: true,
      sampleAudioUrl: '/audio/sample_en-US-ChristopherNeural.mp3',
      createdAt: new Date().toISOString()
    });
  }

  return list;
}
