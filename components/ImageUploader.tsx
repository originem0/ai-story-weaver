
import React, { useRef } from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    imageUrl: string | null;
}

const ImageIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageUrl }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            className="w-full aspect-video bg-white/80 backdrop-blur-sm border-2 border-dashed border-slate-300/60 rounded-xl flex items-center justify-center cursor-pointer hover:border-teal-500 hover:shadow-md transition-all duration-300 shadow-sm"
            onClick={handleClick}
        >
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            {imageUrl ? (
                <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-contain rounded-lg bg-slate-100" />
            ) : (
                <div className="text-center">
                    <ImageIcon />
                    <p className="mt-2 text-slate-600">Click to upload</p>
                    <p className="text-xs text-slate-500">PNG, JPG, WEBP</p>
                </div>
            )}
        </div>
    );
};
