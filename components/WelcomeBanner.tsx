import React, { useState, useEffect } from 'react';

export const WelcomeBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('ai-story-weaver-welcome-seen');
        if (!hasSeenWelcome) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem('ai-story-weaver-welcome-seen', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white p-6 rounded-2xl shadow-lg mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

            <div className="relative z-10">
                <button
                    onClick={handleDismiss}
                    className="absolute top-0 right-0 text-white/80 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
                    aria-label="Close welcome banner"
                >
                    ×
                </button>

                <h2 className="text-2xl font-bold mb-3">=K Welcome to AI Story Weaver!</h2>
                <div className="space-y-2 text-white/90">
                    <p className="flex items-start gap-2">
                        <span className="text-yellow-300">"</span>
                        <span><strong>Upload an image</strong> - Any photo, artwork, or scene</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="text-yellow-300">"</span>
                        <span><strong>Add a prompt</strong> (optional) - Guide the story direction</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <span className="text-yellow-300">"</span>
                        <span><strong>Listen & learn</strong> - AI narrates the story for English practice</span>
                    </p>
                </div>
                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-sm">
                    =¡ <strong>Pro tip:</strong> Configure your API keys in Settings (top right) for the best experience
                </div>
            </div>
        </div>
    );
};
