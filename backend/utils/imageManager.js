const fs = require('fs').promises;
const path = require('path');

class ImageManager {
    constructor() {
        // Use app's user data path for storing images, fallback to local directory
        try {
            const { app } = require('electron');
            this.imagesDir = path.join(app.getPath('userData'), 'images');
        } catch (error) {
            // Fallback for when running outside Electron context
            this.imagesDir = path.join(process.cwd(), 'uploads', 'images');
        }
        this.ensureImagesDirExists();
    }

    async ensureImagesDirExists() {
        try {
            await fs.access(this.imagesDir);
        } catch (error) {
            // Directory doesn't exist, create it
            await fs.mkdir(this.imagesDir, { recursive: true });
        }
    }

    generateUniqueFilename(serviceId, originalFilename) {
        const timestamp = Date.now();
        const extension = path.extname(originalFilename);
        return `service-${serviceId}-${timestamp}${extension}`;
    }

    async saveImage(tempFilePath, serviceId, originalFilename) {
        await this.ensureImagesDirExists();
        
        const uniqueFilename = this.generateUniqueFilename(serviceId, originalFilename);
        const targetPath = path.join(this.imagesDir, uniqueFilename);
        
        // Copy file from temp location to images directory
        await fs.copyFile(tempFilePath, targetPath);
        
        return uniqueFilename;
    }

    async deleteImage(filename) {
        if (!filename) return;
        
        const imagePath = path.join(this.imagesDir, filename);
        try {
            await fs.access(imagePath);
            await fs.unlink(imagePath);
        } catch (error) {
            console.log(`Image file ${filename} not found or already deleted`);
        }
    }

    getImagePath(filename) {
        if (!filename) return null;
        return path.join(this.imagesDir, filename);
    }

    async imageExists(filename) {
        if (!filename) return false;
        
        const imagePath = path.join(this.imagesDir, filename);
        try {
            await fs.access(imagePath);
            return true;
        } catch (error) {
            return false;
        }
    }

    getImagesDirectory() {
        return this.imagesDir;
    }
}

module.exports = new ImageManager();
