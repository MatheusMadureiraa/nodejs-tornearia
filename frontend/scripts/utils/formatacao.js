function formatarPreco(inputElement) {
    let rawValue = inputElement.value.replace(/\D/g, "");
    let floatValue = parseFloat(rawValue) / 100;
    inputElement.value = floatValue;
}

function formatarNomeArquivo(fileInput, displayElement, maxLength = 12) {
    let fileName = fileInput.files.length > 0 ? fileInput.files[0].name : "Selecionar imagem";
    if (fileName.length > maxLength) {
        fileName = fileName.substring(0, maxLength) + "...";
    }
    displayElement.textContent = "Imagem: " + fileName;
}

function formatarEntradaPreco(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, "");
    if (value.length > 9) {
        value = value.slice(0, 9);
    }
    let numericValue = parseInt(value || "0", 10);
    input.value = `R$ ${(numericValue / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

function setTodayDate(inputId) {
    const input = document.getElementById(inputId);
    if (!input || input.value) return; // já preenchido, respeita escolha

    const hoje = new Date();
    hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
    input.value = hoje.toISOString().split('T')[0];
}

function limitarTexto(item, propriedades, limite) {
    propriedades.forEach(prop => {
        if (item[prop] && item[prop].length > limite) {
            item[prop] = item[prop].slice(0, limite) + "...";
        }
    });
}

function limparPesquisa() {
    const searchInput = document.getElementById("search-input");
    const clearIcon = document.querySelector(".clear-icon");
    searchInput.value = "";
    clearIcon.style.display = "none";
}

function aplicarMenu(menuIcon) {
    const dropdown = menuIcon.nextElementSibling;
    if (!dropdown) return;
    const isVisible = dropdown.style.display === "flex";
    document.querySelectorAll(".menu-dropdown").forEach(menu => {
        if (menu !== dropdown) menu.style.display = "none";
    });
    dropdown.style.display = isVisible ? "none" : "flex";
    document.removeEventListener("click", fecharAoClicarFora);
    if (!isVisible) {
        setTimeout(() => document.addEventListener("click", fecharAoClicarFora), 0);
    }
}

function fecharAoClicarFora(event) {
    if (event.target.closest(".menu-container")) return;
    document.querySelectorAll(".menu-dropdown").forEach(menu => menu.style.display = "none");
    document.removeEventListener("click", fecharAoClicarFora);
}

function calcularLinhasVisiveis() {
    const tableContainer = document.querySelector(".table-container");
    const tableControls = document.querySelector(".table-controls");
    const pagination = document.querySelector(".pagination");
    const availableHeight = pagination.getBoundingClientRect().top - tableControls.getBoundingClientRect().bottom - 50;
    const rowHeight = 43;
    const visibleRows = Math.floor(availableHeight / rowHeight);
    return Math.max((visibleRows - 2), 3);
}

function atualizarTabela(dados, paginaAtual, itensPorPagina, criterioOrdenacao, colunas, idKey) {
    const tableBody = document.querySelector("#tabela-pedidos");
    tableBody.innerHTML = "";

    const dadosOrdenados = ordenarDados([...dados], criterioOrdenacao);
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const dadosPagina = dadosOrdenados.slice(inicio, fim);

    dadosPagina.forEach((item) => {
        const row = document.createElement("tr");
        row.dataset.id = item[idKey];

        row.innerHTML = colunas.map(col => `<td>${col.format ? col.format(item[col.key], item) : item[col.key]}</td>`).join("") +
            `<td class="acoes">
                <img src="../public/assets/icons/more.svg" class="menu-icon">
                <div class="menu-dropdown">
                    <button onclick="verDetalhes('${idKey}', ${item[idKey]})">Ver Detalhes</button>
                    <button onclick="editarItem('${idKey}', ${item[idKey]})">Editar</button>
                    <button onclick="excluirItem('${idKey}', ${item[idKey]})">Excluir</button>
                </div>
            </td>`;
        tableBody.appendChild(row);
    });
}


function atualizarPaginacao(dados, paginaAtual, itensPorPagina) {
    const totalPaginas = Math.ceil(dados.length / itensPorPagina);
    document.querySelector(".page-numbers").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
    document.querySelector(".prev").disabled = paginaAtual === 1;
    document.querySelector(".next").disabled = paginaAtual === totalPaginas;
}

function realizarPesquisa(dados, criterioOrdenacao) {
    const searchInput = document.getElementById("search-input");
    const searchValue = searchInput.value.toLowerCase();
    let dadosFiltrados = [...dados];

    if (searchValue.trim() !== "") {
        dadosFiltrados = dadosFiltrados.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().startsWith(searchValue)
            )
        );
    }
    return ordenarDados(dadosFiltrados, criterioOrdenacao);
}

function ordenarDados(lista, criterioOrdenacao) {
    return lista.sort((a, b) => {
        switch (criterioOrdenacao) {
            case "1":
                return (a.nomeCliente || "").localeCompare(b.nomeCliente || "");
            case "2":
                return (b.nomeCliente  || "").localeCompare(a.nomeCliente || "");
            case "3":
                return (b.quantidade || 0) - (a.quantidade || 0);
            case "4":
                return (b.valor || b.preco || 0) - (a.valor || a.preco || 0);
            case "5":
                return new Date(a.data || 0) - new Date(b.data || 0);
            case "6":
                return new Date(b.data || 0) - new Date(a.data || 0);
            case "7":
                return (a.statusServico || 0) - (b.statusServico || 0);
            case "8":
                return (a.statusPagamento || 0) - (b.statusPagamento || 0);
            case "9":
                return (a.idCliente || 0) - (b.idCliente || 0);
            case "10":
                return (b.idCliente || 0) - (a.idCliente || 0);
            default:
                return 0;
        }
    });
}

export {
    aplicarMenu, atualizarPaginacao, atualizarTabela, calcularLinhasVisiveis, formatarEntradaPreco,
    formatarNomeArquivo, formatarPreco, limitarTexto, limparPesquisa, ordenarDados, realizarPesquisa, setTodayDate
};

