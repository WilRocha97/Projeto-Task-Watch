let pipWindow = null;
// chave: card original (HTMLElement) → { wrapper, clone, observer, syncScheduled }
const pipCards = new Map();

export async function alternarCardNoPiP(card, target) {
    // se já tá na PiP, remove
    if (pipCards.has(card)) {
        removerCardDoPiP(card, target);
        return;
    }
    // garante a janela aberta
    if (!pipWindow) {
        await abrirJanelaPiP();
    }
    adicionarCardAoPiP(card, target);
}

async function abrirJanelaPiP() {
    pipWindow = await documentPictureInPicture.requestWindow({
        width: 420,
        height: 520, // mais alto pra caber vários cards
    });

    // copia estilos
    [...document.styleSheets].forEach(sheet => {
        try {
            const css = [...sheet.cssRules].map(r => r.cssText).join('');
            const style = pipWindow.document.createElement('style');
            style.textContent = css;
            pipWindow.document.head.appendChild(style);
        } catch {
            const link = pipWindow.document.createElement('link');
            link.rel = 'stylesheet';
            link.href = sheet.href;
            pipWindow.document.head.appendChild(link);
        }
    });

    // estilos exclusivos da PiP
    const styleExtra = pipWindow.document.createElement('style');
    styleExtra.textContent = `
        html, body {
            margin: 0; padding: 0;
            background: #0a0a0a;
            height: 100%;
            transition: 0.2s ease-in-out;
        }
        body {
            display: flex; 
            flex-direction: column;
            padding: 8px; gap: 8px;
            scale: 0.9;
            box-sizing: border-box;
            overflow-y: auto;
            overflow-x: hidden;
        }
        .pipCardWrapper {
            position: relative;
            flex-shrink: 0;
        }
        .pipCardWrapper .pip-clone {
            margin: 0 !important;
        }
        /* desliga interação no clone */
        .pip-clone, .pip-clone * { pointer-events: none; }

        /* esconde botões originais dentro do clone */
        .pip-clone .botaoFixar,
        .pip-clone .botaoFechar,
        .pip-clone .botaoPip,
        .pip-clone .maisInfo,
        .pip-clone .maisInfo2,
        .pip-clone .maisInfo3 {
            display: none !important;
        }

        /* botão de fechar individual de cada card na PiP */
        .pipCardFechar {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 22px;
            height: 22px;
            color: rgb(232, 23, 23);
            background: #ffffff;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
            z-index: 15;
            pointer-events: auto;
        }
        .pipCardFechar:hover { background: rgba(138, 138, 138, 0.42); }

        /* scrollbar discreta */
        body::-webkit-scrollbar { width: 6px; }
        body::-webkit-scrollbar-thumb {
            background: rgba(232,168,23,0.3);
            border-radius: 3px;
        }
    `;
    pipWindow.document.head.appendChild(styleExtra);

    // ao fechar a janela inteira: limpa tudo
    pipWindow.addEventListener('pagehide', () => {
        pipCards.forEach((entry, original) => {
            entry.observer.disconnect();
            original.classList.remove('emPip');
        });
        pipCards.clear();
        pipWindow = null;
    });
}

function adicionarCardAoPiP(card, target) {
    card.classList.add('collapsed');
    card.classList.add('emPip');

    // wrapper contendo o clone + botão de fechar individual
    const wrapper = pipWindow.document.createElement('div');
    wrapper.className = 'pipCardWrapper';

    const btnFechar = pipWindow.document.createElement('button');
    btnFechar.className = 'pipCardFechar';
    btnFechar.textContent = '×';
    btnFechar.title = 'Remover este card da janela flutuante';
    btnFechar.addEventListener('click', () => removerCardDoPiP(card, target));

    const clone = criaClone(card);
    wrapper.appendChild(btnFechar);
    wrapper.appendChild(clone);
    pipWindow.document.body.appendChild(wrapper);

    // observer dedicado pra esse card
    const entry = { wrapper, clone, observer: null, syncScheduled: false };
    entry.observer = new MutationObserver(() => agendaSync(card));
    entry.observer.observe(card, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
    });

    pipCards.set(card, entry);
    target.classList.add('botaoPipAtivado');
}

function removerCardDoPiP(card, target) {
    const entry = pipCards.get(card);
    if (!entry) return;

    entry.observer.disconnect();
    entry.wrapper.remove();
    card.classList.remove('emPip');
    pipCards.delete(card);

    // se foi o último, fecha a janela
    if (pipCards.size === 0 && pipWindow) {
        pipWindow.close();
    }
    target.classList.remove('botaoPipAtivado');
}

function criaClone(card) {
    const clone = card.cloneNode(true);
    clone.classList.add('pip-clone');
    clone.classList.remove('emPip');
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    return clone;
}

function agendaSync(card) {
    const entry = pipCards.get(card);
    if (!entry || entry.syncScheduled) return;
    entry.syncScheduled = true;
    requestAnimationFrame(() => {
        entry.syncScheduled = false;
        const atual = pipCards.get(card);
        if (!atual || !pipWindow) return;

        const novoClone = criaClone(card);
        atual.clone.replaceWith(novoClone);
        atual.clone = novoClone;
    });
}