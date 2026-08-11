// -*- coding: utf-8 -*-
// Módulo compartilhado: camada de dados em localStorage no lugar da API/MySQL.
// Usado tanto pelo calendário (main.js) quanto pelo dashboard (dashboard.js),
// pra garantir que os dois leem/escrevem exatamente a mesma lógica e as mesmas chaves.

// =====================================================================
// ---------- CAMADA DE DADOS (localStorage no lugar da API/MySQL) ----------
// =====================================================================
// Espelha a lógica de _processamento_listar_eventos / _adicionar_evento /
// _editar_evento / _alterar_status / _excluir_evento / _dashboard do backend.
//
// Estrutura salva em localStorage:
//   ROTINAS_KEY   -> array "eventos" (equivalente à tabela `eventos`):
//     { id, titulo, descricao, tipo, data_inicio: "YYYY-MM-DD HH:MM:SS",
//       data_fim: "YYYY-MM-DD HH:MM:SS" (sempre igual a data_inicio, como no
//       backend), repeticao: "nenhuma"|"diaria"|"semanal"|"mensal"|"anual",
//       concluido: 0|1|2 (espelha o último status gravado, igual ao backend) }
//   EXECUCAO_KEY   -> array (equivalente à tabela `eventos_execucao`):
//     { evento_id, data: "YYYY-MM-DD" }
//   CONCLUIDOS_KEY -> array (equivalente à tabela `eventos_concluidos`):
//     { evento_id, data: "YYYY-MM-DD", data_conclusao: "YYYY-MM-DD" }

const ROTINAS_KEY = 'rotinas_eventos_v1';
const EXECUCAO_KEY = 'rotinas_execucao_v1';
const CONCLUIDOS_KEY = 'rotinas_concluidos_v1';

function _lerEventos() { try { return JSON.parse(localStorage.getItem(ROTINAS_KEY)) || []; } catch { return []; } }
function _salvarEventos(l) { localStorage.setItem(ROTINAS_KEY, JSON.stringify(l)); }
function _lerExecucao() { try { return JSON.parse(localStorage.getItem(EXECUCAO_KEY)) || []; } catch { return []; } }
function _salvarExecucao(l) { localStorage.setItem(EXECUCAO_KEY, JSON.stringify(l)); }
function _lerConcluidos() { try { return JSON.parse(localStorage.getItem(CONCLUIDOS_KEY)) || []; } catch { return []; } }
function _salvarConcluidos(l) { localStorage.setItem(CONCLUIDOS_KEY, JSON.stringify(l)); }
function _proximoId(lista) { return lista.reduce((max, ev) => Math.max(max, ev.id), 0) + 1; }
// normaliza "Mensal", " mensal ", "MENSAL" etc. pro valor esperado pelas comparações
function _normRep(rep) { return (rep || 'nenhuma').toString().trim().toLowerCase(); }
function _pad(n) { return String(n).padStart(2, "0"); }
function _fmtDataHora(d) { return `${d.getFullYear()}-${_pad(d.getMonth()+1)}-${_pad(d.getDate())} ${_pad(d.getHours())}:${_pad(d.getMinutes())}:${_pad(d.getSeconds())}`; }
function _fmtData(d) { return `${d.getFullYear()}-${_pad(d.getMonth()+1)}-${_pad(d.getDate())}`; }
function _parseDataHora(s) {
    const [dataParte, horaParte = "00:00:00"] = s.split(" ");
    const [y, m, d] = dataParte.split("-").map(Number);
    const [hh = 0, mm = 0, ss = 0] = horaParte.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, ss);
}

// status de uma ocorrência específica: 2=concluído, 1=em execução, 0=nenhum
function _statusDeInstancia(eventoId, dataStr) {
    if (_lerConcluidos().some(c => c.evento_id === eventoId && c.data === dataStr)) return 2;
    if (_lerExecucao().some(e => e.evento_id === eventoId && e.data === dataStr)) return 1;
    return 0;
}

// equivalente a _processamento_alterar_status: reset total e regrava o novo estado
function _setStatusInstancia(eventoId, dataStr, status) {
    const execucao = _lerExecucao().filter(e => !(e.evento_id === eventoId && e.data === dataStr));
    const concluidos = _lerConcluidos().filter(c => !(c.evento_id === eventoId && c.data === dataStr));

    if (status === 1) {
        execucao.push({ evento_id: eventoId, data: dataStr });
    } else if (status === 2) {
        concluidos.push({ evento_id: eventoId, data: dataStr, data_conclusao: _fmtData(new Date()) });
    }
    _salvarExecucao(execucao);
    _salvarConcluidos(concluidos);

    // o backend também sobrescreve `eventos.concluido` com o último status gravado
    const eventos = _lerEventos();
    const ev = eventos.find(e => e.id === eventoId);
    if (ev) { ev.concluido = status; _salvarEventos(eventos); }
}

