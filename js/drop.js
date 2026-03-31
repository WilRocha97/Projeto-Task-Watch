export class Dropdown {
    constructor(selector) {
        this.dropdown = document.querySelector(selector);
        if (!this.dropdown) {
            console.error(`Dropdown não encontrado: ${selector}`);
            return;
        }

        this.trigger = this.dropdown.querySelector('.menuDrop');
        this.menu = this.dropdown.querySelector('.dropdown-menu');
        this.triggerLabel = this.dropdown.querySelector('#triggerLabel, .triggerLabel');
        this.menuItems = this.dropdown.querySelectorAll('.menu-item');
        this.chevron = this.dropdown.querySelector('.chevron');

        this.isOpen = false;
        this.selectedItem = null;
        this.value = null;

        this.init();
    }

    init() {
        // Clique no trigger
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Clique nos itens do menu
        this.menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectItem(item);
            });
        });

        // Registra este dropdown na lista global
        Dropdown.instances.push(this);
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        // Fecha todos os outros dropdowns antes de abrir este
        Dropdown.closeAll(this);

        this.isOpen = true;
        this.menu.classList.add('open');
        this.dropdown.classList.add('active');
        if (this.chevron) {
            this.chevron.classList.add('rotated');
        }
    }

    close() {
        this.isOpen = false;
        this.menu.classList.remove('open');
        this.dropdown.classList.remove('active');
        if (this.chevron) {
            this.chevron.classList.remove('rotated');
        }
    }

    selectItem(item) {
        // Remove seleção anterior
        this.menuItems.forEach(menuItem => {
            menuItem.classList.remove('selected');
        });

        // Adiciona seleção ao item clicado
        item.classList.add('selected');

        // Atualiza o trigger com o item selecionado
        const label = item.querySelector('.item-label').textContent;
        const id = item.getAttribute('data-id');
        
        // Salva o valor na instância da classe
        this.value = label;
        
        // Salva o valor no elemento DOM (para acessar via document.getElementById('ev-tipo').value)
        this.dropdown.value = label;
        this.dropdown.dataset.selectedId = id;

        if (this.triggerLabel) {
            this.triggerLabel.textContent = label;
        }

        // Guarda o item selecionado
        this.selectedItem = {
            id: id,
            label: label
        };

        // Fecha o menu
        this.close();

        // Dispara evento customizado
        const event = new CustomEvent('dropdownSelect', {
            detail: this.selectedItem
        });
        this.dropdown.dispatchEvent(event);
    }

    // Define valor programaticamente
    setValue(idOrLabel) {
        this.menuItems.forEach(item => {
            const id = item.getAttribute('data-id');
            const label = item.querySelector('.item-label').textContent;

            if (id === String(idOrLabel) || label === idOrLabel) {
                this.selectItem(item);
            }
        });
    }

    // Retorna o valor atual
    getValue() {
        return this.selectedItem;
    }

    // Retorna só o label
    getLabel() {
        return this.value;
    }

    // Retorna só o ID
    getId() {
        return this.selectedItem?.id || null;
    }

    // Lista estática de todas as instâncias
    static instances = [];

    // Fecha todos os dropdowns (exceto o especificado)
    static closeAll(except = null) {
        Dropdown.instances.forEach(instance => {
            if (instance !== except) {
                instance.close();
            }
        });
    }
}

// Event listeners globais (executam uma vez)
document.addEventListener('click', (e) => {
    const clickedInside = Dropdown.instances.some(instance => 
        instance.dropdown.contains(e.target)
    );
    
    // Fecha todos se clicar fora de qualquer dropdown
    if (!clickedInside) {
        Dropdown.closeAll();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        Dropdown.closeAll();
    }
});


// ============================================
// EXEMPLO DE USO
// ============================================

// Inicializa cada dropdown com seu seletor

// Agenda
if (document.getElementById('ev-tipo')) {
    const dropTipo = new Dropdown('#ev-tipo');
}
if (document.getElementById('ev-repeticao')) {
    const dropRepeticao = new Dropdown('#ev-repeticao');
}

// Tabela
export function criaDrop(dropID) {
    const dropFiltroRegime = new Dropdown('#' + dropID);
}


// Definir valor programaticamente
// dropTipo.setValue('Demanda');
// dropTipo.setValue('1'); // por ID

// Obter valor atual
// console.log(dropTipo.getValue());