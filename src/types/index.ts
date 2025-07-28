/**
 * Barrel file for clean imports of all types
 */

// Conversation types
export type {
  ConversationId,
  SegmentId,
  TranscriptionSegment,
  ExtractedTerm,
  ConversationSummary,
  ConversationMetadata,
  Conversation,
} from './conversation';

export {
  ConversationStatus,
  isConversationCompleted,
  isFinalSegment,
} from './conversation';

// API types
export type {
  ApiState,
  ApiError,
  DeepGramConfig,
  DeepGramAlternative,
  DeepGramTranscriptionResult,
  DeepGramResponse,
  DeepLRequest,
  DeepLResponse,
  DeepLUsage,
  DeepLLanguage,
  DeepLError,
  WebSocketMessage,
} from './api';

export {
  DeepGramErrorCode,
  isDeepGramError,
  isDeepGramResults,
  isApiError,
  isApiSuccess,
  isApiLoading,
} from './api';

// Settings types
export type {
  Theme,
  AudioQuality,
  ExportFormat,
  FontSize,
  Layout,
  APIKeys,
  AudioSettings,
  LanguageSettings,
  DisplaySettings,
  ExportSettings,
  PrivacySettings,
  AdvancedSettings,
  UserSettings,
  SettingsValidation,
} from './settings';

export { getDefaultSettings, validateSettings } from './settings';
