import React, { useState, useEffect } from 'react';
import { Settings } from '../hooks/useSettings';
import { StorySettings } from './settings/StorySettings';
import { TTSSettings } from './settings/TTSSettings';

interface SettingsPanelProps {
    settings: Settings;
    onSave: (settings: Settings) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSave, isOpen, onClose }) => {
    const [localSettings, setLocalSettings] = useState<Settings>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-xl border border-slate-200/60">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60">
                    <h2 className="text-lg font-medium text-slate-800">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
                    <StorySettings settings={localSettings} onChange={handleChange} />
                    <div className="border-t border-slate-200/60" />
                    <TTSSettings settings={localSettings} onChange={handleChange} />
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-slate-200/60 flex justify-end gap-2 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-colors shadow-sm"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
