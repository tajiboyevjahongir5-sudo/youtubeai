import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { contentStore, ContentItemRecord } from './content-store.service';
import { freeAiService } from './free-ai.service';
import { VideoRenderService } from './video-render.service';

export interface SceneManifestItem {
  id: string;
  position: number;
  label: string;
  scriptText: string;
  prompt: string;
  duration: number;
  assetType: 'image' | 'video';
  assetPath: string;
  audioPath?: string | null;
  status: 'ready' | 'generating' | 'needs_rebuild' | 'missing_asset' | 'failed';
  revision: number;
  provider: string;
}

export interface SceneManifest {
  contentId: string;
  workspaceId: string;
  title: string;
  format: 'shorts' | 'long_form';
  totalDuration: number;
  scenes: SceneManifestItem[];
  updatedAt: string;
}

export class SceneRepairService {
  private baseDir: string;
  private videoRenderService: VideoRenderService;

  constructor() {
    this.videoRenderService = new VideoRenderService();
    this.baseDir = path.resolve(process.cwd(), 'data/scenes');
    if (!fs.existsSync(this.baseDir)) {
      try {
        fs.mkdirSync(this.baseDir, { recursive: true });
      } catch (e) {}
    }
  }

  private getManifestPath(workspaceId: string, contentId: string): string {
    const wsDir = path.join(this.baseDir, workspaceId || 'default');
    if (!fs.existsSync(wsDir)) {
      try {
        fs.mkdirSync(wsDir, { recursive: true });
      } catch (e) {}
    }
    return path.join(wsDir, `${contentId}.json`);
  }

  private getSceneMediaDir(contentId: string): { serverDir: string; webDir: string; pubDir: string } {
    const pubDir = path.join(this.videoRenderService.getPublicVideosDir(), 'scenes', contentId);
    const serverDir = path.join(this.videoRenderService.getMediaVideosDir(), 'scenes', contentId);
    const webVideos = this.videoRenderService.getWebVideosDir();
    const webDir = webVideos ? path.join(webVideos, 'scenes', contentId) : serverDir;

    [pubDir, serverDir, webDir].forEach(d => {
      if (!fs.existsSync(d)) {
        try { fs.mkdirSync(d, { recursive: true }); } catch (e) {}
      }
    });

    return { serverDir, webDir, pubDir };
  }

