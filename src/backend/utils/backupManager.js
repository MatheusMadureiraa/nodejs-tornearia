const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const unzipper = require('unzipper');
const { app } = require('electron');
const imageManager = require('./imageManager.js');

class BackupManager {
    constructor() {
        // Use app's user data path for storing backups, fallback to local directory
        try {
            const { app } = require('electron');
            this.backupsDir = path.join(app.getPath('userData'), 'backups');
        } catch (error) {
            // Fallback for when running outside Electron context
            this.backupsDir = path.join(process.cwd(), 'backups');
        }
        this.ensureBackupsDirExists();
    }

    async ensureBackupsDirExists() {
        try {
            await fs.access(this.backupsDir);
        } catch (error) {
            await fs.mkdir(this.backupsDir, { recursive: true });
        }
    }

    async createBackup() {
        await this.ensureBackupsDirExists();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilename = `tornearia-backup-${timestamp}.zip`;
        const backupPath = path.join(this.backupsDir, backupFilename);
        
        return new Promise((resolve, reject) => {
            const output = require('fs').createWriteStream(backupPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            
            output.on('close', () => {
                resolve({
                    filename: backupFilename,
                    path: backupPath,
                    size: archive.pointer()
                });
            });
            
            archive.on('error', (err) => {
                reject(err);
            });
            
            archive.pipe(output);
            
            // Add database file
            const dbPath = path.join(__dirname, '../database/tornearia.db');
            archive.file(dbPath, { name: 'database/tornearia.db' });
            
            // Add all images
            const imagesDir = imageManager.getImagesDirectory();
            archive.directory(imagesDir, 'images');
            
            // Add metadata
            const metadata = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                description: 'Tornearia System Backup'
            };
            archive.append(JSON.stringify(metadata, null, 2), { name: 'backup-metadata.json' });
            
            archive.finalize();
        });
    }

    async restoreBackup(backupFilePath) {
        const tempRestoreDir = path.join(app.getPath('userData'), 'temp-restore');
        
        try {
            // Clean temp directory
            await this.cleanDirectory(tempRestoreDir);
            await fs.mkdir(tempRestoreDir, { recursive: true });
            
            // Extract backup
            await new Promise((resolve, reject) => {
                require('fs').createReadStream(backupFilePath)
                    .pipe(unzipper.Extract({ path: tempRestoreDir }))
                    .on('close', resolve)
                    .on('error', reject);
            });
            
            // Validate backup structure
            const metadataPath = path.join(tempRestoreDir, 'backup-metadata.json');
            const dbPath = path.join(tempRestoreDir, 'database', 'tornearia.db');
            const imagesPath = path.join(tempRestoreDir, 'images');
            
            // Check if required files exist
            await fs.access(metadataPath);
            await fs.access(dbPath);
            
            // Read metadata
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
            
            // Create backup of current data before restore
            const currentBackup = await this.createBackup();
            console.log('Current data backed up to:', currentBackup.filename);
            
            // Restore database
            const targetDbPath = path.join(__dirname, '../database/tornearia.db');
            await fs.copyFile(dbPath, targetDbPath);
            
            // Restore images
            const targetImagesDir = imageManager.getImagesDirectory();
            await this.cleanDirectory(targetImagesDir);
            
            try {
                await fs.access(imagesPath);
                await this.copyDirectory(imagesPath, targetImagesDir);
            } catch (error) {
                console.log('No images found in backup, skipping image restore');
            }
            
            // Clean up temp directory
            await this.cleanDirectory(tempRestoreDir);
            
            return {
                success: true,
                metadata,
                currentBackupFile: currentBackup.filename
            };
            
        } catch (error) {
            // Clean up temp directory on error
            await this.cleanDirectory(tempRestoreDir);
            throw error;
        }
    }

    async cleanDirectory(dirPath) {
        try {
            const files = await fs.readdir(dirPath);
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stat = await fs.stat(filePath);
                if (stat.isDirectory()) {
                    await this.cleanDirectory(filePath);
                    await fs.rmdir(filePath);
                } else {
                    await fs.unlink(filePath);
                }
            }
        } catch (error) {
            // Directory doesn't exist or is already clean
            console.log('Directory clean operation:', error.message);
        }
    }

    async copyDirectory(source, target) {
        await fs.mkdir(target, { recursive: true });
        const files = await fs.readdir(source);
        
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);
            const stat = await fs.stat(sourcePath);
            
            if (stat.isDirectory()) {
                await this.copyDirectory(sourcePath, targetPath);
            } else {
                await fs.copyFile(sourcePath, targetPath);
            }
        }
    }

    async listBackups() {
        await this.ensureBackupsDirExists();
        const files = await fs.readdir(this.backupsDir);
        const backups = [];
        
        for (const file of files) {
            if (file.endsWith('.zip')) {
                const filePath = path.join(this.backupsDir, file);
                const stats = await fs.stat(filePath);
                backups.push({
                    filename: file,
                    path: filePath,
                    size: stats.size,
                    created: stats.mtime
                });
            }
        }
        
        return backups.sort((a, b) => b.created - a.created);
    }

    async deleteBackup(filename) {
        const backupPath = path.join(this.backupsDir, filename);
        await fs.unlink(backupPath);
    }
}

module.exports = new BackupManager();
