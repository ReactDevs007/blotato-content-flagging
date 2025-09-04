// Branded types for better type safety
type Brand<T, B> = T & { __brand: B };

export type ContentId = Brand<string, 'ContentId'>;
export type UserId = Brand<string, 'UserId'>;

export type ContentType = 'text' | 'image' | 'video' | 'link';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type FlagReason =
  | 'spam'
  | 'hate_speech'
  | 'harassment'
  | 'violence'
  | 'adult_content'
  | 'misinformation'
  | 'copyright_violation'
  | 'phishing'
  | 'malware'
  | 'inappropriate_language'
  | 'personal_information';

export interface ContentItem {
  readonly id: ContentId;
  readonly userId: UserId;
  readonly type: ContentType;
  readonly text?: string;
  readonly url?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface FlagResult {
  readonly isFlagged: boolean;
  readonly severity: SeverityLevel;
  readonly reasons: readonly FlagReason[];
  readonly confidence: number; // 0-1 scale
  readonly details?: string;
}

export interface ContentFlaggingRequest {
  readonly content: ContentItem;
  readonly context?: {
    readonly platform?: string;
    readonly audience?: string;
    readonly previousFlags?: number;
  };
}

export interface ContentFlaggingResponse {
  readonly requestId: string;
  readonly result: FlagResult;
  readonly processingTimeMs: number;
  readonly timestamp: Date;
}
