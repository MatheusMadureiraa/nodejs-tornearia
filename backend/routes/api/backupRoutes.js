const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const backupHandler = require('../../utils/backupHandler');

// Configure multer for file uploads
const upload = multer({
    dest: path.join(__dirname, '../../uploads/temp'),
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
            cb(null, true);
        } else {
            cb(new Error('Only ZIP files are allowed for restore'));
        }
    }
});

// Create backup
router.post('/create', async (req, res) => {
    try {
        const result = await backupHandler.createBackup();
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Backup criado com sucesso',
                filename: result.filename,
                size: result.size
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erro ao criar backup'
            });
        }
    } catch (error) {
        console.error('Error creating backup:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao criar backup'
        });
    }
});

// Download backup
router.get('/download/:filename?', async (req, res) => {
    try {
        const { filename } = req.params;
        
        if (filename) {
            // Download specific backup file
            const backupPath = path.join(__dirname, '../../backups', filename);
            
            if (!fs.existsSync(backupPath)) {
                return res.status(404).json({ message: 'Arquivo de backup não encontrado' });
            }

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            
            const fileStream = fs.createReadStream(backupPath);
            fileStream.pipe(res);
            
            fileStream.on('error', (err) => {
                console.error('Erro ao ler arquivo de backup:', err);
                res.status(500).json({ message: 'Erro ao gerar backup' });
            });
        } else {
            // Create and download new backup
            const result = await backupHandler.createBackup();
            
            if (!result.success) {
                return res.status(500).json({ message: 'Erro ao criar backup' });
            }

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            
            const fileStream = fs.createReadStream(result.path);
            fileStream.pipe(res);
            
            fileStream.on('error', (err) => {
                console.error('Erro ao ler arquivo de backup:', err);
                res.status(500).json({ message: 'Erro ao gerar backup' });
            });
        }
    } catch (error) {
        console.error('Erro ao fazer backup:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// List backups
router.get('/list', (req, res) => {
    try {
        const backups = backupHandler.getBackupList();
        res.json({
            success: true,
            backups: backups
        });
    } catch (error) {
        console.error('Error listing backups:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar backups'
        });
    }
});

// Restore backup
router.post('/restore', upload.single('backupFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Arquivo de backup é obrigatório'
            });
        }

        const result = await backupHandler.restoreBackup(req.file.path);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Backup restaurado com sucesso',
                metadata: result.metadata
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erro ao restaurar backup'
            });
        }
    } catch (error) {
        console.error('Error restoring backup:', error);
        
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao restaurar backup: ' + error.message
        });
    }
});

// Delete backup
router.delete('/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const success = backupHandler.deleteBackup(filename);
        
        if (success) {
            res.json({
                success: true,
                message: 'Backup deletado com sucesso'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Backup não encontrado'
            });
        }
    } catch (error) {
        console.error('Error deleting backup:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar backup'
        });
    }
});

module.exports = router;