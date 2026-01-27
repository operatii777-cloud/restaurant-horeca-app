(function(){
  try {
    if (document.getElementById('qroms-badge')) return;
    if (document.querySelector('.brand-badge')) return;
    var badge = document.createElement('a');
    badge.id = 'qroms-badge';
    badge.href = 'https://qroms.app';
    badge.target = '_blank';
    badge.rel = 'noopener';
    badge.setAttribute('aria-label', 'Powered by QrOMS');
    var baseStyle = [
      'display:flex','align-items:center','gap:8px',
      'background:rgba(255,255,255,0.95)','backdrop-filter:blur(4px)',
      'border:1px solid rgba(0,0,0,0.08)','border-radius:999px','padding:6px 10px',
      'box-shadow:0 2px 8px rgba(0,0,0,0.12)','mix-blend-mode:normal',
      'color:#0a2540 !important','font-weight:600','text-decoration:none !important','text-shadow:none !important',
      'font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif','font-size:12px','line-height:1'
    ];
    function applyFixed(){
      badge.style.cssText = ['position:fixed','top:10px','right:12px'].concat(baseStyle).join(';');
    }
    function applyInline(){
      badge.style.cssText = ['position:static','margin-left:8px'].concat(baseStyle).join(';');
    }
    var img = document.createElement('img');
    img.src = '/QrOMS.jpg';
    img.alt = 'QrOMS';
    img.style.cssText = 'width:18px;height:18px;object-fit:cover;border-radius:4px;';
    img.onerror = function(){
      // fallback la logo-ul existent în aplicație dacă QrOMS.jpg nu este disponibil
      this.onerror = null;
      this.src = '/Trattoria.jpg';
    };
    var label = document.createElement('span');
    label.textContent = 'Powered by QrOMS';
    label.style.cssText = 'color:#0a2540 !important; text-shadow:none !important; font-weight:600;';
    badge.appendChild(img); badge.appendChild(label);
    var inlineTargets = [
      '.brand-badge-slot',
      '.staff-header-controls',
      '.top-header .header-actions',
      '.header-actions',
      '.admin-header .header-actions',
      '.navigation-bar .header-actions',
      '.top-bar .header-actions',
      '.language-switcher'
    ];
    var placedInline = false;
    for (var i=0;i<inlineTargets.length;i++){
      var t = document.querySelector(inlineTargets[i]);
      if (t){
        applyInline();
        t.appendChild(badge);
        placedInline = true;
        break;
      }
    }
    if (!placedInline){
      applyFixed();
      (document.body || document.documentElement).appendChild(badge);
    }

    // Rezervă spațiu în partea dreapta-sus pentru a evita ca alte elemente să ocupe zona badge-ului
    var reserveStyle = null;
    function ensureReserve(){
      if (reserveStyle || placedInline) return; // nu rezervăm când e inline
      reserveStyle = document.getElementById('qroms-badge-reserve');
      if (!reserveStyle) {
        reserveStyle = document.createElement('style');
        reserveStyle.id = 'qroms-badge-reserve';
        document.head.appendChild(reserveStyle);
      }
      try {
        var rect = badge.getBoundingClientRect();
        var reserve = Math.ceil(rect.width + 16);
        document.documentElement.style.setProperty('--qroms-badge-reserve', reserve + 'px');
        reserveStyle.textContent = [
          'body, header, nav, .top-bar, .navigation-bar, .admin-header, .admin-nav, .header, .toolbar, .user-actions, .header-actions {',
          '  padding-right: var(--qroms-badge-reserve) !important;',
          '}'
        ].join('\n');
      } catch(_){}
    }
    ensureReserve();

    function rectsOverlap(r1, r2, pad){
      var p = pad || 6;
      return !(r2.left > r1.right + p || r2.right < r1.left - p || r2.top > r1.bottom + p || r2.bottom < r1.top - p);
    }
    function avoidOverlap(){
      try {
        var blockers = document.querySelectorAll('.logout-btn, #logoutBtn, button[onclick="logout()"], .lang-switch, .user-actions, .user-menu, .header-actions');
        if (!blockers.length) return;
        // Reset to default first
        badge.style.top = '10px';
        badge.style.right = '12px';
        var b = badge.getBoundingClientRect();
        var maxBottom = 0; var needAdjust = false;
        blockers.forEach(function(el){
          if (!el || !el.offsetParent) return;
          var r = el.getBoundingClientRect();
          // Vizăm elemente din zona dreapta-sus
          var nearTop = r.top < 120; var nearRight = (window.innerWidth - r.right) < 180;
          if (nearTop && nearRight) {
            if (rectsOverlap(b, r, 8)) { needAdjust = true; }
            if (r.bottom > maxBottom) maxBottom = r.bottom;
          }
        });
        if (needAdjust) {
          var newTop = Math.min(maxBottom + 8, 180); // nu coborâm prea mult
          badge.style.top = newTop + 'px';
        }
      } catch(_){}
    }
    // Rulează după layout și pe resize
    setTimeout(function(){ if(!placedInline){ avoidOverlap(); ensureReserve(); } }, 0);
    window.addEventListener('resize', function(){ if(!placedInline){ avoidOverlap(); ensureReserve(); } });
  } catch(e) {}
})();


