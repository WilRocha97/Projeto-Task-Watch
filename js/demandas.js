import {procurarCard} from './cards.js';
import {isTouchDevice} from './main.js';

let canClickLimpaBusca = true;

const fundoCabecalho = document.getElementById('cabecalho');

const telaDemandas = document.getElementById('telaDemandas');

const botaoOrdenarTelaDemandas = document.getElementById("ordenarDemandas");
const botaoOrdenarTelaDemandasTexto = botaoOrdenarTelaDemandas.querySelector('.MenuBotaoActive');

const botaoFixarTelaDemandas = document.getElementById('fixarTelaDemandas');
const botaoFixarTelaDemandasTexto = botaoFixarTelaDemandas.querySelector('.MenuBotaoActive');

const addDemanda = document.getElementById('addDemanda');
const addDemandaTexto = addDemanda.querySelector('.MenuBotaoActive');

const novaDemanda = document.getElementById('inputAddDemanda');
const pesquisaDemanda = document.getElementById('inputPesquisaDemanda');
const menuLateral = document.querySelector('.menuLateral');
const barraAddDemanda = document.getElementById('barraAddDemanda');
const barraPesquisaDemanda = document.getElementById('barraPesquisaDemanda');
const limpaInputPesquisaDemanda = document.getElementById('limpaInputPesquisaDemanda');
const limpaInputAddDemanda = document.getElementById('limpaInputAddDemanda');
const STORAGE_KEY = "estadoDemandas";

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function exibeDemandas() {
    canClickLimpaBusca = false

    const maquinasNaLista = document.querySelectorAll('.rectangleDemanda');
    for (const maquinaNaLista of maquinasNaLista) {
        maquinaNaLista.classList.remove('invisible7');
        await esperar(20);
    }
    
    canClickLimpaBusca = true
}

async function exibeDemandaPesquisada(pesquisa, nomeDaMaquina) {
    var nomeNovaMaquina = ''
    if (nomeDaMaquina != '') {
        nomeNovaMaquina = nomeDaMaquina
    }
    else {
        nomeNovaMaquina = pesquisaDemanda.value;
    } 
    const maquinasNaLista = document.querySelectorAll('.rectangleDemanda');

    // Verificar se o id contém a frase pesquisada
    var resultado = false;

    // Converte para array e inverte
    const maquinasInvertidas = Array.from(maquinasNaLista).reverse();
    for (const maquinaNaLista of maquinasInvertidas) {
        if (!maquinaNaLista.id.includes(nomeNovaMaquina)) {
            maquinaNaLista.classList.add('invisible7')
        }
        else {
            maquinaNaLista.classList.remove('invisible7')
            resultado = true
        }
        await esperar(20);
    };
    // aplica estilo de destaque aos cards
    if (!resultado) {
        if (pesquisa) {
            pesquisaDemanda.classList.add('naoEncontrado');
        }
    }
}

