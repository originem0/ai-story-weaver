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
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex justify-end z-50" onClick={onClose}>
            <div
                className="bg-white h-full w-full max-w-sm shadow-xl overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 z-10">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-slate-800">History</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {history.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-400 text-sm">No stories yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-slate-50 rounded-xl p-3 hover:bg-slate-100 transition-colors cursor-pointer group"
                                    onClick={() => onSelect(item)}
                                >
                                    <div className="flex gap-3">
                                        <img
                                            src={item.imageUrl}
                                            alt=""
                                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                        />
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <p className="text-[10px] text-slate-400">{formatDate(item.timestamp)}</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(item.id);
                                                    }}
                                                    className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.story}</p>
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
