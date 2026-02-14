"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
// ========== MODAL REDIMENSIONABIL PENTRU REACT BOOTSTRAP ==========
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResizableModal = void 0;
var ResizableModal = /** @class */ (function () {
    function ResizableModal(modalElement) {
        this.isResizing = false;
        this.isDragging = false;
        this.currentHandle = null;
        this.startX = 0;
        this.startY = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        this.startLeft = 0;
        this.startTop = 0;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.modal = modalElement;
        this.dialog = modalElement.querySelector('.modal-dialog');
        this.header = modalElement.querySelector('.modal-header');
        if (!this.dialog) {
            console.warn('ResizableModal: .modal-dialog not found');
            return;
        }
        console.log('âœ… ResizableModal constructor called');
        this.init();
    }
    ResizableModal.prototype.init = function () {
        console.log('🔧 ResizableModal init started');
        // Dezactivează comportamentul default Bootstrap
        this.disableBootstrapClose();
        // Adaugă handle-uri pentru resize
        this.addResizeHandles();
        // Activează dragging pe header
        this.enableDragging();
        console.log('âœ… ResizableModal init completed');
    };
    ResizableModal.prototype.disableBootstrapClose = function () {
        var _this = this;
        if (!this.dialog)
            return;
        console.log('🔧 Disabling Bootstrap close behavior');
        // Oprește propagarea click-urilor din dialog spre modal
        // IMPORTANT: Permite click-urile pe butoane să treacă prin
        this.dialog.addEventListener('mousedown', function (e) {
            var target = e.target;
            // Permite click-urile pe butoane și elemente interactive
            if (target.closest('.btn-close') ||
                target.closest('.order-details-modal-close-btn') ||
                target.closest('.order-details-modal-close-button') ||
                target.closes[button] ||
                target.closes[a] ||
                target.closes[input] ||
                target.closes[select] ||
                target.closes[textarea]) {
                return; // Lasă click-ul să treacă prin
            }
            e.stopPropagation();
        });
        this.dialog.addEventListener('click', function (e) {
            var target = e.target;
            // Permite click-urile pe butoane și elemente interactive
            if (target.closest('.btn-close') ||
                target.closest('.order-details-modal-close-btn') ||
                target.closest('.order-details-modal-close-button') ||
                target.closes[button] ||
                target.closes[a] ||
                target.closes[input] ||
                target.closes[select] ||
                target.closes[textarea]) {
                return; // Lasă click-ul să treacă prin
            }
            e.stopPropagation();
        });
        // Previne închiderea când se face resize/drag
        this.modal.addEventListener('mousedown', function (e) {
            if (_this.isResizing || _this.isDragging) {
                e.stopPropagation();
                e.preventDefault();
            }
        });
        // Backdrop-ul este eliminat, nu mai este necesar să prevenim click-uri pe el
    };
    ResizableModal.prototype.addResizeHandles = function () {
        var _this = this;
        if (!this.dialog)
            return;
        // Verifică dacă handle-urile există deja
        if (this.dialog.querySelector('.modal-resize-handle')) {
            console.log('âš ï¸ Resize handles already exist, skipping');
            return;
        }
        console.log('🔧 Adding resize handles');
        // Creează handle-uri pentru toate direcțiile
        var handles = [
            { class: 'resize-e', cursor: 'ew-resize' },
            { class: 'resize-s', cursor: 'ns-resize' },
            { class: 'resize-se', cursor: 'nwse-resize' },
            { class: 'resize-w', cursor: 'ew-resize' },
            { class: 'resize-n', cursor: 'ns-resize' },
            { class: 'resize-ne', cursor: 'nesw-resize' },
            { class: 'resize-nw', cursor: 'nwse-resize' },
            { class: 'resize-sw', cursor: 'nesw-resize' },
        ];
        handles.forEach(function (config) {
            var handle = document.createElemen[div];
            handle.className = "modal-resize-handle ".concat(config.class);
            handle.style.cursor = config.cursor;
            handle.setAttribute('data-direction', config.class.replace('resize-', ''));
            _this.dialog.appendChild(handle);
            // Mouse events
            handle.addEventListener('mousedown', function (e) {
                e.stopPropagation();
                e.preventDefault();
                _this.startResize(e, config.class);
            });
            // Touch events
            handle.addEventListener('touchstart', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.touches[0]) {
                    _this.startResize(e.touches[0], config.class);
                }
            });
        });
        // Event listeners globale
        document.addEventListener('mousemove', function (e) { return _this.resize(e); });
        document.addEventListener('mouseup', function () { return _this.stopResize(); });
        document.addEventListener('touchmove', function (e) {
            if (_this.isResizing && e.touches[0]) {
                e.preventDefault();
                _this.resize(e.touches[0]);
            }
        }, { passive: false });
        document.addEventListener('touchend', function () { return _this.stopResize(); });
        console.log("\u00E2\u0153\u2026 Added ".concat(handles.length, " resize handles"));
    };
    ResizableModal.prototype.startResize = function (e, handleClass) {
        if (!this.dialog)
            return;
        console.log("\uD83D\uDD27 Start resize: ".concat(handleClass));
        this.isResizing = true;
        this.currentHandle = handleClass;
        var rect = this.dialog.getBoundingClientRect();
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startWidth = rect.width;
        this.startHeight = rect.height;
        this.startLeft = rect.left;
        this.startTop = rect.top;
        // Schimbă poziționarea
        this.dialog.style.position = 'fixed';
        this.dialog.style.left = rect.left + 'px';
        this.dialog.style.top = rect.top + 'px';
        this.dialog.style.margin = '0';
        // UI feedback
        this.modal.classList.add('resizing');
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.cursor = handleClass.includes('e') ? 'ew-resize' :
            handleClass.includes('s') ? 'ns-resize' : 'nwse-resize';
    };
    ResizableModal.prototype.resize = function (e) {
        if (!this.isResizing || !this.dialog || !this.currentHandle)
            return;
        var deltaX = e.clientX - this.startX;
        var deltaY = e.clientY - this.startY;
        var newWidth = this.startWidth;
        var newHeight = this.startHeight;
        var newLeft = this.startLeft;
        var newTop = this.startTop;
        // Calculează dimensiuni
        if (this.currentHandle.includes('e')) {
            newWidth = this.startWidth + deltaX;
        }
        if (this.currentHandle.includes('w')) {
            newWidth = this.startWidth - deltaX;
            newLeft = this.startLeft + deltaX;
        }
        if (this.currentHandle.includes('s')) {
            newHeight = this.startHeight + deltaY;
        }
        if (this.currentHandle.includes('n')) {
            newHeight = this.startHeight - deltaY;
            newTop = this.startTop + deltaY;
        }
        // Limite
        var minWidth = 600;
        var maxWidth = window.innerWidth - 40;
        var minHeight = 400;
        var maxHeight = window.innerHeight - 40;
        // Validare width
        if (newWidth < minWidth) {
            newWidth = minWidth;
            if (this.currentHandle.includes('w')) {
                newLeft = this.startLeft + this.startWidth - minWidth;
            }
        }
        if (newWidth > maxWidth) {
            newWidth = maxWidth;
            if (this.currentHandle.includes('w')) {
                newLeft = this.startLeft + this.startWidth - maxWidth;
            }
        }
        // Validare height
        if (newHeight < minHeight) {
            newHeight = minHeight;
            if (this.currentHandle.includes('n')) {
                newTop = this.startTop + this.startHeight - minHeight;
            }
        }
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            if (this.currentHandle.includes('n')) {
                newTop = this.startTop + this.startHeight - maxHeight;
            }
        }
        // Aplică
        this.dialog.style.width = newWidth + 'px';
        this.dialog.style.height = newHeight + 'px';
        this.dialog.style.left = newLeft + 'px';
        this.dialog.style.top = newTop + 'px';
        this.dialog.style.maxWidth = 'none';
        this.dialog.style.maxHeight = 'none';
    };
    ResizableModal.prototype.stopResize = function () {
        if (!this.isResizing)
            return;
        console.log('🔧 Stop resize');
        this.isResizing = false;
        this.currentHandle = null;
        this.modal.classList.remove('resizing');
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        document.body.style.cursor = '';
    };
    ResizableModal.prototype.enableDragging = function () {
        var _this = this;
        if (!this.header || !this.dialog)
            return;
        console.log('🔧 Enabling drag on header');
        this.header.addEventListener('mousedown', function (e) {
            var target = e.target;
            // Nu activa drag pe butoane
            if (target.closest('.btn-close') ||
                target.closest('.order-details-modal-close-btn') ||
                target.closes[button] ||
                target.closes[a] ||
                target.closes[input] ||
                target.closes[select] ||
                target.closes[textarea]) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
            _this.startDrag(e);
        });
        document.addEventListener('mousemove', function (e) { return _this.drag(e); });
        document.addEventListener('mouseup', function () { return _this.stopDrag(); });
        // Touch
        this.header.addEventListener('touchstart', function (e) {
            var target = e.target;
            if (!target.closest('.btn-close') &&
                !target.closest('.order-details-modal-close-btn') &&
                !target.closes[button] &&
                !target.closes[a]) {
                e.stopPropagation();
                if (e.touches[0]) {
                    _this.startDrag(e.touches[0]);
                }
            }
        });
        document.addEventListener('touchmove', function (e) {
            if (_this.isDragging && e.touches[0]) {
                e.preventDefault();
                _this.drag(e.touches[0]);
            }
        }, { passive: false });
        document.addEventListener('touchend', function () { return _this.stopDrag(); });
    };
    ResizableModal.prototype.startDrag = function (e) {
        if (!this.dialog || this.isResizing)
            return;
        console.log('🔧 Start drag');
        this.isDragging = true;
        var rect = this.dialog.getBoundingClientRect();
        this.dragStartX = e.clientX - rect.left;
        this.dragStartY = e.clientY - rect.top;
        this.dialog.style.position = 'fixed';
        this.dialog.style.left = rect.left + 'px';
        this.dialog.style.top = rect.top + 'px';
        this.dialog.style.margin = '0';
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        document.body.style.cursor = 'move';
    };
    ResizableModal.prototype.drag = function (e) {
        if (!this.isDragging || !this.dialog)
            return;
        var newLeft = e.clientX - this.dragStartX;
        var newTop = e.clientY - this.dragStartY;
        var dialogWidth = this.dialog.offsetWidth;
        var dialogHeight = this.dialog.offsetHeight;
        var maxLeft = window.innerWidth - dialogWidth;
        var maxTop = window.innerHeight - dialogHeight;
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        this.dialog.style.left = newLeft + 'px';
        this.dialog.style.top = newTop + 'px';
    };
    ResizableModal.prototype.stopDrag = function () {
        if (!this.isDragging)
            return;
        console.log('🔧 Stop drag');
        this.isDragging = false;
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        document.body.style.cursor = '';
    };
    ResizableModal.prototype.reset = function () {
        if (!this.dialog)
            return;
        console.log('🔄 Reset modal');
        this.dialog.style.width = '';
        this.dialog.style.height = '';
        this.dialog.style.position = '';
        this.dialog.style.left = '';
        this.dialog.style.top = '';
        this.dialog.style.margin = '';
        this.dialog.style.maxWidth = '';
        this.dialog.style.maxHeight = '';
    };
    ResizableModal.prototype.destroy = function () {
        if (!this.dialog)
            return;
        console.log('💥 Destroy modal');
        var handles = this.dialog.querySelectorAll('.modal-resize-handle');
        handles.forEach(function (handle) { return handle.remove(); });
    };
    return ResizableModal;
}());
exports.ResizableModal = ResizableModal;
