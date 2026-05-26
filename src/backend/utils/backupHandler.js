const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const unzipper = require('unzipper');
const { getDBConnection } = require('../database/conexao');

class BackupHandler {
    constructor() {
        this.backupDir = path.join(__dirname, '..', 'backups');
        this.dbPath = path.join(__dirname, '..', 'database', 'tornearia.db');
        this.ensureBackupDirExists();
    }

    ensureBackupDirExists() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async createBackup() {
        return new Promise((resolve, reject) => {
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
                const backupFileName = `backup-tornearia-${timestamp}.zip`;
                const backupPath = path.join(this.backupDir, backupFileName);

                const output = fs.createWriteStream(backupPath);
                const archive = archiver('zip', { zlib: { level: 9 } });

                output.on('close', () => {
                    console.log(`Backup created: ${backupFileName} (${archive.pointer()} bytes)`);
                    resolve({
                        success: true,
                        filename: backupFileName,
                        path: backupPath,
                        size: archive.pointer()
                    });
                });

                archive.on('error', (err) => {
                    console.error('Archive error:', err);
                    reject(err);
                });

                archive.pipe(output);

                // Add database file
                if (fs.existsSync(this.dbPath)) {
                    archive.file(this.dbPath, { name: 'tornearia.db' });
                }

                // Add metadata file
                const metadata = {
                    created: new Date().toISOString(),
                    version: '1.0.0',
                    description: 'Vallim Tornearia System Backup - Database Only',
                    includes: ['database']
                };
                archive.append(JSON.stringify(metadata, null, 2), { name: 'backup-info.json' });

                archive.finalize();
            } catch (error) {
                console.error('Error creating backup:', error);
                reject(error);
            }
        });
    }

    async restoreBackup(backupFilePath) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!fs.existsSync(backupFilePath)) {
                    throw new Error('Backup file not found');
                }

                // Create temporary restore directory
                const tempRestoreDir = path.join(this.backupDir, 'temp-restore');
                if (fs.existsSync(tempRestoreDir)) {
                    fs.rmSync(tempRestoreDir, { recursive: true, force: true });
                }
                fs.mkdirSync(tempRestoreDir, { recursive: true });

                // Extract backup file
                await fs.createReadStream(backupFilePath)
                    .pipe(unzipper.Extract({ path: tempRestoreDir }))
                    .promise();

                // Validate backup contents
                const dbBackupPath = path.join(tempRestoreDir, 'tornearia.db');
                const metadataPath = path.join(tempRestoreDir, 'backup-info.json');

                if (!fs.existsSync(dbBackupPath)) {
                    throw new Error('Invalid backup: database file not found');
                }

                // Close current database connection
                const db = getDBConnection();
                if (db) {
                    db.close();
                }

                // Backup current files before restore
                const currentBackupDir = path.join(this.backupDir, `pre-restore-${Date.now()}`);
                fs.mkdirSync(currentBackupDir, { recursive: true });

                if (fs.existsSync(this.dbPath)) {
                    fs.copyFileSync(this.dbPath, path.join(currentBackupDir, 'tornearia.db'));
                }

                // Restore database
                fs.copyFileSync(dbBackupPath, this.dbPath);

                // Read metadata if available
                let metadata = null;
                if (fs.existsSync(metadataPath)) {
                    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                }

                // Clean up temp directory
                fs.rmSync(tempRestoreDir, { recursive: true, force: true });

                resolve({
                    success: true,
                    metadata,
                    currentBackupPath: currentBackupDir
                });

            } catch (error) {
                console.error('Error restoring backup:', error);
                reject(error);
            }
        });
    }

    getBackupList() {
        try {
            if (!fs.existsSync(this.backupDir)) {
                return [];
            }

            return fs.readdirSync(this.backupDir)
                .filter(file => file.endsWith('.zip') && file.startsWith('backup-tornearia-'))
                .map(file => {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    return {
                        filename: file,
                        path: filePath,
                        size: stats.size,
                        created: stats.mtime
                    };
                })
                .sort((a, b) => b.created - a.created);
        } catch (error) {
            console.error('Error getting backup list:', error);
            return [];
        }
    }

    deleteBackup(filename) {
        try {
            const backupPath = path.join(this.backupDir, filename);
            if (fs.existsSync(backupPath)) {
                fs.unlinkSync(backupPath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting backup:', error);
            return false;
        }
    }
}

module.exports = new BackupHandler();