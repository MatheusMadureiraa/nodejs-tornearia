import { listarClientes } from "./api/clientesApi.js";
import {
    aplicarMenu,
    atualizarPaginacao,
    atualizarTabela,
    calcularLinhasVisiveis,
    limitarTexto,
    limparPesquisa,
    realizarPesquisa
} from "./utils/formatacao.js";

let clientes = [];
let todosClientes = [];
let paginaAtual = 1;
let clientesPorPagina = 12;
let criterioOrdenacao = "10";

const colunas = [
    { key: "idCliente" },
    { key: "nomeCliente" }
];

function renderTabelaCompletaClientes
() {
    clientesPorPagina = calcularLinhasVisiveis();

    clientes.forEach(cliente => {
        limitarTexto(cliente, ['nomeCliente'], 20);
    });

    atualizarTabela(clientes, paginaAtual, clientesPorPagina, criterioOrdenacao, colunas, 'idCliente');
    atualizarPaginacao(clientes, paginaAtual, clientesPorPagina);
}

document.addEventListener("DOMContentLoaded", async () => {
    const searchInput = document.getElementById("search-input");
    const clearButton = document.querySelector(".clear-icon");

    searchInput.addEventListener("input", () => {
        const pesquisa = searchInput.value.trim();
        clearButton.style.display = pesquisa ? "block" : "none";
    
        if (!pesquisa) {
            clientes = [...todosClientes];
            paginaAtual = 1;
            renderTabelaCompletaClientes
            ();
            return;
        }
    
        const resultado = realizarPesquisa(todosClientes, criterioOrdenacao);
        if (resultado) {
            clientes = resultado;
            paginaAtual = 1;
            renderTabelaCompletaClientes
            ();
        }
    });

    clearButton.addEventListener("click", () => {
        limparPesquisa(); // zera campo e botão
        clientes = [...todosClientes];
        paginaAtual = 1;
        renderTabelaCompletaClientes
        ();
    });

    try {
        const result = await listarClientes();
        todosClientes = result.data;
        clientes = [...todosClientes];
        renderTabelaCompletaClientes
        ();
    } catch (error) {
        console.error("Erro ao carregar clientes:", error);
    }

    document.querySelector(".prev").addEventListener("click", () => {
        if (paginaAtual > 1) {
            paginaAtual--;
            renderTabelaCompletaClientes
            ();
        }
    });

    document.querySelector(".next").addEventListener("click", () => {
        const totalPaginas = Math.ceil(clientes.length / clientesPorPagina);
        if (paginaAtual < totalPaginas) {
            paginaAtual++;
            renderTabelaCompletaClientes
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
        const resultado = realizarPesquisa(clientes, criterioOrdenacao);
        if (resultado) {
            clientes = resultado;
            paginaAtual = 1;
            renderTabelaCompletaClientes
            ();
        }
    });
});

window.addEventListener("resize", () => {
    renderTabelaCompletaClientes
    ();
});
