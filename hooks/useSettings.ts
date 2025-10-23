import { useState, useEffect, useCallback } from 'react';

export interface Settings {
    // Story generation
    storyProvider: 'gemini' | 'openai' | 'claude' | 'kimi';
    geminiApiKey: string;
    openaiApiKey: string;
    claudeApiKey: string;
    kimiApiKey: string;
    storyModel: string;

    // TTS
    ttsProvider: 'gemini' | 'elevenlabs' | 'openai' | 'edge';
    ttsModel: string;
    elevenLabsApiKey: string;
    elevenLabsVoiceId: string;
}

const SETTINGS_KEY = 'ai-story-weaver-settings-v4';

const defaultSettings: Settings = {
    storyProvider: 'gemini',
    geminiApiKey: '',
    openaiApiKey: '',
    claudeApiKey: '',
    kimiApiKey: '',
    storyModel: 'gemini-2.5-flash',
    ttsProvider: 'gemini',
    ttsModel: 'gemini-2.5-flash-preview-tts',
    elevenLabsApiKey: '',
    elevenLabsVoiceId: '',
};

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            if (storedSettings) {
                const loadedSettings = JSON.parse(storedSettings);
                setSettings({ ...defaultSettings, ...loadedSettings });
            }
        } catch (error) {
            console.error("Failed to load settings from local storage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveSettings = useCallback((newSettings: Settings) => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error("Failed to save settings to local storage", error);
        }
    }, []);

    return { settings, saveSettings, isLoaded };
};