// ==================== ALERGENI SYSTEM - CLIENT INTERFACE ====================
// Script pentru afișare iconițe alergeni în interfața client (comanda.html)
// Versiune: 3.0.4 | Data: 03 Noiembrie 2025

// Variabilă globală pentru date alergeni
window.allergensData = [];
window.allergensLoaded = false;

// Încarcă datele alergenilor de la server
async function loadAllergensData() {
    try {
        const response = await fetch('/api/allergens?active_only=true');
        const data = await response.json();
        
        if (data.success && data.data) {
            window.allergensData = data.data;
            window.allergensLoaded = true;
            console.log(`✅ ${data.data.length} alergeni încărcați pentru interfața client`);
            
            // Trigger re-render al meniului dacă e deja încărcat
            if (typeof renderMenuForCategory === 'function' && window.currentCategory) {
                renderMenuForCategory(window.currentCategory);
            }
        } else {
            console.warn('⚠️ Nu s-au putut încărca alergenii');
        }
    } catch (error) {
        console.error('❌ Eroare la încărcarea alergenilor:', error);
    }
}

// Generează HTML pentru iconițe alergeni
function generateAllergenIcons(allergens_computed) {
    if (!allergens_computed || !window.allergensData || window.allergensData.length === 0) {
        return '';
    }
    
    let allergenCodes = [];
    try {
        allergenCodes = JSON.parse(allergens_computed || '[]');
    } catch (e) {
        return '';
    }
    
    if (allergenCodes.length === 0) {
        return '';
    }
    
    const icons = allergenCodes
        .map(code => {
            const allergen = window.allergensData.find(a => a.code === code);
            if (!allergen) return '';
            
            return `<span class="allergen-icon" 
                         title="${allergen.name_ro}" 
                         style="font-size: 1.2rem; margin-right: 3px; cursor: help; display: inline-block;">
                        ${allergen.icon}
                    </span>`;
        })
        .filter(icon => icon)
        .join('');
    
    return icons;
}

