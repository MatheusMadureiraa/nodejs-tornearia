import { editarClientePorId, excluirClientePorId, listarClientePorId } from '../api/clientesApi.js';
import { editarPedidoPorId, excluirPedidoPorId, listarPedidoPorId } from '../api/pedidosApi.js';
import { editarServicoPorId, excluirServicoPorId, listarServicoPorId } from '../api/servicosApi.js';
import { showAlert } from './alerts.js';

// Variável para controlar o estado de submissão
let isSubmitting = false;

function formatarTexto(texto) {
    if (typeof texto !== 'string') return '';
    return texto.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
}

function fecharModal() {
    const modal = document.getElementById("modal-detalhes");
    if (modal) modal.style.display = "none";
    const container = document.getElementById("detalhes-container");
    if (container) container.innerHTML = "";
    
    // Reset do estado de submissão
    isSubmitting = false;
}

// Função para recarregar a lista após operações
function recarregarLista() {
    // Força o reload da página para atualizar os dados
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// auxiliar para obter dados do item com base na rota
async function obterDadosItem(idRota, id) {
    if (idRota === 'idCliente') return await listarClientePorId(id);
    if (idRota === 'idPedido') return await listarPedidoPorId(id);
    if (idRota === 'idServico') return await listarServicoPorId(id);

    console.warn(`idRota '${idRota}' não corresponde a cliente, pedido ou serviço. Verifique o valor passado.`);
    throw new Error(`Tipo de rota desconhecido: ${idRota}`);
}

function obterRotaLabel(idRota) {
    if (idRota === 'idCliente') return "Cliente";
    if (idRota === 'idPedido') return "Gasto";
    if (idRota === 'idServico') return "Serviço"; 
    return "Item"; 
}

async function verDetalhes(idRota, id) {
    const rotaLabel = obterRotaLabel(idRota);
    try {
        const response = await obterDadosItem(idRota, id);
        if (!response || !response.data) throw new Error("Resposta da API inválida ou sem dados.");

        const info = Array.isArray(response.data) ? response.data[0] : response.data;
        if (!info) {
            await showAlert({ 
                message: `Nenhuma informação encontrada para ${rotaLabel} com ID ${id}.`, 
                type: "error", 
                icon: "../public/assets/icons/error.svg" 
            });
            return;
        }

        const detalhesHtml = Object.entries(info)
            .filter(([chave]) => chave !== 'imagem_path') // Remove image field from details
            .map(([chave, valor]) => {
                const valorFormatado = valor === null || valor === undefined ? 
                    "<em>Não cadastrado(a)</em>" : 
                    (typeof valor === 'object' ? JSON.stringify(valor, null, 2) : valor);
                
                return `<li class="li-modal"><strong>${formatarTexto(chave)}:</strong> ${valorFormatado}</li>`;
            })
            .join("");

        const detalhesContainer = document.getElementById("detalhes-container");
        if (detalhesContainer) {
            detalhesContainer.innerHTML = `
                <h3>Detalhes do ${rotaLabel}</h3>
                <ul class="lista-detalhes">${detalhesHtml}</ul> 
                <div class="form-actions">
                    <button class="button-modal button-edit" onclick="editarItem('${idRota}', ${id})">Editar</button>
                    <button class="button-modal button-delete" onclick="excluirItem('${idRota}', ${id})">Excluir</button>
                    <button type="button" class="button-modal button-close" onclick="fecharModal()">Fechar</button>
                </div>`;
        }
        const modal = document.getElementById("modal-detalhes");
        if (modal) modal.style.display = "block";

    } catch (err) {
        console.error(`Erro ao listar detalhes para ${rotaLabel} ID ${id}:`, err);
        await showAlert({ 
            message: `Erro ao carregar detalhes do ${rotaLabel}. Tente novamente.`, 
            type: "error", 
            icon: "../public/assets/icons/error.svg" 
        });
    }
}

function criarCampoFormulario(chave, valor, idRota) {
    const nomeCampo = chave.toLowerCase();
    const labelFormatada = formatarTexto(chave);
    let tipoInput = "text";
    let extraAttrs = "";
    let valorInput = (valor === null || valor === undefined) ? "" : valor;
    let inputClass = "input-edicao"; 

    if (nomeCampo.startsWith("id") || nomeCampo.startsWith("status")) {
        inputClass = "not-editable-input";
        return `
            <div class="form-group">
                <label for="${chave}"><strong>${labelFormatada} (Não editável):</strong></label>
                <input type="text" id="${chave}" name="${chave}" value="${valorInput}" class="${inputClass}" readonly />
            </div>`;
    }

    // Skip image field completely
    if (nomeCampo === "imagem_path") {
        return '';
    }

    if (nomeCampo.includes("data")) {
        tipoInput = "date";
        valorInput = typeof valorInput === 'string' ? valorInput.split("T")[0] : "";
    } else if (nomeCampo.includes("quantidade")) {
        tipoInput = "number";
        extraAttrs = `step="1" min="1"`; 
    } else if (nomeCampo.includes("valor") || nomeCampo.includes("preco") || nomeCampo.includes("total")) {
        tipoInput = "number";
        extraAttrs = `step="0.01" min="0" required`; 
    } else if (nomeCampo.includes("observacao") || nomeCampo.includes("descricao") || nomeCampo.includes("mensagem")) {
        return `
            <div class="form-group">
                <label for="${chave}"><strong>${labelFormatada}:</strong></label>
                <textarea id="${chave}" name="${chave}" class="${inputClass}" rows="3">${valorInput}</textarea>
            </div>`;
    } else if (nomeCampo === "pagamento" && idRota === 'idServico') {
        // Special handling for payment field in services
        const paymentOptions = ['Boleto', 'Cartão', 'Dinheiro', 'Pix'];
        const optionsHtml = paymentOptions.map(option => 
            `<option value="${option}" ${valorInput === option ? 'selected' : ''}>${option}</option>`
        ).join('');
        
        return `
            <div class="form-group">
                <label for="${chave}"><strong>${labelFormatada}:</strong></label>
                <select id="${chave}" name="${chave}" class="${inputClass}">
                    ${optionsHtml}
                </select>
            </div>`;
    }

    return `
        <div class="form-group">
            <label for="${chave}"><strong>${labelFormatada}:</strong></label>
            <input type="${tipoInput}" id="${chave}" name="${chave}" value="${valorInput}" class="${inputClass}" ${extraAttrs}/>
        </div>`;
}

async function editarItem(idRota, id) {
    if (isSubmitting) {
        console.log('Operação já em andamento, ignorando...');
        return;
    }

    const rotaLabel = obterRotaLabel(idRota);
    try {
        const responseApi = await obterDadosItem(idRota, id);
        if (!responseApi || !responseApi.data) throw new Error("Resposta da API inválida para edição.");

        const informacao = Array.isArray(responseApi.data) ? responseApi.data[0] : responseApi.data;
        if (!informacao) {
            await showAlert({ 
                message: `Nenhuma informação para editar o ${rotaLabel} com ID ${id}.`, 
                type: "error",
                icon: "../public/assets/icons/error.svg"
            });
            return;
        }

        const formHtmlEdit = Object.entries(informacao)
            .map(([chave, valor]) => criarCampoFormulario(chave, valor, idRota))
            .filter(html => html !== '') // Remove empty fields
            .join("");
        
        const detalhesContainer = document.getElementById("detalhes-container");
        if (detalhesContainer) {
            detalhesContainer.innerHTML = `
                <h3>Editar ${rotaLabel}</h3>
                <form id="form-edicao" class="form-modal-edicao">
                    ${formHtmlEdit}
                    <div class="form-actions">
                        <button type="submit" class="button-send" ${isSubmitting ? 'disabled' : ''}>
                            ${isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                        <button type="button" class="button-modal button-delete" onclick="excluirItem('${idRota}', ${id})" ${isSubmitting ? 'disabled' : ''}>Excluir</button>
                        <button type="button" class="button-modal button-close" onclick="fecharModal()" ${isSubmitting ? 'disabled' : ''}>Cancelar</button>
                    </div>
                </form>`;
        }
        
        const modal = document.getElementById("modal-detalhes");
        if (modal) modal.style.display = "block";

        const formEdicao = document.getElementById("form-edicao");
        if (formEdicao) {
            formEdicao.onsubmit = async function (e) {
                e.preventDefault();
                
                if (isSubmitting) {
                    console.log('Formulário já está sendo enviado, ignorando...');
                    return;
                }

                isSubmitting = true;
                
                // Atualizar UI para mostrar estado de loading
                const submitBtn = formEdicao.querySelector('button[type="submit"]');
                const deleteBtn = formEdicao.querySelector('.button-delete');
                const cancelBtn = formEdicao.querySelector('.button-close');
                
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Salvando...';
                }
                if (deleteBtn) deleteBtn.disabled = true;
                if (cancelBtn) cancelBtn.disabled = true;

                try {
                    const dadosAtualizados = {};
                    formEdicao.querySelectorAll(".input-edicao:not([readonly]), textarea.input-edicao:not([readonly]), select.input-edicao").forEach(input => {
                        if (input.type === 'number') {
                            if (input.name === 'quantidade') {
                                dadosAtualizados[input.name] = input.value === '' ? 1 : Math.max(1, parseInt(input.value) || 1);
                            } else {
                                dadosAtualizados[input.name] = input.value === '' ? null : parseFloat(input.value);
                            }
                        } else if (input.type === 'date' && input.value === '') {
                            dadosAtualizados[input.name] = null; 
                        } else {
                            dadosAtualizados[input.name] = input.value.trim() === "" ? null : input.value.trim();
                        }
                    });

                    if (Object.keys(dadosAtualizados).length === 0) {
                        await showAlert({ 
                            message: `Nenhuma alteração detectada para ${rotaLabel}.`, 
                            type: "info" 
                        });
                        return;
                    }

                    let response;
                    if (rotaLabel === 'Cliente') response = await editarClientePorId(dadosAtualizados, id);
                    else if (rotaLabel === 'Gasto') response = await editarPedidoPorId(dadosAtualizados, id);
                    else if (rotaLabel === 'Serviço') response = await editarServicoPorId(dadosAtualizados, id);

                    fecharModal();
                    await showAlert({ 
                        message: `${rotaLabel} editado com sucesso!`, 
                        type: "success", 
                        icon: "../public/assets/icons/success.svg" 
                    });
                    
                    // Recarregar a lista após sucesso
                    recarregarLista();
                    
                } catch (err) {
                    console.error(`Erro ao salvar ${rotaLabel} ID ${id}:`, err);
                    await showAlert({ 
                        message: `Erro ao editar ${rotaLabel}!`, 
                        type: "error", 
                        icon: "../public/assets/icons/error.svg" 
                    });
                } finally {
                    isSubmitting = false;
                    
                    // Restaurar UI
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Salvar Alterações';
                    }
                    if (deleteBtn) deleteBtn.disabled = false;
                    if (cancelBtn) cancelBtn.disabled = false;
                }
            };
        }
    } catch (err) {
        console.error(`Erro ao preparar edição para ${rotaLabel} ID ${id}:`, err);
        await showAlert({ 
            message: `Erro ao carregar dados para edição do ${rotaLabel}.`, 
            type: "error", 
            icon: "../public/assets/icons/error.svg" 
        });
        isSubmitting = false;
    }
}

