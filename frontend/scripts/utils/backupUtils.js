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
        const fileName = `backup-tornearia-${timestamp}.db`;
        
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
            message: 'Backup realizado com sucesso!',
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