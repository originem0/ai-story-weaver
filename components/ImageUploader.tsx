import React, { useRef } from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    imageUrl: string | null;
    isCompressing?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageUrl, isCompressing = false }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    const handleClick = () => {
        if (!isCompressing) {
            inputRef.current?.click();
        }
    };

    return (
        <div
            className={`w-full aspect-[4/3] bg-slate-50/80 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center transition-all ${
                isCompressing ? 'cursor-wait opacity-60' : 'cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30'
            }`}
            onClick={handleClick}
        >
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={isCompressing}
            />
            {isCompressing ? (
                <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-indigo-500 mx-auto"></div>
                    <p className="mt-3 text-sm text-slate-600">Optimizing image...</p>
                </div>
            ) : imageUrl ? (
                <div className="relative w-full h-full group">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-contain rounded-xl p-2" />
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors rounded-xl flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity shadow-sm">
                            Click to change
                        </span>
                    </div>
                </div>
            ) : (
                <div className="text-center p-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Click to upload an image</p>
                    <p className="text-xs text-slate-500">JPG, PNG, WEBP, or GIF</p>
                    <p className="text-xs text-slate-400 mt-2">Try a photo of a place, person, or scene</p>
                </div>
            )}
        </div>
    );
};
