/**
 * TRANSFERS UI - JavaScript Logic
 * 
 * Gestionează interfața pentru transferuri între gestiuni
 * 
 * @version 1.0.0
 * @date 29 Octombrie 2025
 */

const API_BASE_URL = '/api';

// State
let allTransfers = [];
let allLocations = [];
let allIngredients = [];
let currentTransfer = null;
let currentStep = 1;
let transferItems = [];

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Transfers UI...');
    
    try {
        await Promise.all([
            loadLocations(),
            loadIngredients(),
            loadTransfers()
        ]);
        
        setupEventListeners();
        updateStats();
        
        console.log('✅ Transfers UI initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing UI:', error);
        showToast('Eroare la încărcarea datelor', 'error');
    }
});

// ==================== LOAD DATA ====================

async function loadLocations() {
    try {
        const response = await fetch(`${API_BASE_URL}/locations`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la încărcare gestiuni');
        }
        
        allLocations = data.data;
        populateLocationSelects();
        
        console.log(`✅ Loaded ${allLocations.length} locations`);
    } catch (error) {
        console.error('❌ Error loading locations:', error);
        throw error;
    }
}

async function loadIngredients() {
    try {
        const response = await fetch(`${API_BASE_URL}/ingredients`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la încărcare ingrediente');
        }
        
        allIngredients = data.data;
        
        console.log(`✅ Loaded ${allIngredients.length} ingredients`);
    } catch (error) {
        console.error('❌ Error loading ingredients:', error);
        throw error;
    }
}

