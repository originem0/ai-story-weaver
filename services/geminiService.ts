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
    // 优先级：1. Settings 中的 API Key  2. 环境变量中的 API Key
    const finalApiKey = (apiKey && apiKey.trim() !== '') ? apiKey : process.env.API_KEY;
    return new GoogleGenAI({ apiKey: finalApiKey });
}

// --- Helper: Retry Logic with Exponential Backoff ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 2000
): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            const errorStr = JSON.stringify(error);
            const errorMessage = error.message || error.toString();
            
            // 只对特定错误重试（503 过载、429 限流、网络错误）
            const shouldRetry = 
                errorStr.includes('503') || 
                errorStr.includes('UNAVAILABLE') ||
                errorStr.includes('overloaded') ||
                errorMessage.includes('503') || 
                errorMessage.includes('overloaded') ||
                errorMessage.includes('429') ||
                errorMessage.includes('rate limit') ||
                errorMessage.includes('UNAVAILABLE') ||
                errorMessage.includes('network') ||
                errorMessage.includes('timeout');
            
            if (!shouldRetry || attempt === maxRetries - 1) {
                throw error;
            }
            
            // 指数退避：2s, 4s, 8s
            const delayTime = initialDelay * Math.pow(2, attempt);
            console.log(`⏳ API 请求失败，${delayTime / 1000}秒后自动重试 (${attempt + 1}/${maxRetries})...`);
            await delay(delayTime);
        }
    }
    
    throw lastError;
};

export const generateStory = async (
    prompt: string,
    imageFile: File | null,
    model: string,
    apiKey?: string
): Promise<StoryResult> => {
    return retryWithBackoff(async () => {
        const ai = getAIClient(apiKey);
        
        // 构建基础提示词
        let basePrompt = `Analyze the provided image with strict accuracy. Describe only what is clearly visible. Do not invent details or make assumptions about ambiguous elements (e.g., if gender isn't clear, use "a person").

After describing the image, determine if it depicts a well-known person, place, or a significant event by using the search tool. Prioritize official and reputable sources.

- If it IS a significant event/person/place: Weave the factual context into a compelling narrative based on the image.
- If it is NOT a significant event/person/place: Focus primarily on a deep, creative interpretation of the visual details in the image. Use search results only for minor contextual details if necessary.

The final story should be vivid, creative, and engaging.`;

        // 如果用户提供了自定义提示，优先采纳
        if (prompt && prompt.trim() !== '') {
            basePrompt += `\n\n**User's Custom Requirements (PRIORITY):**\n${prompt}`;
        }
        
        const contents: any = { parts: [{ text: basePrompt }] };

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
    }, 3, 2000); // 最多重试3次，初始延迟2秒
};

export const generateGeminiSpeech = async (
    text: string,
    model: string,
    apiKey?: string
): Promise<string | undefined> => {
    return retryWithBackoff(async () => {
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
    }, 3, 2000); // 最多重试3次，初始延迟2秒
};


// --- Validation Functions ---

interface ValidationResult {
    success: boolean;
    message: string;
    errorType?: 'network' | 'auth' | 'model' | 'config' | 'unknown';
}

const parseGeminiError = (error: any): { message: string; errorType: ValidationResult['errorType'] } => {
    const errorMessage = error.message || error.toString();
    
    // Network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED')) {
        return {
            message: '网络连接失败。请检查网络连接是否正常，或检查防火墙/代理设置。',
            errorType: 'network'
        };
    }
    
    // Authentication errors
    if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('invalid_api_key')) {
        return {
            message: 'API Key 无效或未授权。请检查 Gemini API Key 是否正确，是否已启用。',
            errorType: 'auth'
        };
    }
    
    // Model not found or unsupported
    if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('does not exist') || errorMessage.includes('model')) {
        return {
            message: `模型 "${errorMessage.includes('model') ? '指定的模型' : ''}" 不存在或不可用。请检查模型名称是否正确，或该模型是否对你的 API Key 可用。`,
            errorType: 'model'
        };
    }
    
    // Quota/Rate limit errors
    if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        return {
            message: 'API 配额已用尽或请求过于频繁。请稍后再试或检查配额限制。',
            errorType: 'config'
        };
    }
    
    // Configuration errors (e.g., TTS not supported)
    if (errorMessage.includes('modality') || errorMessage.includes('audio') || errorMessage.includes('not supported')) {
        return {
            message: '该模型不支持请求的功能（如 TTS）。请选择支持该功能的模型。',
            errorType: 'config'
        };
    }
    
    // Generic error
    return {
        message: `未知错误: ${errorMessage}`,
        errorType: 'unknown'
    };
};

export const validateGeminiStoryModel = async (apiKey: string, model: string): Promise<ValidationResult> => {
    if (!apiKey || apiKey.trim() === '') {
        return { 
            success: false, 
            message: 'API Key 不能为空。请在设置中填写有效的 Gemini API Key。',
            errorType: 'config'
        };
    }
    
    if (!model || model.trim() === '') {
        return { 
            success: false, 
            message: '模型名称不能为空。请选择或输入有效的模型名称。',
            errorType: 'config'
        };
    }
    
    try {
        const ai = getAIClient(apiKey);
        const response = await ai.models.generateContent({
            model,
            contents: 'test',
            config: { maxOutputTokens: 5 }
        });
        
        if (response.text) {
            return { 
                success: true, 
                message: `✅ 故事生成模型 "${model}" 验证成功！API Key 有效。` 
            };
        }
        
        return { 
            success: false, 
            message: '模型调用成功但未返回数据。这可能是模型配置问题。',
            errorType: 'config'
        };
    } catch (e: any) {
        console.error("Gemini Story Model Validation Error:", e);
        const { message, errorType } = parseGeminiError(e);
        return { success: false, message, errorType };
    }
};

export const validateGeminiTTSModel = async (apiKey: string, model: string): Promise<ValidationResult> => {
    if (!apiKey || apiKey.trim() === '') {
        return { 
            success: false, 
            message: 'API Key 不能为空。请在设置中填写有效的 Gemini API Key。',
            errorType: 'config'
        };
    }
    
    if (!model || model.trim() === '') {
        return { 
            success: false, 
            message: 'TTS 模型名称不能为空。请选择或输入有效的 TTS 模型名称。',
            errorType: 'config'
        };
    }
    
    try {
        const ai = getAIClient(apiKey);
        const response = await ai.models.generateContent({
            model,
            contents: [{ parts: [{ text: 'test' }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                    },
                },
            },
        });
        
        const hasAudio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (hasAudio) {
            return { 
                success: true, 
                message: `✅ TTS 模型 "${model}" 验证成功！支持语音生成。` 
            };
        }
        
        return { 
            success: false, 
            message: `模型 "${model}" 调用成功但未返回音频数据。该模型可能不支持 TTS 功能。`,
            errorType: 'config'
        };
    } catch (e: any) {
        console.error("Gemini TTS Validation Error:", e);
        const { message, errorType } = parseGeminiError(e);
        return { success: false, message, errorType };
    }
};