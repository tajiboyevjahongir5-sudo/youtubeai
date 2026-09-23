/**
 * Free AI Service — Keyless Free Intelligence for Jpilot
 * Powered by open-source GitHub models & Keyless APIs:
 * - Text/LLM: Pollinations.ai (GPT-4o-mini, Llama 3.3 70B, DeepSeek-V3) — 100% Free, No Key
 * - Image/FLUX: Pollinations.ai (FLUX.1-schnell) — 100% Free, No Key
 * - Voice: edge-tts (Microsoft Azure Neural) — 100% Free, No Key
 */

import fs from 'fs';
import path from 'path';

export class FreeAiService {
  private textApiUrl = 'https://text.pollinations.ai';
  private imageApiUrl = 'https://image.pollinations.ai/prompt';

  /**
   * Generates text using free keyless LLM (GPT-4o-mini / Llama 3.3 / DeepSeek)
   */
  public async generateText(prompt: string, options: { model?: string; systemPrompt?: string; timeoutMs?: number } = {}): Promise<string> {
    const model = options.model || 'openai'; // 'openai' (gpt-4o-mini), 'llama', 'deepseek'
    const timeoutMs = options.timeoutMs || 25000;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const messages: Array<{ role: string; content: string }> = [];
      if (options.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await fetch(`${this.textApiUrl}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Jpilot-AI/1.0'
        },
        body: JSON.stringify({
          messages,
          model,
          seed: Math.floor(Math.random() * 1000000),
          jsonMode: prompt.toLowerCase().includes('json')
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        // Fallback to GET method
        const encodedPrompt = encodeURIComponent(prompt.slice(0, 500));
        const getRes = await fetch(`${this.textApiUrl}/${encodedPrompt}?model=${model}`, {
          signal: controller.signal
        });
        if (getRes.ok) {
          return await getRes.text();
        }
        throw new Error(`Pollinations API error: ${response.status} ${response.statusText}`);
      }

      return await response.text();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Free AI request timed out');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Generates high-quality AI images using FLUX.1 (Keyless, 100% Free)
   */
  public async generateFluxImage(
    prompt: string,
    outputPath: string,
    options: { width?: number; height?: number; seed?: number } = {}
  ): Promise<string> {
    const width = options.width || 1080;
    const height = options.height || 1920;
    const seed = options.seed || Math.floor(Math.random() * 1000000);

    const cleanPrompt = encodeURIComponent(
      prompt.replace(/[^\w\s,.-]/gi, ' ').trim().slice(0, 300)
    );

    const imageUrl = `${this.imageApiUrl}/${cleanPrompt}?model=flux&width=${width}&height=${height}&seed=${seed}&nologo=true`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 40000);

    try {
      const res = await fetch(imageUrl, {
        headers: { 'User-Agent': 'Jpilot-Studio/1.0' },
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error(`FLUX image generation failed: ${res.status}`);
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, buffer);
      return outputPath;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const freeAiService = new FreeAiService();
