import {animacaoBotao} from './main.js';

var template = ``;
var idClassHistorico = '';

var hInputDate = document.getElementById('searchInputDate');
const limpaHInputDate = document.getElementById('limpaHInputDate');
var hInputName = document.getElementById('searchInputName');
const limpaHInputName = document.getElementById('limpaHInputName');
var InputPageSize = document.getElementById('searchInputPageSize');
var telaTitulo = document.getElementById('telaTitulo');

const botaoFiltroGeral = document.getElementById('bolinhaGeral');
const botaoFiltroOciosa = document.getElementById('bolinhaOcioso');
const botaoFiltroErro = document.getElementById('bolinhaErro');
const botaoFiltroFinal = document.getElementById('bolinhaFinal');
const botaoFiltroFechar = document.getElementById('bolinhaFechar');
const botoesFiltro = document.querySelectorAll('.bFiltro');
const botaoExportarTabela = document.getElementById('exportarTabela');
const carregandoExportacao = document.getElementById('carregandoExportacao');

const historicoBotao = document.getElementById('historico');
const carregandoHistorico = document.getElementById('carregandoHistorico');
const historicoTelaContainer = document.getElementById('historicoTelaContainer');
const historicoTela = document.getElementById('historicoTela');
const mainHistorico = document.getElementById('targetHistorico');
const painelConfig = document.getElementById('configHistorico');
const paginationContainer = document.getElementById('pagination');

const menu = document.getElementById('menu');
const telaMenu = document.querySelectorAll('.menuInvisivel');
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
    var filtroClicado = false
    if (ocorrencia == 'clicado') {
        filtroClicado = document.getElementsByClassName('clicado')[0];
        if (filtroClicado) {
            ocorrencia = filtroClicado.getAttribute('title').match(/'([^']+)'/)[1]; // Pega o id do primeiro filtro clicado
        }
        else {
            ocorrencia = 'geral'; // Se nenhum filtro estiver clicado, mostra todos
        }
    }

    carregandoHistorico.classList.remove('invisible')
    var screenWidth = window.innerWidth;
    if (screenWidth < 1255) {
        telaMenu.forEach(miniMenu => {
            miniMenu.classList.add('invisible3');
        })
        document.getElementById('cabecalho').classList.remove('cabecalhoExpandido')
        menu.innerHTML = '❯'
    }
    telaDica.classList.add('invisible2');
    telaRotinas.classList.remove('rotinasExpandida');
    telaHistorico.classList.remove('historicoExpandida');
    
    if (event != '') {
        let target = event.target;
        animacaoBotao(target)
    }

    if (!filtroClicado) {
        botoesFiltro.forEach(filtro => {
            filtro.classList.remove('clicado')
        }); 
    }
    
    historicoTelaContainer.classList.add('collapsed');
    paginationContainer.classList.add('invisible4');
    
    setTimeout(()=> {
        historicoTela.innerHTML = ''; // Limpa a tabela para novos dados
        fetchHistoricoFiltrado(ocorrencia, page)
    }, 600);
    setTimeout(()=> {
        historicoTelaContainer.classList.remove('collapsed');
        var screenWidth = window.innerWidth;
        if (screenWidth < 2500) {
            const target = document.getElementById('targetHistorico');
            const targetPosition = target.offsetTop; /* Pega a posição do topo do elemento */
            
            window.scrollTo({
                top: targetPosition, 
                behavior: 'smooth' /* Scroll suave */
            });
        }
        carregandoHistorico.classList.add('invisible')
    }, 1000);
}
function criaPaginacao(currentPage, totalPages, ocorrencia) {
    setTimeout(() => {
        paginationContainer.innerHTML = '';

        const maxVisiblePages = 3;

        if (currentPage > 1) {
            let prevButton = document.createElement('button');
            prevButton.innerText = '◀';
            prevButton.title = 'Página anterior';
            prevButton.className = 'pageButon';
            prevButton.onclick = (event) => filtraHistorico(event, ocorrencia, currentPage - 1);
            paginationContainer.appendChild(prevButton);
        }

        if (currentPage > 3) {
            let firstPageButton = document.createElement('button');
            firstPageButton.innerText = '1';
            firstPageButton.className = 'pageButon';
            firstPageButton.onclick = (event) => filtraHistorico(event, ocorrencia, 1);
            paginationContainer.appendChild(firstPageButton);

            let dotsBefore = document.createElement('span');
            dotsBefore.className = 'pageButon';
            dotsBefore.innerText = '...';
            paginationContainer.appendChild(dotsBefore);
        }

        if (currentPage == 3) {
            let firstPageButton = document.createElement('button');
            firstPageButton.className = 'pageButon';
            firstPageButton.innerText = '1';
            firstPageButton.onclick = (event) => filtraHistorico(event, ocorrencia, 1);
            paginationContainer.appendChild(firstPageButton);
        }

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
            pageButton.className = 'pageButon';
            pageButton.disabled = (page === currentPage);
            pageButton.onclick = (event) => filtraHistorico(event, ocorrencia, page);
            paginationContainer.appendChild(pageButton);
        }

        if (currentPage < totalPages - 2) {
            let dotsAfter = document.createElement('span');
            dotsAfter.className = 'pageButon';
            dotsAfter.innerText = '...';
            paginationContainer.appendChild(dotsAfter);

            let lastPageButton = document.createElement('button');
            lastPageButton.className = 'pageButon';
            lastPageButton.innerText = totalPages;
            lastPageButton.onclick = (event) => filtraHistorico(event, ocorrencia, totalPages);
            paginationContainer.appendChild(lastPageButton);
        }

        if (currentPage == totalPages - 2) {
            let lastPageButton = document.createElement('button');
            lastPageButton.className = 'pageButon';
            lastPageButton.innerText = totalPages;
            lastPageButton.onclick = (event) => filtraHistorico(event, ocorrencia, totalPages);
            paginationContainer.appendChild(lastPageButton);
        }

        if (currentPage < totalPages) {
            let nextButton = document.createElement('button');
            nextButton.className = 'pageButon';
            nextButton.innerText = '▶';
            nextButton.title = 'Próxima página';
            nextButton.onclick = (event) => filtraHistorico(event, ocorrencia, currentPage + 1);
            paginationContainer.appendChild(nextButton);
        }
        paginationContainer.classList.remove('invisible4');
    }, 300);
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
    filtraHistorico('', 'clicado')
})
limpaHInputName.addEventListener('click', (event)=> {
    hInputName.value = ''
    let target = event.target;
    animacaoBotao(target)
    filtraHistorico('', 'clicado')
})

