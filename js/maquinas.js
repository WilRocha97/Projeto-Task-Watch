import {procurarCard} from './cards.js';
import {isTouchDevice} from './main.js';

const fundoCabecalho = document.getElementById('cabecalho');

const botaoFixarTelaMaquinas = document.getElementById('fixarTelaMaquinas');
const addMaquina = document.getElementById('adMaquina');
const novaMaquina = document.getElementById('inputAddMaquina');
const pesquisaMaquina = document.getElementById('inputPesquisaMaquina');
const menuMaquinas = document.querySelector('.menuMaquinas');
const barraAddMaquina = document.getElementById('barraAddMaquina');
const barraPesquisaMaquina = document.getElementById('barraPesquisaMaquina');
const limpaInputPesquisaMaquina = document.getElementById('limpaInputPesquisaMaquina');
const limpaInputAddMaquina = document.getElementById('limpaInputAddMaquina');
const STORAGE_KEY = "estadoMaquinas";

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function exibeMaquinas() {
    const maquinasNaLista = document.querySelectorAll('.rectangleMaquinas');
    for (const maquinaNaLista of maquinasNaLista) {
        maquinaNaLista.querySelector('.cStatusMaquina').classList.remove('pulse')
        maquinaNaLista.classList.remove('invisible7')
        await esperar(10);
    }
}

async function exibeMaquinaPesquisada(pesquisa, nomeDaMaquina) {
    var nomeNovaMaquina = ''
    if (nomeDaMaquina != '') {
        nomeNovaMaquina = nomeDaMaquina
    }
    else {
        nomeNovaMaquina = pesquisaMaquina.value;
    } 
    const maquinasNaLista = document.querySelectorAll('.rectangleMaquinas');

    // Verificar se o id contém a frase pesquisada
    var resultado = false;

    // Converte para array e inverte
    const maquinasInvertidas = Array.from(maquinasNaLista).reverse();
    for (const maquinaNaLista of maquinasInvertidas) {
        if (!maquinaNaLista.id.includes(nomeNovaMaquina)) {
            maquinaNaLista.classList.add('invisible7')
        }
        else {
            resultado = true
        }
        await esperar(10);
    };
    // aplica estilo de destaque aos cards
    if (!resultado) {
        if (pesquisa) {
            pesquisaMaquina.classList.add('naoEncontrado');
        }
    }
}

function adicionarMaquinaNoInicio(idMaquina) {
    // Pega o container
    const container = document.querySelector("#listaMaquinas");
    if (!container) return;

    // Verificar se o id contém a frase pesquisada
    const maquinasNaLista = document.querySelectorAll('.rectangleMaquinas');
    for (const maquinaNaLista of maquinasNaLista) {
        // console.log(card.id.includes)
        if (maquinaNaLista.id === idMaquina) {
            exibeMaquinaPesquisada(false, idMaquina)
            return;
        }
    };

    // Cria a nova div
    const novaDiv = document.createElement("div");
    novaDiv.id = idMaquina;
    novaDiv.className = "rectangleMaquinas invisible7";
    novaDiv.innerHTML = `
        <div class="tituloContainerMaquina">
            <div class="tituloMaquinas">${idMaquina}</div>
            <div class="menuTelaBotoes">
                <button id="mudarStatus" class="cmb MenuBotao cMudarStatus" title="Mudar status">Livre</button>
                <div id="buscarMaquina" class="cmb botaoFixar botaoMaquina" title="Buscar máquina">❯</div>
                <div id="deletarMaquina" class="btnCard botaoFechar botaoMaquina" title="Deletar dispositivo">⨉</div>
            </div>
        </div>
        <textarea type="text" class="inputComentario scroll telaMensagemMaquinas"
            placeholder="Adicionar comentário" 
            title="Adicionar comentário"></textarea>
        <span id="statusMaquina" class="cStatusMaquina livre"></span>
    `;

    // Insere no índice 0 (antes do primeiro filho)
    container.insertBefore(novaDiv, container.firstChild);
    document.getElementById(idMaquina).scrollIntoView({ behavior: "smooth", block: "start" });

    novaMaquina.value= '';
    setTimeout(()=> {
        document.getElementById(idMaquina).classList.remove('invisible7')
        if (isTouchDevice()) {
            document.getElementById(idMaquina).classList.add('nh')
        }
    }, 100);
}

export function fecharTelaDeMaquinas() {
    if (!document.getElementById('layoutTela').classList.contains('mf')) {
        if (!barraAddMaquina.classList.contains('invisible6')) {
            barraAddMaquina.classList.add('invisible6');
            barraPesquisaMaquina.classList.remove('invisible6');
            addMaquina.classList.toggle('addMaquinaAtivada');
        }
        pesquisaMaquina.value = ''
        telaMaquinas.classList.add('invisible5');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido');
    }
}

