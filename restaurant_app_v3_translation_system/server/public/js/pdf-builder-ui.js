/**
 * PDF MENU BUILDER - USER INTERFACE
 * 
 * Gestionează interfața pentru configurare avansată PDF meniuri
 * Funcționalități:
 * - Drag & drop pentru reordonare categorii
 * - Toggle ON/OFF categorii și produse
 * - Upload/delete imagini categorii
 * - Page breaks manuale
 * - Preview PDF în browser
 * - Regenerare PDF
 */

// ============================================================================
// GLOBAL STATE
// ============================================================================
let currentType = 'food'; // 'food' sau 'drinks'
let currentConfig = null;
let sortableInstance = null;

// ============================================================================
// INIT
// ============================================================================
function initPdfBuilder() {
    console.log('🎨 [PDF Builder] Inițializare...');
    
    // Event listeners pentru tabs
    document.querySelectorAll('.pdf-builder-tab').forEach(tab => {
        tab.addEventListener('click', () => switchType(tab.dataset.type));
    });
    
    // Event listeners pentru acțiuni
    document.getElementById('savePdfConfig').addEventListener('click', savePdfConfig);
    document.getElementById('regeneratePdf').addEventListener('click', regeneratePdf);
    document.getElementById('previewPdf').addEventListener('click', previewPdf);
    document.getElementById('closePdfBuilder').addEventListener('click', closePdfBuilder);
    
    // Load configurația inițială
    loadPdfConfig(currentType);
}

