// Autocomplete utility for client and supplier fields
export class AutocompleteComponent {
    constructor(inputElement, dataSource, onSelect = null) {
        this.input = inputElement;
        this.dataSource = dataSource;
        this.onSelect = onSelect;
        this.dropdown = null;
        this.filteredData = [];
        this.selectedIndex = -1;
        
        this.init();
    }

    init() {
        // Create dropdown container
        this.createDropdown();
        
        // Add event listeners
        this.input.addEventListener('input', this.handleInput.bind(this));
        this.input.addEventListener('keydown', this.handleKeydown.bind(this));
        this.input.addEventListener('blur', this.handleBlur.bind(this));
        this.input.addEventListener('focus', this.handleFocus.bind(this));
        
        // Position dropdown
        this.positionDropdown();
    }

    createDropdown() {
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'autocomplete-dropdown';
        this.dropdown.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-top: none;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            width: 100%;
            display: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        
        // Insert dropdown after input
        this.input.parentNode.insertBefore(this.dropdown, this.input.nextSibling);
    }

    positionDropdown() {
        const inputRect = this.input.getBoundingClientRect();
        const parentRect = this.input.offsetParent.getBoundingClientRect();
        
        this.dropdown.style.top = (this.input.offsetTop + this.input.offsetHeight) + 'px';
        this.dropdown.style.left = this.input.offsetLeft + 'px';
        this.dropdown.style.width = this.input.offsetWidth + 'px';
    }

    async handleInput(event) {
        const value = event.target.value.trim();
        
        if (value.length === 0) {
            this.hideDropdown();
            return;
        }

        // Get fresh data from source
        const data = await this.getData();
        
        // Filter data based on input
        this.filteredData = data.filter(item => 
            item.name.toLowerCase().includes(value.toLowerCase())
        );

        this.selectedIndex = -1;
        this.renderDropdown();
    }

    async getData() {
        if (typeof this.dataSource === 'function') {
            return await this.dataSource();
        }
        return this.dataSource || [];
    }

    renderDropdown() {
        if (this.filteredData.length === 0) {
            this.hideDropdown();
            return;
        }

        this.dropdown.innerHTML = '';
        
        this.filteredData.forEach((item, index) => {
            const option = document.createElement('div');
            option.className = 'autocomplete-option';
            option.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #eee;
                transition: background-color 0.2s;
            `;
            option.textContent = item.name;
            option.dataset.index = index;
            
            option.addEventListener('mouseenter', () => {
                this.selectedIndex = index;
                this.highlightOption();
            });
            
            option.addEventListener('click', () => {
                this.selectOption(item);
            });
            
            this.dropdown.appendChild(option);
        });

        this.showDropdown();
        this.highlightOption();
    }

    highlightOption() {
        const options = this.dropdown.querySelectorAll('.autocomplete-option');
        options.forEach((option, index) => {
            if (index === this.selectedIndex) {
                option.style.backgroundColor = '#f0f0f0';
            } else {
                option.style.backgroundColor = 'white';
            }
        });
    }

    handleKeydown(event) {
        if (!this.isDropdownVisible()) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredData.length - 1);
                this.highlightOption();
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.highlightOption();
                break;
            case 'Enter':
                event.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectOption(this.filteredData[this.selectedIndex]);
                }
                break;
            case 'Escape':
                this.hideDropdown();
                break;
        }
    }

    handleFocus() {
        if (this.input.value.trim() && this.filteredData.length > 0) {
            this.showDropdown();
        }
    }

    handleBlur(event) {
        // Delay hiding to allow click on dropdown
        setTimeout(() => {
            if (!this.dropdown.contains(document.activeElement)) {
                this.hideDropdown();
            }
        }, 150);
    }

    selectOption(item) {
        this.input.value = item.name;
        this.input.dataset.selectedId = item.id;
        this.hideDropdown();
        
        if (this.onSelect) {
            this.onSelect(item);
        }

        // Trigger change event
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    showDropdown() {
        this.dropdown.style.display = 'block';
        this.positionDropdown();
    }

    hideDropdown() {
        this.dropdown.style.display = 'none';
    }

    isDropdownVisible() {
        return this.dropdown.style.display === 'block';
    }

    destroy() {
        if (this.dropdown && this.dropdown.parentNode) {
            this.dropdown.parentNode.removeChild(this.dropdown);
        }
    }
}

// Helper functions for getting client and supplier data
export async function getClientsForAutocomplete() {
    try {
        const response = await fetch('http://localhost:3500/clientes');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                return data.map(client => ({
                    id: client.idCliente,
                    name: client.nomeCliente
                }));
            }
        }
    } catch (error) {
        console.error('Error fetching clients:', error);
    }
    return [];
}

export async function getSuppliersForAutocomplete() {
    try {
        const response = await fetch('http://localhost:3500/pedidos');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                // Extract unique suppliers from orders
                const suppliers = [...new Set(data
                    .map(pedido => pedido.fornecedor)
                    .filter(fornecedor => fornecedor && fornecedor.trim() !== '')
                )];
                
                return suppliers.map((supplier, index) => ({
                    id: `supplier_${index}`,
                    name: supplier
                }));
            }
        }
    } catch (error) {
        console.error('Error fetching suppliers:', error);
    }
    return [];
}