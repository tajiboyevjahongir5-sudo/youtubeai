// ============================================
// Jpilot — Shared Enums
// Used across server, web, and telegram apps
// ============================================

/** Content item lifecycle states */
export enum ContentStatus {
  IDEA = 'idea',
  BRIEF = 'brief',
  SCRIPT = 'script',
  STORYBOARD = 'storyboard',
  VOICEOVER = 'voiceover',
  ASSETS = 'assets',
  THUMBNAIL = 'thumbnail',
  METADATA = 'metadata',
  QUALITY_REVIEW = 'quality_review',
  AWAITING_APPROVAL = 'awaiting_approval',
  APPROVED = 'approved',
  SCHEDULED = 'scheduled',
  UPLOADING = 'uploading',
  PUBLISHED = 'published',
  ANALYZED = 'analyzed',
  FAILED = 'failed',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

/** Video format type */
export enum VideoFormat {
  LONG_FORM = 'long_form',
  SHORTS = 'shorts',
}

/** Content pillar type */
export enum ContentPillarType {
  EDUCATIONAL = 'educational',
  ENTERTAINMENT = 'entertainment',
  DOCUMENTARY = 'documentary',
  COMMENTARY = 'commentary',
  STORYTELLING = 'storytelling',
  TUTORIAL = 'tutorial',
  REVIEW = 'review',
  NEWS = 'news',
}

/** YouTube video privacy status */
export enum PrivacyStatus {
  PUBLIC = 'public',
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
}

/** Publishing job status */
export enum JobStatus {
  PENDING = 'pending',
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying',
}

/** Background job types */
export enum JobType {
  ANALYTICS_SYNC = 'analytics_sync',
  CONTENT_GENERATION = 'content_generation',
  VIDEO_GENERATION = 'video_generation',
  THUMBNAIL_GENERATION = 'thumbnail_generation',
  METADATA_GENERATION = 'metadata_generation',
  PUBLISHING = 'publishing',
  TELEGRAM_NOTIFICATION = 'telegram_notification',
  INSIGHT_GENERATION = 'insight_generation',
  TOKEN_REFRESH = 'token_refresh',
}

/** Approval request status */
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

/** Strategy memory confidence levels */
export enum ConfidenceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

/** Approval mode */
export enum ApprovalMode {
  MANUAL = 'manual',
  AUTO = 'auto',
}

/** English variant for content generation */
export enum EnglishVariant {
  US = 'us',
  UK = 'uk',
  INTERNATIONAL = 'international',
}

/** Workspace member role */
export enum WorkspaceRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

/** Integration connection status */
export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  ERROR = 'error',
}

/** Audit log action types */
export enum AuditAction {
  // Auth
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',

  // YouTube
  YOUTUBE_CONNECT = 'youtube_connect',
  YOUTUBE_DISCONNECT = 'youtube_disconnect',
  YOUTUBE_TOKEN_REFRESH = 'youtube_token_refresh',
  YOUTUBE_TOKEN_EXPIRED = 'youtube_token_expired',

  // Content
  CONTENT_CREATED = 'content_created',
  CONTENT_UPDATED = 'content_updated',
  CONTENT_DELETED = 'content_deleted',
  CONTENT_GENERATED = 'content_generated',
  CONTENT_REGENERATED = 'content_regenerated',

  // Approval
  CONTENT_APPROVED = 'content_approved',
  CONTENT_REJECTED = 'content_rejected',
  APPROVAL_REQUESTED = 'approval_requested',

  // Publishing
  PUBLISH_SCHEDULED = 'publish_scheduled',
  PUBLISH_STARTED = 'publish_started',
  PUBLISH_COMPLETED = 'publish_completed',
  PUBLISH_FAILED = 'publish_failed',
  PUBLISH_CANCELLED = 'publish_cancelled',
  PUBLISH_RETRIED = 'publish_retried',

  // Telegram
  TELEGRAM_CONNECTED = 'telegram_connected',
  TELEGRAM_DISCONNECTED = 'telegram_disconnected',
  TELEGRAM_APPROVAL = 'telegram_approval',

  // Analytics
  ANALYTICS_SYNCED = 'analytics_synced',
  INSIGHT_GENERATED = 'insight_generated',

  // Settings
  SETTINGS_UPDATED = 'settings_updated',
  WORKSPACE_CREATED = 'workspace_created',
}

/** Notification type */
export enum NotificationType {
  VIDEO_READY = 'video_ready',
  APPROVAL_REQUIRED = 'approval_required',
  UPLOAD_SUCCESS = 'upload_success',
  UPLOAD_FAILED = 'upload_failed',
  AUTH_EXPIRED = 'auth_expired',
  DAILY_SUMMARY = 'daily_summary',
  WEEKLY_SUMMARY = 'weekly_summary',
  POLICY_RISK = 'policy_risk',
  QUOTA_WARNING = 'quota_warning',
}

/** AI provider identifier */
export enum AIProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  MOCK = 'mock',
}

/** Video provider identifier */
export enum VideoProvider {
  VEO = 'veo',
  RUNWAY = 'runway',
  MANUAL = 'manual',
  MOCK = 'mock',
}

/** Quality review check result */
export enum ReviewResult {
  PASS = 'pass',
  WARNING = 'warning',
  FAIL = 'fail',
  NEEDS_VERIFICATION = 'needs_verification',
}
