var historicoBotao = document.getElementById('historico');
var historicoTela = document.getElementById('historicoTela');
var historicoLinha = document.querySelectorAll('.linha');
var telaLayout = document.getElementById('layoutTela');
var telaRotinas = document.getElementById('telaRotinas');
const screenWidth = window.innerWidth;
var divsRotinas = document.querySelectorAll('#telaRotinas .fundo')


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


// Adiciona um ouvinte de eventos ao documento para capturar cliques
document.body.addEventListener('click', (event) => {
    // Verifica se o elemento clicado ou algum de seus pais possui a classe 'rectangle'
    let target = event.target;
    while (target && !target.classList.contains('rectangle')) {
        target = target.parentElement;
    }

    // Se um elemento com a classe 'rectangle' foi encontrado, alterna a classe 'collapsed'
    if (target) {
        target.classList.toggle('collapsed');
    }
});

// Abre e fecha a tela de histórico
historicoBotao.addEventListener('click', (e)=> {
    historicoTela.classList.toggle('collapsed')

    if (historicoTela.classList.contains('collapsed')) {
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
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
                });
            }
            historicoTela.scrollTo({
                top: historicoTela.scrollHeight,
                behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
            });
        }, 500);
    }
})

// Adiciona o evento de clique na tela de histórico para evitar a propagação
historicoTela.addEventListener('click', (e) => {
    e.stopPropagation();
});
