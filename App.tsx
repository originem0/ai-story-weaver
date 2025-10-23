import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StoryDisplay } from './components/StoryDisplay';
import { AudioPlayer } from './components/AudioPlayer';
import { SourcesDisplay } from './components/SourcesDisplay';
import { Spinner } from './components/Spinner';
import { SettingsPanel } from './components/SettingsPanel';
import { SettingsIcon } from './components/icons/SettingsIcon';
import { WelcomeBanner } from './components/WelcomeBanner';
import { HistoryPanel } from './components/HistoryPanel';
import { useSettings } from './hooks/useSettings';
import { generateStory, generateGeminiSpeech, StoryResult, translateToSimplifiedChinese } from './services/geminiService';
import { generateElevenLabsSpeech } from './services/elevenlabsService';
import { generateEdgeSpeech } from './services/edgeTtsService';
import { GroundingChunk } from '@google/genai';

interface StoryHistory {
    id: string;
    story: string;
    imageUrl: string;
    prompt: string;
    timestamp: number;
    sources: GroundingChunk[];
}

function App() {
    const { settings, saveSettings, isLoaded } = useSettings();
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [story, setStory] = useState('');
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [geminiAudio, setGeminiAudio] = useState<string | null>(null);
    const [elevenlabsAudio, setElevenlabsAudio] = useState<ArrayBuffer | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [audioError, setAudioError] = useState(false);
    const [history, setHistory] = useState<StoryHistory[]>([]);

    const [isGeneratingStory, setIsGeneratingStory] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Load history from localStorage
    React.useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('ai-story-weaver-history');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }, []);

    // Save history to localStorage
    const saveToHistory = useCallback((newStory: string, newSources: GroundingChunk[]) => {
        if (!newStory || !imageUrl) return;

        const newHistoryItem: StoryHistory = {
            id: Date.now().toString(),
            story: newStory,
            imageUrl: imageUrl,
            prompt: prompt,
            timestamp: Date.now(),
            sources: newSources,
        };

        setHistory(prev => {
            const updated = [newHistoryItem, ...prev].slice(0, 5); // Keep only 5 most recent
            localStorage.setItem('ai-story-weaver-history', JSON.stringify(updated));
            return updated;
        });
    }, [imageUrl, prompt]);

    const handleTranslate = useCallback(async (text: string): Promise<string> => {
        const apiKey = settings.storyProvider === 'gemini' ? settings.geminiApiKey :
                       settings.storyProvider === 'openai' ? settings.openaiApiKey :
                       settings.storyProvider === 'claude' ? settings.claudeApiKey :
                       settings.kimiApiKey;
        return await translateToSimplifiedChinese(text, apiKey);
    }, [settings]);

    const handleSelectHistory = (item: StoryHistory) => {
        setStory(item.story);
        setSources(item.sources);
        setImageUrl(item.imageUrl);
        setPrompt(item.prompt);
        setIsHistoryOpen(false);
    };

    const handleDeleteHistory = (id: string) => {
        setHistory(prev => {
            const updated = prev.filter(item => item.id !== id);
            localStorage.setItem('ai-story-weaver-history', JSON.stringify(updated));
            return updated;
        });
    };

    const handleImageUpload = (file: File) => {
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
    };

    const handleGenerateAudio = useCallback(async (text: string) => {
        setIsGeneratingAudio(true);
        setAudioError(false);
        setGeminiAudio(null);
        setElevenlabsAudio(null);
        try {
             if (settings.ttsProvider === 'gemini') {
                const audioContent = await generateGeminiSpeech(text, settings.ttsModel, settings.geminiApiKey);
                if (audioContent) {
                    setGeminiAudio(audioContent);
                }
            } else if (settings.ttsProvider === 'elevenlabs') {
                const audioContent = await generateElevenLabsSpeech(text, settings.elevenLabsApiKey, settings.elevenLabsVoiceId);
                setElevenlabsAudio(audioContent);
            } else if (settings.ttsProvider === 'edge') {
                const audioContent = await generateEdgeSpeech(text, 'en-US');
                setElevenlabsAudio(audioContent); // Edge TTS 也返回 ArrayBuffer
            } else {
                setError(`TTS provider "${settings.ttsProvider}" is not yet implemented. Please use Gemini, ElevenLabs, or Edge TTS.`);
                setAudioError(true);
            }
        } catch (e: any) {
            console.error("Audio generation failed:", e);
            const errorStr = JSON.stringify(e);
            const errorMessage = e.message || e.toString();
            
            // 判断错误类型并给出友好提示
            if (errorStr.includes('503') || errorStr.includes('UNAVAILABLE') || errorMessage.includes('overloaded')) {
                setError(`⚠️ TTS 服务器当前负载过高。已自动重试 3 次但仍失败，请稍后再试。故事已生成，可手动点击重新生成语音。`);
            } else {
                setError(`🔊 语音生成失败: ${errorMessage}。故事已生成，可手动点击重新生成语音。`);
            }
            setAudioError(true);
        } finally {
            setIsGeneratingAudio(false);
        }
    }, [settings]);

    const handleGenerateStory = useCallback(async () => {
        if (!imageFile) {
            setError('📷 Please upload an image first.');
            return;
        }

        setError(null);
        setAudioError(false);
        setStory('');
        setSources([]);
        setGeminiAudio(null);
        setElevenlabsAudio(null);
        setIsGeneratingStory(true);

        try {
            const apiKey = settings.storyProvider === 'gemini' ? settings.geminiApiKey :
                          settings.storyProvider === 'openai' ? settings.openaiApiKey :
                          settings.storyProvider === 'claude' ? settings.claudeApiKey :
                          settings.kimiApiKey;

            const { story: generatedStory, sources: groundingSources }: StoryResult = await generateStory(
                prompt,
                imageFile,
                settings.storyModel,
                apiKey,
                settings.storyProvider
            );
            setStory(generatedStory);
            setSources(groundingSources);

            // Save to history
            saveToHistory(generatedStory, groundingSources);

            if (generatedStory) {
                await handleGenerateAudio(generatedStory);
            }

        } catch (e: any) {
            console.error(e);
            const errorStr = JSON.stringify(e);
            const errorMessage = e.message || e.toString();
            
            // 判断错误类型并给出友好提示
            if (errorStr.includes('503') || errorStr.includes('UNAVAILABLE') || errorMessage.includes('overloaded')) {
                setError(`⚠️ Gemini API 服务器当前负载过高。已自动重试 3 次但仍失败，请稍后再试。错误详情: ${errorMessage}`);
            } else if (errorMessage.includes('401') || errorMessage.includes('API key')) {
                setError(`🔑 API Key 错误: ${errorMessage}。请在右上角设置中检查 API Key 是否正确。`);
            } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                setError(`🤖 模型错误: ${errorMessage}。请在设置中检查模型名称是否正确。`);
            } else {
                setError(`❌ 故事生成失败: ${errorMessage}`);
            }
        } finally {
            setIsGeneratingStory(false);
        }
    }, [prompt, imageFile, settings, handleGenerateAudio]);


    if (!isLoaded) {
        return <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">Loading settings...</div>
    }

    return (
        <>
            <div className="bg-slate-50 text-slate-900 min-h-screen font-sans">
                <div className="container mx-auto px-6 py-8 max-w-6xl relative">
                    <header className="text-center mb-10 relative">
                         <h1 className="text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent pb-3 tracking-tight">
                            AI Story Weaver
                        </h1>
                        <p className="text-slate-600 text-lg mt-2">
                           Turn images into stories • Practice English through storytelling
                        </p>
                         <div className="absolute top-0 right-0 flex gap-2">
                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className="p-2 rounded-full bg-white border-2 border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-500 hover:shadow-md transition-all relative"
                                aria-label="View history"
                                title="Story History"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {history.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                        {history.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-full bg-white border-2 border-slate-300 text-slate-600 hover:text-teal-600 hover:border-teal-500 hover:shadow-md transition-all"
                                aria-label="Open settings"
                                title="Settings"
                            >
                                <SettingsIcon />
                            </button>
                        </div>
                    </header>

                    <main className="space-y-4">
                        {/* Welcome banner for first-time users */}
                        <WelcomeBanner />

                        {/* 第一行：图片和输入框并排 */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    📷 Upload Image <span className="text-xs text-slate-500 font-normal">(Required)</span>
                                </label>
                                <ImageUploader onImageUpload={handleImageUpload} imageUrl={imageUrl} />
                                <p className="text-xs text-slate-500 mt-2">💡 Try photos of people, places, objects, or scenes</p>
                            </div>
                            <div>
                                <label htmlFor="prompt" className="block text-sm font-semibold text-slate-700 mb-2">
                                    ✏️ Story Prompt <span className="text-xs text-slate-500 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe what story you want to create based on this image...&#10;&#10;Examples:&#10;• Tell a story about what happened before this moment&#10;• Describe this scene in poetic language&#10;• Create a mystery story based on this image&#10;• Write in the style of a news report"
                                    className="w-full h-[220px] bg-white border-2 border-slate-300 rounded-xl p-4 text-slate-900 text-base focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:shadow-md transition-all resize-none shadow-sm"
                                />
                            </div>
                        </div>

                        {/* 第二行：生成按钮 */}
                        <div className="text-center py-2">
                            <button
                                onClick={handleGenerateStory}
                                disabled={isGeneratingStory || isGeneratingAudio || !imageFile}
                                className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-full transition-all duration-300 inline-flex items-center gap-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-md"
                                title={!imageFile ? 'Please upload an image first' : ''}
                            >
                                {isGeneratingStory || isGeneratingAudio ? <Spinner /> : null}
                                {isGeneratingStory ? '✨ Creating Story...' : (isGeneratingAudio ? '🎙️ Narrating...' : '🚀 Generate Story & Audio')}
                            </button>
                            {!imageFile && (
                                <p className="text-xs text-slate-500 mt-2">⬆️ Upload an image to get started</p>
                            )}
                        </div>

                        {/* 错误提示（紧凑显示） */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-800 text-sm">
                                {error}
                            </div>
                        )}

                        {/* 第三行：生成的故事（仅在有内容或加载时显示） */}
                        {(story || isGeneratingStory) && (
                            <div className={isGeneratingStory ? 'min-h-[300px]' : ''}>
                                <StoryDisplay story={story} isLoading={isGeneratingStory} onTranslate={handleTranslate} />
                            </div>
                        )}

                        {/* 第四行：音频播放器（仅在有音频或加载时显示，紧贴故事） */}
                        {(geminiAudio || elevenlabsAudio || isGeneratingAudio || audioError) && (
                            <AudioPlayer
                                base64Audio={geminiAudio}
                                arrayBufferAudio={elevenlabsAudio}
                                isLoading={isGeneratingAudio}
                                ttsProvider={settings.ttsProvider}
                                hasError={audioError}
                                onRegenerate={() => story && handleGenerateAudio(story)}
                            />
                        )}

                        {/* 第五行：来源链接（仅在有内容时显示） */}
                        {sources.length > 0 && <SourcesDisplay sources={sources} />}

                    </main>
                    
                     <footer className="text-center mt-16 pb-8 text-slate-400 text-sm space-y-2">
                        <p>💡 Tip: Upload any image to generate a creative story based on what you see</p>
                        <p className="text-xs">Powered by Gemini AI & ElevenLabs</p>
                    </footer>
                </div>
            </div>
            
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSave={saveSettings}
            />

            <HistoryPanel
                history={history}
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onSelect={handleSelectHistory}
                onDelete={handleDeleteHistory}
            />
        </>
    );
}

export default App;