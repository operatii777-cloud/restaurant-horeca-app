/**
 * ============================================================================
 * CATALOG PRODUSE - MODERN STYLE JAVASCRIPT
 * ============================================================================
 * Created: 23 Oct 2025
 * Purpose: Complete functionality for MODERN-style product catalog
 * ============================================================================
 */

// Global state
let catalogCategories = [];
let catalogProducts = [];
let catalogFilteredProducts = [];
let catalogSelectedCategory = null;
let catalogSelectedProducts = new Set();
let catalogCurrentEditingCategory = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize Catalog Produse when section is shown
 */
async function initCatalogProduse() {
    console.log('📋 Initializing Catalog Produse...');
    
    try {
        // Load categories tree (nu aruncă eroare dacă eșuează)
        await catalogLoadCategories();
        if (catalogCategories.length > 0) {
            console.log('✅ Categories loaded, count:', catalogCategories.length);
        } else {
            console.warn('⚠️ No categories loaded - endpoint may not be available');
        }
        
        // Load all products (continuă chiar dacă categoriile au eșuat)
        try {
            await catalogLoadProducts();
            console.log('✅ Products loaded, count:', catalogProducts.length);
        } catch (productError) {
            console.warn('⚠️ Error loading products:', productError.message);
            catalogProducts = [];
        }
        
        if (catalogCategories.length > 0 || catalogProducts.length > 0) {
            console.log('✅ Catalog Produse initialized successfully');
        } else {
            console.warn('⚠️ Catalog Produse initialized but no data loaded - check server routes');
        }
    } catch (error) {
        // Nu mai aruncăm eroare critică - doar logăm
        console.warn('⚠️ Error during Catalog Produse initialization:', error.message);
        // Nu mai afișăm alertă critică - doar continuăm
    }
}

// ============================================================================
// CATEGORIES MANAGEMENT
// ============================================================================

/**
 * Load categories from API as hierarchical tree
 */
async function catalogLoadCategories() {
    try {
        const response = await fetch('/api/catalog/categories/tree');
        
        // Verifică status înainte de a încerca să parseze
        if (!response.ok) {
            // Pentru 404 sau alte erori, nu aruncăm eroare - doar logăm și returnăm
            if (response.status === 404) {
                console.warn('⚠️ Catalog categories endpoint not found (404) - endpoint may not be registered or server not restarted');
                console.warn('   Make sure the server has been restarted after adding catalog routes');
                catalogCategories = [];
                catalogRenderCategoriesTree([]);
                return;
            }
            // Pentru alte erori HTTP, logăm dar nu aruncăm
            console.warn(`⚠️ Catalog categories endpoint returned HTTP ${response.status}`);
            catalogCategories = [];
            catalogRenderCategoriesTree([]);
            return;
        }
        
        // Verifică dacă răspunsul este JSON valid
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('⚠️ Catalog categories endpoint returned non-JSON response');
            catalogCategories = [];
            catalogRenderCategoriesTree([]);
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            catalogCategories = data.categories;
            catalogRenderCategoriesTree(catalogCategories);
            console.log(`✅ Loaded ${data.total} categories`);
        } else {
            // Nu mai aruncăm eroare - doar logăm și continuăm
            console.warn('⚠️ Categories API returned unsuccessful response:', data.error || 'Unknown error');
            catalogCategories = [];
            catalogRenderCategoriesTree([]);
            return;
        }
    } catch (error) {
        // Tratăm toate erorile grațios - nu aruncăm niciodată eroarea mai departe
        if (error instanceof SyntaxError || error.message.includes('JSON')) {
            console.warn('⚠️ Failed to parse categories response - endpoint may not be available or returned HTML');
        } else if (error.message && (error.message.includes('Endpoint not found') || error.message.includes('404'))) {
            console.warn('⚠️ Catalog categories endpoint not found - server may need restart');
        } else {
            console.warn('⚠️ Error loading categories:', error.message || error);
        }
        // Nu mai aruncăm eroarea - doar logăm și continuăm cu array gol
        catalogCategories = [];
        catalogRenderCategoriesTree([]);
        return;
    }
}

