export function decoracao(card) {
    // Escolhe uma imagem aleatória
    const {variantesImagens, feriado} = definevariantesImagens()

    if (variantesImagens > 0) {
        const imagemAleatoria = [Math.floor(Math.random() * variantesImagens)];
        // Atualiza a imagem
        card.querySelector('#decoracao').src = `assets/temas/${feriado}/${imagemAleatoria}.png`;
    }
    else {
        card.querySelector('#decoracao').remove()
    }
    
}

function definevariantesImagens() {
    const hoje = new Date();
    const dia = hoje.getDate();
    const mes = hoje.getMonth() + 1; // Os meses no JavaScript começam em 0

    let variantesImagens;
    let feriado;

    // Verifica datas
    if ((mes === 12 && dia >= 1) || (mes === 12 && dia <= 31)) {
        variantesImagens = 18;
        feriado = 'natal'
    } 
    else if ((mes === 1 && dia >= 1) || (mes === 1 && dia <= 2)) {
        variantesImagens = 5;
        feriado = 'anoNovo'
    }
    else if ((mes === 2 && dia >= 1) || (mes === 3 && dia <= 10)) {
        variantesImagens = 8;
        feriado = 'carnaval'
    }
    else if ((mes === 4 && dia >= 1) || (mes === 4 && dia <= 30)) {
        variantesImagens = 6;
        feriado = 'pascoa'
    }
    else if ((mes === 6 && dia >= 1) || (mes === 7 && dia <= 31)) {
        variantesImagens = 16;
        feriado = 'junina'
    }
    else if ((mes === 10 && dia >= 1) || (mes === 10 && dia <= 31)) {
        variantesImagens = 18;
        feriado = 'halloween'
    }
    else {
        variantesImagens = 0;
    }

    return {variantesImagens, feriado};
}