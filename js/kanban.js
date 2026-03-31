import {Dropdown} from './drop.js'

const limpaCInputTarefa = document.getElementById('limpaCInputTarefa');
var cInputTarefa = document.getElementById('searchInputTarefa');


/**
 * kanban.js
 * Gerencia todo o comportamento do quadro Kanban:
 *  - Comunicação com a API Python
 *  - Renderização de fluxos, listas e tarefas
 *  - Modal de criação / edição / exclusão
 *  - Drag & drop entre listas e fluxos
 */

const API = `${location.protocol}//${location.hostname}:5000`;

// ═══════════════════════════════════════════════════════════════════════════════
//  Estado global
// ═══════════════════════════════════════════════════════════════════════════════

let estado = {
    fluxos:           [],   // dados completos vindos da API
    fluxoAtualId:     null, // id do fluxo sendo exibido
    tarefaEditandoId: null, // id da tarefa aberta no modal (null = nova)
    tarefaResponsavelAtual: null, // responsável da tarefa antes de editar
    listaNovaId:      null, // lista-alvo ao criar nova tarefa
    arrastandoId:     null, // id da tarefa em drag
    dropdowns:        {},   // instâncias da classe Dropdown: { prioridade, responsavel }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  Dados de exemplo (executado apenas uma vez, se o storage estiver vazio)
// ═══════════════════════════════════════════════════════════════════════════════

function popularDadosExemplo() {
    // Só popula se não houver nenhum fluxo ainda
    if (storageGet("fluxos").length > 0) return;

    const fluxos = [
        { id: "exemplo-1", nome: "Desenvolvimento" },
        { id: "exemplo-2", nome: "Marketing" },
    ];

    const listas = [
        { id: "lista-1", nome: "A fazer",      fluxo_id: "exemplo-1" },
        { id: "lista-2", nome: "Em andamento", fluxo_id: "exemplo-1" },
        { id: "lista-3", nome: "Concluído",    fluxo_id: "exemplo-1" },
        { id: "lista-4", nome: "A fazer",      fluxo_id: "exemplo-2" },
        { id: "lista-5", nome: "Em andamento", fluxo_id: "exemplo-2" },
    ];

    const hoje = new Date();
    const daqui = (dias) => {
        const d = new Date(hoje);
        d.setDate(d.getDate() + dias);
        return d.toISOString().slice(0, 10);
    };

    const tarefas = [
        // Desenvolvimento — A fazer
        {
            id: "tarefa-1", lista_id: "lista-1", ordem: 0,
            titulo: "Configurar ambiente de desenvolvimento",
            descricao: "Instalar dependências e configurar variáveis de ambiente.",
            prioridade: "Alta", responsavel: "Desenvolvimento", solicitante: "Tech Lead",
            data_prazo: daqui(3),
        },
        {
            id: "tarefa-2", lista_id: "lista-1", ordem: 1,
            titulo: "Revisar documentação da API",
            descricao: "Leitura dos endpoints disponíveis e contratos de resposta.",
            prioridade: "Media", responsavel: "Desenvolvimento", solicitante: "PO",
            data_prazo: daqui(5),
        },
        {
            id: "tarefa-3", lista_id: "lista-1", ordem: 2,
            titulo: "Criar testes unitários do módulo de login",
            descricao: "Cobertura mínima de 80% nas funções de autenticação.",
            prioridade: "Alta", responsavel: "Desenvolvimento", solicitante: "QA",
            data_prazo: daqui(7),
        },

        // Desenvolvimento — Em andamento
        {
            id: "tarefa-4", lista_id: "lista-2", ordem: 0,
            titulo: "Implementar tela de listagem de fluxos",
            descricao: "Componente com filtros, ordenação e paginação.",
            prioridade: "Alta", responsavel: "Desenvolvimento", solicitante: "PO",
            data_prazo: daqui(2),
        },
        {
            id: "tarefa-5", lista_id: "lista-2", ordem: 1,
            titulo: "Integrar drag & drop nas colunas",
            descricao: "Permitir mover tarefas entre listas com reordenação visual.",
            prioridade: "Media", responsavel: "Desenvolvimento", solicitante: "Design",
            data_prazo: daqui(4),
        },

        // Desenvolvimento — Concluído
        {
            id: "tarefa-6", lista_id: "lista-3", ordem: 0,
            titulo: "Definir paleta de cores e tipografia",
            descricao: "Aprovado pelo design system da empresa.",
            prioridade: "Baixa", responsavel: "Desenvolvimento", solicitante: "Design",
            data_prazo: daqui(-5),
        },
        {
            id: "tarefa-7", lista_id: "lista-3", ordem: 1,
            titulo: "Configurar CI/CD no repositório",
            descricao: "Pipeline de build, lint e deploy automático para staging.",
            prioridade: "Alta", responsavel: "Desenvolvimento", solicitante: "DevOps",
            data_prazo: daqui(-2),
        },

        // Marketing — A fazer
        {
            id: "tarefa-8", lista_id: "lista-4", ordem: 0,
            titulo: "Planejar campanha de lançamento",
            descricao: "Definir canais, orçamento e cronograma da campanha.",
            prioridade: "Alta", responsavel: "Marketing", solicitante: "Diretor",
            data_prazo: daqui(10),
        },
        {
            id: "tarefa-9", lista_id: "lista-4", ordem: 1,
            titulo: "Produzir posts para redes sociais",
            descricao: "Pacote com 10 artes para Instagram e LinkedIn.",
            prioridade: "Media", responsavel: "Marketing", solicitante: "Fernanda Rocha",
            data_prazo: daqui(6),
        },

        // Marketing — Em andamento
        {
            id: "tarefa-10", lista_id: "lista-5", ordem: 0,
            titulo: "Redigir e-mail marketing de boas-vindas",
            descricao: "Sequência de 3 e-mails para novos cadastros.",
            prioridade: "Media", responsavel: "Marketing", solicitante: "PO",
            data_prazo: daqui(3),
        },
    ];

    storageSet("fluxos",  fluxos);
    storageSet("listas",  listas);
    storageSet("tarefas", tarefas);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Utilitários de requisição
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Helpers de storage ────────────────────────────────────────────────────

function storageGet(chave) {
    return JSON.parse(localStorage.getItem(chave) || "[]");
}

function storageSet(chave, valor) {
    localStorage.setItem(chave, JSON.stringify(valor));
}

function gerarId() {
    return Date.now() + Math.random().toString(36).slice(2, 7);
}

// ─── Roteador local (substitui fetch) ──────────────────────────────────────

function rotearLocal(path, method, body) {
    // Normaliza path: remove query string e divide em segmentos
    const partes = path.split("?")[0].replace(/^\//, "").split("/");
    // partes ex: ["fluxos"], ["fluxos","123"], ["tarefas","123","mover"]

    const recurso  = partes[0];           // "fluxos" | "listas" | "tarefas"
    const id       = partes[1] || null;   // "123" ou null
    const subacao  = partes[2] || null;   // "mover" ou null

    // ── /fluxos ────────────────────────────────────────────────────────────
    if (recurso === "fluxos") {
        const fluxos = storageGet("fluxos");
        const listas = storageGet("listas");
        const tarefas = storageGet("tarefas");

        if (!id) {
            if (method === "GET") {
                // Retorna fluxos com listas e tarefas aninhadas
                return fluxos.map(f => ({
                    ...f,
                    listas: listas
                        .filter(l => l.fluxo_id === f.id)
                        .map(l => ({
                            ...l,
                            tarefas: tarefas.filter(t => t.lista_id === l.id),
                        })),
                }));
            }
            if (method === "POST") {
                const novo = { id: gerarId(), ...body };
                storageSet("fluxos", [...fluxos, novo]);
                return novo;
            }
        } else {
            const idx = fluxos.findIndex(f => String(f.id) === String(id));
            if (idx === -1) throw new Error("Fluxo não encontrado");

            if (method === "GET") {
                const f = fluxos[idx];
                return {
                    ...f,
                    listas: listas
                        .filter(l => l.fluxo_id === f.id)
                        .map(l => ({
                            ...l,
                            tarefas: tarefas.filter(t => t.lista_id === l.id),
                        })),
                };
            }
            if (method === "PUT") {
                fluxos[idx] = { ...fluxos[idx], ...body };
                storageSet("fluxos", fluxos);
                return fluxos[idx];
            }
            if (method === "DELETE") {
                storageSet("fluxos", fluxos.filter(f => String(f.id) !== String(id)));
                return { ok: true };
            }
        }
    }

    // ── /listas ────────────────────────────────────────────────────────────
    if (recurso === "listas") {
        const listas = storageGet("listas");

        if (!id) {
            if (method === "GET")  return listas;
            if (method === "POST") {
                const nova = { id: gerarId(), ...body };
                storageSet("listas", [...listas, nova]);
                return nova;
            }
        } else {
            const idx = listas.findIndex(l => String(l.id) === String(id));
            if (idx === -1) throw new Error("Lista não encontrada");

            if (method === "PUT") {
                listas[idx] = { ...listas[idx], ...body };
                storageSet("listas", listas);
                return listas[idx];
            }
            if (method === "DELETE") {
                storageSet("listas", listas.filter(l => String(l.id) !== String(id)));
                return { ok: true };
            }
        }
    }

    // ── /tarefas ───────────────────────────────────────────────────────────
    if (recurso === "tarefas") {
        const tarefas = storageGet("tarefas");

        // PUT /tarefas/reordenar
        if (id === "reordenar" && method === "PUT") {
            const { tarefas: payload } = body; // [{ id, ordem }, ...]
            const atualizadas = tarefas.map(t => {
                const nova = payload.find(p => String(p.id) === String(t.id));
                return nova ? { ...t, ...nova } : t;
            });
            storageSet("tarefas", atualizadas);
            return { ok: true };
        }

        if (!id) {
            if (method === "GET")  return tarefas;
            if (method === "POST") {
                const nova = { id: gerarId(), ...body };
                storageSet("tarefas", [...tarefas, nova]);
                return nova;
            }
        } else {
            const idx = tarefas.findIndex(t => String(t.id) === String(id));
            if (idx === -1) throw new Error("Tarefa não encontrada");

            // PUT /tarefas/:id/mover
            if (subacao === "mover" && method === "PUT") {
                tarefas[idx] = { ...tarefas[idx], lista_id: body.lista_id };
                storageSet("tarefas", tarefas);
                return tarefas[idx];
            }

            if (method === "GET") return tarefas[idx];
            if (method === "PUT") {
                tarefas[idx] = { ...tarefas[idx], ...body };
                storageSet("tarefas", tarefas);
                return tarefas[idx];
            }
            if (method === "DELETE") {
                storageSet("tarefas", tarefas.filter(t => String(t.id) !== String(id)));
                return { ok: true };
            }
        }
    }

    throw new Error(`Rota não implementada: ${method} /${path}`);
}

async function api(path, method = "GET", body = null) {
    // Simula latência mínima (opcional — remova se quiser resposta instantânea)
    await new Promise(r => setTimeout(r, 0));

    try {
        return rotearLocal(path, method, body);
    } catch (e) {
        throw new Error(e.message || "Erro no storage local");
    }
}

function mostrarErro(msg) {
    const el = document.getElementById("modalConfirmacao");
    if (!el) return;
    el.textContent = `⚠ ${msg}`;
    el.classList.remove("invisible0");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.add("invisible0"), 3500);
}

// ─── Modal de input customizado (substitui prompt() e confirm()) ──────────────

function modalInput({ titulo, placeholder = "", valorInicial = "", labelConfirmar = "Salvar" } = {}) {
    return new Promise((resolve) => {
        document.getElementById("_modalInput")?.remove();

        const overlay = document.createElement("div");
        overlay.id = "_modalInput";
        overlay.className = "modalCalendar";
        overlay.style.cssText = "display:flex;align-items:center;justify-content:center;z-index:1000;";

        overlay.innerHTML = `
            <div class="fundoCabecalho"></div>
            <div class="modalCalendarContent fundo" style="min-width:320px;max-width:460px;width:90%;">
                <div class="modalCabecalho">
                <h1 class="subTituloItemLateral">${escHtml(titulo)}</h1>
                <button class="cmb MenuBotao BotaoFechar" id="_modalInputFechar" title="Cancelar">⨉</button>
                </div>
                <div class="cmb fundoInvertido barraPesquisa" style="margin:16px 10px 0;">
                <input id="_modalInputField" type="text" class="cmb mInputName"
                        placeholder="${escHtml(placeholder)}"
                        value="${escHtml(valorInicial)}"
                        style="width:100%;">
                </div>
                <div class="modalCalendarActions">
                <button id="_modalInputConfirmar" class="cmb MenuBotao MenuBotaoTexto">${escHtml(labelConfirmar)}</button>
                <button id="_modalInputCancelar"  class="cmb MenuBotao MenuBotaoTexto">Cancelar</button>
                </div>
            </div>`;

        document.body.appendChild(overlay);

        const input = overlay.querySelector("#_modalInputField");
        const confirmar = overlay.querySelector("#_modalInputConfirmar");
        const cancelar = overlay.querySelector("#_modalInputCancelar");
        const fechar = overlay.querySelector("#_modalInputFechar");

        const close = (valor) => { overlay.remove(); resolve(valor); };
        const sair  = () => close(null);

        input.focus();
        input.select();

        confirmar.addEventListener("click", () => { const v = input.value.trim(); if (v) close(v); });
        cancelar.addEventListener("click", sair);
        fechar.addEventListener("click", sair);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) sair(); });
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter")  { const v = input.value.trim(); if (v) close(v); }
            if (e.key === "Escape") sair();
        });
    });
}

