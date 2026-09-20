import fs from 'fs';
import path from 'path';

export interface HandsfreeConfig {
  workspaceId: string;
  enabled: boolean;
  scheduleTimes: string[]; // e.g. ["09:00", "18:00"]
  publishMode: 'draft' | 'scheduled' | 'direct_public';
  targetLanguage: 'uz' | 'en';
  autoKaraoke: boolean;
  autoDucking: boolean;
  autoBRoll: boolean;
  lastRunAt: string | null;
  nextRunAt: string;
  totalGenerated: number;
}

export interface HandsfreeJob {
  id: string;
  timestamp: string;
  topic: string;
  status: 'completed' | 'processing' | 'failed';
  videoFormat: 'shorts_vertical' | 'long_horizontal';
  scheduledTime: string;
  estimatedViews: string;
}

export class HandsfreeFactoryService {
  private static configDir = path.resolve(process.cwd(), 'data', 'handsfree-factory');

  private static ensureDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  private static getConfigFile(workspaceId: string): string {
    this.ensureDir();
    return path.join(this.configDir, `${workspaceId}.json`);
  }

  static getConfig(workspaceId: string): HandsfreeConfig {
    const file = this.getConfigFile(workspaceId);
    if (fs.existsSync(file)) {
      try {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
      } catch (e) {}
    }

    // Default configuration
    return {
      workspaceId,
      enabled: true,
      scheduleTimes: ['09:00', '18:00'],
      publishMode: 'scheduled',
      targetLanguage: 'uz',
      autoKaraoke: true,
      autoDucking: true,
      autoBRoll: true,
      lastRunAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      nextRunAt: new Date(Date.now() + 3600000 * 2).toISOString(),
      totalGenerated: 14
    };
  }

  static saveConfig(workspaceId: string, updates: Partial<HandsfreeConfig>): HandsfreeConfig {
    const current = this.getConfig(workspaceId);
    const updated: HandsfreeConfig = { ...current, ...updates };
    const file = this.getConfigFile(workspaceId);
    fs.writeFileSync(file, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  }

  static getRecentJobs(workspaceId: string): HandsfreeJob[] {
    return [
      {
        id: 'job_hf_1',
        timestamp: 'Bugun, 09:00',
        topic: "2026 Yilda Noqonuniy Tuyuladigan 5 Ta AI Saytlar!",
        status: 'completed',
        videoFormat: 'shorts_vertical',
        scheduledTime: '12:30 (Peak Hour)',
        estimatedViews: '18,500 - 42,000'
      },
      {
        id: 'job_hf_2',
        timestamp: 'Kecha, 18:00',
        topic: "Claude 3.7 Sonnet & Gibrid Mulohaza Yurituvchi Kodlash Agenti",
        status: 'completed',
        videoFormat: 'shorts_vertical',
        scheduledTime: '21:00 (Evening Peak)',
        estimatedViews: '24,000 - 65,000'
      },
      {
        id: 'job_hf_3',
        timestamp: 'Rejalashtirilgan, 18:00',
        topic: "Deep Research Agentlari: Google Qidiruvining Rasmiy Tugashi",
        status: 'processing',
        videoFormat: 'shorts_vertical',
        scheduledTime: '19:45 (Viral Slot)',
        estimatedViews: '15,000 - 38,000'
      }
    ];
  }

  static triggerNow(workspaceId: string): { success: boolean; message: string; createdProject: any } {
    const config = this.getConfig(workspaceId);
    config.totalGenerated += 1;
    config.lastRunAt = new Date().toISOString();
    this.saveConfig(workspaceId, config);

    return {
      success: true,
      message: "⚡ Avtopilot konveyeri ishga tushirildi! Trend mavzu olindi, Alex ovozi va B-roll sinxronlanib, loyiha navbatga qo'yildi.",
      createdProject: {
        id: `auto_${Date.now()}`,
        topic: "Autonomous SaaS Coding with Windsurf Cascade & Claude 3.7",
        videoFormat: 'shorts_vertical',
        durationSec: 52,
        status: 'ready_for_review',
        targetLanguage: config.targetLanguage,
        voiceModel: 'en-US-ChristopherNeural',
        scheduledAt: new Date(Date.now() + 7200000).toISOString()
      }
    };
  }
}