/**
 * Render categories tree in left panel
 */
function catalogRenderCategoriesTree(categories, container = document.getElementById('catalogCategoriesTree'), level = 0) {
    if (level === 0) {
        container.innerHTML = '';
    }
    
    categories.forEach(category => {
        const item = document.createElement('div');
        item.className = 'category-item';
        if (category.children && category.children.length > 0) {
            item.classList.add('has-children', 'expanded');
        }
        if (catalogSelectedCategory && catalogSelectedCategory.id === category.id) {
            item.classList.add('selected');
        }
        
        item.style.marginLeft = `${level * 20}px`;
        item.dataset.categoryId = category.id;
        item.dataset.categoryName = category.name;
        
        item.innerHTML = `
            <span class="category-icon">${category.icon || '📁'}</span>
            <span class="category-name">${category.name}</span>
            <span class="category-count">(${category.product_count || 0})</span>
        `;
        
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            catalogSelectCategory(category);
            if (category.children && category.children.length > 0) {
                item.classList.toggle('expanded');
                catalogToggleSubCategories(item);
            }
        });
        
        container.appendChild(item);
        
        // Render children
        if (category.children && category.children.length > 0 && item.classList.contains('expanded')) {
            const subContainer = document.createElement('div');
            subContainer.className = 'sub-categories';
            container.appendChild(subContainer);
            catalogRenderCategoriesTree(category.children, subContainer, level + 1);
        }
    });
}

/**
 * Toggle sub-categories visibility
 */
function catalogToggleSubCategories(item) {
    const next = item.nextElementSibling;
    if (next && next.classList.contains('sub-categories')) {
        next.style.display = item.classList.contains('expanded') ? 'block' : 'none';
    }
}

/**
 * Select a category
 */
function catalogSelectCategory(category) {
    catalogSelectedCategory = category;
    
    // Update UI
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-category-id="${category.id}"]`)?.classList.add('selected');
    
    // Filter products by category
    catalogApplyFilters();
}

/**
 * Add new category
 */
function catalogAddCategory() {
    catalogCurrentEditingCategory = null;
    document.getElementById('catalogCategoryModalTitle').textContent = 'Categorie Nouă';
    document.getElementById('catalogCategoryForm').reset();
    
    // Populate parent dropdown
    catalogPopulateCategoryParentDropdown();
    
    document.getElementById('catalogCategoryModal').style.display = 'block';
}

/**
 * Edit selected category
 */
function catalogEditCategory() {
    if (!catalogSelectedCategory) {
        alert('Selectați o categorie pentru editare');
        return;
    }
    
    catalogCurrentEditingCategory = catalogSelectedCategory;
    document.getElementById('catalogCategoryModalTitle').textContent = 'Editare Categorie';
    
    document.getElementById('catalogCategoryName').value = catalogSelectedCategory.name;
    document.getElementById('catalogCategoryNameEn').value = catalogSelectedCategory.name_en || '';
    document.getElementById('catalogCategoryIcon').value = catalogSelectedCategory.icon || '';
    
    catalogPopulateCategoryParentDropdown(catalogSelectedCategory.parent_id);
    
    document.getElementById('catalogCategoryModal').style.display = 'block';
}

/**
 * Populate parent category dropdown
 */
function catalogPopulateCategoryParentDropdown(selectedParentId = null) {
    const select = document.getElementById('catalogCategoryParent');
    select.innerHTML = '<option value="">-- Fără părinte (categorie root) --</option>';
    
    function addOptions(categories, level = 0) {
        categories.forEach(cat => {
            // Don't show current editing category as parent option
            if (catalogCurrentEditingCategory && cat.id === catalogCurrentEditingCategory.id) {
                return;
            }
            
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = '  '.repeat(level) + cat.name;
            if (selectedParentId && cat.id === selectedParentId) {
                option.selected = true;
            }
            select.appendChild(option);
            
            if (cat.children && cat.children.length > 0) {
                addOptions(cat.children, level + 1);
            }
        });
    }
    
    addOptions(catalogCategories);
}

/**
 * Save category (create or update)
 */
async function catalogSaveCategory(event) {
    event.preventDefault();
    
    const name = document.getElementById('catalogCategoryName').value;
    const name_en = document.getElementById('catalogCategoryNameEn').value;
    const parent_id = document.getElementById('catalogCategoryParent').value || null;
    const icon = document.getElementById('catalogCategoryIcon').value;
    
    try {
        let response;
        
        if (catalogCurrentEditingCategory) {
            // Update existing category
            response = await fetch(`/api/catalog/categories/${catalogCurrentEditingCategory.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, name_en, icon })
            });
        } else {
            // Create new category
            response = await fetch('/api/catalog/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, name_en, parent_id, icon })
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            catalogShowAlert(catalogCurrentEditingCategory ? 'Categorie actualizată!' : 'Categorie creată!', 'success');
            catalogCloseCategoryModal();
            await catalogLoadCategories(); // Reload categories
        } else {
            throw new Error(data.error || 'Failed to save category');
        }
    } catch (error) {
        console.error('Error saving category:', error);
        catalogShowAlert('Eroare: ' + error.message, 'error');
    }
}

