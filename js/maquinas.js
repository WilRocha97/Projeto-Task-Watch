import {procurarCard} from './cards.js';
import {isTouchDevice} from './main.js';
import {fecharTelaDeMaquinas} from './menu.js';

let canClickLimpaBusca = true;

const botaoOrdenarTelaMaquinas = document.getElementById("ordenarMaquinas");
const botaoOrdenarTelaMaquinasTexto = botaoOrdenarTelaMaquinas.querySelector('.MenuBotaoActive');

const botaoFixarTelaMaquinas = document.getElementById('fixarTelaMaquinas');
const botaoFixarTelaMaquinasTexto = botaoFixarTelaMaquinas.querySelector('.MenuBotaoActive');

const addMaquina = document.getElementById('addMaquina');
const addMaquinaTexto = addMaquina.querySelector('.MenuBotaoActive');

const novaMaquina = document.getElementById('inputAddMaquina');
const pesquisaMaquina = document.getElementById('inputPesquisaMaquina');
const menuLateral = document.querySelector('.menuLateralMaquinas');
const barraAddMaquina = document.getElementById('barraAddMaquina');
const barraPesquisaMaquina = document.getElementById('barraPesquisaMaquina');
const limpaInputPesquisaMaquina = document.getElementById('limpaInputPesquisaMaquina');
const limpaInputAddMaquina = document.getElementById('limpaInputAddMaquina');
const STORAGE_KEY = "estadoMaquinas";

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Tags ────────────────────────────────────────────────────────────────────

function renderizarTags(tagLista, tags) {
    tagLista.innerHTML = '';
    tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tagItem fundo';
        span.innerHTML = `${tag}<button class="removeTag BotaoFechar" data-tag="${tag}" title="Remover tag">×</button>`;
        tagLista.appendChild(span);
    });
}

function lerTagsDaMaquina(maquina) {
    return Array.from(maquina.querySelectorAll('.tagItem'))
        .map(t => t.childNodes[0].textContent.trim())
        .filter(Boolean);
}

// ─── Exibição ─────────────────────────────────────────────────────────────────

async function exibeMaquinas() {
    canClickLimpaBusca = false;

    const maquinasNaLista = document.querySelectorAll('.rectangleMaquina');
    for (const maquinaNaLista of maquinasNaLista) {
        maquinaNaLista.classList.remove('invisible7');
        await esperar(20);
    }

    canClickLimpaBusca = true;
}

async function exibeMaquinaPesquisada(pesquisa, nomeDaMaquina) {
    const nomeNovaMaquina = nomeDaMaquina !== '' ? nomeDaMaquina : pesquisaMaquina.value;
    const maquinasNaLista = document.querySelectorAll('.rectangleMaquina');

    let resultado = false;
    const maquinasInvertidas = Array.from(maquinasNaLista).reverse();

    for (const maquinaNaLista of maquinasInvertidas) {
        if (!maquinaNaLista.id.includes(nomeNovaMaquina)) {
            maquinaNaLista.classList.add('invisible7');
        } else {
            maquinaNaLista.classList.remove('invisible7');
            resultado = true;
        }
        await esperar(20);
    }

    if (!resultado && pesquisa) {
        pesquisaMaquina.classList.add('naoEncontrado');
    }
}

// ─── Criação ──────────────────────────────────────────────────────────────────