export function salvarEstado() {
    const estado = {};
    document.querySelectorAll(".rectangleMaquinas").forEach(maquina => {
        const id = maquina.id;
        const statusEl = maquina.querySelector("#statusMaquina");
        const textarea = maquina.querySelector("textarea");
        const botaoStatus = maquina.querySelector("#mudarStatus");

        estado[id] = {
            statusClasse: statusEl ? statusEl.classList[1] || "" : "",
            comentario: textarea ? textarea.value : "",
            botaoTexto: botaoStatus ? botaoStatus.textContent : ""
        };
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

export function restaurarEstado() {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    let alterado = false;

    for (const id in dados) {
        const maquina = document.getElementById(id);
        if (!maquina) {
            // Se o elemento não existe mais, remove do storage
            delete dados[id];
            alterado = true;
            continue;
        }

        const { statusClasse, comentario, botaoTexto } = dados[id];
        const statusEl = maquina.querySelector("#statusMaquina");
        const textarea = maquina.querySelector("textarea");
        const botaoStatus = maquina.querySelector("#mudarStatus");

        if (statusEl && statusClasse) {
            statusEl.className = `cStatusMaquina ${statusClasse}`;
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

export function adicionarListeners() {
    document.querySelectorAll(".rectangleMaquinas").forEach(maquina => {
        const textarea = maquina.querySelector("textarea");
        const botaoStatus = maquina.querySelector("#mudarStatus");
        const statusEl = maquina.querySelector("#statusMaquina");

        if (textarea) {
            textarea.addEventListener("input", salvarEstado);
        }
        if (botaoStatus) {
            botaoStatus.addEventListener("click", salvarEstado);
        }
        if (statusEl) {
            const observer = new MutationObserver(salvarEstado);
            observer.observe(statusEl, { attributes: true, attributeFilter: ["class"] });
        }
    });
}

botaoFixarTelaMaquinas.addEventListener('click', ()=> {
    botaoFixarTelaMaquinas.classList.toggle('active')
    document.getElementById('cabecalho').classList.toggle('mf');
    document.getElementById('layoutTela').classList.toggle('mf');
    document.querySelector('.rodape').classList.toggle('mf');

    document.getElementById('fecharMaquinas').classList.toggle('invisible2');
    document.getElementById('maquinas').classList.toggle('invisible2');

})
// ouvinte para os cliques nos cartões
document.addEventListener('click', (event) => {
    // Verifica se o elemento clicado ou algum de seus pais possui a classe 'rectangle'
    let target = event.target;
    const divMae = target.closest('.rectangleMaquinas');

    if (divMae) {
        divMae.querySelector('.cStatusMaquina').classList.remove('pulse');
        divMae.classList.remove('pulse');

        if (target.id == 'mudarStatus') {
            var statusDaMaquina = divMae.querySelector('#statusMaquina');
            // Procura todos os elementos que tenham no ID a id da maquina
            const elementos = Array.from(document.getElementById('layoutTela').querySelectorAll('[id]')).filter(el => el.id.includes(divMae.id));
            // Se não encontrar nenhum card com a id da máquina, muda o status pra livre
            if (elementos.length > 0) {
                statusDaMaquina.classList.remove('livre')
                statusDaMaquina.classList.add('ocupado')
                target.innerHTML = 'Ocupado'
            }
            else {
                if (statusDaMaquina.classList.contains('ocupado')) {
                    statusDaMaquina.classList.remove('ocupado')
                    statusDaMaquina.classList.add('livre')
                    target.innerHTML = 'Livre'
                }
                else {
                    statusDaMaquina.classList.remove('livre')
                    statusDaMaquina.classList.add('ocupado')
                    target.innerHTML = 'Ocupado'
                }
            }
        }

        if (target.id == 'buscarMaquina') {
            const idMaquina = divMae.id
            procurarCard({key: 'Enter'}, idMaquina);

            var screenWidth = window.innerWidth;
            if (screenWidth < 916) {
                fecharTelaDeMaquinas();
            }
        }

        if (target.id == 'deletarMaquina') {
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
                    const container = document.querySelector(".maquinasContainer");
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
addMaquina.addEventListener('click' , () => {
    addMaquina.classList.toggle('addMaquinaAtivada')
    barraAddMaquina.classList.toggle('invisible6')
    barraPesquisaMaquina.classList.toggle('invisible6')
    if (!barraAddMaquina.classList.contains('invisible6')) {
        novaMaquina.focus()
    }
})

// limpa busca card
limpaInputPesquisaMaquina.addEventListener('click', ()=> {
    pesquisaMaquina.value = ''
    exibeMaquinas()
})
pesquisaMaquina.addEventListener('keydown', (event) => {
    pesquisaMaquina.classList.remove('naoEncontrado');
    if (event.key === 'Enter') {
        exibeMaquinaPesquisada(true, '')
    }
    if (event.key === 'Backspace') {
        exibeMaquinas()
    }
});
pesquisaMaquina.addEventListener('focus', (event) => {
    menuMaquinas.classList.add('menuMaquinasSuperExpandido');
    document.querySelector('.maquinasContainerFundo').classList.add('invisibleMobile');
});
pesquisaMaquina.addEventListener('blur', (event) => {
    menuMaquinas.classList.remove('menuMaquinasSuperExpandido');
    document.querySelector('.maquinasContainerFundo').classList.remove('invisibleMobile');
});

limpaInputAddMaquina.addEventListener('click', ()=> {
    novaMaquina.value = ''
    exibeMaquinas()
})
// adiciona o evento de escutar a tecla na barra de busca dos cards
novaMaquina.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const nomeNovaMaquina = novaMaquina.value;

        adicionarMaquinaNoInicio(nomeNovaMaquina, 'Livre', 'livre', '', true);
    }
    if (event.key === 'Backspace') {
        exibeMaquinas()
    }
});
novaMaquina.addEventListener('focus', (event) => {
    menuMaquinas.classList.add('menuMaquinasSuperExpandido');
    document.querySelector('.maquinasContainerFundo').classList.add('invisibleMobile');
});
novaMaquina.addEventListener('blur', (event) => {
    menuMaquinas.classList.remove('menuMaquinasSuperExpandido');
    document.querySelector('.maquinasContainerFundo').classList.remove('invisibleMobile');
});
