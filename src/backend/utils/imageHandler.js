const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ImageHandler {
    constructor() {
        this.imagesDir = path.join(__dirname, '..', 'uploads', 'images');
        this.ensureImagesDirExists();
    }

    ensureImagesDirExists() {
        if (!fs.existsSync(this.imagesDir)) {
            fs.mkdirSync(this.imagesDir, { recursive: true });
        }
    }

    generateUniqueFilename(originalName, serviceId = null) {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const extension = path.extname(originalName).toLowerCase();
        
        if (serviceId) {
            return `service-${serviceId}-${timestamp}-${randomString}${extension}`;
        }
        return `temp-${timestamp}-${randomString}${extension}`;
    }

    saveImageFromBase64(base64Data, serviceId = null) {
        try {
            // Extract the actual base64 data and file extension
            const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
            if (!matches) {
                throw new Error('Invalid base64 image format');
            }

            const extension = matches[1];
            const imageBuffer = Buffer.from(matches[2], 'base64');
            
            // Generate unique filename
            const filename = this.generateUniqueFilename(`image.${extension}`, serviceId);
            const filePath = path.join(this.imagesDir, filename);
            
            // Save file to disk
            fs.writeFileSync(filePath, imageBuffer);
            
            return filename;
        } catch (error) {
            console.error('Error saving image:', error);
            throw new Error('Failed to save image file');
        }
    }

    deleteImage(filename) {
        if (!filename) return;
        
        try {
            const filePath = path.join(this.imagesDir, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Image deleted: ${filename}`);
            }
        } catch (error) {
            console.error(`Error deleting image ${filename}:`, error);
        }
    }

    getImagePath(filename) {
        if (!filename) return null;
        return path.join(this.imagesDir, filename);
    }

    imageExists(filename) {
        if (!filename) return false;
        return fs.existsSync(path.join(this.imagesDir, filename));
    }

    validateImageFile(buffer) {
        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (buffer.length > maxSize) {
            throw new Error('Image file too large. Maximum size is 5MB.');
        }

        // Check if it's a valid image by checking magic bytes
        const validImageTypes = [
            { type: 'jpeg', magic: [0xFF, 0xD8, 0xFF] },
            { type: 'png', magic: [0x89, 0x50, 0x4E, 0x47] },
            { type: 'gif', magic: [0x47, 0x49, 0x46] },
            { type: 'webp', magic: [0x52, 0x49, 0x46, 0x46] }
        ];

        const isValidImage = validImageTypes.some(imageType => {
            return imageType.magic.every((byte, index) => buffer[index] === byte);
        });

        if (!isValidImage) {
            throw new Error('Invalid image format. Only JPEG, PNG, GIF, and WebP are supported.');
        }

        return true;
    }

    // Get all image files in the images directory
    getAllImageFiles() {
        try {
            if (!fs.existsSync(this.imagesDir)) {
                return [];
            }
            return fs.readdirSync(this.imagesDir).filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            });
        } catch (error) {
            console.error('Error reading images directory:', error);
            return [];
        }
    }
}

module.exports = new ImageHandler();