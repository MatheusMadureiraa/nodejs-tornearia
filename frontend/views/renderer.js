import { realizarBackup, restaurarBackup } from '../scripts/utils/backupUtils.js';

window.onload = () => {
    fetch('../components/sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;

            // Configurar botão de sair
            const sairIcon = document.getElementById('sair');
            sairIcon.addEventListener('click', () => {
                if (window.api?.fecharApp) {
                    window.api.fecharApp();
                } else {
                    console.warn('API do Electron não disponível.');
                }
            });

            // Configurar botão de backup
            const backupBtn = document.getElementById('backup-btn');
            if (backupBtn) {
                backupBtn.addEventListener('click', realizarBackup);
            }

            // Configurar botão de restaurar
            const restoreBtn = document.getElementById('restore-btn');
            if (restoreBtn) {
                restoreBtn.addEventListener('click', restaurarBackup);
            }
        })
        .catch(error => console.error('Erro ao carregar o sidebar:', error));
};