/**
 * Delete selected category
 */
async function catalogDeleteCategory() {
    if (!catalogSelectedCategory) {
        alert('Selectați o categorie pentru ștergere');
        return;
    }
    
    if (!confirm(`Sigur doriți să ștergeți categoria "${catalogSelectedCategory.name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/catalog/categories/${catalogSelectedCategory.id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            catalogShowAlert('Categorie ștearsă!', 'success');
            catalogSelectedCategory = null;
            await catalogLoadCategories();
            await catalogLoadProducts();
        } else {
            throw new Error(data.error || 'Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        catalogShowAlert('Eroare: ' + error.message, 'error');
    }
}

/**
 * Clone selected category
 */
function catalogCloneCategory() {
    if (!catalogSelectedCategory) {
        alert('Selectați o categorie pentru clonare');
        return;
    }
    
    const newName = prompt(`Introduceți numele pentru categoria clonată:`, catalogSelectedCategory.name + ' (Copie)');
    if (!newName) return;
    
    // Create new category with cloned data
    catalogCurrentEditingCategory = null;
    document.getElementById('catalogCategoryModalTitle').textContent = 'Categorie Nouă (Clonată)';
    document.getElementById('catalogCategoryName').value = newName;
    document.getElementById('catalogCategoryNameEn').value = (catalogSelectedCategory.name_en || '') + ' (Copy)';
    document.getElementById('catalogCategoryIcon').value = catalogSelectedCategory.icon || '';
    catalogPopulateCategoryParentDropdown(catalogSelectedCategory.parent_id);
    
    document.getElementById('catalogCategoryModal').style.display = 'block';
}

/**
 * Order categories (placeholder - requires drag & drop)
 */
function catalogOrderCategories() {
    alert('Funcția de ordonare categorii va fi implementată cu drag & drop');
    // TODO: Implement drag & drop ordering
}

/**
 * Close category modal
 */
function catalogCloseCategoryModal() {
    document.getElementById('catalogCategoryModal').style.display = 'none';
}

// ============================================================================
// PRODUCTS MANAGEMENT
// ============================================================================

/**
 * Load products from API
 */
async function catalogLoadProducts(categoryName = null) {
    try {
        catalogShowLoading(true);
        
        let url = '/api/catalog/products';
        const params = new URLSearchParams();
        
        if (categoryName) {
            params.append('category', categoryName);
        }
        
        const showOnlyActive = document.getElementById('catalogShowOnlyActive').checked;
        if (showOnlyActive) {
            params.append('is_active', '1');
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
        
        // Verifică status înainte de a încerca să parseze
        if (!response.ok) {
            if (response.status === 404) {
                console.warn('⚠️ Catalog products endpoint not found (404) - endpoint may not be registered or server not restarted');
                catalogProducts = [];
                catalogApplyFilters();
                catalogShowLoading(false);
                return;
            }
            console.warn(`⚠️ Catalog products endpoint returned HTTP ${response.status}`);
            catalogProducts = [];
            catalogApplyFilters();
            catalogShowLoading(false);
            return;
        }
        
        // Verifică dacă răspunsul este JSON valid
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('⚠️ Catalog products endpoint returned non-JSON response');
            catalogProducts = [];
            catalogApplyFilters();
            catalogShowLoading(false);
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            catalogProducts = data.products;
            catalogApplyFilters();
            console.log(`✅ Loaded ${data.total} products`);
        } else {
            // Nu mai aruncăm eroare - doar logăm și continuăm
            console.warn('⚠️ Products API returned unsuccessful response:', data.error || 'Unknown error');
            catalogProducts = [];
            catalogApplyFilters();
        }
    } catch (error) {
        // Tratăm toate erorile grațios - nu aruncăm eroarea mai departe
        if (error instanceof SyntaxError || error.message && error.message.includes('JSON')) {
            console.warn('⚠️ Failed to parse products response - endpoint may not be available or returned HTML');
        } else if (error.message && (error.message.includes('Endpoint not found') || error.message.includes('404'))) {
            console.warn('⚠️ Catalog products endpoint not found - server may need restart');
        } else {
            console.warn('⚠️ Error loading products:', error.message || error);
        }
        catalogProducts = [];
        catalogApplyFilters();
    } finally {
        catalogShowLoading(false);
    }
}

/**
 * Apply filters and render products table
 */
function catalogApplyFilters() {
    const searchTerm = document.getElementById('catalogProductSearch')?.value.toLowerCase() || '';
    const showOnlyActive = document.getElementById('catalogShowOnlyActive')?.checked || false;
    
    console.log('🔍 catalogApplyFilters called:', {
        searchTerm,
        showOnlyActive,
        selectedCategory: catalogSelectedCategory ? catalogSelectedCategory.name : 'none',
        totalProducts: catalogProducts.length
    });
    
    catalogFilteredProducts = catalogProducts.filter(product => {
        // Search filter - căutare în nume, nume_en, categorie și descriere
        if (searchTerm) {
            const nameMatch = product.name && product.name.toLowerCase().includes(searchTerm);
            const nameEnMatch = product.name_en && product.name_en.toLowerCase().includes(searchTerm);
            const categoryMatch = product.category && product.category.toLowerCase().includes(searchTerm);
            const descriptionMatch = product.description && product.description.toLowerCase().includes(searchTerm);
            const descriptionEnMatch = product.description_en && product.description_en.toLowerCase().includes(searchTerm);
            
            if (!nameMatch && !nameEnMatch && !categoryMatch && !descriptionMatch && !descriptionEnMatch) {
                return false;
            }
        }
        
        // Active filter
        if (showOnlyActive && !product.is_active) {
            return false;
        }
        
        // Category filter - aplică doar dacă este selectată o categorie explicit din tree
        if (catalogSelectedCategory) {
            // Compară insensitiv la majuscule și elimină spații
            const productCat = (product.category || '').toLowerCase().trim();
            const selectedCat = (catalogSelectedCategory.name || '').toLowerCase().trim();
            
            console.log('🔍 Category match:', {
                productCategory: product.category,
                selectedCategory: catalogSelectedCategory.name,
                match: productCat === selectedCat
            });
            
            if (productCat !== selectedCat) {
                return false;
            }
        }
        
        return true;
    });
    
    console.log('✅ Filtered products:', catalogFilteredProducts.length);
    catalogRenderProductsTable();
}

/**
 * Search products (called on keyup)
 */
function catalogSearchProducts() {
    catalogApplyFilters();
}

/**
 * Render products table
 */
function catalogRenderProductsTable() {
    const tbody = document.getElementById('catalogProductsTableBody');
    tbody.innerHTML = '';
    
    // Update count
    document.getElementById('catalogProductsCount').textContent = `${catalogFilteredProducts.length} produse`;
    
    if (catalogFilteredProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align: center; padding: 40px;">Nu există produse</td></tr>';
        return;
    }
    
    catalogFilteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.dataset.productId = product.id;
        if (catalogSelectedProducts.has(product.id)) {
            row.classList.add('selected');
        }
        
        row.innerHTML = `
            <td><input type="checkbox" ${catalogSelectedProducts.has(product.id) ? 'checked' : ''} onchange="catalogToggleProductSelection(${product.id})"></td>
            <td><strong>${product.name}</strong></td>
            <td>${product.price.toFixed(2)} RON</td>
            <td>${product.vat_rate || 19}%</td>
            <td>${product.unit || 'buc'}</td>
            <td>${product.category}</td>
            <td>${product.stock_management || 'Bar'}</td>
            <td>${product.preparation_section || 'BAR'}</td>
            <td><input type="checkbox" ${product.for_sale ? 'checked' : ''} disabled></td>
            <td><input type="checkbox" ${product.has_recipe ? 'checked' : ''} disabled></td>
            <td><input type="checkbox" ${product.is_fraction ? 'checked' : ''} disabled></td>
        `;
        
        // Double-click to edit (using existing product modal)
        row.addEventListener('dblclick', () => {
            // Use existing openProductModal with product data
            if (typeof openProductModal === 'function') {
                openProductModal(product.id);
            } else {
                catalogEditProduct(product.id);
            }
        });
        
        tbody.appendChild(row);
    });
}

/**
 * Toggle product selection
 */
function catalogToggleProductSelection(productId) {
    if (catalogSelectedProducts.has(productId)) {
        catalogSelectedProducts.delete(productId);
    } else {
        catalogSelectedProducts.add(productId);
    }
    catalogRenderProductsTable();
}

/**
 * Toggle select all products
 */
function catalogToggleSelectAll() {
    const checkbox = document.getElementById('catalogSelectAll');
    
    if (checkbox.checked) {
        catalogFilteredProducts.forEach(p => catalogSelectedProducts.add(p.id));
    } else {
        catalogSelectedProducts.clear();
    }
    
    catalogRenderProductsTable();
}

/**
 * Add new product (use existing modal)
 */
function catalogAddProduct() {
    if (typeof openProductModal === 'function') {
        openProductModal();
    } else {
        alert('Funcția de adăugare produs va folosi modalul existent');
    }
}

/**
 * Edit selected product
 */
function catalogEditProduct(productId = null) {
    if (!productId) {
        const selected = Array.from(catalogSelectedProducts);
        if (selected.length === 0) {
            alert('Selectați un produs pentru editare');
            return;
        }
        productId = selected[0];
    }
    
    if (typeof openProductModal === 'function') {
        openProductModal(productId);
    } else {
        alert('Funcția de editare produs va folosi modalul existent');
    }
}

/**
 * Delete selected products
 */
async function catalogDeleteProduct() {
    const selected = Array.from(catalogSelectedProducts);
    
    if (selected.length === 0) {
        alert('Selectați produse pentru ștergere');
        return;
    }
    
    if (!confirm(`Sigur doriți să ștergeți ${selected.length} produs(e)?`)) {
        return;
    }
    
    try {
        for (const productId of selected) {
            await fetch(`/api/admin/menu/${productId}`, { method: 'DELETE' });
        }
        
        catalogShowAlert(`${selected.length} produs(e) șters(e)!`, 'success');
        catalogSelectedProducts.clear();
        await catalogLoadProducts();
    } catch (error) {
        console.error('Error deleting products:', error);
        catalogShowAlert('Eroare: ' + error.message, 'error');
    }
}

/**
 * Reload products
 */
function catalogReloadProducts() {
    catalogLoadProducts(catalogSelectedCategory ? catalogSelectedCategory.name : null);
}

/**
 * Order products (placeholder)
 */
function catalogOrderProducts() {
    alert('Funcția de ordonare produse va fi implementată cu drag & drop');
    // TODO: Implement drag & drop ordering
}

// ============================================================================
// ADVANCED FUNCTIONS
// ============================================================================

/**
 * Clone selected product
 */
async function catalogCloneProduct() {
    const selected = Array.from(catalogSelectedProducts);
    
    if (selected.length === 0) {
        alert('Selectați un produs pentru clonare');
        return;
    }
    
    const productId = selected[0];
    const newName = prompt('Introduceți numele pentru produsul clonat:');
    if (!newName) return;
    
    try {
        const response = await fetch(`/api/catalog/products/${productId}/clone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_name: newName })
        });
        
        const data = await response.json();
        
        if (data.success) {
            catalogShowAlert('Produs clonat cu succes!', 'success');
            await catalogLoadProducts();
        } else {
            throw new Error(data.error || 'Failed to clone product');
        }
    } catch (error) {
        console.error('Error cloning product:', error);
        catalogShowAlert('Eroare: ' + error.message, 'error');
    }
}

