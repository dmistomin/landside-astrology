/**
 * Branded type for Conversation IDs to prevent mixing with other IDs
 */
export type ConversationId = string & { readonly __brand: 'ConversationId' };

/**
 * Branded type for Segment IDs to prevent mixing with other IDs
 */
export type SegmentId = string & { readonly __brand: 'SegmentId' };

/**
 * Conversation status enum
 */
export enum ConversationStatus {
  Recording = 'recording',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

/**
 * Individual transcription segment containing Japanese and English text pairs
 */
export interface TranscriptionSegment {
  readonly id: SegmentId;
  /** Original Japanese transcription */
  readonly japanese: string;
  /** English translation */
  readonly english: string;
  /** Start time of the segment in milliseconds */
  readonly startTime: number;
  /** End time of the segment in milliseconds */
  readonly endTime: number;
  /** Confidence score from DeepGram (0-1) */
  readonly confidence: number;
  /** Speaker identification if available */
  readonly speaker?: string;
  /** Whether this segment is final or still being processed */
  readonly isFinal: boolean;
}

/**
 * Extracted vocabulary term from conversation
 */
export interface ExtractedTerm {
  /** Japanese text */
  readonly japanese: string;
  /** Hiragana/Katakana reading */
  readonly reading: string;
  /** English meaning */
  readonly english: string;
  /** Number of occurrences in the conversation */
  readonly usageCount: number;
  /** Example sentences where this term was used */
  readonly examples: ReadonlyArray<{
    readonly japanese: string;
    readonly english: string;
    readonly segmentId: SegmentId;
  }>;
  /** Part of speech (noun, verb, adjective, etc.) */
  readonly partOfSpeech?: string;
}

/**
 * Brief summary of a conversation
 */
export interface ConversationSummary {
  /** Key discussion points */
  readonly keyPoints: ReadonlyArray<string>;
  /** Total duration in milliseconds */
  readonly duration: number;
  /** Number of speakers identified */
  readonly speakerCount: number;
  /** Most frequently used terms */
  readonly topTerms: ReadonlyArray<ExtractedTerm>;
  /** Generated summary text */
  readonly summary: string;
}

/**
 * Metadata for a conversation
 */
export interface ConversationMetadata {
  /** Optional title for the conversation */
  readonly title?: string;
  /** Tags for categorization */
  readonly tags: ReadonlyArray<string>;
  /** Location where conversation took place */
  readonly location?: string;
  /** Additional notes */
  readonly notes?: string;
}

/**
 * Main conversation entity
 */
export interface Conversation {
  readonly id: ConversationId;
  /** When the conversation started */
  startTime: Date;
  /** When the conversation ended (undefined if still ongoing) */
  endTime?: Date;
  /** Current status of the conversation */
  status: ConversationStatus;
  /** All transcription segments */
  segments: ReadonlyArray<TranscriptionSegment>;
  /** Extracted vocabulary terms */
  extractedTerms: ReadonlyArray<ExtractedTerm>;
  /** Conversation summary (generated after completion) */
  summary?: ConversationSummary;
  /** Optional metadata */
  metadata?: ConversationMetadata;
  /** Error message if status is Failed */
  error?: string;
}

/**
 * Type guard to check if a conversation is completed
 */
export function isConversationCompleted(
  conversation: Conversation
): conversation is Conversation & {
  endTime: Date;
  summary: ConversationSummary;
} {
  return (
    conversation.status === ConversationStatus.Completed &&
    conversation.endTime !== undefined &&
    conversation.summary !== undefined
  );
}

/**
 * Type guard to check if a segment is final
 */
export function isFinalSegment(segment: TranscriptionSegment): boolean {
  return segment.isFinal === true;
}
