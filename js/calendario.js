import {updateClock} from './relogio.js';
import {marcarFeriados} from './feriados.js';
import {animacaoBotao} from './menu.js';
import {
    apiListarEventos, apiCriarEvento, apiAtualizarEvento, apiExcluirEvento,
    apiAtualizarStatus, apiDashboard, exportarLocal, _semearEventosDemo, _resetarStatusEventosDemo
} from './rotinas-storage.js';

const fundoAuxiliar = document.querySelector('.fundoAuxiliar')
const telaDica = document.getElementById('telaDica');
const fundoCabecalho = document.getElementById('cabecalho');
var cInputRotina = document.getElementById('searchInputRotina');
const limpaCInputRotina = document.getElementById('limpaCInputRotina');
const carregandoExportacao = document.getElementById('carregandoExportacao');
const botaoExportarCalendario = document.getElementById('exportarCalendario');
var botoes = document.querySelectorAll('button');

let qualLado = 'Para esquerda'

// ---------- helpers de data (sempre horário local do usuário) ----------
const pad = n => String(n).padStart(2, "0");

// Data/hora atual do dispositivo, lida no momento do uso (nunca guardada em global)
function agora() {
    return new Date();
}

// Primeiro dia do mês de uma data. Manter o dia 1 evita o estouro do setMonth
// (ex.: 31/08 + 1 mês viraria 31/09 -> 01/10)
function inicioDoMes(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

// "YYYY-MM-DD HH:MM:SS" ou "YYYY-MM-DDTHH:MM" interpretado como horário LOCAL.
// Sem isso o navegador pode tratar o formato como UTC e o dia/mês escorrega.
function parseDataLocal(valor) {
    if (valor instanceof Date) return valor;
    const m = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (!m) return new Date(valor);
    return new Date(
        Number(m[1]),
        Number(m[2]) - 1,
        Number(m[3]),
        Number(m[4] || 0),
        Number(m[5] || 0),
        Number(m[6] || 0)
    );
}

// "YYYY-MM-DD" no horário local
function ymdLocal(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

let currentDate = inicioDoMes(agora()); // mês mostrado (sempre no dia 1)
let editingEvent = null;

function mudarMes(delta) {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1);
}

export function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}
if (isTouchDevice()) {
    botoes.forEach((botao)=> {
        botao.classList.add('nh')
    });
}

updateClock();
setInterval(updateClock, 1000);

function scrollLimit(container) {
    const pixelsPorLinha = 14;  // altura média de uma linha
    const linhasPorScroll = 3;  // quantas "linhas" você quer rolar

    container.addEventListener("wheel", (event) => {
    event.preventDefault();
    const scrollAmount = pixelsPorLinha * linhasPorScroll;
    container.scrollBy({
        top: event.deltaY > 0 ? scrollAmount : -scrollAmount,
        behavior: "smooth"
    });
    }, { passive: false });
}