/**
 * Show product dependencies
 */
async function catalogShowDependencies() {
    const selected = Array.from(catalogSelectedProducts);
    
    if (selected.length === 0) {
        alert('Selectați un produs pentru a vedea dependențele');
        return;
    }
    
    const productId = selected[0];
    
    try {
        const response = await fetch(`/api/catalog/products/${productId}/dependencies`);
        const data = await response.json();
        
        if (data.success) {
            const content = document.getElementById('catalogDependenciesContent');
            
            let html = '<div style="padding: 20px;">';
            
            // Ingredients
            html += '<h3>📦 Ingrediente Necesare:</h3>';
            if (data.dependencies.ingredients.length > 0) {
                html += '<table class="catalog-products-table" style="margin-bottom: 20px;"><thead><tr><th>Ingredient</th><th>Cantitate</th><th>Stoc Actual</th></tr></thead><tbody>';
                data.dependencies.ingredients.forEach(ing => {
                    html += `<tr>
                        <td>${ing.name}</td>
                        <td>${ing.quantity} ${ing.unit}</td>
                        <td>${ing.current_stock || 0} ${ing.unit}</td>
                    </tr>`;
                });
                html += '</tbody></table>';
            } else {
                html += '<p>Nu există ingrediente configurate</p>';
            }
            
            // Related products
            html += '<h3>🔗 Produse Similare (folosesc aceleași ingrediente):</h3>';
            if (data.dependencies.related_products.length > 0) {
                html += '<ul>';
                data.dependencies.related_products.forEach(prod => {
                    html += `<li><strong>${prod.name}</strong> (${prod.category})</li>`;
                });
                html += '</ul>';
            } else {
                html += '<p>Nu există produse similare</p>';
            }
            
            html += '</div>';
            content.innerHTML = html;
            
            document.getElementById('catalogDependenciesModal').style.display = 'block';
        } else {
            throw new Error(data.error || 'Failed to load dependencies');
        }
    } catch (error) {
        console.error('Error loading dependencies:', error);
        catalogShowAlert('Eroare: ' + error.message, 'error');
    }
}

