// Processar dados de faturamento por mês para um ano específico
function processarFaturamentoPorMes(servicos, anoSelecionado = null) {
    const faturamentoPorMes = new Array(12).fill(0);
    const anoFiltro = anoSelecionado || new Date().getFullYear();
    
    servicos.forEach(servico => {
        if (servico.data && servico.preco) {
            const data = new Date(servico.data + 'T00:00:00');
            const mes = data.getMonth();
            const ano = data.getFullYear();
            
            if (ano === anoFiltro) {
                faturamentoPorMes[mes] += parseFloat(servico.preco) || 0;
            }
        }
    });
    
    return faturamentoPorMes;
}

// Processar quantidade de serviços por mês para um ano específico
function processarServicosPorMes(servicos, anoSelecionado = null) {
    const servicosPorMes = new Array(12).fill(0);
    const anoFiltro = anoSelecionado || new Date().getFullYear();
    
    servicos.forEach(servico => {
        if (servico.data) {
            const data = new Date(servico.data + 'T00:00:00');
            const mes = data.getMonth();
            const ano = data.getFullYear();
            
            if (ano === anoFiltro) {
                servicosPorMes[mes]++;
            }
        }
    });
    
    return servicosPorMes;
}

// Processar gastos com materiais por mês para um ano específico
function processarGastosMateriais(pedidos, anoSelecionado = null) {
    const gastosPorMes = new Array(12).fill(0);
    const anoFiltro = anoSelecionado || new Date().getFullYear();
    
    pedidos.forEach(pedido => {
        if (pedido.data && pedido.valor) {
            const data = new Date(pedido.data + 'T00:00:00');
            const mes = data.getMonth();
            const ano = data.getFullYear();
            
            if (ano === anoFiltro) {
                gastosPorMes[mes] += parseFloat(pedido.valor) || 0;
            }
        }
    });
    
    return gastosPorMes;
}

// Calcular estatísticas gerais para um ano específico
function calcularEstatisticas(dados, anoSelecionado = null) {
    const { clientes, servicos, pedidos } = dados;
    const anoFiltro = anoSelecionado || new Date().getFullYear();
    
    // Filtrar dados por ano
    const servicosAno = servicos.filter(servico => {
        if (!servico.data) return false;
        const ano = new Date(servico.data + 'T00:00:00').getFullYear();
        return ano === anoFiltro;
    });
    
    const pedidosAno = pedidos.filter(pedido => {
        if (!pedido.data) return false;
        const ano = new Date(pedido.data + 'T00:00:00').getFullYear();
        return ano === anoFiltro;
    });
    
    const totalClientes = clientes.length;
    const totalServicos = servicosAno.length;
    const totalPedidos = pedidosAno.length;
    
    const faturamentoTotal = servicosAno.reduce((total, servico) => {
        return total + (parseFloat(servico.preco) || 0);
    }, 0);
    
    const gastosTotal = pedidosAno.reduce((total, pedido) => {
        return total + (parseFloat(pedido.valor) || 0);
    }, 0);
    
    const lucroEstimado = faturamentoTotal - gastosTotal;
    
    // Serviços por status
    const servicosPendentes = servicosAno.filter(s => s.statusServico === -1).length;
    const servicosAndamento = servicosAno.filter(s => s.statusServico === 0).length;
    const servicosConcluidos = servicosAno.filter(s => s.statusServico === 1).length;
    
    // Pagamentos por status
    const pagamentosPendentes = servicosAno.filter(s => s.statusPagamento === -1).length;
    const pagamentosParciais = servicosAno.filter(s => s.statusPagamento === 0).length;
    const pagamentosCompletos = servicosAno.filter(s => s.statusPagamento === 1).length;
    
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

// Filtrar serviços por período (últimos X dias)
function filtrarServicosPorPeriodo(servicos, dias) {
    if (dias === 'all') return servicos;
    
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() - dias);
    
    return servicos.filter(servico => {
        if (!servico.data) return false;
        const dataServico = new Date(servico.data + 'T00:00:00');
        return dataServico >= dataLimite;
    });
}

// Processar dados para gráfico de pizza (status dos serviços) com filtro de período
function processarStatusServicos(servicos, diasFiltro = 'all') {
    const servicosFiltrados = filtrarServicosPorPeriodo(servicos, diasFiltro);
    
    const statusCount = {
        pendente: 0,
        andamento: 0,
        concluido: 0
    };
    
    servicosFiltrados.forEach(servico => {
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

// Processar dados para gráfico de pizza (status dos pagamentos) com filtro de período
function processarStatusPagamentos(servicos, diasFiltro = 'all') {
    const servicosFiltrados = filtrarServicosPorPeriodo(servicos, diasFiltro);
    
    const statusCount = {
        pendente: 0,
        parcial: 0,
        pago: 0
    };
    
    servicosFiltrados.forEach(servico => {
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

// Obter top 5 clientes por faturamento para um ano específico
function obterTopClientes(servicos, clientes, anoSelecionado = null) {
    const anoFiltro = anoSelecionado || new Date().getFullYear();
    
    // Filtrar serviços por ano
    const servicosAno = servicos.filter(servico => {
        if (!servico.data) return false;
        const ano = new Date(servico.data + 'T00:00:00').getFullYear();
        return ano === anoFiltro;
    });
    
    const faturamentoPorCliente = {};
    
    servicosAno.forEach(servico => {
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

// Obter lista de serviços com pagamentos pendentes/parciais
function obterServicosPagamentosPendentes(servicos, clientes) {
    return servicos
        .filter(servico => servico.statusPagamento === -1 || servico.statusPagamento === 0)
        .map(servico => {
            const cliente = clientes.find(c => c.idCliente === servico.idCliente);
            return {
                ...servico,
                nomeCliente: cliente ? cliente.nomeCliente : 'Desconhecido'
            };
        })
        .sort((a, b) => new Date(b.data) - new Date(a.data));
}

// Obter lista de serviços pendentes/em andamento
function obterServicosPendentesAndamento(servicos, clientes) {
    return servicos
        .filter(servico => servico.statusServico === -1 || servico.statusServico === 0)
        .map(servico => {
            const cliente = clientes.find(c => c.idCliente === servico.idCliente);
            return {
                ...servico,
                nomeCliente: cliente ? cliente.nomeCliente : 'Desconhecido'
            };
        })
        .sort((a, b) => new Date(b.data) - new Date(a.data));
}

// Gerar anos disponíveis baseado nos dados
function obterAnosDisponiveis(servicos, pedidos) {
    const anos = new Set();
    const anoAtual = new Date().getFullYear();
    
    // Adicionar ano atual sempre
    anos.add(anoAtual);
    
    // Adicionar anos dos serviços
    servicos.forEach(servico => {
        if (servico.data) {
            const ano = new Date(servico.data + 'T00:00:00').getFullYear();
            anos.add(ano);
        }
    });
    
    // Adicionar anos dos pedidos
    pedidos.forEach(pedido => {
        if (pedido.data) {
            const ano = new Date(pedido.data + 'T00:00:00').getFullYear();
            anos.add(ano);
        }
    });
    
    // Converter para array e ordenar (mais recente primeiro)
    return Array.from(anos).sort((a, b) => b - a);
}

export {
    processarFaturamentoPorMes,
    processarServicosPorMes,
    processarGastosMateriais,
    calcularEstatisticas,
    processarStatusServicos,
    processarStatusPagamentos,
    obterTopClientes,
    obterServicosPagamentosPendentes,
    obterServicosPendentesAndamento,
    obterAnosDisponiveis,
    filtrarServicosPorPeriodo
};