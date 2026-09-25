import { googleFlowVeoService } from './google-flow-veo.service';
import { pexelsBrollService } from './pexels-broll.service';

export interface ProviderCapabilities {
  minDuration: number;
  maxDuration: number;
  defaultResolution: string;
  maxPromptLength: number;
  text: boolean;
  firstFrame?: boolean;
  lastFrame?: boolean;
  referenceImages?: number;
  referenceVideos?: number;
  nativeAudio?: boolean;
}

export interface VideoGenerationRequest {
  prompt: string;
  duration?: number;
  aspectRatio?: '9:16' | '16:9';
  resolution?: string;
  generateAudio?: boolean;
  firstFrame?: string;
  lastFrame?: string;
}

export abstract class BaseVideoProvider {
  public abstract id: string;
  public abstract model: string;
  public abstract capabilities: ProviderCapabilities;

  public abstract isAvailable(workspaceId?: string): boolean;

  public describe() {
    return {
      id: this.id,
      model: this.model,
      available: this.isAvailable(),
      capabilities: this.capabilities
    };
  }

  public normalizeRequest(request: VideoGenerationRequest): VideoGenerationRequest {
    const min = this.capabilities.minDuration || 4;
    const max = this.capabilities.maxDuration || 60;
    const dur = Math.max(min, Math.min(max, request.duration || min));
    return {
      ...request,
      prompt: (request.prompt || '').slice(0, this.capabilities.maxPromptLength || 2000),
      duration: dur,
      aspectRatio: request.aspectRatio || '9:16',
      resolution: request.resolution || this.capabilities.defaultResolution || '1080p'
    };
  }
}

export class LocalFluxSlideshowProvider extends BaseVideoProvider {
  public id = 'local_flux';
  public model = 'FLUX.1-schnell + EdgeTTS + FFmpeg';
  public capabilities: ProviderCapabilities = {
    minDuration: 2,
    maxDuration: 600,
    defaultResolution: '1080p',
    maxPromptLength: 4000,
    text: true,
    firstFrame: true,
    lastFrame: true,
    referenceImages: 10,
    nativeAudio: true
  };

  public isAvailable(): boolean {
    return true; // Always 100% available without any API keys!
  }
}

export class SeedanceProvider extends BaseVideoProvider {
  public id = 'seedance';
  public model = process.env.SEEDANCE_MODEL || 'bytedance/seedance-2.5';
  public capabilities: ProviderCapabilities = {
    minDuration: 4,
    maxDuration: 30,
    defaultResolution: '720p',
    maxPromptLength: 2000,
    text: true,
    firstFrame: true,
    lastFrame: true,
    referenceImages: 30,
    nativeAudio: true
  };

  public isAvailable(): boolean {
    return Boolean(process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY || process.env.SEEDANCE_API_KEY);
  }
}

export class MinimaxH3Provider extends BaseVideoProvider {
  public id = 'minimax_h3';
  public model = process.env.MINIMAX_VIDEO_MODEL || 'video-01-live2d';
  public capabilities: ProviderCapabilities = {
    minDuration: 6,
    maxDuration: 10,
    defaultResolution: '720p',
    maxPromptLength: 2000,
    text: true,
    firstFrame: true,
    nativeAudio: false
  };

  public isAvailable(): boolean {
    return Boolean(process.env.MINIMAX_API_KEY);
  }
}

export class GoogleOmniProvider extends BaseVideoProvider {
  public id = 'google_omni';
  public model = process.env.GOOGLE_VEO_MODEL || 'google-veo-3.1-preview';
  public capabilities: ProviderCapabilities = {
    minDuration: 5,
    maxDuration: 60,
    defaultResolution: '1080p',
    maxPromptLength: 4000,
    text: true,
    nativeAudio: true
  };

  public isAvailable(workspaceId: string = 'default'): boolean {
    return googleFlowVeoService.isConfigured(workspaceId);
  }
}

