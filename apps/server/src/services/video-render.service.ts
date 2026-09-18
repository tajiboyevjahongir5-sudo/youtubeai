import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { contentStore, ContentItemRecord } from './content-store.service';

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

      // Execute python script
      const pythonProcess = spawn(pythonBin, [
        scriptPath,
        '--input', tempInputPath,
        '--output', outputPath
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

          // Also copy to apps/web if directory exists
          if (webVideosDir) {
            try {
              const webTarget = path.join(webVideosDir, videoFileName);
              fs.copyFileSync(outputPath, webTarget);
            } catch (e) {}
          }

          // Update store
          contentStore.updateItem(item.id, {
            videoUrl,
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
