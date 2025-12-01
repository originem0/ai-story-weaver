// Browser native TTS using Web Speech API
// Completely free, no API key required, works offline

export const generateBrowserSpeech = (
    text: string,
    voiceName?: string,
    rate: number = 0.9,
    pitch: number = 1
): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!('speechSynthesis' in window)) {
            reject(new Error('Browser does not support speech synthesis'));
            return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.lang = 'en-US';

        // Try to find a good English voice
        const voices = window.speechSynthesis.getVoices();
        if (voiceName) {
            const selectedVoice = voices.find(v => v.name === voiceName);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        } else {
            // Prefer native English voices
            const englishVoice = voices.find(v =>
                v.lang.startsWith('en') && (
                    v.name.includes('Google') ||
                    v.name.includes('Microsoft') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Daniel') ||
                    v.localService === false // Cloud voices are usually better
                )
            ) || voices.find(v => v.lang.startsWith('en'));

            if (englishVoice) {
                utterance.voice = englishVoice;
            }
        }

        utterance.onend = () => resolve();
        utterance.onerror = (event) => {
            if (event.error === 'canceled') {
                resolve(); // User canceled, not an error
            } else {
                reject(new Error(`Speech synthesis error: ${event.error}`));
            }
        };

        window.speechSynthesis.speak(utterance);
    });
};

export const getBrowserVoices = (): SpeechSynthesisVoice[] => {
    if (!('speechSynthesis' in window)) {
        return [];
    }
    return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
};

export const stopBrowserSpeech = (): void => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
};

export const validateBrowserTTS = (): { success: boolean; message: string } => {
    if (!('speechSynthesis' in window)) {
        return {
            success: false,
            message: 'Your browser does not support speech synthesis'
        };
    }

    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));

    if (englishVoices.length === 0) {
        // Voices might not be loaded yet, but API is available
        return {
            success: true,
            message: 'Browser TTS available (voices loading...)'
        };
    }

    return {
        success: true,
        message: `Browser TTS ready (${englishVoices.length} English voices)`
    };
};
