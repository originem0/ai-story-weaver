import React, { useState, useEffect } from 'react';
import { Settings } from '../hooks/useSettings';
import { SettingsIcon } from './icons/SettingsIcon';
import { Spinner } from './Spinner';
import { validateGeminiStoryModel, validateGeminiTTSModel } from '../services/geminiService';
import { validateElevenLabsSettings } from '../services/elevenlabsService';
import { validateEdgeTTSSettings } from '../services/edgeTtsService';


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

        // Test Story Model based on provider
        if (localSettings.storyProvider === 'gemini') {
            const apiKey = localSettings.geminiApiKey;
            const storyResult = await validateGeminiStoryModel(apiKey, localSettings.storyModel);
            const storyIcon = storyResult.success ? '✅' : getErrorIcon(storyResult.errorType);
            messages.push(`${storyIcon} 故事模型: ${storyResult.message}`);
            if (!storyResult.success) overallSuccess = false;
        } else {
            messages.push(`ℹ️ ${localSettings.storyProvider.toUpperCase()} 模型暂不支持自动测试`);
        }

        // Test TTS
        if (localSettings.ttsProvider === 'gemini') {
            const apiKey = localSettings.geminiApiKey;
            const ttsResult = await validateGeminiTTSModel(apiKey, localSettings.ttsModel);
            const ttsIcon = ttsResult.success ? '✅' : getErrorIcon(ttsResult.errorType);
            messages.push(`${ttsIcon} Gemini TTS: ${ttsResult.message}`);
            if (!ttsResult.success) overallSuccess = false;
        } else if (localSettings.ttsProvider === 'elevenlabs') {
            const ttsResult = await validateElevenLabsSettings(localSettings.elevenLabsApiKey, localSettings.elevenLabsVoiceId);
            const ttsIcon = ttsResult.success ? '✅' : getErrorIcon(ttsResult.errorType);
            messages.push(`${ttsIcon} ElevenLabs TTS: ${ttsResult.message}`);
            if (!ttsResult.success) overallSuccess = false;
        } else if (localSettings.ttsProvider === 'edge') {
            const ttsResult = await validateEdgeTTSSettings();
            const ttsIcon = ttsResult.success ? '✅' : '❌';
            messages.push(`${ttsIcon} Edge TTS: ${ttsResult.message}`);
            if (!ttsResult.success) overallSuccess = false;
        } else {
            messages.push(`ℹ️ ${localSettings.ttsProvider.toUpperCase()} TTS 暂不支持自动测试`);
        }

        setTestMessages(messages);
        setTestStatus(overallSuccess ? 'success' : 'error');
    };
    
    const getErrorIcon = (errorType?: string) => {
        switch (errorType) {
            case 'network': return '🌐';
            case 'auth': return '🔑';
            case 'model': return '🤖';
            case 'config': return '⚙️';
            default: return '❌';
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div 
                className="bg-white border-2 border-slate-300 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl"
            >
                {/* 固定的标题栏 */}
                <div className="flex items-center justify-between p-6 pb-4 border-b-2 border-slate-200 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="text-teal-600"><SettingsIcon /></div>
                        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
                    </div>
                     <button onClick={onClose} className="text-slate-500 hover:text-slate-800 text-2xl font-bold leading-none">&times;</button>
                </div>

                {/* 可滚动的内容区域 */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-6">
                    {/* Story Generation Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Story Generation</h3>
                        <div className="space-y-4">
                            {/* Provider Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="storyProvider">
                                    AI Provider
                                </label>
                                <select
                                    id="storyProvider"
                                    name="storyProvider"
                                    value={localSettings.storyProvider}
                                    onChange={handleChange}
                                    className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="gemini">Google Gemini (Recommended)</option>
                                    <option value="openai" disabled>OpenAI (Coming Soon)</option>
                                    <option value="claude" disabled>Anthropic Claude (Coming Soon)</option>
                                    <option value="kimi" disabled>Moonshot Kimi (Coming Soon)</option>
                                </select>
                            </div>

                            {/* API Key based on provider */}
                            {localSettings.storyProvider === 'gemini' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="geminiApiKey">
                                        Gemini API Key
                                    </label>
                                    <input
                                        type="password"
                                        id="geminiApiKey"
                                        name="geminiApiKey"
                                        value={localSettings.geminiApiKey}
                                        onChange={handleChange}
                                        placeholder="Enter your Gemini API key"
                                        className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Get your API key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Google AI Studio</a></p>
                                </div>
                            )}

                            {localSettings.storyProvider === 'openai' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="openaiApiKey">
                                        OpenAI API Key
                                    </label>
                                    <input
                                        type="password"
                                        id="openaiApiKey"
                                        name="openaiApiKey"
                                        value={localSettings.openaiApiKey}
                                        onChange={handleChange}
                                        placeholder="sk-..."
                                        className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">OpenAI Platform</a></p>
                                </div>
                            )}

                            {localSettings.storyProvider === 'claude' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="claudeApiKey">
                                        Claude API Key
                                    </label>
                                    <input
                                        type="password"
                                        id="claudeApiKey"
                                        name="claudeApiKey"
                                        value={localSettings.claudeApiKey}
                                        onChange={handleChange}
                                        placeholder="sk-ant-..."
                                        className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Anthropic Console</a></p>
                                </div>
                            )}

                            {localSettings.storyProvider === 'kimi' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="kimiApiKey">
                                        Kimi API Key
                                    </label>
                                    <input
                                        type="password"
                                        id="kimiApiKey"
                                        name="kimiApiKey"
                                        value={localSettings.kimiApiKey}
                                        onChange={handleChange}
                                        placeholder="Enter your Moonshot API key"
                                        className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Get your API key from <a href="https://platform.moonshot.cn/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Moonshot Platform</a></p>
                                </div>
                            )}

                            {/* Model Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="storyModel">
                                    Model
                                </label>
                                <select
                                    id="storyModel"
                                    name="storyModel"
                                    value={localSettings.storyModel}
                                    onChange={handleChange}
                                    className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    {localSettings.storyProvider === 'gemini' && (
                                        <>
                                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast, Balanced)</option>
                                            <option value="gemini-2.5-flash-8b">Gemini 2.5 Flash-8B (Fastest, Lightweight)</option>
                                            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Best Quality)</option>
                                        </>
                                    )}
                                    {localSettings.storyProvider === 'openai' && (
                                        <>
                                            <option value="gpt-4o">GPT-4o (Recommended)</option>
                                            <option value="gpt-4o-mini">GPT-4o Mini (Faster, Cheaper)</option>
                                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                            <option value="gpt-4">GPT-4</option>
                                        </>
                                    )}
                                    {localSettings.storyProvider === 'claude' && (
                                        <>
                                            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Latest)</option>
                                            <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku (Fast)</option>
                                            <option value="claude-3-opus-20240229">Claude 3 Opus (Best)</option>
                                        </>
                                    )}
                                    {localSettings.storyProvider === 'kimi' && (
                                        <>
                                            <option value="moonshot-v1-8k">Moonshot v1 8K</option>
                                            <option value="moonshot-v1-32k">Moonshot v1 32K</option>
                                            <option value="moonshot-v1-128k">Moonshot v1 128K</option>
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t-2 border-slate-200"></div>

                    {/* TTS Section */}
                    <div>
                         <h3 className="text-lg font-semibold text-slate-900 mb-3">Text-to-Speech (TTS)</h3>
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="ttsProvider">
                                    TTS Provider
                                </label>
                                <select
                                    id="ttsProvider"
                                    name="ttsProvider"
                                    value={localSettings.ttsProvider}
                                    onChange={handleChange}
                                    className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="gemini">Gemini TTS (Free, Built-in)</option>
                                    <option value="elevenlabs">ElevenLabs (Premium, High Quality)</option>
                                    <option value="edge">Microsoft Edge TTS (Free, Browser-based)</option>
                                    <option value="openai" disabled>OpenAI TTS (Coming Soon)</option>
                                </select>
                            </div>

                            {localSettings.ttsProvider === 'gemini' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="ttsModel">
                                        Gemini TTS Model
                                    </label>
                                    <select
                                        id="ttsModel"
                                        name="ttsModel"
                                        value={localSettings.ttsModel}
                                        onChange={handleChange}
                                        className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="gemini-2.5-flash-preview-tts">Gemini 2.5 Flash TTS (Recommended)</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Uses the same API key as story generation</p>
                                </div>
                            )}

                            {localSettings.ttsProvider === 'elevenlabs' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="elevenLabsApiKey">
                                            ElevenLabs API Key
                                        </label>
                                        <input
                                            type="password"
                                            id="elevenLabsApiKey"
                                            name="elevenLabsApiKey"
                                            value={localSettings.elevenLabsApiKey}
                                            onChange={handleChange}
                                            placeholder="Enter your ElevenLabs API key"
                                            className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Get API key from <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">ElevenLabs</a></p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="elevenLabsVoiceId">
                                            Voice ID
                                        </label>
                                        <input
                                            type="text"
                                            id="elevenLabsVoiceId"
                                            name="elevenLabsVoiceId"
                                            value={localSettings.elevenLabsVoiceId}
                                            onChange={handleChange}
                                            placeholder="e.g., 21m00Tcm4TlvDq8ikWAM"
                                            className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Find voice IDs in <a href="https://elevenlabs.io/voice-library" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Voice Library</a></p>
                                    </div>
                                </div>
                            )}

                            {localSettings.ttsProvider === 'edge' && (
                                <div>
                                    <p className="text-sm text-slate-600 bg-green-50 border-2 border-green-200 rounded-md p-3">
                                        🎤 Microsoft Edge TTS is completely free and requires no API key. It uses your browser's built-in speech synthesis.
                                        <br /><br />
                                        <strong>Note:</strong> Works best in Chrome, Edge, or Safari. Requires internet connection.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t-2 border-slate-200 pt-4">
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
                            <div className="mt-3 bg-slate-50 border-2 border-slate-200 p-3 rounded-md text-xs space-y-2">
                                {testMessages.map((msg, index) => {
                                    const isSuccess = msg.includes('✅');
                                    const isNetwork = msg.includes('🌐');
                                    const isAuth = msg.includes('🔑');
                                    const isModel = msg.includes('🤖');
                                    const isConfig = msg.includes('⚙️');
                                    
                                    let colorClass = 'text-green-400';
                                    if (!isSuccess) {
                                        if (isNetwork) colorClass = 'text-orange-400';
                                        else if (isAuth) colorClass = 'text-yellow-400';
                                        else if (isModel) colorClass = 'text-blue-400';
                                        else if (isConfig) colorClass = 'text-teal-400';
                                        else colorClass = 'text-red-400';
                                    }
                                    
                                    return (
                                        <div key={index} className={`${colorClass} leading-relaxed`}>
                                            {msg}
                                        </div>
                                    );
                                })}
                                <div className="mt-2 pt-2 border-t-2 border-slate-200 text-slate-600 text-[10px]">
                                    <p>图标说明: ✅ 成功 | 🌐 网络问题 | 🔑 认证问题 | 🤖 模型问题 | ⚙️ 配置问题 | ❌ 未知错误</p>
                                </div>
                            </div>
                         )}
                    </div>
                </div>

                {/* 固定的底部按钮 */}
                <div className="p-6 pt-4 border-t-2 border-slate-200 flex justify-end space-x-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 bg-white border-2 border-slate-300 hover:bg-slate-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};
