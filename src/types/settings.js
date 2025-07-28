/**
 * Default settings factory
 */
export function getDefaultSettings() {
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
 * Validate user settings
 */
export function validateSettings(settings) {
    const errors = [];
    if (settings.audio) {
        if (settings.audio.voiceActivityThreshold < 0 ||
            settings.audio.voiceActivityThreshold > 1) {
            errors.push({
                field: 'audio.voiceActivityThreshold',
                message: 'Must be between 0 and 1',
            });
        }
    }
    if (settings.display) {
        if (settings.display.lowConfidenceThreshold < 0 ||
            settings.display.lowConfidenceThreshold > 1) {
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
