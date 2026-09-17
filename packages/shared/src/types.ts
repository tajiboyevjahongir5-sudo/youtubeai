// ============================================
// Jpilot — Shared Type Definitions
// ============================================

import type {
  ContentStatus,
  VideoFormat,
  ContentPillarType,
  PrivacyStatus,
  JobStatus,
  JobType,
  ApprovalStatus,
  ConfidenceLevel,
  ApprovalMode,
  EnglishVariant,
  WorkspaceRole,
  ConnectionStatus,
  AIProvider,
  VideoProvider as VideoProviderEnum,
  ReviewResult,
  NotificationType,
} from './enums.js';

// ---- Base ----

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ---- User & Workspace ----

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  niche?: string;
  subNiches?: string[];
  timezone: string;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
}

// ---- YouTube Connection ----

export interface YouTubeChannel {
  id: string;
  workspaceId: string;
  channelId: string;
  channelTitle: string;
  channelThumbnailUrl?: string;
  subscriberCount?: number;
  videoCount?: number;
  viewCount?: number;
  connectionStatus: ConnectionStatus;
  lastSyncAt?: string;
}

// ---- Channel Settings ----

export interface ChannelSettings {
  id: string;
  workspaceId: string;
  niche: string;
  subNiches: string[];
  audienceProfile: string;
  toneOfVoice: string;
  englishVariant: EnglishVariant;
  forbiddenTopics: string[];
  brandWords: string[];
  wordsToAvoid: string[];
  targetVideoLengthMinutes: number;
  dailyUploadTarget: number;
  publishingWindowsUtc: number[];
  timezone: string;
  videoFormat: VideoFormat | 'both';
  approvalMode: ApprovalMode;
  monetizationSafe: boolean;
  contentPillarTypes: ContentPillarType[];
  targetMarkets: string[];
  aiProvider: AIProvider;
  videoProvider: VideoProviderEnum;
}

// ---- Content ----

export interface ContentIdea {
  id: string;
  workspaceId: string;
  title: string;
  contentPillar: ContentPillarType;
  viewerProblem: string;
  targetAudience: string;
  hook: string;
  suggestedStructure: string;
  expectedLengthMinutes: number;
  videoFormat: VideoFormat;
  riskFlags: string[];
  originalityNote: string;
  relevanceReason: string;
  confidenceLevel: ConfidenceLevel;
  evidence?: string;
  status: 'active' | 'used' | 'dismissed';
  createdAt: string;
}

export interface ContentItem {
  id: string;
  workspaceId: string;
  ideaId?: string;
  status: ContentStatus;
  videoFormat: VideoFormat;
  title: string;
  description?: string;
  contentPillar: ContentPillarType;
  scheduledAt?: string;
  publishedAt?: string;
  youtubeVideoId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Script {
  id: string;
  contentItemId: string;
  hook: string;
  fullScript: string;
  scenes: SceneBreakdown[];
  closingCta: string;
  factCheckNotes: string[];
  copyrightRiskNotes: string[];
  syntheticMediaDisclosure: boolean;
  aiProvider: AIProvider;
  aiModel: string;
  generatedAt: string;
  version: number;
}

export interface SceneBreakdown {
  sceneNumber: number;
  narration: string;
  onScreenText?: string;
  visualInstruction: string;
  bRollSuggestion?: string;
  transition?: string;
  durationSeconds: number;
}

export interface VideoMetadata {
  id: string;
  contentItemId: string;
  titleVariations: string[];
  selectedTitle: string;
  description: string;
  tags: string[];
  hashtags: string[];
  chapters?: ChapterMarker[];
  pinnedComment?: string;
  thumbnailPrompt?: string;
  thumbnailTextOptions: string[];
  metadataQualityScore: number;
  policyRiskFlags: string[];
  category: string;
  defaultLanguage: string;
  version: number;
}

export interface ChapterMarker {
  timeSeconds: number;
  title: string;
}

// ---- Quality Review ----

export interface QualityReview {
  id: string;
  contentItemId: string;
  originalityRisk: ReviewResult;
  factualVerification: ReviewResult;
  copyrightRisk: ReviewResult;
  policyRisk: ReviewResult;
  misleadingMetadata: ReviewResult;
  repetitionRisk: ReviewResult;
  lowValueRisk: ReviewResult;
  brandConsistency: ReviewResult;
  grammarCheck: ReviewResult;
  hookStrength: ReviewResult;
  pacing: ReviewResult;
  ctaQuality: ReviewResult;
  overallScore: number;
  notes: string[];
  reviewedAt: string;
}

// ---- Publishing ----

export interface PublishingJob {
  id: string;
  contentItemId: string;
  workspaceId: string;
  status: JobStatus;
  scheduledAt: string;
  privacyStatus: PrivacyStatus;
  attemptCount: number;
  maxAttempts: number;
  lastError?: string;
  idempotencyKey: string;
  startedAt?: string;
  completedAt?: string;
}

// ---- Analytics ----

export interface AnalyticsSnapshot {
  id: string;
  videoId: string;
  contentItemId: string;
  snapshotDate: string;
  views: number;
  impressions: number;
  impressionsCtr: number;
  watchTimeMinutes: number;
  averageViewDurationSeconds: number;
  averagePercentageViewed: number;
  likes: number;
  comments: number;
  shares: number;
  subscribersGained: number;
  subscribersLost: number;
}

export interface AnalyticsInsight {
  id: string;
  workspaceId: string;
  whatWorked: string[];
  whatFailed: string[];
  likelyReasons: string[];
  confidenceLevel: ConfidenceLevel;
  evidence: string;
  recommendedChanges: string[];
  patternsToRepeat: string[];
  patternsToAvoid: string[];
  experimentsToRun: string[];
  conclusionStrength: 'strong' | 'weak';
  generatedAt: string;
  relatedVideoIds: string[];
}

export interface StrategyMemory {
  id: string;
  workspaceId: string;
  lesson: string;
  supportingMetrics: Record<string, number>;
  relatedVideoIds: string[];
  confidenceLevel: ConfidenceLevel;
  active: boolean;
  lastReviewedAt: string;
  createdAt: string;
}

// ---- Approval ----

export interface ApprovalRequest {
  id: string;
  contentItemId: string;
  workspaceId: string;
  status: ApprovalStatus;
  requestedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  feedback?: string;
  telegramMessageId?: string;
}

// ---- Dashboard ----

export interface DashboardSummary {
  channel: {
    title: string;
    thumbnailUrl?: string;
    subscriberCount: number;
    totalViews: number;
    watchTimeHours: number;
    videoCount: number;
  } | null;
  stats: {
    scheduledVideos: number;
    awaitingApproval: number;
    inGeneration: number;
    publishedThisWeek: number;
  };
  recentActivity: AuditLogEntry[];
  nextAction?: string;
}

export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  action: string;
  details?: Record<string, unknown>;
  performedBy?: string;
  performedAt: string;
}

// ---- Telegram ----

export interface TelegramConnection {
  id: string;
  workspaceId: string;
  chatId: string;
  username?: string;
  connectionStatus: ConnectionStatus;
  connectedAt: string;
}

// ---- Provider Interfaces ----

export interface GenerateVideoRequest {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
  durationSeconds: number;
}

export interface GenerateVideoResult {
  operationId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  error?: string;
}

export interface VideoProviderCapabilities {
  maxDurationSeconds: number;
  supportedAspectRatios: string[];
  supportedResolutions: string[];
  supportsAudio: boolean;
  supportsImageToVideo: boolean;
}
