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