/**
 * Show price history
 */
async function catalogShowPriceHistory() {
    const selected = Array.from(catalogSelectedProducts);
    
    if (selected.length === 0) {
        alert('Selectați un produs pentru a vedea istoricul prețurilor');
        return;
    }
    
    const productId = selected[0];
    
    try {
        const response = await fetch(`/api/catalog/products/${productId}/price-history`);
        const data = await response.json();
        
        if (data.success) {
            const content = document.getElementById('catalogPriceHistoryContent');
            
            let html = '<div style="padding: 20px;">';
            
            if (data.history.length > 0) {
                html += '<table class="catalog-products-table"><thead><tr><th>Data</th><th>Preț Vechi</th><th>Preț Nou</th><th>TVA Vechi</th><th>TVA Nou</th><th>Modificat de</th></tr></thead><tbody>';
                data.history.forEach(h => {
                    html += `<tr>
                        <td>${new Date(h.changed_at).toLocaleString('ro-RO')}</td>
                        <td>${h.old_price ? h.old_price.toFixed(2) : '-'} RON</td>
                        <td><strong>${h.new_price ? h.new_price.toFixed(2) : '-'} RON</strong></td>
                        <td>${h.old_vat_rate || '-'}%</td>
                        <td>${h.new_vat_rate || '-'}%</td>
                        <td>${h.changed_by || 'admin'}</td>
                    </tr>`;
                });
                html += '</tbody></table>';
            } else {
                html += '<p>Nu există istoric de modificări</p>';
            }
            
            html += '</div>';
            content.innerHTML = html;
            
            document.getElementById('catalogPriceHistoryModal').style.display = 'block';
        } else {
            throw new Error(data.error || 'Failed to load price history');
        }
    } catch (error) {
        console.error('Error loading price history:', error);
        catalogShowAlert('Eroare: ' + error.message, 'error');
    }
}

