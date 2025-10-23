const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export const generateElevenLabsSpeech = async (
    text: string,
    apiKey: string,
    voiceId: string
): Promise<ArrayBuffer> => {
    if (!apiKey || !voiceId) {
        throw new Error("ElevenLabs API key and Voice ID are required.");
    }

    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
        },
        body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
            },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`ElevenLabs API Error: ${errorData.detail?.message || response.statusText}`);
    }

    return response.arrayBuffer();
};

// --- Validation Function ---

interface ValidationResult {
    success: boolean;
    message: string;
    errorType?: 'network' | 'auth' | 'model' | 'config' | 'unknown';
}

export const validateElevenLabsSettings = async (apiKey: string, voiceId: string): Promise<ValidationResult> => {
    if (!apiKey || apiKey.trim() === '') {
        return { 
            success: false, 
            message: 'ElevenLabs API Key 不能为空。请在设置中填写。',
            errorType: 'config'
        };
    }
    
    if (!voiceId || voiceId.trim() === '') {
        return { 
            success: false, 
            message: 'Voice ID 不能为空。请在设置中填写有效的 Voice ID。',
            errorType: 'config'
        };
    }
    
    try {
        const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey,
            }
        });

        if (response.ok) {
            const voiceData = await response.json();
            const voiceName = voiceData.name || 'Unknown';
            return { 
                success: true, 
                message: `✅ ElevenLabs 配置有效！Voice: ${voiceName} (${voiceId})` 
            };
        }
        
        // Handle specific HTTP errors
        if (response.status === 401) {
            return { 
                success: false, 
                message: 'API Key 无效或未授权。请检查 ElevenLabs API Key 是否正确。',
                errorType: 'auth'
            };
        }
        
        if (response.status === 404) {
            return { 
                success: false, 
                message: `Voice ID "${voiceId}" 不存在。请检查 Voice ID 是否正确，或访问 ElevenLabs 获取可用的 Voice ID。`,
                errorType: 'model'
            };
        }
        
        if (response.status === 429) {
            return { 
                success: false, 
                message: 'API 请求过于频繁或配额已用尽。请稍后再试。',
                errorType: 'config'
            };
        }
        
        // Generic HTTP error
        const errorData = await response.json().catch(() => ({}));
        return { 
            success: false, 
            message: errorData.detail?.message || `HTTP 错误 ${response.status}: ${response.statusText}`,
            errorType: 'unknown'
        };

    } catch (e: any) {
        console.error("ElevenLabs Validation Error:", e);
        
        // Network errors
        if (e.message.includes('fetch') || e.message.includes('network') || e.name === 'TypeError') {
            return { 
                success: false, 
                message: '网络连接失败。请检查网络连接、防火墙或 CORS 设置。如果是浏览器 CORS 错误，建议使用后端代理。',
                errorType: 'network'
            };
        }
        
        return { 
            success: false, 
            message: `未知错误: ${e.message}`,
            errorType: 'unknown'
        };
    }
};