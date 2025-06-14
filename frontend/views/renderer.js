window.onload = () => {
    fetch('../components/sidebar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sidebar-container').innerHTML = data;

            const sairIcon = document.getElementById('sair');
            sairIcon.addEventListener('click', () => {
                if (window.api?.fecharApp) {
                    window.api.fecharApp();
                } else {
                    console.warn('API do Electron não disponível.');
                }
            });
        })
        .catch(error => console.error('Erro ao carregar o sidebar:', error));
};


