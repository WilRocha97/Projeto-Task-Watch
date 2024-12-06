const encolhe = document.getElementById('encolher');
const explode = document.getElementById('explodir');
const dica = document.getElementById('dica');
const telaDica = document.getElementById('telaDica');
const galeria = document.getElementById('galeria');
const telaGaleria = document.getElementById('telaGaleria');

const painelFiltro = document.getElementById('painelFiltro');
const botaoFiltroGeral = document.getElementById('bolinhaGeral');
const botaoFiltroFechar = document.getElementById('bolinhaFechar');
const botaoFiltroOciosa = document.getElementById('bolinhaOcioso');
const botaoFiltroErro = document.getElementById('bolinhaErro');
const botaoFiltroFinal = document.getElementById('bolinhaFinal');
const botoesFiltro = document.querySelectorAll('.bFiltro');

const historicoBotao = document.getElementById('historico');
const historicoTela = document.getElementById('historicoTela');
const mainHistorico = document.getElementById('targetHistorico');
var historicoLinha = document.querySelectorAll('.linha');

var telaLayout = document.getElementById('layoutTela');
var telaRotinas = document.getElementById('telaRotinas');
var screenWidth = window.innerWidth;
var divsRotinas = document.querySelectorAll('#telaRotinas .fundo');

const imagens = ['arvore.png', 'bengala-doce.png', 'gengibre.png', 'gorro-do-papai-noel.png', 'meia.png', 'presente.png', 
                 'visco.png', 'decoracao.png', 'papai-noel.png', 'guirlanda.png', 'estrela.png'];



function updateClock() {
    var daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    var months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    
    var now = new Date();
    var dayOfWeek = daysOfWeek[now.getDay()];
    var day = now.getDate();
    var monthName = months[now.getMonth()];
    var month = now.getMonth() + 1;
    var year = now.getFullYear();
    var hours = now.getHours();
    var minutes = now.getMinutes();

    // Formatação dos dias para adicionar um zero à esquerda se for menor que 10
    day = day < 10 ? '0' + day : day;
    // Formatação dos minutos e segundos para adicionar um zero à esquerda se for menor que 10
    minutes = minutes < 10 ? '0' + minutes : minutes;
    // Formatação dos minutos e segundos para adicionar um zero à esquerda se for menor que 10
    hours = hours < 10 ? '0' + hours : hours;

    var formattedTime = dayOfWeek + ", " + day + " de " + monthName + " de " + year + " - " + hours + ":" + minutes;
    
    document.getElementById('clock').textContent = formattedTime;

    var screenWidth = window.innerWidth;
    if (screenWidth < 720) {
        document.getElementById('menuRelogio').classList.add('invisible')
    }
    else {
        document.getElementById('menuRelogio').classList.remove('invisible')
    }
};
// Atualiza o relógio a cada segundo
setInterval(updateClock, 1000);
// Atualiza o relógio imediatamente ao carregar a página
updateClock();

function filtraHistorico(colunaOcorrencias, filtro) {
    botoesFiltro.forEach(filtro => {
        filtro.classList.remove('clicado')
    });

    // Percorre todos os elementos selecionados
    historicoLinha = document.querySelectorAll('.linha');
    historicoLinha.forEach((element) => {
        element.classList.add('invisible2');
    });
    setTimeout(()=> {
        colunaOcorrencias.forEach((element) => {
            // Verifica se o elemento contém a classe 'ocioso'
            if (!element.classList.contains(filtro)) {
                // Adiciona a classe 'collapsed'
                const parent = element.closest('div'); // Encontra a div pai mais próxima
                parent.classList.add('collapsed');
            };
            // Verifica se o elemento contém a classe 'ocioso'
            if (element.classList.contains(filtro)) {
                // Adiciona a classe 'collapsed'
                const parent = element.closest('div'); // Encontra a div pai mais próxima
                parent.classList.remove('collapsed');
                // desce para a base da página e da tela de histórico
                setTimeout(()=> {
                    if (screenWidth < 2500) {
                        const target = document.getElementById('targetHistorico');
                        const targetPosition = target.offsetTop; /* Pega a posição do topo do elemento */
                    
                        window.scrollTo({
                            top: targetPosition, 
                            behavior: 'smooth' /* Scroll suave */
                        });
                    }
                    historicoTela.scrollTo({
                        top: historicoTela.scrollHeight,
                        behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
                    });
                }, 500);
            };
        });
    }, 500);
    setTimeout(()=> {
        historicoLinha.forEach((element) => {
            element.classList.remove('invisible2');
        });
    }, 800);
};

