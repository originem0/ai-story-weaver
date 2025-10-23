// Edge TTS uses a free proxy service for Microsoft Edge Read Aloud
// Completely free, no API key required

export const generateEdgeSpeech = async (
  text: string,
  voiceName: string = 'en-US-AriaNeural'
): Promise<ArrayBuffer> => {
  try {
    // Use a free Edge TTS proxy service
    // This endpoint mimics the OpenAI TTS API but uses Edge TTS backend
    const url = 'https://tts.travisvn.com/api/tts';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice: voiceName,
        language: 'en-US',
        speed: 1.0
      })
    });

    if (!response.ok) {
      throw new Error(`Edge TTS service responded with status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    // Check if we got valid audio data
    if (arrayBuffer.byteLength < 100) {
      throw new Error('Received invalid audio data from Edge TTS service');
    }

    return arrayBuffer;
  } catch (error: any) {
    console.error('Edge TTS error:', error);

    // Provide helpful error messages
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to Edge TTS service. Please check your internet connection.');
    } else if (error.message.includes('status: 429')) {
      throw new Error('Edge TTS service rate limit exceeded. Please try again in a few moments.');
    } else if (error.message.includes('status: 500')) {
      throw new Error('Edge TTS service is currently unavailable. Please try again later or use a different TTS provider.');
    }

    throw new Error(`Edge TTS failed: ${error.message}`);
  }
};

export const validateEdgeTTSSettings = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Test with a very short text to validate the service
    const testText = 'Test';
    const url = 'https://tts.travisvn.com/api/tts';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: testText,
        voice: 'en-US-AriaNeural',
        language: 'en-US',
        speed: 1.0
      })
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Edge TTS service is currently unavailable (HTTP ${response.status}). Please try again later or use a different TTS provider.`
      };
    }

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength < 100) {
      return {
        success: false,
        message: 'Edge TTS service validation failed. The service might be experiencing issues.'
      };
    }

    return {
      success: true,
      message: 'Edge TTS is ready! Free, unlimited text-to-speech with natural-sounding voices.'
    };
  } catch (error: any) {
    console.error('Edge TTS validation error:', error);

    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        success: false,
        message: 'Unable to connect to Edge TTS service. Please check your internet connection.'
      };
    }

    return {
      success: false,
      message: `Edge TTS validation failed: ${error.message}`
    };
  }
};

