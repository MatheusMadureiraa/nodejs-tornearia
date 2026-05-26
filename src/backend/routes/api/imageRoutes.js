const express = require("express");
const router = express.Router();
const imageManager = require('../../utils/imageManager.js');
const path = require('path');

// Serve images
router.get('/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const imagePath = imageManager.getImagePath(filename);
        
        if (!imagePath || !(await imageManager.imageExists(filename))) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Set appropriate headers
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        
        const mimeType = mimeTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);
        
        res.sendFile(imagePath);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({ message: 'Error serving image' });
    }
});

module.exports = router;
