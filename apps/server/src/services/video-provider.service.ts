import { googleFlowVeoService } from './google-flow-veo.service';

export interface IVideoProvider {
  generateVideo(script: any, workspaceId?: string): Promise<string>;
  getGenerationStatus(jobId: string): Promise<string>;
  cancelGeneration(jobId: string): Promise<boolean>;
  downloadResult(jobId: string): Promise<Buffer>;
  getProviderCapabilities(): any;
}

export class GoogleFlowVeoVideoProvider implements IVideoProvider {
  async generateVideo(script: any, workspaceId: string = 'default') {
    const isConfigured = googleFlowVeoService.isConfigured(workspaceId);
    return isConfigured ? `google_veo_${Date.now()}` : `built_in_neural_${Date.now()}`;
  }
  async getGenerationStatus(jobId: string) { return 'completed'; }
  async cancelGeneration(jobId: string) { return true; }
  async downloadResult(jobId: string) { return Buffer.from('video'); }
  getProviderCapabilities() { 
    return { 
      provider: 'google_flow_veo',
      model: 'veo-3.1-generate-preview',
      maxDuration: 60,
      aspectRatios: ['9:16', '16:9'],
      resolutions: ['720p', '1080p']
    }; 
  }
}

export const videoProviderService = new GoogleFlowVeoVideoProvider();
