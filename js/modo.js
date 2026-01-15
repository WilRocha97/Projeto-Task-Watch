import {criarGraficoDashboard} from './painel.js';

const corpo = document.body
const botao = document.getElementById("toggleDarkMode")
const imagem = botao.querySelector('img');

botao.addEventListener('click', (e)=> {
    setTimeout(()=> {
        criarGraficoDashboard()
    }, 500);
    
    // Adiciona a animação de saída
    imagem.classList.remove('anim-in');
    imagem.classList.add('anim-out');

    corpo.classList.toggle('light');
    corpo.classList.toggle('dark');

    // Espera a animação de saída terminar para trocar a imagem
    imagem.addEventListener('animationend', function handleOut() {
        imagem.removeEventListener('animationend', handleOut); // Remove o listener
        
        if (corpo.classList.contains('light')) {
            // Atualiza o atributo src da imagem
            imagem.src = 'assets/sun.png';
            // Atualiza o atributo alt da imagem
            imagem.alt = 'Modo claro';
            botao.title = 'Mudar para modo escuro'
        }
        else {
            // Atualiza o atributo src da imagem
            imagem.src = 'assets/moon.png';
            // Atualiza o atributo alt da imagem
            imagem.alt = 'Modo escuro';
            botao.title = 'Mudar para modo claro'
        }

        // Adiciona a animação de entrada
        imagem.classList.remove('anim-out');
        imagem.classList.add('anim-in');
    });
})

// Verifica se o tema escuro está ativado
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Aplica o tema de acordo com a preferência do usuário
if (!prefersDarkScheme) {
    corpo.classList.toggle('light');
    corpo.classList.toggle('dark');
    imagem.src = 'assets/sun.png';
    imagem.alt = 'Modo claro';
    botao.title = 'Mudar para modo escuro'
}