//const cards = document.querySelectorAll('.rectangle')
//cards.forEach(card => {
//    const shadow = card.querySelector('.shadow');
//    shadow.classList.remove('invisible2');
//    card.addEventListener('mousemove', function(e) {
//        const rect = card.getBoundingClientRect();
//        const x = e.clientX - rect.left;
//        const y = e.clientY - rect.top;
//
//        shadow.style.left = `${x}px`;
//        shadow.style.top = `${y}px`;
//        shadow.style.opacity = 1; // Faz a sombra aparecer quando o mouse está sobre a div
//    });
//
//    card.addEventListener('mouseleave', function() {
//        shadow.style.opacity = 0; // Oculta a sombra quando o mouse sai da div
//    });
//})

const cards = document.querySelectorAll('.rectangle')
cards.forEach((card, index) => {
    setTimeout(()=> {
        card.classList.add('enter');

        // Escolhe uma imagem aleatória
        const imagemAleatoria = imagens[Math.floor(Math.random() * imagens.length)];
        // Atualiza a imagem
        card.querySelector('#imagem-aleatoria').src = `assets/temas/${imagemAleatoria}`;

    }, 100 * index);
});


document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('telaRotinas');
    var delay = 300; // 300ms de delay
    var timeout;

    new Sortable(container, {
        animation: 150,
        handle: '.rectangle',
        delay: delay,
        delayOnTouchOnly: true,
        ghostClass: '', // Desativa a aplicação automática da classe
        onChoose: function(evt) {
            // Inicia um timeout para adicionar a classe após o delay
            timeout = setTimeout(function() {
                evt.item.classList.add('sortable-ghost');
            }, delay);
        },
        onUnchoose: function(evt) {
            // Caso o usuário solte antes do delay, limpa o timeout
            clearTimeout(timeout);
            evt.item.classList.remove('sortable-ghost');
        },
        onEnd: function(evt) {
            // Remove a classe após o arrasto ser finalizado
            clearTimeout(timeout);
            evt.item.classList.remove('sortable-ghost');
            console.log('Ordem das divs alterada');
        }
    });
});

// ouvinte para os cliques nos cartões
document.body.addEventListener('click', (event) => {
    // Verifica se o elemento clicado ou algum de seus pais possui a classe 'rectangle'
    let target = event.target;
    const divMae = target.closest('.rectangle');

    if (target.classList.contains('botaoFixar')) {
        // Encontra o elemento pai mais próximo
        divMae.classList.toggle('fixado')
        if (target.innerHTML.trim() === '☆') {
            target.classList.toggle('botaoFixado')
            target.innerHTML = '★'
        }
        else {
            target.innerHTML = '☆'  
        }
    }
    // verifica se o click foi no botão de fechar
    else if (target.classList.contains('botaoFechar')) {
        // Encontra o elemento pai mais próximo
        divMae.classList.add('out')
        setTimeout(()=> {
            if (divMae.classList.contains('status-executando')) {
                divMae.classList.remove('out')
                divMae.classList.remove('collapsed')
            }
            else {
                telaRotinas.removeChild(divMae)
            }
        }, 500);
    }
    else if (!target.classList.contains('maisInfo')){
        while (target && !target.classList.contains('rectangle')) {
            target = target.parentElement;
        }
    
        // Se um elemento com a classe 'rectangle' foi encontrado, alterna a classe 'collapsed'
        if (target) {
            target.classList.toggle('collapsed');

            const maisInfo = target.querySelector('#resumoResultados');
            const botaoMaisInfo = target.querySelector('.maisInfo')
            maisInfo.classList.add('collapsed')
            botaoMaisInfo.innerHTML = '▼ Ocorrências'
        }
    }
    else {
        // minimiza a tela de ocorrências dentro do card
        const maisInfo = divMae.querySelector('#resumoResultados');
        maisInfo.classList.toggle('collapsed')
        if (target.innerHTML.trim() === '▼ Ocorrências') {
            target.innerHTML = '▲ Ocorrências'
        }
        else {
            target.innerHTML = '▼ Ocorrências'
        }
    }
});

// Minimiza e maximiza todos os cards
encolhe.addEventListener('click', () => {
    const cards = document.querySelectorAll('.rectangle');
    const listaReversa = [...cards].reverse(); // Faz uma cópia para não alterar a original

    listaReversa.forEach((card, index) => {
        if (!card.classList.contains('fixado')) {
            const botaoMaisInfo = card.querySelector('.maisInfo');

            setTimeout(()=> {
                card.classList.add('collapsed');
                setTimeout(()=> {
                    botaoMaisInfo.innerHTML = '▼ Ocorrências';
                    card.querySelector('.resumoResultados').classList.add('collapsed');
                }, 100)
            }, 100 * index);
        }
    });
});
// Minimiza e maximiza todos os cards
explode.addEventListener('click', () => {
    const cards = document.querySelectorAll('.rectangle');

    cards.forEach((card, index) => {
        if (!card.classList.contains('fixado')) {
            const botaoMaisInfo = card.querySelector('.maisInfo');

            setTimeout(()=> {
                card.classList.remove('collapsed');
                setTimeout(()=> {
                    if (!botaoMaisInfo.classList.contains('invisible2')) {
                        botaoMaisInfo.innerHTML = '▲ Ocorrências';
                        card.querySelector('.resumoResultados').classList.remove('collapsed');
                    }
                }, 100);
            }, 100 * index);
        }
    });
});

