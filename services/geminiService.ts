import { GoogleGenAI, GenerateContentResponse, GroundingChunk, Modality } from "@google/genai";

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export interface StoryResult {
    story: string;
    sources: GroundingChunk[];
}

const getAIClient = (apiKey?: string) => {
    return new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });
}

export const generateStory = async (
    prompt: string,
    imageFile: File | null,
    model: string,
    apiKey?: string
): Promise<StoryResult> => {
    const ai = getAIClient(apiKey);
    const contents: any = { parts: [{ text: `
    Analyze the provided image with strict accuracy. Describe only what is clearly visible. Do not invent details or make assumptions about ambiguous elements (e.g., if gender isn't clear, use "a person").

    After describing the image, determine if it depicts a well-known person, place, or a significant event by using the search tool. Prioritize official and reputable sources.

    - If it IS a significant event/person/place: Weave the factual context into a compelling narrative based on the image.
    - If it is NOT a significant event/person/place: Focus primarily on a deep, creative interpretation of the visual details in the image. Use search results only for minor contextual details if necessary.

    The final story should be vivid, creative, and engaging for an English learner.
    
    Here is the user's initial prompt: "${prompt}"
    ` }] };

    if (imageFile) {
        const base64Image = await fileToBase64(imageFile);
        contents.parts.unshift({
            inlineData: {
                data: base64Image,
                mimeType: imageFile.type,
            },
        });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const story = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { story, sources };
};

export const generateGeminiSpeech = async (
    text: string,
    model: string,
    apiKey?: string
): Promise<string | undefined> => {
    const ai = getAIClient(apiKey);
    const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: `Read this story in a natural, human-like voice, with engaging and varied intonation suitable for an English learner. Avoid a robotic tone. Story: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("The API did not return any audio data.");
    }
    return base64Audio;
};


// --- Validation Functions ---
export const validateGeminiStoryModel = async (apiKey: string, model: string) => {
    try {
        const ai = getAIClient(apiKey);
        const response = await ai.models.generateContent({
            model,
            contents: 'test',
            config: { maxOutputTokens: 1 }
        });
        if (response.text) {
            return { success: true, message: 'Story model and API key are valid.' };
        }
        // This case might not be hit if API throws an error first, but as a fallback.
        return { success: false, message: 'Model test call succeeded but returned no data.' };
    } catch (e: any) {
        console.error("Gemini Story Model Validation Error:", e);
        return { success: false, message: `Story Model Error: ${e.message}` };
    }
};

export const validateGeminiTTSModel = async (apiKey: string, model: string) => {
     try {
        const ai = getAIClient(apiKey);
        await ai.models.generateContent({
            model,
            contents: [{ parts: [{ text: 'test' }] }],
            config: {
                responseModalities: [Modality.AUDIO],
            },
        });
        return { success: true, message: 'TTS model and API key are valid.' };
    } catch (e: any) {
        console.error("Gemini TTS Validation Error:", e);
        return { success: false, message: `Gemini TTS Error: ${e.message}` };
    }
}