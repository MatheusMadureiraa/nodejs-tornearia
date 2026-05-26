import { buscarDadosCompletos } from './api/dashboardApi.js';
import {
    calcularEstatisticas,
    obterAnosDisponiveis,
    obterServicosPagamentosPendentes,
    obterServicosPendentesAndamento,
    obterTopClientes,
    processarFaturamentoPorMes,
    processarGastosMateriais,
    processarServicosPorMes,
    processarStatusPagamentos,
    processarStatusServicos
} from './utils/dashboardUtils.js';

// Variáveis globais
let dadosCompletos = {};
let chartPrincipal = null;
let chartStatus = null;
let chartPagamentos = null;
let chartTopClientes = null;
let anoSelecionado = new Date().getFullYear();
let periodoStatusSelecionado = 30;

// Labels dos meses
const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(valor);
};

// Configurações dos datasets
const datasetsConfig = {
    faturamento: {
        label: 'Faturamento (R$)',
        backgroundColor: '#018c18',
        borderColor: '#018c18',
        borderWidth: 2,
        fill: false
    },
    servicos: {
        label: 'Número de Serviços',
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
        borderWidth: 2,
        fill: false
    },
    materiais: {
        label: 'Gastos (R$)',
        backgroundColor: '#FF9800',
        borderColor: '#FF9800',
        borderWidth: 2,
        fill: false
    }
};

// Inicializar filtros
function inicializarFiltros() {
    // Configurar filtro de ano
    const anosDisponiveis = obterAnosDisponiveis(dadosCompletos.servicos, dadosCompletos.pedidos);
    const yearFilter = document.getElementById('yearFilter');
    
    yearFilter.innerHTML = '';
    anosDisponiveis.forEach(ano => {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        if (ano === anoSelecionado) {
            option.selected = true;
        }
        yearFilter.appendChild(option);
    });
    
    // Event listener para filtro de ano
    yearFilter.addEventListener('change', (e) => {
        anoSelecionado = parseInt(e.target.value);
        atualizarDashboard();
    });
    
    // Event listener para filtro de período de status
    document.getElementById('statusTimeFilter').addEventListener('change', (e) => {
        periodoStatusSelecionado = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
        atualizarGraficosStatus();
        atualizarListasStatus();
    });
}

// Inicializar dashboard
async function inicializarDashboard() {
    try {
        // Mostrar loading
        mostrarLoading(true);
        
        // Buscar dados
        dadosCompletos = await buscarDadosCompletos();
        console.log('Dados carregados:', dadosCompletos);
        
        // Inicializar filtros
        inicializarFiltros();
        
        // Processar e exibir dados
        atualizarDashboard();
        
        // Ocultar loading
        mostrarLoading(false);
        
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        mostrarErro('Erro ao carregar dados do dashboard');
        mostrarLoading(false);
    }
}

// Atualizar todo o dashboard
function atualizarDashboard() {
    exibirEstatisticas();
    criarGraficoPrincipal();
    atualizarGraficosStatus();
    criarGraficoTopClientes();
    atualizarListasStatus();
}

// Exibir estatísticas gerais
function exibirEstatisticas() {
    document.getElementById('ano-status-servico').textContent = `Todos os Serviços do ano ${anoSelecionado}:`;
    document.getElementById('ano-status-pagamento').textContent = `Todos os Pagamentos do ano ${anoSelecionado}:`;


    const stats = calcularEstatisticas(dadosCompletos, anoSelecionado);
    
    // Atualizar cards de estatísticas
    document.getElementById('total-clientes').textContent = stats.totalClientes;
    document.getElementById('total-servicos').textContent = stats.totalServicos;
    document.getElementById('total-pedidos').textContent = stats.totalPedidos;
    document.getElementById('faturamento-total').textContent = formatarValor(stats.faturamentoTotal);
    document.getElementById('gastos-total').textContent = formatarValor(stats.gastosTotal);
    document.getElementById('lucro-estimado').textContent = formatarValor(stats.lucroEstimado);
    
    // Atualizar indicadores de status
    document.getElementById('servicos-pendentes').textContent = stats.servicosPendentes;
    document.getElementById('servicos-andamento').textContent = stats.servicosAndamento;
    document.getElementById('servicos-concluidos').textContent = stats.servicosConcluidos;
    
    document.getElementById('pagamentos-pendentes').textContent = stats.pagamentosPendentes;
    document.getElementById('pagamentos-parciais').textContent = stats.pagamentosParciais;
    document.getElementById('pagamentos-completos').textContent = stats.pagamentosCompletos;
}

