import {animacaoBotao} from './main.js';

var template = ``;
var idClassHistorico = '';
const screenWidth = window.innerWidth;

var hInputDate = document.getElementById('searchInputDate');
const limpaHInputDate = document.getElementById('limpaHInputDate');
var hInputName = document.getElementById('searchInputName');
const limpaHInputName = document.getElementById('limpaHInputName');
var telaTitulo = document.getElementById('telaTitulo');

const botaoFiltroGeral = document.getElementById('bolinhaGeral');
const botaoFiltroOciosa = document.getElementById('bolinhaOcioso');
const botaoFiltroErro = document.getElementById('bolinhaErro');
const botaoFiltroFinal = document.getElementById('bolinhaFinal');
const botaoFiltroFechar = document.getElementById('bolinhaFechar');
const botoesFiltro = document.querySelectorAll('.bFiltro');

const historicoBotao = document.getElementById('historico');
const historicoTelaContainer = document.getElementById('historicoTelaContainer');
const historicoTela = document.getElementById('historicoTela');
const mainHistorico = document.getElementById('targetHistorico');
const painelConfig = document.getElementById('configHistorico');

const menu = document.getElementById('menu');
const telaMenu = document.getElementById('telaMenu');
const telaDica = document.getElementById('telaDica');
const telaRotinas = document.getElementById('telaRotinas');
const telaHistorico = document.getElementById('targetHistorico');


