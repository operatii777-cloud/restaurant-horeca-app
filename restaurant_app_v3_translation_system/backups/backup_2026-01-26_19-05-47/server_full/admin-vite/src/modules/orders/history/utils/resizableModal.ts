// import { useTranslation } from '@/i18n/I18nContext';
// ========== MODAL REDIMENSIONABIL PENTRU REACT BOOTSTRAP ==========

export class ResizableModal {
  private modal: HTMLElement;
  private dialog: HTMLElement | null;
  private header: HTMLElement | null;
  private isResizing: boolean = false;
  private isDragging: boolean = false;
  private currentHandle: string | null = null;
  private startX: number = 0;
  private startY: number = 0;
  private startWidth: number = 0;
  private startHeight: number = 0;
  private startLeft: number = 0;
  private startTop: number = 0;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  constructor(modalElement: HTMLElement) {
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

  private init() {
    console.log('🔧 ResizableModal init started');
    
    // Dezactivează comportamentul default Bootstrap
    this.disableBootstrapClose();

    // Adaugă handle-uri pentru resize
    this.addResizeHandles();

    // Activează dragging pe header
    this.enableDragging();
    
    console.log('âœ… ResizableModal init completed');
  }

  private disableBootstrapClose() {
    if (!this.dialog) return;

    console.log('🔧 Disabling Bootstrap close behavior');

    // Oprește propagarea click-urilor din dialog spre modal
    // IMPORTANT: Permite click-urile pe butoane să treacă prin
    this.dialog.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      // Permite click-urile pe butoane și elemente interactive
      if (
        target.closest('.btn-close') ||
        target.closest('.order-details-modal-close-btn') ||
        target.closest('.order-details-modal-close-button') ||
        target.closes[button] ||
        target.closes[a] ||
        target.closes[input] ||
        target.closes[select] ||
        target.closes[textarea]
      ) {
        return; // Lasă click-ul să treacă prin
      }
      e.stopPropagation();
    });