// ============================================================================
// SWITCH TYPE (Food / Drinks)
// ============================================================================
function switchType(type) {
    currentType = type;
    
    // Update tabs UI
    document.querySelectorAll('.pdf-builder-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    
    // Load config pentru noul tip
    loadPdfConfig(type);
}

// ============================================================================
// LOAD CONFIG
// ============================================================================
async function loadPdfConfig(type) {
    try {
        showLoadingState();
        
        const response = await fetch(`/api/menu/pdf/builder/config?type=${type}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la încărcarea configurației');
        }
        
        currentConfig = data;
        renderCategoriesList(data.categories);
        hideLoadingState();
        
    } catch (error) {
        console.error('❌ [PDF Builder] Eroare:', error);
        alert(`Eroare la încărcarea configurației: ${error.message}`);
        hideLoadingState();
    }
}

// ============================================================================
// RENDER CATEGORIES LIST
// ============================================================================
function renderCategoriesList(categories) {
    const container = document.getElementById('categoriesList');
    
    if (!categories || categories.length === 0) {
        container.innerHTML = `
            <div class="pdf-builder-empty">
                <p>📋 Nicio categorie configurată pentru ${currentType === 'food' ? 'Mâncare' : 'Băuturi'}.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = categories.map(cat => `
        <div class="category-card" data-id="${cat.id}">
            <div class="category-card-header">
                <div class="drag-handle" title="Drag pentru reordonare">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                
                <label class="toggle-switch">
                    <input type="checkbox" 
                           ${cat.display_in_pdf ? 'checked' : ''} 
                           onchange="toggleCategoryVisibility(${cat.id}, this.checked)">
                    <span class="toggle-slider"></span>
                </label>
                
                <h4 class="category-name">${cat.category_name}</h4>
                
                <div class="category-actions">
                    <button class="btn-icon" 
                            onclick="toggleCategoryExpand(${cat.id})" 
                            title="Vezi produse">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
            </div>
            
            <div class="category-card-body" id="category-body-${cat.id}">
                ${renderCategoryBody(cat)}
            </div>
        </div>
    `).join('');
    
    // Initialize Sortable.js pentru drag & drop
    initSortable();
}

// ============================================================================
// RENDER CATEGORY BODY (Image + Products + Page Break)
// ============================================================================
function renderCategoryBody(category) {
    return `
        <div class="category-image-section">
            <label class="section-label">📷 Imagine Header Categorie</label>
            ${category.header_image 
                ? `
                    <div class="category-image-preview">
                        <img src="${category.header_image}" alt="${category.category_name}">
                        <button class="btn-delete-image" 
                                onclick="deleteCategoryImage(${category.id})"
                                title="Șterge imagine">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `
                : `
                    <div class="category-image-upload">
                        <label for="upload-${category.id}" class="upload-label">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <span>Click pentru upload imagine</span>
                        </label>
                        <input type="file" 
                               id="upload-${category.id}" 
                               accept="image/jpeg,image/jpg,image/png,image/webp"
                               onchange="uploadCategoryImage(${category.id}, this.files[0])"
                               style="display: none;">
                    </div>
                `
            }
        </div>
        
        <div class="category-pagebreak-section">
            <label class="checkbox-label">
                <input type="checkbox" 
                       ${category.page_break_after ? 'checked' : ''}
                       onchange="togglePageBreak(${category.id}, this.checked)">
                <span>📄 Forțează pagină nouă după această categorie</span>
            </label>
        </div>
        
        <div class="category-products-section">
            <label class="section-label">
                🍽️ Produse (${category.products.length})
                <button class="btn-toggle-all" 
                        onclick="toggleAllProducts(${category.id}, true)">
                    Toate ON
                </button>
                <button class="btn-toggle-all" 
                        onclick="toggleAllProducts(${category.id}, false)">
                    Toate OFF
                </button>
            </label>
            <div class="products-list">
                ${category.products.map(prod => `
                    <div class="product-item" data-product-id="${prod.id}">
                        <label class="toggle-switch toggle-sm">
                            <input type="checkbox" 
                                   ${prod.display_in_pdf ? 'checked' : ''} 
                                   onchange="toggleProductVisibility(${prod.id}, this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="product-name">${prod.name}</span>
                        <span class="product-price">${prod.price} RON</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============================================================================
// INIT SORTABLE.JS
// ============================================================================
function initSortable() {
    if (sortableInstance) {
        sortableInstance.destroy();
    }
    
    const container = document.getElementById('categoriesList');
    
    sortableInstance = new Sortable(container, {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: function(evt) {
            console.log(`📦 [PDF Builder] Categorie mutată: ${evt.oldIndex} → ${evt.newIndex}`);
            // Auto-save nu este necesar - user-ul va apăsa "Salvează"
        }
    });
}

// ============================================================================
// TOGGLE CATEGORY EXPAND/COLLAPSE
// ============================================================================
function toggleCategoryExpand(categoryId) {
    const body = document.getElementById(`category-body-${categoryId}`);
    const icon = event.target.closest('button').querySelector('i');
    
    body.classList.toggle('expanded');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}

// ============================================================================
// TOGGLE CATEGORY VISIBILITY
// ============================================================================
function toggleCategoryVisibility(categoryId, isVisible) {
    // Update în state local
    const category = currentConfig.categories.find(c => c.id === categoryId);
    if (category) {
        category.display_in_pdf = isVisible ? 1 : 0;
    }
    
    console.log(`👁️ [PDF Builder] Categorie ${categoryId}: ${isVisible ? 'Vizibilă' : 'Ascunsă'}`);
}

// ============================================================================
// TOGGLE PAGE BREAK
// ============================================================================
function togglePageBreak(categoryId, enabled) {
    const category = currentConfig.categories.find(c => c.id === categoryId);
    if (category) {
        category.page_break_after = enabled ? 1 : 0;
    }
    
    console.log(`📄 [PDF Builder] Page Break categoria ${categoryId}: ${enabled ? 'ON' : 'OFF'}`);
}

// ============================================================================
// TOGGLE PRODUCT VISIBILITY
// ============================================================================
function toggleProductVisibility(productId, isVisible) {
    // Găsește produsul în toate categoriile
    let product = null;
    for (const category of currentConfig.categories) {
        product = category.products.find(p => p.id === productId);
        if (product) break;
    }
    
    if (product) {
        product.display_in_pdf = isVisible ? 1 : 0;
    }
    
    console.log(`🍽️ [PDF Builder] Produs ${productId}: ${isVisible ? 'Vizibil' : 'Ascuns'}`);
}

// ============================================================================
// TOGGLE ALL PRODUCTS
// ============================================================================
function toggleAllProducts(categoryId, isVisible) {
    const category = currentConfig.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    category.products.forEach(prod => {
        prod.display_in_pdf = isVisible ? 1 : 0;
    });
    
    // Re-render category body
    document.getElementById(`category-body-${categoryId}`).innerHTML = renderCategoryBody(category);
    
    console.log(`🍽️ [PDF Builder] Toate produsele din ${category.category_name}: ${isVisible ? 'ON' : 'OFF'}`);
}

// ============================================================================
// UPLOAD CATEGORY IMAGE
// ============================================================================
async function uploadCategoryImage(categoryId, file) {
    if (!file) return;
    
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`/api/menu/pdf/builder/upload-category-image/${categoryId}`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la upload imagine');
        }
        
        // Update în state local
        const category = currentConfig.categories.find(c => c.id === categoryId);
        if (category) {
            category.header_image = data.imagePath;
        }
        
        // Re-render category body
        document.getElementById(`category-body-${categoryId}`).innerHTML = renderCategoryBody(category);
        
        alert('✅ Imagine uploadată cu succes!');
        
    } catch (error) {
        console.error('❌ [PDF Builder] Eroare upload:', error);
        alert(`Eroare la upload: ${error.message}`);
    }
}

// ============================================================================
// DELETE CATEGORY IMAGE
// ============================================================================
async function deleteCategoryImage(categoryId) {
    if (!confirm('Sigur vrei să ștergi imaginea acestei categorii?')) return;
    
    try {
        const response = await fetch(`/api/menu/pdf/builder/delete-category-image/${categoryId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la ștergere imagine');
        }
        
        // Update în state local
        const category = currentConfig.categories.find(c => c.id === categoryId);
        if (category) {
            category.header_image = null;
        }
        
        // Re-render category body
        document.getElementById(`category-body-${categoryId}`).innerHTML = renderCategoryBody(category);
        
        alert('✅ Imagine ștearsă cu succes!');
        
    } catch (error) {
        console.error('❌ [PDF Builder] Eroare ștergere:', error);
        alert(`Eroare la ștergere: ${error.message}`);
    }
}

// ============================================================================
// SAVE PDF CONFIG
// ============================================================================
async function savePdfConfig() {
    try {
        showLoadingState('Salvare configurație...');
        
        // Obține ordinea categoriilor din DOM
        const categoryElements = Array.from(document.querySelectorAll('.category-card'));
        const categoriesData = categoryElements.map((el, index) => {
            const categoryId = parseInt(el.dataset.id);
            const category = currentConfig.categories.find(c => c.id === categoryId);
            
            return {
                id: categoryId,
                display_in_pdf: category.display_in_pdf,
                order_index: index,
                page_break_after: category.page_break_after
            };
        });
        
        // Salvează categorii
        const catResponse = await fetch('/api/menu/pdf/builder/config/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categories: categoriesData })
        });
        
        const catData = await catResponse.json();
        if (!catData.success) {
            throw new Error(catData.error || 'Eroare la salvare categorii');
        }
        
        // Colectează toate produsele
        const productsData = [];
        currentConfig.categories.forEach(category => {
            category.products.forEach(prod => {
                productsData.push({
                    product_id: prod.id,
                    display_in_pdf: prod.display_in_pdf
                });
            });
        });
        
        // Salvează produse
        const prodResponse = await fetch('/api/menu/pdf/builder/config/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products: productsData })
        });
        
        const prodData = await prodResponse.json();
        if (!prodData.success) {
            throw new Error(prodData.error || 'Eroare la salvare produse');
        }
        
        hideLoadingState();
        alert('✅ Configurație salvată cu succes!');
        
    } catch (error) {
        console.error('❌ [PDF Builder] Eroare salvare:', error);
        alert(`Eroare la salvare: ${error.message}`);
        hideLoadingState();
    }
}

// ============================================================================
// REGENERATE PDF
// ============================================================================
async function regeneratePdf() {
    const type = document.getElementById('regenerateType').value;
    
    if (!confirm(`Regenerezi PDF-urile pentru ${type === 'all' ? 'TOT' : type.toUpperCase()}?`)) return;
    
    try {
        showLoadingState(`Regenerare PDF-uri (${type})...`);
        
        const response = await fetch('/api/menu/pdf/builder/regenerate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: type })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la regenerare PDF');
        }
        
        hideLoadingState();
        alert(`✅ ${data.message}`);
        
    } catch (error) {
        console.error('❌ [PDF Builder] Eroare regenerare:', error);
        alert(`Eroare la regenerare: ${error.message}`);
        hideLoadingState();
    }
}

// ============================================================================
// PREVIEW PDF
// ============================================================================
function previewPdf() {
    const type = currentType; // 'food' sau 'drinks'
    const lang = document.getElementById('previewLang').value; // 'ro' sau 'en'
    
    const url = `/api/menu/pdf/${type}/${lang}`;
    window.open(url, '_blank');
}

// ============================================================================
// OPEN/CLOSE PDF BUILDER MODAL
// ============================================================================
function openPdfBuilder() {
    document.getElementById('pdfBuilderModal').style.display = 'flex';
    initPdfBuilder();
}

function closePdfBuilder() {
    document.getElementById('pdfBuilderModal').style.display = 'none';
    
    // Cleanup
    if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
    }
}

// ============================================================================
// LOADING STATE
// ============================================================================
function showLoadingState(message = 'Se încarcă...') {
    const overlay = document.getElementById('pdfBuilderLoadingOverlay');
    const text = overlay.querySelector('.loading-text');
    text.textContent = message;
    overlay.style.display = 'flex';
}

function hideLoadingState() {
    document.getElementById('pdfBuilderLoadingOverlay').style.display = 'none';
}

// ============================================================================
// EXPOSE GLOBAL
// ============================================================================
window.openPdfBuilder = openPdfBuilder;
window.closePdfBuilder = closePdfBuilder;
window.toggleCategoryExpand = toggleCategoryExpand;
window.toggleCategoryVisibility = toggleCategoryVisibility;
window.togglePageBreak = togglePageBreak;
window.toggleProductVisibility = toggleProductVisibility;
window.toggleAllProducts = toggleAllProducts;
window.uploadCategoryImage = uploadCategoryImage;
window.deleteCategoryImage = deleteCategoryImage;
window.savePdfConfig = savePdfConfig;
window.regeneratePdf = regeneratePdf;
window.previewPdf = previewPdf;

