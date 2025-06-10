const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const datasets = {
  faturamento: [1200, 2100, 1850, 2300, 2000, 2600, 3000, 2800, 2750, 3200, 3100, 3300],
  servicos: [12, 15, 14, 18, 16, 19, 22, 20, 21, 24, 23, 25],
  materiais: [400, 500, 300, 450, 380, 420, 470, 410, 390, 520, 480, 530]
};

const chartLabelMap = {
  faturamento: 'Faturamento (R$)',
  servicos: 'Serviços',
  materiais: 'Gastos com Materiais (R$)'
};

const ctx = document.getElementById('dashboardChart').getContext('2d');

let chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [{
      label: chartLabelMap['faturamento'],
      data: datasets['faturamento'],
      backgroundColor: '#018c18'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          afterBody: function() {
            const detalhes = ['Troca de óleo', 'Freio', 'Alinhamento', 'Solda', 'Furação', 'Montagem', 'Balanceamento'];
            return 'Serviços: ' + detalhes.join(', ');
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

document.getElementById('chartType').addEventListener('change', function () {
  const tipo = this.value;
  chart.data.datasets[0].label = chartLabelMap[tipo];
  chart.data.datasets[0].data = datasets[tipo];
  chart.update();
});

document.getElementById('exportPDF').addEventListener('click', async () => {
  const { jsPDF } = window.jspdf;
  const canvas = document.getElementById('dashboardChart');
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF();
  pdf.addImage(imgData, 'PNG', 10, 10, 180, 90);
  pdf.save('grafico.pdf');
});
