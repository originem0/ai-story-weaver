import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StoryDisplay } from './components/StoryDisplay';
import { AudioPlayer } from './components/AudioPlayer';
import { SourcesDisplay } from './components/SourcesDisplay';
import { Spinner } from './components/Spinner';
import { SettingsPanel } from './components/SettingsPanel';
import { SettingsIcon } from './components/icons/SettingsIcon';
import { HistoryPanel } from './components/HistoryPanel';
import { AboutSection } from './components/AboutSection';
import { useSettings } from './hooks/useSettings';
import { useHistory } from './hooks/useHistory';
import { useStoryGeneration } from './hooks/useStoryGeneration';
import { useAudioGeneration } from './hooks/useAudioGeneration';
import { useImageUpload } from './hooks/useImageUpload';
import { translateToSimplifiedChinese } from './services/geminiService';
import { StoryHistory } from './types';

function App() {
    const { settings, saveSettings, isLoaded } = useSettings();
    const { history, addToHistory, deleteFromHistory } = useHistory();
    const storyGen = useStoryGeneration(settings);
    const audioGen = useAudioGeneration(settings);
    const imageUpload = useImageUpload();

    const [prompt, setPrompt] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const handleTranslate = useCallback(async (text: string): Promise<string> => {
        return await translateToSimplifiedChinese(text, settings.geminiApiKey);
    }, [settings.geminiApiKey]);

    const handleSelectHistory = (item: StoryHistory) => {
        storyGen.setStory(item.story);
        storyGen.setSources(item.sources);
        imageUpload.setImageUrl(item.imageUrl);
        setPrompt(item.prompt);
        setIsHistoryOpen(false);
    };

    const handleImageUpload = useCallback(async (file: File) => {
        await imageUpload.upload(file);
    }, [imageUpload]);

    const handleGenerate = useCallback(async () => {
        if (!imageUpload.imageFile || !imageUpload.imageUrl) return;

        audioGen.reset();
        const result = await storyGen.generate(prompt, imageUpload.imageFile);

        if (result) {
            addToHistory(result.story, imageUpload.imageUrl, prompt, result.sources);
            await audioGen.generate(result.story);
        }
    }, [prompt, imageUpload.imageFile, imageUpload.imageUrl, storyGen, audioGen, addToHistory]);

    const handleRegenerateAudio = useCallback(() => {
        if (storyGen.story) {
            audioGen.generate(storyGen.story);
        }
    }, [storyGen.story, audioGen]);

    const error = storyGen.error || audioGen.error;
    const isGenerating = storyGen.isGenerating || audioGen.isGenerating || imageUpload.isCompressing;

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-slate-500">Loading...</div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    {/* Header */}
                    <header className="mb-10">
                        <div className="flex items-center justify-between">
                            <h1 className="text-5xl font-medium text-slate-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                                <span className="italic">Story</span> Weaver
                            </h1>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsHistoryOpen(true)}
                                    className="p-3 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors relative"
                                    title="History"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {history.length > 0 && (
                                        <span className="absolute top-1 right-1 bg-indigo-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                                            {history.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setIsSettingsOpen(true)}
                                    className="p-3 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
                                    title="Settings"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm mt-2">
                            Transform images into engaging English stories with AI narration
                        </p>
                    </header>

                    {/* Main Content - Two Columns */}
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-6 mb-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column: Image Upload */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium flex items-center justify-center">1</span>
                                    <h2 className="text-sm font-medium text-slate-700">Choose an image</h2>
                                </div>
                                <ImageUploader
                                    onImageUpload={handleImageUpload}
                                    imageUrl={imageUpload.imageUrl}
                                    isCompressing={imageUpload.isCompressing}
                                />
                            </div>

                            {/* Right Column: Story Settings */}
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium flex items-center justify-center">2</span>
                                    <h2 className="text-sm font-medium text-slate-700">Customize your story <span className="text-slate-400 font-normal">(optional)</span></h2>
                                </div>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Leave empty for a general story, or describe what you'd like:&#10;• A mystery story&#10;• A children's tale&#10;• Focus on the emotions&#10;• Write in simple English for beginners"
                                    className="flex-1 min-h-[180px] bg-slate-50/80 border border-slate-200 rounded-xl p-4 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 resize-none placeholder:text-slate-400 leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="mt-6">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !imageUpload.imageFile}
                                className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 disabled:from-slate-200 disabled:to-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 font-medium py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:shadow-none"
                            >
                                {isGenerating && <Spinner />}
                                {imageUpload.isCompressing ? 'Processing image...' :
                                 storyGen.isGenerating ? 'Writing your story...' :
                                 audioGen.isGenerating ? 'Creating audio narration...' :
                                 !imageUpload.imageFile ? 'Upload an image to start' :
                                 'Generate Story & Audio'}
                            </button>
                            {!imageUpload.imageFile && (
                                <p className="text-center text-xs text-slate-400 mt-2">
                                    AI will create a unique story and read it aloud for you
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {/* Story */}
                    {(storyGen.story || storyGen.isGenerating) && (
                        <div className="mb-4">
                            <StoryDisplay story={storyGen.story} isLoading={storyGen.isGenerating} onTranslate={handleTranslate} />
                        </div>
                    )}

                    {/* Audio */}
                    {(audioGen.audio || audioGen.isGenerating || audioGen.hasError || audioGen.isBrowserTTS) && (
                        <div className="mb-4">
                            <AudioPlayer
                                audio={audioGen.audio}
                                isLoading={audioGen.isGenerating}
                                ttsProvider={settings.ttsProvider}
                                hasError={audioGen.hasError}
                                onRegenerate={handleRegenerateAudio}
                                isBrowserTTS={audioGen.isBrowserTTS}
                                browserTTSText={audioGen.browserTTSText}
                            />
                        </div>
                    )}

                    {/* Sources */}
                    {storyGen.sources.length > 0 && <SourcesDisplay sources={storyGen.sources} />}
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
                onDelete={deleteFromHistory}
            />

            <AboutSection />
        </>
    );
}

export default App;
