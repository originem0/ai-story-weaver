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
        const storyIcon = storyResult.success ? '✅' : getErrorIcon(storyResult.errorType);
        messages.push(`${storyIcon} 故事模型: ${storyResult.message}`);
        if (!storyResult.success) overallSuccess = false;

        // 2. Test TTS Model (always test, not dependent on story model)
        if (localSettings.ttsProvider === 'gemini') {
            const ttsResult = await validateGeminiTTSModel(localSettings.generativeApiKey, localSettings.ttsModel);
            const ttsIcon = ttsResult.success ? '✅' : getErrorIcon(ttsResult.errorType);
            messages.push(`${ttsIcon} Gemini TTS: ${ttsResult.message}`);
            if (!ttsResult.success) overallSuccess = false;
        } else if (localSettings.ttsProvider === 'elevenlabs') {
            const ttsResult = await validateElevenLabsSettings(localSettings.elevenLabsApiKey, localSettings.elevenLabsVoiceId);
            const ttsIcon = ttsResult.success ? '✅' : getErrorIcon(ttsResult.errorType);
            messages.push(`${ttsIcon} ElevenLabs TTS: ${ttsResult.message}`);
            if (!ttsResult.success) overallSuccess = false;
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
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">Story Generation (Gemini)</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="generativeApiKey">
                                    Gemini API Key
                                </label>
                                <input
                                    type="password"
                                    id="generativeApiKey"
                                    name="generativeApiKey"
                                    value={localSettings.generativeApiKey}
                                    onChange={handleChange}
                                    placeholder="Optional: Enter your Gemini key"
                                    className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">If blank, the application's default key will be used.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="storyModel">
                                    故事生成模型
                                </label>
                                <select
                                    id="storyModel"
                                    name="storyModel"
                                    value={localSettings.storyModel}
                                    onChange={handleChange}
                                    className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <optgroup label="Gemini 2.5 系列（推荐）">
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash（快速，平衡）</option>
                                        <option value="gemini-2.5-flash-8b">Gemini 2.5 Flash-8B（最快，轻量）</option>
                                        <option value="gemini-2.5-pro">Gemini 2.5 Pro（创意，质量高）</option>
                                    </optgroup>
                                    <optgroup label="Gemini 2.0 系列">
                                        <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                        <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp（实验版）</option>
                                    </optgroup>
                                    <optgroup label="Gemini 1.5 系列">
                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                        <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash-8B</option>
                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                    </optgroup>
                                    <option value="custom">🛠️ 自定义模型...</option>
                                </select>
                                {localSettings.storyModel === 'custom' && (
                                    <input
                                        type="text"
                                        name="storyModel"
                                        placeholder="输入自定义模型名称，如 gemini-exp-1206"
                                        onChange={(e) => setLocalSettings(prev => ({...prev, storyModel: e.target.value || 'custom'}))}
                                        className="mt-2 w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                )}
                                <p className="text-xs text-slate-500 mt-1">Flash 速度快，Pro 创意更强，8B 最轻量。</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t-2 border-slate-200"></div>

                    <div>
                         <h3 className="text-lg font-semibold text-slate-900 mb-3">Text-to-Speech (TTS)</h3>
                         <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="ttsProvider">
                            TTS 提供商
                        </label>
                         <select
                            id="ttsProvider"
                            name="ttsProvider"
                            value={localSettings.ttsProvider}
                            onChange={handleChange}
                            className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="gemini">Gemini TTS（免费，内置）</option>
                            <option value="elevenlabs">ElevenLabs（高质量，需单独 Key）</option>
                        </select>
                        
                        {localSettings.ttsProvider === 'gemini' && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="ttsModel">
                                    Gemini TTS 模型
                                </label>
                                <select
                                    id="ttsModel"
                                    name="ttsModel"
                                    value={localSettings.ttsModel}
                                    onChange={handleChange}
                                    className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                >
                                    <option value="gemini-2.5-flash-preview-tts">Gemini 2.5 Flash TTS（推荐）</option>
                                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                                    <option value="custom-tts">🛠️ 自定义 TTS 模型...</option>
                                </select>
                                {localSettings.ttsModel === 'custom-tts' && (
                                    <input
                                        type="text"
                                        name="ttsModel"
                                        placeholder="输入自定义 TTS 模型名称"
                                        onChange={(e) => setLocalSettings(prev => ({...prev, ttsModel: e.target.value || 'custom-tts'}))}
                                        className="mt-2 w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                )}
                                <p className="text-xs text-slate-500 mt-1">仅支持带 TTS 功能的 Gemini 模型。</p>
                            </div>
                        )}
                        
                        {localSettings.ttsProvider === 'elevenlabs' && (
                            <div className="mt-4 space-y-4">
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
                                </div>
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
                                        placeholder="Paste your ElevenLabs key"
                                        className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="elevenLabsVoiceId">
                                        ElevenLabs Voice ID
                                    </label>
                                    <input
                                        type="text"
                                        id="elevenLabsVoiceId"
                                        name="elevenLabsVoiceId"
                                        value={localSettings.elevenLabsVoiceId}
                                        onChange={handleChange}
                                        placeholder="Enter Voice ID"
                                        className="w-full bg-white border-2 border-slate-300 rounded-md px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            </div>
                        )}
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