async function loadTransfers() {
    try {
        showElement('loadingState');
        hideElement('emptyState');
        
        const queryParams = getFilterParams();
        const queryString = new URLSearchParams(queryParams).toString();
        const url = `${API_BASE_URL}/transfers${queryString ? '?' + queryString : ''}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la încărcare transferuri');
        }
        
        allTransfers = data.data;
        renderTransfersTable();
        updateStats();
        
        hideElement('loadingState');
        
        if (allTransfers.length === 0) {
            showElement('emptyState');
        }
        
        console.log(`✅ Loaded ${allTransfers.length} transfers`);
    } catch (error) {
        console.error('❌ Error loading transfers:', error);
        hideElement('loadingState');
        showToast('Eroare la încărcarea transferurilor', 'error');
    }
}

// ==================== POPULATE SELECTS ====================

function populateLocationSelects() {
    const selects = [
        'filterFromLocation',
        'filterToLocation',
        'transferFromLocation',
        'transferToLocation'
    ];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Keep the first option (placeholder)
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        // Add active locations
        allLocations
            .filter(loc => loc.is_active)
            .forEach(location => {
                const option = document.createElement('option');
                option.value = location.id;
                option.textContent = `${location.name} (${location.type === 'warehouse' ? 'Depozit' : 'Operațional'})`;
                select.appendChild(option);
            });
    });
}

// ==================== RENDER ====================

function renderTransfersTable() {
    const tbody = document.getElementById('transfersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (allTransfers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nu există transferuri</td></tr>';
        return;
    }
    
    allTransfers.forEach(transfer => {
        const row = document.createElement('tr');
        row.className = `transfer-row status-${transfer.status}`;
        
        row.innerHTML = `
            <td><strong>${escapeHtml(transfer.transfer_number)}</strong></td>
            <td>${formatDate(transfer.transfer_date)}</td>
            <td>
                <div class="location-cell">
                    <i class="fas fa-warehouse"></i>
                    ${escapeHtml(transfer.from_location_name)}
                </div>
            </td>
            <td>
                <div class="location-cell">
                    <i class="fas fa-box-open"></i>
                    ${escapeHtml(transfer.to_location_name)}
                </div>
            </td>
            <td>${transfer.total_items || 0}</td>
            <td><strong>${formatCurrency(transfer.total_value)}</strong></td>
            <td>
                <span class="status-badge status-${transfer.status}">
                    ${getStatusIcon(transfer.status)} ${getStatusLabel(transfer.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewTransferDetails(${transfer.id})" 
                            title="Vezi detalii">
                        <i class="fas fa-eye"></i>
                    </button>
                    
                    ${transfer.status === 'pending' ? `
                        <button class="btn-icon btn-success" onclick="approveTransfer(${transfer.id})" 
                                title="Aprobă">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="rejectTransfer(${transfer.id})" 
                                title="Respinge">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    
                    ${transfer.status === 'approved' ? `
                        <button class="btn-icon btn-primary" onclick="processTransfer(${transfer.id})" 
                                title="Procesează (mută stocul)">
                            <i class="fas fa-play"></i>
                        </button>
                    ` : ''}
                    
                    ${transfer.status === 'approved' || transfer.status === 'completed' ? `
                        <button class="btn-icon btn-info" onclick="downloadAviz(${transfer.id})" 
                                title="Download Aviz PDF">
                            <i class="fas fa-file-pdf"></i> Aviz
                        </button>
                    ` : ''}
                    
                    ${transfer.status === 'completed' ? `
                        <button class="btn-icon btn-info" onclick="downloadNIR(${transfer.id})" 
                                title="Download NIR PDF">
                            <i class="fas fa-file-pdf"></i> NIR
                        </button>
                    ` : ''}
                    
                    ${transfer.status === 'pending' ? `
                        <button class="btn-icon btn-danger" onclick="deleteTransfer(${transfer.id})" 
                                title="Șterge">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function updateStats() {
    const stats = {
        total: allTransfers.length,
        pending: allTransfers.filter(t => t.status === 'pending').length,
        approved: allTransfers.filter(t => t.status === 'approved').length,
        completed: allTransfers.filter(t => t.status === 'completed').length
    };
    
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statPending').textContent = stats.pending;
    document.getElementById('statApproved').textContent = stats.approved;
    document.getElementById('statCompleted').textContent = stats.completed;
}

// ==================== MODAL: NEW TRANSFER ====================

function openNewTransferModal() {
    currentStep = 1;
    transferItems = [];
    
    // Reset form
    document.getElementById('formTransferInfo').reset();
    document.getElementById('transferDate').valueAsDate = new Date();
    document.getElementById('transferItemsList').innerHTML = '';
    
    // Show step 1
    showStep(1);
    
    // Show modal
    showModal('modalNewTransfer');
}

function showStep(step) {
    currentStep = step;
    
    // Update step indicator
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        if (index + 1 <= step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });
    
    // Show/hide step content
    document.querySelectorAll('.step-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`step${step}`).style.display = 'block';
    
    // Update buttons
    const btnPrev = document.getElementById('btnPrevStep');
    const btnNext = document.getElementById('btnNextStep');
    const btnCreate = document.getElementById('btnCreateTransfer');
    
    if (step === 1) {
        btnPrev.style.display = 'none';
        btnNext.style.display = 'inline-block';
        btnCreate.style.display = 'none';
    } else if (step === 2) {
        btnPrev.style.display = 'inline-block';
        btnNext.style.display = 'inline-block';
        btnCreate.style.display = 'none';
    } else if (step === 3) {
        btnPrev.style.display = 'inline-block';
        btnNext.style.display = 'none';
        btnCreate.style.display = 'inline-block';
        
        // Populate confirmation
        populateConfirmation();
    }
}

function nextStep() {
    if (currentStep === 1) {
        // Validate Step 1
        const from = document.getElementById('transferFromLocation').value;
        const to = document.getElementById('transferToLocation').value;
        const date = document.getElementById('transferDate').value;
        const requestedBy = document.getElementById('transferRequestedBy').value.trim();
        
        if (!from || !to || !date || !requestedBy) {
            showToast('Completează toate câmpurile obligatorii', 'warning');
            return;
        }
        
        if (from === to) {
            showToast('Gestiunea sursă și destinație trebuie să fie diferite', 'warning');
            return;
        }
        
        showStep(2);
    } else if (currentStep === 2) {
        // Validate Step 2
        if (transferItems.length === 0) {
            showToast('Adaugă cel puțin un ingredient', 'warning');
            return;
        }
        
        showStep(3);
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

// ==================== ITEMS MANAGEMENT ====================

let itemCounter = 0;

function addTransferItem() {
    itemCounter++;
    const itemId = `item-${itemCounter}`;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'transfer-item';
    itemDiv.id = itemId;
    itemDiv.innerHTML = `
        <div class="item-row">
            <div class="item-field">
                <label>Ingredient *</label>
                <select class="form-control" onchange="onIngredientChange('${itemId}')">
                    <option value="">Selectează ingredient</option>
                    ${allIngredients.map(ing => `
                        <option value="${ing.id}" data-unit="${escapeHtml(ing.unit_of_measure)}" 
                                data-cost="${ing.current_cost || 0}">
                            ${escapeHtml(ing.ingredient_name)}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="item-field">
                <label>Cantitate *</label>
                <input type="number" class="form-control" min="0.01" step="0.01" 
                       placeholder="0.00" oninput="updateItemTotal('${itemId}')">
            </div>
            
            <div class="item-field">
                <label>U.M.</label>
                <input type="text" class="form-control" readonly>
            </div>
            
            <div class="item-field">
                <label>Preț/unitate (RON) *</label>
                <input type="number" class="form-control" min="0" step="0.01" 
                       placeholder="0.00" oninput="updateItemTotal('${itemId}')">
            </div>
            
            <div class="item-field">
                <label>Total (RON)</label>
                <input type="text" class="form-control" readonly value="0.00">
            </div>
            
            <div class="item-actions">
                <button type="button" class="btn-icon btn-danger" onclick="removeItem('${itemId}')" 
                        title="Șterge">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('transferItemsList').appendChild(itemDiv);
}

function onIngredientChange(itemId) {
    const itemDiv = document.getElementById(itemId);
    const select = itemDiv.querySelector('select');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption.value) {
        const unit = selectedOption.getAttribute('data-unit');
        const cost = selectedOption.getAttribute('data-cost');
        
        itemDiv.querySelector('input[readonly][type="text"]').value = unit;
        itemDiv.querySelectorAll('input[type="number"]')[1].value = parseFloat(cost).toFixed(2);
        
        updateItemTotal(itemId);
    }
}

function updateItemTotal(itemId) {
    const itemDiv = document.getElementById(itemId);
    const quantity = parseFloat(itemDiv.querySelectorAll('input[type="number"]')[0].value) || 0;
    const unitCost = parseFloat(itemDiv.querySelectorAll('input[type="number"]')[1].value) || 0;
    const total = quantity * unitCost;
    
    itemDiv.querySelector('input[readonly][value]').value = total.toFixed(2);
    
    updateSummary();
}

function removeItem(itemId) {
    document.getElementById(itemId).remove();
    updateSummary();
}

function updateSummary() {
    const items = document.querySelectorAll('.transfer-item');
    let totalItems = 0;
    let totalValue = 0;
    
    items.forEach(item => {
        const ingredientSelect = item.querySelector('select');
        if (ingredientSelect.value) {
            totalItems++;
            const itemTotal = parseFloat(item.querySelector('input[readonly][value]').value) || 0;
            totalValue += itemTotal;
        }
    });
    
    document.getElementById('summaryTotalItems').textContent = totalItems;
    document.getElementById('summaryTotalValue').textContent = totalValue.toFixed(2) + ' RON';
}

// ==================== CONFIRMATION ====================

function populateConfirmation() {
    const fromId = document.getElementById('transferFromLocation').value;
    const toId = document.getElementById('transferToLocation').value;
    const date = document.getElementById('transferDate').value;
    const requestedBy = document.getElementById('transferRequestedBy').value;
    
    const fromLocation = allLocations.find(l => l.id == fromId);
    const toLocation = allLocations.find(l => l.id == toId);
    
    document.getElementById('confirmFromLocation').textContent = fromLocation ? fromLocation.name : '-';
    document.getElementById('confirmToLocation').textContent = toLocation ? toLocation.name : '-';
    document.getElementById('confirmDate').textContent = formatDate(date);
    document.getElementById('confirmRequestedBy').textContent = requestedBy;
    
    // Collect items
    transferItems = [];
    let totalValue = 0;
    
    document.querySelectorAll('.transfer-item').forEach(item => {
        const select = item.querySelector('select');
        const ingredientId = parseInt(select.value);
        
        if (!ingredientId) return;
        
        const ingredient = allIngredients.find(ing => ing.id === ingredientId);
        const quantity = parseFloat(item.querySelectorAll('input[type="number"]')[0].value) || 0;
        const unitCost = parseFloat(item.querySelectorAll('input[type="number"]')[1].value) || 0;
        const unit = item.querySelector('input[readonly][type="text"]').value;
        const total = quantity * unitCost;
        
        transferItems.push({
            ingredient_id: ingredientId,
            ingredient_name: ingredient ? ingredient.ingredient_name : 'Unknown',
            quantity,
            unit,
            unit_cost: unitCost,
            total_cost: total
        });
        
        totalValue += total;
    });
    
    // Populate items table
    const tbody = document.getElementById('confirmItemsTable');
    tbody.innerHTML = '';
    
    transferItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.ingredient_name)}</td>
            <td>${item.quantity.toFixed(2)} ${escapeHtml(item.unit)}</td>
            <td>${item.unit_cost.toFixed(2)} RON</td>
            <td>${item.total_cost.toFixed(2)} RON</td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('confirmItemsCount').textContent = transferItems.length;
    document.getElementById('confirmTotalValue').textContent = totalValue.toFixed(2) + ' RON';
}

// ==================== CREATE TRANSFER ====================

async function createTransfer() {
    try {
        const transferData = {
            transfer: {
                from_location_id: parseInt(document.getElementById('transferFromLocation').value),
                to_location_id: parseInt(document.getElementById('transferToLocation').value),
                transfer_date: document.getElementById('transferDate').value,
                requested_by: document.getElementById('transferRequestedBy').value.trim(),
                notes: document.getElementById('transferNotes').value.trim()
            },
            items: transferItems.map(item => ({
                ingredient_id: item.ingredient_id,
                quantity: item.quantity,
                unit: item.unit,
                unit_cost: item.unit_cost,
                total_cost: item.total_cost
            }))
        };
        
        const response = await fetch(`${API_BASE_URL}/transfers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transferData)
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la creare transfer');
        }
        
        showToast('Transfer creat cu succes!', 'success');
        closeModal('modalNewTransfer');
        await loadTransfers();
        
    } catch (error) {
        console.error('❌ Error creating transfer:', error);
        showToast(error.message, 'error');
    }
}

// ==================== VIEW DETAILS ====================

async function viewTransferDetails(transferId) {
    try {
        const response = await fetch(`${API_BASE_URL}/transfers/${transferId}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la încărcare detalii');
        }
        
        const transfer = data.data;
        currentTransfer = transfer;
        
        const detailsHtml = `
            <div class="transfer-details">
                <div class="details-grid">
                    <div class="detail-item">
                        <label>Nr. Transfer:</label>
                        <span><strong>${escapeHtml(transfer.transfer_number)}</strong></span>
                    </div>
                    <div class="detail-item">
                        <label>Data:</label>
                        <span>${formatDate(transfer.transfer_date)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Status:</label>
                        <span class="status-badge status-${transfer.status}">
                            ${getStatusIcon(transfer.status)} ${getStatusLabel(transfer.status)}
                        </span>
                    </div>
                    <div class="detail-item">
                        <label>De la gestiunea:</label>
                        <span><i class="fas fa-warehouse"></i> ${escapeHtml(transfer.from_location_name)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Către gestiunea:</label>
                        <span><i class="fas fa-box-open"></i> ${escapeHtml(transfer.to_location_name)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Solicitat de:</label>
                        <span>${escapeHtml(transfer.requested_by)}</span>
                    </div>
                    ${transfer.approved_by ? `
                        <div class="detail-item">
                            <label>Aprobat de:</label>
                            <span>${escapeHtml(transfer.approved_by)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Data aprobării:</label>
                            <span>${formatDate(transfer.approved_at)}</span>
                        </div>
                    ` : ''}
                    ${transfer.completed_at ? `
                        <div class="detail-item">
                            <label>Data finalizării:</label>
                            <span>${formatDate(transfer.completed_at)}</span>
                        </div>
                    ` : ''}
                </div>
                
                ${transfer.notes ? `
                    <div class="detail-notes">
                        <label>Observații:</label>
                        <p>${escapeHtml(transfer.notes)}</p>
                    </div>
                ` : ''}
                
                <div class="detail-items">
                    <h3>Ingrediente (${transfer.items.length})</h3>
                    <table class="details-table">
                        <thead>
                            <tr>
                                <th>Ingredient</th>
                                <th>Cantitate</th>
                                <th>U.M.</th>
                                <th>Preț/unitate</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transfer.items.map(item => `
                                <tr>
                                    <td>${escapeHtml(item.ingredient_name)}</td>
                                    <td>${item.quantity.toFixed(2)}</td>
                                    <td>${escapeHtml(item.unit)}</td>
                                    <td>${item.unit_cost.toFixed(2)} RON</td>
                                    <td><strong>${(item.quantity * item.unit_cost).toFixed(2)} RON</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" style="text-align: right;"><strong>TOTAL:</strong></td>
                                <td><strong>${formatCurrency(transfer.total_value)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;
        
        document.getElementById('transferDetailsBody').innerHTML = detailsHtml;
        showModal('modalTransferDetails');
        
    } catch (error) {
        console.error('❌ Error loading transfer details:', error);
        showToast(error.message, 'error');
    }
}

// ==================== APPROVE / REJECT ====================

function approveTransfer(transferId) {
    document.getElementById('approveRejectTransferId').value = transferId;
    document.getElementById('approveRejectAction').value = 'approved';
    document.getElementById('approveRejectTitle').innerHTML = `
        <i class="fas fa-check-circle"></i> Aprobă Transfer
    `;
    document.getElementById('approveRejectMessage').textContent = 
        'Transferul va fi marcat ca aprobat și va putea fi procesat (stocul va fi mutat efectiv între gestiuni).';
    document.getElementById('approveRejectBy').value = '';
    
    showModal('modalApproveReject');
}

function rejectTransfer(transferId) {
    document.getElementById('approveRejectTransferId').value = transferId;
    document.getElementById('approveRejectAction').value = 'rejected';
    document.getElementById('approveRejectTitle').innerHTML = `
        <i class="fas fa-times-circle"></i> Respinge Transfer
    `;
    document.getElementById('approveRejectMessage').textContent = 
        'Transferul va fi marcat ca respins și nu va putea fi procesat.';
    document.getElementById('approveRejectBy').value = '';
    
    showModal('modalApproveReject');
}

async function confirmApproveReject() {
    const transferId = document.getElementById('approveRejectTransferId').value;
    const action = document.getElementById('approveRejectAction').value;
    const approvedBy = document.getElementById('approveRejectBy').value.trim();
    
    if (!approvedBy) {
        showToast('Introdu numele celui care aprobă/respinge', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/transfers/${transferId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: action,
                approved_by: approvedBy
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la actualizare status');
        }
        
        showToast(action === 'approved' ? 'Transfer aprobat cu succes!' : 'Transfer respins', 'success');
        closeModal('modalApproveReject');
        await loadTransfers();
        
    } catch (error) {
        console.error('❌ Error updating status:', error);
        showToast(error.message, 'error');
    }
}

// ==================== PROCESS TRANSFER ====================

async function processTransfer(transferId) {
    if (!confirm('Sigur vrei să procesezi acest transfer?\n\nStocul va fi mutat efectiv între gestiuni. Această acțiune NU poate fi anulată!')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/transfers/${transferId}/process`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la procesare transfer');
        }
        
        const result = data.data;
        
        if (result.failed_items.length > 0) {
            showToast(`Transfer procesat parțial: ${result.processed_items.length} succes, ${result.failed_items.length} eșuate`, 'warning');
        } else {
            showToast('Transfer procesat cu succes!', 'success');
        }
        
        await loadTransfers();
        
    } catch (error) {
        console.error('❌ Error processing transfer:', error);
        showToast(error.message, 'error');
    }
}

// ==================== DELETE TRANSFER ====================

async function deleteTransfer(transferId) {
    if (!confirm('Sigur vrei să ștergi acest transfer?\n\nAceastă acțiune NU poate fi anulată!')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/transfers/${transferId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Eroare la ștergere transfer');
        }
        
        showToast('Transfer șters cu succes', 'success');
        await loadTransfers();
        
    } catch (error) {
        console.error('❌ Error deleting transfer:', error);
        showToast(error.message, 'error');
    }
}

// ==================== DOWNLOAD PDF ====================

function downloadAviz(transferId) {
    window.open(`${API_BASE_URL}/transfers/${transferId}/aviz-pdf`, '_blank');
}

function downloadNIR(transferId) {
    window.open(`${API_BASE_URL}/transfers/${transferId}/nir-pdf`, '_blank');
}

// ==================== FILTERS ====================

function getFilterParams() {
    const params = {};
    
    const status = document.getElementById('filterStatus').value;
    const fromLocationId = document.getElementById('filterFromLocation').value;
    const toLocationId = document.getElementById('filterToLocation').value;
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    
    if (status) params.status = status;
    if (fromLocationId) params.from_location_id = fromLocationId;
    if (toLocationId) params.to_location_id = toLocationId;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    return params;
}

function applyFilters() {
    loadTransfers();
}

function clearFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterFromLocation').value = '';
    document.getElementById('filterToLocation').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    
    loadTransfers();
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    // New transfer
    document.getElementById('btnNewTransfer').addEventListener('click', openNewTransferModal);
    document.getElementById('btnPrevStep').addEventListener('click', prevStep);
    document.getElementById('btnNextStep').addEventListener('click', nextStep);
    document.getElementById('btnCreateTransfer').addEventListener('click', createTransfer);
    document.getElementById('btnAddItem').addEventListener('click', addTransferItem);
    
    // Filters
    document.getElementById('btnApplyFilters').addEventListener('click', applyFilters);
    document.getElementById('btnClearFilters').addEventListener('click', clearFilters);
    
    // Approve/Reject
    document.getElementById('btnConfirmApproveReject').addEventListener('click', confirmApproveReject);
}

// ==================== UTILITIES ====================

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'block';
}

function hideElement(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function formatCurrency(value) {
    return parseFloat(value || 0).toFixed(2) + ' RON';
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Pending',
        'approved': 'Aprobat',
        'completed': 'Finalizat',
        'rejected': 'Respins',
        'cancelled': 'Anulat'
    };
    return labels[status] || status;
}

function getStatusIcon(status) {
    const icons = {
        'pending': '<i class="fas fa-clock"></i>',
        'approved': '<i class="fas fa-check"></i>',
        'completed': '<i class="fas fa-check-double"></i>',
        'rejected': '<i class="fas fa-times"></i>',
        'cancelled': '<i class="fas fa-ban"></i>'
    };
    return icons[status] || '';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} toast-show`;
    
    setTimeout(() => {
        toast.classList.remove('toast-show');
    }, 3000);
}

console.log('✅ Transfers UI Script loaded');