// Janela com dicas de como o site funciona
dica.addEventListener('click', () => {
    if (telaDica.classList.contains('invisible2')) {
        telaDica.classList.remove('invisible2');
    }
    else {
        telaDica.classList.add('invisible2');
    }
    if (!telaGaleria.classList.contains('invisible2')) {
        telaGaleria.classList.add('invisible2');
    }
    
});

// Janela com imagens do TaskWatch oficial
galeria.addEventListener('click', () => {
    if (telaGaleria.classList.contains('invisible2')) {
        telaGaleria.classList.remove('invisible2');
    }
    else {
        telaGaleria.classList.add('invisible2');
    }
    if (!telaDica.classList.contains('invisible2')) {
        telaDica.classList.add('invisible2');
    }
});
// Modal para exibir as imagens em tela cheia
document.querySelectorAll('.imagemGaleria').forEach(image => {
    image.addEventListener('click', function () {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const caption = document.getElementById('caption');

        modal.style.display = 'block';
        modalImage.src = this.src;
        caption.innerText = this.alt;
    });
});
document.querySelector('.close').addEventListener('click', function () {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
});
window.addEventListener('click', function (event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Abre e fecha a tela de histórico
historicoBotao.addEventListener('click', ()=> {
    document.querySelectorAll('.bn').forEach(bolinha => {
        bolinha.classList.add('invisible');
    })
    mainHistorico.classList.toggle('collapsed')

    if (mainHistorico.classList.contains('collapsed')) {
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
                const target = document.getElementById('targetHistorico');
                const targetPosition = target.offsetTop; /* Pega a posição do topo do elemento */
            
                window.scrollTo({
                    top: targetPosition, 
                    behavior: 'smooth' /* Scroll suave */
                });
            }

            historicoTela.scrollTo({
                top: historicoTela.scrollHeight,
                behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
            });
        }, 500);
    }
});
// Adiciona o evento de clique na tela de histórico para evitar a propagação
mainHistorico.addEventListener('click', (e) => {
    e.stopPropagation();
});
botaoFiltroGeral.addEventListener('click', ()=> {
    botoesFiltro.forEach(filtro => {
        filtro.classList.remove('clicado')
    });
    
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');

    historicoLinha = document.querySelectorAll('.linha');
    historicoLinha.forEach((element) => {
        element.classList.add('invisible2');
    });
    setTimeout(()=> {
        // Percorre todos os elementos selecionados
        ocorrencias.forEach((element) => {
            const parent = element.closest('div'); // Encontra a div pai mais próxima
            parent.classList.remove('collapsed');
        });
        // desce para a base da página e da tela de histórico
        setTimeout(()=> {
            if (screenWidth < 2500) {
                const target = document.getElementById('targetHistorico');
                const targetPosition = target.offsetTop; /* Pega a posição do topo do elemento */
            
                window.scrollTo({
                    top: targetPosition, 
                    behavior: 'smooth' /* Scroll suave */
                });
            }
            historicoTela.scrollTo({
                top: historicoTela.scrollHeight,
                behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
            });
        }, 700);
    }, 700);
    setTimeout(()=> {
        historicoLinha.forEach((element) => {
            element.classList.remove('invisible2');
        });
    }, 800);
    botaoFiltroGeral.classList.add('clicado')
});
botaoFiltroFechar.addEventListener('click', ()=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    filtraHistorico(ocorrencias, 'fechado')
    botaoFiltroFechar.classList.add('clicado')
});
botaoFiltroOciosa.addEventListener('click', ()=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    filtraHistorico(ocorrencias, 'ociosa')
    botaoFiltroOciosa.classList.add('clicado')
});
botaoFiltroErro.addEventListener('click', ()=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    filtraHistorico(ocorrencias, 'erro')
    botaoFiltroErro.classList.add('clicado')
});
botaoFiltroFinal.addEventListener('click', ()=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    filtraHistorico(ocorrencias, 'finalizada')
    botaoFiltroFinal.classList.add('clicado')
});
