import React, { useState } from 'react';

interface StoryDisplayProps {
    story: string;
    isLoading: boolean;
}

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


export const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isLoading }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (story) {
            navigator.clipboard.writeText(story).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
            });
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl flex flex-col border border-slate-200/50 shadow-lg h-full">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">📖 Generated Story</h3>
                {story && !isLoading && (
                     <button
                        onClick={handleCopy}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                        disabled={copied}
                    >
                        <CopyIcon />
                        <span>{copied ? '✓ Copied!' : 'Copy'}</span>
                    </button>
                )}
            </div>
            <div className="flex-grow overflow-y-auto pr-2 text-slate-900 custom-scrollbar leading-relaxed">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                        <p className="text-slate-500 italic">✨ Creating your story...</p>
                    </div>
                ) : story ? (
                    <p className="whitespace-pre-wrap text-base">{story}</p>
                ) : null}
            </div>
        </div>
    );
};