// Processar dados de faturamento por mês
function processarFaturamentoPorMes(servicos) {
    const faturamentoPorMes = new Array(12).fill(0);
    const meses = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    
    servicos.forEach(servico => {
        if (servico.data && servico.preco) {
            const data = new Date(servico.data + 'T00:00:00');
            const mes = data.getMonth();
            const ano = data.getFullYear();
            const anoAtual = new Date().getFullYear();
            
            // Só considera serviços do ano atual
            if (ano === anoAtual) {
                faturamentoPorMes[mes] += parseFloat(servico.preco) || 0;
            }
        }
    });
    
    return faturamentoPorMes;
}

// Processar quantidade de serviços por mês
function processarServicosPorMes(servicos) {
    const servicosPorMes = new Array(12).fill(0);
    
    servicos.forEach(servico => {
        if (servico.data) {
            const data = new Date(servico.data + 'T00:00:00');
            const mes = data.getMonth();
            const ano = data.getFullYear();
            const anoAtual = new Date().getFullYear();
            
            if (ano === anoAtual) {
                servicosPorMes[mes]++;
            }
        }
    });
    
    return servicosPorMes;
}

// Processar gastos com materiais por mês
function processarGastosMateriais(pedidos) {
    const gastosPorMes = new Array(12).fill(0);
    
    pedidos.forEach(pedido => {
        if (pedido.data && pedido.valor) {
            const data = new Date(pedido.data + 'T00:00:00');
            const mes = data.getMonth();
            const ano = data.getFullYear();
            const anoAtual = new Date().getFullYear();
            
            if (ano === anoAtual) {
                gastosPorMes[mes] += parseFloat(pedido.valor) || 0;
            }
        }
    });
    
    return gastosPorMes;
}

// Calcular estatísticas gerais
function calcularEstatisticas(dados) {
    const { clientes, servicos, pedidos } = dados;
    
    const totalClientes = clientes.length;
    const totalServicos = servicos.length;
    const totalPedidos = pedidos.length;
    
    const faturamentoTotal = servicos.reduce((total, servico) => {
        return total + (parseFloat(servico.preco) || 0);
    }, 0);
    
    const gastosTotal = pedidos.reduce((total, pedido) => {
        return total + (parseFloat(pedido.valor) || 0);
    }, 0);
    
    const lucroEstimado = faturamentoTotal - gastosTotal;
    
    // Serviços por status
    const servicosPendentes = servicos.filter(s => s.statusServico === -1).length;
    const servicosAndamento = servicos.filter(s => s.statusServico === 0).length;
    const servicosConcluidos = servicos.filter(s => s.statusServico === 1).length;
    
    // Pagamentos por status
    const pagamentosPendentes = servicos.filter(s => s.statusPagamento === -1).length;
    const pagamentosParciais = servicos.filter(s => s.statusPagamento === 0).length;
    const pagamentosCompletos = servicos.filter(s => s.statusPagamento === 1).length;
    
    return {
        totalClientes,
        totalServicos,
        totalPedidos,
        faturamentoTotal,
        gastosTotal,
        lucroEstimado,
        servicosPendentes,
        servicosAndamento,
        servicosConcluidos,
        pagamentosPendentes,
        pagamentosParciais,
        pagamentosCompletos
    };
}

// Processar dados para gráfico de pizza (status dos serviços)
function processarStatusServicos(servicos) {
    const statusCount = {
        pendente: 0,
        andamento: 0,
        concluido: 0
    };
    
    servicos.forEach(servico => {
        switch (servico.statusServico) {
            case -1:
                statusCount.pendente++;
                break;
            case 0:
                statusCount.andamento++;
                break;
            case 1:
                statusCount.concluido++;
                break;
        }
    });
    
    return statusCount;
}

// Processar dados para gráfico de pizza (status dos pagamentos)
function processarStatusPagamentos(servicos) {
    const statusCount = {
        pendente: 0,
        parcial: 0,
        pago: 0
    };
    
    servicos.forEach(servico => {
        switch (servico.statusPagamento) {
            case -1:
                statusCount.pendente++;
                break;
            case 0:
                statusCount.parcial++;
                break;
            case 1:
                statusCount.pago++;
                break;
        }
    });
    
    return statusCount;
}

// Obter top 5 clientes por faturamento
function obterTopClientes(servicos, clientes) {
    const faturamentoPorCliente = {};
    
    servicos.forEach(servico => {
        const clienteId = servico.idCliente;
        const valor = parseFloat(servico.preco) || 0;
        
        if (!faturamentoPorCliente[clienteId]) {
            faturamentoPorCliente[clienteId] = 0;
        }
        faturamentoPorCliente[clienteId] += valor;
    });
    
    // Converter para array e ordenar
    const clientesComFaturamento = Object.entries(faturamentoPorCliente)
        .map(([id, faturamento]) => {
            const cliente = clientes.find(c => c.idCliente == id);
            return {
                nome: cliente ? cliente.nomeCliente : `Desconhecido`,
                faturamento: faturamento
            };
        })
        .sort((a, b) => b.faturamento - a.faturamento)
        .slice(0, 5);
    
    return clientesComFaturamento;
}

export {
    processarFaturamentoPorMes,
    processarServicosPorMes,
    processarGastosMateriais,
    calcularEstatisticas,
    processarStatusServicos,
    processarStatusPagamentos,
    obterTopClientes
};