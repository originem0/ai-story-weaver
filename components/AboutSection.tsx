import React, { useState } from 'react';

export const AboutSection: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="fixed left-4 top-4 z-40">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm border border-slate-200/60"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="whitespace-nowrap">How it helps</span>
            </button>

            {isExpanded && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40"
                        onClick={() => setIsExpanded(false)}
                    />
                    <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200/60 p-5 space-y-4 text-sm text-slate-600 leading-relaxed z-50 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-slate-800">Why "Picture Description"?</h3>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="text-slate-500">
                            Picture description (看图说话) trains the fluency of your <strong>"perception → understanding → expression"</strong> pathway — not just vocabulary, but the speed and smoothness of converting what you see into words.
                        </p>

                        <div>
                            <h4 className="font-medium text-slate-700 mb-2 text-xs uppercase tracking-wide">What You'll Learn</h4>
                            <ul className="space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span><strong>Precise vocabulary</strong> — specific words that capture visual details</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span><strong>Sentence patterns</strong> — varied structures for description and narration</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span><strong>Logical flow</strong> — how to organize observations into coherent expression</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-medium text-slate-700 mb-2 text-xs uppercase tracking-wide">How to Use</h4>
                            <ol className="space-y-1.5 list-decimal list-inside text-slate-500">
                                <li>Upload an image and generate a model essay</li>
                                <li>Study the three-layer structure: Observation → Interpretation → Expression</li>
                                <li>Listen to the audio for pronunciation and rhythm</li>
                                <li>Try describing the same image yourself, then compare</li>
                            </ol>
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                            <p className="text-xs text-slate-400">
                                First time? Go to Settings to add your Gemini API key.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
