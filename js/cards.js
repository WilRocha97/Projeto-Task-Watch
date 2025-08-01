import {animacaoBotao} from './main.js';
import {decoracao} from './temas.js';

var telaTitulo = document.querySelector("#telaTitulo");
var telaTituloFundo = document.querySelector(".fundoGradiente");
var telaRotinas = document.getElementById('telaRotinas');
var telaRotinasExecutando = document.getElementById('telaRotinasExecutando');
var telaHistorico = document.getElementById('targetHistorico');
const fundoCabecalho = document.getElementById('cabecalho')
const telaGaleria = document.getElementById('telaGaleria');
const menu = document.getElementById('menu');
const telaMenu = document.querySelectorAll('.menuInvisivel');
const telaDica = document.getElementById('telaDica');

//localStorage.clear();
// caso existe alguma coisa no localStorage captura a string e transforma em JS para poder ser usado
let cardsFixados = JSON.parse(localStorage.getItem("cardsFixados")) || []

const cards = document.querySelectorAll('.rectangle')
cards.forEach((card, index) => {
    setTimeout(()=> {
        card.classList.add('enter');

        decoracao(card);
        verificaFixados(card);

    }, 100 * index);
});

function verificaFixados(card) {
    if (cardsFixados.some(cardFixado => cardFixado[0] === card.id)) {
        var temCard = document.getElementById(card.id)
        if (temCard) {
            temCard.classList.toggle('fixado')
            var botaoFixar = temCard.querySelector('.botaoFixar')
            botaoFixar.classList.toggle('botaoFixado')
            if (botaoFixar.innerHTML.trim() === '☆') {
                botaoFixar.innerHTML = '★'

                cardsFixados.splice(cardsFixados.findIndex(elemento => elemento[0] === card.id), 1)
                const indice = Array.from(document.getElementById('telaRotinas').children).indexOf(card);
                cardsFixados.push([card.id, indice])
            }
        }
        else {
            cardsFixados.splice(cardsFixados.findIndex(elemento => elemento[0] === card.id), 1)
            
        }
    }
    //adiciona a lista atualizada no localStorage convertendo-a em string
    localStorage.setItem("cardsFixados", JSON.stringify(cardsFixados))
}

function atualizaLocalStorage() {
    cardsFixados = []
    var cardsReordenados = document.querySelectorAll('.rectangle')
    cardsReordenados.forEach(cardNewIndex => {
        if (cardNewIndex.classList.contains('fixado')) {
            const indice = Array.from(document.getElementById('telaRotinas').children).indexOf(cardNewIndex);
            cardsFixados.push([cardNewIndex.id, indice])
        }
    })
    localStorage.setItem("cardsFixados", JSON.stringify(cardsFixados))
}

function sortable(container) {
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
                var screenWidth = window.innerWidth;
                if (screenWidth < 1255) {
                    telaMenu.forEach(miniMenu => {
                        miniMenu.classList.add('invisible3');
                    })
                    if (screenWidth < 1255) {
                        fundoCabecalho.classList.remove('cabecalhoExpandido')
                    }
                    menu.innerHTML = '❯'
                    telaRotinas.classList.remove('rotinasExpandida');
                }
                telaDica.classList.add('invisible2');
                telaGaleria.classList.add('invisible2');
                telaRotinas.classList.remove('rotinasExpandida')
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
            //console.log('Ordem das divs alterada');

            atualizaLocalStorage()
        }
    });
}
document.addEventListener('DOMContentLoaded', function() {
    sortable(telaRotinas)
    sortable(telaRotinasExecutando)
});

