import {procurarCard} from './cards.js';
import {desmarcaCardsBuscados} from './cards.js';
import {restaurarEstado} from './maquinas.js';
import {adicionarListeners} from './maquinas.js';
import {salvarEstado} from './maquinas.js';
import {fecharTelaDeMaquinas} from './maquinas.js';
import {verifica_estado_card} from './cards.js';

var botoes = document.querySelectorAll('button');
var botoesCards = document.querySelectorAll('.btnCard');
var cards = document.querySelectorAll('.rectangle');
var maquinasNaLista = document.querySelectorAll('.rectangleMaquinas');
var barrasPesquisa = document.querySelectorAll('.barraPesquisa');

var relogio = document.getElementById('clock');
const cartoesFixados = document.getElementById('controlarFixados');
const cartoesFixadosTexto = cartoesFixados.querySelector('.MenuBotaoActive');

const encolheCard = document.getElementById('encolherCard');
const explodeCard = document.getElementById('explodirCard');
const encolhe = document.getElementById('encolher');
const explode = document.getElementById('explodir');

const fundoCabecalho = document.getElementById('cabecalho')
const menu = document.getElementById('menu');
const telaMenu = document.querySelectorAll('.menuInvisivel');

const maquinas = document.getElementById('maquinas')
const dica = document.getElementById('dica');
const galeria = document.getElementById('galeria');

const fecharMaquinas = document.getElementById('fecharMaquinas');
const fecharAjuda = document.getElementById('fecharAjuda');
const fecharGaleria = document.getElementById('fecharGaleria');

const telaMaquinas = document.getElementById('telaMaquinas');
const telaDica = document.getElementById('telaDica');
const telaGaleria = document.getElementById('telaGaleria');
const telaRotinas = document.getElementById('telaRotinas');

const barraAddMaquina = document.getElementById('barraAddMaquina');
const barraPesquisaMaquina = document.getElementById('barraPesquisaMaquina');

var mainHistorico = document.getElementById('targetHistorico');
var cInputCard = document.getElementById('searchInputCard');
var telaTitulo = document.querySelector("#telaTitulo");
var telaTituloFundo = document.querySelector(".fundoGradiente");
const limpaCInputCard = document.getElementById('limpaCInputCard');

const maisInfos = [{botao:'.maisInfo', conteudo:'.resumoResultados'}, 
                    {botao:'.maisInfo2', conteudo:'.resumoResultados2'}]
                    
document.querySelectorAll('.bn').forEach((bolinha, index) => {
    setTimeout(()=> {
        bolinha.classList.remove('invisible5');
    }, index * 500); // Atraso baseado no índice
});

export function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}
if (isTouchDevice()) {
    botoes.forEach((botao)=> {
        botao.classList.add('nh')
    });
    botoesCards.forEach((botao)=> {
        botao.classList.add('nh')
    });
    cards.forEach((botao)=> {
        botao.classList.add('nh')
    });
    maquinasNaLista.forEach((botao)=> {
        botao.classList.add('nh')
    });
    barrasPesquisa.forEach((barra)=> {
        barra.classList.add('nh')
    });
}

export function animacaoBotao(target) {
    target.classList.add('clicked');
    setTimeout(() => {
        target.classList.remove('clicked');
    }, 500); // Tempo da animação
}

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
    
    relogio.textContent = formattedTime;

    var screenWidth = window.innerWidth;
    if (screenWidth < 720) {
        document.getElementById('menuRelogio').classList.add('invisible')
    }
    else {
        document.getElementById('menuRelogio').classList.remove('invisible')
    }


};
// Atualiza o relógio a cada segundo
// updateClock();
//setInterval(updateClock, 1000);

// Verifica se tem algum card vizivel, se não exibe a tela de descanso
setInterval(verificaTelaVazia, 1000);
function verificaTelaVazia() {
    if (mainHistorico.classList.contains('collapsed')) {
        if (!document.querySelector(".rectangle.enter")) {
            telaTitulo.classList.remove('invisible1');
            telaTituloFundo.classList.remove('invisible1');
        }
        else {
            telaTitulo.classList.add('invisible1');
            telaTituloFundo.classList.add('invisible1');
        }
    }
};

