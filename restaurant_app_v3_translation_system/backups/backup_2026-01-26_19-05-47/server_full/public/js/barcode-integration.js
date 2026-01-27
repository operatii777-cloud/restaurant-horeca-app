/**
 * Barcode Integration for NIR and Inventory
 * Add this script to admin-advanced.html and multi-location.html
 */

class BarcodeIntegration {
    constructor() {
        this.scanner = null;
        this.isActive = false;
        this.onScanCallback = null;
    }

    // Initialize barcode scanner
    async init(containerId, onScan) {
        this.onScanCallback = onScan;
        
        try {
            this.scanner = new Html5QrcodeScanner(containerId, {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            });

            this.scanner.render(
                (decodedText) => this.handleScan(decodedText),
                (error) => {} // Silent error
            );

            this.isActive = true;
            console.log('✅ Barcode scanner initialized');
        } catch (error) {
            console.error('❌ Scanner init error:', error);
        }
    }

    // Handle barcode scan
    async handleScan(barcode) {
        if (!this.onScanCallback) return;

        // Pause scanner temporarily
        if (this.scanner) {
            this.scanner.pause(true);
        }

        try {
            await this.onScanCallback(barcode);
        } catch (error) {
            console.error('Scan callback error:', error);
        }

        // Resume after 2 seconds
        setTimeout(() => {
            if (this.scanner) {
                this.scanner.resume();
            }
        }, 2000);
    }

    // Stop scanner
    stop() {
        if (this.scanner) {
            this.scanner.clear();
            this.scanner = null;
            this.isActive = false;
            console.log('✅ Barcode scanner stopped');
        }
    }
}

// NIR Barcode Integration
class NIRBarcodeHelper {
    constructor() {
        this.integration = new BarcodeIntegration();
    }

    // Start scanning for NIR
    async startScanForNIR(containerId) {
        await this.integration.init(containerId, async (barcode) => {
            console.log(`📷 NIR Scan: ${barcode}`);
            
            // Lookup ingredient
            const response = await fetch(`/api/barcode/lookup?code=${barcode}&mode=ingredient`);
            const data = await response.json();

            if (data.success) {
                // Auto-fill NIR form
                this.fillNIRForm(data.item);
                this.showSuccess(`✅ Găsit: ${data.item.name}`);
            } else {
                this.showError(`❌ Cod necunoscut: ${barcode}`);
            }
        });
    }

    // Fill NIR form with scanned item
    fillNIRForm(item) {
        // Try to find and fill ingredient dropdown
        const ingredientSelect = document.querySelector('select[id*="ingredient"]');
        if (ingredientSelect) {
            // Find option with matching name
            for (let option of ingredientSelect.options) {
                if (option.text.includes(item.name)) {
                    ingredientSelect.value = option.value;
                    ingredientSelect.dispatchEvent(new Event('change'));
                    break;
                }
            }
        }

        // Auto-fill other fields if they exist
        const quantityInput = document.querySelector('input[id*="quantity"], input[name*="quantity"]');
        if (quantityInput && !quantityInput.value) {
            quantityInput.focus();
        }

        console.log(`✅ Form filled for: ${item.name}`);
    }

    // Show success message
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showMessage(message, 'error');
    }

    // Show message
    showMessage(message, type) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);

        // Play sound
        if (type === 'success') {
            const audio = new Audio('/notif1.mp3');
            audio.volume = 0.3;
            audio.play().catch(e => {});
        }
    }

    // Stop scanning
    stop() {
        this.integration.stop();
    }
}

// Inventory Barcode Integration
class InventoryBarcodeHelper {
    constructor() {
        this.integration = new BarcodeIntegration();
        this.scannedItems = [];
    }

    // Start scanning for inventory
    async startScanForInventory(containerId) {
        await this.integration.init(containerId, async (barcode) => {
            console.log(`📷 Inventory Scan: ${barcode}`);
            
            // Lookup product or ingredient
            let data = await this.lookupItem(barcode, 'product');
            
            if (!data.success) {
                data = await this.lookupItem(barcode, 'ingredient');
            }

            if (data.success) {
                this.addToInventoryList(barcode, data.item);
                this.showSuccess(`✅ Adăugat: ${data.item.name}`);
            } else {
                this.showError(`❌ Cod necunoscut: ${barcode}`);
            }
        });
    }

    // Lookup item by barcode
    async lookupItem(barcode, mode) {
        const response = await fetch(`/api/barcode/lookup?code=${barcode}&mode=${mode}`);
        return await response.json();
    }

    // Add item to inventory list
    addToInventoryList(barcode, item) {
        const existing = this.scannedItems.find(i => i.barcode === barcode);
        
        if (existing) {
            existing.quantity++;
        } else {
            this.scannedItems.push({
                barcode,
                item,
                quantity: 1,
                timestamp: new Date().toISOString()
            });
        }

        this.updateInventoryDisplay();
    }

    // Update inventory display
    updateInventoryDisplay() {
        const container = document.getElementById('scanned-inventory-list');
        if (!container) return;

        container.innerHTML = this.scannedItems.map(scanned => `
            <div style="padding: 15px; background: #f8fafc; border-left: 4px solid #667eea; margin-bottom: 10px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${scanned.item.name}</strong>
                        <div style="color: #64748b; font-size: 0.9rem;">Cod: ${scanned.barcode}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="inventoryHelper.updateQuantity('${scanned.barcode}', -1)" style="padding: 5px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer;">-</button>
                        <span style="font-weight: 700; min-width: 40px; text-align: center;">${scanned.quantity}</span>
                        <button onclick="inventoryHelper.updateQuantity('${scanned.barcode}', 1)" style="padding: 5px 12px; background: #dcfce7; color: #16a34a; border: none; border-radius: 6px; cursor: pointer;">+</button>
                        <button onclick="inventoryHelper.removeItem('${scanned.barcode}')" style="padding: 5px 12px; background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; cursor: pointer;">🗑️</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update quantity
    updateQuantity(barcode, delta) {
        const item = this.scannedItems.find(i => i.barcode === barcode);
        if (item) {
            item.quantity = Math.max(0, item.quantity + delta);
            if (item.quantity === 0) {
                this.removeItem(barcode);
            } else {
                this.updateInventoryDisplay();
            }
        }
    }

    // Remove item
    removeItem(barcode) {
        this.scannedItems = this.scannedItems.filter(i => i.barcode !== barcode);
        this.updateInventoryDisplay();
    }

    // Export scanned data
    exportData() {
        return {
            items: this.scannedItems,
            timestamp: new Date().toISOString(),
            total_items: this.scannedItems.length,
            total_quantity: this.scannedItems.reduce((sum, i) => sum + i.quantity, 0)
        };
    }

    // Clear all
    clear() {
        this.scannedItems = [];
        this.updateInventoryDisplay();
    }

    // Show success/error (same as NIR)
    showSuccess(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 25px;
            background: #10b981; color: white; border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2); z-index: 10000; font-weight: 600;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        const audio = new Audio('/notif1.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => {});
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 15px 25px;
            background: #ef4444; color: white; border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2); z-index: 10000; font-weight: 600;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Stop scanning
    stop() {
        this.integration.stop();
    }
}

// Export helpers
window.NIRBarcodeHelper = NIRBarcodeHelper;
window.InventoryBarcodeHelper = InventoryBarcodeHelper;

console.log('✅ Barcode Integration loaded - NIR & Inventory helpers available');

