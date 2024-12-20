const menu = document.getElementById('menu');
const telaMenu = document.getElementById('telaMenu');
const dica = document.getElementById('dica');
const telaDica = document.getElementById('telaDica');
const galeria = document.getElementById('galeria');
const telaGaleria = document.getElementById('telaGaleria');
var telaRotinas = document.getElementById('telaRotinas')

var screenWidth = window.innerWidth;

function updateClock() {
    var daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    var months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    
    var now = new Date();
    var dayOfWeek = daysOfWeek[now.getDay()];
    var day = now.getDate();
    var monthName = months[now.getMonth()];
    var month = now.getMonth() + 1;
    var year = now.getFullYear();
    var hours = now.getHours();
    var minutes = now.getMinutes();

    // Formatação dos dias para adicionar um zero à esquerda se for menor que 10
    day = day < 10 ? '0' + day : day;
    // Formatação dos minutos e segundos para adicionar um zero à esquerda se for menor que 10
    minutes = minutes < 10 ? '0' + minutes : minutes;
    // Formatação dos minutos e segundos para adicionar um zero à esquerda se for menor que 10
    hours = hours < 10 ? '0' + hours : hours;

    var formattedTime = dayOfWeek + ", " + day + " de " + monthName + " de " + year + " - " + hours + ":" + minutes;
    
    document.getElementById('clock').textContent = formattedTime;

    var screenWidth = window.innerWidth;
    if (screenWidth < 720) {
        document.getElementById('menuRelogio').classList.add('invisible')
    }
    else {
        document.getElementById('menuRelogio').classList.remove('invisible')
    }
};
// Atualiza o relógio a cada segundo
setInterval(updateClock, 1000);
// Atualiza o relógio imediatamente ao carregar a página
updateClock();

// Janela com dicas de como o site funciona
menu.addEventListener('click', () => {
    if (telaMenu.classList.contains('invisible2')) {
        telaMenu.classList.remove('invisible2');
        telaRotinas.classList.add('rotinasExpandida')
    }
    else {
        telaMenu.classList.add('invisible2');
        telaRotinas.classList.remove('rotinasExpandida')
    }
    if (!telaDica.classList.contains('invisible2')) {
        telaDica.classList.add('invisible2');
        telaRotinas.classList.remove('rotinasExpandida')
    }
    if (!telaGaleria.classList.contains('invisible2')) {
        telaGaleria.classList.add('invisible2');
        telaRotinas.classList.remove('rotinasExpandida')
    }
});

// Janela com dicas de como o site funciona
dica.addEventListener('click', () => {
    if (telaDica.classList.contains('invisible2')) {
        telaDica.classList.remove('invisible2');
    }
    else {
        telaDica.classList.add('invisible2');
    }
    if (!telaGaleria.classList.contains('invisible2')) {
        telaGaleria.classList.add('invisible2');
    }
});

// Janela com imagens do TaskWatch oficial
galeria.addEventListener('click', () => {
    if (telaGaleria.classList.contains('invisible2')) {
        telaGaleria.classList.remove('invisible2');
    }
    else {
        telaGaleria.classList.add('invisible2');
    }
    if (!telaDica.classList.contains('invisible2')) {
        telaDica.classList.add('invisible2');
    }
});
// Modal para exibir as imagens em tela cheia
document.querySelectorAll('.imagemGaleria').forEach(image => {
    image.addEventListener('click', function () {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const caption = document.getElementById('caption');

        modal.style.display = 'block';
        modalImage.src = this.src;
        caption.innerText = this.alt;
    });
});
document.querySelector('.close').addEventListener('click', function () {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
});
window.addEventListener('click', function (event) {
    const modal = document.getElementById('imageModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});