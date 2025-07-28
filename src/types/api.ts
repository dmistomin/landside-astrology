/**
 * API Response States
 */
export type ApiState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };

/**
 * Generic API Error
 */
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: unknown;
}

/**
 * DeepGram API Types
 */

/**
 * DeepGram WebSocket configuration
 */
export interface DeepGramConfig {
  /** API key for authentication */
  readonly apiKey: string;
  /** Language code for transcription */
  readonly language: 'ja' | 'en';
  /** Model to use for transcription */
  readonly model?: 'nova-2' | 'nova' | 'enhanced' | 'base';
  /** Enable punctuation */
  readonly punctuate?: boolean;
  /** Enable profanity filter */
  readonly profanityFilter?: boolean;
  /** Enable redaction */
  readonly redact?: boolean;
  /** Enable diarization (speaker detection) */
  readonly diarize?: boolean;
  /** Enable smart formatting */
  readonly smartFormat?: boolean;
  /** Sample rate of audio */
  readonly sampleRate?: number;
  /** Audio encoding */
  readonly encoding?:
    | 'linear16'
    | 'flac'
    | 'mulaw'
    | 'amr-nb'
    | 'amr-wb'
    | 'opus'
    | 'speex';
  /** Number of audio channels */
  readonly channels?: number;
}

/**
 * DeepGram transcription alternative
 */
export interface DeepGramAlternative {
  readonly transcript: string;
  readonly confidence: number;
  readonly words?: ReadonlyArray<{
    readonly word: string;
    readonly start: number;
    readonly end: number;
    readonly confidence: number;
    readonly speaker?: number;
  }>;
}

/**
 * DeepGram transcription result
 */
export interface DeepGramTranscriptionResult {
  readonly channel: {
    readonly alternatives: ReadonlyArray<DeepGramAlternative>;
  };
  readonly start: number;
  readonly duration: number;
  readonly is_final: boolean;
  readonly speech_final: boolean;
}

/**
 * DeepGram WebSocket response types
 */
export type DeepGramResponse =
  | {
      readonly type: 'Results';
      readonly channel_index: ReadonlyArray<number>;
      readonly duration: number;
      readonly start: number;
      readonly is_final: boolean;
      readonly speech_final: boolean;
      readonly channel: {
        readonly alternatives: ReadonlyArray<DeepGramAlternative>;
      };
    }
  | {
      readonly type: 'Metadata';
      readonly transaction_key: string;
      readonly request_id: string;
      readonly sha256: string;
      readonly created: string;
      readonly duration: number;
      readonly channels: number;
    }
  | {
      readonly type: 'UtteranceEnd';
      readonly channel: ReadonlyArray<number>;
      readonly last_word_end: number;
    }
  | {
      readonly type: 'SpeechStarted';
      readonly channel: ReadonlyArray<number>;
      readonly timestamp: number;
    }
  | {
      readonly type: 'Error';
      readonly error: {
        readonly message: string;
        readonly type: string;
        readonly code: string;
      };
    };

/**
 * DeepGram error codes
 */
export enum DeepGramErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  RequestTimeout = 'REQUEST_TIMEOUT',
  TooManyRequests = 'TOO_MANY_REQUESTS',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
  BadGateway = 'BAD_GATEWAY',
  ServiceUnavailable = 'SERVICE_UNAVAILABLE',
}

/**
 * DeepL API Types
 */

/**
 * DeepL translation request
 */
export interface DeepLRequest {
  /** Text to translate */
  readonly text: ReadonlyArray<string>;
  /** Source language code */
  readonly source_lang?: 'JA' | 'EN';
  /** Target language code */
  readonly target_lang: 'JA' | 'EN';
  /** Preserve formatting */
  readonly preserve_formatting?: boolean;
  /** Formality level */
  readonly formality?:
    | 'default'
    | 'more'
    | 'less'
    | 'prefer_more'
    | 'prefer_less';
  /** Glossary ID for consistent translations */
  readonly glossary_id?: string;
}

/**
 * DeepL translation response
 */
export interface DeepLResponse {
  readonly translations: ReadonlyArray<{
    readonly detected_source_language: string;
    readonly text: string;
  }>;
}

/**
 * DeepL usage information
 */
export interface DeepLUsage {
  readonly character_count: number;
  readonly character_limit: number;
}

/**
 * DeepL supported languages
 */
export interface DeepLLanguage {
  readonly language: string;
  readonly name: string;
  readonly supports_formality?: boolean;
}

/**
 * DeepL error response
 */
export interface DeepLError {
  readonly message: string;
  readonly detail?: string;
}

/**
 * WebSocket Message Types
 */

/**
 * Generic WebSocket message wrapper
 */
export type WebSocketMessage<T = unknown> =
  | { type: 'open'; timestamp: number }
  | { type: 'close'; code: number; reason: string; timestamp: number }
  | { type: 'error'; error: Error; timestamp: number }
  | { type: 'message'; data: T; timestamp: number };

/**
 * Type guards for API responses
 */

export function isDeepGramError(
  response: DeepGramResponse
): response is Extract<DeepGramResponse, { type: 'Error' }> {
  return response.type === 'Error';
}

export function isDeepGramResults(
  response: DeepGramResponse
): response is Extract<DeepGramResponse, { type: 'Results' }> {
  return response.type === 'Results';
}

export function isApiError<T>(
  state: ApiState<T>
): state is Extract<ApiState<T>, { status: 'error' }> {
  return state.status === 'error';
}

export function isApiSuccess<T>(
  state: ApiState<T>
): state is Extract<ApiState<T>, { status: 'success' }> {
  return state.status === 'success';
}

export function isApiLoading<T>(
  state: ApiState<T>
): state is Extract<ApiState<T>, { status: 'loading' }> {
  return state.status === 'loading';
}