// próxima ocorrência mensal, clampando pro último dia do mês se preciso (igual ao backend)
function _proximoMes(d) {
    let mes = d.getMonth() + 2; // +1 (1-based) +1 (avança um mês)
    const ano = d.getFullYear() + Math.floor((mes - 1) / 12);
    mes = ((mes - 1) % 12) + 1;
    let dia = d.getDate();
    while (dia > 0) {
        const diasNoMes = new Date(ano, mes, 0).getDate();
        if (dia <= diasNoMes) return new Date(ano, mes - 1, dia, d.getHours(), d.getMinutes(), d.getSeconds());
        dia--;
    }
}

// próxima ocorrência anual, com fallback 29/02 -> 28/02 (igual ao backend)
function _proximoAno(d) {
    const ano = d.getFullYear() + 1;
    const diasNoMes = new Date(ano, d.getMonth() + 1, 0).getDate();
    const dia = d.getDate() > diasNoMes ? diasNoMes : d.getDate();
    return new Date(ano, d.getMonth(), dia, d.getHours(), d.getMinutes(), d.getSeconds());
}

// ocorrência mensal MAIS RECENTE (<= hoje) de um evento de demonstração,
// caminhando a partir da data base do evento (ev.data_inicio). Usado tanto
// por apiDashboard (atrasados) quanto por _resetarStatusEventosDemo, pra
// manter os dois em sincronia — antes cada um assumia (de jeitos ligeiramente
// diferentes) que a ocorrência "certa" era sempre a do mês corrente, o que
// quebra quando o evento demo tem um offsetDias grande o suficiente pra cair
// num mês anterior (ex.: offsetDias: -11 virando outro mês)
function _ocorrenciaDemoAtual(ev, hoje) {
    const hojeData = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const base = _parseDataHora(ev.data_inicio);
    let ocorrencia = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    if (ocorrencia > hojeData) return ocorrencia; // base ainda não chegou (não deveria acontecer no fluxo normal)

    let proxima = _proximoMes(ocorrencia);
    while (proxima <= hojeData) {
        ocorrencia = proxima;
        proxima = _proximoMes(proxima);
    }
    return ocorrencia;
}

// equivalente a _processamento_listar_eventos (com year/month sempre informados)
export async function apiListarEventos(year, month, exportar = false) {
    const start = new Date(year, month - 1, 1);
    const end = month === 12 ? new Date(year + 1, 0, 1) : new Date(year, month, 1);

    const eventos = _lerEventos();
    const instances = [];

    eventos.forEach(r => {
        const baseStart = _parseDataHora(r.data_inicio);
        const baseEnd = r.data_fim ? _parseDataHora(r.data_fim) : baseStart;
        const duracao = baseEnd.getTime() - baseStart.getTime();

        function addIfInRange(sdt) {
            if (sdt >= start && sdt < end) {
                const edt = new Date(sdt.getTime() + duracao);
                const dataInst = _fmtData(sdt);
                const status = _statusDeInstancia(r.id, dataInst);
                instances.push(exportar ? {
                    titulo: r.titulo, tipo: r.tipo, repeticao: r.repeticao,
                    data_inicio: _fmtDataHora(sdt), data_fim: _fmtDataHora(edt), concluido: status
                } : {
                    id: r.id, titulo: r.titulo, descricao: r.descricao, tipo: r.tipo,
                    repeticao: r.repeticao, data_inicio: _fmtDataHora(sdt), data_fim: _fmtDataHora(edt),
                    concluido: status
                });
            }
        }

        // instância base
        addIfInRange(baseStart);

        // repetições — o backend só expande semanal/mensal/anual aqui (não "diaria")
        const rep = _normRep(r.repeticao);
        if (rep === 'semanal') {
            let s = baseStart;
            while (true) {
                s = new Date(s.getTime() + 7 * 86400000);
                if (s >= end) break;
                addIfInRange(s);
            }
        } else if (rep === 'mensal') {
            let s = baseStart;
            while (true) {
                s = _proximoMes(s);
                if (s >= end) break;
                addIfInRange(s);
            }
        } else if (rep === 'anual') {
            let s = baseStart;
            while (true) {
                s = _proximoAno(s);
                if (s >= end) break;
                addIfInRange(s);
            }
        }
    });

    instances.sort((a, b) => a.data_inicio.localeCompare(b.data_inicio));
    return instances;
}

