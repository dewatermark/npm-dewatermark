# dewatermark

A TypeScript/Node.js package for removing watermarks from images using AI.

## Installation

```bash
npm install dewatermark
```

## Usage

```typescript
import { Dewatermark } from 'dewatermark';
const dewatermark = new Dewatermark('YOUR_API_KEY');
```

### Basic Usage (Auto-detect watermarks)

```typescript
// Step 1: Auto-detect watermarks
const autoResult = await dewatermark.eraseWatermark({
    originalPreviewImage: 'input.jpeg'
});

// Optional: Save or display the processed image
console.log('Processed image (base64):', autoResult.imageBase64);

return autoResult;
```

### Manual Refinement

```typescript
// Step 2: Manual refinement using brush mask
// This step is similar to Step 3 but requires re-uploading the original image
async function manualRefinement(autoResult) {
    try {
        const manualResult = await dewatermark.eraseWatermark({
            originalPreviewImage: autoResult.imageBase64,
            maskBase: autoResult.maskBase,
            maskBrush: 'mask_brush_manual_step_1.png'
        });
        
        return manualResult;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### Optimized Manual Refinement (Using Session ID)

```typescript
// Step 3: Manual refinement using session_id
// This step is similar to Step 2 but uses session_id instead of re-uploading the original image
// This optimization makes the API call faster
async function optimizedManualRefinement(manualResult) {
    try {
        const finalResult = await dewatermark.eraseWatermark({
            sessionId: manualResult.sessionId,  // Use session_id instead of re-uploading
            maskBase: manualResult.maskBase,
            maskBrush: 'mask_brush_manual_step_2.png'
        });
        
        return finalResult;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### Complete Example

```typescript
async function completeWatermarkRemoval() {
    try {
        // Step 1: Auto-detect watermarks
        const autoResult = await dewatermark.eraseWatermark({
            originalPreviewImage: 'input.jpeg'
        });
        
        // Step 2: First manual refinement (requires original image)
        const manualResult = await dewatermark.eraseWatermark({
            originalPreviewImage: autoResult.imageBase64,
            maskBase: autoResult.maskBase,
            maskBrush: 'mask_brush_manual_step_1.png'
        });
        
        // Step 3: Optimized manual refinement (uses session_id)
        const finalResult = await dewatermark.eraseWatermark({
            sessionId: manualResult.sessionId,  // Faster: no need to re-upload original image
            maskBase: manualResult.maskBase,
            maskBrush: 'mask_brush_manual_step_2.png'
        });
        
        // Save the final result
        const outputPath = 'output.png';
        const imageBuffer = Buffer.from(finalResult.imageBase64, 'base64');
        fs.writeFileSync(outputPath, imageBuffer);
        console.log('Saved final image to:', outputPath);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### Saving High-Resolution Images

The API allows you to save images with higher resolution (up to 4000px). This feature is useful when your original image is larger than 1408px. Each save operation costs 2 credits.

```typescript
async function saveHighResolutionImage() {
    try {
        // First, perform watermark removal
        const watermarkResult = await dewatermark.eraseWatermark({
            originalPreviewImage: 'input.jpeg'
        });

        // Then save the high-resolution version
        const highResResult = await dewatermark.saveLargeImage({
            originalLargeImage: 'input.jpeg',  // Original high-res image
            sessionId: watermarkResult.sessionId,
            previewImageToSave: watermarkResult.imageBase64,
            previewMaskToSave: watermarkResult.watermarkMask,
            removeText: true  // Optional: remove text watermarks
        });

        // Save the high-resolution result
        const outputPath = 'output_highres.png';
        const imageBuffer = Buffer.from(highResResult.largeImageToSave, 'base64');
        fs.writeFileSync(outputPath, imageBuffer);
        console.log('Saved high-resolution image to:', outputPath);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test
```

## Support

For support, please email: support@dewatermark.ai

## License

ISC 