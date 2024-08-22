const encolhe = document.getElementById('encolher')
const explode = document.getElementById('explodir')

const painelFiltro = document.getElementById('painelFiltro');
const botaoFiltroGeral = document.getElementById('bolinhaGeral')
const botaoFiltroOciosa = document.getElementById('bolinhaOcioso')
const botaoFiltroErro = document.getElementById('bolinhaErro')
const botaoFiltroFinal = document.getElementById('bolinhaFinal')

var historicoBotao = document.getElementById('historico');
var historicoTela = document.getElementById('historicoTela');
var historicoLinha = document.querySelectorAll('.linha');
var historicoNotificacaoErro = document.getElementById('bolinhaNotificacaoErro')
var historicoNotificacaoOcioso = document.getElementById('bolinhaNotificacaoOcioso')
var historicoNotificacaoFinal = document.getElementById('bolinhaNotificacaoFinal')

var telaLayout = document.getElementById('layoutTela');
var telaRotinas = document.getElementById('telaRotinas');
var screenWidth = window.innerWidth;
var divsRotinas = document.querySelectorAll('#telaRotinas .fundo')
const botoesFechar = document.querySelectorAll('.botaoFechar');


function updateClock() {
    var daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    var months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    
    var now = new Date();
    var dayOfWeek = daysOfWeek[now.getDay()];
    var day = now.getDate();
    var month = months[now.getMonth()];
    var year = now.getFullYear();
    var hours = now.getHours();
    var minutes = now.getMinutes();

    // Formatação dos minutos e segundos para adicionar um zero à esquerda se for menor que 10
    minutes = minutes < 10 ? '0' + minutes : minutes;
    // Formatação dos minutos e segundos para adicionar um zero à esquerda se for menor que 10
    hours = hours < 10 ? '0' + hours : hours;

    var formattedTime = dayOfWeek + ", " + day + " de " + month + " de " + year + " - " + hours + ":" + minutes;
    
    document.getElementById('clock').textContent = formattedTime;

    var screenWidth = window.innerWidth;
    if (screenWidth < 720) {
        document.getElementById('menuRelogio').classList.add('invisible')
    }
    else {
        document.getElementById('menuRelogio').classList.remove('invisible')
    }
}
// Atualiza o relógio a cada segundo
setInterval(updateClock, 1000);
// Atualiza o relógio imediatamente ao carregar a página
updateClock();

function filtraHistorico(colunaOcorrencias, filtro) {
    // Percorre todos os elementos selecionados
    colunaOcorrencias.forEach((element) => {
        // Verifica se o elemento contém a classe 'ocioso'
        if (!element.classList.contains(filtro)) {
            // Adiciona a classe 'invisible'
            const parent = element.closest('div'); // Encontra a div pai mais próxima
            parent.classList.add('invisible');
        }
        // Verifica se o elemento contém a classe 'ocioso'
        if (element.classList.contains(filtro)) {
            // Adiciona a classe 'invisible'
            const parent = element.closest('div'); // Encontra a div pai mais próxima
            parent.classList.remove('invisible');
            // desce para a base da página e da tela de histórico
        setTimeout(()=> {
            if (screenWidth < 2500) {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
                });
            }
            historicoTela.scrollTo({
                top: historicoTela.scrollHeight,
                behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
            });
        }, 500);
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('telaRotinas');
    new Sortable(container, {
        animation: 300, // Tempo de animação em milissegundos
        ghostClass: 'sortable-ghost', // Classe que será adicionada ao item enquanto é arrastado
        handle: '.fundo', // Isso garante que as divs filhas sejam as que podem ser arrastadas
        onEnd: function (evt) {
            // Callback executado quando o arrasto é concluído
            console.log('Ordem das divs alterada');
        }
    });
});


// Adiciona um ouvinte de eventos ao documento para capturar cliques
document.body.addEventListener('click', (event) => {
    // Verifica se o elemento clicado ou algum de seus pais possui a classe 'rectangle'
    let target = event.target;
    while (target && !target.classList.contains('rectangle')) {
        target = target.parentElement;
    }

    // Se um elemento com a classe 'rectangle' foi encontrado, alterna a classe 'collapsed'
    if (target) {
        target.classList.toggle('collapsed');
    }
});

// Minimiza e maximiza todos os cards
encolhe.addEventListener('click', (e) => {
    const cards = document.querySelectorAll('.rectangle')
    cards.forEach(card => {
        card.classList.add('collapsed');
    })
})

// Minimiza e maximiza todos os cards
explode.addEventListener('click', (e) => {
    const cards = document.querySelectorAll('.rectangle')
    cards.forEach(card => {
        card.classList.remove('collapsed')
    })
})

// Abre e fecha a tela de histórico
historicoBotao.addEventListener('click', (e)=> {
    historicoNotificacaoErro.classList.add('invisible')
    historicoNotificacaoOcioso.classList.add('invisible')
    historicoNotificacaoFinal.classList.add('invisible')
    historicoTela.classList.toggle('collapsed')
    painelFiltro.classList.toggle('invisible')

    if (historicoTela.classList.contains('collapsed')) {
        // sobe para o topo da página
        setTimeout(()=> {
            if (screenWidth < 2500) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
                });
            }
        }, 500);
    }
    else {
        // desce para a base da página e da tela de histórico
        setTimeout(()=> {
            if (screenWidth < 2500) {
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
                });
            }
            historicoTela.scrollTo({
                top: historicoTela.scrollHeight,
                behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
            });
        }, 500);
    }
})
// Adiciona o evento de clique na tela de histórico para evitar a propagação
historicoTela.addEventListener('click', (e) => {
    e.stopPropagation();
});
botaoFiltroGeral.addEventListener('click', (e)=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    
    // Percorre todos os elementos selecionados
    ocorrencias.forEach((element) => {
        const parent = element.closest('div'); // Encontra a div pai mais próxima
        parent.classList.remove('invisible');
    });
    // desce para a base da página e da tela de histórico
    setTimeout(()=> {
        if (screenWidth < 2500) {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
            });
        }
        historicoTela.scrollTo({
            top: historicoTela.scrollHeight,
            behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
        });
    }, 500);
})
botaoFiltroOciosa.addEventListener('click', (e)=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    filtraHistorico(ocorrencias, 'ociosa')
})
botaoFiltroErro.addEventListener('click', (e)=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    filtraHistorico(ocorrencias, 'erro')
})
botaoFiltroFinal.addEventListener('click', (e)=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    filtraHistorico(ocorrencias, 'finalizada')
})
    
// Adiciona um event listener a cada botão de fechar
botoesFechar.forEach(botao => {
    botao.addEventListener('click', () => {
        // Encontra o elemento pai mais próximo
        const divMae = botao.closest('.rectangle');
        divMae.classList.add('out')
            setTimeout(()=> {
                telaRotinas.removeChild(divMae)
            }, 500);
    });
});