  public getScenes(workspaceId: string, contentId: string): SceneManifest {
    const manifestPath = this.getManifestPath(workspaceId, contentId);
    if (fs.existsSync(manifestPath)) {
      try {
        const raw = fs.readFileSync(manifestPath, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {}
    }

    const item = contentStore.getById(contentId, workspaceId);
    if (!item) {
      const fallbackItem: ContentItemRecord = {
        id: contentId,
        workspaceId,
        title: 'Mavzu',
        status: 'idea',
        videoFormat: 'shorts',
        contentPillar: 'educational',
        duration: '0:55',
        durationSeconds: 55,
        brief: 'Video brief',
        targetAudience: 'Global audience',
        script: '',
        scenes: [],
        description: '',
        tags: [],
        seoScore: 85,
        createdAt: new Date().toISOString()
      };
      return this.initScenesFromItem(fallbackItem);
    }
    return this.initScenesFromItem(item);
  }

  public initScenesFromItem(item: ContentItemRecord): SceneManifest {
    const isLong = item.videoFormat === 'long_form';
    const totalDuration = item.durationSeconds || (isLong ? 615 : 55);
    const rawScenes = item.scenes || [];
    const mediaDirs = this.getSceneMediaDir(item.id);

    const defaultLabels = [
      '1-sahna: Diqqatni jalb qiluvchi Hook (0-3s)',
      '2-sahna: Asosiy muammo va intriga',
      '3-sahna: Hayratlanarli fakt va yechim',
      '4-sahna: Kulminatsiya va keskin burilish',
      '5-sahna: Xulosa va obuna chaqirig\'i (CTA)'
    ];

    const cleanTitle = (item.title || 'Mavzu').replace(/#\w+/g, '').trim();
    const defaultPrompts = [
      `${cleanTitle}, shocking opening hook, award-winning photography, cinematic dramatic lighting, 8k photorealistic`,
      `${cleanTitle}, discovery and intriguing buildup, vivid storytelling composition, cinematic lighting`,
      `${cleanTitle}, unbelievable evidence and dramatic details, extreme scale and visual impact, 8k`,
      `${cleanTitle}, stunning revelation and climax, atmospheric volumetric lighting, hyperdetailed`,
      `${cleanTitle}, epic unforgettable conclusion, wide cinematic perspective, award-winning 8k`
    ];

    const sceneCount = 5;
    const baseDuration = Math.round(totalDuration / sceneCount);

    const scenes: SceneManifestItem[] = [];
    for (let i = 0; i < sceneCount; i++) {
      const raw = (rawScenes[i] || {}) as any;
      const sceneNum = i + 1;
      const expectedImgName = `scene_${sceneNum}.jpg`;
      const localImgPath = path.join(mediaDirs.serverDir, expectedImgName);
      const hasImage = fs.existsSync(localImgPath) && fs.statSync(localImgPath).size > 1000;

      const webAssetPath = `/media/videos/scenes/${item.id}/${expectedImgName}`;

      scenes.push({
        id: `scene_${item.id}_${sceneNum}`,
        position: i,
        label: raw.title || defaultLabels[i],
        scriptText: raw.text || raw.script || raw.description || (i === 0 ? item.script?.slice(0, 150) || '' : ''),
        prompt: raw.visualPrompt || defaultPrompts[i],
        duration: raw.duration || raw.time || baseDuration,
        assetType: 'image',
        assetPath: hasImage ? webAssetPath : '',
        status: hasImage ? 'ready' : 'missing_asset',
        revision: 1,
        provider: 'FLUX.1-schnell'
      });
    }

    const manifest: SceneManifest = {
      contentId: item.id,
      workspaceId: item.workspaceId || 'default',
      title: item.title,
      format: item.videoFormat === 'long_form' ? 'long_form' : 'shorts',
      totalDuration,
      scenes,
      updatedAt: new Date().toISOString()
    };

    this.saveManifest(manifest);
    return manifest;
  }

  public saveManifest(manifest: SceneManifest): void {
    const manifestPath = this.getManifestPath(manifest.workspaceId, manifest.contentId);
    try {
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[SceneRepair] Failed to save manifest:', e);
    }
  }

  public async regenerateScene(
    workspaceId: string,
    contentId: string,
    sceneIndex: number,
    options?: { prompt?: string; scriptText?: string; provider?: string }
  ): Promise<SceneManifestItem> {
    const manifest = this.getScenes(workspaceId, contentId);
    if (sceneIndex < 0 || sceneIndex >= manifest.scenes.length) {
      throw new Error(`Invalid scene index: ${sceneIndex}`);
    }

    const scene = manifest.scenes[sceneIndex];
    scene.status = 'generating';
    if (options?.prompt) scene.prompt = options.prompt;
    if (options?.scriptText) scene.scriptText = options.scriptText;
    this.saveManifest(manifest);

    const mediaDirs = this.getSceneMediaDir(contentId);
    const sceneNum = sceneIndex + 1;
    const isLong = manifest.format === 'long_form';
    const width = isLong ? 1920 : 1080;
    const height = isLong ? 1080 : 1920;

    const revision = (scene.revision || 1) + 1;
    const fileName = `scene_${sceneNum}_r${revision}.jpg`;
    const targetFile = path.join(mediaDirs.serverDir, fileName);

    try {
      console.log(`🎨 [SceneRepair] Sahna ${sceneNum} qayta yaratilmoqda: "${scene.prompt.slice(0, 60)}..."`);
      await freeAiService.generateFluxImage(scene.prompt, targetFile, { width, height });

      // Copy to public and web directories
      try {
        fs.copyFileSync(targetFile, path.join(mediaDirs.pubDir, fileName));
        fs.copyFileSync(targetFile, path.join(mediaDirs.webDir, fileName));
        // Also update standard scene_N.jpg pointer
        fs.copyFileSync(targetFile, path.join(mediaDirs.serverDir, `scene_${sceneNum}.jpg`));
        fs.copyFileSync(targetFile, path.join(mediaDirs.pubDir, `scene_${sceneNum}.jpg`));
        fs.copyFileSync(targetFile, path.join(mediaDirs.webDir, `scene_${sceneNum}.jpg`));
      } catch (e) {}

      scene.assetPath = `/media/videos/scenes/${contentId}/${fileName}`;
      scene.status = 'ready';
      scene.revision = revision;
      scene.provider = options?.provider || 'FLUX.1-schnell';
      manifest.updatedAt = new Date().toISOString();
      this.saveManifest(manifest);

      console.log(`✅ [SceneRepair] Sahna ${sceneNum} muvaffaqiyatli yangilandi!`);
      return scene;
    } catch (err: any) {
      scene.status = 'failed';
      this.saveManifest(manifest);
      console.error(`❌ [SceneRepair] Sahna ${sceneNum} generatsiyasida xatolik:`, err.message);
      throw err;
    }
  }

  public updateScene(
    workspaceId: string,
    contentId: string,
    sceneIndex: number,
    data: { prompt?: string; scriptText?: string; duration?: number; label?: string }
  ): SceneManifestItem {
    const manifest = this.getScenes(workspaceId, contentId);
    if (sceneIndex < 0 || sceneIndex >= manifest.scenes.length) {
      throw new Error(`Invalid scene index: ${sceneIndex}`);
    }

    const scene = manifest.scenes[sceneIndex];
    if (data.prompt !== undefined) scene.prompt = data.prompt;
    if (data.scriptText !== undefined) scene.scriptText = data.scriptText;
    if (data.duration !== undefined) scene.duration = Math.max(2, data.duration);
    if (data.label !== undefined) scene.label = data.label;

    manifest.updatedAt = new Date().toISOString();
    manifest.totalDuration = manifest.scenes.reduce((sum, s) => sum + (s.duration || 0), 0);
    this.saveManifest(manifest);
    return scene;
  }

  public async rebuildVideo(workspaceId: string, contentId: string): Promise<{ success: boolean; videoUrl: string; duration: number }> {
    const item = contentStore.getById(contentId, workspaceId);
    if (!item) {
      throw new Error(`Content item not found: ${contentId}`);
    }

    const manifest = this.getScenes(workspaceId, contentId);
    // Sync updated scene scripts to item
    item.scenes = manifest.scenes.map((s, idx) => ({
      id: s.id,
      title: s.label,
      time: s.duration,
      tag: `Sahna ${idx + 1}`,
      description: s.scriptText,
      overlayText: s.label
    }));

    // Re-render video using the updated scene visuals
    console.log(`⚡ [SceneRepair] "${item.title}" yangilangan sahnalar bilan qayta yig'ilmoqda...`);
    return await this.videoRenderService.renderVideo(item);
  }
}

export const sceneRepairService = new SceneRepairService();
