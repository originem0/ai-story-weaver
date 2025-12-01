import { GroundingChunk } from '@google/genai';

export interface StoryHistory {
    id: string;
    story: string;
    imageUrl: string;
    prompt: string;
    timestamp: number;
    sources: GroundingChunk[];
}

export interface AudioData {
    type: 'base64' | 'arraybuffer';
    data: string | ArrayBuffer;
}
