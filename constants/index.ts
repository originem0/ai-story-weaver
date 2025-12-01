// LocalStorage keys
export const STORAGE_KEYS = {
    SETTINGS: 'ai-story-weaver-settings-v7',
    HISTORY: 'ai-story-weaver-history',
} as const;

// Limits
export const LIMITS = {
    MAX_HISTORY_ITEMS: 5,
} as const;

// Story generation models
export const STORY_MODELS = [
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
] as const;

// TTS providers
export const TTS_PROVIDERS = [
    { value: 'browser', label: 'Browser TTS (Offline)' },
    { value: 'gemini', label: 'Gemini TTS' },
    { value: 'edge', label: 'Edge TTS (Proxy)' },
    { value: 'elevenlabs', label: 'ElevenLabs (Premium)' },
] as const;

// TTS models per provider
export const TTS_MODELS = {
    gemini: [
        { value: 'gemini-2.5-flash-preview-tts', label: 'Gemini 2.5 Flash TTS' },
        { value: 'gemini-2.0-flash-preview-image-generation', label: 'Gemini 2.0 Flash TTS' },
    ],
    edge: [
        { value: 'alloy', label: 'Alloy (Neutral)' },
        { value: 'echo', label: 'Echo (Male)' },
        { value: 'fable', label: 'Fable (British)' },
        { value: 'onyx', label: 'Onyx (Deep Male)' },
        { value: 'nova', label: 'Nova (Female)' },
        { value: 'shimmer', label: 'Shimmer (Soft Female)' },
    ],
} as const;

// Default settings - Browser TTS as default (most reliable)
export const DEFAULT_SETTINGS = {
    geminiApiKey: '',
    storyModel: 'gemini-2.5-pro',
    ttsProvider: 'browser' as const,
    ttsModel: 'gemini-2.5-flash-preview-tts',
    edgeVoice: 'alloy',
    elevenLabsApiKey: '',
    elevenLabsVoiceId: '',
};

// Audio config
export const AUDIO_CONFIG = {
    GEMINI_SAMPLE_RATE: 24000,
    GEMINI_CHANNELS: 1,
} as const;

// External links
export const EXTERNAL_LINKS = {
    GOOGLE_AI_STUDIO: 'https://aistudio.google.com/apikey',
    ELEVENLABS: 'https://elevenlabs.io/',
    ELEVENLABS_VOICES: 'https://elevenlabs.io/voice-library',
} as const;
