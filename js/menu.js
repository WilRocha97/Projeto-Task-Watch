const menu = document.getElementById('menu');
const fundoCabecalho = document.getElementById('cabecalho');
const telaRotinas = document.getElementById('telaRotinas');
const telaMaquinas = document.getElementById('telaMaquinas');
const telaDemandas = document.getElementById('telaDemandas');
const dica = document.getElementById('dica');
const telaDica = document.getElementById('telaDica');
const fecharAjuda = document.getElementById('fecharAjuda');
const galeria = document.getElementById('galeria');
const telaGaleria = document.getElementById('telaGaleria');
const fecharGaleria = document.getElementById('fecharGaleria');


export function fecharTelaDeMaquinas() {
    const botaoOrdenarTelaMaquinas = document.getElementById("ordenarMaquinas");
    const botaoOrdenarTelaMaquinasTexto = botaoOrdenarTelaMaquinas.querySelector('.MenuBotaoActive');
    const addMaquina = document.getElementById('addMaquina');
    const addMaquinaTexto = addMaquina.querySelector('.MenuBotaoActive');
    const pesquisaMaquina = document.getElementById('inputPesquisaMaquina');
    const barraAddMaquina = document.getElementById('barraAddMaquina');
    const barraPesquisaMaquina = document.getElementById('barraPesquisaMaquina');

    if (!document.querySelector('body').classList.contains('mfMaquinas')) {
        if (!barraAddMaquina.classList.contains('invisible5')) {
            barraAddMaquina.classList.add('invisible5');
            barraPesquisaMaquina.classList.remove('invisible5');
            addMaquinaTexto.classList.toggle('addMaquinaAtivada');
        }
        pesquisaMaquina.value = ''
        telaMaquinas.classList.add('invisible5');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido');
        botaoOrdenarTelaMaquinasTexto.classList.remove('addMaquinaAtivada')
    }
}

export function fecharTelaDeDemandas() {
    const botaoOrdenarTelaDemandas = document.getElementById("ordenarDemandas");
    const botaoOrdenarTelaDemandasTexto = botaoOrdenarTelaDemandas.querySelector('.MenuBotaoActive');
    const addDemanda = document.getElementById('addDemanda');
    const addDemandaTexto = addDemanda.querySelector('.MenuBotaoActive');
    const pesquisaDemanda = document.getElementById('inputPesquisaDemanda');
    const barraAddDemanda = document.getElementById('barraAddDemanda');
    const barraPesquisaDemanda = document.getElementById('barraPesquisaDemanda');

    if (!document.querySelector('body').classList.contains('mfDemandas')) {
        if (!barraAddDemanda.classList.contains('invisible5')) {
            barraAddDemanda.classList.add('invisible5');
            barraPesquisaDemanda.classList.remove('invisible5');
            addDemandaTexto.classList.toggle('addDemandaAtivada');
        }
        pesquisaDemanda.value = ''
        telaDemandas.classList.add('invisible5');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido');
        botaoOrdenarTelaDemandasTexto.classList.remove('addDemandaAtivada')
    }
}

export function fechaMenu(botaoDoMenu=false) {
    var botaoMenu = document.getElementById('botaoMenu');
    var telaMenu = document.querySelectorAll('.menuInvisivel');
    var telaRotinas = document.getElementById('telaRotinas');
    var fundoCabecalho = document.getElementById('cabecalho');
    var screenWidth = window.innerWidth;
    
    if (screenWidth < 1255 || botaoDoMenu) {
        telaMenu.forEach(miniMenu => {
            miniMenu.classList.add('invisible3');
        })
        document.getElementById('menuCabecalho').classList.add('minimizado')
        fundoCabecalho.classList.remove('cabecalhoExpandido');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido');
        if (telaRotinas) {
            telaRotinas.classList.remove('rotinasExpandida');  
        }
    
        // Adiciona a animação de saída
        botaoMenu.classList.remove('anim-in-side-right');
        botaoMenu.classList.add('anim-out-side-left');
        // Espera a animação de saída terminar para trocar a imagem
        botaoMenu.addEventListener('animationend', function handleOut() {
            botaoMenu.removeEventListener('animationend', handleOut); // Remove o listener
            botaoMenu.innerHTML = '☰';
            menu.title = 'Abrir menu';

            // Adiciona a animação de entrada
            botaoMenu.classList.remove('anim-out-side-left');
            botaoMenu.classList.add('anim-in-side-left');
        });
    }
}

