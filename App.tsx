import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StoryDisplay } from './components/StoryDisplay';
import { AudioPlayer } from './components/AudioPlayer';
import { SourcesDisplay } from './components/SourcesDisplay';
import { Spinner } from './components/Spinner';
import { SettingsPanel } from './components/SettingsPanel';
import { SettingsIcon } from './components/icons/SettingsIcon';
import { useSettings } from './hooks/useSettings';
import { generateStory, generateGeminiSpeech, StoryResult } from './services/geminiService';
import { generateElevenLabsSpeech } from './services/elevenlabsService';
import { GroundingChunk } from '@google/genai';

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

    const [isGeneratingStory, setIsGeneratingStory] = useState(false);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
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
                const audioContent = await generateGeminiSpeech(text, settings.ttsModel, settings.generativeApiKey);
                if (audioContent) {
                    setGeminiAudio(audioContent);
                }
            } else {
                const audioContent = await generateElevenLabsSpeech(text, settings.elevenLabsApiKey, settings.elevenLabsVoiceId);
                setElevenlabsAudio(audioContent);
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
        if (!prompt.trim()) {
            setError('Please enter a story prompt.');
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
            const { story: generatedStory, sources: groundingSources }: StoryResult = await generateStory(
                prompt,
                imageFile,
                settings.storyModel,
                settings.generativeApiKey
            );
            setStory(generatedStory);
            setSources(groundingSources);
            
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
                         <h1 className="text-5xl font-extrabold text-teal-700 pb-3 tracking-tight">
                            AI Story Weaver
                        </h1>
                        <p className="text-slate-700 text-lg mt-2 font-medium">
                           Craft magical stories from your imagination
                        </p>
                         <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="absolute top-0 right-0 p-2 rounded-full bg-white border-2 border-slate-300 text-slate-600 hover:text-teal-600 hover:border-teal-500 hover:shadow-md transition-all"
                            aria-label="Open settings"
                            title="Settings"
                        >
                            <SettingsIcon />
                        </button>
                    </header>

                    <main className="space-y-4">
                        {/* 第一行：图片和输入框并排 */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    📷 Upload Image
                                </label>
                                <ImageUploader onImageUpload={handleImageUpload} imageUrl={imageUrl} />
                            </div>
                            <div>
                                <label htmlFor="prompt" className="block text-sm font-semibold text-slate-700 mb-2">
                                    💬 Image Prompt <span className="text-xs text-slate-500 font-normal">(Optional - Customize your requirements)</span>
                                </label>
                                <textarea
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Optional: Add custom requirements like word count, language, style, tone, etc.&#10;&#10;Example: Write a 500-word story in Chinese with a humorous tone..."
                                    className="w-full h-[220px] bg-white border-2 border-slate-300 rounded-xl p-4 text-slate-900 text-base focus:ring-2 focus:ring-teal-500 focus:border-teal-500 hover:shadow-md transition-all resize-none shadow-sm"
                                />
                            </div>
                        </div>

                        {/* 第二行：生成按钮 */}
                        <div className="text-center py-2">
                            <button
                                onClick={handleGenerateStory}
                                disabled={isGeneratingStory || isGeneratingAudio}
                                className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 px-10 rounded-full transition-all duration-300 inline-flex items-center text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                {isGeneratingStory || isGeneratingAudio ? <Spinner /> : null}
                                {isGeneratingStory ? '✨ Creating...' : (isGeneratingAudio ? '🎙️ Narrating...' : '🚀 Create Story')}
                            </button>
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
                                <StoryDisplay story={story} isLoading={isGeneratingStory} />
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
                    
                     <footer className="text-center mt-12 text-slate-500 text-sm">
                        <p>Powered by AI Models</p>
                    </footer>
                </div>
            </div>
            
            <SettingsPanel 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onSave={saveSettings}
            />
        </>
    );
}

export default App;