// equivalente a _processamento_adicionar_evento
export async function apiCriarEvento(body) {
    const eventos = _lerEventos();
    const dataInicio = body.data_inicio || '2001-01-01 00:00:00';
    const novo = {
        id: _proximoId(eventos),
        titulo: body.titulo,
        descricao: body.descricao,
        tipo: body.tipo,
        data_inicio: dataInicio,
        data_fim: dataInicio, // igual ao backend: data_fim sempre = data_inicio
        repeticao: body.repeticao || 'nenhuma',
        concluido: body.concluido ?? 0
    };
    eventos.push(novo);
    _salvarEventos(eventos);
    return novo;
}

// equivalente a _processamento_editar_evento
export async function apiAtualizarEvento(id, body) {
    const eventos = _lerEventos();
    const ev = eventos.find(e => e.id === id);
    if (!ev) return null;
    const dataInicio = body.data_inicio || '2001-01-01 00:00:00';
    ev.titulo = body.titulo;
    ev.descricao = body.descricao;
    ev.tipo = body.tipo;
    ev.data_inicio = dataInicio;
    ev.data_fim = dataInicio;
    ev.repeticao = body.repeticao || 'nenhuma';
    ev.concluido = body.concluido ?? 0;
    _salvarEventos(eventos);
    return ev;
}

// equivalente a _processamento_excluir_evento
export async function apiExcluirEvento(id) {
    _salvarEventos(_lerEventos().filter(ev => ev.id !== id));
    _salvarExecucao(_lerExecucao().filter(e => e.evento_id !== id));
    _salvarConcluidos(_lerConcluidos().filter(c => c.evento_id !== id));
}

// equivalente a _processamento_alterar_status
export async function apiAtualizarStatus(id, dataStr, status) {
    _setStatusInstancia(id, dataStr, status);
}

// equivalente a _processamento_dashboard
export async function apiDashboard() {
    const eventos = _lerEventos();
    const execucao = _lerExecucao();
    const concluidos = _lerConcluidos();
    const hoje = new Date();
    const hojeStr = _fmtData(hoje);
    const mesAtual = `${hoje.getFullYear()}-${_pad(hoje.getMonth() + 1)}`;
    const weekdayHoje = (hoje.getDay() + 6) % 7; // segunda=0 ... domingo=6, igual ao WEEKDAY() do MySQL

    // ---- eventos do dia ----
    const emExecHojeIds = new Set(execucao.filter(e => e.data === hojeStr).map(e => e.evento_id));
    const concluidosHojeIds = new Set(concluidos.filter(c => c.data === hojeStr).map(c => c.evento_id));

    const eventosHoje = eventos.filter(ev => {
        if (emExecHojeIds.has(ev.id) || concluidosHojeIds.has(ev.id)) return false;
        const inicio = _parseDataHora(ev.data_inicio);
        if (_fmtData(inicio) === hojeStr) return true;
        const repHoje = _normRep(ev.repeticao);
        if (repHoje === 'semanal' && ((inicio.getDay() + 6) % 7) === weekdayHoje) return true;
        if (repHoje === 'mensal' && inicio.getDate() === hoje.getDate()) return true;
        if (repHoje === 'anual' && inicio.getMonth() === hoje.getMonth() && inicio.getDate() === hoje.getDate()) return true;
        return false;
    }).sort((a, b) => a.titulo.localeCompare(b.titulo));

    // ---- eventos em execução (todos, não só hoje) ----
    // já inclui os eventos de demonstração normalmente, porque
    // _resetarStatusEventosDemo grava o registro real deles aqui
    const emExecucao = execucao.map(e => {
        const ev = eventos.find(x => x.id === e.evento_id);
        return ev ? { ...ev, data_inicio: e.data } : null;
    }).filter(Boolean).sort((a, b) => a.titulo.localeCompare(b.titulo));

    // ---- concluídos no mês atual ----
    const concluidosHoje = concluidos.filter(c => (c.data_conclusao || '').startsWith(mesAtual))
        .map(c => {
            const ev = eventos.find(x => x.id === c.evento_id);
            return ev ? { ...c, data_inicio: c.data, titulo: ev.titulo, descricao: ev.descricao } : null;
        }).filter(Boolean).sort((a, b) => a.titulo.localeCompare(b.titulo));

    // ---- atrasados ----
    const atrasados = [];
    // meia-noite de hoje, pra comparar só a DATA (igual ao .date() do backend em Python) —
    // sem isso, um evento marcado pra hoje "vencia" assim que passasse das 00h00
    const hojeData = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    eventos.forEach(ev => {
        if (ev.data_inicio === '2001-01-01 00:00:00') return; // "esporádico" sem data
        const isDemo = ev.statusFixo !== undefined && ev.statusFixo !== null;
        const inicioDt = _parseDataHora(ev.data_inicio);
        const datas = [];

        if (isDemo) {
            // eventos de demonstração: usa a ocorrência mais recente de fato
            // (mesmo cálculo do _resetarStatusEventosDemo — ver _ocorrenciaDemoAtual)
            const ocorrenciaAtual = _ocorrenciaDemoAtual(ev, hoje);
            if (ocorrenciaAtual < hojeData) datas.push(ocorrenciaAtual);
        } else {
            const rep = _normRep(ev.repeticao);
            if (rep === 'nenhuma') {
                if (inicioDt < hojeData) datas.push(inicioDt);
            } else if (rep === 'diaria') {
                let d = new Date(inicioDt), i = 0;
                while (d < hojeData && i < 3700) { datas.push(new Date(d)); d.setDate(d.getDate() + 1); i++; }
            } else if (rep === 'semanal') {
                let d = new Date(inicioDt), i = 0;
                while (d < hojeData && i < 1000) { datas.push(new Date(d)); d.setDate(d.getDate() + 7); i++; }
            } else if (rep === 'mensal') {
                let d = new Date(inicioDt), i = 0;
                while (d < hojeData && i < 500) { datas.push(new Date(d)); d = _proximoMes(d); i++; }
            } else if (rep === 'anual') {
                let d = new Date(inicioDt), i = 0;
                while (d < hojeData && i < 100) { datas.push(new Date(d)); d = _proximoAno(d); i++; }
            }
        }

        datas.forEach(instDt => {
            const dataStr = _fmtData(instDt);
            if (_statusDeInstancia(ev.id, dataStr) !== 0) return; // já em execução ou concluído
            atrasados.push({
                id: ev.id, titulo: ev.titulo, descricao: ev.descricao, tipo: ev.tipo,
                repeticao: ev.repeticao, concluido: 0,
                data_inicio: `${dataStr} 00:00:00`, data_fim: `${dataStr} 23:59:59`
            });
        });
    });

    return {
        hoje: eventosHoje,
        em_execucao: emExecucao,
        atrasados,
        concluidos_hoje: concluidosHoje,
        quantidades: {
            hoje: eventosHoje.length,
            em_execucao: emExecucao.length,
            atrasados: atrasados.length,
            concluidos_hoje: concluidosHoje.length
        }
    };
}

