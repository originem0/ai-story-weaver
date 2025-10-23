import React, { useState, useEffect, useRef } from 'react';
import { createWavBlob, decode } from '../utils/audioUtils';

interface AudioPlayerProps {
    base64Audio: string | null;
    arrayBufferAudio: ArrayBuffer | null;
    isLoading: boolean;
    ttsProvider: 'gemini' | 'elevenlabs';
    hasError: boolean;
    onRegenerate: () => void;
}

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PauseIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SpeakerIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


export const AudioPlayer: React.FC<AudioPlayerProps> = ({ base64Audio, arrayBufferAudio, isLoading, ttsProvider, hasError, onRegenerate }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    useEffect(() => {
        let objectUrl: string | null = null;
        try {
            if (ttsProvider === 'gemini' && base64Audio) {
                 const audioData = decode(base64Audio);
                 const blob = createWavBlob(audioData, 24000, 1);
                 objectUrl = URL.createObjectURL(blob);
            } else if (ttsProvider === 'elevenlabs' && arrayBufferAudio) {
                const blob = new Blob([arrayBufferAudio], { type: 'audio/mpeg' });
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
            if (!hasError) { // Don't reset states if we need to show the retry button
                 setAudioSrc(null);
                 setIsPlaying(false);
                 setCurrentTime(0);
                 setDuration(0);
            }
        };
    }, [base64Audio, arrayBufferAudio, ttsProvider, hasError]);

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

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };
    
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(audioRef.current) {
            audioRef.current.currentTime = Number(e.target.value);
        }
    }

    const formatTime = (time: number) => {
        if (isNaN(time) || time === 0) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };
    
    const handleDownload = () => {
        if (!audioSrc) return;
        
        const link = document.createElement('a');
        link.href = audioSrc;
        link.download = `story-narration-${Date.now()}.${ttsProvider === 'gemini' ? 'wav' : 'mp3'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="bg-white p-4 rounded-lg border-2 border-slate-200 shadow-sm flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <p className="text-slate-600">🎙️ Generating audio narration...</p>
            </div>
        );
    }

    if (hasError) {
        return (
             <div className="bg-slate-900/70 p-4 rounded-lg flex items-center justify-between border border-red-500/50">
                <p className="text-red-400">Failed to generate audio.</p>
                <button
                    onClick={onRegenerate}
                    className="px-3 py-1 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                    Retry
                </button>
            </div>
        );
    }
    
    if (!audioSrc) {
         return (
            <div className="bg-slate-900/70 p-4 rounded-lg flex flex-col items-center justify-center border border-slate-700">
                 <h3 className="text-lg font-semibold text-purple-300 mb-2">Narration</h3>
                <p className="text-slate-500">Audio will be available here.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-slate-200/50 shadow-lg">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-slate-200">
                <h3 className="text-base font-bold text-slate-900">🎙️ Audio Narration</h3>
                <button
                    onClick={handleDownload}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
                    title="Download audio"
                >
                    <DownloadIcon />
                    <span>Download</span>
                </button>
            </div>
            <div className="flex items-center space-x-4">
                <audio
                    ref={audioRef}
                    src={audioSrc}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                />
                <button onClick={togglePlayPause} className="text-teal-600 hover:text-teal-700 transition-colors">
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <div className="flex items-center space-x-2 flex-grow">
                    <span className="text-xs text-slate-600 w-10 text-center">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer range-sm accent-teal-600"
                    />
                    <span className="text-xs text-slate-600 w-10 text-center">{formatTime(duration)}</span>
                </div>
                <div className="text-slate-500">
                    <SpeakerIcon />
                </div>
            </div>
        </div>
    );
};