function adicionarDemandaNoInicio(idMaquina) {
    // Pega o container
    const container = document.querySelector("#listaDemandas");
    if (!container) return;

    // Verificar se o id contém a frase pesquisada
    const maquinasNaLista = document.querySelectorAll('.rectangleDemanda');
    for (const maquinaNaLista of maquinasNaLista) {
        // console.log(card.id.includes)
        if (maquinaNaLista.id === idMaquina) {
            exibeDemandaPesquisada(false, idMaquina)
            return;
        }
    };

    // Cria a nova div
    const novaDiv = document.createElement("div");
    novaDiv.id = idMaquina;
    novaDiv.className = "rectangleDemanda invisible7";
    novaDiv.innerHTML = `
        <div class="menuItenLateral">
            <button id="mudarStatus" class="cmb botaoFixar botaoItemMenuLateral cMudarStatus" title="Mudar status">Prioridade baixa</button>
            <div id="deletarDemanda" class="cmb botaoFechar botaoItemMenuLateral" title="Deletar dispositivo">⨉</div>
        </div>

        <div class="tituloContainerItemLateral">
            <div class="tituloItemLateral">${idMaquina}</div>
        </div>
    
        <div><div class="subTituloItemLateral">Responsável:</div>
            <textarea type="text" id="responsavel" class="inputComentario scroll scrollMini miniTelaMensagemItemLateral" placeholder="Responsável" title="Adicionar responsável da demanda"></textarea>
        </div>
        <div>
            <div class="subTituloItemLateral">Situação:</div>
            <textarea type="text" id="situacao" class="inputComentario scroll scrollMini miniTelaMensagemItemLateral" placeholder="Situação" title="Adicionar situação da demanda"></textarea>
        </div>
        <div>
            <div class="subTituloItemLateral">Descrição:</div>
            <textarea type="text" id="comentario" class="inputComentario scroll scrollMini telaMensagemItemLateral" placeholder="Adicionar comentário" title="Adicionar comentário"></textarea>
        </div>

        <span id="statusDemanda" class="cStatusItemLateral livre"></span>
    `;

    // Insere no índice 0 (antes do primeiro filho)
    container.insertBefore(novaDiv, container.firstChild);
    document.getElementById(idMaquina).scrollIntoView({ behavior: "smooth", block: "start" });

    novaDemanda.value= '';
    setTimeout(()=> {
        document.getElementById(idMaquina).classList.remove('invisible7')
        if (isTouchDevice()) {
            document.getElementById(idMaquina).classList.add('nh')
        }
    }, 100);
}

export function fecharTelaDeDemandas() {
    if (!document.querySelector('body').classList.contains('mfDemandas')) {
        if (!barraAddDemanda.classList.contains('invisible6')) {
            barraAddDemanda.classList.add('invisible6');
            barraPesquisaDemanda.classList.remove('invisible6');
            addDemandaTexto.classList.toggle('addDemandaAtivada');
        }
        pesquisaDemanda.value = ''
        telaDemandas.classList.add('invisible5');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido');
        botaoOrdenarTelaDemandasTexto.classList.remove('addDemandaAtivada')
    }
}

