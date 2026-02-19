function definevariantesImagens() {
    const hoje = new Date();
    const dia = hoje.getDate();
    const mes = hoje.getMonth() + 1; // Os meses no JavaScript começam em 0

    let variantesImagens;
    let feriado;

    // Verifica datas
    if ((mes === 12 && dia >= 30) || (mes === 1 && dia <= 2)) {
        variantesImagens = 11;
        feriado = 'anoNovo'
    }
    else if ((mes === 2 && dia >= 15) && (mes === 2 && dia <= 18)) {
        variantesImagens = 12;
        feriado = 'carnaval'
    }
    else if ((mes === 4 && dia >= 2) && (mes === 4 && dia <= 6)) {
        variantesImagens = 12;
        feriado = 'pascoa'
    }
    else if ((mes === 6 && dia >= 21) && (mes === 6 && dia <= 30)) {
        variantesImagens = 19;
        feriado = 'junina'
    }
    else if ((mes === 10 && dia >= 1) && (mes === 10 && dia <= 30)) {
        variantesImagens = 18;
        feriado = 'halloween'
    }
    else if ((mes === 10 && dia >= 31) || (mes === 11 && dia <= 5)) {
        variantesImagens = 19;
        feriado = 'diaDeMuertos'
    }
    else if ((mes === 12 && dia >= 1) && (mes === 12 && dia <= 29)) {
        variantesImagens = 12;
        feriado = 'natal'
    }
    else {
        variantesImagens = 0;
    }

    return {variantesImagens, feriado};
}

function applyPatternTo(selector, options = {}) {
    const { url, size = '150px 150px', useOverlay = true } = options;
    const els = document.querySelectorAll(selector);
    if (!els.length) {
        console.warn('Nenhum elemento encontrado para', selector);
        return;
    }
    if (!url) {
        console.warn('Nenhuma URL informada para o pattern');
        return;
    }

    // testa carregamento da imagem antes de aplicar
    const testImg = new Image();
    testImg.onload = () => {
        els.forEach(elem => {
        if (getComputedStyle(elem).position === 'static') elem.style.position = 'relative';

        // remove overlay existente
        const existing = elem.querySelector(':scope > .pattern-overlay');
        if (existing) existing.remove();

        if (!useOverlay) {
            // modo direto no background do elemento (mais simples, mas pode sobrescrever background existente)
            elem.style.backgroundImage = `url("${url}")`;
            elem.style.backgroundRepeat = 'repeat';
            elem.style.backgroundSize = size;
        } else {
            const overlay = document.createElement('div');
            overlay.className = 'pattern-overlay';
            overlay.style.position = 'absolute';
            overlay.style.inset = '0';
            overlay.style.pointerEvents = 'none';
            overlay.style.backgroundImage = `url("${url}")`;
            overlay.style.backgroundRepeat = 'repeat';
            overlay.style.backgroundSize = size;
            overlay.style.zIndex = '1';
            elem.insertBefore(overlay, elem.firstChild);

            // garante que tudo que for conteúdo fique acima do overlay
            Array.from(elem.children).forEach(ch => {
            if (ch === overlay) return;
            if (getComputedStyle(ch).position === 'static') ch.style.position = 'relative';
            ch.style.zIndex = '2';
            });
        }
        });
        console.log('Pattern aplicado em', els.length, 'elemento(s).');
    };
    testImg.onerror = () => {
        console.error('Falha ao carregar a imagem do pattern:', url);
    };
    testImg.src = url;
}

export function decoracao(card) {
    // Escolhe uma imagem aleatória
    const {variantesImagens, feriado} = definevariantesImagens()

    if (feriado !== 'anoNovo') {
        // console.log(feriado)
        const elementos = document.querySelectorAll('.firework');
        for (let i = 0; i < 3 && i < elementos.length; i++) {
            elementos[i].remove();
        }
    }
    
    if (variantesImagens > 0) {
        const imagemAleatoria = [Math.floor(Math.random() * variantesImagens)];
        // Atualiza a imagem
        card.querySelector('#decoracao').src = `assets/temas/${feriado}/${imagemAleatoria}.png`;
        card.querySelector('#decoracao').alt = `Figurinha ${feriado}`;

        // Função para aplocar pattern em elementos especificos
        //applyPatternTo('.fundo', {
        //    url: "assets/temas/" + feriado + "/icone_final.png",
        //    size: '64px 64px',
        //    useOverlay: true
        //});

    }
    else {
        card.querySelector('#decoracao').remove()
    }
}
