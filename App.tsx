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
            setError(`Audio generation failed: ${e.message}`);
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
            setError(`An error occurred during story generation: ${e.message}`);
        } finally {
            setIsGeneratingStory(false);
        }
    }, [prompt, imageFile, settings, handleGenerateAudio]);


    if (!isLoaded) {
        return <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">Loading settings...</div>
    }

    return (
        <>
            <div className="bg-slate-900 text-white min-h-screen font-sans">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <header className="text-center mb-8 relative">
                         <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text pb-2">
                            AI Story Weaver
                        </h1>
                        <p className="text-slate-400">
                           Craft magical stories from your imagination, powered by AI.
                        </p>
                         <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="absolute top-0 right-0 text-slate-400 hover:text-purple-400 transition-colors"
                            aria-label="Open settings"
                        >
                            <SettingsIcon />
                        </button>
                    </header>

                    <main className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                               <ImageUploader onImageUpload={handleImageUpload} imageUrl={imageUrl} />
                               <div>
                                    <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-1">
                                        Describe your story
                                    </label>
                                    <textarea
                                        id="prompt"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="e.g., A brave knight and a clever dragon team up to find a hidden treasure..."
                                        className="w-full h-36 bg-slate-800 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition resize-none"
                                        rows={4}
                                    />
                               </div>
                            </div>
                            <StoryDisplay story={story} isLoading={isGeneratingStory} />
                        </div>

                         <div className="text-center">
                            <button
                                onClick={handleGenerateStory}
                                disabled={isGeneratingStory || isGeneratingAudio}
                                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-flex items-center"
                            >
                                {isGeneratingStory || isGeneratingAudio ? <Spinner /> : null}
                                {isGeneratingStory ? 'Weaving your story...' : (isGeneratingAudio ? 'Narrating story...' : 'Create Story & Speech')}
                            </button>
                        </div>

                        {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center">{error}</div>}

                        <AudioPlayer
                            base64Audio={geminiAudio}
                            arrayBufferAudio={elevenlabsAudio}
                            isLoading={isGeneratingAudio}
                            ttsProvider={settings.ttsProvider}
                            hasError={audioError}
                            onRegenerate={() => story && handleGenerateAudio(story)}
                        />

                        <SourcesDisplay sources={sources} />

                    </main>
                    
                     <footer className="text-center mt-12 text-slate-500 text-sm">
                        <p>Powered by Configurable AI Models.</p>
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