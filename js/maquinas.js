import {procurarCard} from './main.js';

// ouvinte para os cliques nos cartões
document.addEventListener('click', (event) => {
    // Verifica se o elemento clicado ou algum de seus pais possui a classe 'rectangle'
    let target = event.target;
    const divMae = target.closest('.rectangleMaquinas');

    if (divMae) {
        if (target.id == 'mudarStatus') {
            var statusDaMaquina = divMae.querySelector('#statusMaquina');
            // Procura todos os elementos que tenham no ID a id da maquina
            const elementos = Array.from(document.getElementById('layoutTela').querySelectorAll('[id]')).filter(el => el.id.includes(divMae.id));
            // Se não encontrar nenhum card com a id da máquina, muda o status pra livre
            if (elementos.length > 0) {
                statusDaMaquina.classList.remove('livre')
                statusDaMaquina.classList.add('ocupado')
                target.innerHTML = 'Ocupado'
            }
            else {
                if (statusDaMaquina.classList.contains('ocupado')) {
                    statusDaMaquina.classList.remove('ocupado')
                    statusDaMaquina.classList.add('livre')
                    target.innerHTML = 'livre'
                }
                else {
                    statusDaMaquina.classList.remove('livre')
                    statusDaMaquina.classList.add('ocupado')
                    target.innerHTML = 'Ocupado'
                }
            }
        }

        if (target.id == 'buscarMaquina') {
            const idMaquina = divMae.id
            procurarCard({key: 'Enter'}, idMaquina);

            var screenWidth = window.innerWidth;
            if (screenWidth < 916) {
                telaMaquinas.classList.add('invisible5');
            }
        }
    }

});

document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "estadoMaquinas";

    function salvarEstado() {
        const estado = {};
        document.querySelectorAll(".rectangleMaquinas").forEach(maquina => {
            const id = maquina.id;
            const statusEl = maquina.querySelector("#statusMaquina");
            const textarea = maquina.querySelector("textarea");
            const botaoStatus = maquina.querySelector("#mudarStatus");

            estado[id] = {
                statusClasse: statusEl ? statusEl.classList[1] || "" : "",
                comentario: textarea ? textarea.value : "",
                botaoTexto: botaoStatus ? botaoStatus.textContent : ""
            };
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    }

    function restaurarEstado() {
        const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        let alterado = false;

        for (const id in dados) {
            const maquina = document.getElementById(id);
            if (!maquina) {
                // Se o elemento não existe mais, remove do storage
                delete dados[id];
                alterado = true;
                continue;
            }

            const { statusClasse, comentario, botaoTexto } = dados[id];
            const statusEl = maquina.querySelector("#statusMaquina");
            const textarea = maquina.querySelector("textarea");
            const botaoStatus = maquina.querySelector("#mudarStatus");

            if (statusEl && statusClasse) {
                statusEl.className = `cStatusMaquina ${statusClasse}`;
            }
            if (textarea) {
                textarea.value = comentario;
            }
            if (botaoStatus) {
                botaoStatus.textContent = botaoTexto;
            }
        }

        if (alterado) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        }
    }

    function adicionarListeners() {
        document.querySelectorAll(".rectangleMaquinas").forEach(maquina => {
            const textarea = maquina.querySelector("textarea");
            const botaoStatus = maquina.querySelector("#mudarStatus");
            const statusEl = maquina.querySelector("#statusMaquina");

            if (textarea) {
                textarea.addEventListener("input", salvarEstado);
            }
            if (botaoStatus) {
                botaoStatus.addEventListener("click", salvarEstado);
            }
            if (statusEl) {
                const observer = new MutationObserver(salvarEstado);
                observer.observe(statusEl, { attributes: true, attributeFilter: ["class"] });
            }
        });
    }

    restaurarEstado();
    adicionarListeners();
    salvarEstado(); // Garante salvar caso seja a primeira vez
});
