const styles = getComputedStyle(document.body);
//<canvas id="meuDonut"></canvas>
const corExecutado = styles.getPropertyValue('--cor-final').trim();
const corExecutando = styles.getPropertyValue('--cor-executando').trim();
const corErro = styles.getPropertyValue('--cor-erro').trim();
const corOcioso = styles.getPropertyValue('--cor-ocioso').trim();
const corFundo = styles.getPropertyValue('--cor-fundo').trim();

const corExecutadoSombra = styles.getPropertyValue('--animacao-opaca-bota-1').trim();
const corExecutandoSombra = styles.getPropertyValue('--animacao-opaca-bota-2').trim();
const corErroSombra = styles.getPropertyValue('--animacao-opaca-bota-4').trim();
const corOciosoSombra = styles.getPropertyValue('--animacao-opaca-bota-3').trim();

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


const outerCtx = document.getElementById('outerChart').getContext('2d');
const outerChart = new Chart(outerCtx, {
    type: 'doughnut',
    data: {
        labels: ['Rotinas atrasadas', 'Rotinas do dia', 'Rotinas em execução', 'Rotinas do dia concluídas'],
        datasets: [{
            data: [2, 1, 7, 1],
            backgroundColor: [
                corErro,
                corOcioso,
                corExecutando,
                corExecutado
            ]
        }]
    },
    options: {
        cutout: '95%', // Buraco menor = borda mais grossa
        maintainAspectRatio: false,
        borderRadius: 20,
        borderWidth: 0,
        layout: {
            padding: 25,
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});

const ctx = document.getElementById('meuDonut');
const innerChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Rotinas atrasadas', 'Rotinas do dia', 'Rotinas em execução', 'Rotinas do dia concluídas'],
        datasets: [{
            data: [2, 1, 7, 1],  // valores
            backgroundColor: [
                corErroSombra,
                corOciosoSombra,
                corExecutandoSombra,
                corExecutadoSombra
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
        cutout: '50%',
        borderRadius: 2,
        maintainAspectRatio: false,
        layout: {
            padding: 22,
        },
        plugins: {
            legend: { display: false }
        },
    }
});

