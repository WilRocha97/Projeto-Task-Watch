var historicoBotao = document.getElementById('historico');
var historicoTela = document.getElementById('historicoTela');
var historicoLinha = document.querySelectorAll('.linha');
var telaLayout = document.getElementById('layoutTela');
const screenWidth = window.innerWidth;

// adiciona um fade in ao abrir o site
setTimeout(()=> {
    document.body.classList.remove('fadeOut');
    document.body.classList.add('fadeIn');
}, 500);


function updateClock() {
    var daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    var months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    
    var now = new Date();
    var dayOfWeek = daysOfWeek[now.getDay()];
    var day = now.getDate();
    var month = months[now.getMonth()];
    var year = now.getFullYear();
    var hours = now.getHours();
    var minutes = now.getMinutes();

    // Formatação dos minutos e segundos para adicionar um zero à esquerda se for menor que 10
    minutes = minutes < 10 ? '0' + minutes : minutes;
    // Formatação dos minutos e segundos para adicionar um zero à esquerda se for menor que 10
    hours = hours < 10 ? '0' + hours : hours;

    var formattedTime = dayOfWeek + ", " + day + " de " + month + " de " + year + " - " + hours + ":" + minutes;
    
    document.getElementById('clock').textContent = formattedTime;
}
// Atualiza o relógio a cada segundo
setInterval(updateClock, 1000);
// Atualiza o relógio imediatamente ao carregar a página
updateClock();


historicoBotao.addEventListener('click', (e)=> {
    if (historicoTela.classList.contains('invisible')) {
        historicoTela.classList.remove('invisible');
        telaLayout.classList.add('layout');
        setTimeout(()=> {
            historicoTela.classList.remove('fadeOut');
            historicoTela.classList.add('fadeIn'); 
        }, 250)
        // sobe para a base da página
        if (screenWidth < 2500) {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
            });
        }
    }
    else {
        historicoTela.classList.add('fadeOut');
        historicoTela.classList.remove('fadeIn');
        setTimeout(()=> {
            historicoTela.classList.add('invisible');
            telaLayout.classList.remove('layout');
        }, 250)
        if (screenWidth < 2500) {
            // sobe para o topo da página
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
            });
        }
    }
})