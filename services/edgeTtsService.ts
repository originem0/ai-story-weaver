// Edge TTS uses a free proxy service for Microsoft Edge Read Aloud
// Completely free, no API key required

export const generateEdgeSpeech = async (
  text: string,
  voiceName: string = 'alloy'
): Promise<ArrayBuffer> => {
  try {
    // Use the free Edge TTS proxy with OpenAI-compatible format
    const url = 'https://tts.travisvn.com/v1/audio/speech';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy_key', // No real API key needed
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voiceName, // alloy, echo, fable, onyx, nova, shimmer
        response_format: 'mp3',
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
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to Edge TTS service. The service may be temporarily unavailable.');
    } else if (error.message.includes('status: 429')) {
      throw new Error('Edge TTS service rate limit exceeded. Please try again in a few moments.');
    } else if (error.message.includes('status: 500') || error.message.includes('status: 503')) {
      throw new Error('Edge TTS service is currently unavailable. Please try again later or use a different TTS provider.');
    }

    throw new Error(`Edge TTS failed: ${error.message}`);
  }
};

export const validateEdgeTTSSettings = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Test with a very short text to validate the service
    const testText = 'Test';
    const url = 'https://tts.travisvn.com/v1/audio/speech';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy_key',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: testText,
        voice: 'alloy',
        response_format: 'mp3',
        speed: 1.0
      })
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Edge TTS service is currently unavailable (HTTP ${response.status}). The free proxy may be down. Please try again later or use Gemini/ElevenLabs TTS.`
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
      message: 'Edge TTS is ready! Free, unlimited text-to-speech via Microsoft Edge voices.'
    };
  } catch (error: any) {
    console.error('Edge TTS validation error:', error);

    if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
      return {
        success: false,
        message: 'Unable to connect to Edge TTS service. The free proxy service may be temporarily unavailable. Please try Gemini TTS instead.'
      };
    }

    return {
      success: false,
      message: `Edge TTS validation failed: ${error.message}. Please use Gemini or ElevenLabs TTS instead.`
    };
  }
};


