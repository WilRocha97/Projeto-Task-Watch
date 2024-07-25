const botao = document.getElementById("toggleDarkMode")
const corpo = document.body
const fundo = document.getElementById("bg")

botao.addEventListener('click', (e)=> {
    corpo.classList.toggle('light');
    fundo.classList.toggle('bgLight')
})