// ---------- helpers ----------
async function verificaExecucaoAnterior() {
    try {
        const dash = await apiDashboard();
        const items = dash.em_execucao;

        // usa currentDate direto (fonte da verdade do mês exibido) em vez de ler o
        // texto de #month-label — esse texto só é atualizado quando a animação de
        // troca de mês termina (animationend), então lê-lo aqui era uma corrida
        const refAno = currentDate.getFullYear();
        const refMes = currentDate.getMonth();

        document.getElementById('avisoMesAnterior').classList.add('invisible0')
        document.getElementById('avisoMesSeguinte').classList.add('invisible0')

        for (const item of items) {
            if (item.repeticao != 'nenhuma') {
                // tudo em horário local: comparar data local com getUTC* jogava
                // eventos da noite (a partir das 21h em UTC-3) para o mês seguinte
                const d = parseDataLocal(item.data_inicio);
                const diff = (d.getFullYear() - refAno) * 12 + (d.getMonth() - refMes);
                if (diff < 0) {
                    document.getElementById('avisoMesAnterior').classList.remove('invisible0')
                }
                else if (diff > 0) {
                    document.getElementById('avisoMesSeguinte').classList.remove('invisible0')
                };
            }
        };
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

function formatDateLocal(valor) {
    const d = parseDataLocal(valor);
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateForDisplay(valor) {
    return parseDataLocal(valor).toLocaleString();
}

function atualizaCalendario() {
    fundoAuxiliar.classList.add('invisible0');
    document.getElementById('calendar').classList.add('collapsed')
    document.getElementById('containerEsporadicos').classList.add('collapsed')
    setTimeout(()=> {
        montarCalendario();
        montarCalendario(false, true);
        renderMonthLabel();
        setTimeout(()=> {
            document.getElementById('calendar').classList.remove('collapsed')
            document.getElementById('containerEsporadicos').classList.remove('collapsed')
            verificaExecucaoAnterior()
        }, 200)
    }, 500)
}

function abreModalEvento(dtStart) {
    fundoAuxiliar.classList.add('invisible0');
    editingEvent = null;
        document.getElementById("modalCalendarTitle").innerText = "Novo evento";
        document.getElementById("ev-titulo").value = "";
        document.getElementById("ev-descricao").value = "";
        document.getElementById("ev-tipo").value = "";
        document.getElementById("ev-data-inicio").value = formatDateLocal(dtStart);
        document.getElementById("ev-repeticao").value = "nenhuma";
        document.getElementById("delete-event").style.display = "none";
        document.getElementById("modalCalendar").classList.remove("hidden");
}

function expandeDia(botaoExpansao, cell) {
    if (botaoExpansao.classList.contains("expanded")) {
        cell.classList.add("collapsed");

        setTimeout(()=> {
            document.getElementById('placeholder').remove();
            cell.classList.remove("dayHi");
            fundoAuxiliar.classList.add('invisible0');
            botaoExpansao.classList.remove("expanded");

            cell.classList.remove("collapsed");
        }, 300)
    }
    else { 
        const celulas = document.querySelectorAll(".day");
        celulas.forEach(element => {
            element.classList.remove("dayHi");
            fundoAuxiliar.classList.add('invisible0');
        });

        cell.classList.add("collapsed");

        setTimeout(()=> {
            const rect = cell.getBoundingClientRect();

            const placeholder = document.createElement('div');
            placeholder.id = 'placeholder'
            placeholder.style.width = rect.width + 'px';
            placeholder.style.height = rect.height + 'px';
            placeholder.style.visibility = 'hidden';

            cell.parentNode.insertBefore(placeholder, cell);

            cell.classList.add("dayHi");
            fundoAuxiliar.classList.remove('invisible0');
            botaoExpansao.classList.add("expanded");

            cell.classList.remove("collapsed");
        }, 300)
    }
}

// ---------- calendar nav ----------
document.getElementById("prev-month").onclick = () => { 
    mudarMes(-1);
    qualLado = 'Para direita'
    atualizaCalendario()
}
document.getElementById("next-month").onclick = () => { 
    mudarMes(1);
    qualLado = 'Para esquerda'
    atualizaCalendario()
}
document.getElementById("clock").onclick = () => {
    currentDate = inicioDoMes(agora());     // volta ao mês atual
    qualLado = 'Para esquerda'
    atualizaCalendario()
};

function renderMonthLabel(){
    const opts = { month: "long", year: "numeric" };
    var mesAtual = currentDate.toLocaleDateString(undefined, opts)
    var labelMonth = document.getElementById("month-label")

    if (qualLado == 'Para esquerda') {
        labelMonth.classList.remove('anim-in-side-right');
        labelMonth.classList.remove('anim-in-side-left');
        labelMonth.classList.add('anim-out-side-left');
    }
    else {
        labelMonth.classList.remove('anim-in-side-left');
        labelMonth.classList.remove('anim-in-side-right');
        labelMonth.classList.add('anim-out-side-right');
    }

    labelMonth.addEventListener('animationend', function handleOut() {
        labelMonth.removeEventListener('animationend', handleOut);

        labelMonth.innerText = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);

        if (labelMonth.classList.contains('anim-out-side-left')) {
            labelMonth.classList.remove('anim-out-side-left');
            labelMonth.classList.add('anim-in-side-right');
        }
        else {
            labelMonth.classList.remove('anim-out-side-right');
            labelMonth.classList.add('anim-in-side-left');
        }
    });
}

// ---------- modal controls ----------
document.getElementById("btn-new-event").onclick = () => {
    editingEvent = null;
    document.getElementById("modalCalendarTitle").innerText = "Novo evento";
    document.getElementById("ev-titulo").value = "";
    document.getElementById("ev-descricao").value = "";
    document.getElementById("ev-tipo").value = "";
    document.getElementById("ev-data-inicio").value = formatDateLocal(agora());
    document.getElementById("ev-repeticao").value = "nenhuma";
    document.getElementById("delete-event").style.display = "none";
    document.getElementById("modalCalendar").classList.remove("hidden");
};

document.getElementById("close-modal").onclick = () => document.getElementById("modalCalendar").classList.add("hidden");

document.getElementById("save-event").onclick = async () => {
    const body = {
        titulo: document.getElementById("ev-titulo").value,
        descricao: document.getElementById("ev-descricao").value,
        tipo: document.getElementById("ev-tipo").value,
        data_inicio: document.getElementById("ev-data-inicio").value.replace("T"," "),
        repeticao: document.getElementById("ev-repeticao").value,
        concluido: 0
    };
    if (!body.titulo) { 
        const modal = document.getElementById("modalConfirmacao");
        modal.innerHTML = `<div class="fundoCabecalho"></div>
                            <div class="fundo modalConfirmaContent invisible">
                                <p class="paragrafo">O título é obrigatório.</p>
                                <button id="btnConfirmar" class="cmb MenuBotaoInterno">Ok</button>
                            </div>`

        const modalContent = document.querySelector(".modalConfirmaContent");
        modal.classList.remove("invisible0");
        modalContent.classList.remove("invisible");
        const btnConfirmar = document.getElementById("btnConfirmar");
        const btnCancelar = document.getElementById("btnCancelar");

        btnConfirmar.onclick = () => {
            modal.classList.add("invisible0");
            return
        };

        return
    }

    if (editingEvent){
        await apiAtualizarEvento(editingEvent.id, body);
    } 
    else {
        await apiCriarEvento(body);
    }
    document.getElementById("modalCalendar").classList.add("hidden");
    montarCalendario(true);
    montarCalendario(true, true);
};

document.getElementById("delete-event").onclick = async () => {
    if (!editingEvent) return;
    
    const modal = document.getElementById("modalConfirmacao");
    modal.innerHTML = `<div class="fundoCabecalho"></div>
                        <div class="fundo modalConfirmaContent invisible">
                            <p class="paragrafo">Tem certeza que deseja excluir esse evento?</p>
                            <button id="btnConfirmar" class="cmb MenuBotaoInterno">Sim</button>
                            <button id="btnCancelar" class="cmb MenuBotaoInterno">Cancelar</button>
                        </div>`

    const modalContent = document.querySelector(".modalConfirmaContent");
    modal.classList.remove("invisible0");
    modalContent.classList.remove("invisible");
    const btnConfirmar = document.getElementById("btnConfirmar");
    const btnCancelar = document.getElementById("btnCancelar");

    btnConfirmar.onclick = () => {
        modal.classList.add("invisible0");
        setTimeout(()=> {
            modalContent.classList.add("invisible");
            apiExcluirEvento(editingEvent.id);
            document.getElementById("modalCalendar").classList.add("hidden");
            montarCalendario(true);
            montarCalendario(true, true);
        }, 300);
    }
    btnCancelar.onclick = () => {
        modal.classList.add("invisible0");
        setTimeout(()=> {
            modalContent.classList.add("invisible");
        }, 300);
    };
};

function getToggleLabel(status) {
    switch (status) {
        case 0: return "▢";  // não iniciado
        case 1: return "⏺︎";  // em execução
        case 2: return "✔";  // concluído
        default: return "▢";
    }
}

function openEditModal(ev){
    fundoAuxiliar.classList.add('invisible0');
    desmarcaRotinasBuscados()
    editingEvent = ev;
    document.getElementById("modalCalendarTitle").innerText = "Editar evento";
    document.getElementById("ev-titulo").value = ev.titulo;
    document.getElementById("ev-descricao").value = ev.descricao || "";
    document.getElementById("ev-tipo").value = ev.tipo.charAt(0).toUpperCase() + ev.tipo.slice(1) || "";
    document.getElementById("ev-tipo").querySelector("#triggerLabel").textContent = ev.tipo || "";
    document.getElementById("ev-data-inicio").value = formatDateLocal(ev.data_inicio);
    document.getElementById("ev-repeticao").value = ev.repeticao || "nenhuma";
    document.getElementById("ev-repeticao").querySelector("#triggerLabel").textContent = ev.repeticao.charAt(0).toUpperCase() + ev.repeticao.slice(1) || "";
    document.getElementById("delete-event").style.display = "inline-block";
    document.getElementById("modalCalendar").classList.remove("hidden");
}

function montaListaExporadica(events){
    var eventExpList = document.querySelector('#listaEventosExporadicos');

    events.forEach(ev => {
        const verificaId = eventExpList.querySelector(`[id="diaEsporadico-${ev.id}"]`);
        if (!verificaId) {
            const novoEvento = criarElementoEvento(ev, 'Esporadico', 1, 1);
            eventExpList.appendChild(novoEvento);
        }
    });

    const eventosNaTela = eventExpList.querySelectorAll('[id^="diaEsporadico"]');
    
    if (eventosNaTela.length > 0) {
        const idsObjetos = new Set(events.map(obj => obj.id));

        eventosNaTela.forEach(elemento => {
            const idElemento = parseInt(elemento.id.split('-')[1]);
            
            if (!idsObjetos.has(idElemento)) {
                elemento.remove();
            }
        });
    }
}

// ---------- montarCalendario ----------
async function montarCalendario(forceRebuild = false, listaExporadica = false, exportar = ''){
    var year = ''
    var month = ''
    if (!listaExporadica) {
        year = currentDate.getFullYear();
        month = currentDate.getMonth() + 1;
    }
    else {
        year = 2001
        month = 1
    }

    if (exportar) {
        carregandoExportacao.classList.remove('off')
        // igual ao backend: sempre gera CSV, mesmo que o front ofereça xlsx/pdf
        const eventsExportar = await apiListarEventos(year, month, true);
        const blob = exportarLocal(eventsExportar);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Rotinas ${month}-${year}.csv`;

        document.body.appendChild(a);
        a.click();
        carregandoExportacao.classList.add('off')
        a.remove();
        return
    }

    const events = await apiListarEventos(year, month);

    events.sort((a, b) => {
        const t1 = a?.titulo ?? "";
        const t2 = b?.titulo ?? "";
        return t1.localeCompare(t2);
    });

    if (listaExporadica) {
        montaListaExporadica(events)
        return
    }

    const cal = document.getElementById("calendar");

    const mesAtual = cal.dataset.month;
    const anoAtual = cal.dataset.year;
    const mudouMes = mesAtual != month || anoAtual != year;

    if (forceRebuild || !cal.hasChildNodes() || mudouMes) {
        construirEstruturaCalendario(year, month, events);
        return;
    }

    atualizarEventosCalendario(year, month, events);
}

// ---------- construirEstruturaCalendario ----------
function construirEstruturaCalendario(year, month, events) {
    const firstDay = new Date(year, month-1, 1);
    const lastDay = new Date(year, month, 0);
    const startWeekDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const cal = document.getElementById("calendar");
    cal.innerHTML = "";

    cal.dataset.month = month;
    cal.dataset.year = year;

    for (let b=0;b<startWeekDay;b++){
        const blank = document.createElement("div");
        blank.className = "day blank";
        cal.appendChild(blank);
    }

    for (let d=1; d<=totalDays; d++){
        const cell = criarCelulaDia(year, month, d);
        renderizarEventosDia(cell, d, year, month, events);
        cal.appendChild(cell);
    }
    const calendar = document.getElementById('calendar');
    marcarFeriados(calendar)
}

// ---------- criarCelulaDia ----------
function criarCelulaDia(year, month, d) {
    const cell = document.createElement("div");
    cell.className = "day fundo";
    cell.dataset.day = d;
    const dateStr = `${year}-${pad(month)}-${pad(d)}`;

    if (isTouchDevice()) {
        cell.classList.add("nh");
    }
    // data local do dispositivo, lida na hora da montagem
    if (dateStr === ymdLocal(agora())) {
        cell.classList.add("today");
    }

    const tituloContainer = document.createElement("div");
    tituloContainer.className = "tituloContainer";
    cell.appendChild(tituloContainer);

    const dateLabel = document.createElement("div");
    dateLabel.id = d;
    dateLabel.className = "date";
    dateLabel.title = `Dia ${d}`;
    dateLabel.innerText = d;
    tituloContainer.appendChild(dateLabel);

    const expandLabel = document.createElement("div");
    expandLabel.className = "expand";
    expandLabel.title = "Expande a lista do dia";
    expandLabel.innerText = '≡';
    tituloContainer.appendChild(expandLabel);

    const newLabel = document.createElement("div");
    newLabel.className = "new";
    newLabel.title = "Nova rotina do dia";
    newLabel.innerText = '✛';
    tituloContainer.appendChild(newLabel);

    const expandB = cell.querySelector(".expand");
    expandB.addEventListener("click", (ev) => {
        ev.stopPropagation();
        expandeDia(expandB, cell);
    });

    const newB = cell.querySelector(".new");
    newB.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const dtStart = new Date(year, month-1, d, 9,0);
        abreModalEvento(dtStart);
    });

    const eventCell = document.createElement("div");
    eventCell.className = "eventContainer scroll scrollInfo";
    cell.appendChild(eventCell);

    return cell;
}

// ---------- atualizarEventosCalendario ----------
function atualizarEventosCalendario(year, month, events) {
    const eventosPorDia = {};
    events.forEach(ev => {
        const dia = ev.data_inicio.split(" ")[0];
        if (dia.startsWith(`${year}-${pad(month)}`)) {
            const d = parseInt(dia.split("-")[2], 10);
            if (!eventosPorDia[d]) eventosPorDia[d] = [];
            eventosPorDia[d].push(ev);
        }
    });

    const cells = document.querySelectorAll(".day.fundo");
    cells.forEach(cell => {
        const d = parseInt(cell.dataset.day, 10);
        const container = cell.querySelector(".eventContainer");
        if (!container) return;

        const eventosNovos = eventosPorDia[d] || [];
        const eventosAtuais = Array.from(container.querySelectorAll(".event"));

        const mapaAtuais = {};
        eventosAtuais.forEach(el => {
            mapaAtuais[el.id] = el;
        });

        const idsNovos = new Set(eventosNovos.map(ev => `dia${d}-${ev.id}`));

        eventosAtuais.forEach(el => {
            if (!el.id.startsWith('diaEsporadico')) {
                if (!idsNovos.has(el.id)) {
                    el.remove();
                }
            }
        });

        eventosNovos.forEach(ev => {
            const idCompleto = `dia${d}-${ev.id}`;
            const elementoExistente = mapaAtuais[idCompleto];

            if (elementoExistente) {
                atualizarElementoEvento(elementoExistente, ev, d);
            } else {
                const novoEvento = criarElementoEvento(ev, d, year, month);
                container.appendChild(novoEvento);
            }
        });

        scrollLimit(container);
    });
}

// ---------- atualizarElementoEvento ----------
function atualizarElementoEvento(elemento, ev, d) {
    const toggle = elemento.querySelector(".botaoEvent");
    const title = elemento.querySelector("span");

    const statusAtual = toggle.dataset.status;
    if (statusAtual != ev.concluido) {
        toggle.dataset.status = ev.concluido;
        toggle.innerText = getToggleLabel(ev.concluido);

        elemento.classList.remove("concluido", "executando");
        if (ev.concluido == 2) elemento.classList.add("concluido");
        if (ev.concluido == 1) elemento.classList.add("executando");
    }

    if (title.innerText !== ev.titulo) {
        title.innerText = ev.titulo;
        elemento.title = ev.titulo;
    }

    const tipoAtual = Array.from(elemento.classList).find(c => 
        c !== "event" && c !== "concluido" && c !== "executando"
    );
    if (tipoAtual !== ev.tipo) {
        if (tipoAtual) elemento.classList.remove(tipoAtual);
        elemento.classList.add(ev.tipo);
    }
}

// ---------- criarElementoEvento ----------
function criarElementoEvento(ev, d, year, month) {
    const evt = document.createElement("div");
    evt.id = `dia${d}-${ev.id}`;
    evt.className = `event ${ev.tipo}`;
    evt.title = ev.titulo;
    if (ev.concluido == 2) evt.classList.add("concluido");
    if (ev.concluido == 1) evt.classList.add("executando");

    const toggle = document.createElement("button");
    toggle.classList.add("botaoEvent");
    toggle.dataset.status = ev.concluido;
    toggle.innerText = getToggleLabel(ev.concluido);

    toggle.addEventListener("click", async (e) => {
        e.stopPropagation();

        let status = Number(toggle.dataset.status);
        const novoStatus = (status + 1) % 3;

        toggle.dataset.status = novoStatus;
        toggle.innerText = getToggleLabel(novoStatus);

        const diaInstancia = ev.data_inicio.split(" ")[0];

        evt.classList.remove("concluido", "executando");
        if (novoStatus == 2) evt.classList.add("concluido");
        if (novoStatus == 1) evt.classList.add("executando");

        await apiAtualizarStatus(ev.id, diaInstancia, novoStatus);
    });

    const title = document.createElement("span");
    title.style.whiteSpace = 'nowrap';
    title.style.overflow = 'hidden';
    title.style.textOverflow = 'ellipsis';
    title.style.width = '100%';
    title.innerText = ev.titulo;

    evt.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditModal(ev);
    });

    evt.appendChild(toggle);
    evt.appendChild(title);

    return evt;
}

// ---------- renderizarEventosDia ----------
function renderizarEventosDia(cell, d, year, month, events) {
    const dateStr = `${year}-${pad(month)}-${pad(d)}`;
    const eventCell = cell.querySelector(".eventContainer");

    events.filter(ev => ev.data_inicio.startsWith(dateStr)).forEach(ev => {
        const novoEvento = criarElementoEvento(ev, d, year, month);
        eventCell.appendChild(novoEvento);
    });

    scrollLimit(eventCell);
}

// inicialização
_semearEventosDemo();
_resetarStatusEventosDemo(); // sempre que o calendário carrega, volta os eventos demo pro status padrão
montarCalendario();
montarCalendario(false, true);
renderMonthLabel();
setTimeout(()=> {
    document.getElementById('calendar').classList.remove('collapsed')
    document.getElementById('containerEsporadicos').classList.remove('collapsed')
}, 200)
setTimeout(()=> {
    verificaExecucaoAnterior();
}, 500)

// ---------- CONFIGURAÇÃO DO SETINTERVAL ----------
let atualizacaoAtiva = true;
let ultimaInteracao = Date.now();

function registrarInteracao(event) {
    ultimaInteracao = Date.now();

    let target = event.target;
    if (!target.classList.contains('cmb')) {
        telaDica.classList.add('invisible2');
    }

    if (target.classList.contains('MenuBotao')) {
        animacaoBotao(target)
    }
}

document.addEventListener('click', (event) => {registrarInteracao(event)});
document.addEventListener('keydown', registrarInteracao);
document.querySelector('#newEventoExporadico').addEventListener("click", () => {
    // lê a data no momento do clique, não no carregamento da página
    const hoje = agora();
    const dtStart = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 9, 0);
    abreModalEvento(dtStart);
});
document.querySelector('#expandEventoExporadico').addEventListener("click", (event) => {
    let target = event.target;
    const cell = target.closest('.dayEsporadicos ');

    expandeDia(target, cell);
});
botaoExportarCalendario.addEventListener('click', (event)=> {
    let target = event.target;
    animacaoBotao(target)
    montarCalendario(false, false, 'sim')
})
window.addEventListener('wheel', (event) => {
  if (event.target.closest('.eventContainer') || event.target.closest('.cabecalho') || event.target.closest('.modalCalendarContent')) return;

  if (event.deltaY > 0) {
    mudarMes(-1);
    qualLado = 'Para direita'
    atualizaCalendario()
  } else {
    mudarMes(1);
    qualLado = 'Para esquerda'
    atualizaCalendario()
  }
});

// atualização do calendário
setInterval(async () => {
    const modalAberto = !document.getElementById('modalCalendar')?.classList.contains('hidden');
    const tempoDesdeInteracao = Date.now() - ultimaInteracao;
    const podeAtualizar = !modalAberto && tempoDesdeInteracao > 2000;
    
    if (podeAtualizar && atualizacaoAtiva) {
        await montarCalendario();
        await montarCalendario(false, true);
    }
}, 5000);

export function desmarcaRotinasBuscados() {
    var eventos = document.querySelectorAll('.event');
    eventos.forEach(evento => { 
        evento.classList.remove('buscaEvento');
        evento.parentElement.parentElement.classList.remove('buscaEvento');
        cInputRotina.classList.remove('naoEncontrado');
    });
};
function procurarRotina(event, rotinaPesquisado='') {
    fundoAuxiliar.classList.add('invisible0');
    cInputRotina.classList.remove('naoEncontrado');
    desmarcaRotinasBuscados();

    if (rotinaPesquisado == ''){
        rotinaPesquisado = document.getElementById('searchInputRotina').value;
    }
    if (event.key === 'Enter') {
        cInputRotina.blur()
        if (rotinaPesquisado !== '') {
            const eventos = document.querySelectorAll('.event');

            const resultado = [];
            eventos.forEach(evento => {
                if (evento.title.includes(rotinaPesquisado)) {
                resultado.push(evento);
                }
            });
    
            if (resultado.length > 0) {
                resultado.forEach(evento => {
                    evento.classList.add('buscaEvento');
                    setTimeout(()=> {
                        evento.scrollIntoView({ behavior: 'smooth',
                                                block: 'end',
                                                inline: 'nearest'
                                            });
                        setTimeout(() => evento.classList.remove('buscaEvento'), 10000);
                    }, 300);
                });
            } else {
                cInputRotina.classList.add('naoEncontrado');
            }
        }
        else {
            desmarcaRotinasBuscados();
        }
    }
};

limpaCInputRotina.addEventListener('click', ()=> {
    desmarcaRotinasBuscados()
    cInputRotina.value = ''
})
cInputRotina.addEventListener('keydown', (event) => {
    procurarRotina(event)
});
cInputRotina.addEventListener('focus', (event) => {
    fundoCabecalho.classList.add('cabecalhoSuperExpandido')
});
cInputRotina.addEventListener('blur', (event) => {
    fundoCabecalho.classList.remove('cabecalhoSuperExpandido')
});