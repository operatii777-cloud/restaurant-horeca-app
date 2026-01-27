// ===== FUNCȚII INVENTAR AVANSAT =====

// Afișează modalul pentru alegerea tipului de inventar
function showInventoryTypeModal() {
    const modal = new bootstrap.Modal(document.getElementById('inventoryTypeModal'));
    modal.show();
}

// Selectează tipul de inventar și începe sesiunea
async function selectInventoryType(sessionType) {
    // Închide modalul de alegere
    const typeModal = bootstrap.Modal.getInstance(document.getElementById('inventoryTypeModal'));
    if (typeModal) typeModal.hide();
    
    // Inițiază sesiunea cu tipul ales
    await startInventorySession(sessionType);
}

async function startInventorySession(sessionType = 'daily') {
    try {
        console.log(`🚀 Inițiere sesiune nouă de inventar: ${sessionType}`);
        const response = await fetch('/api/inventory/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                session_type: sessionType,
                started_by: 'Admin'
            })
        });
        if (!response.ok) throw new Error('Eroare la inițierea sesiunii de inventar.');
        
        const result = await response.json();
        if (result.success) {
            console.log(`✅ Sesiunea de inventar inițiată cu succes! ID: ${result.sessionId}, Tip: ${result.sessionType}`);
            alert(`Sesiunea de inventar ${sessionType === 'daily' ? 'zilnic' : 'lunar'} a fost inițiată cu succes!\n\nID: ${result.sessionId}\nIngrediente: ${result.ingredientsCount}`);
            showCountingModal(result.sessionId); // Deschide modalul de numărare
        } else {
            alert('Eroare: ' + result.error);
        }
    } catch (error) {
        console.error('❌ Eroare la inițierea sesiunii de inventar:', error);
        alert('Eroare la inițierea sesiunii de inventar: ' + error.message);
    }
}

async function showCountingModal(sessionId) {
    console.log(`📊 Deschidere modal numărare pentru sesiunea ${sessionId}`);
    
    // Verifică dacă modalul există
    const modalElement = document.getElementById('countingModal');
    if (!modalElement) {
        console.error('❌ Modalul countingModal nu a fost găsit!');
        alert('Eroare: Modalul de numărare nu a fost găsit. Vă rugăm să reîncărcați pagina.');
        return;
    }
    
    const modal = new bootstrap.Modal(modalElement);
    document.getElementById('currentCountingSessionId').textContent = sessionId;
    const listBody = document.getElementById('inventoryCountingList');
    
    if (!listBody) {
        console.error('❌ Elementul inventoryCountingList nu a fost găsit!');
        alert('Eroare: Elementul de listă nu a fost găsit. Vă rugăm să reîncărcați pagina.');
        return;
    }
    
    listBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted"><i class="fas fa-spinner fa-spin me-2"></i> Se încarcă datele inventarului...</td></tr>';
    
    try {
        const response = await fetch(`/api/inventory/details/${sessionId}`);
        if (!response.ok) throw new Error('Eroare la preluarea detaliilor inventarului.');
        
               const data = await response.json();
               const items = data.items || [];
               
               // Ensure items is an array
               const itemsArray = Array.isArray(items) ? items : [];
               console.log(`✅ Preluate ${itemsArray.length} ingrediente pentru numărare`);
               
               listBody.innerHTML = ''; 

               itemsArray.forEach(item => {
            const row = listBody.insertRow();
            
            const theoretical = parseFloat(item.theoretical_stock);
            const counted = item.counted_stock !== null ? parseFloat(item.counted_stock) : null;
            let difference = '';
            let diffClass = '';
            let diffType = 'Nenumărat';

            if (counted !== null) {
                difference = (counted - theoretical).toFixed(2);
                if (difference > 0) {
                    diffClass = 'text-success fw-bold';
                    diffType = 'Plus (Câștig)';
                } else if (difference < 0) {
                    diffClass = 'text-danger fw-bold';
                    diffType = 'Lipsă (Pierdere)';
                } else {
                    diffClass = 'text-secondary';
                    diffType = 'Zero';
                }
            } else {
                difference = '-';
            }

            row.innerHTML = `
                <td>${item.name}</td>
                <td class="text-end">${theoretical.toFixed(2)}</td>
                <td>${item.unit}</td>
                <td>
                    <input type="number" step="0.01" class="form-control form-control-sm counting-input" 
                           value="${counted !== null ? counted.toFixed(2) : ''}" 
                           data-item-id="${item.id}"
                           data-session-id="${sessionId}"
                           onchange="updatePhysicalCountFromInput(this)">
                </td>
                <td class="text-end ${diffClass}">${difference}</td>
                <td>${diffType}</td>
            `;
        });
        
        modal.show();

    } catch (error) {
        console.error('❌ Eroare la încărcarea numărătorii:', error);
        const alertElement = document.getElementById('countingAlert');
        if (alertElement) {
            alertElement.textContent = 'Eroare la încărcarea datelor: ' + error.message;
            alertElement.style.display = 'block';
        } else {
            alert('Eroare la încărcarea datelor: ' + error.message);
        }
    }
}

