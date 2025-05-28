import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';

export interface EraseWatermarkOptions {
    originalPreviewImage?: string | Buffer;
    maskBase?: string;
    maskBrush?: string;
    sessionId?: string;
    removeText?: boolean;
}

export interface EraseWatermarkResponse {
    sessionId: string;
    imageBase64: string;
    maskBase: string;
    watermarkMask: string;
}

export interface SaveLargeImageOptions {
    originalLargeImage?: string | Buffer;
    previewImageToSave?: string;
    previewMaskToSave?: string;
    sessionId?: string;
    removeText?: boolean;
}

export interface SaveLargeImageResponse {
    largeImageToSave: string;
}

export class Dewatermark {
    private apiKey: string;
    private readonly eraseUrl = 'https://platform.dewatermark.ai/api/object_removal/v1/erase_watermark';
    private readonly saveLargeImageUrl = 'https://platform.dewatermark.ai/api/object_removal/v1/save_large_image';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Erase watermark from an image using AI
     * @param options - Options for watermark removal
     * @returns Promise with the processed image data
     */
    async eraseWatermark(options: EraseWatermarkOptions): Promise<EraseWatermarkResponse> {
        const formData = new FormData();
        
        // Handle original preview image
        if (options.originalPreviewImage) {
            if (typeof options.originalPreviewImage === 'string' && fs.existsSync(options.originalPreviewImage)) {
                // Sử dụng cách gửi file giống curl
                formData.append('original_preview_image', fs.createReadStream(options.originalPreviewImage), {
                    filename: options.originalPreviewImage.split('/').pop() || 'image.png'
                });
            } else {
                const imageBuffer = Buffer.isBuffer(options.originalPreviewImage) 
                    ? options.originalPreviewImage 
                    : Buffer.from(options.originalPreviewImage, 'base64');
                formData.append('original_preview_image', imageBuffer, {
                    filename: 'image.png'
                });
            }
        } else if (options.sessionId) {
            formData.append('session_id', options.sessionId);
        } else {
            throw new Error('Either originalPreviewImage or sessionId must be provided');
        }

        // Handle mask base
        if (options.maskBase) {
            const maskBuffer = Buffer.from(options.maskBase, 'base64');
            formData.append('mask_base', maskBuffer, {
                filename: 'mask_base.jpeg'
            });
        }

        // Handle mask brush
        if (options.maskBrush) {
            formData.append('mask_brush', fs.createReadStream(options.maskBrush), {
                filename: options.maskBrush.split('/').pop() || 'mask_brush.png'
            });
        }

        // Add remove text option
        formData.append('remove_text', options.removeText?.toString() ?? 'true');

        try {
            const response = await axios.post(this.eraseUrl, formData, {
                headers: {
                    'x-api-key': this.apiKey,
                    ...formData.getHeaders()
                }
            });

            const responseData = response.data;
            return {
                sessionId: responseData.session_id,
                imageBase64: responseData.edited_image.image,
                maskBase: responseData.edited_image.mask,
                watermarkMask: responseData.edited_image.watermark_mask
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error Details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }

    /**
     * Save a high-resolution version of the processed image (up to 4000px)
     * @param options - Options for saving high-resolution image
     * @returns Promise with the high-resolution image data
     */
    async saveLargeImage(options: SaveLargeImageOptions): Promise<SaveLargeImageResponse> {
        const formData = new FormData();

        // Handle original large image
        if (options.originalLargeImage) {
            if (typeof options.originalLargeImage === 'string' && fs.existsSync(options.originalLargeImage)) {
                formData.append('original_large_image', fs.createReadStream(options.originalLargeImage), {
                    filename: options.originalLargeImage.split('/').pop() || 'image.png'
                });
            } else {
                const imageBuffer = Buffer.isBuffer(options.originalLargeImage)
                    ? options.originalLargeImage
                    : Buffer.from(options.originalLargeImage, 'base64');
                formData.append('original_large_image', imageBuffer, {
                    filename: 'image.png'
                });
            }
        }

        // Handle preview image to save
        if (options.previewImageToSave) {
            const previewBuffer = Buffer.from(options.previewImageToSave, 'base64');
            formData.append('preview_image_to_save', previewBuffer, {
                filename: 'preview_image_to_save.jpeg'
            });
        }

        // Handle preview mask to save
        if (options.previewMaskToSave) {
            const maskBuffer = Buffer.from(options.previewMaskToSave, 'base64');
            formData.append('preview_mask_to_save', maskBuffer, {
                filename: 'preview_mask_to_save.jpeg'
            });
        }

        // Add session ID
        if (options.sessionId) {
            formData.append('session_id', options.sessionId);
        }

        // Add remove text option
        formData.append('remove_text', options.removeText?.toString() ?? 'true');

        try {
            const response = await axios.post(this.saveLargeImageUrl, formData, {
                headers: {
                    'x-api-key': this.apiKey,
                    ...formData.getHeaders()
                }
            });

            const responseData = response.data;
            return {
                largeImageToSave: responseData.large_image_to_save
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error Details:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                throw new Error(`API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}

// Example usage:
/*
const dewatermark = new Dewatermark('YOUR_API_KEY');
const result = await dewatermark.eraseWatermark({
    originalPreviewImage: 'input.jpeg'
});

const highResResult = await dewatermark.saveLargeImage({
    originalLargeImage: 'input.jpeg',
    sessionId: result.sessionId,
    previewImageToSave: result.imageBase64,
    previewMaskToSave: result.maskBase
});
*/ 