export function abreFechaMenu() {
    var botaoMenu = document.getElementById('botaoMenu');
    var telaMenu = document.querySelectorAll('.menuInvisivel');
    var telaRotinas = document.getElementById('telaRotinas');
    var fundoCabecalho = document.getElementById('cabecalho');
    var screenWidth = window.innerWidth;

    if (botaoMenu.innerHTML == '☰') {
        telaMenu.forEach(miniMenu => {
            miniMenu.classList.remove('invisible3');
        })
        document.getElementById('menuCabecalho').classList.remove('minimizado')
        if (screenWidth < 1255) {
            fundoCabecalho.classList.add('cabecalhoExpandido')
        }
        if (telaRotinas) {
            telaRotinas.classList.add('rotinasExpandida');  
        }
    
        // Adiciona a animação de saída
        botaoMenu.classList.remove('anim-in-side-left');
        botaoMenu.classList.add('anim-out-side-right');
        // Espera a animação de saída terminar para trocar a imagem
        botaoMenu.addEventListener('animationend', function handleOut() {
            botaoMenu.removeEventListener('animationend', handleOut); // Remove o listener
            botaoMenu.innerHTML = '☷';
            menu.title = 'Fechar menu';
            // Adiciona a animação de saída
            botaoMenu.classList.remove('anim-out-side-right');
            botaoMenu.classList.add('anim-in-side-right');
        });
    }
    else {
        fechaMenu(true)
    }
}

if (menu) {
    // menu do site
    menu.addEventListener('click', () => {
        abreFechaMenu()
        
        if (telaMaquinas) {
            if (!telaMaquinas.classList.contains('invisible5')) {
                fecharTelaDeMaquinas()
                if (telaRotinas) {
                    telaRotinas.classList.add('rotinasExpandida');        
                }
            }
        }
        if (telaDemandas) {
            if (!telaDemandas.classList.contains('invisible5')) {
                fecharTelaDeDemandas()
                if (telaRotinas) {
                    telaRotinas.classList.add('rotinasExpandida');        
                }
            }
        }
        if (!telaDica.classList.contains('invisible2')) {
            telaDica.classList.add('invisible2');
            fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
            if (telaRotinas) {
                telaRotinas.classList.add('rotinasExpandida');        
            }
        }
        if (telaGaleria) {
            if (!telaGaleria.classList.contains('invisible2')) {
                telaGaleria.classList.add('invisible2');
                fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
                telaRotinas.classList.add('rotinasExpandida');
            }
        }
    });
}

if (telaDica) {
    // Janela com dicas de como o site funciona
    dica.addEventListener('click', () => {
        fechaMenu()

        if (telaGaleria) {
            if (!telaGaleria.classList.contains('invisible2')) {
                telaGaleria.classList.add('invisible2');
            }
        }
        if (telaMaquinas) {
            if (!telaMaquinas.classList.contains('invisible5')) {
                fecharTelaDeMaquinas()
            }
        }
        if (telaDemandas) {
            if (!telaDemandas.classList.contains('invisible5')) {
                fecharTelaDeDemandas()
            }
        }

        if (telaDica.classList.contains('invisible2')) {
            telaDica.classList.remove('invisible2');
            fundoCabecalho.classList.add('cabecalhoMegaExpandido')
        }
        else {
            telaDica.classList.add('invisible2');
            fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
        }
    });
    fecharAjuda.addEventListener('click', ()=> {
        telaDica.classList.add('invisible2');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
    })
}

if (telaGaleria) {
    // Janela com imagens do TaskWatch oficial
    galeria.addEventListener('click', () => {
        fechaMenu()

        if (telaDica) {
            if (!telaDica.classList.contains('invisible2')) {
                telaDica.classList.add('invisible2');
            }
        }
        if (telaMaquinas) {
            if (!telaMaquinas.classList.contains('invisible5')) {
                fecharTelaDeMaquinas()
            }
        }
        if (telaDemandas) {
            if (!telaDemandas.classList.contains('invisible5')) {
                fecharTelaDeDemandas()
            }
        }

        if (telaGaleria.classList.contains('invisible2')) {
            telaGaleria.classList.remove('invisible2');
            fundoCabecalho.classList.add('cabecalhoMegaExpandido')
        }
        else {
            telaGaleria.classList.add('invisible2');
            fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
        }
    });
    fecharGaleria.addEventListener('click', ()=> {
        telaGaleria.classList.add('invisible2');
        fundoCabecalho.classList.remove('cabecalhoMegaExpandido')
    })
}
