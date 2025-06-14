import { fetchClientsNames } from "./api/clientesApi.js";
import { listarServicos, updateStatusServico } from "./api/servicosApi.js";
import { aplicarMenu, atualizarPaginacao, atualizarTabela, calcularLinhasVisiveis, limitarTexto, limparPesquisa, realizarPesquisa } from "./utils/formatacao.js";

let servicos = [];
let todosServicos = [];
let paginaAtual = 1;
let servicosPorPagina = 12;
let criterioOrdenacao = "6";

const colunas = [
    { key: "nomeServico" },
    { key: "nomeCliente" },
    { key: "preco", format: val => `R$ ${val.toFixed(2)}` },
    { key: "statusServico", format: (val, item) => renderStatusServico(val, item.idServico) },
    { key: "statusPagamento", format: (val, item) => renderStatusPagamento(val, item.idServico) },
    { key: "data", format: val => new Date(val + 'T00:00:00').toLocaleDateString("pt-BR") }
];

function renderTabelaCompletaServicos() {
    servicosPorPagina = calcularLinhasVisiveis();

    servicos.forEach(servico =>{
        limitarTexto(servico, ['nomeServico', 'nomeCliente'], 18);
    });
    atualizarTabela(servicos, paginaAtual, servicosPorPagina, criterioOrdenacao, colunas, 'idServico');
    atualizarPaginacao(servicos, paginaAtual, servicosPorPagina);
    bindStatusSelectEvents();
}

// mudar status nos selects
function bindStatusSelectEvents() {
    document.querySelectorAll(".status-select").forEach(select => {
        select.addEventListener("change", async (evento) => {
            const selectElement = evento.target;
            const row = selectElement.closest("tr");
            const idServico = row.dataset.id;

            const campo = selectElement.dataset.col;
            const valor = parseInt(selectElement.value);

            const servico = servicos.find(s => s.idServico == idServico);
            if (servico) servico[campo] = valor;

            selectElement.className = `status-select ${statusColor(valor)}`;

            try {
                await updateStatusServico(idServico, { [campo]: valor });
                console.log(`✅ ${campo} atualizado com sucesso.`);
            } catch (err) {
                console.error(`❌ Erro ao atualizar ${campo}:`, err);
                alert(`Erro ao atualizar ${campo}: ${err.message}`);
            }

            renderTabelaCompletaServicos
            ();
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const searchInput = document.getElementById("search-input");
    const clearButton = document.querySelector(".clear-icon");

    searchInput.addEventListener("input", () => {
        const pesquisa = searchInput.value.trim();
        clearButton.style.display = pesquisa ? "block" : "none";
    
        if (!pesquisa) {
            servicos = [...todosServicos];
            paginaAtual = 1;
            renderTabelaCompletaServicos
            ();
            return;
        }
    
        const resultado = realizarPesquisa(todosServicos, criterioOrdenacao);
        if (resultado) {
            servicos = resultado;
            paginaAtual = 1;
            renderTabelaCompletaServicos
            ();
        }
    });

    clearButton.addEventListener("click", () => {
        limparPesquisa(); // zera campo e botão
        servicos = [...todosServicos];
        paginaAtual = 1;
        renderTabelaCompletaServicos
        ();
    });

    document.querySelector(".prev").addEventListener("click", () => {
        const totalPaginas = Math.ceil(servicos.length / servicosPorPagina);
        if (paginaAtual > 1) {
            paginaAtual--;
            renderTabelaCompletaServicos
            ();
        }
    });

    document.querySelector(".next").addEventListener("click", () => {
        const totalPaginas = Math.ceil(servicos.length / servicosPorPagina);
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            renderTabelaCompletaServicos
            ();
        }
    });

    document.querySelector("#tabela-pedidos").addEventListener("click", (event) => {
        if (event.target.classList.contains("menu-icon")) {
            aplicarMenu(event.target);
            return;
        }
    });

    document.getElementById("entries").addEventListener("change", (e) => {
        criterioOrdenacao = e.target.value;
        const resultado = realizarPesquisa(servicos, criterioOrdenacao);
        if (resultado) {
            servicos = resultado;
            paginaAtual = 1;
            renderTabelaCompletaServicos
            ();
        }
    });

    try {
        const result = await listarServicos();
        todosServicos = result.data;
        servicos = [...todosServicos];
        await fetchClientsNames(servicos);
        renderTabelaCompletaServicos
        ();
    } catch (error) {
        console.error("Erro ao carregar serviços:", error);
    }
});

function renderStatusServico(status, idServico) {
    return `<select class="status-select ${statusColor(status)}" data-id="${idServico}" data-col="statusServico">
                <option value="-1" ${status === -1 ? "selected" : ""}>Pendente</option>
                <option value="0" ${status === 0 ? "selected" : ""}>Em Andamento</option>
                <option value="1" ${status === 1 ? "selected" : ""}>Concluído</option>
            </select>`;
}

function renderStatusPagamento(status, idServico) {
    return `<select class="status-select ${statusColor(status)}" data-id="${idServico}" data-col="statusPagamento">
                <option value="-1" ${status === -1 ? "selected" : ""}>Pendente</option>
                <option value="0" ${status === 0 ? "selected" : ""}>Devendo (parcial)</option>
                <option value="1" ${status === 1 ? "selected" : ""}>Pago</option>
            </select>`;
}

function statusColor(status) {
    switch (parseInt(status)) {
        case -1: return "bg-red-500 text-white";
        case 0: return "bg-yellow-400 text-black";
        case 1: return "bg-green-500 text-white";
        default: return "";
    }
}

window.addEventListener("resize", () => {
    renderTabelaCompletaServicos
    ();
});
