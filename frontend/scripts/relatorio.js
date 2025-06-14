import { buscarDadosCompletos } from './api/dashboardApi.js';
import {
    processarFaturamentoPorMes,
    processarServicosPorMes,
    processarGastosMateriais,
    calcularEstatisticas,
    processarStatusServicos,
    processarStatusPagamentos,
    obterTopClientes
} from './utils/dashboardUtils.js';

// Variáveis globais
let dadosCompletos = {};
let chartPrincipal = null;
let chartStatus = null;
let chartPagamentos = null;
let chartTopClientes = null;

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
        label: 'Gastos com Materiais (R$)',
        backgroundColor: '#FF9800',
        borderColor: '#FF9800',
        borderWidth: 2,
        fill: false
    }
};

// Inicializar dashboard
async function inicializarDashboard() {
    try {
        // Mostrar loading
        mostrarLoading(true);
        
        // Buscar dados
        dadosCompletos = await buscarDadosCompletos();
        console.log('Dados carregados:', dadosCompletos);
        
        // Processar e exibir estatísticas
        exibirEstatisticas();
        
        // Criar gráficos
        criarGraficoPrincipal();
        criarGraficoStatusServicos();
        criarGraficoStatusPagamentos();
        criarGraficoTopClientes();
        
        // Ocultar loading
        mostrarLoading(false);
        
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        mostrarErro('Erro ao carregar dados do dashboard');
        mostrarLoading(false);
    }
}

// Exibir estatísticas gerais
function exibirEstatisticas() {
    const stats = calcularEstatisticas(dadosCompletos);
    
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
    
    // Processar dados iniciais (faturamento)
    const faturamentoData = processarFaturamentoPorMes(dadosCompletos.servicos);
    
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
                    text: 'Análise Mensal - Ano Atual'
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

// Criar gráfico de status dos serviços
function criarGraficoStatusServicos() {
    const ctx = document.getElementById('statusServicosChart').getContext('2d');
    const statusData = processarStatusServicos(dadosCompletos.servicos);
    
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
                    text: 'Status dos Serviços'
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
    const statusData = processarStatusPagamentos(dadosCompletos.servicos);
    
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
                    text: 'Status dos Pagamentos'
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
    const topClientes = obterTopClientes(dadosCompletos.servicos, dadosCompletos.clientes);
    
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
                    text: 'Top 5 Clientes por Faturamento'
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

// Atualizar gráfico principal baseado na seleção
function atualizarGraficoPrincipal() {
    const tipo = document.getElementById('chartType').value;
    let novosDados, novaConfig;
    
    switch (tipo) {
        case 'faturamento':
            novosDados = processarFaturamentoPorMes(dadosCompletos.servicos);
            novaConfig = datasetsConfig.faturamento;
            break;
        case 'servicos':
            novosDados = processarServicosPorMes(dadosCompletos.servicos);
            novaConfig = datasetsConfig.servicos;
            break;
        case 'materiais':
            novosDados = processarGastosMateriais(dadosCompletos.pedidos);
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
    
    chartPrincipal.update();
}

// Exportar gráfico para PDF
async function exportarPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('landscape');
        
        // Título
        pdf.setFontSize(16);
        pdf.text('Relatório Dashboard - Vallim Tornearia', 20, 20);
        
        // Data atual
        pdf.setFontSize(10);
        pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
        
        // Gráfico principal
        const canvas = document.getElementById('dashboardChart');
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 20, 40, 250, 125);
        
        // Estatísticas
        const stats = calcularEstatisticas(dadosCompletos);
        pdf.setFontSize(12);
        pdf.text('Estatísticas Gerais:', 20, 180);
        pdf.setFontSize(10);
        pdf.text(`Total de Clientes: ${stats.totalClientes}`, 20, 190);
        pdf.text(`Total de Serviços: ${stats.totalServicos}`, 20, 200);
        pdf.text(`Faturamento Total: R$ ${stats.faturamentoTotal.toFixed(2)}`, 20, 210);
        pdf.text(`Gastos com Materiais: R$ ${stats.gastosTotal.toFixed(2)}`, 150, 190);
        pdf.text(`Lucro Estimado: R$ ${stats.lucroEstimado.toFixed(2)}`, 150, 200);
        
        pdf.save('relatorio-dashboard.pdf');
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