/**
 * Bulk price change
 */
function catalogBulkPriceChange() {
    const selected = Array.from(catalogSelectedProducts);
    
    if (selected.length === 0) {
        alert('Selectați produse pentru schimbare preț');
        return;
    }
    
    document.getElementById('catalogBulkSelectedCount').textContent = selected.length;
    document.getElementById('catalogBulkPriceForm').reset();
    document.getElementById('catalogBulkPriceModal').style.display = 'block';
}

/**
 * Save bulk price change
 */
async function catalogSaveBulkPrice(event) {
    event.preventDefault();
    
    const newPrice = parseFloat(document.getElementById('catalogBulkNewPrice').value);
    const newVAT = document.getElementById('catalogBulkNewVAT').value;
    const selected = Array.from(catalogSelectedProducts);
    
    try {
        const response = await fetch('/api/catalog/products/bulk-price-change', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_ids: selected,
                new_price: newPrice,
                new_vat_rate: newVAT ? parseFloat(newVAT) : undefined,
                changed_by: 'admin'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            catalogShowAlert(`Preț actualizat pentru ${data.updated_count} produse!`, 'success');
            catalogCloseBulkPriceModal();
            await catalogLoadProducts();
        } else {
            throw new Error(data.error || 'Failed to update prices');
        }
    } catch (error) {
        console.error('Error updating prices:', error);
        catalogShowAlert('Eroare: ' + error.message, 'error');
    }
}