export class KlingProvider extends BaseVideoProvider {
  public id = 'kling';
  public model = process.env.KLING_MODEL || 'kling-v1.5-pro';
  public capabilities: ProviderCapabilities = {
    minDuration: 5,
    maxDuration: 10,
    defaultResolution: '1080p',
    maxPromptLength: 2500,
    text: true,
    firstFrame: true,
    lastFrame: true
  };

  public isAvailable(): boolean {
    return Boolean(process.env.KLING_API_KEY);
  }
}

export class WanProvider extends BaseVideoProvider {
  public id = 'wan';
  public model = process.env.WAN_MODEL || 'alibaba/wan-2.1-t2v-14b';
  public capabilities: ProviderCapabilities = {
    minDuration: 5,
    maxDuration: 15,
    defaultResolution: '720p',
    maxPromptLength: 2000,
    text: true,
    firstFrame: true
  };

  public isAvailable(): boolean {
    return Boolean(process.env.WAN_API_KEY || process.env.REPLICATE_API_TOKEN);
  }
}

export class VideoProviderRegistry {
  private providers: Map<string, BaseVideoProvider> = new Map();
  private defaultOrder = ['google_omni', 'seedance', 'minimax_h3', 'kling', 'wan', 'local_flux'];

  constructor() {
    this.register(new LocalFluxSlideshowProvider());
    this.register(new SeedanceProvider());
    this.register(new MinimaxH3Provider());
    this.register(new GoogleOmniProvider());
    this.register(new KlingProvider());
    this.register(new WanProvider());
  }

  public register(provider: BaseVideoProvider): void {
    this.providers.set(provider.id, provider);
  }

  public get(id: string): BaseVideoProvider | undefined {
    return this.providers.get(id);
  }

  public listAll(workspaceId: string = 'default') {
    return Array.from(this.providers.values()).map(p => ({
      id: p.id,
      model: p.model,
      available: p.isAvailable(workspaceId),
      capabilities: p.capabilities
    }));
  }

  public select(preferredId?: string, workspaceId: string = 'default'): BaseVideoProvider {
    if (preferredId && this.providers.has(preferredId)) {
      const p = this.providers.get(preferredId)!;
      if (p.isAvailable(workspaceId)) return p;
    }

    for (const id of this.defaultOrder) {
      const p = this.providers.get(id);
      if (p && p.isAvailable(workspaceId)) {
        return p;
      }
    }

    return this.providers.get('local_flux')!;
  }
}

export const videoProviderRegistry = new VideoProviderRegistry();

// Backwards-compatible legacy exports
export interface IVideoProvider {
  generateVideo(script: any, workspaceId?: string): Promise<string>;
  getGenerationStatus(jobId: string): Promise<string>;
  cancelGeneration(jobId: string): Promise<boolean>;
  downloadResult(jobId: string): Promise<Buffer>;
  getProviderCapabilities(): any;
}

export class HybridVideoProvider implements IVideoProvider {
  async generateVideo(script: any, workspaceId: string = 'default') {
    const selected = videoProviderRegistry.select(undefined, workspaceId);
    return `${selected.id}_${Date.now()}`;
  }

  async getGenerationStatus(_jobId: string) { 
    return 'completed'; 
  }

  async cancelGeneration(_jobId: string) { 
    return true; 
  }

  async downloadResult(_jobId: string) { 
    return Buffer.from('video'); 
  }

  getProviderCapabilities() { 
    const all = videoProviderRegistry.listAll();
    return { 
      provider: 'hybrid_broll_neural',
      models: all.map(p => `${p.id} (${p.model})`),
      registeredProviders: all,
      primarySource: 'local_flux_free',
      maxDuration: 600,
      aspectRatios: ['9:16', '16:9'],
      resolutions: ['720p', '1080p', '4K']
    }; 
  }
}

export const videoProviderService = new HybridVideoProvider();
export const GoogleFlowVeoVideoProvider = HybridVideoProvider;
export { HybridVideoProvider as MockVideoProvider };
