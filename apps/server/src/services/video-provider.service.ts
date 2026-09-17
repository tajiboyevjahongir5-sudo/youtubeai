export interface IVideoProvider {
  generateVideo(script: any): Promise<string>;
  getGenerationStatus(jobId: string): Promise<string>;
  cancelGeneration(jobId: string): Promise<boolean>;
  downloadResult(jobId: string): Promise<Buffer>;
  getProviderCapabilities(): any;
}

export class MockVideoProvider implements IVideoProvider {
  async generateVideo(script: any) { return 'job_123'; }
  async getGenerationStatus(jobId: string) { return 'completed'; }
  async cancelGeneration(jobId: string) { return true; }
  async downloadResult(jobId: string) { return Buffer.from('video'); }
  getProviderCapabilities() { return { maxDuration: 60 }; }
}

export const videoProviderService = new MockVideoProvider();
