import { criarPedido } from './api/pedidosApi.js';
import { showAlert } from "./utils/alerts.js";
import { formatarEntradaPreco, formatarPreco, setTodayDate } from './utils/formatacao.js';

document.addEventListener("DOMContentLoaded", () => {
    setTodayDate("data");
    const form = document.querySelector('.form-add');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nomeMaterial = document.getElementById('nomeMaterial').value.trim();
        const fornecedor = document.getElementById('fornecedor').value.trim();
        const quantidade = document.getElementById('quantidade').value.trim();
        const valor = document.getElementById('valor').value.trim();
        const data = document.getElementById('data').value;
        const entregador = document.getElementById('entregador').value.trim();
        const observacao = document.getElementById('observacao').value.trim();

        const valorFormatado = valor.replace(',', '.');

        const pedidoData = {
            nomeMaterial,
            fornecedor: fornecedor || "Não informado",
            quantidade: parseInt(quantidade),
            valor: parseFloat(valorFormatado),
            data,
            entregador,
            observacao
        }

        // validações
        if (!pedidoData.nomeMaterial) {
            showAlert({
                    message: `Nome é obrigatório.`,
                    type: "error",
                    icon: "../public/assets/icons/error.svg"
            });
            return;
        }


        // criação do pedido
        try{
            const result = await criarPedido(pedidoData);
            if(result.status === 201){
                setTodayDate("data");
                console.log(result.data);
                showAlert({
                    message: `Gasto de ${nomeMaterial.toUpperCase()} cadastrado com sucesso!`,
                    type: "success",
                    icon: "../public/assets/icons/success.svg"
                });
                return;
            } else {
                showAlert({
                    message: `Erro ao cadastrar ${nomeMaterial.toUpperCase()}!`,
                    type: "error",
                    icon: "../public/assets/icons/error.svg"
                });
                return;
            }
        } catch (error) {
            console.error('Erro ao cadastrar pedido:', error);
            showAlert({
                message: `Erro. Verifique os dados e tente novamente.`,
                type: "error",
                icon: "../public/assets/icons/error.svg"
            });
            return;
        }
    });
});

// formatar entrada do preço
document.getElementById("valor").addEventListener("input", formatarEntradaPreco);

// ajustar preço antes do envio
document.querySelector("form").addEventListener("submit", function () {
    formatarPreco(document.getElementById("valor"));
});

