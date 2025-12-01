import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../constants';

export interface Settings {
    // Story generation (目前只支持 Gemini)
    geminiApiKey: string;
    storyModel: string;

    // TTS
    ttsProvider: 'gemini' | 'elevenlabs' | 'edge' | 'browser';
    ttsModel: string;
    edgeVoice: string;
    elevenLabsApiKey: string;
    elevenLabsVoiceId: string;
}

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (storedSettings) {
                const loadedSettings = JSON.parse(storedSettings);
                setSettings({ ...DEFAULT_SETTINGS, ...loadedSettings });
            }
        } catch (error) {
            console.error("Failed to load settings from local storage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveSettings = useCallback((newSettings: Settings) => {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error("Failed to save settings to local storage", error);
        }
    }, []);

    return { settings, saveSettings, isLoaded };
};