// Modal pentru afișare detalii alergeni per produs
function showAllergensModal(productId) {
    const product = window.menuItems ? window.menuItems.find(p => p.id === productId) : null;
    if (!product) {
        console.error('Produs negăsit:', productId);
        return;
    }
    
    let allergenCodes = [];
    try {
        allergenCodes = JSON.parse(product.allergens_computed || '[]');
    } catch (e) {
        allergenCodes = [];
    }
    
    if (allergenCodes.length === 0) {
        const lang = window.currentLang || localStorage.getItem('selectedLanguage') || 'ro';
        alert(lang === 'ro' ? 'Acest produs nu conține alergeni declarați.' : 'This product has no declared allergens.');
        return;
    }
    
    const allergenDetails = allergenCodes
        .map(code => window.allergensData.find(a => a.code === code))
        .filter(a => a); // Remove undefined
    
    if (allergenDetails.length === 0) {
        console.warn('Nu s-au găsit detalii pentru alergeni:', allergenCodes);
        return;
    }
    
    const lang = window.currentLang || localStorage.getItem('selectedLanguage') || 'ro';
    
    const modalHTML = `
        <div id="allergensModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.75); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.3s;" onclick="closeAllergensModal()">
            <div style="background: white; border-radius: 20px; padding: 30px; max-width: 500px; width: 100%; max-height: 85vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.3);" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="color: #d84315; margin: 0; font-size: 1.6rem; font-weight: 700;">
                        ⚠️ ${lang === 'ro' ? 'Alergeni' : 'Allergens'}
                    </h2>
                    <button onclick="closeAllergensModal()" style="background: none; border: none; font-size: 2.5rem; cursor: pointer; color: #666; line-height: 1;">&times;</button>
                </div>
                
                <h3 style="color: #333; font-size: 1.2rem; margin-bottom: 15px; font-weight: 600;">${product.name}</h3>
                
                <p style="color: #666; margin-bottom: 20px; font-size: 0.95rem; line-height: 1.5;">
                    ${lang === 'ro' 
                        ? 'Acest produs conține următorii alergeni (conform Regulamentului UE 1169/2011):' 
                        : 'This product contains the following allergens (EU Regulation 1169/2011):'}
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${allergenDetails.map(allergen => `
                        <div style="display: flex; align-items: start; gap: 15px; padding: 15px; background: ${allergen.color_hex}15; border-left: 4px solid ${allergen.color_hex}; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                            <div style="font-size: 2.2rem; flex-shrink: 0; line-height: 1;">${allergen.icon}</div>
                            <div style="flex: 1;">
                                <h4 style="color: #333; margin: 0 0 5px 0; font-size: 1.05rem; font-weight: 600;">
                                    ${lang === 'ro' ? allergen.name_ro : allergen.name_en}
                                </h4>
                                <p style="color: #666; margin: 0; font-size: 0.88rem; line-height: 1.4;">
                                    ${lang === 'ro' ? allergen.description_ro : allergen.description_en}
                                </p>
                                ${allergen.severity === 'critical' ? `
                                    <div style="margin-top: 8px; color: #d32f2f; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 5px;">
                                        <span style="font-size: 1rem;">⚠️</span>
                                        <span>${lang === 'ro' ? 'RISC RIDICAT - Reacții severe posibile' : 'HIGH RISK - Severe reactions possible'}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 25px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 8px;">
                    <p style="color: #856404; margin: 0; font-size: 0.9rem; line-height: 1.5;">
                        <strong style="font-size: 1rem;">💡 ${lang === 'ro' ? 'Notă importantă:' : 'Important note:'}</strong><br>
                        ${lang === 'ro' 
                            ? 'Dacă aveți alergii sau intoleranțe alimentare, vă rugăm să anunțați personalul înainte de a comanda.' 
                            : 'If you have food allergies or intolerances, please inform the staff before ordering.'}
                    </p>
                </div>
                
                <button onclick="closeAllergensModal()" style="width: 100%; margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #008B8B, #20B2AA); color: white; border: none; border-radius: 10px; font-size: 1.05rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 10px rgba(0,139,139,0.3); transition: all 0.3s;">
                    ${lang === 'ro' ? 'Am înțeles' : 'I understand'}
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add fade-in animation
    const modal = document.getElementById('allergensModal');
    if (modal) {
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }
}

function closeAllergensModal() {
    const modal = document.getElementById('allergensModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
}

// Auto-load când pagina e gata
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔄 Allergens Client Script: DOMContentLoaded');
        loadAllergensData();
    });
} else {
    console.log('🔄 Allergens Client Script: Document already loaded');
    loadAllergensData();
}

// ==================== FILTRE MENIU "FĂRĂ ALERGEN X" ====================

// Variabilă globală pentru filtre active
window.activeAllergenFilters = [];

// Adaugă/Remove filtru alergen
function toggleAllergenFilter(allergenCode) {
    const index = window.activeAllergenFilters.indexOf(allergenCode);
    
    if (index === -1) {
        window.activeAllergenFilters.push(allergenCode);
    } else {
        window.activeAllergenFilters.splice(index, 1);
    }
    
    console.log(`🔍 Filtre alergeni active: ${JSON.stringify(window.activeAllergenFilters)}`);
    
    // Trigger re-render meniu dacă funcția există
    if (typeof renderMenuForCategory === 'function' && window.currentCategory) {
        renderMenuForCategory(window.currentCategory);
    } else if (typeof filterMenuByAllergens === 'function') {
        filterMenuByAllergens();
    }
}

// Verifică dacă un produs trece de filtrele de alergeni
function productPassesAllergenFilters(product) {
    if (window.activeAllergenFilters.length === 0) {
        return true; // Fără filtre = afișează toate
    }
    
    let productAllergens = [];
    try {
        productAllergens = JSON.parse(product.allergens_computed || '[]');
    } catch (e) {
        productAllergens = [];
    }
    
    // Verifică dacă produsul conține vreunul din alergenii filtrați
    const hasFilteredAllergen = productAllergens.some(code => 
        window.activeAllergenFilters.includes(code)
    );
    
    return !hasFilteredAllergen; // TRUE dacă produsul NU conține alergenii filtrați
}

// Creare UI pentru filtre alergeni (poate fi adăugat în navigation bar)
function createAllergenFiltersUI() {
    if (!window.allergensData || window.allergensData.length === 0) {
        return '';
    }
    
    const lang = window.currentLang || localStorage.getItem('selectedLanguage') || 'ro';
    
    // Grupare alergeni după severitate pentru UI
    const criticalAllergens = window.allergensData.filter(a => a.severity === 'critical');
    const commonAllergens = window.allergensData.filter(a => 
        ['GLUTEN', 'MILK', 'EGGS', 'NUTS', 'PEANUTS', 'FISH', 'SESAME'].includes(a.code)
    );
    
    let html = `
        <div class="allergen-filters-container" style="padding: 15px; background: white; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h4 style="color: #333; margin-bottom: 15px; font-size: 1rem;">
                <i class="fas fa-filter" style="color: #1976d2; margin-right: 8px;"></i>
                ${lang === 'ro' ? 'Filtrează produse FĂRĂ:' : 'Filter products WITHOUT:'}
            </h4>
            
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${commonAllergens.map(allergen => `
                    <button 
                        class="allergen-filter-chip" 
                        data-code="${allergen.code}"
                        onclick="toggleAllergenFilter('${allergen.code}')"
                        style="
                            padding: 8px 14px;
                            border: 2px solid ${allergen.color_hex};
                            background: white;
                            color: #333;
                            border-radius: 20px;
                            cursor: pointer;
                            transition: all 0.3s;
                            font-size: 0.9rem;
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                        ">
                        <span>${allergen.icon}</span>
                        <span>${lang === 'ro' ? allergen.name_ro : allergen.name_en}</span>
                    </button>
                `).join('')}
            </div>
            
            <div id="activeFiltersInfo" style="margin-top: 12px; font-size: 0.9rem; color: #666;">
                ${lang === 'ro' ? '💡 Click pe un alergen pentru a filtra produsele care NU conțin acest alergen' : '💡 Click an allergen to filter products that do NOT contain it'}
            </div>
        </div>
    `;
    
    return html;
}

// Update UI când filtrele se schimbă
function updateAllergenFiltersUI() {
    document.querySelectorAll('.allergen-filter-chip').forEach(chip => {
        const code = chip.dataset.code;
        const isActive = window.activeAllergenFilters.includes(code);
        
        if (isActive) {
            chip.style.background = chip.style.borderColor;
            chip.style.color = 'white';
            chip.style.fontWeight = '600';
        } else {
            chip.style.background = 'white';
            chip.style.color = '#333';
            chip.style.fontWeight = '400';
        }
    });
    
    // Update info text
    const infoDiv = document.getElementById('activeFiltersInfo');
    if (infoDiv) {
        const lang = window.currentLang || localStorage.getItem('selectedLanguage') || 'ro';
        
        if (window.activeAllergenFilters.length === 0) {
            infoDiv.innerHTML = lang === 'ro' 
                ? '💡 Click pe un alergen pentru a filtra produsele care NU conțin acest alergen' 
                : '💡 Click an allergen to filter products that do NOT contain it';
            infoDiv.style.color = '#666';
        } else {
            const allergenNames = window.activeAllergenFilters
                .map(code => {
                    const allergen = window.allergensData.find(a => a.code === code);
                    return allergen ? allergen.icon + ' ' + (lang === 'ro' ? allergen.name_ro : allergen.name_en) : code;
                })
                .join(', ');
            
            infoDiv.innerHTML = `✅ ${lang === 'ro' ? 'Ascunde produse cu:' : 'Hiding products with:'} <strong>${allergenNames}</strong>`;
            infoDiv.style.color = '#1976d2';
            infoDiv.style.fontWeight = '600';
        }
    }
}

// Override funcția toggleAllergenFilter pentru a actualiza și UI-ul
const originalToggleAllergenFilter = toggleAllergenFilter;
toggleAllergenFilter = function(allergenCode) {
    originalToggleAllergenFilter(allergenCode);
    updateAllergenFiltersUI();
};

console.log('✅ Allergens Client Script loaded (cu filtre)');

