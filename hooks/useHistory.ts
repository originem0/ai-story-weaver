import { useState, useEffect, useCallback } from 'react';
import { StoryHistory } from '../types';
import { GroundingChunk } from '@google/genai';
import { STORAGE_KEYS, LIMITS } from '../constants';

export const useHistory = () => {
    const [history, setHistory] = useState<StoryHistory[]>([]);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }, []);

    const addToHistory = useCallback((
        story: string,
        imageUrl: string,
        prompt: string,
        sources: GroundingChunk[]
    ) => {
        if (!story || !imageUrl) return;

        const newItem: StoryHistory = {
            id: Date.now().toString(),
            story,
            imageUrl,
            prompt,
            timestamp: Date.now(),
            sources,
        };

        setHistory(prev => {
            const updated = [newItem, ...prev].slice(0, LIMITS.MAX_HISTORY_ITEMS);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const deleteFromHistory = useCallback((id: string) => {
        setHistory(prev => {
            const updated = prev.filter(item => item.id !== id);
            localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    return {
        history,
        addToHistory,
        deleteFromHistory,
    };
};
