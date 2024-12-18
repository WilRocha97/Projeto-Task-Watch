const botaoFiltroGeral = document.getElementById('bolinhaGeral');
const botaoFiltroFechar = document.getElementById('bolinhaFechar');
const botaoFiltroOciosa = document.getElementById('bolinhaOcioso');
const botaoFiltroErro = document.getElementById('bolinhaErro');
const botaoFiltroFinal = document.getElementById('bolinhaFinal');
const botoesFiltro = document.querySelectorAll('.bFiltro');

const historicoBotao = document.getElementById('historico');
const historicoTela = document.getElementById('historicoTela');
const mainHistorico = document.getElementById('targetHistorico');
var historicoLinha = document.querySelectorAll('.linha');

var screenWidth = window.innerWidth;

function filtraHistorico(colunaOcorrencias, filtro) {
    botoesFiltro.forEach(filtro => {
        filtro.classList.remove('clicado')
    });

    // Percorre todos os elementos selecionados
    historicoLinha = document.querySelectorAll('.linha');
    historicoLinha.forEach((element) => {
        element.classList.add('invisible2');
    });
    setTimeout(()=> {
        colunaOcorrencias.forEach((element) => {
            // Verifica se o elemento contém a classe 'ocioso'
            if (!element.classList.contains(filtro)) {
                // Adiciona a classe 'collapsed'
                const parent = element.closest('div'); // Encontra a div pai mais próxima
                parent.classList.add('collapsed');
            };
            // Verifica se o elemento contém a classe 'ocioso'
            if (element.classList.contains(filtro)) {
                // Adiciona a classe 'collapsed'
                const parent = element.closest('div'); // Encontra a div pai mais próxima
                parent.classList.remove('collapsed');
                // desce para a base da página e da tela de histórico
                setTimeout(()=> {
                    if (screenWidth < 2500) {
                        const target = document.getElementById('targetHistorico');
                        const targetPosition = target.offsetTop; /* Pega a posição do topo do elemento */
                    
                        window.scrollTo({
                            top: targetPosition, 
                            behavior: 'smooth' /* Scroll suave */
                        });
                    }
                    historicoTela.scrollTo({
                        top: historicoTela.scrollHeight,
                        behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
                    });
                }, 500);
            };
        });
    }, 500);
    setTimeout(()=> {
        historicoLinha.forEach((element) => {
            element.classList.remove('invisible2');
        });
    }, 800);
};

// Abre e fecha a tela de histórico
historicoBotao.addEventListener('click', ()=> {
    document.querySelectorAll('.bn').forEach(bolinha => {
        bolinha.classList.add('invisible');
    })
    mainHistorico.classList.toggle('collapsed')

    if (mainHistorico.classList.contains('collapsed')) {
        // sobe para o topo da página
        setTimeout(()=> {
            if (screenWidth < 2500) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
                });
            }
        }, 500);
    }
    else {
        // desce para a base da página e da tela de histórico
        setTimeout(()=> {
            if (screenWidth < 2500) {
                const target = document.getElementById('targetHistorico');
                const targetPosition = target.offsetTop; /* Pega a posição do topo do elemento */
            
                window.scrollTo({
                    top: targetPosition, 
                    behavior: 'smooth' /* Scroll suave */
                });
            }

            historicoTela.scrollTo({
                top: historicoTela.scrollHeight,
                behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
            });
        }, 500);
    }
});
// Adiciona o evento de clique na tela de histórico para evitar a propagação
mainHistorico.addEventListener('click', (e) => {
    e.stopPropagation();
});
botaoFiltroGeral.addEventListener('click', ()=> {
    botoesFiltro.forEach(filtro => {
        filtro.classList.remove('clicado')
    });
    
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');

    historicoLinha = document.querySelectorAll('.linha');
    historicoLinha.forEach((element) => {
        element.classList.add('invisible2');
    });
    setTimeout(()=> {
        // Percorre todos os elementos selecionados
        ocorrencias.forEach((element) => {
            const parent = element.closest('div'); // Encontra a div pai mais próxima
            parent.classList.remove('collapsed');
        });
        // desce para a base da página e da tela de histórico
        setTimeout(()=> {
            if (screenWidth < 2500) {
                const target = document.getElementById('targetHistorico');
                const targetPosition = target.offsetTop; /* Pega a posição do topo do elemento */
            
                window.scrollTo({
                    top: targetPosition, 
                    behavior: 'smooth' /* Scroll suave */
                });
            }
            historicoTela.scrollTo({
                top: historicoTela.scrollHeight,
                behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
            });
        }, 700);
    }, 700);
    setTimeout(()=> {
        historicoLinha.forEach((element) => {
            element.classList.remove('invisible2');
        });
    }, 800);
    botaoFiltroGeral.classList.add('clicado')
});
botaoFiltroFechar.addEventListener('click', ()=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    filtraHistorico(ocorrencias, 'fechado')
    botaoFiltroFechar.classList.add('clicado')
});
botaoFiltroOciosa.addEventListener('click', ()=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    filtraHistorico(ocorrencias, 'ociosa')
    botaoFiltroOciosa.classList.add('clicado')
});
botaoFiltroErro.addEventListener('click', ()=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    filtraHistorico(ocorrencias, 'erro')
    botaoFiltroErro.classList.add('clicado')
});
botaoFiltroFinal.addEventListener('click', ()=> {
    // Seleciona todos os elementos cujo ID comece com 'ocorrencia'
    const ocorrencias = document.querySelectorAll('[id^="ocorrencia"]');
    filtraHistorico(ocorrencias, 'finalizada')
    botaoFiltroFinal.classList.add('clicado')
});
