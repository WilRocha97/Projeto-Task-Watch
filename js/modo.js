const botao = document.getElementById("toggleDarkMode")
const corpo = document.body
const fundo = document.getElementById("bg")

botao.addEventListener('click', (e)=> {
    corpo.classList.toggle('light');
    fundo.classList.toggle('bgLight');
})

// Verifica se o tema escuro está ativado
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Aplica o tema de acordo com a preferência do usuário
if (!prefersDarkScheme) {
    corpo.classList.toggle('light');
    fundo.classList.toggle('bgLight');
}