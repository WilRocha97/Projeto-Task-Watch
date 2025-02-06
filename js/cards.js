import {animacaoBotao} from './main.js';
import {decoracao} from './temas.js';

var telaRotinas = document.getElementById('telaRotinas');
var telaHistorico = document.getElementById('targetHistorico');
const telaGaleria = document.getElementById('telaGaleria');
const telaMenu = document.getElementById('telaMenu');
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
                telaMenu.classList.add('invisible2');
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

        divMae.classList.remove('buscaCard');

        // fecha o menu ao clicar em qualuqer lugar que não seja nele
        if (!target.classList.contains('cmb')) {
            telaMenu.classList.add('invisible2')
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
        else if (target.classList.contains('maisInfo')){
            if (!target.classList.contains('invisible2')) {
                animacaoBotao(target)
    
                // minimiza a tela de ocorrências dentro do card
                if (maisInfo.classList.contains('collapsed')) {
                    maisInfo.classList.remove('collapsed')
                    telaResumoMaisInfo2.classList.remove('large')
                    maisInfo2.classList.remove('large')
                    target.innerHTML = '▲ Execução'
                }
                else {
                    maisInfo.classList.add('collapsed')
                    telaResumoMaisInfo2.classList.add('large')
                    maisInfo2.classList.add('large')
                    target.innerHTML = '▼ Execução'
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
                }
                else {
                    maisInfo2.classList.add('collapsed')
                    target.innerHTML = '▼ Andamentos'
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
        // Controla o tamanho máximo do card para otimizar a animação de minimiza-lo
        if (maisInfo.classList.contains('collapsed') && maisInfo2.classList.contains('collapsed') || divMae.classList.contains('collapsed')) {
            divMae.classList.remove('large')
        }
        else {
            divMae.classList.add('large') 
        }
    }
});
