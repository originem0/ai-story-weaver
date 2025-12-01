// Image compression configuration
export const IMAGE_CONFIG = {
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
    QUALITY: 0.85,
    MAX_SIZE_MB: 4, // Gemini's limit is around 4MB for inline images
} as const;

/**
 * Compress an image file to reduce its size while maintaining quality
 * Returns the original file if it's already small enough or if compression fails
 */
export const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
        // Skip compression for small files (< 500KB)
        if (file.size < 500 * 1024) {
            resolve(file);
            return;
        }

        // Skip non-image files
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            URL.revokeObjectURL(img.src);

            if (!ctx) {
                resolve(file);
                return;
            }

            // Calculate new dimensions
            let { width, height } = img;
            const aspectRatio = width / height;

            if (width > IMAGE_CONFIG.MAX_WIDTH) {
                width = IMAGE_CONFIG.MAX_WIDTH;
                height = width / aspectRatio;
            }

            if (height > IMAGE_CONFIG.MAX_HEIGHT) {
                height = IMAGE_CONFIG.MAX_HEIGHT;
                width = height * aspectRatio;
            }

            // Set canvas size
            canvas.width = width;
            canvas.height = height;

            // Draw image with high-quality smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve(file);
                        return;
                    }

                    // If compressed file is larger than original, use original
                    if (blob.size >= file.size) {
                        resolve(file);
                        return;
                    }

                    // Create new file from blob
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });

                    console.log(
                        `Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB (${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% reduction)`
                    );

                    resolve(compressedFile);
                },
                'image/jpeg',
                IMAGE_CONFIG.QUALITY
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            resolve(file);
        };

        img.src = URL.createObjectURL(file);
    });
};

/**
 * Get file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
