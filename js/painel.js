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

const ctx = document.getElementById('meuDonut');

new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Atrasados', 'Para executar', 'Em execução', 'Executados'],
        datasets: [{
            data: [2, 1, 7, 1],  // valores
            backgroundColor: [
                corErro, // vermelho
                corOcioso, // amarelo
                corExecutando,  // verde
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
        borderWidth: 5,
        
        cutout: '92%', // abertura central (donut)
        borderRadius: 30,
        plugins: {
            legend: {
                display: false // legenda embaixo
            },
        },
    }
});

