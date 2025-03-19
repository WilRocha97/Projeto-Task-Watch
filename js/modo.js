const corpo = document.body
const botao = document.getElementById("toggleDarkMode")
const imagem = botao.querySelector('img');

botao.addEventListener('click', (e)=> {
    corpo.classList.toggle('light');
    corpo.classList.toggle('dark');
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