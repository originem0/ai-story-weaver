import React, { useState, useEffect } from 'react';
import { Settings } from '../hooks/useSettings';
import { SettingsIcon } from './icons/SettingsIcon';
import { Spinner } from './Spinner';
import { validateGeminiStoryModel, validateGeminiTTSModel } from '../services/geminiService';
import { validateElevenLabsSettings } from '../services/elevenlabsService';


interface SettingsPanelProps {
    settings: Settings;
    onSave: (settings: Settings) => void;
    isOpen: boolean;
    onClose: () => void;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave, isOpen, onClose }) => {
    const [localSettings, setLocalSettings] = useState<Settings>(settings);
    const [testStatus, setTestStatus] = useState<TestStatus>('idle');
    const [testMessages, setTestMessages] = useState<string[]>([]);


    useEffect(() => {
        setLocalSettings(settings);
        setTestStatus('idle'); // Reset test status when panel is opened/settings change
        setTestMessages([]);
    }, [settings, isOpen]);

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({...prev, [name]: value}));
    };

    const handleTestConfiguration = async () => {
        setTestStatus('testing');
        const messages: string[] = [];
        let overallSuccess = true;

        // 1. Test Story Model
        const storyResult = await validateGeminiStoryModel(localSettings.generativeApiKey, localSettings.storyModel);
        messages.push(`Story Model: ${storyResult.success ? 'OK' : 'Failed - ' + storyResult.message}`);
        if (!storyResult.success) overallSuccess = false;

        // 2. Test TTS Model if Story Model is OK
        if (overallSuccess) {
            if (localSettings.ttsProvider === 'gemini') {
                const ttsResult = await validateGeminiTTSModel(localSettings.generativeApiKey, localSettings.ttsModel);
                messages.push(`Gemini TTS: ${ttsResult.success ? 'OK' : 'Failed - ' + ttsResult.message}`);
                 if (!ttsResult.success) overallSuccess = false;
            } else if (localSettings.ttsProvider === 'elevenlabs') {
                const ttsResult = await validateElevenLabsSettings(localSettings.elevenLabsApiKey, localSettings.elevenLabsVoiceId);
                messages.push(`ElevenLabs TTS: ${ttsResult.success ? 'OK' : 'Failed - ' + ttsResult.message}`);
                 if (!ttsResult.success) overallSuccess = false;
            }
        }
        
        setTestMessages(messages);
        setTestStatus(overallSuccess ? 'success' : 'error');
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <SettingsIcon />
                        <h2 className="text-xl font-bold text-white">Settings</h2>
                    </div>
                     <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl font-bold leading-none">&times;</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-purple-300 mb-3">Story Generation (Gemini)</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1" htmlFor="generativeApiKey">
                                    Gemini API Key
                                </label>
                                <input
                                    type="password"
                                    id="generativeApiKey"
                                    name="generativeApiKey"
                                    value={localSettings.generativeApiKey}
                                    onChange={handleChange}
                                    placeholder="Optional: Enter your Gemini key"
                                    className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">If blank, the application's default key will be used.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1" htmlFor="storyModel">
                                    Generative Model
                                </label>
                                <select
                                    id="storyModel"
                                    name="storyModel"
                                    value={localSettings.storyModel}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Flash is faster, Pro is more creative.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-700"></div>

                    <div>
                         <h3 className="text-lg font-semibold text-purple-300 mb-3">Text-to-Speech (TTS)</h3>
                         <label className="block text-sm font-medium text-slate-400 mb-1" htmlFor="ttsProvider">
                            TTS Provider
                        </label>
                         <select
                            id="ttsProvider"
                            name="ttsProvider"
                            value={localSettings.ttsProvider}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
                        >
                            <option value="gemini">Gemini TTS</option>
                            <option value="elevenlabs">ElevenLabs</option>
                        </select>
                        
                        {localSettings.ttsProvider === 'elevenlabs' && (
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1" htmlFor="elevenLabsApiKey">
                                        ElevenLabs API Key
                                    </label>
                                    <input
                                        type="password"
                                        id="elevenLabsApiKey"
                                        name="elevenLabsApiKey"
                                        value={localSettings.elevenLabsApiKey}
                                        onChange={handleChange}
                                        placeholder="Paste your ElevenLabs key"
                                        className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1" htmlFor="elevenLabsVoiceId">
                                        ElevenLabs Voice ID
                                    </label>
                                    <input
                                        type="text"
                                        id="elevenLabsVoiceId"
                                        name="elevenLabsVoiceId"
                                        value={localSettings.elevenLabsVoiceId}
                                        onChange={handleChange}
                                        placeholder="Enter Voice ID"
                                        className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                         <div className="flex items-center space-x-4">
                            <button
                                onClick={handleTestConfiguration}
                                disabled={testStatus === 'testing'}
                                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 inline-flex items-center"
                            >
                                {testStatus === 'testing' && <Spinner />}
                                Test Configuration
                            </button>
                            <div className="text-sm">
                                {testStatus === 'success' && <p className="text-green-400">✅ All configurations are valid!</p>}
                                {testStatus === 'error' && <p className="text-red-400">❌ Some configurations failed.</p>}
                            </div>
                         </div>
                         {testMessages.length > 0 && (
                            <div className="mt-3 bg-slate-900/50 p-3 rounded-md text-xs space-y-1">
                                {testMessages.map((msg, index) => (
                                    <p key={index} className={msg.includes('Failed') ? 'text-red-400' : 'text-green-400'}>{msg}</p>
                                ))}
                            </div>
                         )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};