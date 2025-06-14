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
        
        const stats = calcularEstatisticas(dadosCompletos);
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        
        const estatisticas = [
            ['Total de Clientes:', stats.totalClientes.toString()],
            ['Total de Serviços:', stats.totalServicos.toString()],
            ['Total de Pedidos:', stats.totalPedidos.toString()],
            ['Faturamento Total:', formatarValor(stats.faturamentoTotal)],
            ['Gastos com Materiais:', formatarValor(stats.gastosTotal)],
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
        pdf.text('ANÁLISE MENSAL - FATURAMENTO', margin, currentY);
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
        pdf.text('TOP 5 CLIENTES POR FATURAMENTO', margin, currentY);
        currentY += 10;
        
        const topClientes = obterTopClientes(dadosCompletos.servicos, dadosCompletos.clientes);
        
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
        pdf.text('ANÁLISE MENSAL DETALHADA', margin, currentY);
        currentY += 10;
        
        const faturamentoMensal = processarFaturamentoPorMes(dadosCompletos.servicos);
        const servicosMensal = processarServicosPorMes(dadosCompletos.servicos);
        const gastosMensal = processarGastosMateriais(dadosCompletos.pedidos);
        
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
        pdf.save(`relatorio-completo-${timestamp}.pdf`);
        
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