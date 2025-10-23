import React from 'react';
import { GroundingChunk } from '@google/genai';

interface SourcesDisplayProps {
    sources: GroundingChunk[];
}

export const SourcesDisplay: React.FC<SourcesDisplayProps> = ({ sources }) => {
    const webSources = sources.filter(source => source.web);

    if (webSources.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-5 rounded-xl border-2 border-blue-200/50 shadow-sm">
            <h3 className="text-base font-bold mb-3 text-blue-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Reference Sources
            </h3>
            <p className="text-xs text-slate-600 mb-3">This story was enriched with information from the following sources:</p>
            <ul className="space-y-2">
                {webSources.map((source, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <span className="text-teal-600 mt-1">•</span>
                        <a
                            href={source.web?.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-700 hover:text-teal-600 hover:underline transition-colors flex-1 leading-relaxed"
                            title={source.web?.title}
                        >
                            {source.web?.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};