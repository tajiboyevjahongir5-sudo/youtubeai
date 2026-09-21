import fs from 'fs';
import path from 'path';

export interface AutoPublishSettings {
  enabled: boolean;
  autoPilotEnabled?: boolean;
  approvalMode: 'manual' | 'auto';
  autoGenerateIfEmpty: boolean;
  dailyTarget: number;
  timezone: string;
  publishTimes: string[]; // e.g. ["14:00", "20:00"]
  videoFormat: 'shorts' | 'long_form';
  niche: string;
  subNiches?: string;
  audience?: string;
  englishVariant?: string;
  tone?: string;
  voiceModel?: string;
  autoTitleAbTest?: boolean;
  hostAvatar?: string;
  customHostImage?: string;
  backgroundMusicMood?: string;
  voiceEmotionPreset?: string;
  googleFlowApiKey?: string;
  videoGenerationModel?: string;
}

const getSettingsDirs = () => [
  path.resolve(process.cwd(), 'data/settings'),
  path.resolve(process.cwd(), 'apps/server/data/settings')
];

export function getWorkspaceSettings(workspaceId: string): AutoPublishSettings {
  const dirs = getSettingsDirs();
  for (const d of dirs) {
    const filePath = path.join(d, `${workspaceId}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return {
          enabled: parsed.enabled ?? (parsed.autoPilotEnabled ?? true),
          autoPilotEnabled: parsed.autoPilotEnabled ?? (parsed.enabled ?? true),
          approvalMode: parsed.approvalMode || 'auto',
          autoGenerateIfEmpty: parsed.autoGenerateIfEmpty ?? true,
          dailyTarget: parsed.dailyTarget || 2,
          timezone: parsed.timezone || 'Asia/Tashkent',
          publishTimes: Array.isArray(parsed.publishTimes) && parsed.publishTimes.length > 0 ? parsed.publishTimes : ['14:00', '20:00'],
          videoFormat: parsed.videoFormat || 'shorts',
          niche: parsed.niche || 'AI Tools & Tech 2026',
          subNiches: parsed.subNiches || 'Coding, SaaS, Productivity, Python',
          audience: parsed.audience || 'US, UK, Canada tech professionals',
          englishVariant: parsed.englishVariant || 'us',
          tone: parsed.tone || 'professional',
          voiceModel: parsed.voiceModel || 'en-US-ChristopherNeural',
          autoTitleAbTest: parsed.autoTitleAbTest ?? true,
          hostAvatar: parsed.hostAvatar || 'alex',
          customHostImage: parsed.customHostImage,
          backgroundMusicMood: parsed.backgroundMusicMood || 'neon_pulse',
          voiceEmotionPreset: parsed.voiceEmotionPreset || 'energetic',
          googleFlowApiKey: parsed.googleFlowApiKey || undefined,
          videoGenerationModel: parsed.videoGenerationModel || 'veo-3.1-generate-preview'
        };
      } catch (e) {}
    }
  }

  return {
    enabled: true,
    autoPilotEnabled: true,
    approvalMode: 'auto',
    autoGenerateIfEmpty: true,
    dailyTarget: 2,
    timezone: 'Asia/Tashkent',
    publishTimes: ['14:00', '20:00'],
    videoFormat: 'shorts',
    niche: 'AI Tools & Tech 2026',
    subNiches: 'Coding, SaaS, Productivity, Python',
    audience: 'US, UK, Canada tech professionals',
    englishVariant: 'us',
    tone: 'professional',
    voiceModel: 'en-US-ChristopherNeural',
    autoTitleAbTest: true,
    hostAvatar: 'alex',
    backgroundMusicMood: 'neon_pulse',
    voiceEmotionPreset: 'energetic'
  };
}

export function saveWorkspaceSettings(workspaceId: string, settings: Partial<AutoPublishSettings>): AutoPublishSettings {
  const current = getWorkspaceSettings(workspaceId);
  const updated: AutoPublishSettings = {
    ...current,
    ...settings,
    enabled: settings.autoPilotEnabled !== undefined ? settings.autoPilotEnabled : (settings.enabled !== undefined ? settings.enabled : current.enabled),
    autoPilotEnabled: settings.autoPilotEnabled !== undefined ? settings.autoPilotEnabled : (settings.enabled !== undefined ? settings.enabled : current.autoPilotEnabled)
  };

  const dirs = getSettingsDirs();
  for (const d of dirs) {
    try {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
      const filePath = path.join(d, `${workspaceId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (e) {}
  }
  return updated;
}
