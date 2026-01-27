// multi-location-ui.js
// UI pentru sistemul Multi-Gestiune (ETAPA 1)

/**
 * ==================== MANAGEMENT LOCATIONS UI ====================
 */

// State management
let locations = [];
let consumables = [];
let currentLocation = null;
let currentConsumable = null;

/**
 * Inițializează UI-ul pentru Multi-Gestiune
 */
async function initMultiLocationUI() {
    console.log('🏗️ Inițializare UI Multi-Gestiune...');
    await loadLocations();
    await loadConsumables();
    renderLocationsUI();
    setupEventListeners();
    console.log('✅ UI Multi-Gestiune inițializat');
}

/**
 * Încarcă toate locațiile din server
 */
async function loadLocations() {
    try {
        const response = await fetch('/api/locations');
        const data = await response.json();
        if (data.success) {
            locations = data.data;
            console.log(`✅ Încărcate ${locations.length} locații`);
        } else {
            console.error('❌ Eroare la încărcare locații:', data.error);
            showNotification('Eroare la încărcare locații', 'error');
        }
    } catch (error) {
        console.error('❌ Eroare la încărcare locații:', error);
        showNotification('Eroare la încărcare locații', 'error');
    }
}

/**
 * Încarcă toate consumabilele din server
 */
async function loadConsumables() {
    try {
        const response = await fetch('/api/consumables');
        const data = await response.json();
        if (data.success) {
            consumables = data.data;
            console.log(`✅ Încărcate ${consumables.length} consumabile`);
        } else {
            console.error('❌ Eroare la încărcare consumabile:', data.error);
            showNotification('Eroare la încărcare consumabile', 'error');
        }
    } catch (error) {
        console.error('❌ Eroare la încărcare consumabile:', error);
        showNotification('Eroare la încărcare consumabile', 'error');
    }
}

/**
 * Renderizează UI-ul pentru locații
 */
function renderLocationsUI() {
    const container = document.getElementById('locations-container');
    if (!container) return;

    if (locations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>📦 Nicio gestiune configurată</h3>
                <p>Adaugă prima gestiune pentru a începe</p>
                <button class="btn btn-primary" onclick="showAddLocationModal()">
                    ➕ Adaugă Gestiune
                </button>
            </div>
        `;
        return;
    }

    // Grupează locațiile după tip
    const warehouses = locations.filter(l => l.type === 'warehouse');
    const operational = locations.filter(l => l.type === 'operational');

    container.innerHTML = `
        <div class="locations-header">
            <h2>📦 Gestiuni Configure</h2>
            <button class="btn btn-primary" onclick="showAddLocationModal()">
                ➕ Adaugă Gestiune
            </button>
        </div>

        ${warehouses.length > 0 ? `
            <div class="locations-section">
                <h3>🏭 Depozite (Primire Marfă)</h3>
                <div class="locations-grid">
                    ${warehouses.map(loc => renderLocationCard(loc)).join('')}
                </div>
            </div>
        ` : ''}

        ${operational.length > 0 ? `
            <div class="locations-section">
                <h3>🍽️ Gestiuni Operaționale (Consum)</h3>
                <div class="locations-grid">
                    ${operational.map(loc => renderLocationCard(loc)).join('')}
                </div>
            </div>
        ` : ''}

        <div class="consumables-section">
            <h3>🧴 Consumabile</h3>
            <button class="btn btn-secondary" onclick="showConsumablesModal()">
                Gestionează Consumabile
            </button>
        </div>
    `;
}

/**
 * Renderizează un card pentru o locație
 */
function renderLocationCard(location) {
    const icon = location.type === 'warehouse' ? '🏭' : '🍽️';
    const statusClass = location.is_active ? 'active' : 'inactive';
    const statusText = location.is_active ? 'Activă' : 'Inactivă';

    return `
        <div class="location-card ${statusClass}" data-location-id="${location.id}">
            <div class="location-header">
                <div class="location-icon">${icon}</div>
                <div class="location-info">
                    <h4>${location.name}</h4>
                    <span class="location-status status-${statusClass}">${statusText}</span>
                </div>
            </div>
            <p class="location-description">${location.description || 'Fără descriere'}</p>
            <div class="location-capabilities">
                ${location.can_receive_deliveries ? '<span class="badge badge-success">📥 Primește marfă</span>' : ''}
                ${location.can_transfer_out ? '<span class="badge badge-info">📤 Transfer OUT</span>' : ''}
                ${location.can_transfer_in ? '<span class="badge badge-info">📥 Transfer IN</span>' : ''}
                ${location.can_consume ? '<span class="badge badge-warning">🍴 Consum</span>' : ''}
            </div>
            <div class="location-stats" id="stats-${location.id}">
                <div class="loading-spinner">Se încarcă...</div>
            </div>
            <div class="location-actions">
                <button class="btn btn-small btn-primary" onclick="editLocation(${location.id})">
                    ✏️ Editează
                </button>
                <button class="btn btn-small btn-secondary" onclick="viewLocationDetails(${location.id})">
                    👁️ Detalii
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteLocation(${location.id})">
                    🗑️ Șterge
                </button>
            </div>
        </div>
    `;
}

/**
 * Încarcă și afișează statistici pentru o locație
 */
async function loadLocationStatistics(locationId) {
    try {
        const response = await fetch(`/api/locations/${locationId}/statistics`);
        const data = await response.json();
        if (data.success) {
            const statsContainer = document.getElementById(`stats-${locationId}`);
            if (statsContainer) {
                statsContainer.innerHTML = `
                    <div class="stat-item">
                        <span class="stat-label">Ingrediente:</span>
                        <span class="stat-value">${data.data.total_ingredients}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Valoare Stoc:</span>
                        <span class="stat-value">${data.data.total_stock_value.toFixed(2)} RON</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Stoc Scăzut:</span>
                        <span class="stat-value ${data.data.low_stock_items > 0 ? 'text-danger' : 'text-success'}">
                            ${data.data.low_stock_items}
                        </span>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('❌ Eroare la încărcare statistici:', error);
    }
}

