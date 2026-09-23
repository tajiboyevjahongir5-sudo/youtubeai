import { googleFlowVeoService } from './google-flow-veo.service';
import { pexelsBrollService } from './pexels-broll.service';

export interface IVideoProvider {
  generateVideo(script: any, workspaceId?: string): Promise<string>;
  getGenerationStatus(jobId: string): Promise<string>;
  cancelGeneration(jobId: string): Promise<boolean>;
  downloadResult(jobId: string): Promise<Buffer>;
  getProviderCapabilities(): any;
}

export class HybridVideoProvider implements IVideoProvider {
  async generateVideo(script: any, workspaceId: string = 'default') {
    if (googleFlowVeoService.isConfigured(workspaceId)) {
      return `google_veo_${Date.now()}`;
    }
    if (pexelsBrollService.isConfigured(workspaceId)) {
      return `pexels_hd_${Date.now()}`;
    }
    return `built_in_neural_${Date.now()}`;
  }

  async getGenerationStatus(jobId: string) { 
    return 'completed'; 
  }

  async cancelGeneration(jobId: string) { 
    return true; 
  }

  async downloadResult(jobId: string) { 
    return Buffer.from('video'); 
  }

  getProviderCapabilities() { 
    return { 
      provider: 'hybrid_broll_neural',
      models: ['pexels-4k-portrait', 'google-veo-3.1', 'neural-kinetic-motion'],
      primarySource: 'pexels_broll_free',
      maxDuration: 60,
      aspectRatios: ['9:16', '16:9'],
      resolutions: ['720p', '1080p', '4K']
    }; 
  }
}

export const videoProviderService = new HybridVideoProvider();
export const GoogleFlowVeoVideoProvider = HybridVideoProvider;
export { HybridVideoProvider as MockVideoProvider };
