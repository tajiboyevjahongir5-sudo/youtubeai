/**
 * Real-time Video Render Progress Tracker
 * In-memory event store with polling endpoint support
 */

export interface RenderProgressEvent {
  contentId: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  percent: number;
  currentStep: string;
  stepsCompleted: number;
  totalSteps: number;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  startedAt: string;
  updatedAt: string;
}

const progressStore = new Map<string, RenderProgressEvent>();

export function updateRenderProgress(
  contentId: string,
  percent: number,
  currentStep: string,
  stepsCompleted: number,
  totalSteps: number,
  status: RenderProgressEvent['status'] = 'rendering'
): void {
  const existing = progressStore.get(contentId);
  const startedAt = existing?.startedAt || new Date().toISOString();
  const elapsed = existing
    ? (Date.now() - new Date(startedAt).getTime()) / 1000
    : 0;

  const rate = percent > 0 ? elapsed / percent : 0;
  const remaining = Math.max(0, Math.round(rate * (100 - percent)));

  progressStore.set(contentId, {
    contentId,
    status,
    percent: Math.min(100, Math.round(percent)),
    currentStep,
    stepsCompleted,
    totalSteps,
    elapsedSeconds: Math.round(elapsed),
    estimatedRemainingSeconds: remaining,
    startedAt,
    updatedAt: new Date().toISOString(),
  });
}

export function getRenderProgress(contentId: string): RenderProgressEvent | null {
  return progressStore.get(contentId) || null;
}

export function clearRenderProgress(contentId: string): void {
  progressStore.delete(contentId);
}

export const RENDER_STEPS = [
  'Azure Neural TTS ovoz sintezi...',
  'Sahna 1/6: Hook & Pattern Interrupt renderlanmoqda...',
  'Sahna 2/6: Asosiy kontent renderlanmoqda...',
  'Sahna 3/6: Vizual dalillar renderlanmoqda...',
  'Sahna 4/6: Terminal & benchmark renderlanmoqda...',
  'Sahna 5/6: CTA & Outro renderlanmoqda...',
  'Beat-synced jumpcuts sinxronlanmoqda...',
  'FFmpeg muxing & audio mastering...',
  'Thumbnail generatsiya qilinmoqda...',
  'Fayl yozilmoqda va tekshirilmoqda...',
];
