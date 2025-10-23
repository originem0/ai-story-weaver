import React, { useState, useMemo } from 'react';
import { marked } from 'marked';

interface StoryDisplayProps {
    story: string;
    isLoading: boolean;
    onTranslate: (text: string) => Promise<string>;
}

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const TranslateIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
);


export const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, isLoading, onTranslate }) => {
    const [copied, setCopied] = useState(false);
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showOriginal, setShowOriginal] = useState(true);

    const displayText = showOriginal ? story : translatedText || story;

    const htmlContent = useMemo(() => {
        if (!displayText) return '';
        return marked(displayText, { breaks: true });
    }, [displayText]);

    const handleCopy = () => {
        if (displayText) {
            navigator.clipboard.writeText(displayText).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const handleTranslate = async () => {
        if (!story) return;

        if (translatedText) {
            setShowOriginal(!showOriginal);
            return;
        }

        setIsTranslating(true);
        try {
            const translated = await onTranslate(story);
            setTranslatedText(translated);
            setShowOriginal(false);
        } catch (error) {
            console.error('Translation failed:', error);
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl flex flex-col border border-slate-200/50 shadow-lg h-full">
            <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">📖 Generated Story</h3>
                {story && !isLoading && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleTranslate}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-teal-600 bg-slate-100 hover:bg-teal-50 transition-colors disabled:opacity-50"
                            disabled={isTranslating}
                        >
                            {isTranslating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                                    <span>Translating...</span>
                                </>
                            ) : (
                                <>
                                    <TranslateIcon />
                                    <span>{translatedText ? (showOriginal ? '中文' : 'English') : '翻译'}</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleCopy}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                            disabled={copied}
                        >
                            <CopyIcon />
                            <span>{copied ? '✓ Copied!' : 'Copy'}</span>
                        </button>
                    </div>
                )}
            </div>
            <div className="flex-grow overflow-y-auto pr-2 text-slate-900 custom-scrollbar leading-relaxed">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                        <p className="text-slate-500 italic">✨ Creating your story...</p>
                    </div>
                ) : story ? (
                    <div
                        className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-800 prose-strong:text-slate-900 prose-em:text-slate-700"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                ) : null}
            </div>
        </div>
    );
};