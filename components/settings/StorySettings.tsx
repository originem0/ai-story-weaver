import React, { useState, useCallback } from 'react';
import { Settings } from '../../hooks/useSettings';
import { FormField, ApiKeyInput, ExternalLink } from './FormElements';
import { EXTERNAL_LINKS } from '../../constants';
import { validateGeminiStoryModel } from '../../services/geminiService';

interface StorySettingsProps {
    settings: Settings;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export const StorySettings: React.FC<StorySettingsProps> = ({ settings, onChange }) => {
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');

    const handleTestApiKey = useCallback(async () => {
        if (!settings.geminiApiKey) return;

        setTestStatus('testing');
        try {
            const result = await validateGeminiStoryModel(settings.geminiApiKey, settings.storyModel);
            setTestStatus(result.success ? 'success' : 'error');
        } catch {
            setTestStatus('error');
        }
    }, [settings.geminiApiKey, settings.storyModel]);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTestStatus('idle');
        onChange(e);
    };

    return (
        <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-3">Story Generation</h3>
            <div className="space-y-4">
                <FormField
                    label="Gemini API Key"
                    id="geminiApiKey"
                    hint={<>Get from <ExternalLink href={EXTERNAL_LINKS.GOOGLE_AI_STUDIO}>Google AI Studio</ExternalLink></>}
                >
                    <ApiKeyInput
                        id="geminiApiKey"
                        name="geminiApiKey"
                        value={settings.geminiApiKey}
                        onChange={handleApiKeyChange}
                        placeholder="Enter API key"
                        onTest={handleTestApiKey}
                        testStatus={testStatus}
                    />
                </FormField>
            </div>
        </div>
    );
};
