import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { contentStore, ContentItemRecord } from './content-store.service';

import { getWorkspaceSettings } from './workspace-settings.service';

export class VideoRenderService {
  private getScriptPath(): string {
    const candidates = [
      path.resolve(__dirname, '../../scripts/render_topic_video.py'),
      path.resolve(__dirname, '../scripts/render_topic_video.py'),
      path.resolve(process.cwd(), 'apps/server/scripts/render_topic_video.py'),
      path.resolve(process.cwd(), 'scripts/render_topic_video.py')
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    return candidates[0];
  }

  private getPublicVideosDir(): string {
    const candidates = [
      path.resolve(__dirname, '../../public/videos'),
      path.resolve(__dirname, '../public/videos'),
      path.resolve(process.cwd(), 'apps/server/public/videos'),
      path.resolve(process.cwd(), 'public/videos')
    ];
    for (const c of candidates) {
      if (fs.existsSync(path.dirname(c))) {
        if (!fs.existsSync(c)) fs.mkdirSync(c, { recursive: true });
        return c;
      }
    }
    if (!fs.existsSync(candidates[0])) fs.mkdirSync(candidates[0], { recursive: true });
    return candidates[0];
  }

  private getWebVideosDir(): string | null {
    const candidates = [
      path.resolve(__dirname, '../../../web/public/videos'),
      path.resolve(process.cwd(), 'apps/web/public/videos'),
      path.resolve(process.cwd(), '../web/public/videos')
    ];
    for (const c of candidates) {
      if (fs.existsSync(path.dirname(c))) {
        if (!fs.existsSync(c)) {
          try { fs.mkdirSync(c, { recursive: true }); } catch (e) {}
        }
        return c;
      }
    }
    return null;
  }

  public async renderVideo(item: ContentItemRecord): Promise<{ success: boolean; videoUrl: string; duration: number }> {
    const publicVideosDir = this.getPublicVideosDir();
    const webVideosDir = this.getWebVideosDir();
    const scriptPath = this.getScriptPath();

    const videoFileName = `${item.id}.mp4`;
    const outputPath = path.join(publicVideosDir, videoFileName);

    // Create temp input json
    const tempInputPath = path.join(publicVideosDir, `temp_${item.id}.json`);
    fs.writeFileSync(tempInputPath, JSON.stringify(item, null, 2), 'utf-8');

    console.log(`🎬 Starting dynamic video render for "${item.title}" [${item.id}] using script ${scriptPath}...`);

    return new Promise((resolve) => {
      // Cross-platform python executable
      const pythonBin = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');

      const wsSettings = getWorkspaceSettings(item.workspaceId || 'default');
      const voiceModel = (item as any).voiceModel || wsSettings.voiceModel || 'en-US-ChristopherNeural';
      const hostAvatar = (item as any).hostAvatar || wsSettings.hostAvatar || 'alex';
      const musicMood = (item as any).backgroundMusicMood || (item as any).musicMood || wsSettings.backgroundMusicMood || 'neon_pulse';
      const voicePreset = (item as any).voiceEmotionPreset || (item as any).voicePreset || wsSettings.voiceEmotionPreset || 'energetic';

      // Execute python script
      const pythonProcess = spawn(pythonBin, [
        scriptPath,
        '--input', tempInputPath,
        '--output', outputPath,
        '--voice', voiceModel,
        '--host', hostAvatar,
        '--music-mood', musicMood,
        '--voice-preset', voicePreset,
        '--beat-sync', 'true'
      ]);

      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
        console.log(`[VideoRender] ${data.toString().trim()}`);
      });

      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        // Clean up temp input
        try {
          if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
        } catch (e) {}

        const videoUrl = `/media/videos/${videoFileName}`;

        if (code === 0 && fs.existsSync(outputPath)) {
          console.log(`✅ Video rendered successfully: ${outputPath}`);

          const thumbFileName = `${item.id}_thumb.jpg`;
          const thumbPath = path.join(publicVideosDir, thumbFileName);
          const thumbUrl = fs.existsSync(thumbPath) ? `/media/videos/${thumbFileName}` : undefined;

          // Also copy to apps/web if directory exists
          if (webVideosDir) {
            try {
              const webTarget = path.join(webVideosDir, videoFileName);
              fs.copyFileSync(outputPath, webTarget);
              if (fs.existsSync(thumbPath)) {
                fs.copyFileSync(thumbPath, path.join(webVideosDir, thumbFileName));
              }
              const landscapeThumb = path.join(publicVideosDir, `${item.id}_thumb_landscape.jpg`);
              if (fs.existsSync(landscapeThumb)) {
                fs.copyFileSync(landscapeThumb, path.join(webVideosDir, `${item.id}_thumb_landscape.jpg`));
              }
            } catch (e) {}
          }

          // Update store
          contentStore.updateItem(item.id, {
            videoUrl,
            thumbnailUrl: thumbUrl,
            status: 'review'
          });

          resolve({
            success: true,
            videoUrl,
            duration: item.durationSeconds || 55
          });
        } else {
          console.error(`❌ Video render failed with code ${code}. Error: ${stderrData}`);
          resolve({
            success: false,
            videoUrl: '',
            duration: 0
          });
        }
      });
    });
  }
}

export const videoRenderService = new VideoRenderService();
