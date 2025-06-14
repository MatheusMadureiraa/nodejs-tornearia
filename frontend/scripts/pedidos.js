import { listarPedidos } from "./api/pedidosApi.js";
import {
    aplicarMenu,
    atualizarPaginacao,
    atualizarTabela,
    calcularLinhasVisiveis,
    limitarTexto,
    limparPesquisa,
    realizarPesquisa
} from "./utils/formatacao.js";

let pedidos = [];
let todosPedidos = [];
let paginaAtual = 1;
let pedidosPorPagina = 12;
let criterioOrdenacao = "6";

const colunas = [
    { key: "nomeMaterial" },
    { key: "fornecedor" },
    { key: "quantidade" },
    { key: "valor", format: val => `R$ ${val.toFixed(2)}` },
    { key: "data", format: val => new Date(val + 'T00:00:00').toLocaleDateString("pt-BR") }
];

function renderTabelaCompletaPedidos() {
    pedidosPorPagina = calcularLinhasVisiveis();

    pedidos.forEach(pedido => {
        limitarTexto(pedido, ['nomeMaterial', 'fornecedor'], 15);
    });
    
    atualizarTabela(pedidos, paginaAtual, pedidosPorPagina, criterioOrdenacao, colunas, 'idPedido');
    atualizarPaginacao(pedidos, paginaAtual, pedidosPorPagina);
}

document.addEventListener("DOMContentLoaded", async () => {
    const searchInput = document.getElementById("search-input");
    const clearButton = document.querySelector(".clear-icon");

    searchInput.addEventListener("input", () => {
        const pesquisa = searchInput.value.trim();
        clearButton.style.display = pesquisa ? "block" : "none";

        if (!pesquisa) {
            pedidos = [...todosPedidos];
            paginaAtual = 1;
            renderTabelaCompletaPedidos();
            return;
        }
    
        const resultado = realizarPesquisa(todosPedidos, criterioOrdenacao);
        if (resultado) {
            pedidos = resultado;
            paginaAtual = 1;
            renderTabelaCompletaPedidos();
        }
    });

    clearButton.addEventListener("click", () => {
        limparPesquisa(); // zera campo e botão
        pedidos = [...todosPedidos];
        paginaAtual = 1;
        renderTabelaCompletaPedidos();
    });

    try {
        const result = await listarPedidos();
        todosPedidos = result.data;
        pedidos = [...todosPedidos];
        renderTabelaCompletaPedidos();
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
    }

    document.querySelector(".prev").addEventListener("click", () => {
        const totalPaginas = Math.ceil(pedidos.length / pedidosPorPagina);
        if (paginaAtual > 1) {
            paginaAtual--;
            renderTabelaCompletaPedidos();
        }
    });

    document.querySelector(".next").addEventListener("click", () => {
        const totalPaginas = Math.ceil(pedidos.length / pedidosPorPagina);
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            renderTabelaCompletaPedidos();
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
        const resultado = realizarPesquisa(pedidos, criterioOrdenacao);
        if (resultado) {
            pedidos = resultado;
            paginaAtual = 1;
            renderTabelaCompletaPedidos();
        }
    });
});

window.addEventListener("resize", () => {
    renderTabelaCompletaPedidos();
});
