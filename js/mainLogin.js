var inputUsuarioInfo = document.getElementById('inputUsuarioInfo');
var inputSenhaInfo = document.getElementById('inputSenhaInfo');
const limpaCInputUsuario = document.getElementById('limpaCInputUsuario');
const limpaCInputSenha = document.getElementById('limpaCInputSenha');


function animacaoBotao(target) {
    target.classList.add('clicked');
    setTimeout(() => {
        target.classList.remove('clicked');
    }, 500); // Tempo da animação
    
    setTimeout(() => {
        if (target.classList.contains('MenuBotaoActive')) {
            target.classList.remove('MenuBotaoActive')
            target.classList.add('MenuBotaoDesactive')
        }
        else if (target.classList.contains('MenuBotaoDesactive')) {
            target.classList.remove('MenuBotaoDesactive')
            target.classList.add('MenuBotaoActive')       
        }
    }, 1000);
}

document.body.addEventListener('click', (event) => { 
    let target = event.target;
    animacaoBotao(target)
});

// limpa campo usuario
limpaCInputUsuario.addEventListener('click', ()=> {
    inputUsuarioInfo.value = ''
    })

// limpa campo senha
limpaCInputSenha.addEventListener('click', ()=> {
    inputSenhaInfo.value = ''
    })