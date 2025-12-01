import React, { useState } from 'react';

interface FormFieldProps {
    label: string;
    id: string;
    hint?: React.ReactNode;
    children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, id, hint, children }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor={id}>
            {label}
        </label>
        {children}
        {hint && <p className="text-xs text-slate-500 mt-1.5">{hint}</p>}
    </div>
);

interface TextInputProps {
    id: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: 'text' | 'password';
}

export const TextInput: React.FC<TextInputProps> = ({
    id, name, value, onChange, placeholder, type = 'text'
}) => (
    <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder:text-slate-400"
    />
);

interface ApiKeyInputProps {
    id: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    onTest?: () => void;
    testStatus?: 'idle' | 'testing' | 'success' | 'error';
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
    id, name, value, onChange, placeholder, onTest, testStatus = 'idle'
}) => {
    const [showKey, setShowKey] = useState(false);

    return (
        <div className="flex gap-2">
            <div className="relative flex-1">
                <input
                    type={showKey ? 'text' : 'password'}
                    id={id}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 placeholder:text-slate-400"
                />
                <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                    {showKey ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    )}
                </button>
            </div>
            {onTest && (
                <button
                    type="button"
                    onClick={onTest}
                    disabled={!value || testStatus === 'testing'}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors min-w-[48px] ${
                        testStatus === 'success'
                            ? 'bg-green-50 text-green-600'
                            : testStatus === 'error'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50'
                    }`}
                >
                    {testStatus === 'testing' ? (
                        <span className="inline-block w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    ) : testStatus === 'success' ? (
                        '✓'
                    ) : testStatus === 'error' ? (
                        '✗'
                    ) : (
                        'Test'
                    )}
                </button>
            )}
        </div>
    );
};

interface SelectInputProps {
    id: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}

export const SelectInput: React.FC<SelectInputProps> = ({
    id, name, value, onChange, children
}) => (
    <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
    >
        {children}
    </select>
);

interface ExternalLinkProps {
    href: string;
    children: React.ReactNode;
}

export const ExternalLink: React.FC<ExternalLinkProps> = ({ href, children }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-500 hover:text-indigo-600 underline"
    >
        {children}
    </a>
);