// converte string pra bytes latin-1 (o backend gera o CSV com encoding='latin-1')
function _paraLatin1Bytes(str) {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        bytes[i] = code < 256 ? code : 63; // '?' pra caracteres fora do latin-1
    }
    return bytes;
}

// equivalente ao trecho de exportação de _processamento_listar_eventos.
// OBS: o backend só gera CSV de verdade (usa pandas.to_csv), mesmo quando o
// front oferece as opções xlsx/pdf — então aqui também sempre geramos CSV,
// só trocando o nome do arquivo é responsabilidade de quem chama.
export function exportarLocal(events) {
    const colunas = ['titulo', 'tipo', 'repeticao', 'data_inicio', 'data_fim', 'concluido'];
    const linhas = [colunas.join(';')];
    events.forEach(ev => linhas.push(colunas.map(c => ev[c] ?? '').join(';')));
    const bytes = _paraLatin1Bytes(linhas.join('\n'));
    return new Blob([bytes], { type: 'text/csv' });
}

// -----------------------------------------------------------------------
// ---------- EVENTOS FIXOS DE DEMONSTRAÇÃO (semeados automaticamente) ----
// -----------------------------------------------------------------------
// _semearEventosDemo() apaga e recria os eventos demo (e seus registros reais
// em eventos_execucao/eventos_concluidos) toda vez que é chamada — não semeia
// mais só uma vez. Eles funcionam como eventos normais no dia a dia (clicar
// neles grava registro real, do jeito de sempre) — a função
// _resetarStatusEventosDemo() é quem devolve cada um ao seu status padrão
// (guardado em `statusFixo`), reescrevendo o registro real da ocorrência do
// mês atual. Chame as duas sempre que a página do CALENDÁRIO for carregada.
const EVENTOS_DEMO = [
    { titulo: 'CND Receita Federal CNPJ',        statusFixo: 0 }, // em aberto
    { titulo: 'Boletos Sindicatos',               statusFixo: 0 }, // em aberto
    { titulo: 'Resumo de impostos',                statusFixo: 0, offsetDias: 0 }, // em aberto, no dia atual (sem o -1 dia)
    { titulo: 'CND Receita Federal CPF',          statusFixo: 1, offsetDias: -2 }, // em execução
    { titulo: 'Consulta Débitos Estaduais',        statusFixo: 1, offsetDias: -2 }, // em execução
    { titulo: 'Diagnóstico Fiscal',                statusFixo: 1, offsetDias: -3 }, // em execução
    { titulo: 'Encaminha Docs WhatsApp',           statusFixo: 1 }, // em execução
    { titulo: 'Faturamento X Compra',              statusFixo: 1 }, // em execução
    { titulo: 'Pendências SIGISSWEB',              statusFixo: 1 }, // em execução
    { titulo: 'Transmite DeSTDA sem movimento',    statusFixo: 1 }, // em execução
    { titulo: 'Consulta Divida Ativa',             statusFixo: 2 }, // concluída
];

