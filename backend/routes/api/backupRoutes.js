const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Rota para fazer backup do banco de dados
router.get('/download', (req, res) => {
    try {
        const dbPath = path.resolve(__dirname, '../../database/tornearia.db');
        
        if (!fs.existsSync(dbPath)) {
            return res.status(404).json({ message: 'Banco de dados não encontrado' });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const backupFileName = `backup-tornearia-${timestamp}.db`;

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${backupFileName}"`);
        
        const fileStream = fs.createReadStream(dbPath);
        fileStream.pipe(res);
        
        fileStream.on('error', (err) => {
            console.error('Erro ao ler arquivo de backup:', err);
            res.status(500).json({ message: 'Erro ao gerar backup' });
        });

    } catch (error) {
        console.error('Erro ao fazer backup:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;