/**
 * Theme options for the application
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Audio quality presets
 */
export type AudioQuality = 'low' | 'medium' | 'high' | 'ultra';

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'txt' | 'csv' | 'pdf' | 'srt';

/**
 * Font size options
 */
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

/**
 * Layout options
 */
export type Layout = 'compact' | 'comfortable' | 'spacious';

/**
 * API key storage structure
 */
export interface APIKeys {
  /** Deepgram API key (encrypted) */
  readonly deepgram?: string;
  /** DeepL API key (encrypted) */
  readonly deepl?: string;
}

/**
 * Audio input settings
 */
export interface AudioSettings {
  /** Selected input device ID */
  readonly deviceId?: string;
  /** Sample rate in Hz - fixed at 16000 */
  readonly sampleRate: 16000;
  /** Number of channels */
  readonly channels: 1 | 2;
  /** Enable noise suppression */
  readonly noiseSuppression: boolean;
  /** Enable echo cancellation */
  readonly echoCancellation: boolean;
  /** Enable auto gain control */
  readonly autoGainControl: boolean;
  /** Audio quality preset */
  readonly quality: AudioQuality;
  /** Voice activity detection sensitivity (0-1) */
  readonly voiceActivityThreshold: number;
}

/**
 * Language preferences
 */
export interface LanguageSettings {
  /** Source language for transcription */
  readonly sourceLanguage: 'ja' | 'en';
  /** Target language for translation */
  readonly targetLanguage: 'ja' | 'en';
  /** Enable automatic language detection */
  readonly autoDetect: boolean;
  /** Preferred formality level for translations */
  readonly formality: 'default' | 'more' | 'less';
  /** Enable romaji display for Japanese text */
  readonly showRomaji: boolean;
  /** Enable furigana display for kanji */
  readonly showFurigana: boolean;
}

/**
 * Display and UI preferences
 */
export interface DisplaySettings {
  /** Application theme */
  readonly theme: Theme;
  /** Font size preference */
  readonly fontSize: FontSize;
  /** Layout density */
  readonly layout: Layout;
  /** Show timestamps in conversation view */
  readonly showTimestamps: boolean;
  /** Show confidence scores */
  readonly showConfidence: boolean;
  /** Show speaker labels */
  readonly showSpeakers: boolean;
  /** Highlight low confidence segments */
  readonly highlightLowConfidence: boolean;
  /** Low confidence threshold (0-1) */
  readonly lowConfidenceThreshold: number;
  /** Enable animations */
  readonly enableAnimations: boolean;
  /** Compact mode for smaller screens */
  readonly compactMode: boolean;
}

/**
 * Export preferences
 */
export interface ExportSettings {
  /** Default export format */
  readonly defaultFormat: ExportFormat;
  /** Include timestamps in exports */
  readonly includeTimestamps: boolean;
  /** Include speaker labels in exports */
  readonly includeSpeakers: boolean;
  /** Include confidence scores in exports */
  readonly includeConfidence: boolean;
  /** Include both languages in exports */
  readonly includeBothLanguages: boolean;
  /** Include extracted vocabulary */
  readonly includeVocabulary: boolean;
  /** Include conversation summary */
  readonly includeSummary: boolean;
  /** Custom export template */
  readonly customTemplate?: string;
}

/**
 * Privacy and data settings
 */
export interface PrivacySettings {
  /** Save conversations locally */
  readonly saveConversations: boolean;
  /** Auto-delete conversations after days */
  readonly autoDeleteAfterDays?: number;
  /** Enable analytics */
  readonly enableAnalytics: boolean;
  /** Enable crash reporting */
  readonly enableCrashReporting: boolean;
  /** Blur sensitive content */
  readonly blurSensitiveContent: boolean;
}

/**
 * Advanced settings
 */
export interface AdvancedSettings {
  /** Enable debug mode */
  readonly debugMode: boolean;
  /** Show performance metrics */
  readonly showPerformanceMetrics: boolean;
  /** Custom Deepgram model */
  readonly deepgramModel?: string;
  /** WebSocket reconnect attempts */
  readonly maxReconnectAttempts: number;
  /** WebSocket reconnect delay in ms */
  readonly reconnectDelay: number;
  /** Buffer size for audio streaming */
  readonly audioBufferSize: number;
  /** Enable experimental features */
  readonly enableExperimentalFeatures: boolean;
}

/**
 * Complete user settings
 */
export interface UserSettings {
  /** API keys */
  apiKeys: APIKeys;
  /** Audio input settings */
  audio: AudioSettings;
  /** Language preferences */
  language: LanguageSettings;
  /** Display preferences */
  display: DisplaySettings;
  /** Export preferences */
  export: ExportSettings;
  /** Privacy settings */
  privacy: PrivacySettings;
  /** Advanced settings */
  advanced: AdvancedSettings;
  /** Last updated timestamp */
  lastUpdated: Date;
  /** Settings version for migration */
  version: number;
}

/**
 * Default settings factory
 */
export function getDefaultSettings(): UserSettings {
  return {
    apiKeys: {},
    audio: {
      sampleRate: 16000,
      channels: 1,
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: true,
      quality: 'high',
      voiceActivityThreshold: 0.5,
    },
    language: {
      sourceLanguage: 'ja',
      targetLanguage: 'en',
      autoDetect: false,
      formality: 'default',
      showRomaji: false,
      showFurigana: true,
    },
    display: {
      theme: 'system',
      fontSize: 'medium',
      layout: 'comfortable',
      showTimestamps: true,
      showConfidence: false,
      showSpeakers: true,
      highlightLowConfidence: true,
      lowConfidenceThreshold: 0.7,
      enableAnimations: true,
      compactMode: false,
    },
    export: {
      defaultFormat: 'json',
      includeTimestamps: true,
      includeSpeakers: true,
      includeConfidence: false,
      includeBothLanguages: true,
      includeVocabulary: true,
      includeSummary: true,
    },
    privacy: {
      saveConversations: true,
      enableAnalytics: false,
      enableCrashReporting: false,
      blurSensitiveContent: false,
    },
    advanced: {
      debugMode: false,
      showPerformanceMetrics: false,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      audioBufferSize: 4096,
      enableExperimentalFeatures: false,
    },
    lastUpdated: new Date(),
    version: 1,
  };
}

/**
 * Settings validation result
 */
export interface SettingsValidation {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<{
    readonly field: string;
    readonly message: string;
  }>;
}

/**
 * Validate user settings
 */
export function validateSettings(
  settings: Partial<UserSettings>
): SettingsValidation {
  const errors: Array<{ field: string; message: string }> = [];

  if (settings.audio) {
    if (
      settings.audio.voiceActivityThreshold < 0 ||
      settings.audio.voiceActivityThreshold > 1
    ) {
      errors.push({
        field: 'audio.voiceActivityThreshold',
        message: 'Must be between 0 and 1',
      });
    }
  }

  if (settings.display) {
    if (
      settings.display.lowConfidenceThreshold < 0 ||
      settings.display.lowConfidenceThreshold > 1
    ) {
      errors.push({
        field: 'display.lowConfidenceThreshold',
        message: 'Must be between 0 and 1',
      });
    }
  }

  if (settings.privacy?.autoDeleteAfterDays !== undefined) {
    if (settings.privacy.autoDeleteAfterDays < 1) {
      errors.push({
        field: 'privacy.autoDeleteAfterDays',
        message: 'Must be at least 1 day',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