export function salvarEstadoDemandas() {
    const estado = {};
    document.querySelectorAll(".rectangleDemanda").forEach(demanda => {
        const id = demanda.id;
        const statusEl = demanda.querySelector("#statusDemanda");
        const responsavelInput = demanda.querySelector("#responsavel");
        const situacaoInput = demanda.querySelector("#situacao");
        const textarea = demanda.querySelector("#comentario");
        const botaoStatus = demanda.querySelector("#mudarStatus");

        estado[id] = {
            statusClasse: statusEl ? statusEl.classList[1] || "" : "",
            responsavel: responsavelInput ? responsavelInput.value : "",
            situacao: situacaoInput ? situacaoInput.value : "",
            comentario: textarea ? textarea.value : "",
            botaoTexto: botaoStatus ? botaoStatus.textContent : ""
        };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

export function restaurarEstadoDemandas() {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    let alterado = false;

    for (const id in dados) {
        const demanda = document.getElementById(id);
        if (!demanda) {
            // Se o elemento não existe mais, remove do storage
            delete dados[id];
            alterado = true;
            continue;
        }

        const { statusClasse, responsavel, situacao, comentario, botaoTexto } = dados[id];
        const statusEl = demanda.querySelector("#statusDemanda");
        const responsavelInput = demanda.querySelector("#responsavel");
        const situacaoInput = demanda.querySelector("#situacao");
        const textarea = demanda.querySelector("#comentario");
        const botaoStatus = demanda.querySelector("#mudarStatus");

        if (statusEl && statusClasse) {
            statusEl.className = `cStatusItemLateral ${statusClasse}`;
        }
        if (responsavelInput) {
            responsavelInput.value = responsavel;
        }
        if (situacaoInput) {
            situacaoInput.value = situacao;
        }
        if (textarea) {
            textarea.value = comentario;
        }
        if (botaoStatus) {
            botaoStatus.textContent = botaoTexto;
        }
    }

    if (alterado) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    }
}

export function adicionarListenersDemandas() {
    document.querySelectorAll(".rectangleDemanda").forEach(demanda => {
        const responsavelInput = demanda.querySelector("#responsavel");
        const situacaoInput = demanda.querySelector("#situacao");
        const textarea = demanda.querySelector("#comentario");
        const botaoStatus = demanda.querySelector("#mudarStatus");
        const statusEl = demanda.querySelector("#statusDemanda");

        if (responsavelInput) {
            responsavelInput.addEventListener("input", salvarEstadoDemandas);
        }
        if (situacaoInput) {
            situacaoInput.addEventListener("input", salvarEstadoDemandas);
        }
        if (textarea) {
            textarea.addEventListener("input", salvarEstadoDemandas);
        }
        if (botaoStatus) {
            botaoStatus.addEventListener("click", salvarEstadoDemandas);
        }
        if (statusEl) {
            const observer = new MutationObserver(salvarEstadoDemandas);
            observer.observe(statusEl, { attributes: true, attributeFilter: ["class"] });
        }
    });
}

var maquinas = ''
var lista = ''
botaoOrdenarTelaDemandas.addEventListener("click", () => {
    botaoOrdenarTelaDemandasTexto.classList.toggle('addDemandaAtivada')
    document.querySelector('.telaDemandasContainerFundo').classList.add('invisible1')
    setTimeout(()=> {
        if (botaoOrdenarTelaDemandasTexto.classList.contains('addDemandaAtivada')) {
                lista = document.getElementById("listaDemandas");
                maquinas = Array.from(lista.children); // salva a ordem original

                // Ordenar -> "livre" no topo
                const livres = [];
                const ocupados = [];
                const desativados = [];
                
                maquinas.forEach(maquina => {
                    const status = maquina.querySelector(".cStatusItemLateral");
                    if (status && status.classList.contains("alta")) {
                    livres.push(maquina);
                    } 
                    else if (status && status.classList.contains("media")) {
                        ocupados.push(maquina);
                    }
                    else {
                        desativados.push(maquina);
                    }
                });

                // limpa e remonta a lista
                lista.innerHTML = "";
                [...livres, ...ocupados, ...desativados].forEach(m => lista.appendChild(m));
            } 
            else {
                // Voltar à ordem original
                lista.innerHTML = "";
                maquinas.forEach(m => lista.appendChild(m));
            }
    }, 300);
    setTimeout(()=> {
        document.querySelector('.telaDemandasContainerFundo').classList.remove('invisible1')
    }, 600);
});
botaoFixarTelaDemandas.addEventListener('click', ()=> {
    botaoFixarTelaDemandasTexto.classList.toggle('active')
    if (!document.querySelector('body').classList.contains('mfDemandas')) {
        document.querySelector('body').classList.add('mfDemandas');
    }
    else {
        document.querySelector('body').classList.remove('mfDemandas'); 
    }

    if (document.querySelector('body').classList.contains('mfDemandas') && document.querySelector('body').classList.contains('mfMaquinas')) {
        document.querySelector('body').classList.remove('mini'); 
        document.querySelector('body').classList.add('extraMini'); 
    }
    else if (!document.querySelector('body').classList.contains('mfDemandas') && !document.querySelector('body').classList.contains('mfMaquinas')) {
        document.querySelector('body').classList.remove('extraMini'); 
        document.querySelector('body').classList.remove('mini'); 
    }
    else {
        document.querySelector('body').classList.remove('extraMini'); 
        document.querySelector('body').classList.add('mini'); 
    }
    
    document.getElementById('fecharDemandas').classList.toggle('invisible2');
    document.getElementById('demandas').classList.toggle('invisible2');
})
// ouvinte para os cliques nos cartões
document.addEventListener('click', (event) => {
    // Verifica se o elemento clicado ou algum de seus pais possui a classe 'rectangle'
    let target = event.target;
    const divMae = target.closest('.rectangleDemanda');

    if (divMae) {
        if (target.id == 'mudarStatus') {
            var statusDaMaquina = divMae.querySelector('#statusDemanda');
            if (statusDaMaquina.classList.contains('alta')) {
                    statusDaMaquina.classList.remove('alta', 'media')
                    statusDaMaquina.classList.add('baixa')
                    target.innerHTML = 'Prioridade baixa'
                }
                else if (statusDaMaquina.classList.contains('baixa')) {
                    statusDaMaquina.classList.remove('baixa', 'alta')
                    statusDaMaquina.classList.add('media')
                    target.innerHTML = 'Prioridade média'
                }
                else {
                    statusDaMaquina.classList.remove('media', 'baixa')
                    statusDaMaquina.classList.add('alta')
                    target.innerHTML = 'Prioridade alta'
                }
        }

        if (target.id == 'buscarMaquina') {
            const idMaquina = divMae.id
            procurarCard({key: 'Enter'}, idMaquina);

            var screenWidth = window.innerWidth;
            if (screenWidth < 916) {
                fecharTelaDeDemandas();
            }
        }

        if (target.id == 'deletarDemanda') {
            const modal = document.getElementById("modalConfirmacao");
            const modalContent = document.querySelector(".modalConfirmaContent");
            modal.classList.remove("invisible2");
            modalContent.classList.remove("invisible");

            const btnConfirmar = document.getElementById("btnConfirmar");
            const btnCancelar = document.getElementById("btnCancelar");

            btnConfirmar.onclick = () => {
                modal.classList.add("invisible2");
                setTimeout(()=> {
                    modalContent.classList.add("invisible");
                }, 300);
                
                divMae.classList.add('invisible7')
                setTimeout(()=> {
                    const container = document.querySelector(".telaDemandasContainer");
                    container.removeChild(divMae);
                }, 300);
            }
            btnCancelar.onclick = () => {
                modal.classList.add("invisible2");
                setTimeout(()=> {
                    modalContent.classList.add("invisible");
                }, 300);
            };
        }
    }
});
addDemanda.addEventListener('click' , () => {
    addDemandaTexto.classList.toggle('addDemandaAtivada')
    barraAddDemanda.classList.toggle('invisible6')
    barraPesquisaDemanda.classList.toggle('invisible6')
    if (!barraAddDemanda.classList.contains('invisible6')) {
        novaDemanda.focus()
    }
})
// limpa busca card
limpaInputPesquisaDemanda.addEventListener('click', ()=> {
    if (!canClickLimpaBusca) return;

    pesquisaDemanda.value = ''
    exibeDemandas()
})
pesquisaDemanda.addEventListener('keydown', (event) => {
    if (!canClickLimpaBusca) return;

    pesquisaDemanda.classList.remove('naoEncontrado');
    if (event.key === 'Enter') {
        exibeDemandaPesquisada(true, '')
    }
    if (event.key === 'Backspace') {
        exibeDemandas()
    }
});
pesquisaDemanda.addEventListener('focus', (event) => {
    menuLateral.classList.add('menuLateralSuperExpandido');
    document.querySelector('.telaDemandasContainerFundo').classList.add('invisibleMobile');
});
pesquisaDemanda.addEventListener('blur', (event) => {
    menuLateral.classList.remove('menuLateralSuperExpandido');
    document.querySelector('.telaDemandasContainerFundo').classList.remove('invisibleMobile');
});
limpaInputAddDemanda.addEventListener('click', ()=> {
    if (!canClickLimpaBusca) return;

    novaDemanda.value = ''
    exibeDemandas()
})
// adiciona o evento de escutar a tecla na barra de busca dos cards
novaDemanda.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const nomeNovaMaquina = novaDemanda.value;

        adicionarDemandaNoInicio(nomeNovaMaquina, 'Livre', 'livre', '', true);
    }
    if (event.key === 'Backspace') {
        exibeDemandas()
    }
});
novaDemanda.addEventListener('focus', (event) => {
    menuLateral.classList.add('menuLateralSuperExpandido');
    document.querySelector('.telaDemandasContainerFundo').classList.add('invisibleMobile');
});
novaDemanda.addEventListener('blur', (event) => {
    menuLateral.classList.remove('menuLateralSuperExpandido');
    document.querySelector('.telaDemandasContainerFundo').classList.remove('invisibleMobile');
});
