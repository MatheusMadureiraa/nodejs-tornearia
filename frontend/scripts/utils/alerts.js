// alerts.js (versão com logs adicionais para depuração)
export async function showAlert({ message, type, duration = 5000, icon = null }) {
    console.log(`[showAlert] Chamada com: type=${type}, duration=${duration}ms, message="${message}"`);

    return new Promise((resolve) => {
        const container = document.getElementById("alert-container");
        if (!container) {
            console.error("[showAlert] Erro: Container de alerta #alert-container não encontrado no DOM.");
            resolve(); // Resolve para evitar que a promise fique pendurada
            return;
        }

        const alert = document.createElement("div");
        alert.className = `alert ${type}`; // ex: "alert success" ou "alert error"

        const progressId = `progress-${Date.now()}`;

        alert.innerHTML = `
            ${icon ? `<img src="${icon}" alt="ícone ${type}">` : ''}
            <span>${message}</span>
            <button class="close-btn">×</button>
            <div id="${progressId}" class="progress-bar" style="animation-duration: ${duration}ms;"></div>
        `;

        container.appendChild(alert);
        console.log(`[showAlert] Alerta tipo "${type}" adicionado ao container. Duração da barra de progresso: ${duration}ms.`);

        // delayBeforeStart é o tempo para a animação de entrada (slideIn), assumindo que ela dura 0.3s
        // Se a animação slideIn for definida no CSS para a classe .alert
        const delayBeforeStart = 300; 
        const totalVisibleTime = duration + delayBeforeStart;
        console.log(`[showAlert] Alerta tipo "${type}": totalVisibleTime (duration + slideIn) = ${totalVisibleTime}ms.`);

        const timeout = setTimeout(() => {
            console.log(`[showAlert] Alerta tipo "${type}": Timeout principal atingido (${totalVisibleTime}ms). Iniciando fadeOut.`);
            // Aplica a animação de fadeOut. Certifique-se que 'fadeOut' está definida no seu CSS.
            alert.style.animation = 'fadeOut 0.4s forwards'; 
            
            setTimeout(() => {
                console.log(`[showAlert] Alerta tipo "${type}": Animação fadeOut (400ms) presumidamente completa. Removendo alerta.`);
                if (alert.parentNode) { // Boa prática: verificar se o alerta ainda está no DOM
                    alert.remove();
                }
                resolve();
            }, 400); // Duração da animação fadeOut
        }, totalVisibleTime);

        alert.querySelector('.close-btn').addEventListener('click', () => {
            console.log(`[showAlert] Alerta tipo "${type}": Botão de fechar clicado. Limpando timeout principal e removendo alerta.`);
            clearTimeout(timeout);
            if (alert.parentNode) { // Boa prática: verificar se o alerta ainda está no DOM
                alert.remove();
            }
            resolve();
        });
    });
}
