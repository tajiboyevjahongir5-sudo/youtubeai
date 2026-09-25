import fs from 'fs';
import path from 'path';

export type GenerationStage = 
  | 'strategy'
  | 'script'
  | 'scenes'
  | 'visuals'
  | 'narration'
  | 'assembly'
  | 'seo'
  | 'thumbnail'
  | 'quality_review';

export const GENERATION_STAGES: GenerationStage[] = [
  'strategy',
  'script',
  'scenes',
  'visuals',
  'narration',
  'assembly',
  'seo',
  'thumbnail',
  'quality_review'
];

export interface StageCheckpoint {
  stage: GenerationStage;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'invalid';
  artifact?: any;
  error?: string | null;
  startedAt?: string;
  completedAt?: string | null;
  attempts?: number;
}

export interface ContentCheckpoints {
  contentId: string;
  workspaceId: string;
  updatedAt: string;
  stages: Record<string, StageCheckpoint>;
}

export class GenerationRecoveryService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), 'data/checkpoints');
    if (!fs.existsSync(this.baseDir)) {
      try {
        fs.mkdirSync(this.baseDir, { recursive: true });
      } catch (e) {}
    }
  }

  private getCheckpointFile(workspaceId: string, contentId: string): string {
    const wsDir = path.join(this.baseDir, workspaceId || 'default');
    if (!fs.existsSync(wsDir)) {
      try {
        fs.mkdirSync(wsDir, { recursive: true });
      } catch (e) {}
    }
    return path.join(wsDir, `${contentId}.json`);
  }

  public getCheckpoints(workspaceId: string, contentId: string): ContentCheckpoints {
    const filePath = this.getCheckpointFile(workspaceId, contentId);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      } catch (e) {}
    }
    return {
      contentId,
      workspaceId: workspaceId || 'default',
      updatedAt: new Date().toISOString(),
      stages: {}
    };
  }

  public saveCheckpoint(
    workspaceId: string,
    contentId: string,
    stage: GenerationStage,
    artifact: any,
    status: 'completed' | 'running' | 'failed' | 'invalid' = 'completed',
    error?: string | null
  ): ContentCheckpoints {
    const current = this.getCheckpoints(workspaceId, contentId);
    const prevStage = current.stages[stage] || { stage, attempts: 0 };

    current.stages[stage] = {
      stage,
      status,
      artifact: artifact !== undefined ? artifact : prevStage.artifact,
      error: error || null,
      startedAt: prevStage.startedAt || new Date().toISOString(),
      completedAt: status === 'completed' ? new Date().toISOString() : null,
      attempts: (prevStage.attempts || 0) + (status === 'running' ? 1 : 0)
    };
    current.updatedAt = new Date().toISOString();

    const filePath = this.getCheckpointFile(workspaceId, contentId);
    try {
      fs.writeFileSync(filePath, JSON.stringify(current, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[GenerationRecovery] Failed to save checkpoint:', e);
    }

    return current;
  }

  public validateArtifact(stage: GenerationStage, artifact: any): boolean {
    if (!artifact) return false;

    if (stage === 'strategy') {
      return Boolean(artifact.niche || artifact.title || artifact.contentPillar);
    }
    if (stage === 'script') {
      return Boolean(artifact.title && (artifact.script || artifact.fullScript));
    }
    if (stage === 'scenes') {
      return Array.isArray(artifact.scenes) && artifact.scenes.length >= 1;
    }
    if (stage === 'visuals') {
      if (Array.isArray(artifact.files)) {
        return artifact.files.some((f: string) => f && fs.existsSync(f) && fs.statSync(f).size > 1000);
      }
      return false;
    }
    if (stage === 'narration') {
      return Boolean(artifact.audioPath && fs.existsSync(artifact.audioPath) && fs.statSync(artifact.audioPath).size > 1000);
    }
    if (stage === 'assembly') {
      return Boolean(artifact.videoPath && fs.existsSync(artifact.videoPath) && fs.statSync(artifact.videoPath).size > 50000);
    }
    if (stage === 'seo') {
      return Boolean(artifact.title && artifact.description && Array.isArray(artifact.tags));
    }
    if (stage === 'thumbnail') {
      return Boolean(artifact.thumbnailPath && fs.existsSync(artifact.thumbnailPath));
    }
    return true;
  }

  public canResume(workspaceId: string, contentId: string): {
    canResume: boolean;
    nextStage: GenerationStage;
    completedStages: GenerationStage[];
    stages: Record<string, StageCheckpoint>;
  } {
    const checkpoints = this.getCheckpoints(workspaceId, contentId);
    const completedStages: GenerationStage[] = [];

    for (const stage of GENERATION_STAGES) {
      const cp = checkpoints.stages[stage];
      if (cp && cp.status === 'completed' && this.validateArtifact(stage, cp.artifact)) {
        completedStages.push(stage);
      } else {
        return {
          canResume: completedStages.length > 0 && completedStages.length < GENERATION_STAGES.length,
          nextStage: stage,
          completedStages,
          stages: checkpoints.stages
        };
      }
    }

    return {
      canResume: false,
      nextStage: 'quality_review',
      completedStages,
      stages: checkpoints.stages
    };
  }

  public clearCheckpoints(workspaceId: string, contentId: string, fromStage?: GenerationStage): void {
    if (!fromStage) {
      const filePath = this.getCheckpointFile(workspaceId, contentId);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
      return;
    }

    const current = this.getCheckpoints(workspaceId, contentId);
    const fromIndex = GENERATION_STAGES.indexOf(fromStage);
    if (fromIndex >= 0) {
      for (let i = fromIndex; i < GENERATION_STAGES.length; i++) {
        delete current.stages[GENERATION_STAGES[i]];
      }
      const filePath = this.getCheckpointFile(workspaceId, contentId);
      try {
        fs.writeFileSync(filePath, JSON.stringify(current, null, 2), 'utf-8');
      } catch (e) {}
    }
  }
}

export const generationRecoveryService = new GenerationRecoveryService();