function adicionarMaquinaNoInicio(idMaquina, tags = []) {
    const container = document.querySelector("#listaMaquinas");
    if (!container) return;

    const maquinasNaLista = document.querySelectorAll('.rectangleMaquina');
    for (const maquinaNaLista of maquinasNaLista) {
        if (maquinaNaLista.id === idMaquina) {
            exibeMaquinaPesquisada(false, idMaquina);
            return;
        }
    }

    const novaDiv = document.createElement("div");
    novaDiv.id = idMaquina;
    novaDiv.className = "rectangleMaquina invisible7";
    novaDiv.innerHTML = `
        <div class="tituloContainerItemLateral">
            <div class="tituloItemLateral">${idMaquina}</div>
            <div class="menuTelaBotoes">
                <button id="mudarStatus" class="cmb MenuBotao cMudarStatus" title="Mudar status">Livre</button>
                <div id="buscarMaquina" class="cmb botaoFixar botaoItemMenuLateral" title="Buscar máquina">❯</div>
                <div id="deletarMaquina" class="cmb botaoFechar botaoItemMenuLateral" title="Deletar dispositivo">⨉</div>
            </div>
        </div>

        <div class="tagsContainer">
            <div class="tagLista"></div>
            <div class="tagInputWrapper">
                <input
                    type="text"
                    class="inputTag"
                    placeholder="Adicionar tag"
                    maxlength="30"
                />
            </div>
        </div>

        <textarea type="text" class="inputComentario scroll scrollInfo mediaTelaMensagemItemLateral"
            placeholder="Adicionar comentário"
            title="Adicionar comentário"></textarea>
        <span id="statusMaquina" class="cStatusItemLateral livre"></span>
    `;

    container.insertBefore(novaDiv, container.firstChild);
    document.getElementById(idMaquina).scrollIntoView({ behavior: "smooth", block: "start" });

    // Renderiza tags iniciais (caso restauradas do storage)
    renderizarTags(novaDiv.querySelector('.tagLista'), tags);

    novaMaquina.value = '';
    setTimeout(() => {
        const el = document.getElementById(idMaquina);
        if (el) {
            el.classList.remove('invisible7');
            if (isTouchDevice()) el.classList.add('nh');
        }
        adicionarListenersMaquinas(idMaquina);
    }, 100);
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export function salvarEstadoMaquinas() {
    const estado = {};

    document.querySelectorAll(".rectangleMaquina").forEach(maquina => {
        const id = maquina.id;
        const statusEl   = maquina.querySelector("#statusMaquina");
        const textarea   = maquina.querySelector("textarea");
        const botaoStatus = maquina.querySelector("#mudarStatus");

        estado[id] = {
            statusClasse: statusEl    ? statusEl.classList[1] || ""    : "",
            comentario:   textarea    ? textarea.value                 : "",
            botaoTexto:   botaoStatus ? botaoStatus.textContent        : "",
            tags:         lerTagsDaMaquina(maquina)                     // ← novo
        };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

export function restaurarEstadoMaquinas() {
    const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    let alterado = false;

    for (const id in dados) {
        const maquina = document.getElementById(id);
        if (!maquina) {
            delete dados[id];
            alterado = true;
            continue;
        }

        const { statusClasse, comentario, botaoTexto, tags = [] } = dados[id];

        const statusEl    = maquina.querySelector("#statusMaquina");
        const textarea    = maquina.querySelector("textarea");
        const botaoStatus = maquina.querySelector("#mudarStatus");
        const tagLista    = maquina.querySelector(".tagLista");

        if (statusEl && statusClasse)  statusEl.className = `cStatusItemLateral ${statusClasse}`;
        if (textarea)                  textarea.value = comentario;
        if (botaoStatus)               botaoStatus.textContent = botaoTexto;
        if (tagLista)                  renderizarTags(tagLista, tags);   // ← novo
    }

    if (alterado) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    }
}

// ─── Listeners ────────────────────────────────────────────────────────────────

export function adicionarListenersMaquinas(idAlvo = '') {
    const seletor = idAlvo ? `#${idAlvo}` : '.rectangleMaquina';

    document.querySelectorAll(seletor).forEach(maquina => {
        const textarea    = maquina.querySelector("textarea");
        const botaoStatus = maquina.querySelector("#mudarStatus");
        const statusEl    = maquina.querySelector("#statusMaquina");
        const tagLista    = maquina.querySelector('.tagLista');
        const inputTag    = maquina.querySelector('.inputTag');
        const btnAdd      = maquina.querySelector('.btnAdicionarTag');

        // Listeners existentes
        if (textarea) {
            textarea.addEventListener("blur",  () => salvarEstadoMaquinas());
            textarea.addEventListener("input", () => salvarEstadoMaquinas());
        }
        if (botaoStatus) {
            botaoStatus.addEventListener("click", () => salvarEstadoMaquinas());
        }
        if (statusEl) {
            const observer = new MutationObserver(salvarEstadoMaquinas);
            observer.observe(statusEl, { attributes: true, attributeFilter: ["class"] });
        }

        // ── Listeners de tags ──────────────────────────────────────────────

        function adicionarTag() {
            const valor = inputTag.value.trim();
            if (!valor) return;

            // Bloqueia duplicata
            const jaExiste = lerTagsDaMaquina(maquina).includes(valor);
            if (jaExiste) {
                inputTag.classList.add('tagDuplicada');
                setTimeout(() => inputTag.classList.remove('tagDuplicada'), 800);
                return;
            }

            const span = document.createElement('span');
            span.className = 'tagItem fundo';
            span.innerHTML = `${valor}<button class="removeTag BotaoFechar" data-tag="${valor}" title="Remover tag">×</button>`;
            tagLista.appendChild(span);
            inputTag.value = '';
            salvarEstadoMaquinas();
        }

        if (btnAdd) {
            btnAdd.addEventListener('click', adicionarTag);
        }

        if (inputTag) {
            inputTag.addEventListener('keydown', (e) => {
                // Impede que Enter propague para o listener global de novaMaquina
                e.stopPropagation();
                if (e.key === 'Enter') { e.preventDefault(); adicionarTag(); }
            });
        }

        // Remoção via delegação na tagLista
        if (tagLista) {
            tagLista.addEventListener('click', (e) => {
                if (e.target.classList.contains('removeTag')) {
                    e.target.closest('.tagItem').remove();
                    salvarEstadoMaquinas();
                }
            });
        }
    });
}

// ─── Ordenar ──────────────────────────────────────────────────────────────────

var maquinas = '';
var lista = '';

botaoOrdenarTelaMaquinas.addEventListener("click", () => {
    botaoOrdenarTelaMaquinasTexto.classList.toggle('addMaquinaAtivada');
    document.querySelector('.telaMaquinasContainerFundo').classList.add('invisible1');

    setTimeout(() => {
        if (botaoOrdenarTelaMaquinasTexto.classList.contains('addMaquinaAtivada')) {
            lista = document.getElementById("listaMaquinas");
            maquinas = Array.from(lista.children);

            const livres = [], ocupados = [], desativados = [];
            maquinas.forEach(maquina => {
                const status = maquina.querySelector(".cStatusItemLateral");
                if (status && status.classList.contains("livre"))         livres.push(maquina);
                else if (status && status.classList.contains("ocupado"))  ocupados.push(maquina);
                else                                                       desativados.push(maquina);
            });

            lista.innerHTML = "";
            [...livres, ...ocupados, ...desativados].forEach(m => lista.appendChild(m));
        } else {
            lista.innerHTML = "";
            maquinas.forEach(m => lista.appendChild(m));
        }
    }, 300);

    setTimeout(() => {
        document.querySelector('.telaMaquinasContainerFundo').classList.remove('invisible1');
    }, 600);
});

// ─── Fixar ────────────────────────────────────────────────────────────────────

botaoFixarTelaMaquinas.addEventListener('click', () => {
    botaoFixarTelaMaquinasTexto.classList.toggle('active');
    document.querySelector('body').classList.toggle('mfMaquinas');
    document.querySelector('body').classList.toggle('mini');
    document.getElementById('fecharMaquinas').classList.toggle('invisible2');
    document.getElementById('maquinas').classList.toggle('invisible2');
});

// ─── Cliques nas máquinas ─────────────────────────────────────────────────────

document.addEventListener('click', (event) => {
    let target = event.target;
    const divMae = target.closest('.rectangleMaquina');
    if (!divMae) return;

    if (target.id === 'mudarStatus') {
        const statusDaMaquina = divMae.querySelector('#statusMaquina');
        const elementos = Array.from(document.getElementById('layoutTela').querySelectorAll('[id]'))
            .filter(el => el.id.includes(divMae.id));

        if (elementos.length > 0) {
            statusDaMaquina.classList.remove('livre', 'desativado');
            statusDaMaquina.classList.add('ocupado');
            target.innerHTML = 'Ocupado';
        } else {
            if (statusDaMaquina.classList.contains('desativado')) {
                statusDaMaquina.classList.replace('desativado', 'livre');
                target.innerHTML = 'Livre';
            } else if (statusDaMaquina.classList.contains('livre')) {
                statusDaMaquina.classList.replace('livre', 'ocupado');
                target.innerHTML = 'Ocupado';
            } else {
                statusDaMaquina.classList.replace('ocupado', 'desativado');
                target.innerHTML = 'Desativado';
            }
        }
    }

    if (target.id === 'buscarMaquina') {
        procurarCard({ key: 'Enter' }, divMae.id);
        if (window.innerWidth < 916) fecharTelaDeMaquinas();
    }

    if (target.id === 'deletarMaquina') {
        const modal = document.getElementById("modalConfirmacao");
        modal.innerHTML = `
            <div class="fundoCabecalho"></div>
            <div class="fundo modalConfirmaContent invisible">
                <p class="paragrafo">Tem certeza que deseja excluir esse dispositivo da lista?</p>
                <button id="btnConfirmar" class="cmb MenuBotaoInterno">Sim</button>
                <button id="btnCancelar" class="cmb MenuBotaoInterno">Cancelar</button>
            </div>`;

        const modalContent = document.querySelector(".modalConfirmaContent");
        modal.classList.remove("invisible0");
        modalContent.classList.remove("invisible");

        document.getElementById("btnConfirmar").onclick = () => {
            modal.classList.add("invisible0");
            setTimeout(() => modalContent.classList.add("invisible"), 300);
            divMae.classList.add('invisible7');
            setTimeout(() => {
                document.querySelector(".telaMaquinasContainer").removeChild(divMae);
                salvarEstadoMaquinas();   // persiste remoção no storage
            }, 300);
        };

        document.getElementById("btnCancelar").onclick = () => {
            modal.classList.add("invisible0");
            setTimeout(() => modalContent.classList.add("invisible"), 300);
        };
    }
});

// ─── Barra add / pesquisa ─────────────────────────────────────────────────────

addMaquina.addEventListener('click', () => {
    addMaquinaTexto.classList.toggle('addMaquinaAtivada');
    barraAddMaquina.classList.toggle('invisible5');
    barraPesquisaMaquina.classList.toggle('invisible5');
    if (!barraAddMaquina.classList.contains('invisible5')) novaMaquina.focus();
});

limpaInputPesquisaMaquina.addEventListener('click', () => {
    if (!canClickLimpaBusca) return;
    pesquisaMaquina.value = '';
    exibeMaquinas();
});

pesquisaMaquina.addEventListener('keydown', (event) => {
    if (!canClickLimpaBusca) return;
    pesquisaMaquina.classList.remove('naoEncontrado');
    if (event.key === 'Enter')     exibeMaquinaPesquisada(true, '');
    if (event.key === 'Backspace') exibeMaquinas();
});

pesquisaMaquina.addEventListener('focus', () => {
    menuLateral.classList.add('menuLateralSuperExpandido');
    document.querySelector('.telaMaquinasContainerFundo').classList.add('invisibleMobile');
});

pesquisaMaquina.addEventListener('blur', () => {
    menuLateral.classList.remove('menuLateralSuperExpandido');
    document.querySelector('.telaMaquinasContainerFundo').classList.remove('invisibleMobile');
});

limpaInputAddMaquina.addEventListener('click', () => {
    if (!canClickLimpaBusca) return;
    novaMaquina.value = '';
    exibeMaquinas();
});

novaMaquina.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') adicionarMaquinaNoInicio(novaMaquina.value);
    if (event.key === 'Backspace') exibeMaquinas();
});

novaMaquina.addEventListener('focus', () => {
    menuLateral.classList.add('menuLateralSuperExpandido');
    document.querySelector('.telaMaquinasContainerFundo').classList.add('invisibleMobile');
});

novaMaquina.addEventListener('blur', () => {
    menuLateral.classList.remove('menuLateralSuperExpandido');
    document.querySelector('.telaMaquinasContainerFundo').classList.remove('invisibleMobile');
});

// ─── Monitor de status (intervalo) ───────────────────────────────────────────

setInterval(() => {
    if (document.querySelector('.telaLateral').classList.contains('invisible5')) return;

    const qtdLivre      = document.querySelectorAll('.livre').length;
    const qtdOcupado    = document.querySelectorAll('.ocupado').length;
    const qtdDesativado = document.querySelectorAll('.desativado').length;

    document.getElementById('monitorLivres').innerHTML      = qtdLivre;
    document.getElementById('monitorEmUso').innerHTML       = qtdOcupado;
    document.getElementById('monitorDesativados').innerHTML = qtdDesativado;

    document.getElementById('monitorLivresTexto').innerHTML      = qtdLivre      === 1 ? 'Livre'      : 'Livres';
    document.getElementById('monitorEmUsoTexto').innerHTML       = qtdOcupado    === 1 ? 'Ocupado'    : 'Ocupados';
    document.getElementById('monitorDesativadosTexto').innerHTML = qtdDesativado === 1 ? 'Desativado' : 'Desativados';
}, 2000);