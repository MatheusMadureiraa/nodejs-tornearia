import { showAlert } from './alerts.js';

export async function realizarBackup() {
    const backupBtn = document.getElementById('backup-btn');
    
    try {
        // Mostrar estado de loading
        backupBtn.classList.add('loading');
        backupBtn.innerHTML = '<img src="../public/assets/icons/backup.svg" alt="Backup">Fazendo backup...';
        
        const response = await fetch('http://localhost:3500/backup/download', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        // Criar blob do arquivo
        const blob = await response.blob();
        
        // Criar nome do arquivo com timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `backup-tornearia-${timestamp}.zip`;
        
        // Criar link de download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        // Limpar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        await showAlert({
            message: 'Backup completo realizado com sucesso! Arquivo inclui banco de dados e imagens.',
            type: 'success',
            icon: '../public/assets/icons/success.svg'
        });

    } catch (error) {
        console.error('Erro ao fazer backup:', error);
        await showAlert({
            message: 'Erro ao fazer backup. Tente novamente.',
            type: 'error',
            icon: '../public/assets/icons/error.svg'
        });
    } finally {
        // Restaurar estado do botão
        backupBtn.classList.remove('loading');
        backupBtn.innerHTML = '<img src="../public/assets/icons/backup.svg" alt="Backup">Backup';
    }
}

export async function restaurarBackup() {
    try {
        // Create file input for backup selection
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.zip';
        fileInput.style.display = 'none';
        
        document.body.appendChild(fileInput);
        
        return new Promise((resolve, reject) => {
            fileInput.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) {
                    document.body.removeChild(fileInput);
                    return;
                }

                try {
                    const formData = new FormData();
                    formData.append('backupFile', file);

                    await showAlert({
                        message: 'Iniciando restauração do backup...',
                        type: 'info',
                        duration: 2000
                    });

                    const response = await fetch('http://localhost:3500/backup/restore', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        await showAlert({
                            message: 'Backup restaurado com sucesso! A aplicação será reiniciada.',
                            type: 'success',
                            icon: '../public/assets/icons/success.svg'
                        });
                        
                        // Restart application after successful restore
                        setTimeout(() => {
                            if (window.api?.restartApp) {
                                window.api.restartApp();
                            } else {
                                window.location.reload();
                            }
                        }, 2000);
                        
                        resolve(result);
                    } else {
                        throw new Error(result.message || 'Erro ao restaurar backup');
                    }
                } catch (error) {
                    console.error('Erro ao restaurar backup:', error);
                    await showAlert({
                        message: 'Erro ao restaurar backup: ' + error.message,
                        type: 'error',
                        icon: '../public/assets/icons/error.svg'
                    });
                    reject(error);
                } finally {
                    document.body.removeChild(fileInput);
                }
            });

            fileInput.click();
        });
    } catch (error) {
        console.error('Erro ao iniciar restauração:', error);
        await showAlert({
            message: 'Erro ao iniciar restauração do backup.',
            type: 'error',
            icon: '../public/assets/icons/error.svg'
        });
    }
}

export async function listarBackups() {
    try {
        const response = await fetch('http://localhost:3500/backup/list');
        const result = await response.json();
        
        if (response.ok && result.success) {
            return result.backups;
        } else {
            throw new Error(result.message || 'Erro ao listar backups');
        }
    } catch (error) {
        console.error('Erro ao listar backups:', error);
        return [];
    }
}