// ouvinte para os cliques nos cartões
document.addEventListener('click', (event) => {
    // Verifica se o elemento clicado ou algum de seus pais possui a classe 'rectangle'
    let target = event.target;
    const divMae = target.closest('.rectangle');

    if (divMae) {
        const maisInfo = divMae.querySelector('#resumoResultados');
        const telaResumoMaisInfo2 = divMae.querySelector('.telaResumoConteudo');
        const maisInfo2 = divMae.querySelector('#resumoResultados2');
        const erroInfo = divMae.querySelector('#erroInfo');

        divMae.classList.remove('buscaCard');

        // fecha o menu ao clicar em qualuqer lugar que não seja nele
        if (!target.classList.contains('cmb')) {
            var screenWidth = window.innerWidth;
            if (screenWidth < 1255) {
                telaMenu.forEach(miniMenu => {
                    miniMenu.classList.add('invisible3');
                })
                if (screenWidth < 1255) {
                    fundoCabecalho.classList.remove('cabecalhoExpandido')
                }
                menu.innerHTML = '❯'
                telaRotinas.classList.remove('rotinasExpandida');
            }
            telaDica.classList.add('invisible2')
            telaGaleria.classList.add('invisible2')
            telaRotinas.classList.remove('rotinasExpandida')
            telaHistorico.classList.remove('historicoExpandida');
        }

        if (target.classList.contains('botaoFixar')) {
            if (!divMae.classList.contains('collapsed')) {
                // Encontra o elemento pai mais próximo
                divMae.classList.toggle('fixado')
                target.classList.toggle('botaoFixado')
                if (target.innerHTML.trim() === '☆') {
                    target.innerHTML = '★'
                }
                else {
                    target.innerHTML = '☆'  
                }
                atualizaLocalStorage()
            }
            else {
                while (target && !target.classList.contains('rectangle')) {
                    target = target.parentElement;
                }
            
                // Se um elemento com a classe 'rectangle' foi encontrado, alterna a classe 'collapsed'
                if (target) {
                    target.classList.toggle('collapsed');
                }
            }
        }
        else if (target.classList.contains('botaoInfo')) {
            if (erroInfo.classList.contains('collapsed')) {
                erroInfo.classList.remove('collapsed')
                divMae.classList.add('extraLarge')
            }
            else {
                erroInfo.classList.add('collapsed')
                divMae.classList.remove('extraLarge')
            }
        }
        // verifica se o click foi no botão de fechar
        else if (target.classList.contains('botaoFechar')) {
            // Encontra o elemento pai mais próximo
            divMae.classList.add('out')
            divMae.classList.remove('enter')
            setTimeout(()=> {
                if (divMae.classList.contains('status-executando')) {
                    setTimeout(()=> {
                        telaTitulo.classList.add('invisible1');
                        telaTituloFundo.classList.add('invisible1');
                        divMae.classList.remove('out')
                        divMae.classList.add('enter')
                        divMae.classList.remove('collapsed')
                    }, 10000);
                }
                else {
                    telaRotinas.removeChild(divMae)
                }
            }, 500);
        }
        else if (target.classList.contains('maisInfo')){
            if (!target.classList.contains('invisible2')) {
                animacaoBotao(target)
    
                // minimiza a tela de ocorrências dentro do card
                if (maisInfo.classList.contains('collapsed')) {
                    maisInfo.classList.remove('collapsed')
                    telaResumoMaisInfo2.classList.remove('large')
                    maisInfo2.classList.remove('large')
                    target.innerHTML = '▲ Execução'
                    if (divMae.querySelector('.maisInfo2').classList.contains('invisible2')) {
                        target.classList.remove('minimizado')
                    }
                }
                else {
                    maisInfo.classList.add('collapsed')
                    telaResumoMaisInfo2.classList.add('large')
                    maisInfo2.classList.add('large')
                    target.innerHTML = '▼ Execução'
                    if (divMae.querySelector('.maisInfo2').classList.contains('invisible2')) {
                        target.classList.add('minimizado')
                    }
                }
            }
        }
        else if (target.classList.contains('maisInfo2')){
            if (!target.classList.contains('invisible2')) {
                animacaoBotao(target)
                
                if (maisInfo.classList.contains('collapsed')) {
                    telaResumoMaisInfo2.classList.add('large')
                    maisInfo2.classList.add('large')
                }
                else {
                    telaResumoMaisInfo2.classList.remove('large')
                    maisInfo2.classList.remove('large')
                }
    
                // minimiza a tela de ocorrências dentro do card
                if (maisInfo2.classList.contains('collapsed')) {
                    maisInfo2.classList.remove('collapsed')
                    target.innerHTML = '▲ Andamentos'
                    target.classList.remove('minimizado')
                }
                else {
                    maisInfo2.classList.add('collapsed')
                    target.innerHTML = '▼ Andamentos'
                    target.classList.add('minimizado')
                }
            }
        }
        else {
            while (target && !target.classList.contains('rectangle')) {
                target = target.parentElement;
            }
        
            // Se um elemento com a classe 'rectangle' foi encontrado, alterna a classe 'collapsed'
            if (target) {
                target.classList.toggle('collapsed');
            }
        }

        if (!erroInfo.classList.contains('collapsed') && !divMae.classList.contains('collapsed')) {
            divMae.classList.add('extraLarge') 
        }

        // Controla o tamanho máximo do card para otimizar a animação de minimiza-lo
        if (maisInfo.classList.contains('collapsed') && 
            maisInfo2.classList.contains('collapsed') && 
            erroInfo.classList.contains('collapsed') || 
            divMae.classList.contains('collapsed')) 
            {
                divMae.classList.remove('extraLarge')
                divMae.classList.remove('large')
                divMae.classList.remove('medium')
            }
        else if (!maisInfo.classList.contains('collapsed') && maisInfo2.classList.contains('collapsed')) {
            divMae.classList.remove('large')
            divMae.classList.add('medium') 
        }
        
        else if (maisInfo.classList.contains('collapsed') && !maisInfo2.classList.contains('collapsed') || !maisInfo.classList.contains('collapsed') && !maisInfo2.classList.contains('collapsed')) {
            divMae.classList.remove('medium')
            divMae.classList.add('large')  
        }
    }
});
