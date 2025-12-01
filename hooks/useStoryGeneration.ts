import { useState, useCallback, useRef } from 'react';
import { GroundingChunk } from '@google/genai';
import { Settings } from './useSettings';
import { generateStory as generateStoryApi, StoryResult } from '../services/geminiService';

interface UseStoryGenerationResult {
    story: string;
    sources: GroundingChunk[];
    isGenerating: boolean;
    error: string | null;
    generate: (prompt: string, imageFile: File) => Promise<StoryResult | null>;
    setStory: (story: string) => void;
    setSources: (sources: GroundingChunk[]) => void;
    reset: () => void;
    abort: () => void;
}

export const useStoryGeneration = (settings: Settings): UseStoryGenerationResult => {
    const [story, setStory] = useState('');
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortedRef = useRef(false);

    const reset = useCallback(() => {
        setStory('');
        setSources([]);
        setError(null);
    }, []);

    const abort = useCallback(() => {
        abortedRef.current = true;
    }, []);

    const generate = useCallback(async (prompt: string, imageFile: File): Promise<StoryResult | null> => {
        abortedRef.current = false;
        setIsGenerating(true);
        setError(null);
        setStory('');
        setSources([]);

        try {
            const result = await generateStoryApi(
                prompt,
                imageFile,
                settings.storyModel,
                settings.geminiApiKey
            );

            if (abortedRef.current) return null;

            setStory(result.story);
            setSources(result.sources);
            return result;
        } catch (e: any) {
            if (abortedRef.current) return null;

            console.error(e);
            const errorStr = JSON.stringify(e);
            const errorMessage = e.message || e.toString();

            if (errorStr.includes('503') || errorStr.includes('UNAVAILABLE') || errorMessage.includes('overloaded')) {
                setError(`⚠️ Gemini API 服务器当前负载过高，请稍后再试。`);
            } else if (errorMessage.includes('401') || errorMessage.includes('API key')) {
                setError(`🔑 API Key 错误，请在设置中检查。`);
            } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                setError(`🤖 模型不存在，请检查设置。`);
            } else {
                setError(`❌ 故事生成失败: ${errorMessage}`);
            }
            return null;
        } finally {
            if (!abortedRef.current) {
                setIsGenerating(false);
            }
        }
    }, [settings.storyModel, settings.geminiApiKey]);

    return {
        story,
        sources,
        isGenerating,
        error,
        generate,
        setStory,
        setSources,
        reset,
        abort,
    };
};
