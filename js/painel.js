let graficoDashboard; // variável global
let outerGraficoDashboard;

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

function atualizarGraficoDashboard() {
    if (!graficoDashboard) return;

    outerGraficoDashboard.data.datasets[0].data = [2, 1, 7, 1];
    graficoDashboard.data.datasets[0].data = [2, 1, 7, 1];
    //console.log(q)

    outerGraficoDashboard.update();
    graficoDashboard.update();
}

export function criarGraficoDashboard() {
    var styles = getComputedStyle(document.body);
    //<canvas id="meuDonut"></canvas>
    var corExecutado = styles.getPropertyValue('--cor-final').trim();
    var corExecutando = styles.getPropertyValue('--cor-executando').trim();
    var corErro = styles.getPropertyValue('--cor-erro').trim();
    var corOcioso = styles.getPropertyValue('--cor-ocioso').trim();
    var corExecutadoSombra = styles.getPropertyValue('--animacao-opaca-bota-1').trim();
    var corExecutandoSombra = styles.getPropertyValue('--animacao-opaca-bota-2').trim();
    var corErroSombra = styles.getPropertyValue('--animacao-opaca-bota-4').trim();
    var corOciosoSombra = styles.getPropertyValue('--animacao-opaca-bota-3').trim();

    // Destroi se já existir
    if (graficoDashboard) {
        graficoDashboard.destroy();
    }
    if (outerGraficoDashboard) {
        outerGraficoDashboard.destroy();
    }

    const outerCtx = document.getElementById('outerChart').getContext('2d');
    outerGraficoDashboard = new Chart(outerCtx, {
        type: 'doughnut',
        plugins: [glowPlugin],
        data: {
            labels: ['Rotinas atrasadas', 'Rotinas do dia', 'Rotinas em execução', 'Rotinas concluídas'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: [
                    corErro,
                    corOcioso,
                    corExecutando,
                    corExecutado
                ],
                borderColor: [
                    corErroSombra,
                    corOciosoSombra,
                    corExecutandoSombra,
                    corExecutadoSombra
                ]
            }]
        },
        options: {
            cutout: '95%', // Buraco menor = borda mais grossa
            maintainAspectRatio: false,
            borderRadius: 20,
            borderWidth: 1,
            layout: {
                padding: 22,
            },
            plugins: {
                legend: {
                    display: false
                },
                doughnutGlow: {
                    blur: 15,      // intensidade do glow
                    opacity: 1   // opacidade
                }
            }
        }
    });

    const ctx = document.getElementById('meuDonut');
    graficoDashboard = new Chart(ctx, {
        type: 'doughnut',
        plugins: [glowPlugin],
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
                hoverBackgroundColor: [
                    corErro,
                    corOcioso,
                    corExecutando,
                    corExecutado
                ]
            }]
        },
        options: {
            borderWidth: 0,
            cutout: '50%',
            maintainAspectRatio: false,
            layout: {
                padding: 26,
            },
            plugins: {
                legend: { display: false },
                doughnutGlow: {
                    blur: 15,      // intensidade do glow
                    opacity: 1   // opacidade
                },
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

}

document.addEventListener("DOMContentLoaded", () => {
    criarGraficoDashboard();
    atualizarGraficoDashboard();
    var listasTela = document.querySelectorAll('.telaListaRotinas');
    listasTela.forEach((lista, index) => {
        setTimeout(()=> {
            const elementoPai = lista.parentElement;

            elementoPai.classList.remove('invisible5');
        }, 400 * index);
    })
});


