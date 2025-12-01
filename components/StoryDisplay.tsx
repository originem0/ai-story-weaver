import React, { useState, useMemo } from 'react';
import { marked } from 'marked';

interface StoryDisplayProps {
    story: string;
    isLoading: boolean;
    onTranslate: (text: string) => Promise<string>;
}

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

    if (isLoading) {
        return (
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-indigo-500"></div>
                <p className="mt-4 text-sm text-slate-600">Writing your story...</p>
                <p className="text-xs text-slate-400 mt-1">This may take a moment</p>
            </div>
        );
    }

    if (!story) return null;

    return (
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-medium text-slate-700">Your Story</h3>
                <div className="flex gap-1">
                    <button
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                        {isTranslating ? 'Translating...' : (translatedText ? (showOriginal ? 'Chinese' : 'English') : 'Translate')}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
            {/* Content */}
            <div className="p-5">
                <article className="prose prose-sm prose-slate max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </article>
            </div>
        </div>
    );
};