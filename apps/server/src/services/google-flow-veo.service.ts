import fs from 'fs';
import path from 'path';
import { env } from '../env';
import { getWorkspaceSettings } from './workspace-settings.service';
import { updateRenderProgress } from './render-progress.service';

export interface GoogleFlowVeoOptions {
  aspectRatio?: '9:16' | '16:9';
  durationSeconds?: number;
  resolution?: '720p' | '1080p';
  model?: string;
}

export class GoogleFlowVeoService {
  private primaryModel = 'veo-3.1-generate-preview';
  private fallbackModel = 'veo-2.0-generate-video';

  /**
   * Get active API key for Google Flow / Veo (from workspace settings or environment)
   */
  public getApiKey(workspaceId: string = 'default'): string | null {
    const ws = getWorkspaceSettings(workspaceId);
    if ((ws as any).googleFlowApiKey && (ws as any).googleFlowApiKey.trim()) {
      const k = (ws as any).googleFlowApiKey.trim();
      // Only treat as Google Flow if explicitly entered by user and not the shared Gemini text key
      if (!k.startsWith('AQ.') && k !== env.GEMINI_API_KEY) {
        return k;
      }
    }
    if (process.env.GOOGLE_FLOW_API_KEY && !process.env.GOOGLE_FLOW_API_KEY.includes('placeholder')) {
      return process.env.GOOGLE_FLOW_API_KEY;
    }
    return null;
  }

  public isConfigured(workspaceId: string = 'default'): boolean {
    return Boolean(this.getApiKey(workspaceId));
  }

  /**
   * Generates a video clip using Google Veo (Google Flow API) if key is present,
   * otherwise uses the built-in neural clip orchestrator.
   */
  public async generateSceneVideo(
    prompt: string,
    outputFile: string,
    workspaceId: string = 'default',
    options: GoogleFlowVeoOptions = {}
  ): Promise<{ success: boolean; videoPath?: string; error?: string }> {
    const apiKey = this.getApiKey(workspaceId);
    const aspect = options.aspectRatio || '9:16';
    const resolution = options.resolution || '720p';
    const model = options.model || this.primaryModel;

    if (!apiKey) {
      console.log(`🤖 [Google Flow / Veo] Kalit kiritilmagan. Avtonom o'rnatilgan neyron dvigateliga o'tilmoqda: "${prompt.slice(0, 45)}..."`);
      return { success: false, error: 'NO_API_KEY' };
    }

    try {
      console.log(`✨ [Google Flow / Veo] Google bulutida AI video generatsiyasi boshlandi (${model}, ${aspect})...`);
      
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${apiKey}`;
      const payload = {
        instances: [
          {
            prompt: prompt
          }
        ],
        parameters: {
          aspectRatio: aspect,
          sampleCount: 1
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 429) {
          console.warn(`⚠️ [Google Flow / Veo] Veo video kvotasi (RESOURCE_EXHAUSTED). Google Veo video generatsiyasi uchun Google Cloud loyihasida to'lov (billing yoki $300 bepul kredit) faollashtirilgan bo'lishi kerak. O'rnatilgan avtonom neyron montajchiga o'tilmoqda...`);
        } else {
          console.warn(`⚠️ [Google Flow / Veo] API so'rovida ogohlantirish (${response.status}): ${errText}`);
        }
        return { success: false, error: errText };
      }

      const operation = (await response.json()) as any;
      const operationName = operation.name;

      if (!operationName) {
        return { success: false, error: 'No operation name returned' };
      }

      // Poll operation until done
      const maxAttempts = 30;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(r => setTimeout(r, 6000));
        
        const pollEndpoint = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`;
        const pollRes = await fetch(pollEndpoint);
        if (!pollRes.ok) continue;

        const pollData = (await pollRes.json()) as any;
        if (pollData.done) {
          if (pollData.error) {
            console.error('❌ [Google Flow / Veo] Operatsiya xatosi:', pollData.error);
            return { success: false, error: pollData.error.message };
          }

          const videoInfo = pollData.response?.generatedVideos?.[0]?.video;
          if (videoInfo && videoInfo.uri) {
            // Download the video
            const videoDownloadRes = await fetch(`${videoInfo.uri}&key=${apiKey}`);
            if (videoDownloadRes.ok) {
              const buffer = Buffer.from(await videoDownloadRes.arrayBuffer());
              fs.writeFileSync(outputFile, buffer);
              console.log(`✅ [Google Flow / Veo] Video muvaffaqiyatli saqlandi: ${outputFile}`);
              return { success: true, videoPath: outputFile };
            }
          }
          break;
        }
      }

      return { success: false, error: 'Veo generation timed out' };
    } catch (err: any) {
      console.error('❌ [Google Flow / Veo] Aloqa xatosi:', err?.message || err);
      return { success: false, error: err?.message || 'Network error' };
    }
  }
}

export const googleFlowVeoService = new GoogleFlowVeoService();
