import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GroundingChunk } from '@google/genai';
import { StoryHistory, AudioData } from '../types';
import { STORAGE_KEYS, LIMITS, DEFAULT_SETTINGS } from '../constants';

// Settings slice
interface SettingsSlice {
    geminiApiKey: string;
    storyModel: string;
    ttsProvider: 'gemini' | 'elevenlabs' | 'edge';
    ttsModel: string;
    elevenLabsApiKey: string;
    elevenLabsVoiceId: string;
    updateSettings: (settings: Partial<SettingsSlice>) => void;
}

// History slice
interface HistorySlice {
    history: StoryHistory[];
    addToHistory: (story: string, imageUrl: string, prompt: string, sources: GroundingChunk[]) => void;
    deleteFromHistory: (id: string) => void;
}

// UI slice
interface UISlice {
    isSettingsOpen: boolean;
    isHistoryOpen: boolean;
    setSettingsOpen: (open: boolean) => void;
    setHistoryOpen: (open: boolean) => void;
}

// Story generation slice
interface StorySlice {
    story: string;
    sources: GroundingChunk[];
    isGeneratingStory: boolean;
    storyError: string | null;
    setStory: (story: string) => void;
    setSources: (sources: GroundingChunk[]) => void;
    setGeneratingStory: (generating: boolean) => void;
    setStoryError: (error: string | null) => void;
    resetStory: () => void;
}

// Audio slice
interface AudioSlice {
    audio: AudioData | null;
    isGeneratingAudio: boolean;
    audioError: string | null;
    hasAudioError: boolean;
    setAudio: (audio: AudioData | null) => void;
    setGeneratingAudio: (generating: boolean) => void;
    setAudioError: (error: string | null) => void;
    resetAudio: () => void;
}

// Combined store type
type AppStore = SettingsSlice & HistorySlice & UISlice & StorySlice & AudioSlice;

export const useAppStore = create<AppStore>()(
    persist(
        (set, get) => ({
            // Settings
            ...DEFAULT_SETTINGS,
            updateSettings: (newSettings) => set(newSettings),

            // History
            history: [],
            addToHistory: (story, imageUrl, prompt, sources) => {
                if (!story || !imageUrl) return;
                const newItem: StoryHistory = {
                    id: Date.now().toString(),
                    story,
                    imageUrl,
                    prompt,
                    timestamp: Date.now(),
                    sources,
                };
                set((state) => ({
                    history: [newItem, ...state.history].slice(0, LIMITS.MAX_HISTORY_ITEMS),
                }));
            },
            deleteFromHistory: (id) => {
                set((state) => ({
                    history: state.history.filter((item) => item.id !== id),
                }));
            },

            // UI
            isSettingsOpen: false,
            isHistoryOpen: false,
            setSettingsOpen: (open) => set({ isSettingsOpen: open }),
            setHistoryOpen: (open) => set({ isHistoryOpen: open }),

            // Story
            story: '',
            sources: [],
            isGeneratingStory: false,
            storyError: null,
            setStory: (story) => set({ story }),
            setSources: (sources) => set({ sources }),
            setGeneratingStory: (generating) => set({ isGeneratingStory: generating }),
            setStoryError: (error) => set({ storyError: error }),
            resetStory: () => set({ story: '', sources: [], storyError: null }),

            // Audio
            audio: null,
            isGeneratingAudio: false,
            audioError: null,
            hasAudioError: false,
            setAudio: (audio) => set({ audio, hasAudioError: false }),
            setGeneratingAudio: (generating) => set({ isGeneratingAudio: generating }),
            setAudioError: (error) => set({ audioError: error, hasAudioError: !!error }),
            resetAudio: () => set({ audio: null, audioError: null, hasAudioError: false }),
        }),
        {
            name: STORAGE_KEYS.SETTINGS,
            partialize: (state) => ({
                // Only persist settings and history
                geminiApiKey: state.geminiApiKey,
                storyModel: state.storyModel,
                ttsProvider: state.ttsProvider,
                ttsModel: state.ttsModel,
                elevenLabsApiKey: state.elevenLabsApiKey,
                elevenLabsVoiceId: state.elevenLabsVoiceId,
                history: state.history,
            }),
        }
    )
);

// Selector hooks for better performance
export const useSettings = () =>
    useAppStore((state) => ({
        geminiApiKey: state.geminiApiKey,
        storyModel: state.storyModel,
        ttsProvider: state.ttsProvider,
        ttsModel: state.ttsModel,
        elevenLabsApiKey: state.elevenLabsApiKey,
        elevenLabsVoiceId: state.elevenLabsVoiceId,
        updateSettings: state.updateSettings,
    }));

export const useHistoryStore = () =>
    useAppStore((state) => ({
        history: state.history,
        addToHistory: state.addToHistory,
        deleteFromHistory: state.deleteFromHistory,
    }));

export const useUIStore = () =>
    useAppStore((state) => ({
        isSettingsOpen: state.isSettingsOpen,
        isHistoryOpen: state.isHistoryOpen,
        setSettingsOpen: state.setSettingsOpen,
        setHistoryOpen: state.setHistoryOpen,
    }));

export const useStoryStore = () =>
    useAppStore((state) => ({
        story: state.story,
        sources: state.sources,
        isGenerating: state.isGeneratingStory,
        error: state.storyError,
        setStory: state.setStory,
        setSources: state.setSources,
        setGenerating: state.setGeneratingStory,
        setError: state.setStoryError,
        reset: state.resetStory,
    }));

export const useAudioStore = () =>
    useAppStore((state) => ({
        audio: state.audio,
        isGenerating: state.isGeneratingAudio,
        error: state.audioError,
        hasError: state.hasAudioError,
        setAudio: state.setAudio,
        setGenerating: state.setGeneratingAudio,
        setError: state.setAudioError,
        reset: state.resetAudio,
    }));
