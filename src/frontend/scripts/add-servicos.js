import { criarServico } from "./api/servicosApi.js";
import { formatarEntradaPreco, formatarPreco, setTodayDate } from "./utils/formatacao.js";
import { showAlert } from "./utils/alerts.js";
import { AutocompleteComponent, getClientsForAutocomplete } from "./utils/autocomplete.js";

// evento de envio do formulário
document.addEventListener("DOMContentLoaded", () => {
    setTodayDate("data");
    
    // Setup autocomplete for client name
    const clienteInput = document.getElementById("nomeCliente");
    const clienteAutocomplete = new AutocompleteComponent(
        clienteInput,
        getClientsForAutocomplete,
        (selectedClient) => {
            console.log('Cliente selecionado:', selectedClient);
        }
    );
    
    const form = document.querySelector(".form-add");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // pegar valores dos campos
        const nomeServico = document.getElementById("nome").value.trim();
        const nomeCliente = document.getElementById("nomeCliente").value.trim();
        const preco = document.getElementById("preco").value.trim();
        const pagamento = document.getElementById("pagamento").value;
        const data = document.getElementById("data").value;
        const notaFiscal = document.getElementById("notaFiscal").value.trim();
        const observacao = document.getElementById("observacao").value.trim();

        if (!nomeServico || !nomeCliente || !preco) {
            showAlert({
                message: `Nome do serviço, nome do cliente e preço são obrigatórios.`,
                type: "error",
                icon: "../public/assets/icons/error.svg"
            });
            return;
        }

        const precoFormatado = preco.replace(",", ".");
        
        const servicoData = {
            nomeServico,
            nomeCliente,
            preco: parseFloat(precoFormatado),
            data,
            pagamento,
            notaFiscal,
            observacao
        };

        // enviar para a API
        try {
            console.log(servicoData);
            const resposta = await criarServico(servicoData);
            console.log(resposta.data, resposta.status);
            if (resposta.status === 201) {
                showAlert({
                    message: `Serviço ${nomeServico.toUpperCase()} cadastrado com sucesso!`,
                    type: "success",
                    icon: "../public/assets/icons/success.svg"
                });
                form.reset();
                setTodayDate("data");
                return;
            } else {
                showAlert({
                    message: `Erro ao cadastrar ${nomeServico.toUpperCase()}!`,
                    type: "error",
                    icon: "../public/assets/icons/error.svg"
                });
                return;
            }
        } catch (error) {
            console.error("Erro ao cadastrar serviço:", error);
            showAlert({
                message: "Erro de conexão com o servidor.",
                type: "error",
                icon: "../public/assets/icons/error.svg"
            });
        }
    });
});

// formatar entrada do preço
document.getElementById("preco").addEventListener("input", formatarEntradaPreco);

// ajustar preço antes do envio
document.querySelector("form").addEventListener("submit", function () {
    formatarPreco(document.getElementById("preco"));
});