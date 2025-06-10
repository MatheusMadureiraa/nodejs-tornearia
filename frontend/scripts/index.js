window.addEventListener('DOMContentLoaded', () => {
    const h1 = document.querySelector('h1');
    const textoTitulo = h1.textContent;
    h1.textContent = ''; 
    
    const duracao = 1500; // 1.5seg
    const intervaloEntreLetras = duracao / textoTitulo.length;

    let index = 0;
    const intervalo = setInterval(() => {
        if(index < textoTitulo.length) {
            h1.textContent += textoTitulo[index];
            index ++;
        }
        else {
            clearInterval(intervalo);
        }
    }, intervaloEntreLetras);
});