function criaHistorico(data, rotina, ocorrencia) {
    if (ocorrencia == 'Erro detectado') {
        idClassHistorico = 'id="ocorrencia" class="situacao erro"'
    }
    else if (ocorrencia == 'A rotina está ociosa por muito tempo') {
        idClassHistorico = 'id="ocorrencia" class="situacao ociosa"'
    }
    else if (ocorrencia == 'Rotina finalizada') {
        idClassHistorico = 'id="ocorrencia" class="situacao finalizada"' 
    }
    else if (ocorrencia == 'Cartão fechado') {
        idClassHistorico = 'id="ocorrencia" class="situacao fechado"'
    }
    else {
        idClassHistorico = 'id="ocorrencia" class="situacao iniciada"'
    };

    template = `<p id="data">${data}</p>
                <p id="rotina">${rotina}</p>
                <p ${idClassHistorico}>${ocorrencia}</p>`;

    // Insere o conteúdo concatenado na div de saída
    const newElement = document.createElement('div');
    newElement.className = 'linha';
    newElement.innerHTML = template;
    historicoTela.appendChild(newElement);
}
function filtraHistorico(event='', ocorrencia='geral', page=1) {
    telaMenu.classList.add('invisible2');
    menu.innerHTML = 'Menu ▾'
    telaDica.classList.add('invisible2');
    telaRotinas.classList.remove('rotinasExpandida');
    telaHistorico.classList.remove('historicoExpandida');
    
    if (event != '') {
        let target = event.target;
        animacaoBotao(target)
    }

    botoesFiltro.forEach(filtro => {
        filtro.classList.remove('clicado')
    });

    // Exibe o spinner antes de carregar o histórico
    document.getElementById('loading').classList.remove('invisible2');

    historicoTelaContainer.classList.add('collapsed');
    setTimeout(()=> {
        historicoTela.innerHTML = ''; // Limpa a tabela para novos dados
        fetchHistoricoFiltrado(ocorrencia, page)
        // Oculta o spinner após os dados serem carregados
    }, 600);
    setTimeout(()=> {
        historicoTelaContainer.classList.remove('collapsed');
        if (screenWidth < 2500) {
            const target = document.getElementById('targetHistorico');
            const targetPosition = target.offsetTop; /* Pega a posição do topo do elemento */
            
            window.scrollTo({
                top: targetPosition, 
                behavior: 'smooth' /* Scroll suave */
            });
        }
    }, 1000);
}
function criaPaginacao(currentPage, totalPages, ocorrencia) {
    let paginationContainer = document.getElementById('pagination'); // Container da paginação
    paginationContainer.innerHTML = '';  // Limpa o conteúdo existente

    const maxVisiblePages = 3; // Quantas páginas no máximo são mostradas entre os '...'

    // Botão para a primeira página e 'Anterior'
    if (currentPage > 1) {
        let prevButton = document.createElement('button');
        prevButton.innerText = '◀';
        prevButton.title = 'Página anterior'
        prevButton.onclick = (event) => filtraHistorico(event, ocorrencia, currentPage - 1);
        paginationContainer.appendChild(prevButton);
    }

    // Se a primeira página não está visível (ou seja, currentPage > 3), mostra o '1' e '...'
    if (currentPage > 3) {
        let firstPageButton = document.createElement('button');
        firstPageButton.innerText = '1';
        firstPageButton.onclick = (event) => filtraHistorico(event, ocorrencia, 1);
        paginationContainer.appendChild(firstPageButton);

        let dotsBefore = document.createElement('span');
        dotsBefore.innerText = '...';
        paginationContainer.appendChild(dotsBefore);
    }
    // Se estiver na ternceira página mostra também a primeira página
    if (currentPage == 3) {
        let firstPageButton = document.createElement('button');
        firstPageButton.innerText = '1';
        firstPageButton.onclick = (event) => filtraHistorico(event, ocorrencia, 1);
        paginationContainer.appendChild(firstPageButton);
    }

    // Páginas centrais: limitamos a quantidade de páginas visíveis ao redor da página atual
    let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
    let endPage = Math.min(currentPage + Math.floor(maxVisiblePages / 2), totalPages);

    if (currentPage <= 3) {
        endPage = Math.min(maxVisiblePages, totalPages);
    }
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - maxVisiblePages + 1, 1);
    }

    for (let page = startPage; page <= endPage; page++) {
        let pageButton = document.createElement('button');
        pageButton.innerText = page;
        pageButton.disabled = (page === currentPage);  // Desabilita o botão da página atual
        pageButton.onclick = (event) => filtraHistorico(event, ocorrencia, page);
        paginationContainer.appendChild(pageButton);
    }

    // Se a última página não está visível (ou seja, currentPage < totalPages - 2), mostra '...' e a última página
    if (currentPage < totalPages - 2) {
        let dotsAfter = document.createElement('span');
        dotsAfter.innerText = '...';
        paginationContainer.appendChild(dotsAfter);

        let lastPageButton = document.createElement('button');
        lastPageButton.innerText = totalPages;
        lastPageButton.onclick = (event) => filtraHistorico(event, ocorrencia, totalPages);
        paginationContainer.appendChild(lastPageButton);
    }

    // Se estiver na ante penultima página mostra também a ultima página
    if (currentPage == totalPages - 2) {
        let lastPageButton = document.createElement('button');
        lastPageButton.innerText = totalPages;
        lastPageButton.onclick = (event) => filtraHistorico(event, ocorrencia, totalPages);
        paginationContainer.appendChild(lastPageButton);
    }

    // Botão para 'Próximo'
    if (currentPage < totalPages) {
        let nextButton = document.createElement('button');
        nextButton.innerText = '▶';
        nextButton.title = 'Próxima página'
        nextButton.onclick = (event) => filtraHistorico(event, ocorrencia, currentPage + 1);
        paginationContainer.appendChild(nextButton);
    }
}
function fetchHistoricoFiltrado(ocorrencia = 'geral', page = 1) {
    var filteredData = ''
    const rotina = document.getElementById('searchInputName').value;
    const dataHora = document.getElementById('searchInputDate').value;

    var pageSize = document.getElementById('searchInputPageSize').value;
    pageSize = Number(pageSize)
    if (pageSize < 1) {
        pageSize = 1
        document.getElementById('searchInputPageSize').value = pageSize
    }
    if (pageSize > 75) {
        pageSize = 75
        document.getElementById('searchInputPageSize').value = pageSize
    }
 
    // Exibe o spinner antes de carregar o histórico
    document.getElementById('loading').classList.remove('invisible2');
  
    fetch('js/historico.json')
      .then(response => response.json())
      .then(data => {

        // Filtrar os dados com base na ocorrência e outras condições
        filteredData = data.data.filter(script => {
            return script.andamentos; // Exemplo de filtragem
        });

        if (ocorrencia != 'geral') {
            // Filtrar os dados com base na ocorrência e outras condições
            filteredData = filteredData.filter(script => {
                return script.andamentos.includes(ocorrencia); // Exemplo de filtragem
            });
        }
        if (rotina != '') {
            // Filtrar os dados com base na ocorrência e outras condições
            filteredData = filteredData.filter(script => {
                return script.script_name.includes(rotina); // Exemplo de filtragem
            });
        }
        if (dataHora != '') {
            // Filtrar os dados com base na ocorrência e outras condições
            filteredData = filteredData.filter(script => {
                return script.data_hora.includes(dataHora); // Exemplo de filtragem
            });
        }

        if (filteredData.length === 0) {
            filteredData = [{'id': 0, 'data_hora': '-', 'script_name': 'Nenhum registro encontrado', 'andamentos': '-'}]
        }
        
        filteredData = filteredData.reverse()
        
        // Aplicar a paginação
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
  
        // Limpar a tabela e exibir os novos dados
        historicoTela.innerHTML = '';
        paginatedData.forEach(script => {
          criaHistorico(script.data_hora, script.script_name, script.andamentos);
        });
  
        // Calcular o total de páginas
        const totalPages = Math.ceil(filteredData.length / pageSize);

        // Criar a paginação
        criaPaginacao(page, totalPages, ocorrencia);
  
        // Ocultar o spinner após os dados serem carregados
        document.getElementById('loading').classList.add('invisible2');
  
        // Remover a classe 'collapsed' da tela de histórico
        historicoTelaContainer.classList.remove('collapsed');
  
        // Descer para a base da página (se necessário)
        // ...
      })
      .catch(error => {
        console.error('Erro ao carregar os dados do histórico:', error);
        // Implementar um mecanismo para lidar com erros, como exibir uma mensagem ao usuário
      });
}
  
