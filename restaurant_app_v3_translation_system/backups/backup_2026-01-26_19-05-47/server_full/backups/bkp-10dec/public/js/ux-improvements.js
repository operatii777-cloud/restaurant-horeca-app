// 🚀 UX/UI ÎMBUNĂTĂȚIRI - JavaScript Functions

/* ========================================
   TOAST NOTIFICATIONS - Sistem Modern
======================================== */

// Creare container pentru toast-uri
function initToastContainer() {
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

// Funcție pentru afișare toast
function showToast(message, type = 'success', duration = 3500) {
    initToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    const container = document.querySelector('.toast-container');
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    return toast;
}

// Înlocuiește alert() global cu toast
window.showNotification = function(message, type = 'success') {
    showToast(message, type);
};

/* ========================================
   SKELETON SCREENS - Loading States
======================================== */

// Generator de skeleton cards
function createSkeletonGrid(count = 6) {
    const grid = document.createElement('div');
    grid.className = 'skeleton-grid';
    grid.id = 'skeletonLoading';
    
    for (let i = 0; i < count; i++) {
        const card = document.createElement('div');
        card.className = 'skeleton-card';
        card.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-description"></div>
            <div class="skeleton-description"></div>
            <div class="skeleton-price"></div>
            <div class="skeleton-button"></div>
        `;
        grid.appendChild(card);
    }
    
    return grid;
}

// Afișare skeleton loading
function showSkeletonLoading(container, count = 6) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (!container) return;
    
    // Ascunde conținutul vechi
    const oldContent = container.innerHTML;
    container.dataset.oldContent = oldContent;
    
    // Afișează skeleton
    container.innerHTML = '';
    container.appendChild(createSkeletonGrid(count));
}

// Ascunde skeleton și arată conținutul
function hideSkeletonLoading(container) {
    if (typeof container === 'string') {
        container = document.getElementById(container);
    }
    
    if (!container) return;
    
    // Elimină skeleton
    const skeleton = container.querySelector('#skeletonLoading');
    if (skeleton) {
        skeleton.remove();
    }
}

/* ========================================
   EMPTY STATES - Generator
======================================== */

function createEmptyState(icon, title, description, buttonText, buttonAction) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
        <div class="empty-state-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${description}</p>
        ${buttonText ? `<button class="btn btn-primary btn-enhanced" onclick="${buttonAction}">${buttonText}</button>` : ''}
    `;
    return emptyState;
}

// Afișare empty state pentru coș gol
function showEmptyCart() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    const empty = createEmptyState(
        '🛒',
        'Coșul tău este gol',
        'Adaugă produse delicioase pentru a începe comanda!',
        '<i class="fas fa-utensils"></i> Explorează Meniul',
        'closeModal(\'cartModal\'); scrollToTop();'
    );
    
    cartItems.innerHTML = '';
    cartItems.appendChild(empty);
}

/* ========================================
   PROGRESS TIMER - Session Management
======================================== */

// Creare progress ring pentru timer
function createProgressTimer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'session-timer-wrapper';
    wrapper.innerHTML = `
        <svg class="progress-ring" width="70" height="70">
            <circle class="progress-ring-circle" 
                    stroke="#10b981" 
                    stroke-width="5" 
                    fill="transparent" 
                    r="28" 
                    cx="35" 
                    cy="35"
                    style="stroke-dasharray: 175.9; stroke-dashoffset: 0;">
            </circle>
        </svg>
        <div class="timer-text" id="timerText">30:00</div>
    `;
    
    container.innerHTML = '';
    container.appendChild(wrapper);
}

// Update progress ring
function updateTimerProgress(timeLeftSeconds, totalSeconds = 1800) {
    const circle = document.querySelector('.progress-ring-circle');
    const textEl = document.getElementById('timerText');
    
    if (!circle || !textEl) return;
    
    const circumference = 2 * Math.PI * 28; // r=28
    const offset = circumference - (timeLeftSeconds / totalSeconds) * circumference;
    
    circle.style.strokeDashoffset = offset;
    
    // Update text
    const minutes = Math.floor(timeLeftSeconds / 60);
    const seconds = timeLeftSeconds % 60;
    textEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Change color based on time left
    circle.classList.remove('warning', 'danger');
    if (timeLeftSeconds < 300) { // < 5 min
        circle.classList.add('danger');
    } else if (timeLeftSeconds < 600) { // < 10 min
        circle.classList.add('warning');
    }
}

/* ========================================
   MODAL ANIMATIONS - Enhanced
======================================== */

// Adaugă animații la modaluri existente
function enhanceModalAnimations() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const content = modal.querySelector('.modal-content');
        if (content && !content.classList.contains('modal-slide-in')) {
            content.classList.add('modal-slide-in');
        }
        
        // Adaugă glassmorphism
        if (!content.classList.contains('modal-glass')) {
            content.classList.add('modal-glass');
        }
        
        // Backdrop glass
        const backdrop = modal.querySelector('.modal-backdrop') || modal;
        if (backdrop && !backdrop.classList.contains('modal-backdrop-glass')) {
            backdrop.classList.add('modal-backdrop-glass');
        }
    });
}

/* ========================================
   BUTTON ENHANCEMENTS - Ripple & Hover
======================================== */

// Adaugă clasa btn-enhanced la toate butoanele
function enhanceButtons() {
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(btn => {
        if (!btn.classList.contains('btn-enhanced') && 
            !btn.classList.contains('no-enhance')) {
            btn.classList.add('btn-enhanced');
        }
    });
}

/* ========================================
   CARD ENHANCEMENTS - 3D Effect
======================================== */

// Adaugă efecte 3D la carduri
function enhanceCards() {
    const cards = document.querySelectorAll('.product-card, .cart-item');
    cards.forEach(card => {
        if (!card.classList.contains('card-3d')) {
            card.classList.add('card-3d');
        }
    });
}

/* ========================================
   INITIALIZATION - Auto-run on load
======================================== */

// Inițializare automată când pagina se încarcă
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 UX Improvements loaded!');
    
    // Inițializează containerul global pentru toast-uri (util și în admin)
    initToastContainer();

    const path = window.location.pathname.toLowerCase();
    const isAdminContext = path.includes('/admin');

    if (isAdminContext) {
        console.log('ℹ️ UX Improvements: Admin context detectat – se sar efectele vizuale grele.');
    } else {
        enhanceModalAnimations();
        enhanceButtons();
        enhanceCards();
    }
    
    // Wrap console.log pentru a afișa toast-uri pentru notificări importante
    const originalLog = console.log;
    console.log = function(...args) {
        originalLog.apply(console, args);
        
        // Detectează mesaje importante și afișează toast
        const message = args.join(' ');
        if (message.includes('✅') || message.includes('succes')) {
            // Nu afișa toast pentru toate log-urile, doar pentru cele critice
        }
    };
});

// Export funcții pentru folosire globală
window.UXImprovements = {
    showToast,
    showSkeletonLoading,
    hideSkeletonLoading,
    createEmptyState,
    showEmptyCart,
    createProgressTimer,
    updateTimerProgress,
    enhanceModalAnimations,
    enhanceButtons,
    enhanceCards
};

console.log('✅ UX Improvements Module loaded successfully!');

