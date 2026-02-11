import {animacaoBotao} from './main.js';
import {decoracao} from './temas.js';
import {fecharTelaDeMaquinas} from './menu.js';
import {fecharTelaDeDemandas} from './menu.js';
import {fechaMenu} from './menu.js'

var telaTitulo = document.querySelector("#telaTitulo");
var telaTituloFundo = document.querySelector(".fundoGradiente");
var telaRotinas = document.getElementById('telaRotinas');
var telaRotinasExecutando = document.getElementById('telaRotinasExecutando');
var telaHistorico = document.getElementById('targetHistorico');

const telaGaleria = document.getElementById('telaGaleria');
const telaDica = document.getElementById('telaDica');

var cInputCard = document.getElementById('searchInputCard');

//localStorage.clear();
// caso existe alguma coisa no localStorage captura a string e transforma em JS para poder ser usado
let cardsFixados = JSON.parse(localStorage.getItem("cardsFixados")) || []

setTimeout(()=> {
    const cards = document.querySelectorAll('.rectangle')
    cards.forEach((card, index) => {
        setTimeout(()=> {
            card.classList.add('enter');

            decoracao(card);
            verificaFixados(card);

        }, 100 * index);
    });
}, 2000);

setTimeout(()=> {
    const infosCards = document.querySelectorAll('.invisibleDemo')
    infosCards.forEach((infoCard, index) => {
        setTimeout(()=> {
            infoCard.classList.remove('invisibleDemo');
        }, 100 * index);
    });
}, 2100);

function verificaFixados(card) {
    if (cardsFixados.some(cardFixado => cardFixado[0] === card.id)) {
        var temCard = document.getElementById(card.id)
        if (temCard) {
            temCard.classList.toggle('fixado')
            var botaoFixar = temCard.querySelector('.botaoFixar')
            botaoFixar.classList.toggle('botaoFixado')
            card.querySelector('.cabecalhoCardBotoes').classList.toggle('cabecalhoCardBotoesExpandido')
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
                fechaMenu()
                fecharTelaDeMaquinas()
                fecharTelaDeDemandas()
                telaDica.classList.add('invisible2');
                telaGaleria.classList.add('invisible2');
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

export function desmarcaCardsBuscados() {
    var cards = document.querySelectorAll('.rectangle');
    cards.forEach(card => { 
        card.classList.remove('buscaCard');
        cInputCard.classList.remove('naoEncontrado')
    });
};

export function procurarCard(event, cardPesquisado='') {
    cInputCard.classList.remove('naoEncontrado');
    desmarcaCardsBuscados();

    if (cardPesquisado == ''){
        cardPesquisado = document.getElementById('searchInputCard').value;
    }
    if (event.key === 'Enter') {
        cInputCard.blur()
        // verifica se foi digitado alguma coisa na barra de pesquisa
        if (cardPesquisado !== '') {
            const cards = document.querySelectorAll('.rectangle');

            // Verificar se o id contém a frase pesquisada
            const resultado = [];
            cards.forEach(card => {
                // console.log(card.id.includes)
                if (card.id.includes(cardPesquisado)) {
                resultado.push(card); // Adicionar o card correspondente no resultado
                }
            });
    
            // aplica estilo de destaque aos cards
            if (resultado.length > 0) {
                resultado.forEach(card => {
                card.classList.add('buscaCard');
                });
            } else {
                cInputCard.classList.add('naoEncontrado');
            }
        }
        // se não remove a marcação dos cards
        else {
            desmarcaCardsBuscados();
        }
    }
};

export function verifica_estado_card(divMae) {
    const maisInfo = divMae.querySelector('#resumoResultados');
    const maisInfo2 = divMae.querySelector('#resumoResultados2');
    const erroInfo = divMae.querySelector('#erroInfo');

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
            fechaMenu()
            fecharTelaDeMaquinas()
            fecharTelaDeDemandas()
            telaDica.classList.add('invisible2');
            telaGaleria.classList.add('invisible2');
            telaHistorico.classList.remove('historicoExpandida');
        }

        if (target.classList.contains('botaoFixar')) {
            if (!divMae.classList.contains('collapsed')) {
                // Encontra o elemento pai mais próximo
                divMae.classList.toggle('fixado')
                target.classList.toggle('botaoFixado')
                divMae.querySelector('.cabecalhoCardBotoes').classList.toggle('cabecalhoCardBotoesExpandido')
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
        else if (target.classList.contains('maisInfo3')) {
            if (erroInfo.classList.contains('collapsed')) {
                erroInfo.classList.remove('collapsed')
                divMae.classList.add('extraLarge')
                target.querySelector('.maisInfob').classList.add('flip')
            }
            else {
                erroInfo.classList.add('collapsed')
                divMae.classList.remove('extraLarge')
                target.querySelector('.maisInfob').classList.remove('flip')
            }
        }
        // verifica se o click foi no botão de fechar
        else if (target.classList.contains('botaoFechar')) {
            // Encontra o elemento pai mais próximo
            if (!divMae.classList.contains('collapsed')) {
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
        }
        else if (target.classList.contains('maisInfo')){
            if (!target.classList.contains('invisible2')) {
                animacaoBotao(target)
    
                // minimiza a tela de ocorrências dentro do card
                if (maisInfo.classList.contains('collapsed')) {
                    maisInfo.classList.remove('collapsed')
                    telaResumoMaisInfo2.classList.remove('large')
                    maisInfo2.classList.remove('large')
                    target.querySelector('.maisInfob').classList.add('flip')
                }
                else {
                    maisInfo.classList.add('collapsed')
                    telaResumoMaisInfo2.classList.add('large')
                    maisInfo2.classList.add('large')
                    target.querySelector('.maisInfob').classList.remove('flip')
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
                    target.querySelector('.maisInfob').classList.add('flip')
                }
                else {
                    maisInfo2.classList.add('collapsed')
                    target.querySelector('.maisInfob').classList.remove('flip')
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

        verifica_estado_card(divMae)
    }
});