// Criar gráfico principal
function criarGraficoPrincipal() {
    const ctx = document.getElementById('dashboardChart').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (chartPrincipal) {
        chartPrincipal.destroy();
    }
    
    // Processar dados iniciais (faturamento)
    const faturamentoData = processarFaturamentoPorMes(dadosCompletos.servicos, anoSelecionado);
    
    chartPrincipal = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                ...datasetsConfig.faturamento,
                data: faturamentoData
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Análise Mensal - ${anoSelecionado}`,
                    font: {
                        size: 15,
                        weight: 'bold'
                    },
                    color: '#666'
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            
                            if (label.includes('R$')) {
                                return `${label}: R$ ${value.toFixed(2)}`;
                            }
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Meses'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Valores'
                    },
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Atualizar gráficos de status
function atualizarGraficosStatus() {
    criarGraficoStatusServicos();
    criarGraficoStatusPagamentos();
}

// Criar gráfico de status dos serviços
function criarGraficoStatusServicos() {
    const ctx = document.getElementById('statusServicosChart').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (chartStatus) {
        chartStatus.destroy();
    }
    
    const statusData = processarStatusServicos(dadosCompletos.servicos, periodoStatusSelecionado);
    
    chartStatus = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pendentes', 'Em Andamento', 'Concluídos'],
            datasets: [{
                data: [statusData.pendente, statusData.andamento, statusData.concluido],
                backgroundColor: ['#f44336', '#ff9800', '#4caf50'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Status dos Serviços ${getPeriodoTexto()}`,
                    font: {
                        size: 15,
                        weight: 'bold'
                    },
                    color: '#666'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Criar gráfico de status dos pagamentos
function criarGraficoStatusPagamentos() {
    const ctx = document.getElementById('statusPagamentosChart').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (chartPagamentos) {
        chartPagamentos.destroy();
    }
    
    const statusData = processarStatusPagamentos(dadosCompletos.servicos, periodoStatusSelecionado);
    
    chartPagamentos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pendentes', 'Parciais', 'Pagos'],
            datasets: [{
                data: [statusData.pendente, statusData.parcial, statusData.pago],
                backgroundColor: ['#f44336', '#ff9800', '#4caf50'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Status dos Pagamentos ${getPeriodoTexto()}`,
                    font: {
                        size: 15,
                        weight: 'bold'
                    },
                    color: '#666'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Criar gráfico de top clientes
function criarGraficoTopClientes() {
    const ctx = document.getElementById('topClientesChart').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (chartTopClientes) {
        chartTopClientes.destroy();
    }
    
    const topClientes = obterTopClientes(dadosCompletos.servicos, dadosCompletos.clientes, anoSelecionado);
    
    chartTopClientes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topClientes.map(c => c.nome),
            datasets: [{
                label: 'Faturamento (R$)',
                data: topClientes.map(c => c.faturamento),
                backgroundColor: '#018c18',
                borderColor: '#018c18',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Top 5 Clientes por Faturamento - ${anoSelecionado}`,
                    font: {
                        size: 15,
                        weight: 'bold'
                    },
                    color: '#666'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Atualizar listas de status
function atualizarListasStatus() {
    atualizarListaPagamentosPendentes();
    atualizarListaServicosPendentes();
}

// Atualizar lista de pagamentos pendentes/parciais
function atualizarListaPagamentosPendentes() {
    const container = document.getElementById('pagamentos-pendentes-lista');
    let servicos = obterServicosPagamentosPendentes(dadosCompletos.servicos, dadosCompletos.clientes);
    servicos = servicos.filter(servico => estaNosUltimos90Dias(servico.data));


    if (servicos.length === 0) {
        container.innerHTML = '<div class="empty-list">Nenhum pagamento pendente encontrado</div>';
        return;
    }
    
    container.innerHTML = servicos.map(servico => `
        <div class="status-item">
            <div class="status-item-header">
                <span class="status-item-title">${servico.nomeServico}</span>
                <span class="status-item-value">${formatarValor(servico.preco)}</span>
            </div>
            <div class="status-item-details">
                <span>Cliente: ${servico.nomeCliente}</span>
                <span>Data: ${new Date(servico.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                <span class="status-badge ${servico.statusPagamento === -1 ? 'pendente' : 'parcial'}">
                    ${servico.statusPagamento === -1 ? 'Pendente' : 'Parcial'}
                </span>
            </div>
        </div>
    `).join('');
}

// Atualizar lista de serviços pendentes/em andamento
function atualizarListaServicosPendentes() {
    const container = document.getElementById('servicos-pendentes-lista');
    let servicos = obterServicosPendentesAndamento(dadosCompletos.servicos, dadosCompletos.clientes);
    servicos = servicos.filter(servico => estaNosUltimos90Dias(servico.data));


    if (servicos.length === 0) {
        container.innerHTML = '<div class="empty-list">Nenhum serviço pendente encontrado</div>';
        return;
    }
    
    container.innerHTML = servicos.map(servico => `
        <div class="status-item">
            <div class="status-item-header">
                <span class="status-item-title">${servico.nomeServico}</span>
                <span class="status-item-value">${formatarValor(servico.preco)}</span>
            </div>
            <div class="status-item-details">
                <span>Cliente: ${servico.nomeCliente}</span>
                <span>Data: ${new Date(servico.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                <span class="status-badge ${servico.statusServico === -1 ? 'pendente' : 'andamento'}">
                    ${servico.statusServico === -1 ? 'Pendente' : 'Em Andamento'}
                </span>
            </div>
        </div>
    `).join('');
}

// verifica se o servico ou pagamento esta nos ultimos 90 dias
function estaNosUltimos90Dias(dataString) {
    const hoje = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(hoje.getDate() - 90);

    const dataServico = new Date(dataString + 'T00:00:00'); // forçando formato ISO
    return dataServico >= dataLimite;
}

// Obter texto do período selecionado
function getPeriodoTexto() {
    if (periodoStatusSelecionado === 'all') return '';
    return `(Últimos ${periodoStatusSelecionado} dias)`;
}

// Atualizar gráfico principal baseado na seleção
function atualizarGraficoPrincipal() {
    const tipo = document.getElementById('chartType').value;
    let novosDados, novaConfig;
    
    switch (tipo) {
        case 'faturamento':
            novosDados = processarFaturamentoPorMes(dadosCompletos.servicos, anoSelecionado);
            novaConfig = datasetsConfig.faturamento;
            break;
        case 'servicos':
            novosDados = processarServicosPorMes(dadosCompletos.servicos, anoSelecionado);
            novaConfig = datasetsConfig.servicos;
            break;
        case 'materiais':
            novosDados = processarGastosMateriais(dadosCompletos.pedidos, anoSelecionado);
            novaConfig = datasetsConfig.materiais;
            break;
        default:
            return;
    }
    
    // Atualizar dados do gráfico
    chartPrincipal.data.datasets[0] = {
        ...novaConfig,
        data: novosDados
    };
    
    // Atualizar título
    chartPrincipal.options.plugins.title.text = `Análise Mensal - ${anoSelecionado}`;
    
    chartPrincipal.update();
}

// Exportar relatório completo para PDF
async function exportarPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('portrait', 'mm', 'a4');
        
        // Configurações
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        let currentY = margin;
        
        // Função para adicionar nova página se necessário
        const checkPageBreak = (neededHeight) => {
            if (currentY + neededHeight > pageHeight - margin) {
                pdf.addPage();
                currentY = margin;
                return true;
            }
            return false;
        };
        
        // Cabeçalho
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('RELATÓRIO GERENCIAL', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Vallim Tornearia', pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;
        
        pdf.setFontSize(14);
        pdf.text(`Ano: ${anoSelecionado}`, pageWidth / 2, currentY, { align: 'center' });
        currentY += 15;
        
        // Data e hora
        pdf.setFontSize(10);
        const agora = new Date();
        const dataHora = `Gerado em: ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR')}`;
        pdf.text(dataHora, pageWidth / 2, currentY, { align: 'center' });
        currentY += 20;
        
        // Estatísticas Gerais
        checkPageBreak(60);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ESTATÍSTICAS GERAIS', margin, currentY);
        currentY += 10;
        
        const stats = calcularEstatisticas(dadosCompletos, anoSelecionado);
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const estatisticas = [
            ['Número Total de Clientes:', stats.totalClientes.toString()],
            ['Número Total de Serviços:', stats.totalServicos.toString()],
            ['Número Total de Gastos:', stats.totalPedidos.toString()],
            ['Faturamento Total:', formatarValor(stats.faturamentoTotal)],
            ['Gastos:', formatarValor(stats.gastosTotal)],
            ['Lucro Estimado:', formatarValor(stats.lucroEstimado)]
        ];
        
        estatisticas.forEach(([label, value]) => {
            pdf.text(label, margin, currentY);
            pdf.text(value, margin + 80, currentY);
            currentY += 7;
        });
        
        currentY += 10;
        
        // Status dos Serviços
        checkPageBreak(40);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('STATUS DOS SERVIÇOS', margin, currentY);
        currentY += 10;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const statusServicos = [
            ['Pendentes:', stats.servicosPendentes.toString()],
            ['Em Andamento:', stats.servicosAndamento.toString()],
            ['Concluídos:', stats.servicosConcluidos.toString()]
        ];
        
        statusServicos.forEach(([label, value]) => {
            pdf.text(label, margin, currentY);
            pdf.text(value, margin + 50, currentY);
            currentY += 7;
        });
        
        currentY += 10;
        
        // Status dos Pagamentos
        checkPageBreak(40);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('STATUS DOS PAGAMENTOS', margin, currentY);
        currentY += 10;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const statusPagamentos = [
            ['Pendentes:', stats.pagamentosPendentes.toString()],
            ['Parciais:', stats.pagamentosParciais.toString()],
            ['Pagos:', stats.pagamentosCompletos.toString()]
        ];
        
        statusPagamentos.forEach(([label, value]) => {
            pdf.text(label, margin, currentY);
            pdf.text(value, margin + 50, currentY);
            currentY += 7;
        });
        
        currentY += 15;
        
        // Gráfico Principal
        checkPageBreak(120);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`ANÁLISE MENSAL - FATURAMENTO ${anoSelecionado}`, margin, currentY);
        currentY += 10;
        
        try {
            const canvas = document.getElementById('dashboardChart');
            const imgData = canvas.toDataURL('image/png', 1.0);
            pdf.addImage(imgData, 'PNG', margin, currentY, pageWidth - 2 * margin, 100);
            currentY += 110;
        } catch (error) {
            console.warn('Erro ao capturar gráfico principal:', error);
            pdf.text('Gráfico não disponível', margin, currentY);
            currentY += 20;
        }
        
        // Top Clientes
        checkPageBreak(60);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`TOP 5 CLIENTES POR FATURAMENTO - ${anoSelecionado}`, margin, currentY);
        currentY += 10;
        
        const topClientes = obterTopClientes(dadosCompletos.servicos, dadosCompletos.clientes, anoSelecionado);
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        topClientes.forEach((cliente, index) => {
            checkPageBreak(7);
            pdf.text(`${index + 1}. ${cliente.nome}`, margin, currentY);
            pdf.text(formatarValor(cliente.faturamento), margin + 100, currentY);
            currentY += 7;
        });
        
        currentY += 15;
        
        // Análise Mensal Detalhada
        checkPageBreak(80);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`ANÁLISE MENSAL DETALHADA - ${anoSelecionado}`, margin, currentY);
        currentY += 10;
        
        const faturamentoMensal = processarFaturamentoPorMes(dadosCompletos.servicos, anoSelecionado);
        const servicosMensal = processarServicosPorMes(dadosCompletos.servicos, anoSelecionado);
        const gastosMensal = processarGastosMateriais(dadosCompletos.pedidos, anoSelecionado);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        
        // Cabeçalho da tabela
        pdf.text('Mês', margin, currentY);
        pdf.text('Faturamento', margin + 30, currentY);
        pdf.text('Serviços', margin + 70, currentY);
        pdf.text('Gastos', margin + 100, currentY);
        pdf.text('Lucro', margin + 130, currentY);
        currentY += 7;
        
        pdf.setFont('helvetica', 'normal');
        
        labels.forEach((mes, index) => {
            checkPageBreak(7);
            const faturamento = faturamentoMensal[index] || 0;
            const servicos = servicosMensal[index] || 0;
            const gastos = gastosMensal[index] || 0;
            const lucro = faturamento - gastos;
            
            pdf.text(mes, margin, currentY);
            pdf.text(`R$ ${faturamento.toFixed(2)}`, margin + 30, currentY);
            pdf.text(servicos.toString(), margin + 70, currentY);
            pdf.text(`R$ ${gastos.toFixed(2)}`, margin + 100, currentY);
            pdf.text(`R$ ${lucro.toFixed(2)}`, margin + 130, currentY);
            currentY += 6;
        });
        
        // Rodapé
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            pdf.text('Vallim Tornearia - Sistema de Gestão', margin, pageHeight - 10);
        }
        
        // Salvar PDF
        const timestamp = new Date().toISOString().split('T')[0];
        pdf.save(`relatorio-completo-${anoSelecionado}-${timestamp}.pdf`);
        
        // Mostrar alerta de sucesso
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            const alert = document.createElement('div');
            alert.className = 'alert success';
            alert.innerHTML = `
                <img src="../public/assets/icons/success.svg" alt="Sucesso">
                <span>Relatório PDF exportado com sucesso!</span>
                <button class="close-btn">×</button>
            `;
            alertContainer.appendChild(alert);
            
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
            
            alert.querySelector('.close-btn').addEventListener('click', () => {
                if (alert.parentNode) {
                    alert.remove();
                }
            });
        }
        
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        alert('Erro ao exportar PDF. Tente novamente.');
    }
}

// Mostrar/ocultar loading
function mostrarLoading(mostrar) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = mostrar ? 'block' : 'none';
    }
}

// Mostrar erro
function mostrarErro(mensagem) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = mensagem;
        errorElement.style.display = 'block';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    inicializarDashboard();
    
    // Listener para mudança de tipo de gráfico
    document.getElementById('chartType').addEventListener('change', atualizarGraficoPrincipal);
    
    // Listener para exportar PDF
    document.getElementById('exportPDF').addEventListener('click', exportarPDF);
    
    // Listener para atualizar dados
    const btnAtualizar = document.getElementById('btnAtualizar');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', inicializarDashboard);
    }
});

// Atualizar dashboard a cada 5 minutos
setInterval(inicializarDashboard, 5 * 60 * 1000);