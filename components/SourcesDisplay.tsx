import React from 'react';
import { GroundingChunk } from '@google/genai';

interface SourcesDisplayProps {
    sources: GroundingChunk[];
}

export const SourcesDisplay: React.FC<SourcesDisplayProps> = ({ sources }) => {
    const webSources = sources.filter(source => source.web);

    if (webSources.length === 0) return null;

    return (
        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-4">
            <div className="text-xs text-slate-500 mb-2">Reference sources</div>
            <div className="flex flex-wrap gap-2">
                {webSources.map((source, index) => (
                    <a
                        key={index}
                        href={source.web?.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors truncate max-w-[200px]"
                        title={source.web?.title}
                    >
                        {source.web?.title}
                    </a>
                ))}
            </div>
        </div>
    );
};