async function exportarTabela() {
    var dadosFiltrados = ''
    const formato = botaoExportarTabela.value;
    const rotina = document.getElementById('searchInputName').value;
    const dataHora = document.getElementById('searchInputDate').value;
    var filtroClicado = document.getElementsByClassName('clicado')[0];
    if (filtroClicado) {
            var ocorrencia = filtroClicado.getAttribute('title').match(/'([^']+)'/)[1]; // Pega o id do primeiro filtro clicado
        }
        else {
            var ocorrencia = 'geral'; // Se nenhum filtro estiver clicado, mostra todos
        }
    
    const response = await fetch('js/historico.json');
    const json = await response.json();
    const dados = json.data.reverse(); // <- aqui está o array real

    if (!Array.isArray(dados)) {
        console.error('Formato inválido');
        return;
    }

    console.log(dataHora, rotina, ocorrencia)
    console.log(dados)

    dadosFiltrados = dados.filter(script => {
        return script.andamentos; // Exemplo de filtragem
    });
    if (ocorrencia != 'geral') {
        // Filtrar os dados com base na ocorrência e outras condições
        dadosFiltrados = dadosFiltrados.filter(script => {
            return script.andamentos.includes(ocorrencia); // Exemplo de filtragem
        });
    }
    if (rotina != '') {
        // Filtrar os dados com base na ocorrência e outras condições
        dadosFiltrados = dadosFiltrados.filter(script => {
            return script.script_name.includes(rotina); // Exemplo de filtragem
        });
    }
    if (dataHora != '') {
        // Filtrar os dados com base na ocorrência e outras condições
        dadosFiltrados = dadosFiltrados.filter(script => {
            return script.data_hora.includes(dataHora); // Exemplo de filtragem
        });
    }

    console.log(dadosFiltrados)

    if (formato === 'csv') {
        // Converte os dados para CSV manualmente
        const colunas = Object.keys(dadosFiltrados[0]);
        const linhas = dadosFiltrados.map(obj =>
            colunas.map(col => `"${(obj[col] ?? '').toString().replace(/"/g, '""')}"`).join(';')
        );

        const conteudoCSV = [colunas.join(';'), ...linhas].join('\n');
        const blob = new Blob(["\uFEFF" + conteudoCSV], { type: 'text/csv;charset=utf-8;' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Histórico.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();

        carregandoExportacao.classList.add('invisible');
    }

    if (formato === 'xlsx') {
        // XLSX com SheetJS
        const ws = XLSX.utils.json_to_sheet(dadosFiltrados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Exportação');
        XLSX.writeFile(wb, 'Histórico.xlsx');
        carregandoExportacao.classList.add('invisible')
    }

    if (formato === 'pdf') {
        // PDF com jsPDF + AutoTable
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const colunas = Object.keys(dadosFiltrados[0] || {});
        const linhas = dadosFiltrados.map(obj => colunas.map(c => obj[c]));

        doc.autoTable({
        head: [colunas],
        body: linhas,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [220, 220, 220] }
        });

        doc.save('Histórico.pdf');
        carregandoExportacao.classList.add('invisible')
    }
}
botaoExportarTabela.addEventListener('click', (event)=> {
    let target = event.target;
    animacaoBotao(target)
    carregandoExportacao.classList.remove('invisible');
    setTimeout(()=> {
        exportarTabela()
    }, 1000);
})

// Abre e fecha a tela de histórico
historicoBotao.addEventListener('click', ()=> {
    document.querySelectorAll('.bn').forEach((bolinha, index) => {
        setTimeout(()=> {
            bolinha.classList.add('invisible5');
        }, index * 500); // Atraso baseado no índice
    });
    botoesFiltro.forEach(filtro => {
        filtro.classList.remove('clicado')
    });

    historicoTelaContainer.classList.toggle('collapsed');
    mainHistorico.classList.toggle('collapsed');
    painelConfig.classList.toggle('collapsed');

    if (mainHistorico.classList.contains('collapsed')) {
        paginationContainer.classList.add('invisible4');
        // sobe para o topo da página
        var screenWidth = window.innerWidth;
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
// adiciona o evento de escutar a tecla na barra de busca por nome do histórico
hInputName.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        filtraHistorico('', 'clicado')
    }
});
// adiciona o evento de escutar a tecla na barra de busca por data do histórico
hInputDate.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        filtraHistorico('', 'clicado')
    }
});
// adiciona o evento de escutar a tecla no campo para a quantidade de itens por página
InputPageSize.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        filtraHistorico('', 'clicado')
    }
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