export function fechaMenu(botaoDoMenu=false) {
    var botaoMenu = document.getElementById('botaoMenu');
    var telaMenu = document.querySelectorAll('.menuInvisivel');
    var telaRotinas = document.getElementById('telaRotinas');
    var fundoCabecalho = document.getElementById('cabecalho');
    var screenWidth = window.innerWidth;
    
    if (screenWidth < 1255 || botaoDoMenu) {
        telaMenu.forEach(miniMenu => {
            miniMenu.classList.add('invisible3');
        })
        fundoCabecalho.classList.remove('cabecalhoExpandido');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido');
        telaRotinas.classList.remove('rotinasExpandida');
    
        // Adiciona a animação de saída
        botaoMenu.classList.remove('anim-in-side-right');
        botaoMenu.classList.add('anim-out-side-left');
        // Espera a animação de saída terminar para trocar a imagem
        botaoMenu.addEventListener('animationend', function handleOut() {
            botaoMenu.removeEventListener('animationend', handleOut); // Remove o listener
            botaoMenu.innerHTML = '❯';
            menu.title = 'Abrir menu';

            // Adiciona a animação de saída
            botaoMenu.classList.remove('anim-out-side-left');
            botaoMenu.classList.add('anim-in-side-left');
        });
    }
}

export function abreFechaMenu() {
    var botaoMenu = document.getElementById('botaoMenu');
    var telaMenu = document.querySelectorAll('.menuInvisivel');
    var telaRotinas = document.getElementById('telaRotinas');
    var fundoCabecalho = document.getElementById('cabecalho');
    var screenWidth = window.innerWidth;

    if (botaoMenu.innerHTML == '❯') {
        telaMenu.forEach(miniMenu => {
            miniMenu.classList.remove('invisible3');
        })
        if (screenWidth < 1255) {
            fundoCabecalho.classList.add('cabecalhoExpandido')
        }
        telaRotinas.classList.add('rotinasExpandida');

        // Adiciona a animação de saída
        botaoMenu.classList.remove('anim-in-side-left');
        botaoMenu.classList.add('anim-out-side-right');
        // Espera a animação de saída terminar para trocar a imagem
        botaoMenu.addEventListener('animationend', function handleOut() {
            botaoMenu.removeEventListener('animationend', handleOut); // Remove o listener
            botaoMenu.innerHTML = '❮';
            menu.title = 'Fechar menu';

            // Adiciona a animação de saída
            botaoMenu.classList.remove('anim-out-side-right');
            botaoMenu.classList.add('anim-in-side-right');
        });
    }
    else {
        fechaMenu(true)
    }
}

document.body.addEventListener('click', (event) => { 
    let target = event.target;
    animacaoBotao(target)
});

// Janela com dicas de como o site funciona
menu.addEventListener('click', () => {
    abreFechaMenu()
    
    if (!telaMaquinas.classList.contains('invisible5')) {
        fecharTelaDeMaquinas()
        telaRotinas.classList.add('rotinasExpandida');
    }
    if (!telaDica.classList.contains('invisible2')) {
        telaDica.classList.add('invisible2');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
        telaRotinas.classList.add('rotinasExpandida');
    }
    if (!telaGaleria.classList.contains('invisible2')) {
        telaGaleria.classList.add('invisible2');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
        telaRotinas.classList.add('rotinasExpandida');
    }
});

// limpa busca card
limpaCInputCard.addEventListener('click', ()=> {
    desmarcaCardsBuscados()
    cInputCard.value = ''
})
// adiciona o evento de escutar a tecla na barra de busca dos cards
cInputCard.addEventListener('keydown', (event) => {
    procurarCard(event)
});
cInputCard.addEventListener('focus', (event) => {
    fundoCabecalho.classList.add('cabecalhoSuperExpandido')
});
cInputCard.addEventListener('blur', (event) => {
    fundoCabecalho.classList.remove('cabecalhoSuperExpandido')
});

