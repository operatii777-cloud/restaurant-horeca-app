/**
 * INGREDIENT VALIDATOR - UI pentru validare manuală duplicate
 * Script global pentru toate interfețele admin
 * 
 * Funcționalități:
 * - Interceptează adăugarea de ingrediente
 * - Detectează duplicate/similare
 * - Arată dialog cu opțiuni
 * - Permite validare manuală cu explicație
 */

(function() {
    'use strict';
    
    // ==================== DIALOG HTML ====================
    
    const dialogHTML = `
    <div id="ingredientValidatorDialog" class="modal fade" tabindex="-1" role="dialog" style="display: none;">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header bg-warning">
                    <h5 class="modal-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        Ingredient Similar Găsit
                    </h5>
                    <button type="button" class="close" onclick="closeIngredientValidatorDialog()">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="validatorContent"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeIngredientValidatorDialog()">
                        ❌ Anulează
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <style>
        #ingredientValidatorDialog .modal {
            background: rgba(0,0,0,0.5);
        }
        
        .validator-similar-item {
            border: 1px solid #dee2e6;
            border-radius: 5px;
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
        }
        
        .validator-similar-item.exact {
            border-color: #dc3545;
            background: #f8d7da;
        }
        
        .validator-similar-item.similar {
            border-color: #ffc107;
            background: #fff3cd;
        }
        
        .validator-new-ingredient {
            background: #d4edda;
            border: 2px solid #28a745;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
        
        .validator-differences {
            background: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 10px;
            margin: 10px 0;
        }
        
        .validator-differences ul {
            margin: 5px 0;
            padding-left: 20px;
        }
        
        .validator-validation-reason {
            width: 100%;
            min-height: 80px;
            padding: 10px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
    `;
    
    // Adaugă dialogul în DOM la încărcarea paginii
    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('ingredientValidatorDialog')) {
            document.body.insertAdjacentHTML('beforeend', dialogHTML);
        }
    });
    
    // ==================== FUNCȚII DIALOG ====================
    
    window.closeIngredientValidatorDialog = function() {
        const dialog = document.getElementById('ingredientValidatorDialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
    };
    
    window.showIngredientValidatorDialog = function(data) {
        const { newIngredient, duplicateData, originalData } = data;
        const dialog = document.getElementById('ingredientValidatorDialog');
        const content = document.getElementById('validatorContent');
        
        if (!dialog || !content) {
            console.error('❌ Dialog nu a fost găsit în DOM');
            return;
        }
        
        let html = '';
        
        // Afișează ingredientul nou
        html += `
            <div class="validator-new-ingredient">
                <h6><strong>Vrei să adaugi:</strong></h6>
                <p style="margin: 5px 0; font-size: 18px;">
                    <strong>"${newIngredient.name}"</strong>
                </p>
                <small>Categorie: ${newIngredient.category} | Unit: ${newIngredient.unit}</small>
            </div>
        `;
        
        if (duplicateData.exact) {
            // Duplicat EXACT
            const existing = duplicateData.existing;
            html += `
                <div class="validator-similar-item exact">
                    <h6><strong>❌ INGREDIENT EXISTENT (DUPLICAT EXACT):</strong></h6>
                    <p style="font-size: 16px; margin: 5px 0;">
                        <strong>"${existing.name}"</strong> (ID: ${existing.id})
                    </p>
                    <p>
                        Categorie: ${existing.category}<br>
                        Stoc curent: ${existing.current_stock} ${existing.unit}
                    </p>
                    <div class="alert alert-danger mt-2">
                        <strong>⚠️ Acest ingredient există deja în sistem!</strong><br>
                        Nu poți adăuga un duplicat exact.
                    </div>
                </div>
            `;
            
            // Butoane pentru duplicat exact
            const footer = dialog.querySelector('.modal-footer');
            footer.innerHTML = `
                <button type="button" class="btn btn-primary" onclick="useExistingIngredient(${existing.id})">
                    ✅ Folosește "${existing.name}" (existent)
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeIngredientValidatorDialog()">
                    Anulează
                </button>
            `;
            
        } else if (duplicateData.similar && duplicateData.similar.length > 0) {
            // Ingrediente SIMILARE
            const similar = duplicateData.similar[0];
            const analysis = duplicateData.analysis;
            
            html += `
                <div class="validator-similar-item similar">
                    <h6><strong>⚠️ INGREDIENT SIMILAR GĂSIT:</strong></h6>
                    <p style="font-size: 16px; margin: 5px 0;">
                        <strong>"${similar.name}"</strong> (ID: ${similar.id})
                    </p>
                    <p>
                        Similaritate: <strong>${similar.similarity}%</strong><br>
                        Categorie: ${similar.category}<br>
                        Stoc curent: ${similar.current_stock} ${similar.unit}
                    </p>
                </div>
            `;
            
            // Afișează analiza diferențelor
            if (analysis && analysis.hasDifferences) {
                html += `
                    <div class="validator-differences">
                        <h6><strong>🔍 DIFERENȚE DETECTATE:</strong></h6>
                        <ul>
                            ${analysis.differences.map(diff => `<li>${diff}</li>`).join('')}
                        </ul>
                        <p class="mb-0">
                            <strong>💡 Recomandare:</strong> ${analysis.recommendation}
                        </p>
                    </div>
                `;
                
                html += `
                    <div class="alert alert-info">
                        <strong>ℹ️ Pare să fie ingredient DIFERIT</strong><br>
                        Exemplu: "Carne vita" vs "Carne vita tocata" sunt diferite.<br>
                        Poți adăuga ca ingredient nou cu o explicație.
                    </div>
                `;
            } else {
                html += `
                    <div class="alert alert-warning">
                        <strong>⚠️ Ingredientele par IDENTICE</strong><br>
                        Dacă sunt cu adevărat diferite, te rog explică diferența.
                    </div>
                `;
            }
            
            // Câmp pentru explicație
            html += `
                <div>
                    <label for="validationReason"><strong>${duplicateData.validationPrompt || 'Explică diferența (opțional)'}:</strong></label>
                    <textarea 
                        id="validationReason" 
                        class="validator-validation-reason" 
                        placeholder="Exemplu: Carne tocată pentru chiftele, diferită de carne cuburi pentru tocană"
                    ></textarea>
                    <small class="text-muted">
                        💡 Explicația ajută la evitarea confuziilor viitoare
                    </small>
                </div>
            `;
            
            // Butoane pentru similare
            const footer = dialog.querySelector('.modal-footer');
            footer.innerHTML = `
                <button type="button" class="btn btn-success" onclick="useExistingIngredient(${similar.id})">
                    🔄 Folosește "${similar.name}" (existent)
                </button>
                <button type="button" class="btn btn-primary" onclick="addIngredientWithValidation(${JSON.stringify(newIngredient).replace(/"/g, '&quot;')}, ${JSON.stringify(originalData).replace(/"/g, '&quot;')})">
                    ➕ Adaugă "${newIngredient.name}" (nou cu validare)
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeIngredientValidatorDialog()">
                    ❌ Anulează
                </button>
            `;
        }
        
        content.innerHTML = html;
        dialog.style.display = 'block';
    };
    
    // ==================== ACȚIUNI ====================
    
    window.useExistingIngredient = function(ingredientId) {
        console.log(`✅ Utilizator a ales să folosească ingredientul existent ID: ${ingredientId}`);
        
        // Notifică aplicația să folosească ingredientul existent
        if (window.onExistingIngredientSelected) {
            window.onExistingIngredientSelected(ingredientId);
        }
        
        closeIngredientValidatorDialog();
        
        // Afișează mesaj success
        alert(`✅ Se va folosi ingredientul existent (ID: ${ingredientId})`);
    };
    
    window.addIngredientWithValidation = function(newIngredient, originalData) {
        const reason = document.getElementById('validationReason')?.value || '';
        
        if (!reason.trim()) {
            if (!confirm('Nu ai completat explicația. Sigur vrei să continui fără explicație?')) {
                return;
            }
        }
        
        console.log(`✅ Utilizator validează manual adăugarea: "${newIngredient.name}"`);
        console.log(`   Motiv: ${reason}`);
        
        // Trimite request cu force=true și validation_reason
        const requestData = {
            ...originalData,
            force: true,
            validation_reason: reason || 'Validat manual de utilizator'
        };
        
        fetch('/api/ingredients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`✅ Ingredient adăugat cu validare: ${data.ingredient_id}`);
                
                closeIngredientValidatorDialog();
                
                alert(`✅ Ingredient "${newIngredient.name}" adăugat cu succes!\n${reason ? `\nMotiv: ${reason}` : ''}`);
                
                // Reîncarcă lista de ingrediente
                if (window.loadStockProducts) {
                    window.loadStockProducts();
                } else if (window.location.reload) {
                    window.location.reload();
                }
            } else {
                alert(`❌ Eroare: ${data.error}`);
            }
        })
        .catch(err => {
            console.error('❌ Eroare adăugare cu validare:', err);
            alert('❌ Eroare la adăugarea ingredientului');
        });
    };
    
    // ==================== INTERCEPTARE ADĂUGARE INGREDIENTE ====================
    
    /**
     * Wraps orice funcție de adăugare ingredient pentru a verifica duplicate
     * Utilizare: const result = await window.validateIngredientBeforeAdd(ingredientData);
     */
    window.validateIngredientBeforeAdd = async function(ingredientData) {
        try {
            const response = await fetch('/api/ingredients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(ingredientData)
            });
            
            const data = await response.json();
            
            if (response.status === 409) {
                // Duplicat sau similar găsit
                console.log('⚠️ Duplicate/similar găsit:', data);
                
                // Arată dialog cu opțiuni
                window.showIngredientValidatorDialog({
                    newIngredient: {
                        name: ingredientData.name,
                        category: ingredientData.category,
                        unit: ingredientData.unit
                    },
                    duplicateData: data,
                    originalData: ingredientData
                });
                
                return {
                    success: false,
                    requiresValidation: true,
                    duplicateData: data
                };
            } else if (response.ok && data.success) {
                // Adăugat cu succes
                return {
                    success: true,
                    ingredient_id: data.ingredient_id,
                    data: data
                };
            } else {
                // Altă eroare
                throw new Error(data.error || 'Eroare necunoscută');
            }
        } catch (error) {
            console.error('❌ Eroare validare ingredient:', error);
            return {
                success: false,
                error: error.message
            };
        }
    };
    
    console.log('✅ Ingredient Validator loaded - validare manuală disponibilă');
    
})();

