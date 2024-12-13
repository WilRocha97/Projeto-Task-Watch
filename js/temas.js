export function decoracao(card) {
    // Escolhe uma imagem aleatória
    const {periodo, feriado} = definePeriodo()

    if (periodo > 0) {
        const imagemAleatoria = [Math.floor(Math.random() * periodo)];
        // Atualiza a imagem
        card.querySelector('#decoracao').src = `assets/temas/${feriado}/${imagemAleatoria}.png`;
    }
    else {
        card.querySelector('#decoracao').remove()
    }
    
}

function definePeriodo() {
    const hoje = new Date();
    const dia = hoje.getDate();
    const mes = hoje.getMonth() + 1; // Os meses no JavaScript começam em 0

    let periodo;
    let feriado;

    // Verifica se está entre 1º de dezembro e 10 de janeiro
    if ((mes === 12 && dia >= 1) || (mes === 12 && dia <= 31)) {
        periodo = 8;
        feriado = 'natal'
    } 
    else if ((mes === 1 && dia >= 1) || (mes === 1 && dia <= 2)) {
        periodo = 8;
        feriado = 'anoNovo'
    }
    else if ((mes === 4 && dia >= 1) || (mes === 4 && dia <= 30)) {
        periodo = 6;
        feriado = 'pascoa'
    }
    else if ((mes === 10 && dia >= 1) || (mes === 10 && dia <= 31)) {
        periodo = 19;
        feriado = 'halloween'
    }
    else {
        periodo = 0; // Outro valor padrão, pode ser ajustado conforme necessário
    }

    return {periodo, feriado};
}