limpaHInputDate.addEventListener('click', (event)=> {
    hInputDate.value = ''
    let target = event.target;
    animacaoBotao(target)
})
limpaHInputName.addEventListener('click', (event)=> {
    hInputName.value = ''

    let target = event.target;
    animacaoBotao(target)
})

// Abre e fecha a tela de histórico
historicoBotao.addEventListener('click', ()=> {
    telaMenu.classList.add('invisible2');
    menu.innerHTML = 'Menu ▾'
    telaDica.classList.add('invisible2');
    telaRotinas.classList.remove('rotinasExpandida');
    telaHistorico.classList.remove('historicoExpandida');

    document.querySelectorAll('.bn').forEach(bolinha => {
        bolinha.classList.add('invisible');
    })
    botoesFiltro.forEach(filtro => {
        filtro.classList.remove('clicado')
    });

    mainHistorico.classList.toggle('collapsed');
    painelConfig.classList.toggle('collapsed');

    if (mainHistorico.classList.contains('collapsed')) {
        // sobe para o topo da página
        if (screenWidth < 2500) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Para uma rolagem suave, adicione essa opção
            });
        }
        setTimeout(()=> {
            historicoTela.innerHTML = ``
            if (document.querySelectorAll(".rectangle.out").length === 3) {
                telaTitulo.classList.remove('invisible1');
            }
        }, 500);
    }
    else {
        telaTitulo.classList.add('invisible1');
        filtraHistorico();
    }
})
// Adiciona o evento de clique na tela de histórico para evitar a propagação
mainHistorico.addEventListener('click', (e) => {
    e.stopPropagation();
});
botaoFiltroGeral.addEventListener('click', (e)=> {
    filtraHistorico('', 'geral')
    botaoFiltroGeral.classList.add('clicado')
})
botaoFiltroOciosa.addEventListener('click', (e)=> {
    filtraHistorico('', 'A rotina está ociosa por muito tempo')
    botaoFiltroOciosa.classList.add('clicado')
})
botaoFiltroErro.addEventListener('click', (e)=> {
    filtraHistorico('', 'Erro detectado')
    botaoFiltroErro.classList.add('clicado')
})
botaoFiltroFinal.addEventListener('click', (e)=> {
    filtraHistorico('', 'Rotina finalizada')
    botaoFiltroFinal.classList.add('clicado')
})
botaoFiltroFechar.addEventListener('click', (e)=> {
    filtraHistorico('', 'Cartão fechado')
    botaoFiltroFechar.classList.add('clicado')
})
