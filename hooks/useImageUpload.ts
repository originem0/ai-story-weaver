import { useState, useCallback } from 'react';
import { compressImage } from '../utils/imageUtils';

interface UseImageUploadResult {
    imageFile: File | null;
    imageUrl: string | null;
    isCompressing: boolean;
    upload: (file: File) => Promise<void>;
    setImageUrl: (url: string | null) => void;
    reset: () => void;
}

export const useImageUpload = (): UseImageUploadResult => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const upload = useCallback(async (file: File) => {
        setIsCompressing(true);
        try {
            const compressedFile = await compressImage(file);
            setImageFile(compressedFile);

            // Revoke old URL if exists
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }

            setImageUrl(URL.createObjectURL(compressedFile));
        } finally {
            setIsCompressing(false);
        }
    }, [imageUrl]);

    const reset = useCallback(() => {
        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
        }
        setImageFile(null);
        setImageUrl(null);
    }, [imageUrl]);

    return {
        imageFile,
        imageUrl,
        isCompressing,
        upload,
        setImageUrl,
        reset,
    };
};