async function excluirItem(idRota, id) {
    if (isSubmitting) {
        console.log('Operação já em andamento, ignorando...');
        return;
    }

    const rotaLabel = obterRotaLabel(idRota);
    const confirmar = window.confirm(`Tem certeza que deseja excluir este ${rotaLabel.toLowerCase()}? Esta ação não pode ser desfeita.`);
    if (!confirmar) return;

    isSubmitting = true;

    try {
        if (idRota === 'idCliente') await excluirClientePorId(id);
        else if (idRota === 'idPedido') await excluirPedidoPorId(id);
        else if (idRota === 'idServico') await excluirServicoPorId(id); 
        else { 
            console.error(`Tentativa de exclusão com rota desconhecida: ${idRota}`);
            await showAlert({ 
                message: `Tipo de item desconhecido para exclusão.`, 
                type: "error", 
                icon: "../public/assets/icons/error.svg" 
            });
            return;
        }

        await showAlert({
            message: `${rotaLabel} excluído com sucesso!`, 
            type: "success", 
            icon: "../public/assets/icons/success.svg" 
        });
        
        fecharModal();
        recarregarLista();
        
    } catch (err) {
        console.error(`Erro ao excluir ${rotaLabel} ID ${id}:`, err);
        if (idRota === 'idCliente'){
            await showAlert({
                message: `Erro ao excluir ${rotaLabel}! Há serviços vinculados a esse cliente`, 
                type: "error",
                icon: "../public/assets/icons/error.svg"
            });
            return;
        }
        await showAlert({
            message: `Erro ao excluir ${rotaLabel}!`,
            type: "error",
            icon: "../public/assets/icons/error.svg" 
        });
    } finally {
        isSubmitting = false;
    }
}

// Expor funções globalmente
window.verDetalhes = verDetalhes;
window.editarItem = editarItem;
window.excluirItem = excluirItem;
window.fecharModal = fecharModal;

// Fechar modal ao clicar fora
window.addEventListener('click', function(event) {
    const modal = document.getElementById("modal-detalhes");
    if (modal && event.target == modal) {
        fecharModal();
    }
});