/**
 * Export products to CSV
 */
function catalogExportProducts() {
    const categoryParam = catalogSelectedCategory ? `&category=${encodeURIComponent(catalogSelectedCategory.name)}` : '';
    const url = `/api/catalog/products/export?format=csv${categoryParam}`;
    
    window.open(url, '_blank');
    catalogShowAlert('Export inițiat! Descărcarea va începe în curând.', 'success');
}

// ============================================================================
// MODAL CONTROLS
// ============================================================================

function catalogClosePriceHistoryModal() {
    document.getElementById('catalogPriceHistoryModal').style.display = 'none';
}

function catalogCloseDependenciesModal() {
    document.getElementById('catalogDependenciesModal').style.display = 'none';
}

function catalogCloseBulkPriceModal() {
    document.getElementById('catalogBulkPriceModal').style.display = 'none';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Show/hide loading indicator
 */
function catalogShowLoading(show) {
    document.getElementById('catalogLoading').style.display = show ? 'block' : 'none';
}

/**
 * Show alert message
 */
function catalogShowAlert(message, type = 'info') {
    const alert = document.getElementById('catalogAlert');
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// ============================================================================
// AUTO-INITIALIZE
// ============================================================================

// Override showSection to initialize catalog when shown
const originalShowSection = window.showSection;
window.showSection = function(sectionName, event) {
    if (originalShowSection) {
        originalShowSection(sectionName, event);
    }
    
    if (sectionName === 'catalogProduse' || sectionName === 'catalogProduseSection') {
        // Initialize catalog on first load
        if (catalogCategories.length === 0) {
            initCatalogProduse();
        }
    }
};

console.log('✅ Catalog Produse JavaScript loaded');

