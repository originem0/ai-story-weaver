import React, { useState, useCallback } from 'react';
import { Settings } from '../../hooks/useSettings';
import { FormField, ApiKeyInput, SelectInput, ExternalLink } from './FormElements';
import { TTS_PROVIDERS, TTS_MODELS, EXTERNAL_LINKS } from '../../constants';
import { validateElevenLabsSettings } from '../../services/elevenlabsService';
import { validateEdgeTTSSettings } from '../../services/edgeTtsService';
import { validateGeminiTTSModel } from '../../services/geminiService';
import { validateBrowserTTS } from '../../services/browserTtsService';

interface TTSSettingsProps {
    settings: Settings;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

interface TTSTestResult {
    provider: string;
    status: TestStatus;
    message?: string;
}

export const TTSSettings: React.FC<TTSSettingsProps> = ({ settings, onChange }) => {
    const [testResults, setTestResults] = useState<TTSTestResult[]>([]);
    const [isTesting, setIsTesting] = useState(false);

    const handleTestAll = useCallback(async () => {
        setIsTesting(true);
        setTestResults([
            { provider: 'Browser', status: 'testing' },
            { provider: 'Gemini', status: 'testing' },
            { provider: 'Edge', status: 'testing' },
            { provider: 'ElevenLabs', status: 'testing' },
        ]);

        const results: TTSTestResult[] = [];

        // Test Browser TTS (instant, no network)
        const browserResult = validateBrowserTTS();
        results.push({
            provider: 'Browser',
            status: browserResult.success ? 'success' : 'error',
            message: browserResult.success ? 'OK (offline)' : browserResult.message
        });
        setTestResults([...results, { provider: 'Gemini', status: 'testing' }, { provider: 'Edge', status: 'testing' }, { provider: 'ElevenLabs', status: 'testing' }]);

        // Test Gemini TTS
        try {
            if (settings.geminiApiKey) {
                const geminiResult = await validateGeminiTTSModel(settings.geminiApiKey, settings.ttsModel);
                results.push({
                    provider: 'Gemini',
                    status: geminiResult.success ? 'success' : 'error',
                    message: geminiResult.success ? 'OK' : geminiResult.message
                });
            } else {
                results.push({ provider: 'Gemini', status: 'error', message: 'No API key' });
            }
        } catch (e: any) {
            results.push({ provider: 'Gemini', status: 'error', message: e.message });
        }
        setTestResults([...results, { provider: 'Edge', status: 'testing' }, { provider: 'ElevenLabs', status: 'testing' }]);

        // Test Edge TTS
        try {
            const edgeResult = await validateEdgeTTSSettings();
            results.push({
                provider: 'Edge',
                status: edgeResult.success ? 'success' : 'error',
                message: edgeResult.success ? 'OK' : edgeResult.message
            });
        } catch (e: any) {
            results.push({ provider: 'Edge', status: 'error', message: e.message });
        }
        setTestResults([...results, { provider: 'ElevenLabs', status: 'testing' }]);

        // Test ElevenLabs TTS
        try {
            if (settings.elevenLabsApiKey) {
                const elevenResult = await validateElevenLabsSettings(
                    settings.elevenLabsApiKey,
                    settings.elevenLabsVoiceId || 'default'
                );
                results.push({
                    provider: 'ElevenLabs',
                    status: elevenResult.success ? 'success' : 'error',
                    message: elevenResult.success ? 'OK' : elevenResult.message
                });
            } else {
                results.push({ provider: 'ElevenLabs', status: 'idle', message: 'No API key (optional)' });
            }
        } catch (e: any) {
            results.push({ provider: 'ElevenLabs', status: 'error', message: e.message });
        }

        setTestResults(results);
        setIsTesting(false);
    }, [settings]);

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Text-to-Speech</h3>
                <button
                    onClick={handleTestAll}
                    disabled={isTesting}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors"
                >
                    {isTesting ? 'Testing...' : 'Test All TTS'}
                </button>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg space-y-1.5">
                    {testResults.map((result) => (
                        <div key={result.provider} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">{result.provider}</span>
                            <span className={`flex items-center gap-1 ${
                                result.status === 'success' ? 'text-green-600' :
                                result.status === 'error' ? 'text-red-500' :
                                result.status === 'testing' ? 'text-slate-400' :
                                'text-slate-400'
                            }`}>
                                {result.status === 'testing' ? (
                                    <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                                ) : result.status === 'success' ? (
                                    <span>✓ {result.message}</span>
                                ) : result.status === 'error' ? (
                                    <span className="truncate max-w-[150px]" title={result.message}>✗ {result.message}</span>
                                ) : (
                                    result.message
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-4">
                <FormField label="Provider" id="ttsProvider">
                    <SelectInput
                        id="ttsProvider"
                        name="ttsProvider"
                        value={settings.ttsProvider}
                        onChange={onChange}
                    >
                        {TTS_PROVIDERS.map(provider => (
                            <option key={provider.value} value={provider.value}>{provider.label}</option>
                        ))}
                    </SelectInput>
                </FormField>

                {settings.ttsProvider === 'browser' && <BrowserTTSSettings />}
                {settings.ttsProvider === 'gemini' && <GeminiTTSSettings settings={settings} onChange={onChange} />}
                {settings.ttsProvider === 'elevenlabs' && <ElevenLabsSettings settings={settings} onChange={onChange} />}
                {settings.ttsProvider === 'edge' && <EdgeTTSSettings settings={settings} onChange={onChange} />}

                <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                    If network TTS fails, will auto-fallback to Browser TTS.
                </p>
            </div>
        </div>
    );
};

const BrowserTTSSettings: React.FC = () => (
    <div className="text-xs text-slate-600 bg-green-50 rounded-lg px-3 py-2">
        Uses your browser's built-in speech synthesis. Works offline, no API key needed. Voice quality depends on your system.
    </div>
);

const GeminiTTSSettings: React.FC<TTSSettingsProps> = ({ settings, onChange }) => (
    <FormField label="Model" id="ttsModel" hint="Uses same API key as story generation">
        <SelectInput
            id="ttsModel"
            name="ttsModel"
            value={settings.ttsModel}
            onChange={onChange}
        >
            {TTS_MODELS.gemini.map(model => (
                <option key={model.value} value={model.value}>{model.label}</option>
            ))}
        </SelectInput>
    </FormField>
);

const ElevenLabsSettings: React.FC<TTSSettingsProps> = ({ settings, onChange }) => {
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');

    const handleTest = useCallback(async () => {
        if (!settings.elevenLabsApiKey) return;
        setTestStatus('testing');
        try {
            const result = await validateElevenLabsSettings(
                settings.elevenLabsApiKey,
                settings.elevenLabsVoiceId || 'default'
            );
            setTestStatus(result.success ? 'success' : 'error');
        } catch {
            setTestStatus('error');
        }
    }, [settings.elevenLabsApiKey, settings.elevenLabsVoiceId]);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTestStatus('idle');
        onChange(e);
    };

    return (
        <>
            <FormField
                label="API Key"
                id="elevenLabsApiKey"
                hint={<>Get from <ExternalLink href={EXTERNAL_LINKS.ELEVENLABS}>ElevenLabs</ExternalLink></>}
            >
                <ApiKeyInput
                    id="elevenLabsApiKey"
                    name="elevenLabsApiKey"
                    value={settings.elevenLabsApiKey}
                    onChange={handleApiKeyChange}
                    placeholder="Enter API key"
                    onTest={handleTest}
                    testStatus={testStatus}
                />
            </FormField>
            <FormField
                label="Voice ID"
                id="elevenLabsVoiceId"
                hint={<>Find in <ExternalLink href={EXTERNAL_LINKS.ELEVENLABS_VOICES}>Voice Library</ExternalLink></>}
            >
                <input
                    type="text"
                    id="elevenLabsVoiceId"
                    name="elevenLabsVoiceId"
                    value={settings.elevenLabsVoiceId}
                    onChange={onChange}
                    placeholder="e.g., 21m00Tcm4TlvDq8ikWAM"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder:text-slate-400"
                />
            </FormField>
        </>
    );
};

const EdgeTTSSettings: React.FC<TTSSettingsProps> = ({ settings, onChange }) => (
    <FormField label="Voice" id="edgeVoice">
        <SelectInput
            id="edgeVoice"
            name="edgeVoice"
            value={settings.edgeVoice}
            onChange={onChange}
        >
            {TTS_MODELS.edge.map(voice => (
                <option key={voice.value} value={voice.value}>{voice.label}</option>
            ))}
        </SelectInput>
    </FormField>
);