// Funcție helper pentru a actualiza numărătoarea din input
function updatePhysicalCountFromInput(inputElement) {
    const sessionId = inputElement.getAttribute('data-session-id');
    const itemId = inputElement.getAttribute('data-item-id');
    const value = inputElement.value;
    updatePhysicalCount(sessionId, itemId, value, inputElement);
}

async function updatePhysicalCount(sessionId, itemId, value, inputElement) {
    const physicalCount = parseFloat(value);
    if (isNaN(physicalCount) || physicalCount < 0) {
        inputElement.classList.add('is-invalid');
        return;
    }
    inputElement.classList.remove('is-invalid');
    
    try {
        console.log(`💾 Actualizare numărătoare: Sesiune ${sessionId}, Item ${itemId}, Cantitate ${physicalCount}`);
        const response = await fetch(`/api/inventory/update-count/${sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: itemId, physicalCount: physicalCount })
        });
        
        if (!response.ok) throw new Error('Eroare la salvare.');

        const row = inputElement.closest('tr');
        const theoretical = parseFloat(row.cells[1].textContent);
        
        const difference = (physicalCount - theoretical).toFixed(2);
        const diffCell = row.cells[4];
        const typeCell = row.cells[5];
        
        let diffClass = '';
        let diffType = 'Zero';
        
        if (difference > 0) {
            diffClass = 'text-success fw-bold';
            diffType = 'Plus (Câștig)';
        } else if (difference < 0) {
            diffClass = 'text-danger fw-bold';
            diffType = 'Lipsă (Pierdere)';
        } else {
            diffClass = 'text-secondary';
            diffType = 'Zero';
        }
        
        diffCell.textContent = difference;
        diffCell.className = `text-end ${diffClass}`;
        typeCell.textContent = diffType;
        
        console.log(`✅ Actualizat ingredient ${itemId} cu diferența ${difference}`);
        
    } catch (error) {
        console.error('❌ Eroare la salvarea numărătorii:', error);
        alert('Eroare la salvarea numărătorii. Vă rugăm reîncercați.');
    }
}

async function finalizeInventorySession(sessionId) {
    if (!confirm(`Sigur doriți să finalizați sesiunea de inventar ${sessionId}?\n\nAceastă acțiune va actualiza stocurile reale cu cantitățile numărate!`)) {
        return;
    }
    
    try {
        console.log(`🏁 Finalizare sesiune inventar ${sessionId}`);
        
        const response = await fetch(`/api/inventory/finalize/${sessionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) throw new Error('Eroare la finalizarea sesiunii');
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ Sesiune finalizată cu succes!`, result);
            
            // Închide modalul de numărare
            const modalElement = document.getElementById('countingModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
            
            // Afișează rezumatul
            showInventorySummary(result);
            
            // Reîncarcă lista de sesiuni (dacă există)
            if (typeof loadInventorySessions === 'function') {
                loadInventorySessions();
            }
            
        } else {
            alert('Eroare: ' + result.error);
        }
        
    } catch (error) {
        console.error('❌ Eroare la finalizarea sesiunii:', error);
        alert('Eroare la finalizarea sesiunii de inventar: ' + error.message);
    }
}

// Afișează rezumatul după finalizarea sesiunii
function showInventorySummary(result) {
    const { sessionId, itemsProcessed, totalDifferenceValue, details } = result;
    
    // Calculează statistici
    const plusItems = details.filter(d => d.difference > 0).length;
    const minusItems = details.filter(d => d.difference < 0).length;
    const zeroItems = details.filter(d => d.difference === 0).length;
    
    const plusValue = details.filter(d => d.difference > 0).reduce((sum, d) => sum + d.difference, 0);
    const minusValue = Math.abs(details.filter(d => d.difference < 0).reduce((sum, d) => sum + d.difference, 0));
    
    const summaryHTML = `
        <div class="modal fade" id="inventorySummaryModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title"><i class="fas fa-check-circle me-2"></i>Sesiune Inventar Finalizată</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-success">
                            <h5><i class="fas fa-info-circle me-2"></i>Sesiunea ${sessionId} a fost finalizată cu succes!</h5>
                            <p class="mb-0">Stocurile au fost actualizate cu cantitățile numărate.</p>
                        </div>
                        
                        <div class="row text-center mb-4">
                            <div class="col-md-4">
                                <div class="card border-primary">
                                    <div class="card-body">
                                        <h3 class="text-primary">${itemsProcessed}</h3>
                                        <p class="mb-0">Ingrediente Numărate</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-${totalDifferenceValue >= 0 ? 'success' : 'danger'}">
                                    <div class="card-body">
                                        <h3 class="text-${totalDifferenceValue >= 0 ? 'success' : 'danger'}">${totalDifferenceValue.toFixed(2)} RON</h3>
                                        <p class="mb-0">Diferență Totală</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-info">
                                    <div class="card-body">
                                        <h3 class="text-info">${zeroItems}</h3>
                                        <p class="mb-0">Fără Diferențe</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <h6 class="mb-3">Statistici Diferențe:</h6>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <div class="d-flex justify-content-between align-items-center p-2 bg-success bg-opacity-10 rounded">
                                    <span><i class="fas fa-arrow-up text-success me-2"></i>Plus (Câștig):</span>
                                    <strong class="text-success">${plusItems} ingrediente (+${plusValue.toFixed(2)} unități)</strong>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex justify-content-between align-items-center p-2 bg-danger bg-opacity-10 rounded">
                                    <span><i class="fas fa-arrow-down text-danger me-2"></i>Lipsă (Pierdere):</span>
                                    <strong class="text-danger">${minusItems} ingrediente (-${minusValue.toFixed(2)} unități)</strong>
                                </div>
                            </div>
                        </div>
                        
                        <h6 class="mb-2">Top 5 Diferențe Mari:</h6>
                        <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
                            <table class="table table-sm table-hover">
                                <thead class="table-light sticky-top">
                                    <tr>
                                        <th>Ingredient</th>
                                        <th class="text-end">Teoretic</th>
                                        <th class="text-end">Numărat</th>
                                        <th class="text-end">Diferență</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${details
                                        .filter(d => d.difference !== 0)
                                        .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
                                        .slice(0, 5)
                                        .map(d => `
                                            <tr>
                                                <td>${d.name}</td>
                                                <td class="text-end">${d.theoretical.toFixed(2)} ${d.unit}</td>
                                                <td class="text-end">${d.counted.toFixed(2)} ${d.unit}</td>
                                                <td class="text-end ${d.difference > 0 ? 'text-success' : 'text-danger'}">
                                                    ${d.difference > 0 ? '+' : ''}${d.difference.toFixed(2)} ${d.unit}
                                                </td>
                                            </tr>
                                        `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Închide</button>
                        <button type="button" class="btn btn-primary" onclick="printInventorySession('${sessionId}')">
                            <i class="fas fa-print me-1"></i>Printează
                        </button>
                        <button type="button" class="btn btn-success" onclick="exportInventorySession('${sessionId}')">
                            <i class="fas fa-file-excel me-1"></i>Exportă Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Elimină modal vechi dacă există
    const oldModal = document.getElementById('inventorySummaryModal');
    if (oldModal) oldModal.remove();
    
    // Adaugă și afișează noul modal
    document.body.insertAdjacentHTML('beforeend', summaryHTML);
    const summaryModal = new bootstrap.Modal(document.getElementById('inventorySummaryModal'));
    summaryModal.show();
}

// Printează sesiunea de inventar
async function printInventorySession(sessionId) {
    try {
        const response = await fetch(`/api/inventory/session/${sessionId}`);
        if (!response.ok) throw new Error('Eroare la preluarea datelor sesiunii');
        
        const data = await response.json();
        const { session, items } = data;
        
        // Creează fereastră de print
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Raport Inventar - ${sessionId}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; color: #333; }
                    .header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .text-end { text-align: right; }
                    .text-success { color: green; }
                    .text-danger { color: red; }
                    .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>RAPORT INVENTAR</h1>
                <div class="header">
                    <p><strong>ID Sesiune:</strong> ${session.id}</p>
                    <p><strong>Tip:</strong> ${session.session_type === 'daily' ? 'Zilnic' : 'Lunar'}</p>
                    <p><strong>Data:</strong> ${new Date(session.started_at).toLocaleString('ro-RO')}</p>
                    <p><strong>Status:</strong> ${session.status === 'completed' ? 'Finalizat' : 'În progress'}</p>
                    <p><strong>Total ingrediente:</strong> ${session.total_items}</p>
                    <p><strong>Ingrediente numărate:</strong> ${session.items_counted}</p>
                    <p><strong>Diferență valoare:</strong> ${(session.total_difference_value || 0).toFixed(2)} RON</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Ingredient</th>
                            <th class="text-end">Stoc Teoretic</th>
                            <th class="text-end">Stoc Numărat</th>
                            <th class="text-end">Diferență</th>
                            <th>Unitate</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td class="text-end">${(item.current_stock || 0).toFixed(2)}</td>
                                <td class="text-end">${item.counted_stock !== null && item.counted_stock !== undefined ? item.counted_stock.toFixed(2) : '-'}</td>
                                <td class="text-end ${item.difference && item.difference > 0 ? 'text-success' : item.difference && item.difference < 0 ? 'text-danger' : ''}">
                                    ${item.counted_stock !== null && item.counted_stock !== undefined && item.difference !== null ? (item.difference > 0 ? '+' : '') + item.difference.toFixed(2) : '-'}
                                </td>
                                <td>${item.unit || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Generat la: ${new Date().toLocaleString('ro-RO')}</p>
                    <button onclick="window.print()">Printează</button>
                    <button onclick="window.close()">Închide</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
    } catch (error) {
        console.error('❌ Eroare la printare:', error);
        alert('Eroare la printarea sesiunii: ' + error.message);
    }
}

// Exportă sesiunea în Excel (placeholder - necesită backend)
async function exportInventorySession(sessionId) {
    try {
        window.open(`/api/inventory/export/${sessionId}?format=excel`, '_blank');
    } catch (error) {
        console.error('❌ Eroare la export:', error);
        alert('Eroare la exportul sesiunii: ' + error.message);
    }
}

// Încarcă lista de sesiuni de inventar
async function loadInventorySessions(filters = null) {
    try {
        // Dacă nu sunt furnizate filtre, ia-le din UI
        if (!filters) {
            const typeFilter = document.getElementById('filterSessionType')?.value || '';
            const statusFilter = document.getElementById('filterSessionStatus')?.value || '';
            const limitFilter = document.getElementById('filterSessionLimit')?.value || '10';
            
            filters = {
                type: typeFilter,
                status: statusFilter,
                limit: limitFilter
            };
        }
        
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.status) params.append('status', filters.status);
        if (filters.limit) params.append('limit', filters.limit);
        
        const response = await fetch(`/api/inventory/sessions?${params.toString()}`);
        if (!response.ok) throw new Error('Eroare la încărcarea sesiunilor');
        
        const data = await response.json();
        const sessions = data.sessions || [];
        
        const tbody = document.getElementById('inventorySessionsList');
        if (!tbody) {
            console.warn('⚠️ Element inventorySessionsList nu există');
            return;
        }
        
        if (sessions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Nu există sesiuni de inventar</td></tr>';
            return;
        }
        
        tbody.innerHTML = sessions.map(session => `
            <tr>
                <td><code>${session.id}</code></td>
                <td>
                    <span class="badge bg-${session.session_type === 'daily' ? 'info' : 'primary'}">
                        ${session.session_type === 'daily' ? 'Zilnic' : 'Lunar'}
                    </span>
                </td>
                <td>${new Date(session.started_at).toLocaleString('ro-RO')}</td>
                <td>${session.completed_at ? new Date(session.completed_at).toLocaleString('ro-RO') : '-'}</td>
                <td>
                    <span class="badge bg-${session.status === 'completed' ? 'success' : session.status === 'in_progress' ? 'warning' : 'secondary'}">
                        ${session.status === 'completed' ? 'Finalizat' : session.status === 'in_progress' ? 'În Progress' : 'Arhivat'}
                    </span>
                </td>
                <td>${session.items_counted || 0} / ${session.total_items}</td>
                <td>
                    ${session.status !== 'archived' ? `
                        <button class="btn btn-sm btn-warning" onclick="editInventorySession('${session.id}')" title="${session.status === 'completed' ? 'Re-editează inventar finalizat' : 'Continuă inventar în progres'}">
                            <i class="fas fa-edit"></i> ${session.status === 'completed' ? 'Editează' : 'Continuă'}
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-primary" onclick="viewSessionDetails('${session.id}')">
                        <i class="fas fa-eye"></i> Vezi
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="printInventorySession('${session.id}')">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('❌ Eroare la încărcarea sesiunilor:', error);
        alert('Eroare la încărcarea sesiunilor de inventar: ' + error.message);
    }
}

// Vezi detaliile unei sesiuni
async function viewSessionDetails(sessionId) {
    try {
        const response = await fetch(`/api/inventory/session/${sessionId}`);
        if (!response.ok) throw new Error('Eroare la încărcarea detaliilor');
        
        const data = await response.json();
        const { session, items } = data;
        
        // Afișează în modal
        showSessionDetailsModal(session, items);
        
    } catch (error) {
        console.error('❌ Eroare la încărcarea detaliilor:', error);
        alert('Eroare la încărcarea detaliilor sesiunii: ' + error.message);
    }
}

// Re-editează sau continuă un inventar
async function editInventorySession(sessionId) {
    if (!confirm(`Sigur dorești să editezi inventarul ${sessionId}?\n\n✏️ Poți modifica sau adăuga valorile numărate.\n✅ La finalizare, stocurile vor fi actualizate cu noile valori.`)) {
        return;
    }
    
    try {
        console.log(`✏️ Re-editare sesiune inventar: ${sessionId}`);
        
        // Încarcă datele sesiunii
        const response = await fetch(`/api/inventory/session/${sessionId}`);
        if (!response.ok) throw new Error('Eroare la încărcarea sesiunii');
        
        const data = await response.json();
        const { session, items } = data;
        
        // Deschide modalul de numărare cu valorile existente
        const modalElement = document.getElementById('countingModal');
        if (!modalElement) {
            alert('Eroare: Modalul de numărare nu a fost găsit.');
            return;
        }
        
        const modal = new bootstrap.Modal(modalElement);
        document.getElementById('currentCountingSessionId').textContent = sessionId;
        const listBody = document.getElementById('inventoryCountingList');
        
        listBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted"><i class="fas fa-spinner fa-spin me-2"></i> Se încarcă datele pentru editare...</td></tr>';
        
        // Populează tabelul cu valorile existente
        listBody.innerHTML = ''; 
        
        items.forEach(item => {
            const row = listBody.insertRow();
            
            const currentStock = parseFloat(item.current_stock || 0);
            const countedStock = item.counted_stock !== null && item.counted_stock !== undefined ? parseFloat(item.counted_stock) : null;
            let difference = '';
            let diffClass = '';
            let diffType = 'Nenumărat';

            if (countedStock !== null) {
                difference = (countedStock - currentStock).toFixed(2);
                if (difference > 0) {
                    diffClass = 'text-success fw-bold';
                    diffType = 'Plus (Câștig)';
                } else if (difference < 0) {
                    diffClass = 'text-danger fw-bold';
                    diffType = 'Lipsă (Pierdere)';
                } else {
                    diffClass = 'text-secondary';
                    diffType = 'Zero';
                }
            } else {
                difference = '-';
            }

            row.innerHTML = `
                <td>${item.name}</td>
                <td class="text-end">${currentStock.toFixed(2)}</td>
                <td>${item.unit || ''}</td>
                <td>
                    <input type="number" step="0.01" class="form-control form-control-sm counting-input" 
                           value="${countedStock !== null ? countedStock.toFixed(2) : ''}" 
                           data-item-id="${item.id}"
                           data-session-id="${sessionId}"
                           onchange="updatePhysicalCountFromInput(this)">
                </td>
                <td class="text-end ${diffClass}">${difference}</td>
                <td>${diffType}</td>
            `;
        });
        
        // Afișează alertă info despre editare
        const alertElement = document.getElementById('countingAlert');
        if (alertElement) {
            alertElement.innerHTML = '<i class="fas fa-info-circle me-2"></i><strong>Mod Editare:</strong> Modifică valorile și finalizează din nou. Stocurile vor fi actualizate cu noile valori.';
            alertElement.className = 'alert alert-info';
            alertElement.style.display = 'block';
        }
        
        modal.show();
        console.log(`✅ Modal de editare deschis pentru sesiunea ${sessionId}`);
        
    } catch (error) {
        console.error('❌ Eroare la editarea sesiunii:', error);
        alert('Eroare la editarea sesiunii de inventar: ' + error.message);
    }
}

// Afișează modal cu detaliile sesiunii
function showSessionDetailsModal(session, items) {
    const modalHTML = `
        <div class="modal fade" id="sessionDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title"><i class="fas fa-info-circle me-2"></i>Detalii Sesiune Inventar</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <p><strong>ID:</strong> <code>${session.id}</code></p>
                                <p><strong>Tip:</strong> <span class="badge bg-${session.session_type === 'daily' ? 'info' : 'primary'}">${session.session_type === 'daily' ? 'Zilnic' : 'Lunar'}</span></p>
                                <p><strong>Status:</strong> <span class="badge bg-${session.status === 'completed' ? 'success' : 'warning'}">${session.status === 'completed' ? 'Finalizat' : 'În Progress'}</span></p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Început:</strong> ${new Date(session.started_at).toLocaleString('ro-RO')}</p>
                                <p><strong>Finalizat:</strong> ${session.completed_at ? new Date(session.completed_at).toLocaleString('ro-RO') : '-'}</p>
                                <p><strong>Diferență valoare:</strong> ${(session.total_difference_value || 0).toFixed(2)} RON</p>
                            </div>
                        </div>
                        
                        <h6>Ingrediente (${items.length}):</h6>
                        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                            <table class="table table-sm table-hover">
                                <thead class="table-light sticky-top">
                                    <tr>
                                        <th>Ingredient</th>
                                        <th class="text-end">Stoc Teoretic</th>
                                        <th class="text-end">Stoc Numărat</th>
                                        <th class="text-end">Diferență</th>
                                        <th>Unitate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${items.map(item => `
                                        <tr>
                                            <td>${item.name}</td>
                                            <td class="text-end">${(item.current_stock || 0).toFixed(2)}</td>
                                            <td class="text-end">${item.counted_stock !== null && item.counted_stock !== undefined ? item.counted_stock.toFixed(2) : '-'}</td>
                                            <td class="text-end ${item.difference && item.difference > 0 ? 'text-success' : item.difference && item.difference < 0 ? 'text-danger' : ''}">
                                                ${item.counted_stock !== null && item.counted_stock !== undefined && item.difference !== null ? (item.difference > 0 ? '+' : '') + item.difference.toFixed(2) : '-'}
                                            </td>
                                            <td>${item.unit || ''}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Închide</button>
                        <button type="button" class="btn btn-primary" onclick="printInventorySession('${session.id}')">
                            <i class="fas fa-print me-1"></i>Printează
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Elimină modal vechi
    const oldModal = document.getElementById('sessionDetailsModal');
    if (oldModal) oldModal.remove();
    
    // Adaugă și afișează noul modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const detailsModal = new bootstrap.Modal(document.getElementById('sessionDetailsModal'));
    detailsModal.show();
}
