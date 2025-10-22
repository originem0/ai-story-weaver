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
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
            <h3 className="text-base font-semibold mb-2 text-cyan-300">Context from the Web</h3>
            <ul className="space-y-2">
                {webSources.map((source, index) => (
                    <li key={index}>
                        <a
                            href={source.web?.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-400 hover:text-cyan-400 hover:underline transition-colors truncate block"
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