cartoesFixados.addEventListener('click', () => { 
    cartoesFixadosTexto.classList.toggle('active')
})
// Minimiza e maximiza todas as telas internas dos cards
encolhe.addEventListener('click', () => {
    const cards = document.querySelectorAll('.rectangle');
    const listaReversa = [...cards].reverse(); // Faz uma cópia para não alterar a original

    if (cartoesFixadosTexto.classList.contains('active')) {

    }
    listaReversa.forEach((card, index) => {
        if (cartoesFixadosTexto.classList.contains('active')) {
            if (!card.classList.contains('fixado')) {
                return
            }
        }
        else {
            if (card.classList.contains('fixado')) {
                return
            } 
        }
        
        maisInfos.forEach(maisInfo => {
            setTimeout(()=> {
                setTimeout(()=> {
                    card.querySelector(maisInfo.botao).querySelector('.maisInfob').classList.remove('flip')
                    card.querySelector(maisInfo.conteudo).classList.add('collapsed');
                    card.classList.remove('large') 
                }, 100)

                verifica_estado_card(card)
            }, 100 * index);
        })
    });
});
// Minimiza e maximiza todos os cards
encolheCard.addEventListener('click', () => {
    const cards = document.querySelectorAll('.rectangle');
    const listaReversa = [...cards].reverse(); // Faz uma cópia para não alterar a original

    listaReversa.forEach((card, index) => {
        if (cartoesFixadosTexto.classList.contains('active')) {
            if (!card.classList.contains('fixado')) {
                return
            }
        }
        else {
            if (card.classList.contains('fixado')) {
                return
            } 
        }

        setTimeout(()=> {
            card.classList.remove('large');
            card.classList.remove('medium');
            card.classList.add('collapsed');

            verifica_estado_card(card)
        }, 100 * index);  
    });
});
// Minimiza e maximiza todas as telas internas dos cards
explode.addEventListener('click', () => {
    const cards = document.querySelectorAll('.rectangle');

    cards.forEach((card, index) => {
        if (cartoesFixadosTexto.classList.contains('active')) {
            if (!card.classList.contains('fixado')) {
                return
            }
        }
        else {
            if (card.classList.contains('fixado')) {
                return
            } 
        }

        maisInfos.forEach(maisInfo => {
            if (!card.querySelector(maisInfo.botao).classList.contains('invisible')) {
                setTimeout(()=> {
                    card.classList.remove('collapsed');
                    card.classList.add('large');
                    setTimeout(()=> {
                        card.querySelector(maisInfo.botao).querySelector('.maisInfob').classList.add('flip')
                        card.querySelector(maisInfo.conteudo).classList.remove('collapsed');

                        verifica_estado_card(card)
                    }, 100)
                }, 100 * index);
            }
        })
    });
});
// Minimiza e maximiza todos os cards
explodeCard.addEventListener('click', () => {
    const cards = document.querySelectorAll('.rectangle');

    cards.forEach((card, index) => {
        if (cartoesFixadosTexto.classList.contains('active')) {
            if (!card.classList.contains('fixado')) {
                return
            }
        }
        else {
            if (card.classList.contains('fixado')) {
                return
            } 
        }

        setTimeout(()=> {
            if (card.classList.contains('collapsed')) {
                card.classList.add('large');
                card.classList.remove('collapsed');

                verifica_estado_card(card)
            }
        }, 100 * index);
    });
});

// Janela com dicas de como o site funciona
maquinas.addEventListener('click', () => {
    fechaMenu()
    
    if (!telaGaleria.classList.contains('invisible2')) {
        telaGaleria.classList.add('invisible2');
    }
    if (!telaDica.classList.contains('invisible2')) {
        telaDica.classList.add('invisible2');
    }
    if (telaMaquinas.classList.contains('invisible5')) {
        restaurarEstado();
        adicionarListeners();
        salvarEstado();
        telaMaquinas.classList.remove('invisible5');
    }
    else {
        fecharTelaDeMaquinas()
    }
});
fecharMaquinas.addEventListener('click', ()=> {
    if (!barraAddMaquina.classList.contains('invisible6')) {
        barraAddMaquina.classList.add('invisible6')
        barraPesquisaMaquina.classList.remove('invisible6')
    }

    fecharTelaDeMaquinas()
})

dica.addEventListener('click', () => {
    fechaMenu()
    
    if (!telaGaleria.classList.contains('invisible2')) {
            telaGaleria.classList.add('invisible2');
        }
    if (!telaMaquinas.classList.contains('invisible5')) {
        fecharTelaDeMaquinas()
    }

    if (telaDica.classList.contains('invisible2')) {
        telaDica.classList.remove('invisible2');
        fundoCabecalho.classList.add('cabecalhoMegaExpandido')
    }
    else {
        telaDica.classList.add('invisible2');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
    }
});
fecharAjuda.addEventListener('click', ()=> {
    telaDica.classList.add('invisible2');
    fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
})

// Janela com imagens do TaskWatch oficial
galeria.addEventListener('click', () => {
    fechaMenu()

    if (!telaDica.classList.contains('invisible2')) {
        telaDica.classList.add('invisible2');
    }
    if (!telaMaquinas.classList.contains('invisible5')) {
        fecharTelaDeMaquinas()
    }

    if (telaGaleria.classList.contains('invisible2')) {
        telaGaleria.classList.remove('invisible2');
        fundoCabecalho.classList.add('cabecalhoMegaExpandido')
    }
    else {
        telaGaleria.classList.add('invisible2');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
    }
});
fecharGaleria.addEventListener('click', ()=> {
    telaGaleria.classList.add('invisible2');
    fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
})
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