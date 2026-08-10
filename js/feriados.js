// Nomes personalizados para feriados
const NOMES_PERSONALIZADOS = {
    '01-01': 'Ano Novo',
    '04-21': 'Tiradentes',
    '05-01': 'Dia do Trabalhador',
    '09-07': 'Independência do Brasil',
    '10-12': 'Nossa Senhora Aparecida',
    '11-02': 'Finados',
    '11-15': 'Proclamação da República',
    '12-25': 'Natal',
};

export async function marcarFeriados(calendar) {
    // Pega o mês e ano do calendário
    const mes = parseInt(calendar.dataset.month);
    const ano = parseInt(calendar.dataset.year);
  
    try {
        // Busca feriados na API
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${ano}/BR`);
        const feriados = await response.json();
        
        // Substitui os nomes personalizados
        feriados.forEach(f => {
        const mesdia = f.date.slice(5); // Pega "01-01" de "2026-01-01"
            if (NOMES_PERSONALIZADOS[mesdia]) {
                f.localName = NOMES_PERSONALIZADOS[mesdia];
            }
        });

        // Adiciona feriados municipais/estaduais manualmente
        const feriadosLocais = [
            { date: `${ano}-01-20`, localName: 'Dia de São Sebastião em Valinhos' },
            { date: `${ano}-05-28`, localName: 'Aniversário de Valinhos' },
        ];
        feriados.push(...feriadosLocais);

        // Filtra pelo mês atual
        const feriadosDoMes = feriados.filter(f => {
            const data = new Date(f.date + 'T00:00:00');
            return data.getMonth() + 1 === mes;
        });
        
        // Marca cada feriado no calendário
        feriadosDoMes.forEach(feriado => {
            const dia = new Date(feriado.date + 'T00:00:00').getDate();
            const diaElement = document.querySelector(`.day[data-day="${dia}"]`);
            
            if (diaElement) {
                // Adiciona classe de feriado
                diaElement.classList.add('feriado');
                
                // Adiciona indicador visual
                const dateDiv = diaElement.querySelector('.date');
                const dataTituloContainer = diaElement.querySelector('.tituloContainer');
                if (dateDiv) {
                dateDiv.title = `Feriado: ${feriado.localName}`;
                
                // Cria badge de feriado (opcional)
                const badge = document.createElement('div');
                badge.className = 'holiday';
                badge.textContent = feriado.localName;
                badge.title = feriado.localName;
                dataTituloContainer.appendChild(badge);
                }
            }
        });
        
        //console.log(`${feriadosDoMes.length} feriado(s) marcado(s)`);
        
    } catch (error) {
        console.error('Erro ao buscar feriados:', error);
    }
}
