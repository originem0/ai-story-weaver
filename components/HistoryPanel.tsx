import React from 'react';
import { GroundingChunk } from '@google/genai';

interface StoryHistory {
    id: string;
    story: string;
    imageUrl: string;
    prompt: string;
    timestamp: number;
    sources: GroundingChunk[];
}

interface HistoryPanelProps {
    history: StoryHistory[];
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: StoryHistory) => void;
    onDelete: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, isOpen, onClose, onSelect, onDelete }) => {
    if (!isOpen) return null;

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50" onClick={onClose}>
            <div
                className="bg-white h-full w-full max-w-md shadow-2xl overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6 shadow-lg z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Story History</h2>
                            <p className="text-teal-100 text-sm mt-1">Recently generated stories (max 5)</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                            aria-label="Close history"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {history.length === 0 ? (
                        <div className="text-center py-16">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-slate-500 text-lg">No stories yet</p>
                            <p className="text-slate-400 text-sm mt-2">Create your first story to see it here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex gap-3">
                                        <img
                                            src={item.imageUrl}
                                            alt="Story thumbnail"
                                            className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border-2 border-slate-300"
                                        />
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="text-xs text-slate-500">{formatDate(item.timestamp)}</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(item.id);
                                                    }}
                                                    className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                            {item.prompt && (
                                                <p className="text-xs text-slate-600 mb-2 line-clamp-2 italic">"{item.prompt}"</p>
                                            )}
                                            <p className="text-sm text-slate-800 line-clamp-3 leading-relaxed">{item.story}</p>
                                            <button
                                                onClick={() => onSelect(item)}
                                                className="mt-3 text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View Full Story
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