    this.dialog.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      // Permite click-urile pe butoane și elemente interactive
      if (
        target.closest('.btn-close') ||
        target.closest('.order-details-modal-close-btn') ||
        target.closest('.order-details-modal-close-button') ||
        target.closes[button] ||
        target.closes[a] ||
        target.closes[input] ||
        target.closes[select] ||
        target.closes[textarea]
      ) {
        return; // Lasă click-ul să treacă prin
      }
      e.stopPropagation();
    });

    // Previne închiderea când se face resize/drag
    this.modal.addEventListener('mousedown', (e) => {
      if (this.isResizing || this.isDragging) {
        e.stopPropagation();
        e.preventDefault();
      }
    });

    // Backdrop-ul este eliminat, nu mai este necesar să prevenim click-uri pe el
  }

  private addResizeHandles() {
    if (!this.dialog) return;

    // Verifică dacă handle-urile există deja
    if (this.dialog.querySelector('.modal-resize-handle')) {
      console.log('âš ï¸ Resize handles already exist, skipping');
      return;
    }

    console.log('🔧 Adding resize handles');

    // Creează handle-uri pentru toate direcțiile
    const handles = [
      { class: 'resize-e', cursor: 'ew-resize' },
      { class: 'resize-s', cursor: 'ns-resize' },
      { class: 'resize-se', cursor: 'nwse-resize' },
      { class: 'resize-w', cursor: 'ew-resize' },
      { class: 'resize-n', cursor: 'ns-resize' },
      { class: 'resize-ne', cursor: 'nesw-resize' },
      { class: 'resize-nw', cursor: 'nwse-resize' },
      { class: 'resize-sw', cursor: 'nesw-resize' },
    ];

    handles.forEach((config) => {
      const handle = document.createElemen[div];
      handle.className = `modal-resize-handle ${config.class}`;
      handle.style.cursor = config.cursor;
      handle.setAttribute('data-direction', config.class.replace('resize-', ''));

      this.dialog!.appendChild(handle);

      // Mouse events
      handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.startResize(e, config.class);
      });

      // Touch events
      handle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.touches[0]) {
          this.startResize(e.touches[0], config.class);
        }
      });
    });

    // Event listeners globale
    document.addEventListener('mousemove', (e) => this.resize(e));
    document.addEventListener('mouseup', () => this.stopResize());

    document.addEventListener('touchmove', (e) => {
      if (this.isResizing && e.touches[0]) {
        e.preventDefault();
        this.resize(e.touches[0]);
      }
    }, { passive: false });
    document.addEventListener('touchend', () => this.stopResize());

    console.log(`âœ… Added ${handles.length} resize handles`);
  }

  private startResize(e: MouseEvent | Touch, handleClass: string) {
    if (!this.dialog) return;

    console.log(`🔧 Start resize: ${handleClass}`);
    
    this.isResizing = true;
    this.currentHandle = handleClass;

    const rect = this.dialog.getBoundingClientRect();
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
  }

  private resize(e: MouseEvent | Touch) {
    if (!this.isResizing || !this.dialog || !this.currentHandle) return;

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;
    let newLeft = this.startLeft;
    let newTop = this.startTop;

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
    const minWidth = 600;
    const maxWidth = window.innerWidth - 40;
    const minHeight = 400;
    const maxHeight = window.innerHeight - 40;

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
  }

  private stopResize() {
    if (!this.isResizing) return;

    console.log('🔧 Stop resize');
    
    this.isResizing = false;
    this.currentHandle = null;
    this.modal.classList.remove('resizing');
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.cursor = '';
  }

  private enableDragging() {
    if (!this.header || !this.dialog) return;

    console.log('🔧 Enabling drag on header');

    this.header.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      
      // Nu activa drag pe butoane
      if (
        target.closest('.btn-close') ||
        target.closest('.order-details-modal-close-btn') ||
        target.closes[button] ||
        target.closes[a] ||
        target.closes[input] ||
        target.closes[select] ||
        target.closes[textarea]
      ) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();
      this.startDrag(e);
    });

    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.stopDrag());

    // Touch
    this.header.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.btn-close') &&
        !target.closest('.order-details-modal-close-btn') &&
        !target.closes[button] &&
        !target.closes[a]
      ) {
        e.stopPropagation();
        if (e.touches[0]) {
          this.startDrag(e.touches[0]);
        }
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches[0]) {
        e.preventDefault();
        this.drag(e.touches[0]);
      }
    }, { passive: false });
    
    document.addEventListener('touchend', () => this.stopDrag());
  }

  private startDrag(e: MouseEvent | Touch) {
    if (!this.dialog || this.isResizing) return;

    console.log('🔧 Start drag');
    
    this.isDragging = true;

    const rect = this.dialog.getBoundingClientRect();
    this.dragStartX = e.clientX - rect.left;
    this.dragStartY = e.clientY - rect.top;

    this.dialog.style.position = 'fixed';
    this.dialog.style.left = rect.left + 'px';
    this.dialog.style.top = rect.top + 'px';
    this.dialog.style.margin = '0';

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.cursor = 'move';
  }

  private drag(e: MouseEvent | Touch) {
    if (!this.isDragging || !this.dialog) return;

    let newLeft = e.clientX - this.dragStartX;
    let newTop = e.clientY - this.dragStartY;

    const dialogWidth = this.dialog.offsetWidth;
    const dialogHeight = this.dialog.offsetHeight;
    const maxLeft = window.innerWidth - dialogWidth;
    const maxTop = window.innerHeight - dialogHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    this.dialog.style.left = newLeft + 'px';
    this.dialog.style.top = newTop + 'px';
  }

  private stopDrag() {
    if (!this.isDragging) return;

    console.log('🔧 Stop drag');
    
    this.isDragging = false;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    document.body.style.cursor = '';
  }

  public reset() {
    if (!this.dialog) return;

    console.log('🔄 Reset modal');
    
    this.dialog.style.width = '';
    this.dialog.style.height = '';
    this.dialog.style.position = '';
    this.dialog.style.left = '';
    this.dialog.style.top = '';
    this.dialog.style.margin = '';
    this.dialog.style.maxWidth = '';
    this.dialog.style.maxHeight = '';
  }

  public destroy() {
    if (!this.dialog) return;

    console.log('💥 Destroy modal');
    
    const handles = this.dialog.querySelectorAll('.modal-resize-handle');
    handles.forEach((handle) => handle.remove());
  }
}



