function modalConfirm(mensagem) {
    return new Promise((resolve) => {
        const modal = document.getElementById("modalConfirmacao");
        modal.innerHTML = `
            <div class="fundoCabecalho"></div>
            <div class="fundo modalConfirmaContent invisible">
                <div class="modalCabecalho">
                <h1 class="subTituloItemLateral">Confirmação</h1>
                </div>
                <p style="margin:16px 10px;line-height:1.5;">${escHtml(mensagem)}</p>
                <div class="modalCalendarActions">
                <button id="_modalConfirmSim"  class="cmb MenuBotao MenuBotaoTexto">Confirmar</button>
                <button id="_modalConfirmNao"  class="cmb MenuBotao MenuBotaoTexto">Cancelar</button>
                </div>
            </div>`;

        const close = (val) => { resolve(val); };

        const modalContent = document.querySelector(".modalConfirmaContent");
        modal.classList.remove("invisible0");
        modalContent.classList.remove("invisible");

        const fecharModal = () => {
            modal.classList.add("invisible0");
            setTimeout(() => modalContent.classList.add("invisible"), 300);
        };

        modal.querySelector("#_modalConfirmSim").addEventListener("click", () => { fecharModal(); close(true); });
        modal.querySelector("#_modalConfirmNao").addEventListener("click", () => { fecharModal(); close(false); });
        modal.addEventListener("click", (e) => { if (e.target === modal) { fecharModal(); close(false); } });
        document.addEventListener("keydown", function handler(e) {
            if (e.key === "Enter")  { fecharModal(); document.removeEventListener("keydown", handler); close(true); }
            if (e.key === "Escape") { fecharModal(); document.removeEventListener("keydown", handler); close(false); }
        });
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Inicialização
// ═══════════════════════════════════════════════════════════════════════════════

async function init() {
    popularDadosExemplo(); // ✅ popula só se o storage estiver vazio

    try {
        estado.fluxos = await api("/fluxos");
    } catch (e) {
        mostrarErro("Não foi possível conectar à API. " + e.message);
        estado.fluxos = [];
    }

    renderizarSidebar();
    inicializarDropdownsModal();

    if (estado.fluxos.length > 0) {
        const ultimoId = localStorage.getItem("fluxoAtual"); // ✅ string pura
        const existe   = estado.fluxos.find((f) => String(f.id) === String(ultimoId)); // ✅ compara como string
        if (existe) {
            selecionarFluxo(existe.id, true);
        } else {
            const primeiro = [...estado.fluxos].sort((a, b) => a.nome.localeCompare(b.nome, "pt"))[0];
            selecionarFluxo(primeiro.id, true);
        }
    }

    bindEventosEstaticos();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Renderização — Sidebar de fluxos
// ═══════════════════════════════════════════════════════════════════════════════

function renderizarSidebar() {
    const lista = document.getElementById("listaFluxos");
    lista.innerHTML = "";

    [...estado.fluxos].sort((a, b) => a.nome.localeCompare(b.nome, "pt")).forEach((f) => {
        const btn = document.createElement("div");
        btn.className = 'fluxoItem';
        btn.dataset.id = f.id;
        btn.title      = "Abrir fluxo de tarefas";
        btn.innerHTML  = `<button class="MenuBotao MenuBotaoTexto fluxo-btn">☰ ${escHtml(f.nome)}</button>
                          <span class="fluxo-acoes">
                            <button class="cmb MenuBotao btn-editar-fluxo" data-id="${f.id}" title="Renomear fluxo">✎</button>
                            <button class="cmb MenuBotao btn-deletar-fluxo" data-id="${f.id}" title="Excluir fluxo">✕</button>
                          </span>`;
        btn.addEventListener("click", (e) => {
            if (e.target.closest(".fluxo-acoes")) return;
            selecionarFluxo(f.id, true);
        });
        lista.appendChild(btn);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Renderização — Listas e tarefas do fluxo
// ═══════════════════════════════════════════════════════════════════════════════

function selecionarFluxo(fluxoId, transicao=false) {
    localStorage.setItem("fluxoAtual", fluxoId);

    estado.fluxoAtualId = fluxoId;
    const fluxo = estado.fluxos.find((f) => f.id === fluxoId);
    if (!fluxo) return;

    document.getElementById("fluxoSelecionado").textContent = fluxo.nome;

    const container = document.querySelector(".telaGrupoListas");
    if (transicao) {
       container.classList.add('invisibleHeight'); 
    }
    
    setTimeout(()=> {
        container.innerHTML = "";
        (fluxo.listas || []).forEach((lista) => {
            var coluna = criarElementoLista(lista)
            container.appendChild(coluna);
        });

        const divNovaLista = document.createElement("div");
        divNovaLista.className = "cabecalhoNovaLista";
        divNovaLista.innerHTML = `<button id="novaLista" class="MenuBotao MenuBotaoTexto" title="Nova lista de tarefas">✛ Nova lista</button>`;
        divNovaLista.querySelector("#novaLista").addEventListener("click", () => abrirModalNovaLista(fluxoId));
        container.appendChild(divNovaLista);
        
        setTimeout(()=> {
            if (transicao) {
                container.classList.remove('invisibleHeight'); 
            }
        }, 500);
    }, 300);
}

function criarElementoLista(lista) {
    const col = document.createElement("div");
    col.className    = "telaTarefas";
    col.dataset.id   = lista.id;

    col.innerHTML = `
      <div class="fundo cabecalhoTarefas">
        <button class="MenuBotao MenuBotaoTexto lista-nome btn-editar-lista" data-id="${lista.id}">${escHtml(lista.nome)}</button>
        <div style="display:flex;gap:4px">
          <button class="cmb MenuBotao MenuBotaoTexto btn-deletar-lista" data-id="${lista.id}" title="Excluir lista">✕</button>
          <button class="cmb MenuBotao MenuBotaoTexto btn-nova-tarefa" data-lista-id="${lista.id}" title="Nova tarefa na lista">✛</button>
        </div>
      </div>
      <div class="fundo fundoListaTarefas">
        <div class="listaTarefas scroll drop-zone" id="lista_${lista.id}" data-lista-id="${lista.id}">
        </div>
      </div>`;

    const dropZone = col.querySelector(`#lista_${lista.id}`);

    const ORDEM_PRIORIDADE = { Alta: 0, Média: 1, Baixa: 2 };
    const tarefasOrdenadas = [...lista.tarefas].sort(
        (a, b) => (ORDEM_PRIORIDADE[a.prioridade] ?? 1) - (ORDEM_PRIORIDADE[b.prioridade] ?? 1)
    );
    tarefasOrdenadas.forEach((t) => dropZone.appendChild(criarElementoTarefa(t)));

    bindDropZone(dropZone);

    col.querySelector(".btn-nova-tarefa").addEventListener("click", () =>
        abrirModalTarefa(null, lista.id)
    );
    col.querySelector(".btn-editar-lista").addEventListener("click", () =>
        editarLista(lista.id, lista.nome)
    );
    col.querySelector(".btn-deletar-lista").addEventListener("click", () =>
        confirmarDeleteLista(lista.id, lista.nome)
    );

    return col;
}

function criarElementoTarefa(tarefa) {
    const div = document.createElement("div");
    div.id           = `tarefa-${tarefa.id}`;
    div.className    = "fundo rectangleTarefa";
    div.draggable    = true;
    div.dataset.id   = tarefa.id;

    const classeNivel = {
        Alta:  "prioridadeAlta",
        Média: "prioridadeMedia",
        Baixa: "prioridadeBaixa",
    }[tarefa.prioridade] || "prioridadeMedia";

    div.innerHTML = `
        <div class="rectangleTarefaCabecalho">
          <div class="prioridadeTarefa">${escHtml(tarefa.prioridade)}</div>
          ${tarefa.responsavel ? `<div class="responsavelTarefa">${escHtml(tarefa.responsavel)}</div>` : ""}
          ${tarefa.solicitante  ? `<div class="solicitanteDaTarefa">${escHtml(tarefa.solicitante)}</div>` : ""}
          ${tarefa.data_prazo  ? `<div class="prazoDaTarefa">${formatarData(tarefa.data_prazo)}</div>` : ""}
        </div>
        <div class="nivelPrioridade ${classeNivel}"></div>
        <div class="tituloTarefa">${escHtml(tarefa.titulo)}</div>`;

    div.addEventListener("click", () => abrirModalTarefa(tarefa));

    div.addEventListener("dragstart", (e) => {
        estado.arrastandoId = tarefa.id;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", tarefa.id);
        setTimeout(() => div.classList.add("arrastando"), 0);
    });
    div.addEventListener("dragend", () => {
        estado.arrastandoId = null;
        div.classList.remove("arrastando");
    });

    return div;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Barra de busca
// ═══════════════════════════════════════════════════════════════════════════════

function navegarParaTarefa(fluxoId, tarefaId) {
    if (estado.fluxoAtualId === fluxoId) {
        destacarCard(tarefaId);
        return;
    }
 
    selecionarFluxo(fluxoId, true);
    setTimeout(() => destacarCard(tarefaId), 1000);
}
 
function destacarCard(tarefaId) {
    const card = document.getElementById(`tarefa-${tarefaId}`);
    if (!card) return;
 
    card.classList.add("cardDestacado");
    setTimeout(()=> {
        card.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        setTimeout(() => card.classList.remove("cardDestacado"), 2000);
    }, 300);
}

function destacarTermo(texto, termo) {
    const idx = texto.toLowerCase().indexOf(termo.toLowerCase());
    if (idx === -1) return escHtml(texto);
    return escHtml(texto.slice(0, idx))
        + `<mark>${escHtml(texto.slice(idx, idx + termo.length))}</mark>`
        + escHtml(texto.slice(idx + termo.length));
}

function pesquisarTarefas() {
    var termo = document.getElementById('searchInputTarefa').value;

    const resultsEl = document.querySelector("#searchResults");

    resultsEl.style.opacity = "0";
    resultsEl.innerHTML = "";
 
    if (!termo || termo.length < 2) {
        resultsEl.style.opacity = "0";
        return;
    }
 
    const termoLower = termo.toLowerCase();
    const encontradas = [];
 
    estado.fluxos.forEach((fluxo) => {
        fluxo.listas.forEach((lista) => {
            lista.tarefas.forEach((tarefa) => {
                if (tarefa.titulo.toLowerCase().includes(termoLower)) {
                    encontradas.push({ tarefa, lista, fluxo });
                }
            });
        });
    });
 
    if (encontradas.length === 0) {
        cInputTarefa.classList.add('naoEncontrado');
        return;
    }
 
    encontradas.forEach(({ tarefa, lista, fluxo }) => {
        const item = document.createElement("div");
        item.className = "searchResultItem MenuBotao";
 
        const classeNivel = { Alta: "prioridadeAlta", Média: "prioridadeMedia", Baixa: "prioridadeBaixa" }[tarefa.prioridade] || "prioridadeMedia";
 
        item.innerHTML = `
            <div class="${classeNivel}" style="background-color: var(--cor-lista);height: 2px;width: 100%;border-radius: 5px;width: 4px;min-width: 4px;border-radius: 2px;margin-right: 8px;align-self: stretch;margin: 2px;"></div>
            <div style="flex:1;overflow:hidden;">
                <div class="searchResultTitulo">${destacarTermo(tarefa.titulo, termo)}</div>
                <div class="searchResultMeta">${escHtml(fluxo.nome)} › ${escHtml(lista.nome)}</div>
            </div>`;
 
        item.addEventListener("click", () => {
            resultsEl.style.opacity = "0";
            navegarParaTarefa(fluxo.id, tarefa.id);
        });
 
        resultsEl.appendChild(item);
    });
 
    resultsEl.style.opacity = "1";
}

limpaCInputTarefa.addEventListener('click', ()=> {
    cInputTarefa.classList.remove('naoEncontrado');
    cInputTarefa.value = ''
    const resultsEl = document.querySelector("#searchResults");
    resultsEl.style.opacity = "0";
})

cInputTarefa.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        pesquisarTarefas()
    }
    else {
        cInputTarefa.classList.remove('naoEncontrado');
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  Drag & Drop
// ═══════════════════════════════════════════════════════════════════════════════

function bindDropZone(zone) {
    zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        zone.classList.add("drag-over");

        const arrastando = document.getElementById(`tarefa-${estado.arrastandoId}`);
        if (!arrastando) return;

        const afterEl = getTarefaApos(zone, e.clientY);
        if (afterEl === null) {
            zone.appendChild(arrastando);
        } else {
            zone.insertBefore(arrastando, afterEl);
        }
    });

    zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));

    zone.addEventListener("drop", async (e) => {
        e.preventDefault();
        zone.classList.remove("drag-over");

        const listaId = zone.dataset.listaId; // ✅ string pura
        const cards   = [...zone.querySelectorAll(".rectangleTarefa")];
        const payload = cards.map((c, idx) => ({
            id:       c.dataset.id,  // ✅ string pura
            lista_id: listaId,
            ordem:    idx,
        }));

        try {
            await api("/tarefas/reordenar", "PUT", { tarefas: payload });
            await recarregarFluxo();
        } catch (err) {
            mostrarErro(err.message);
        }
    });
}

function getTarefaApos(container, y) {
    const cards = [...container.querySelectorAll(".rectangleTarefa:not(.arrastando)")];
    return cards.reduce(
        (mais_proximo, card) => {
            const box    = card.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > mais_proximo.offset) {
                return { offset, el: card };
            }
            return mais_proximo;
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).el ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Modal de tarefa
// ═══════════════════════════════════════════════════════════════════════════════

async function abrirModalTarefa(tarefa = null, listaId = null) {
    estado.tarefaEditandoId = tarefa ? tarefa.id : null;
    estado.tarefaResponsavelAtual = tarefa ? tarefa.responsavel : null; // guarda responsável original
    estado.listaNovaId = listaId;

    atualizarDropdownResponsaveis();

    const modal = document.getElementById("modalTarefa");
    const titulo = document.getElementById("modalCalendarTitle");

    document.getElementById("kb-titulo").value = tarefa ? tarefa.titulo : "";
    document.getElementById("kb-descricao").value = tarefa ? tarefa.descricao || "" : "";
    document.getElementById("kb-solicitante").value = tarefa ? tarefa.solicitante || "" : "";
    document.getElementById("kb-data-prazo").value = tarefa ? tarefa.data_prazo || "" : "";

    titulo.textContent = tarefa ? "Editar tarefa" : "Nova tarefa";

    setDropdownValor("kb-prioridade", tarefa ? tarefa.prioridade : null, "Prioridade da tarefa");
    setDropdownValor("kb-responsavel", tarefa ? tarefa.responsavel : null, "Responsável da tarefa");

    document.getElementById("delete-event").style.display = tarefa ? "inline-block" : "none";

    modal.classList.remove("hidden");
}

function fecharModal() {
    document.getElementById("modalTarefa").classList.add("hidden");
    estado.tarefaEditandoId = null;
    estado.tarefaResponsavelAtual = null;
    estado.listaNovaId = null;
}

async function salvarTarefa() {
    const titulo = document.getElementById("kb-titulo").value.trim();
    const descricao = document.getElementById("kb-descricao").value.trim();
    const solicitanteTarefa = document.getElementById("kb-solicitante").value.trim() || null;
    const dataPrazo = document.getElementById("kb-data-prazo").value || null;
    const prioridade = getDropdownValor("kb-prioridade") || "Baixa";
    const responsavel = getDropdownValor("kb-responsavel") || null;

    if (!titulo) {
        mostrarErro("O título é obrigatório.");
        return;
    }

    try {
        if (estado.tarefaEditandoId) {
            await api(`/tarefas/${estado.tarefaEditandoId}`, "PUT", {
                titulo, descricao, prioridade, responsavel, data_prazo: dataPrazo, solicitante: solicitanteTarefa,
            });

            // Só move se o responsável foi alterado para um fluxo diferente
            const responsavelMudou = responsavel !== estado.tarefaResponsavelAtual;
            if (responsavelMudou) {
                const fluxoDestino = estado.fluxos.find((f) => f.nome === responsavel);
                if (fluxoDestino) {
                    let listaDestino = fluxoDestino.listas[0];
                    if (!listaDestino) {
                        listaDestino = await api("/listas", "POST", {
                            nome: "A fazer",
                            fluxo_id: fluxoDestino.id,
                        });
                    }
                    await api(`/tarefas/${estado.tarefaEditandoId}/mover`, "PUT", {
                        lista_id: listaDestino.id,
                    });
                }
            }
        } else {
            await api("/tarefas", "POST", {
                titulo, descricao, prioridade, responsavel,
                data_prazo: dataPrazo,
                solicitante: solicitanteTarefa,
                lista_id: estado.listaNovaId,
            });
        }

        fecharModal();
        await recarregarFluxo();
    } catch (err) {
        mostrarErro(err.message);
    }
}

async function deletarTarefaModal() {
    if (!estado.tarefaEditandoId) return;
    const confirmado = await modalConfirm("Deseja realmente excluir esta tarefa?");
    if (!confirmado) return;
    try {
        await api(`/tarefas/${estado.tarefaEditandoId}`, "DELETE");
        fecharModal();
        await recarregarFluxo();
    } catch (err) {
        mostrarErro(err.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Fluxos — criação, edição, exclusão
// ═══════════════════════════════════════════════════════════════════════════════

async function criarFluxo() {
    const nome = await modalInput({ titulo: "Novo fluxo", placeholder: "Nome do fluxo", labelConfirmar: "Criar" });
    if (!nome) return;
    try {
        const novo = await api("/fluxos", "POST", { nome });
        estado.fluxos.push(novo);
        renderizarSidebar();
        selecionarFluxo(novo.id);
    } catch (err) {
        mostrarErro(err.message);
    }
}

async function editarFluxo(fluxoId, nomeAtual) {
    const nome = await modalInput({ titulo: "Renomear fluxo", placeholder: "Nome do fluxo", valorInicial: nomeAtual });
    if (!nome || nome === nomeAtual) return;
    try {
        await api(`/fluxos/${fluxoId}`, "PUT", { nome });
        const f = estado.fluxos.find((x) => x.id === fluxoId);
        if (f) f.nome = nome;
        renderizarSidebar();
        if (estado.fluxoAtualId === fluxoId) {
            document.getElementById("fluxoSelecionado").textContent = nome;
        }
    } catch (err) {
        mostrarErro(err.message);
    }
}

async function deletarFluxo(fluxoId, nomeFluxo) {
    const confirmado = await modalConfirm(`Excluir o fluxo "${nomeFluxo}" e todas as suas listas/tarefas?`);
    if (!confirmado) return;
    try {
        await api(`/fluxos/${fluxoId}`, "DELETE");
        estado.fluxos = estado.fluxos.filter((f) => f.id !== fluxoId);
        renderizarSidebar();
        if (estado.fluxoAtualId === fluxoId) {
            estado.fluxoAtualId = null;
            document.querySelector(".telaGrupoListas").innerHTML = "";
            document.getElementById("fluxoSelecionado").textContent = "";
            if (estado.fluxos.length > 0) selecionarFluxo(estado.fluxos[0].id);
        }
    } catch (err) {
        mostrarErro(err.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Listas — criação, edição, exclusão
// ═══════════════════════════════════════════════════════════════════════════════

async function abrirModalNovaLista(fluxoId) {
    const nome = await modalInput({ titulo: "Nova lista", placeholder: "Nome da lista", labelConfirmar: "Criar" });
    if (!nome) return;
    try {
        await api("/listas", "POST", { nome, fluxo_id: fluxoId });
        await recarregarFluxo(true);
    } catch (err) {
        mostrarErro(err.message);
    }
}

async function editarLista(listaId, nomeAtual) {
    const nome = await modalInput({ titulo: "Renomear lista", placeholder: "Nome da lista", valorInicial: nomeAtual });
    if (!nome || nome === nomeAtual) return;
    try {
        await api(`/listas/${listaId}`, "PUT", { nome });
        await recarregarFluxo(true);
    } catch (err) {
        mostrarErro(err.message);
    }
}

async function confirmarDeleteLista(listaId, nomeLista) {
    const confirmado = await modalConfirm(`Excluir a lista "${nomeLista}" e todas as suas tarefas?`);
    if (!confirmado) return;
    try {
        await api(`/listas/${listaId}`, "DELETE");
        await recarregarFluxo(true);
    } catch (err) {
        mostrarErro(err.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Recarga parcial do fluxo atual
// ═══════════════════════════════════════════════════════════════════════════════

async function recarregarFluxo(transicao=false) {
    try {
        estado.fluxos = await api("/fluxos");
        renderizarSidebar();
        if (estado.fluxoAtualId) selecionarFluxo(estado.fluxoAtualId, transicao);
    } catch (err) {
        mostrarErro(err.message);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Dropdowns — integração com a classe Dropdown existente
// ═══════════════════════════════════════════════════════════════════════════════

function inicializarDropdownsModal() {
    if (document.getElementById("kb-prioridade")) {
        estado.dropdowns.prioridade = new Dropdown("#kb-prioridade");
    }
    if (document.getElementById("kb-responsavel")) {
        estado.dropdowns.responsavel = new Dropdown("#kb-responsavel");
    }
}

function atualizarDropdownResponsaveis() {
    const container = document.querySelector("#kb-responsavel .menuItems");
    if (!container) return;

    container.innerHTML = estado.fluxos
        .map(
          (f) =>
            `<div class="menu-item MenuBotao MenuBotaoTexto" data-id="${f.id}">
              <span class="item-label">${escHtml(f.nome)}</span>
            </div>`
        )
        .join("");

    if (document.getElementById("kb-responsavel")) {
        estado.dropdowns.responsavel = new Dropdown("#kb-responsavel");
    }
}

function getDropdownValor(dropId) {
    const instancia = estado.dropdowns[dropId === "kb-prioridade" ? "prioridade" : "responsavel"];
    return instancia?.getLabel() || null;
}

function setDropdownValor(dropId, valor, placeholder) {
    const instancia = estado.dropdowns[dropId === "kb-prioridade" ? "prioridade" : "responsavel"];
    if (!instancia) return;
    if (valor) {
        instancia.setValue(valor);
    } else {
        instancia.menuItems.forEach(item => item.classList.remove("selected"));
        instancia.value        = null;
        instancia.selectedItem = null;
        if (instancia.triggerLabel) instancia.triggerLabel.textContent = placeholder;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Eventos estáticos (botões que existem no HTML base)
// ═══════════════════════════════════════════════════════════════════════════════

function bindEventosEstaticos() {
    document.getElementById("close-modal")?.addEventListener("click", fecharModal);
    document.getElementById("save-event")?.addEventListener("click", salvarTarefa);
    document.getElementById("delete-event")?.addEventListener("click", deletarTarefaModal);
    document.getElementById("novoFluxo")?.addEventListener("click", criarFluxo);

    document.getElementById("listaFluxos")?.addEventListener("click", (e) => {
        const btnEditar  = e.target.closest(".btn-editar-fluxo");
        const btnDeletar = e.target.closest(".btn-deletar-fluxo");

        if (btnEditar) {
            const fid   = btnEditar.dataset.id; // ✅ string pura
            const fluxo = estado.fluxos.find((f) => String(f.id) === String(fid)); // ✅
            if (fluxo) editarFluxo(fid, fluxo.nome);
        } else if (btnDeletar) {
            const fid   = btnDeletar.dataset.id; // ✅ string pura
            const fluxo = estado.fluxos.find((f) => String(f.id) === String(fid)); // ✅
            if (fluxo) deletarFluxo(fid, fluxo.nome);
        }
    });

    document.getElementById("toggleDarkMode")?.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        const img = document.querySelector("#toggleDarkMode .icone");
        if (img) img.src = document.body.classList.contains("dark") ? "assets/sun.png" : "assets/moon.png";
    });

    document.getElementById("modalTarefa")?.addEventListener("click", (e) => {
        if (e.target === document.getElementById("modalTarefa")) fecharModal();
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Helpers gerais
// ═══════════════════════════════════════════════════════════════════════════════

function escHtml(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatarData(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Bootstrap
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", init);