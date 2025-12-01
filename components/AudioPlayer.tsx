import React, { useState, useEffect, useRef } from 'react';
import { createWavBlob, decode } from '../utils/audioUtils';
import { AudioData } from '../types';
import { AUDIO_CONFIG } from '../constants';
import { generateBrowserSpeech, stopBrowserSpeech } from '../services/browserTtsService';

interface AudioPlayerProps {
    audio: AudioData | null;
    isLoading: boolean;
    ttsProvider: 'gemini' | 'elevenlabs' | 'edge' | 'browser';
    hasError: boolean;
    onRegenerate: () => void;
    isBrowserTTS?: boolean;
    browserTTSText?: string | null;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
    audio,
    isLoading,
    hasError,
    onRegenerate,
    isBrowserTTS = false,
    browserTTSText = null
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        let objectUrl: string | null = null;
        try {
            if (audio?.type === 'base64' && typeof audio.data === 'string') {
                const audioData = decode(audio.data);
                const blob = createWavBlob(audioData, AUDIO_CONFIG.GEMINI_SAMPLE_RATE, AUDIO_CONFIG.GEMINI_CHANNELS);
                objectUrl = URL.createObjectURL(blob);
            } else if (audio?.type === 'arraybuffer' && audio.data instanceof ArrayBuffer) {
                const blob = new Blob([audio.data], { type: 'audio/mpeg' });
                objectUrl = URL.createObjectURL(blob);
            }

            if (objectUrl) {
                setAudioSrc(objectUrl);
            }
        } catch (error) {
            console.error("Error creating audio source:", error);
            setAudioSrc(null);
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
            if (!hasError) {
                setAudioSrc(null);
                setIsPlaying(false);
                setCurrentTime(0);
                setDuration(0);
            }
        };
    }, [audio, hasError]);

    // 清理 Browser TTS
    useEffect(() => {
        return () => {
            stopBrowserSpeech();
        };
    }, []);

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Number(e.target.value);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleDownload = () => {
        if (!audioSrc || !audio) return;
        const link = document.createElement('a');
        link.href = audioSrc;
        const extension = audio.type === 'base64' ? 'wav' : 'mp3';
        link.download = `story-${Date.now()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Browser TTS 播放控制
    const handleBrowserTTSPlay = async () => {
        if (!browserTTSText) return;

        if (isPlaying) {
            stopBrowserSpeech();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            try {
                await generateBrowserSpeech(browserTTSText);
            } catch (e) {
                console.error('Browser TTS error:', e);
            } finally {
                setIsPlaying(false);
            }
        }
    };

    const handleBrowserTTSStop = () => {
        stopBrowserSpeech();
        setIsPlaying(false);
    };

    if (isLoading) {
        return (
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5 flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-300 border-t-indigo-500"></div>
                <span className="text-sm text-slate-600">Creating audio narration...</span>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="bg-red-50/50 border border-red-200/60 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-sm text-red-600">Audio generation failed</span>
                <button
                    onClick={onRegenerate}
                    className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Browser TTS 播放器（简化版，无进度条）
    if (isBrowserTTS && browserTTSText) {
        return (
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-medium text-slate-700">Listen & Learn</h3>
                    <span className="text-xs text-slate-400 ml-auto">Browser TTS (offline)</span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBrowserTTSPlay}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md flex-shrink-0"
                    >
                        {isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                <rect x="14" y="4" width="4" height="16" rx="1" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>
                    <div className="flex-1 flex items-center">
                        <span className="text-sm text-slate-500">
                            {isPlaying ? 'Speaking...' : 'Click to play with browser voice'}
                        </span>
                    </div>
                    {isPlaying && (
                        <button
                            onClick={handleBrowserTTSStop}
                            className="p-2.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Stop"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="1" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!audioSrc) return null;

    return (
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-sm font-medium text-slate-700">Listen & Learn</h3>
                <span className="text-xs text-slate-400 ml-auto">Follow along to improve pronunciation</span>
            </div>
            <audio
                ref={audioRef}
                src={audioSrc}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
                onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
            />
            <div className="flex items-center gap-4">
                <button
                    onClick={togglePlayPause}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md flex-shrink-0"
                >
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" rx="1" />
                            <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}
                </button>
                <div className="flex-1 flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-10 text-right font-mono">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-sm"
                    />
                    <span className="text-xs text-slate-500 w-10 font-mono">{formatTime(duration)}</span>
                </div>
                <button
                    onClick={handleDownload}
                    className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Download audio"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