export function _semearEventosDemo() {
    // apaga qualquer evento demo criado antes (e os registros reais de
    // execução/conclusão vinculados a eles), pra recriar tudo do zero
    let eventos = _lerEventos();
    const idsDemoAntigos = new Set(eventos.filter(e => e.demo === true).map(e => e.id));
    if (idsDemoAntigos.size > 0) {
        eventos = eventos.filter(e => !idsDemoAntigos.has(e.id));
        _salvarExecucao(_lerExecucao().filter(e => !idsDemoAntigos.has(e.evento_id)));
        _salvarConcluidos(_lerConcluidos().filter(c => !idsDemoAntigos.has(c.evento_id)));
    }

    const hoje = new Date();

    EVENTOS_DEMO.forEach(demo => {
        // por padrão, um dia antes da 1ª abertura do site (offsetDias: -1);
        // "Resumo de impostos" usa offsetDias: 0 pra cair no dia atual
        const offset = demo.offsetDias ?? -1;
        const diaBase = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + offset);
        // como a repetição é mensal, a partir daí o evento aparece nesse mesmo dia todo mês
        const dataBase = `${diaBase.getFullYear()}-${_pad(diaBase.getMonth() + 1)}-${_pad(diaBase.getDate())} 09:00:00`;

        eventos.push({
            id: _proximoId(eventos),
            titulo: demo.titulo,
            descricao: 'Evento de demonstração',
            tipo: 'Robô',
            data_inicio: dataBase,
            data_fim: dataBase,
            repeticao: 'mensal',
            concluido: demo.statusFixo,
            statusFixo: demo.statusFixo,
            demo: true
        });
    });

    _salvarEventos(eventos);
}

// devolve cada evento de demonstração ao seu status padrão (statusFixo),
// reescrevendo o registro real (eventos_execucao/eventos_concluidos) da
// ocorrência mensal mais recente de fato (não necessariamente a do mês
// corrente — ver _ocorrenciaDemoAtual) — chamar sempre que a página do
// calendário carregar
export function _resetarStatusEventosDemo() {
    const eventos = _lerEventos();
    const demoEventos = eventos.filter(e => e.statusFixo !== undefined && e.statusFixo !== null);
    if (demoEventos.length === 0) return;

    const idsDemo = new Set(demoEventos.map(e => e.id));
    // remove qualquer registro real antigo desses eventos, de qualquer data
    let execucao = _lerExecucao().filter(e => !idsDemo.has(e.evento_id));
    let concluidos = _lerConcluidos().filter(c => !idsDemo.has(c.evento_id));

    const hoje = new Date();

    demoEventos.forEach(ev => {
        const dataOcorrencia = _fmtData(_ocorrenciaDemoAtual(ev, hoje));

        if (ev.statusFixo === 1) {
            execucao.push({ evento_id: ev.id, data: dataOcorrencia });
        } else if (ev.statusFixo === 2) {
            concluidos.push({ evento_id: ev.id, data: dataOcorrencia, data_conclusao: dataOcorrencia });
        }
        // statusFixo === 0: não grava nada -> evento fica em aberto

        ev.concluido = ev.statusFixo; // espelha o mesmo efeito colateral do backend
    });

    _salvarEventos(eventos);
    _salvarExecucao(execucao);
    _salvarConcluidos(concluidos);
}
// -----------------------------------------------------------------------
// -------------- FIM DOS EVENTOS FIXOS DE DEMONSTRAÇÃO -------------------
// -----------------------------------------------------------------------
// =====================================================================
// -------------------- FIM DA CAMADA DE DADOS --------------------------
// =====================================================================