/**
 * Arată modalul pentru adăugare locație
 */
function showAddLocationModal() {
    currentLocation = null;
    const modal = document.getElementById('location-modal');
    if (!modal) {
        createLocationModal();
    }
    
    document.getElementById('location-form').reset();
    document.getElementById('location-modal-title').textContent = 'Adaugă Gestiune Nouă';
    document.getElementById('location-modal').style.display = 'flex';
}

/**
 * Creează modalul pentru locații
 */
function createLocationModal() {
    const modalHTML = `
        <div id="location-modal" class="modal" style="display:none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="location-modal-title">Adaugă Gestiune Nouă</h2>
                    <button class="modal-close" onclick="closeLocationModal()">×</button>
                </div>
                <form id="location-form" onsubmit="saveLocation(event)">
                    <div class="form-group">
                        <label for="location-name">Nume Gestiune *</label>
                        <input type="text" id="location-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="location-type">Tip Gestiune *</label>
                        <select id="location-type" name="type" required>
                            <option value="warehouse">🏭 Depozit (Primire Marfă)</option>
                            <option value="operational">🍽️ Operațională (Consum)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="location-description">Descriere</label>
                        <textarea id="location-description" name="description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="location-manager">Manager</label>
                        <input type="text" id="location-manager" name="manager_name">
                    </div>
                    <div class="form-group">
                        <label>Capabilități:</label>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="can-receive" name="can_receive_deliveries">
                                Poate primi marfă de la furnizori
                            </label>
                            <label>
                                <input type="checkbox" id="can-transfer-out" name="can_transfer_out" checked>
                                Poate transfera către alte gestiuni
                            </label>
                            <label>
                                <input type="checkbox" id="can-transfer-in" name="can_transfer_in" checked>
                                Poate primi de la alte gestiuni
                            </label>
                            <label>
                                <input type="checkbox" id="can-consume" name="can_consume">
                                Poate consuma ingrediente (comenzi)
                            </label>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeLocationModal()">
                            Anulează
                        </button>
                        <button type="submit" class="btn btn-primary">
                            💾 Salvează
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Închide modalul pentru locații
 */
function closeLocationModal() {
    document.getElementById('location-modal').style.display = 'none';
}

/**
 * Salvează o locație (creare sau editare)
 */
async function saveLocation(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const locationData = {
        name: formData.get('name'),
        type: formData.get('type'),
        description: formData.get('description') || '',
        manager_name: formData.get('manager_name') || '',
        can_receive_deliveries: form['can_receive_deliveries'].checked ? 1 : 0,
        can_transfer_out: form['can_transfer_out'].checked ? 1 : 0,
        can_transfer_in: form['can_transfer_in'].checked ? 1 : 0,
        can_consume: form['can_consume'].checked ? 1 : 0,
        is_active: 1
    };

    try {
        const url = currentLocation ? `/api/locations/${currentLocation.id}` : '/api/locations';
        const method = currentLocation ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(locationData)
        });

        const data = await response.json();
        if (data.success) {
            showNotification(data.message || 'Gestiune salvată cu succes', 'success');
            closeLocationModal();
            await loadLocations();
            renderLocationsUI();
            // Încarcă statistici pentru toate locațiile
            locations.forEach(loc => loadLocationStatistics(loc.id));
        } else {
            showNotification('Eroare: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('❌ Eroare la salvare locație:', error);
        showNotification('Eroare la salvare locație', 'error');
    }
}

/**
 * Editează o locație
 */
async function editLocation(locationId) {
    try {
        const response = await fetch(`/api/locations/${locationId}`);
        const data = await response.json();
        if (data.success) {
            currentLocation = data.data;
            
            // Populează formularul
            document.getElementById('location-name').value = currentLocation.name;
            document.getElementById('location-type').value = currentLocation.type;
            document.getElementById('location-description').value = currentLocation.description || '';
            document.getElementById('location-manager').value = currentLocation.manager_name || '';
            document.getElementById('can-receive').checked = currentLocation.can_receive_deliveries;
            document.getElementById('can-transfer-out').checked = currentLocation.can_transfer_out;
            document.getElementById('can-transfer-in').checked = currentLocation.can_transfer_in;
            document.getElementById('can-consume').checked = currentLocation.can_consume;
            
            document.getElementById('location-modal-title').textContent = 'Editează Gestiune';
            document.getElementById('location-modal').style.display = 'flex';
        }
    } catch (error) {
        console.error('❌ Eroare la încărcare locație:', error);
        showNotification('Eroare la încărcare locație', 'error');
    }
}

/**
 * Șterge o locație
 */
async function deleteLocation(locationId) {
    if (!confirm('Sigur doriți să dezactivați această gestiune?')) {
        return;
    }

    try {
        const response = await fetch(`/api/locations/${locationId}`, {
            method: 'DELETE'
        });

        const data = await response.json();
        if (data.success) {
            showNotification(data.message, 'success');
            await loadLocations();
            renderLocationsUI();
        } else {
            showNotification('Eroare: ' + data.error, 'error');
        }
    } catch (error) {
        console.error('❌ Eroare la ștergere locație:', error);
        showNotification('Eroare la ștergere locație', 'error');
    }
}

/**
 * Afișează detalii despre o locație
 */
async function viewLocationDetails(locationId) {
    // TODO: Implementează modal cu detalii complete
    console.log('View details for location:', locationId);
}

/**
 * Arată modalul pentru gestionare consumabile
 */
function showConsumablesModal() {
    // TODO: Implementează modal pentru consumabile
    console.log('Show consumables modal');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('location-modal');
        if (e.target === modal) {
            closeLocationModal();
        }
    });
}

/**
 * Afișează notificare (folosește sistemul existent din admin.html)
 */
function showNotification(message, type = 'info') {
    // Verifică dacă există funcția globală de notificare
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback la alert
        alert(message);
    }
}

// Auto-init când pagina se încarcă
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMultiLocationUI);
} else {
    // Document deja încărcat
    initMultiLocationUI();
}

// Export functions pentru utilizare globală
window.multiLocationUI = {
    init: initMultiLocationUI,
    loadLocations,
    loadConsumables,
    renderLocationsUI,
    showAddLocationModal,
    editLocation,
    deleteLocation,
    viewLocationDetails,
    showConsumablesModal
};

