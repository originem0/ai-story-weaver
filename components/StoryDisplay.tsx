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
        <div className="bg-slate-900/70 p-4 rounded-lg h-80 flex flex-col border border-slate-700">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-purple-300">Generated Story</h3>
                {story && !isLoading && (
                     <button
                        onClick={handleCopy}
                        className="flex items-center space-x-1.5 text-sm text-slate-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                        disabled={copied}
                    >
                        <CopyIcon />
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                )}
            </div>
            <div className="flex-grow overflow-y-auto pr-2 text-slate-300 custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-400 italic">The AI is searching the web and dreaming up a story...</p>
                    </div>
                ) : story ? (
                    <p className="whitespace-pre-wrap">{story}</p>
                ) : (
                    <div className="flex items-center justify-center h-full">
                         <p className="text-slate-500">Your story will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};