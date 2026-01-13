const styles = getComputedStyle(document.body);
//<canvas id="meuDonut"></canvas>
const corExecutado = styles.getPropertyValue('--cor-final').trim();
const corExecutando = styles.getPropertyValue('--cor-executando').trim();
const corErro = styles.getPropertyValue('--cor-erro').trim();
const corOcioso = styles.getPropertyValue('--cor-ocioso').trim();
const corFundo = styles.getPropertyValue('--cor-fundo').trim();

const corExecutadoSombra = styles.getPropertyValue('--animacao-opaca-bota-1').trim();
const corExecutandoSombra = styles.getPropertyValue('--animacao-opaca-bota-2').trim();
const corErroSombra = styles.getPropertyValue('--animacao-opaca-bota-4').trim();
const corOciosoSombra = styles.getPropertyValue('--animacao-opaca-bota-3').trim();

const glowPlugin = {
    id: 'doughnutGlow',
    
    afterDatasetsDraw(chart, args, options) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        const dataset = chart.data.datasets[0];
        
        if (!meta.data || meta.data.length === 0) return;
        
        const blur = options.blur ?? 20;
        const opacity = options.opacity ?? 0.8;
        
        meta.data.forEach((arc, i) => {
            const bgColor = dataset.backgroundColor[i];
            if (!bgColor) return;
            
            ctx.save();
            ctx.shadowColor = bgColor;
            ctx.shadowBlur = blur;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.globalAlpha = opacity;
            
            // Usa o próprio elemento do Chart.js para desenhar
            // Isso mantém o borderRadius original
            arc.draw(ctx);
            
            ctx.restore();
        });
    }
};

function verificaListasAbertas() {
    const elements = Array.from(document.querySelector('#targetPainel').children);
  
    elements.forEach((element, index) => {
        if (!element.classList.contains('chartBox')) {
            // Remove classes anteriores
            
            
            // Verifica se algum elemento depois não tem 'invisible5'
            const hasVisibleAfter = elements.slice(index + 1).some(el => !el.classList.contains('invisible5'));
            
            // Verifica se algum elemento antes não tem 'invisible5'
            const hasVisibleBefore = elements.slice(1, index).some(el => !el.classList.contains('invisible5'));
            
            // Aplica as classes conforme a lógica
            if (hasVisibleBefore && hasVisibleAfter) {
                if (!element.classList.contains('aED')) {
                    element.classList.remove('aD', 'aE');
                    element.classList.add('aED');
                }
            } else if (hasVisibleAfter) {
                if (!element.classList.contains('aD')) {
                    element.classList.remove('aED', 'aE');
                    element.classList.add('aD');
                }
            } else if (hasVisibleBefore) {
                if (!element.classList.contains('aE')) {
                    element.classList.remove('aD', 'aED');
                    element.classList.add('aE');
                }
            }
        }
    });
}


const outerCtx = document.getElementById('outerChart').getContext('2d');
const outerChart = new Chart(outerCtx, {
    type: 'doughnut',
    plugins: [glowPlugin],
    data: {
        labels: ['Rotinas atrasadas', 'Rotinas do dia', 'Rotinas em execução', 'Rotinas concluídas'],
        datasets: [{
            data: [2, 1, 7, 1],
            backgroundColor: [
                corErro,
                corOcioso,
                corExecutando,
                corExecutado
            ]
        }]
    },
    options: {
        cutout: '95%', // Buraco menor = borda mais grossa
        maintainAspectRatio: false,
        borderRadius: 20,
        borderWidth: 0,
        layout: {
            padding: 25,
        },
        plugins: {
            legend: {
                display: false
            },
            doughnutGlow: {
                blur: 20,      // intensidade do glow
                opacity: 1   // opacidade
            }
        }
    }
});

const ctx = document.getElementById('meuDonut');
const innerChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Rotinas atrasadas', 'Rotinas do dia', 'Rotinas em execução', 'Rotinas concluídas'],
        datasets: [{
            data: [2, 1, 7, 1],  // valores
            backgroundColor: [
                corErroSombra,
                corOciosoSombra,
                corExecutandoSombra,
                corExecutadoSombra
            ],
            borderColor: [
                corErroSombra,
                corOciosoSombra,
                corExecutandoSombra,
                corExecutadoSombra
            ],
            
        }]
    },
    options: {
        borderWidth: 0,
        cutout: '50%',
        borderRadius: 2,
        maintainAspectRatio: false,
        layout: {
            padding: 22,
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    labelColor: function(context) {
                        // array com as cores fortes (do gráfico externo)
                        const coresFortes = [corErro, corOcioso, corExecutando, corExecutado];
                        const cor = coresFortes[context.dataIndex];
                        
                        return {
                            borderColor: cor,
                            backgroundColor: cor
                        };
                    }
                },
                // muda o quadrado para círculo (usa o mesmo estilo dos pontos)
                usePointStyle: true,
                
                // tamanho do quadrado
                boxWidth: 12,
                boxHeight: 12,
                
                // espaçamento do quadrado até o texto
                boxPadding: 4
            }
        },
    }
});

