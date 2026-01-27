/**
 * Helper pentru traducerea dinamică a conținutului tabelului de stocuri
 * Acest script traduce automat categoriile, unitățile și furnizorii din tabel
 */

class StockTranslationHelper {
    constructor() {
        this.translationManager = window.translationManager;
        this.observer = null;
        this.isInitialized = false;
    }

    /**
     * Inițializează helper-ul
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('[StockTranslationHelper] Initializing...');
        
        // Așteaptă ca TranslationManager să fie disponibil
        if (!this.translationManager) {
            console.warn('[StockTranslationHelper] TranslationManager not available');
            return;
        }

        // Așteaptă ca traducerile să fie încărcate
        await this.translationManager.loadLanguage(this.translationManager.getCurrentLanguage());
        
        this.setupObserver();
        this.isInitialized = true;
        
        console.log('[StockTranslationHelper] Initialized successfully');
    }

    /**
     * Configurează observer pentru conținutul dinamic
     */
    setupObserver() {
        this.observer = new MutationObserver((mutations) => {
            let shouldTranslate = false;
            
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Verifică dacă este tabelul de stocuri
                            if (node.classList && node.classList.contains('stock-table')) {
                                shouldTranslate = true;
                            } else if (node.querySelector && node.querySelector('.stock-table')) {
                                shouldTranslate = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldTranslate) {
                console.log('[StockTranslationHelper] Stock table detected, applying translations...');
                setTimeout(() => this.translateStockTable(), 100);
            }
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Traduce tabelul de stocuri
     */
    async translateStockTable() {
        const stockTable = document.querySelector('.stock-table, #stockTable, table[data-stock-table]');
        if (!stockTable) {
            console.log('[StockTranslationHelper] No stock table found');
            return;
        }

        console.log('[StockTranslationHelper] Translating stock table...');
        
        // Traduce header-ul tabelului
        await this.translateTableHeaders(stockTable);
        
        // Traduce rândurile de date
        await this.translateTableRows(stockTable);
        
        console.log('[StockTranslationHelper] Stock table translation completed');
    }

    /**
     * Traduce header-ul tabelului
     */
    async translateTableHeaders(table) {
        const headers = table.querySelectorAll('thead th, .table-header');
        
        for (const header of headers) {
            const text = header.textContent.trim();
            const translationKey = this.getHeaderTranslationKey(text);
            
            if (translationKey) {
                const translation = await this.translationManager.getTranslation(translationKey);
                if (translation !== translationKey) {
                    header.textContent = translation;
                }
            }
        }
    }

    /**
     * Traduce rândurile de date
     */
    async translateTableRows(table) {
        const rows = table.querySelectorAll('tbody tr, .stock-row');
        
        for (const row of rows) {
            await this.translateTableRow(row);
        }
    }

    /**
     * Traduce un rând de date
     */
    async translateTableRow(row) {
        const cells = row.querySelectorAll('td');
        
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            const text = cell.textContent.trim();
            
            // Traduce categoria (de obicei a 2-a coloană)
            if (i === 1) {
                const translatedCategory = await this.translateCategory(text);
                if (translatedCategory !== text) {
                    cell.textContent = translatedCategory;
                }
            }
            
            // Traduce unitatea (de obicei a 3-a coloană)
            if (i === 2) {
                const translatedUnit = await this.translateUnit(text);
                if (translatedUnit !== text) {
                    cell.textContent = translatedUnit;
                }
            }
            
            // Traduce furnizorul (de obicei a 7-a coloană)
            if (i === 6) {
                const translatedSupplier = await this.translateSupplier(text);
                if (translatedSupplier !== text) {
                    cell.textContent = translatedSupplier;
                }
            }
            
            // Traduce statusul (de obicei a 8-a coloană)
            if (i === 7) {
                const translatedStatus = await this.translateStatus(text);
                if (translatedStatus !== text) {
                    cell.textContent = translatedStatus;
                }
            }
            
            // Traduce butoanele de acțiune (ultima coloană)
            if (i === cells.length - 1) {
                await this.translateActionButtons(cell);
            }
        }
    }

    /**
     * Traduce butoanele de acțiune
     */
    async translateActionButtons(cell) {
        const buttons = cell.querySelectorAll('button, a');
        
        for (const button of buttons) {
            const text = button.textContent.trim();
            const translationKey = this.getActionTranslationKey(text);
            
            if (translationKey) {
                const translation = await this.translationManager.getTranslation(translationKey);
                if (translation !== translationKey) {
                    button.textContent = translation;
                }
            }
        }
    }

    /**
     * Traduce o categorie
     */
    async translateCategory(category) {
        const translationKey = `stock.categories.${this.normalizeKey(category)}`;
        const translation = await this.translationManager.getTranslation(translationKey);
        return translation !== translationKey ? translation : category;
    }

    /**
     * Traduce o unitate
     */
    async translateUnit(unit) {
        const translationKey = `stock.units.${this.normalizeKey(unit)}`;
        const translation = await this.translationManager.getTranslation(translationKey);
        return translation !== translationKey ? translation : unit;
    }

    /**
     * Traduce un furnizor
     */
    async translateSupplier(supplier) {
        const translationKey = `stock.suppliers.${this.normalizeKey(supplier)}`;
        const translation = await this.translationManager.getTranslation(translationKey);
        return translation !== translationKey ? translation : supplier;
    }

    /**
     * Traduce un status
     */
    async translateStatus(status) {
        const translationKey = `stock.${this.normalizeKey(status)}`;
        const translation = await this.translationManager.getTranslation(translationKey);
        return translation !== translationKey ? translation : status;
    }

    /**
     * Obține cheia de traducere pentru header
     */
    getHeaderTranslationKey(text) {
        const headerMap = {
            'Ingredient': 'stock.ingredient',
            'Category': 'stock.category',
            'Unit': 'stock.unit',
            'Current Stock': 'stock.currentStock',
            'Minimum Stock': 'stock.minimumStock',
            'Cost/Unit': 'stock.costPerUnit',
            'Supplier': 'stock.supplier',
            'Status': 'stock.status',
            'Actions': 'stock.actions'
        };
        
        return headerMap[text] || null;
    }

    /**
     * Obține cheia de traducere pentru acțiuni
     */
    getActionTranslationKey(text) {
        const actionMap = {
            '✏️ Edit': 'stock.edit',
            '⚖️ Ajustează': 'stock.adjust',
            '🗑️ Delete': 'stock.delete'
        };
        
        return actionMap[text] || null;
    }

    /**
     * Normalizează o cheie pentru traducere
     */
    normalizeKey(key) {
        return key.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/ă/g, 'a')
            .replace(/â/g, 'a')
            .replace(/î/g, 'i')
            .replace(/ș/g, 's')
            .replace(/ț/g, 't');
    }

    /**
     * Traduce manual un tabel de stocuri
     */
    async translateStockTableManually(tableSelector = '.stock-table') {
        const table = document.querySelector(tableSelector);
        if (!table) {
            console.warn('[StockTranslationHelper] Table not found:', tableSelector);
            return;
        }
        
        await this.translateStockTable();
    }

    /**
     * Distruge observer-ul
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.isInitialized = false;
    }
}

// Creează instanța globală
window.stockTranslationHelper = new StockTranslationHelper();

// Auto-inițializare
document.addEventListener('DOMContentLoaded', () => {
    if (window.translationManager) {
        window.stockTranslationHelper.initialize();
    } else {
        // Așteaptă ca TranslationManager să fie disponibil
        const checkTranslationManager = setInterval(() => {
            if (window.translationManager) {
                clearInterval(checkTranslationManager);
                window.stockTranslationHelper.initialize();
            }
        }, 100);
    }
});

// Export pentru module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StockTranslationHelper;
}
