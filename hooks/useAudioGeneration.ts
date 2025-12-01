import { useState, useCallback, useRef } from 'react';
import { AudioData } from '../types';
import { Settings } from './useSettings';
import { generateGeminiSpeech } from '../services/geminiService';
import { generateElevenLabsSpeech } from '../services/elevenlabsService';
import { generateEdgeSpeech } from '../services/edgeTtsService';
import { generateBrowserSpeech, stopBrowserSpeech } from '../services/browserTtsService';

interface UseAudioGenerationResult {
    audio: AudioData | null;
    isGenerating: boolean;
    error: string | null;
    hasError: boolean;
    isBrowserTTS: boolean;
    browserTTSText: string | null;
    generate: (text: string) => Promise<void>;
    reset: () => void;
    abort: () => void;
}

// 尝试使用指定 provider 生成音频（非 browser）
const tryGenerateAudio = async (
    provider: 'gemini' | 'elevenlabs' | 'edge',
    text: string,
    settings: Settings
): Promise<{ type: 'base64' | 'arraybuffer'; data: string | ArrayBuffer }> => {
    if (provider === 'gemini') {
        const content = await generateGeminiSpeech(text, settings.ttsModel, settings.geminiApiKey);
        if (!content) throw new Error('Gemini TTS returned no audio');
        return { type: 'base64', data: content };
    } else if (provider === 'elevenlabs') {
        const content = await generateElevenLabsSpeech(text, settings.elevenLabsApiKey, settings.elevenLabsVoiceId);
        return { type: 'arraybuffer', data: content };
    } else {
        const content = await generateEdgeSpeech(text, settings.edgeVoice);
        return { type: 'arraybuffer', data: content };
    }
};

export const useAudioGeneration = (settings: Settings): UseAudioGenerationResult => {
    const [audio, setAudio] = useState<AudioData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);
    const [isBrowserTTS, setIsBrowserTTS] = useState(false);
    const [browserTTSText, setBrowserTTSText] = useState<string | null>(null);
    const abortedRef = useRef(false);

    const reset = useCallback(() => {
        setAudio(null);
        setError(null);
        setHasError(false);
        setIsBrowserTTS(false);
        setBrowserTTSText(null);
        stopBrowserSpeech();
    }, []);

    const abort = useCallback(() => {
        abortedRef.current = true;
        stopBrowserSpeech();
    }, []);

    const generate = useCallback(async (text: string) => {
        abortedRef.current = false;
        setIsGenerating(true);
        setHasError(false);
        setError(null);
        setAudio(null);
        setIsBrowserTTS(false);
        setBrowserTTSText(null);

        const primaryProvider = settings.ttsProvider;

        // 如果选择的是 Browser TTS，直接使用
        if (primaryProvider === 'browser') {
            setIsBrowserTTS(true);
            setBrowserTTSText(text);
            setIsGenerating(false);
            return;
        }

        // 降级顺序：主选失败 → browser（最可靠的兜底）
        try {
            const result = await tryGenerateAudio(primaryProvider, text, settings);
            if (abortedRef.current) return;
            setAudio(result);
        } catch (primaryError: any) {
            if (abortedRef.current) return;
            console.warn(`Primary TTS (${primaryProvider}) failed:`, primaryError.message);

            // 尝试其他网络 TTS
            const fallbackProviders: ('gemini' | 'edge')[] =
                primaryProvider === 'gemini' ? ['edge'] :
                primaryProvider === 'edge' ? ['gemini'] :
                ['gemini', 'edge'];

            let succeeded = false;
            for (const fallback of fallbackProviders) {
                if (fallback === primaryProvider) continue;
                try {
                    console.log(`Trying fallback: ${fallback} TTS...`);
                    const result = await tryGenerateAudio(fallback, text, settings);
                    if (abortedRef.current) return;
                    setAudio(result);
                    succeeded = true;
                    break;
                } catch (e: any) {
                    console.warn(`Fallback ${fallback} failed:`, e.message);
                }
            }

            // 所有网络 TTS 都失败，使用 Browser TTS 兜底
            if (!succeeded) {
                console.log('All network TTS failed, falling back to Browser TTS');
                setIsBrowserTTS(true);
                setBrowserTTSText(text);
            }
        } finally {
            if (!abortedRef.current) {
                setIsGenerating(false);
            }
        }
    }, [settings]);

    return {
        audio,
        isGenerating,
        error,
        hasError,
        isBrowserTTS,
        browserTTSText,
        generate,
        reset,
        abort,
    };
};
