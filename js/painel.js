const styles = getComputedStyle(document.body);
//<canvas id="meuDonut"></canvas>
const corExecutado = styles.getPropertyValue('--cor-final').trim();
const corExecutando = styles.getPropertyValue('--cor-executando').trim();
const corErro = styles.getPropertyValue('--cor-erro').trim();
const corOcioso = styles.getPropertyValue('--cor-ocioso').trim();
const corFundo = styles.getPropertyValue('--cor-fundo').trim();

const corExecutadoSombra = styles.getPropertyValue('--cor-final').trim();
const corExecutandoSombra = styles.getPropertyValue('--cor-executando').trim();
const corErroSombra = styles.getPropertyValue('--cor-erro').trim();
const corOciosoSombra = styles.getPropertyValue('--cor-ocioso').trim();

const ctx = document.getElementById('meuDonut');

function verificaListasAbertas() {
    const elements = Array.from(document.querySelector('#targetPainel').children);
  
    elements.forEach((element, index) => {
        if (!element.classList.contains('chartBox')) {
            // Remove classes anteriores
            element.classList.remove('aD', 'aE', 'aED');
            
            // Verifica se algum elemento depois não tem 'invisible5'
            const hasVisibleAfter = elements.slice(index + 1).some(el => !el.classList.contains('invisible5'));
            
            // Verifica se algum elemento antes não tem 'invisible5'
            const hasVisibleBefore = elements.slice(1, index).some(el => !el.classList.contains('invisible5'));
            
            // Aplica as classes conforme a lógica
            if (hasVisibleBefore && hasVisibleAfter) {
            element.classList.add('aED');
            } else if (hasVisibleAfter) {
            element.classList.add('aD');
            } else if (hasVisibleBefore) {
            element.classList.add('aE');
            }
        }
    });
}

new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Rotinas atrasadas', 'Rotinas do dia', 'Rotinas em execução', 'Rotinas do dia concluídas'],
        datasets: [{
            data: [2, 1, 7, 1],  // valores
            backgroundColor: [
                corErro, // vermelho
                corOcioso, // amarelo
                corExecutando, // verde
                corExecutado // azul
            ],
            borderColor: [
                corErroSombra,
                corOciosoSombra,
                corExecutandoSombra,
                corExecutadoSombra
            ],
            
        }]
    },
    options: {
        borderWidth: 0,
        hoverBorderWidth: 2,
        cutout: '92%',
        borderRadius: 30,
        width: 'auto',
        height: 'auto',
        maintainAspectRatio: false,
        layout: {
            padding: 10,
        },
        plugins: {
            legend: { display: false }
        },
    }
});
