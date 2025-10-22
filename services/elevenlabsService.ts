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
export const validateElevenLabsSettings = async (apiKey: string, voiceId: string) => {
    if (!apiKey || !voiceId) {
        return { success: false, message: 'API Key and Voice ID are required.' };
    }
    try {
        const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey,
            }
        });

        if (response.ok) {
            return { success: true, message: 'API Key and Voice ID are valid.' };
        } else {
            const errorData = await response.json();
            return { success: false, message: errorData.detail?.message || `HTTP Error ${response.status}` };
        }

    } catch (e: any) {
        console.error("ElevenLabs Validation Error:", e);
        return { success: false, message: `Network or API error: ${e.message}` };
    }
};