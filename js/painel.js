import { apiDashboard, _semearEventosDemo } from './rotinas-storage.js';

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
            else {
                element.classList.remove('aD', 'aE', 'aED');
            }
        }
    });
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
                data: [0, 0, 0, 0],  // valores
                backgroundColor: [
                    corErroSombra,
                    corOciosoSombra,
                    corExecutandoSombra,
                    corExecutadoSombra
                ],
                hoverOffset: 5,
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
            borderRadius: 3,
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

function atualizarGraficoDashboard(q) {
    if (!graficoDashboard) return;

    const todosZero = Object.values(q).every(valor => valor === 0);
    if (todosZero) {
        document.getElementById('targetPainel').classList.add('collapsed')
    }
    else {
        document.getElementById('targetPainel').classList.remove('collapsed')
    }

    const valores = [q.atrasados, q.hoje, q.em_execucao, q.concluidos_hoje];
    const apenasUm = valores.filter(v => v > 0).length === 1;
    if (apenasUm) {
        q.atrasados = 0,                                // Atrasados
        q.hoje = 0,                                     // Para executar
        q.em_execucao = 0,                              // Em execução
        q.concluidos_hoje = 0                          // Executados
        document.querySelector('.chartBox').classList.add('collapsed')
    }
    else {
        document.querySelector('.chartBox').classList.remove('collapsed')
    }

    outerGraficoDashboard.data.datasets[0].data = [
        q.atrasados,                                // Atrasados
        q.hoje,                                     // Para executar
        q.em_execucao,                              // Em execução
        q.concluidos_hoje                           // Executados
    ];
    graficoDashboard.data.datasets[0].data = [
        q.atrasados,                                // Atrasados
        q.hoje,                                     // Para executar
        q.em_execucao,                              // Em execução
        q.concluidos_hoje                           // Executados
    ];
    //console.log(q)

    outerGraficoDashboard.update();
    graficoDashboard.update();
}

function atualizarLista(id_lista, lista) {
    var qualTela = document.getElementById(id_lista);
    const elementoPai = qualTela.parentElement;

    // deixa visível a lista que tem itens para mostrar
    if (lista.length > 0) {
        elementoPai.classList.remove('invisible5');

        // verificação para ativar e desativar a tela única no modo horizontal para aprovietar o espaço disponível na tela
        if (document.querySelector('.chartBox').classList.contains('collapsed')) {
            elementoPai.classList.add('listaGrande');
            qualTela.classList.add('listaHorizontal');
            document.getElementById('targetPainel').classList.add('painelHorizontal');
        }
        else {
            elementoPai.classList.remove('listaGrande');
            qualTela.classList.remove('listaHorizontal');
            document.getElementById('targetPainel').classList.remove('painelHorizontal');
        }
    }
    else {
        elementoPai.classList.add('invisible5');
    }

    verificaListasAbertas()
    
    qualTela.querySelectorAll('.linhaSimples').forEach((linha) => {
        const paragrafoLinha = linha.querySelector('.nomeRotina')
        if (!paragrafoLinha) return; // elemento sem o parágrafo esperado (ex: linha em transição/placeholder), ignora com segurança

        const textoExiste = lista.some(item => item.titulo === paragrafoLinha.innerHTML);

        if (!textoExiste) {
            linha.classList.add('vazio')
            setTimeout(()=> {
                linha.remove();
            }, 250);
        }
    })

    //console.log(lista)
    setTimeout(()=> {
        lista.forEach((rotina, index) => {
            const idRotina = rotina.titulo.split(" ").join("_").replace("/", "").replace("(", "").replace(")", "");

            // verifica se a rotina está na lista
            const rtoinaNaLista = qualTela.querySelector(`#${idRotina}`);
            
            if (rtoinaNaLista == null) {
                const dataString = rotina.data_inicio;
                const data = new Date(dataString);
                //console.log(rotina.titulo, dataString, data)
                const dia = String(data.getUTCDate()).padStart(2, '0');
                const mes = String(data.getUTCMonth() + 1).padStart(2, '0'); // +1 porque começa do 0
                const ano = data.getUTCFullYear();

                var dataFormatada = `${dia}/${mes}/${ano}`;
                if (dataFormatada == '01/01/2001') {
                    dataFormatada = ''
                }

                setTimeout(()=> {
                    //console.log(rotina)
                    // Insere o conteúdo concatenado na div de saída
                    const newElement = document.createElement('div');
                    newElement.id = idRotina;
                    newElement.title = `${rotina.titulo}\n\n${rotina.descricao}`;
                    newElement.className = 'linhaSimples vazio';
                    newElement.innerHTML = `<p class="nomeRotina">${rotina.titulo}</p>
                                            <p class="dataRotina">${dataFormatada}</p>`;

                    // Encontra a posição correta para inserir em ordem alfabética
                    const filhos = Array.from(qualTela.children);
                    const posicao = filhos.find(filho => filho.id.localeCompare(idRotina) > 0);

                    if (posicao) {
                        // Insere antes do elemento encontrado
                        qualTela.insertBefore(newElement, posicao);
                    } else {
                        // Se não encontrou, adiciona no final
                        qualTela.appendChild(newElement);
                    }
                    
                    setTimeout(()=> {
                        newElement.classList.remove('vazio')
                    }, 250);
                }, 100 * index);
            }
        });
    }, 1000);

}

async function carregarDashboard() {
    try {
        const dash = await apiDashboard();

        atualizarGraficoDashboard(dash.quantidades);
        atualizarLista("AtrasadosTela", dash.atrasados);
        atualizarLista("DiaTela", dash.hoje);
        atualizarLista("ExecutandoTela", dash.em_execucao);
        atualizarLista("FinalizadoTela", dash.concluidos_hoje);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

async function executarPeriodicamente() {
  await carregarDashboard();
  setTimeout(executarPeriodicamente, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
    // garante que os eventos de demonstração existam mesmo se essa página
    // for aberta antes do calendário
    _semearEventosDemo();
    criarGraficoDashboard();
    executarPeriodicamente();
});