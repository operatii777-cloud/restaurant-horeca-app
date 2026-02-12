// Complete translations for admin-vite interface
// Base translations + Tier 1 comprehensive module translations (POS, KIOSK, Orders, Menu, Dashboard, Reservations)

export const translations = {
  ro: {

    // TopBar & Authentication
    auth: {
      login: "Conectare",
      logout: "Deconectare",
      username: "Utilizator",
      password: "Parolă",
      adminLogin: "Conectare Admin",
      invalidCredentials: "Date de autentificare incorecte",
      authError: "Eroare la autentificare",
      poweredBy: "Powered by QrOMS"
    },
    // Navigation & Menu
    nav: {
      dashboard: "Tablou de bord",
      home: "Acasă",
      orders: "Comenzi",
      menu: "Meniu",
      catalog: "Catalog",
      stocks: "Stocuri",
      reports: "Rapoarte",
      settings: "Setări",
      marketing: "Marketing",
      enterprise: "Enterprise",
      management: "Gestiune",
      accounting: "Contabilitate",
      recipes: "Rețete",
      fiscal: "Fiscal",
      audit: "Audit & Security",
      logout: "Deconectare"
    },
    // Common actions
    actions: {
      add: "Adaugă",
      edit: "Editează",
      delete: "Șterge",
      save: "Salvează",
      cancel: "Anulează",
      search: "Caută",
      filter: "Filtrează",
      export: "Exportă",
      import: "Importă",
      refresh: "Reîmprospătează",
      print: "Printează",
      download: "Descarcă",
      upload: "Încarcă",
      view: "Vizualizează",
      close: "Închide",
      back: "Înapoi",
      next: "Următorul",
      previous: "Anterior",
      confirm: "Confirmă",
      submit: "Trimite",
      apply: "Aplică",
      reset: "Resetează",
      select: "Selectează",
      selectAll: "Selectează tot",
      deselectAll: "Deselectează tot",
      clear: "Șterge",
      create: "Creează",
      update: "Actualizează",
      clone: "Clonează",
      duplicate: "Duplică",
      retry: "Reîncearcă"
    },
    // Common labels
    common: {
      name: "Nume",
      description: "Descriere",
      price: "Preț",
      quantity: "Cantitate",
      total: "Total",
      subtotal: "Subtotal",
      date: "Dată",
      time: "Oră",
      status: "Status",
      category: "Categorie",
      type: "Tip",
      image: "Imagine",
      details: "Detalii",
      loading: "Se încarcă...",
      noData: "Nu există date",
      error: "Eroare",
      success: "Succes",
      warning: "Avertisment",
      info: "Informație",
      yes: "Da",
      no: "Nu",
      all: "Toate",
      active: "Activ",
      inactive: "Inactiv",
      enabled: "Activat",
      disabled: "Dezactivat",
      optional: "Opțional",
      required: "Obligatoriu",
      selected: "Selectat",
      filtered: "Filtrate",
      product: "Produs",
      processing: "Se procesează...",
      items: "Articole",
      results: "Rezultate",
      showing: "Afișare",
      of: "din",
      to: "până la",
      per: "pe",
      page: "Pagină",
      perPage: "Pe pagină",
      id: "ID",
      code: "Cod",
      unit: "Unitate",
      stock: "Stoc",
      supplier: "Furnizor",
      cost: "Cost",
      margin: "Marjă",
      vat: "TVA",
      notes: "Notițe",
      actions: "Acțiuni"
    },
    // Admin Main Page
    adminMain: {
      title: "Meniu Principal Admin",
      subtitle: "Selectează o opțiune pentru a continua",
      dashboard: {
        title: "Dashboard",
        description: "Vizualizare generală și statistici"
      },
      catalog: {
        title: "Catalog",
        description: "Gestionare catalog produse"
      },
      menu: {
        title: "Meniu",
        description: "Gestionare meniu restaurant"
      },
      waiters: {
        title: "Chelneri",
        description: "Gestionare personal servire"
      },
      orders: {
        title: "Comenzi",
        description: "Vizualizare și gestionare comenzi"
      },
      reservations: {
        title: "Rezervări",
        description: "Gestionare rezervări mese"
      },
      stocks: {
        title: "Stocuri",
        description: "Gestionare inventar și stocuri"
      },
      analytics: {
        title: "Analiză",
        description: "Rapoarte și analize detaliate"
      },
      dailyOffers: {
        title: "Oferte Zilnice",
        description: "Gestionare meniu zilei și promoții"
      },
      messages: {
        title: "Mesaje",
        description: "Comunicare internă"
      },
      settings: {
        title: "Setări",
        description: "Configurare sistem"
      }
    },
    // Admin Advanced Page
    adminAdvanced: {
      title: "Funcții Avansate",
      subtitle: "Instrumente și rapoarte avansate pentru analiza business-ului",
      filters: {
        all: "Toate",
        analytics: "Analiză",
        operations: "Operațiuni",
        reports: "Rapoarte"
      }
    },
    // Recipes Catalog Page
    recipesCatalog: {
      title: "Catalog Rețete",
      subtitle: "Gestionare și import rețete din catalog",
      tabs: {
        recipes: "Rețete",
        allergens: "Alergeni Referință",
        additives: "Aditivi"
      },
      stats: {
        total: "Total Rețete",
        filtered: "Filtrate",
        selected: "Selectate",
        avgMargin: "Marjă Medie"
      },
      filters: {
        search: "Caută rețetă...",
        industry: "Industrie",
        allergen: "Alergen",
        allIndustries: "Toate industriile",
        allAllergens: "Toți alergenii"
      },
      columns: {
        name: "Nume Rețetă",
        industry: "Industrie",
        allergens: "Alergeni",
        suggestedPrice: "Preț Sugerat",
        costPerPortion: "Cost/Porție",
        margin: "Marjă %",
        actions: "Acțiuni"
      },
      importModal: {
        title: "Import Rețetă",
        price: "Preț de vânzare (RON)",
        imageUrl: "URL Imagine (opțional)",
        customDescription: "Descriere personalizată (opțional)",
        importing: "Import în curs...",
        success: "Rețetă importată cu succes!",
        error: "Eroare la import rețetă"
      },
      bulkImport: {
        confirm: "Confirmare Import în Masă",
        message: "Sigur doriți să importați {count} rețete?",
        progress: "Import în Masă",
        completed: "Finalizat",
        success: "{success} rețete importate cu succes",
        errors: "{errors} erori",
        details: "Detalii import"
      },
      exportCsv: "Export CSV",
      exportSuccess: "CSV exportat cu succes!",
      loading: "Se încarcă rețetele...",
      loadError: "Eroare la încărcarea rețetelor",
      noData: "Nu există rețete disponibile"
    },
    // Ingredients Catalog Page
    ingredientsCatalog: {
      title: "Catalog Ingrediente",
      subtitle: "Gestionare și import ingrediente din catalog",
      tabs: {
        ingredients: "Ingrediente",
        allergens: "Alergeni Referință",
        additives: "Aditivi Referință"
      },
      stats: {
        total: "Total Ingrediente",
        filtered: "Filtrate",
        selected: "Selectate",
        avgWaste: "Deșeu Mediu %"
      },
      filters: {
        search: "Caută ingredient...",
        category: "Categorie",
        allergen: "Alergen",
        allCategories: "Toate categoriile",
        allAllergens: "Toți alergenii",
        noAllergens: "Fără Alergeni"
      },
      columns: {
        name: "Nume Ingredient",
        category: "Categorie",
        allergens: "Alergeni",
        estimatedCost: "Cost Estimat",
        wastePercentage: "Deșeu %",
        actions: "Acțiuni"
      },
      importModal: {
        title: "Import Ingredient",
        cost: "Cost unitar (RON)",
        stock: "Cantitate stoc inițial",
        supplier: "Furnizor (opțional)",
        importing: "Import în curs...",
        success: "Ingredient importat cu succes!",
        error: "Eroare la import ingredient"
      },
      bulkImport: {
        confirm: "Confirmare Import în Masă",
        message: "Sigur doriți să importați {count} ingrediente?",
        progress: "Import în Masă Ingrediente",
        completed: "Finalizat",
        success: "{success} ingrediente importate cu succes",
        errors: "{errors} erori",
        details: "Detalii import"
      },
      exportCsv: "Export CSV",
      exportSuccess: "CSV exportat cu succes!",
      loading: "Se încarcă ingredientele...",
      loadError: "Eroare la încărcarea ingredientelor",
      noData: "Nu există ingrediente disponibile"
    },
    // Confirmation Modal
    confirmModal: {
      warning: "Atenție",
      info: "Informație",
      danger: "Pericol",
      success: "Confirmare"
    },
    // Validation messages
    validation: {
      required: "Acest câmp este obligatoriu",
      invalidNumber: "Introduceți un număr valid",
      positiveNumber: "Numărul trebuie să fie pozitiv",
      invalidEmail: "Introduceți o adresă de email validă",
      minLength: "Minim {min} caractere",
      maxLength: "Maxim {max} caractere"
    },
    
    // ========== TIER 1 MODULES - COMPREHENSIVE TRANSLATIONS ==========

    // ========== POS MODULE ==========
    pos: {
      title: "Punct de Vânzare",
      subtitle: "Sistem POS complet",
      
      // Modes
      modes: {
        dineIn: "La Masă",
        takeaway: "La Pachet",
        delivery: "Livrare",
        driveThru: "Drive-Thru"
      },
      
      // Table selection
      tables: {
        selectTable: "Selectează Masa",
        table: "Masa",
        tables: "Mese",
        floor: "Etaj",
        section: "Secțiune",
        available: "Disponibilă",
        occupied: "Ocupată",
        reserved: "Rezervată",
        noTables: "Nu există mese disponibile",
        openOrder: "Comandă deschisă",
        loading: "Se încarcă mesele...",
        reloadTables: "Reîncarcă mesele",
        errorLoading: "Eroare la încărcarea meselor",
        errorProcessing: "Eroare la procesarea mesei",
        clearSelection: "Șterge selecția"
      },
      
      // Products
      products: {
        title: "Produse",
        search: "Caută produse...",
        category: "Categorie",
        allCategories: "Toate Categoriile",
        addToOrder: "Adaugă la Comandă",
        outOfStock: "Stoc Epuizat",
        price: "Preț",
        priceLabel: "Preț",
        priceTier: "Preț",
        clearSearch: "Șterge căutarea",
        dailyMenu: "Meniul Zilei",
        allergens: "Alergeni",
        total: "Total",
        specialPrice: "Preț Ofertă",
        noDailyMenu: "Nu există meniu al zilei astăzi",
        noSearchResults: "Nu s-au găsit produse pentru căutarea ta",
        noProductsAvailable: "Nu există produse disponibile",
        productUnavailable: "Produs indisponibil",
        stock: "Stoc",
        unavailable: "Indisponibil",
        loadingProducts: "Se încarcă produsele...",
        errorLoading: "Eroare la încărcarea produselor",
        productNotActive: "Produsul nu este activ",
        productOutOfStock: "Produsul nu este în stoc"
      },
      
      // Order
      order: {
        title: "Comandă",
        newOrder: "Comandă Nouă",
        currentOrder: "Comandă Curentă",
        orderNumber: "Nr. Comandă",
        table: "Masă",
        covers: "Persoane",
        items: "Produse",
        subtotal: "Subtotal",
        tax: "TVA",
        vat: "TVA",
        discount: "Discount",
        total: "Total",
        empty: "Coș gol",
        addProducts: "Adaugă produse la comandă",
        clearOrder: "Golește Comanda",
        confirmClear: "Sigur vrei să golești comanda?",
        removeItem: "Elimină Produs",
        quantity: "Cantitate",
        notes: "Observații",
        addNotes: "Adaugă observații...",
        summary: "Sumar Comandă",
        products: "produse",
        noProducts: "Nu există produse în comandă",
        closeAndReleaseTable: "Închide Comandă & Eliberează Masa"
      },
      
      // Payment
      payment: {
        title: "Plată",
        method: "Metodă de Plată",
        methods: {
          cash: "Numerar",
          card: "Card",
          voucher: "Voucher",
          online: "Online",
          account: "Cont",
          protocol: "Protocol",
          degustare: "Degustare",
          other: "Altă metodă"
        },
        amount: "Sumă",
        remaining: "Rămas",
        exact: "Exact",
        received: "Primit",
        change: "Rest",
        tip: "Bacșiș",
        total: "Total de Plată",
        pay: "Plătește",
        split: "Împarte Nota",
        printReceipt: "Printează Bon",
        emailReceipt: "Trimite Email",
        complete: "Finalizează",
        cancel: "Anulează",
        processing: "Se procesează...",
        success: "Plată Efectuată",
        failed: "Plată Eșuată",
        enterAmount: "Introdu suma",
        clearAll: "Șterge tot",
        invalidAmount: "Sumă invalidă",
        amountExceedsRemaining: "Suma depășește rămasul ({remaining} RON)",
        noPayments: "Nu există plăți înregistrate",
        paymentsRecorded: "Plăți efectuate",
        removePayment: "Șterge plată",
        // New keys for PaymentSheet and SplitBill
        orderPayment: "Plata Comanda",
        selectMethod: "Selectează metoda de plată",
        amountCannotBeNegative: "Suma nu poate fi negativă",
        enterAmountGreaterThanZero: "Introdu o sumă mai mare decât 0",
        groupAlreadyPaid: "Acest grup este deja plătit complet",
        noActiveOrder: "Nu există o comandă activă",
        errorAddingPayment: "Eroare la adăugarea plății",
        errorRemovingPayment: "Eroare la ștergerea plății",
        selectGroupForPayment: "Selectează grup pentru plată",
        paid: "Plătit",
        selectedGroupTotal: "Total grup selectat",
        orderTotal: "Total comandă",
        paidAmount: "Plătit",
        remainingToCollect: "Rămas de încasat",
        orderFullyPaid: "Comanda este plătită complet",
        canProceedToFiscalization: "Poți proceda la fiscalizare",
        addPayment: "Adaugă plată",
        applySplit: "Aplică Split",
        close: "Închide",
        continueToFiscalization: "Continuă la fiscalizare",
        // SplitBill specific keys
        person: "Persoana {{number}}",
        byItems: "Pe Articole",
        byAmounts: "Pe Sume",
        groupPersonName: "Nume grup/persoană",
        noItemsAssigned: "Nu sunt articole alocate",
        unassignedItems: "Articole Nealocate",
        totalAssigned: "Total Alocat",
        totalUnassigned: "Total Nealocat",
        difference: "Diferență",
        addGroup: "Adaugă Grup"
      },
      
      // Fiscal
      fiscal: {
        title: "Fiscal",
        printer: "Imprimantă Fiscală",
        printerError: "Eroare Imprimantă",
        anafError: "Eroare ANAF",
        nomenclatorError: "Coduri Fiscale Lipsă",
        genericError: "Eroare Generică",
        reconnect: "Reconectează",
        check: "Verifică Conexiunea",
        printInvoice: "Printează Factură",
        fiscalCode: "Cod Fiscal",
        missingCodes: "Coduri Lipsă",
        fiscalizing: "Se fiscalizează...",
        fiscalizeOrder: "Fiscalizează Comandă",
        fiscalized: "Fiscalizat",
        updatingStock: "Actualizare stoc...",
        stockBeingUpdated: "Se actualizează stocul...",
        stockUpdated: "Stoc actualizat",
        fiscalReceipt: "Bon Fiscal",
        date: "Data",
        retrying: "Se reîncearcă...",
        retryPrint: "Retrimite Print",
        retryAnaf: "Retrimite ANAF"
      },
      
      // Customer
      customer: {
        title: "Client",
        name: "Nume Client",
        phone: "Telefon",
        email: "Email",
        address: "Adresă",
        notes: "Observații",
        searchCustomer: "Caută client...",
        newCustomer: "Client Nou",
        selectCustomer: "Selectează Client",
        loyaltyPoints: "Puncte Fidelitate"
      },
      
      // Offline
      offline: {
        title: "Mod Offline",
        warning: "Nu există conexiune la internet",
        ordersSaved: "Comenzile sunt salvate local",
        willSync: "Se vor sincroniza când conexiunea revine",
        syncNow: "Sincronizează Acum",
        pendingOrders: "Comenzi în Așteptare"
      },
      
      // Messages
      messages: {
        orderCreated: "Comandă creată cu succes",
        orderUpdated: "Comandă actualizată",
        orderDeleted: "Comandă ștearsă",
        paymentSuccess: "Plata a fost procesată cu succes",
        paymentFailed: "Plata a eșuat",
        printerConnected: "Imprimantă conectată",
        printerDisconnected: "Imprimantă deconectată",
        selectTable: "Selectează o masă",
        selectProducts: "Adaugă produse la comandă",
        confirmDelete: "Sigur vrei să ștergi această comandă?"
      }
    },
    
    // ========== KIOSK MODULE ==========
    kiosk: {
      title: "Chioșc Auto-Servire",
      subtitle: "Comandă la chioșc",
      
      // Welcome
      welcome: {
        title: "Bun Venit!",
        subtitle: "Atinge ecranul pentru a începe",
        startOrder: "Începe Comanda",
        scanQr: "Scanează QR Code",
        chooseLanguage: "Alege Limba"
      },
      
      // Menu
      menu: {
        title: "Meniu",
        categories: "Categorii",
        popular: "Populare",
        new: "Noutăți",
        deals: "Oferte",
        search: "Caută...",
        filter: "Filtrează",
        viewAll: "Vezi Tot"
      },
      
      // Product
      product: {
        details: "Detalii Produs",
        ingredients: "Ingrediente",
        allergens: "Alergeni",
        nutrition: "Informații Nutriționale",
        calories: "Calorii",
        addToCart: "Adaugă în Coș",
        customize: "Personalizează",
        extras: "Extra",
        remove: "Elimină",
        quantity: "Cantitate",
        size: {
          small: "Mic",
          medium: "Mediu",
          large: "Mare"
        }
      },
      
      // Cart
      cart: {
        title: "Coșul Tău",
        empty: "Coșul este gol",
        items: "Produse",
        subtotal: "Subtotal",
        tax: "TVA",
        total: "Total",
        checkout: "Plătește",
        continueShopping: "Continuă Cumpărăturile",
        clear: "Golește Coșul",
        modify: "Modifică"
      },
      
      // Checkout
      checkout: {
        title: "Finalizare Comandă",
        orderType: "Tip Comandă",
        dineIn: "Aici",
        takeaway: "La Pachet",
        tableNumber: "Număr Masă",
        name: "Nume",
        phone: "Telefon",
        email: "Email",
        paymentMethod: "Metodă Plată",
        payNow: "Plătește Acum",
        payAtCounter: "Plătește la Casă",
        confirmOrder: "Confirmă Comanda",
        processing: "Se procesează..."
      },
      
      // Payment
      payment: {
        title: "Plată",
        insertCard: "Introdu Cardul",
        tapCard: "Apropie Cardul",
        enterPin: "Introdu PIN-ul",
        processing: "Se procesează plata...",
        approved: "Plată Aprobată",
        declined: "Plată Refuzată",
        tryAgain: "Încearcă Din Nou",
        cancel: "Anulează",
        receipt: "Bon Fiscal",
        print: "Printează",
        email: "Trimite Email"
      },
      
      // Confirmation
      confirmation: {
        title: "Comanda Confirmată!",
        orderNumber: "Număr Comandă",
        thankyou: "Mulțumim!",
        estimatedTime: "Timp Estimat",
        minutes: "minute",
        trackOrder: "Urmărește Comanda",
        newOrder: "Comandă Nouă",
        printReceipt: "Printează Bon"
      },
      
      // Messages
      messages: {
        selectCategory: "Selectează o categorie",
        addItems: "Adaugă produse în coș",
        minimumOrder: "Comandă minimă",
        sessionTimeout: "Sesiunea expiră în",
        returning: "Revenire la ecranul principal..."
      }
    },
    
    // ========== ORDERS MODULE ==========
    orders: {
      title: "Comenzi",
      subtitle: "Gestiune comenzi",
      
      // Status
      status: {
        all: "Toate",
        pending: "În Așteptare",
        confirmed: "Confirmate",
        preparing: "În Preparare",
        ready: "Gata",
        delivered: "Livrate",
        completed: "Finalizate",
        cancelled: "Anulate",
        failed: "Eșuate"
      },
      
      // Types
      types: {
        all: "Toate",
        dineIn: "La Masă",
        takeaway: "La Pachet",
        delivery: "Livrare",
        driveThru: "Drive-Thru",
        online: "Online",
        phone: "Telefon"
      },
      
      // List
      list: {
        title: "Listă Comenzi",
        search: "Caută comenzi...",
        filter: "Filtrează",
        sort: "Sortează",
        orderNumber: "Nr. Comandă",
        customer: "Client",
        table: "Masă",
        items: "Produse",
        total: "Total",
        time: "Oră",
        status: "Status",
        actions: "Acțiuni",
        noOrders: "Nu există comenzi"
      },
      
      // Details
      details: {
        title: "Detalii Comandă",
        orderInfo: "Informații Comandă",
        customerInfo: "Informații Client",
        items: "Produse Comandate",
        product: "Produs",
        quantity: "Cantitate",
        price: "Preț",
        subtotal: "Subtotal",
        total: "Total",
        tax: "TVA",
        discount: "Discount",
        notes: "Observații",
        timeline: "Istoric",
        print: "Printează",
        email: "Trimite Email"
      },
      
      // Actions
      actions: {
        confirm: "Confirmă",
        prepare: "Începe Prepararea",
        ready: "Marchează Gata",
        deliver: "Livrează",
        complete: "Finalizează",
        cancel: "Anulează",
        edit: "Editează",
        duplicate: "Duplică",
        refund: "Rambursare",
        printKitchen: "Printează Bucătărie",
        printReceipt: "Printează Bon"
      },
      
      // Takeaway
      takeaway: {
        title: "Comenzi La Pachet",
        newOrder: "Comandă Nouă",
        pickupTime: "Ora Ridicare",
        customerName: "Nume Client",
        customerPhone: "Telefon Client",
        estimatedTime: "Timp Estimat",
        readyAt: "Gata La",
        pickedUp: "Ridicată",
        notPickedUp: "Neridicată"
      },
      
      // Analytics
      analytics: {
        title: "Analiză Comenzi",
        todayOrders: "Comenzi Azi",
        revenue: "Venituri",
        avgOrderValue: "Valoare Medie Comandă",
        topProducts: "Produse Populare",
        byHour: "Pe Ore",
        byDay: "Pe Zile",
        byType: "Pe Tipuri",
        chart: "Grafic"
      },
      
      // Archive
      archive: {
        title: "Arhivă Comenzi",
        dateRange: "Interval Date",
        searchArchive: "Caută în arhivă...",
        exportData: "Exportă Date",
        restore: "Restaurează"
      },
      
      // Messages
      messages: {
        orderConfirmed: "Comandă confirmată",
        orderCancelled: "Comandă anulată",
        orderCompleted: "Comandă finalizată",
        statusUpdated: "Status actualizat",
        confirmCancel: "Sigur vrei să anulezi această comandă?",
        cannotModify: "Comanda nu poate fi modificată",
        printSuccess: "Printat cu succes",
        printFailed: "Printare eșuată"
      }
    },
    
    // ========== MENU MODULE ==========
    menu: {
      title: "Meniu",
      subtitle: "Gestiune meniu",
      
      // Categories
      categories: {
        title: "Categorii",
        add: "Adaugă Categorie",
        edit: "Editează Categorie",
        delete: "Șterge Categorie",
        name: "Nume Categorie",
        description: "Descriere",
        icon: "Iconiță",
        order: "Ordine",
        active: "Activ",
        products: "Produse",
        noCategories: "Nu există categorii"
      },
      
      // Products
      products: {
        title: "Produse",
        add: "Adaugă Produs",
        edit: "Editează Produs",
        delete: "Șterge Produs",
        name: "Nume Produs",
        description: "Descriere",
        category: "Categorie",
        price: "Preț",
        cost: "Cost",
        margin: "Marjă",
        image: "Imagine",
        sku: "SKU",
        barcode: "Cod de Bare",
        stock: "Stoc",
        available: "Disponibil",
        outOfStock: "Stoc Epuizat",
        active: "Activ",
        inactive: "Inactiv",
        noProducts: "Nu există produse",
        search: "Caută produse..."
      },
      
      // Variants
      variants: {
        title: "Variante",
        add: "Adaugă Variantă",
        size: "Mărime",
        color: "Culoare",
        price: "Preț",
        sku: "SKU",
        stock: "Stoc"
      },
      
      // Modifiers
      modifiers: {
        title: "Modificatori",
        add: "Adaugă Modificator",
        group: "Grup Modificatori",
        name: "Nume",
        price: "Preț Adițional",
        required: "Obligatoriu",
        multiple: "Selecție Multiplă",
        min: "Minim",
        max: "Maxim"
      },
      
      // Pricing
      pricing: {
        title: "Prețuri",
        basePrice: "Preț de Bază",
        costPrice: "Preț Cost",
        salePrice: "Preț Vânzare",
        margin: "Marjă",
        marginPercent: "Marjă %",
        tax: "TVA",
        taxIncluded: "TVA Inclus",
        priceHistory: "Istoric Prețuri",
        bulkUpdate: "Actualizare în Masă"
      },
      
      // Import/Export
      importExport: {
        title: "Import/Export",
        import: "Importă",
        export: "Exportă",
        template: "Șablon",
        download: "Descarcă Șablon",
        upload: "Încarcă Fișier",
        format: "Format",
        csv: "CSV",
        excel: "Excel",
        json: "JSON"
      },
      
      // Messages
      messages: {
        productAdded: "Produs adăugat",
        productUpdated: "Produs actualizat",
        productDeleted: "Produs șters",
        categoryAdded: "Categorie adăugată",
        categoryUpdated: "Categorie actualizată",
        categoryDeleted: "Categorie ștearsă",
        confirmDelete: "Sigur vrei să ștergi?",
        priceUpdated: "Preț actualizat",
        stockUpdated: "Stoc actualizat",
        imageUploaded: "Imagine încărcată",
        imageUploadFailed: "Încărcare imagine eșuată"
      }
    },
    
    // ========== DASHBOARD MODULE ==========
    dashboard: {
      title: "Tablou de Bord",
      subtitle: "Prezentare generală",
      
      // Overview
      overview: {
        title: "Prezentare Generală",
        today: "Azi",
        yesterday: "Ieri",
        thisWeek: "Săptămâna Aceasta",
        lastWeek: "Săptămâna Trecută",
        thisMonth: "Luna Aceasta",
        lastMonth: "Luna Trecută",
        compare: "Compară"
      },
      
      // Metrics
      metrics: {
        revenue: "Venituri",
        orders: "Comenzi",
        customers: "Clienți",
        avgOrder: "Comandă Medie",
        sales: "Vânzări",
        profit: "Profit",
        margin: "Marjă",
        growth: "Creștere",
        change: "Schimbare",
        vs: "vs",
        revenueToday: "Venituri Astăzi",
        ordersToday: "Comenzi Astăzi",
        profitToday: "Profit Astăzi",
        cogsToday: "COGS Astăzi",
        cogsDescription: "Cost ingrediente vândute",
        marginLabel: "Marjă",
        vsYesterday: "față de ieri",
        salesToday: "Vânzări Astăzi",
        estimatedProfit: "Profit Estimat",
        criticalStock: "Stocuri Critice",
        warnings: "avertismente"
      },
      
      // KPI Business
      kpi: {
        loading: "Se încarcă KPI-urile business...",
        error: "Eroare la încărcarea KPI-urilor:",
        stockAlerts: "Alerte Stoc",
        lowStockProducts: "Produse sub minim stoc",
        customerRetention: "Retenție Clienți",
        returningCustomers: "Clienți care revin",
        tableRotation: "Rotație Mese",
        groupsPerTable: "Grupuri per masă ocupată",
        tableUtilization: "Utilizare Mese",
        tablesUsed: "Mese folosite din 200",
        overallRating: "Rating Mediu OVERALL",
        overallRatings: "evaluări (overall)",
        excellentRatings: "Rating-uri 5★ (OVERALL)",
        veryHappyCustomers: "Clienți foarte mulțumiți",
        lowRatings: "Rating-uri ≤2★ (OVERALL)",
        needsAttention: "Necesită atenție urgentă",
        revenueChart: "Evoluție Venituri & Marjă Brută (Ultimele 7 zile)",
        revenueLabel: "Venituri (RON)",
        grossMargin: "Marjă Brută (%)",
        revenueTooltip: "Venituri:",
        marginTooltip: "Marjă:",
        top5Products: "Top 5 Produse Astăzi",
        product: "Produs",
        quantity: "Cantitate",
        revenue: "Venit",
        percentage: "%",
        noData: "Nu există date disponibile",
        topProductsDistribution: "Top Produse - Distribuție Venituri",
        revenueRon: "Venit (RON)"
      },
      
      // Charts
      charts: {
        salesOverTime: "Vânzări în Timp",
        ordersByType: "Comenzi pe Tipuri",
        topProducts: "Produse Populare",
        revenueByCategory: "Venituri pe Categorii",
        hourlyActivity: "Activitate pe Ore",
        dailyActivity: "Activitate Zilnică",
        weeklyTrend: "Trend Săptămânal",
        monthlyTrend: "Trend Lunar",
        dailySalesPerPlatform: "Vânzări Zilnice per Platformă",
        salesPerPlatformToday: "Vânzări per Platformă (Astăzi)",
        top10Products: "Top 10 Produse Vândute",
        cancellationRatePerPlatform: "Rată Anulare per Platformă"
      },
      
      // Widgets
      widgets: {
        liveOrders: "Comenzi Live",
        recentActivity: "Activitate Recentă",
        alerts: "Alerte",
        notifications: "Notificări",
        tasks: "Sarcini",
        quickActions: "Acțiuni Rapide",
        performance: "Performanță"
      },
      
      // Filters
      filters: {
        dateRange: "Interval Date",
        location: "Locație",
        category: "Categorie",
        paymentMethod: "Metodă Plată",
        orderType: "Tip Comandă",
        apply: "Aplică Filtre",
        reset: "Resetează Filtre",
        from: "De la",
        to: "Până la",
        date: "Data"
      },
      
      // PIN Rotation (DashboardPage)
      pinRotation: {
        title: "Audit rotație PIN-uri",
        subtitle: "Monitorizare automată Admin · POS · KDS",
        interface: "Interfață",
        category: "Categorie",
        status: "Status",
        lastRotation: "Ultima rotație",
        summary: "Sumar",
        errorLoading: "Nu am putut încărca statusurile PIN:",
        retry: "Reîncearcă",
        updating: "Se actualizează statusurile PIN...",
        filterPlaceholder: "Filtrează după interfață, categorie sau status",
        urgentRotations: "Rotații urgente",
        noUrgentRotations: "Nicio rotație urgentă identificată în acest moment."
      },
      
      // Monitoring
      monitoring: {
        title: "Dashboard Monitorizare și Performanță",
        refresh: "Reîncarcă",
        tabOverview: "Prezentare Generală",
        tabQueue: "Monitor Coadă",
        tabPerformance: "Performance Metrics",
        systemMetrics: "Metrici Sistem",
        responseTime: "Timp de Răspuns:",
        activeConnections: "Conexiuni Active:",
        memoryUsage: "Utilizare Memorie:",
        orderMetrics: "Metrici Comenzi",
        avgPrepTime: "Timp Mediu Preparare:",
        delayedOrders: "Comenzi Întârziate",
        kitchenLoad: "Încărcare Bucătărie",
        barLoad: "Încărcare Bar",
        alertsTitle: "Alerte",
        delayedOrdersAlert: "{count} comenzi întârziate necesită atenție!",
        kitchenLoadAlert: "Bucătăria este încărcată ({count} comenzi)",
        allOk: "Totul funcționează normal",
        loading: "Se încarcă...",
        performanceMetrics: "Metrici Performanță",
        systemPerformance: "Performanță Sistem",
        heapUsed: "Memorie Heap Utilizată:",
        heapTotal: "Memorie Heap Totală:",
        orderPerformance: "Performanță Comenzi",
        loadingMetrics: "Se încarcă metrici..."
      },
      
      // Executive Dashboard
      executive: {
        title: "Dashboard Executive",
        subtitle: "KPI-uri critice pentru management",
        loading: "Se încarcă...",
        error: "Eroare",
        retry: "Reîncearcă",
        todaySales: "Vânzări Astăzi",
        todayOrders: "Comenzi astăzi",
        updateData: "Actualizează datele",
        updating: "Se actualizează...",
        criticalStockTable: "Stocuri Critice",
        noCriticalStock: "Nu există stocuri critice",
        ingredient: "Ingredient",
        stock: "Stoc",
        minimum: "Minim",
        unit: "Unit.",
        pendingOrders: "Comenzi în așteptare",
        noPendingOrders: "Nu există comenzi în așteptare",
        orderId: "ID",
        platform: "Platformă",
        waiting: "Așteptare",
        total: "Total",
        platformMobileApp: "Aplicația Mobilă",
        platformPOS: "POS Restaurant",
        platformKIOSK: "KIOSK Self-Service",
        platformPhone: "Telefon"
      },
      
      // Hostess Dashboard
      hostess: {
        title: "📊 Hostess Dashboard",
        subtitle: "Analytics ocupare mese și sesiuni",
        totalSessions: "Total Sesiuni",
        totalCovers: "Total Covers",
        avgDuration: "Durată Medie (min)",
        coversPerSession: "Covers / Sesiune",
        zoneDistribution: "Distribuție pe zone",
        sessionsPerHour: "Sesiuni pe Oră (zi aleasă)",
        sessions: "Sesiuni",
        covers: "Covers",
        selectDay: "Zi pentru grafic orar"
      },
      
      // Coatroom Dashboard
      coatroom: {
        title: "📊 Coatroom Dashboard",
        subtitle: "Analytics tichete garderobă și valet",
        totalTickets: "Total Tichete",
        open: "Deschise",
        closed: "Închise",
        lost: "Pierdute",
        ticketsPerHour: "Tichete pe oră",
        statusDistribution: "Distribuție status",
        tickets: "Tichete"
      },
      
      // Lost & Found Dashboard
      lostFound: {
        title: "📊 Lost & Found Dashboard",
        subtitle: "Analytics obiecte găsite și pierdute",
        totalItems: "Total Obiecte",
        stored: "În depozit",
        returned: "Returnate",
        returnRate: "Rată returnare",
        itemsByLocation: "Obiecte pe locații",
        itemStatus: "Status Obiecte",
        items: "Obiecte",
        inStorage: "În Depozit",
        returnedStatus: "Returnate",
        disposed: "Eliminate"
      }
    },
    
    // ========== RESERVATIONS MODULE ==========
    reservations: {
      title: "Rezervări",
      subtitle: "Gestiune rezervări",
      
      // Status
      status: {
        all: "Toate",
        pending: "În Așteptare",
        confirmed: "Confirmate",
        seated: "Așezați",
        completed: "Finalizate",
        cancelled: "Anulate",
        noShow: "Nu S-au Prezentat"
      },
      
      // List
      list: {
        title: "Listă Rezervări",
        search: "Caută rezervări...",
        filter: "Filtrează",
        today: "Astăzi",
        upcoming: "Viitoare",
        past: "Anterioare",
        date: "Dată",
        time: "Oră",
        customer: "Client",
        guests: "Persoane",
        table: "Masă",
        status: "Status",
        actions: "Acțiuni",
        noReservations: "Nu există rezervări"
      },
      
      // Filters
      filters: {
        from: "De la",
        to: "Până la",
        next7Days: "Următoarele 7 zile",
        searchPlaceholder: "Caută după client, telefon, email sau cod",
        includeCancelled: "Include anulările",
        exportCsv: "Export CSV"
      },
      
      // New Reservation
      new: {
        title: "Rezervare Nouă",
        customer: "Client",
        date: "Dată",
        time: "Oră",
        guests: "Număr Persoane",
        duration: "Durată",
        table: "Masă",
        autoAssign: "Alocare Automată",
        notes: "Observații",
        specialRequests: "Cerințe Speciale",
        occasion: "Ocazie",
        create: "Creează Rezervare",
        cancel: "Anulează"
      },
      
      // Modal
      modal: {
        edit: "Editează rezervarea",
        table: "Masă",
        fullNamePlaceholder: "Nume complet",
        phonePlaceholder: "07xx xxx xxx",
        emailPlaceholder: "client@email.com",
        duration: "Durată (minute)",
        persons: "pers.",
        selectTable: "Selectează masa",
        occupied: "ocupată",
        checkingAvailability: "Se verifică disponibilitatea meselor...",
        errorLoadingTables: "Eroare la încărcarea meselor",
        customerNotes: "Note client",
        customerNotesPlaceholder: "Preferințe, alergii, cereri speciale",
        internalNotes: "Note interne",
        internalNotesPlaceholder: "Instrucțiuni pentru staff, notificări către host",
        saving: "Se salvează...",
        saveChanges: "Salvează modificările",
        errorSaving: "Nu am putut salva rezervarea"
      },
      
      // Calendar
      calendar: {
        title: "Calendar Rezervări",
        day: "Zi",
        week: "Săptămână",
        month: "Lună",
        timeline: "Timeline",
        today: "Astăzi",
        next: "Următoarea",
        previous: "Anterior",
        slot: "Interval",
        available: "Disponibil",
        booked: "Rezervat",
        blocked: "Blocat"
      },
      
      // Tables
      tables: {
        title: "Gestiune Mese",
        tableNumber: "Număr Masă",
        capacity: "Capacitate",
        section: "Secțiune",
        floor: "Etaj",
        available: "Disponibilă",
        occupied: "Ocupată",
        reserved: "Rezervată",
        blocked: "Blocată",
        combine: "Combină Mese",
        split: "Separă Mese"
      },
      
      // Customer
      customer: {
        name: "Nume",
        phone: "Telefon",
        email: "Email",
        vip: "VIP",
        notes: "Note despre Client",
        preferences: "Preferințe",
        allergies: "Alergii",
        history: "Istoric Rezervări",
        visits: "Vizite",
        lastVisit: "Ultima Vizită"
      },
      
      // Actions
      actions: {
        confirm: "Confirmă",
        seat: "Așează",
        complete: "Finalizează",
        cancel: "Anulează",
        noShow: "Nu S-a Prezentat",
        edit: "Editează",
        reschedule: "Reprogramează",
        sendReminder: "Trimite Memento",
        printConfirmation: "Printează Confirmare"
      },
      
      // Messages
      messages: {
        reservationCreated: "Rezervare creată",
        reservationUpdated: "Rezervare actualizată",
        reservationCancelled: "Rezervare anulată",
        reservationConfirmed: "Rezervare confirmată",
        tableAssigned: "Masă alocată",
        reminderSent: "Memento trimis",
        confirmCancel: "Sigur vrei să anulezi această rezervare?",
        noTablesAvailable: "Nu există mese disponibile",
        alreadyBooked: "Intervalul este deja rezervat"
      },
      
      // Timeline
      timeline: {
        title: "Timeline rezervare",
        loading: "Se încarcă istoricul evenimentelor...",
        errorLoading: "Nu am putut încărca timeline-ul",
        noEvents: "Nu există evenimente înregistrate pentru această rezervare",
        operatedBy: "Operat de",
        systemOperation: "Operat din sistem"
      },
      
      // Page
      page: {
        title: "Gestionare Rezervări",
        subtitle: "Planifică, confirmă și urmărește rezervările din restaurant",
        refreshData: "Reîmprospătează datele",
        reservationsToday: "Rezervări Astăzi",
        totalScheduledToday: "Total programate pentru azi",
        confirmed: "Confirmate",
        cancelled: "Anulate",
        selectedInterval: "Interval selectat",
        includesNoShow: "Include no-show",
        occupancyRate: "Grad Ocupare",
        tablesToday: "mese astăzi",
        capacity: "Capacitate",
        markCompleted: "Marchează finalizat",
        sendReminder: "Trimite reminder",
        confirmationCode: "Cod Confirmare",
        dateTime: "Data & Oră",
        notSet: "Nesetat"
      }
    }
  },
  en: {

    // TopBar & Authentication
    auth: {
      login: "Login",
      logout: "Logout",
      username: "Username",
      password: "Password",
      adminLogin: "Admin Login",
      invalidCredentials: "Invalid credentials",
      authError: "Authentication error",
      poweredBy: "Powered by QrOMS"
    },
    // Navigation & Menu
    nav: {
      dashboard: "Dashboard",
      home: "Home",
      orders: "Orders",
      menu: "Menu",
      catalog: "Catalog",
      stocks: "Stocks",
      reports: "Reports",
      settings: "Settings",
      marketing: "Marketing",
      enterprise: "Enterprise",
      management: "Management",
      accounting: "Accounting",
      recipes: "Recipes",
      fiscal: "Fiscal",
      audit: "Audit & Security",
      logout: "Logout"
    },
    // Common actions
    actions: {
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      search: "Search",
      filter: "Filter",
      export: "Export",
      import: "Import",
      refresh: "Refresh",
      print: "Print",
      download: "Download",
      upload: "Upload",
      view: "View",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      confirm: "Confirm",
      submit: "Submit",
      apply: "Apply",
      reset: "Reset",
      select: "Select",
      selectAll: "Select All",
      deselectAll: "Deselect All",
      clear: "Clear",
      create: "Create",
      update: "Update",
      clone: "Clone",
      duplicate: "Duplicate",
      retry: "Retry"
    },
    // Common labels
    common: {
      name: "Name",
      description: "Description",
      price: "Price",
      quantity: "Quantity",
      total: "Total",
      subtotal: "Subtotal",
      date: "Date",
      time: "Time",
      status: "Status",
      category: "Category",
      type: "Type",
      image: "Image",
      details: "Details",
      loading: "Loading...",
      noData: "No data available",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Information",
      yes: "Yes",
      no: "No",
      all: "All",
      active: "Active",
      inactive: "Inactive",
      enabled: "Enabled",
      disabled: "Disabled",
      optional: "Optional",
      required: "Required",
      selected: "Selected",
      filtered: "Filtered",
      product: "Product",
      processing: "Processing...",
      items: "Items",
      results: "Results",
      showing: "Showing",
      of: "of",
      to: "to",
      per: "per",
      page: "Page",
      perPage: "Per Page",
      id: "ID",
      code: "Code",
      unit: "Unit",
      stock: "Stock",
      supplier: "Supplier",
      cost: "Cost",
      margin: "Margin",
      vat: "VAT",
      notes: "Notes",
      actions: "Actions"
    },
    // Admin Main Page
    adminMain: {
      title: "Main Admin Menu",
      subtitle: "Select an option to continue",
      dashboard: {
        title: "Dashboard",
        description: "Overview and statistics"
      },
      catalog: {
        title: "Catalog",
        description: "Product catalog management"
      },
      menu: {
        title: "Menu",
        description: "Restaurant menu management"
      },
      waiters: {
        title: "Waiters",
        description: "Service staff management"
      },
      orders: {
        title: "Orders",
        description: "View and manage orders"
      },
      reservations: {
        title: "Reservations",
        description: "Table reservation management"
      },
      stocks: {
        title: "Stocks",
        description: "Inventory and stock management"
      },
      analytics: {
        title: "Analytics",
        description: "Detailed reports and analysis"
      },
      dailyOffers: {
        title: "Daily Offers",
        description: "Daily menu and promotions management"
      },
      messages: {
        title: "Messages",
        description: "Internal communication"
      },
      settings: {
        title: "Settings",
        description: "System configuration"
      }
    },
    // Admin Advanced Page
    adminAdvanced: {
      title: "Advanced Features",
      subtitle: "Advanced tools and reports for business analysis",
      filters: {
        all: "All",
        analytics: "Analytics",
        operations: "Operations",
        reports: "Reports"
      }
    },
    // Recipes Catalog Page
    recipesCatalog: {
      title: "Recipes Catalog",
      subtitle: "Manage and import recipes from catalog",
      tabs: {
        recipes: "Recipes",
        allergens: "Allergens Reference",
        additives: "Additives"
      },
      stats: {
        total: "Total Recipes",
        filtered: "Filtered",
        selected: "Selected",
        avgMargin: "Avg Margin"
      },
      filters: {
        search: "Search recipe...",
        industry: "Industry",
        allergen: "Allergen",
        allIndustries: "All industries",
        allAllergens: "All allergens"
      },
      columns: {
        name: "Recipe Name",
        industry: "Industry",
        allergens: "Allergens",
        suggestedPrice: "Suggested Price",
        costPerPortion: "Cost/Portion",
        margin: "Margin %",
        actions: "Actions"
      },
      importModal: {
        title: "Import Recipe",
        price: "Sale price (RON)",
        imageUrl: "Image URL (optional)",
        customDescription: "Custom description (optional)",
        importing: "Importing...",
        success: "Recipe imported successfully!",
        error: "Error importing recipe"
      },
      bulkImport: {
        confirm: "Confirm Bulk Import",
        message: "Are you sure you want to import {count} recipes?",
        progress: "Bulk Import",
        completed: "Completed",
        success: "{success} recipes imported successfully",
        errors: "{errors} errors",
        details: "Import details"
      },
      exportCsv: "Export CSV",
      exportSuccess: "CSV exported successfully!",
      loading: "Loading recipes...",
      loadError: "Error loading recipes",
      noData: "No recipes available"
    },
    // Ingredients Catalog Page
    ingredientsCatalog: {
      title: "Ingredients Catalog",
      subtitle: "Manage and import ingredients from catalog",
      tabs: {
        ingredients: "Ingredients",
        allergens: "Allergens Reference",
        additives: "Additives Reference"
      },
      stats: {
        total: "Total Ingredients",
        filtered: "Filtered",
        selected: "Selected",
        avgWaste: "Avg Waste %"
      },
      filters: {
        search: "Search ingredient...",
        category: "Category",
        allergen: "Allergen",
        allCategories: "All categories",
        allAllergens: "All allergens",
        noAllergens: "No Allergens"
      },
      columns: {
        name: "Ingredient Name",
        category: "Category",
        allergens: "Allergens",
        estimatedCost: "Estimated Cost",
        wastePercentage: "Waste %",
        actions: "Actions"
      },
      importModal: {
        title: "Import Ingredient",
        cost: "Unit cost (RON)",
        stock: "Initial stock quantity",
        supplier: "Supplier (optional)",
        importing: "Importing...",
        success: "Ingredient imported successfully!",
        error: "Error importing ingredient"
      },
      bulkImport: {
        confirm: "Confirm Bulk Import",
        message: "Are you sure you want to import {count} ingredients?",
        progress: "Bulk Import Ingredients",
        completed: "Completed",
        success: "{success} ingredients imported successfully",
        errors: "{errors} errors",
        details: "Import details"
      },
      exportCsv: "Export CSV",
      exportSuccess: "CSV exported successfully!",
      loading: "Loading ingredients...",
      loadError: "Error loading ingredients",
      noData: "No ingredients available"
    },
    // Confirmation Modal
    confirmModal: {
      warning: "Warning",
      info: "Information",
      danger: "Danger",
      success: "Confirmation"
    },
    // Validation messages
    validation: {
      required: "This field is required",
      invalidNumber: "Please enter a valid number",
      positiveNumber: "Number must be positive",
      invalidEmail: "Please enter a valid email address",
      minLength: "Minimum {min} characters",
      maxLength: "Maximum {max} characters"
    },
    
    // ========== TIER 1 MODULES - COMPREHENSIVE TRANSLATIONS ==========

    // ========== POS MODULE ==========
    pos: {
      title: "Point of Sale",
      subtitle: "Complete POS system",
      
      // Modes
      modes: {
        dineIn: "Dine In",
        takeaway: "Takeaway",
        delivery: "Delivery",
        driveThru: "Drive-Thru"
      },
      
      // Table selection
      tables: {
        selectTable: "Select Table",
        table: "Table",
        tables: "Tables",
        floor: "Floor",
        section: "Section",
        available: "Available",
        occupied: "Occupied",
        reserved: "Reserved",
        noTables: "No tables available",
        openOrder: "Open order",
        loading: "Loading tables...",
        reloadTables: "Reload tables",
        errorLoading: "Error loading tables",
        errorProcessing: "Error processing table",
        clearSelection: "Clear selection"
      },
      
      // Products
      products: {
        title: "Products",
        search: "Search products...",
        category: "Category",
        allCategories: "All Categories",
        addToOrder: "Add to Order",
        outOfStock: "Out of Stock",
        price: "Price",
        priceLabel: "Price",
        priceTier: "Price",
        clearSearch: "Clear search",
        dailyMenu: "Daily Menu",
        allergens: "Allergens",
        total: "Total",
        specialPrice: "Special Price",
        noDailyMenu: "No daily menu available today",
        noSearchResults: "No products found for your search",
        noProductsAvailable: "No products available",
        productUnavailable: "Product unavailable",
        stock: "Stock",
        unavailable: "Unavailable",
        loadingProducts: "Loading products...",
        errorLoading: "Error loading products",
        productNotActive: "Product is not active",
        productOutOfStock: "Product is out of stock"
      },
      
      // Order
      order: {
        title: "Order",
        newOrder: "New Order",
        currentOrder: "Current Order",
        orderNumber: "Order No.",
        table: "Table",
        covers: "Covers",
        items: "Items",
        subtotal: "Subtotal",
        tax: "Tax",
        vat: "VAT",
        discount: "Discount",
        total: "Total",
        empty: "Cart empty",
        addProducts: "Add products to order",
        clearOrder: "Clear Order",
        confirmClear: "Are you sure you want to clear the order?",
        removeItem: "Remove Item",
        quantity: "Quantity",
        notes: "Notes",
        addNotes: "Add notes...",
        summary: "Order Summary",
        products: "products",
        noProducts: "No products in order",
        closeAndReleaseTable: "Close Order & Release Table"
      },
      
      // Payment
      payment: {
        title: "Payment",
        method: "Payment Method",
        methods: {
          cash: "Cash",
          card: "Card",
          voucher: "Voucher",
          online: "Online",
          account: "Account",
          protocol: "Protocol",
          degustare: "Tasting",
          other: "Other method"
        },
        amount: "Amount",
        remaining: "Remaining",
        exact: "Exact",
        received: "Received",
        change: "Change",
        tip: "Tip",
        total: "Total Payment",
        pay: "Pay",
        split: "Split Bill",
        printReceipt: "Print Receipt",
        emailReceipt: "Email Receipt",
        complete: "Complete",
        cancel: "Cancel",
        processing: "Processing...",
        success: "Payment Successful",
        failed: "Payment Failed",
        enterAmount: "Enter amount",
        clearAll: "Clear all",
        invalidAmount: "Invalid amount",
        amountExceedsRemaining: "Amount exceeds remaining ({remaining} RON)",
        noPayments: "No payments recorded",
        paymentsRecorded: "Payments recorded",
        removePayment: "Remove payment",
        // New keys for PaymentSheet and SplitBill
        orderPayment: "Order Payment",
        selectMethod: "Select payment method",
        amountCannotBeNegative: "Amount cannot be negative",
        enterAmountGreaterThanZero: "Enter an amount greater than 0",
        groupAlreadyPaid: "This group is already fully paid",
        noActiveOrder: "No active order",
        errorAddingPayment: "Error adding payment",
        errorRemovingPayment: "Error removing payment",
        selectGroupForPayment: "Select group for payment",
        paid: "Paid",
        selectedGroupTotal: "Selected group total",
        orderTotal: "Order total",
        paidAmount: "Paid",
        remainingToCollect: "Remaining to collect",
        orderFullyPaid: "Order is fully paid",
        canProceedToFiscalization: "You can proceed to fiscalization",
        addPayment: "Add payment",
        applySplit: "Apply Split",
        close: "Close",
        continueToFiscalization: "Continue to fiscalization",
        // SplitBill specific keys
        person: "Person {{number}}",
        byItems: "By Items",
        byAmounts: "By Amounts",
        groupPersonName: "Group/person name",
        noItemsAssigned: "No items assigned",
        unassignedItems: "Unassigned Items",
        totalAssigned: "Total Assigned",
        totalUnassigned: "Total Unassigned",
        difference: "Difference",
        addGroup: "Add Group"
      },
      
      // Fiscal
      fiscal: {
        title: "Fiscal",
        printer: "Fiscal Printer",
        printerError: "Printer Error",
        anafError: "ANAF Error",
        nomenclatorError: "Missing Fiscal Codes",
        genericError: "Generic Error",
        reconnect: "Reconnect",
        check: "Check Connection",
        printInvoice: "Print Invoice",
        fiscalCode: "Fiscal Code",
        missingCodes: "Missing Codes",
        fiscalizing: "Fiscalizing...",
        fiscalizeOrder: "Fiscalize Order",
        fiscalized: "Fiscalized",
        updatingStock: "Updating stock...",
        stockBeingUpdated: "Stock is being updated...",
        stockUpdated: "Stock updated",
        fiscalReceipt: "Fiscal Receipt",
        date: "Date",
        retrying: "Retrying...",
        retryPrint: "Retry Print",
        retryAnaf: "Retry ANAF"
      },
      
      // Customer
      customer: {
        title: "Customer",
        name: "Customer Name",
        phone: "Phone",
        email: "Email",
        address: "Address",
        notes: "Notes",
        searchCustomer: "Search customer...",
        newCustomer: "New Customer",
        selectCustomer: "Select Customer",
        loyaltyPoints: "Loyalty Points"
      },
      
      // Offline
      offline: {
        title: "Offline Mode",
        warning: "No internet connection",
        ordersSaved: "Orders are saved locally",
        willSync: "Will sync when connection returns",
        syncNow: "Sync Now",
        pendingOrders: "Pending Orders"
      },
      
      // Messages
      messages: {
        orderCreated: "Order created successfully",
        orderUpdated: "Order updated",
        orderDeleted: "Order deleted",
        paymentSuccess: "Payment processed successfully",
        paymentFailed: "Payment failed",
        printerConnected: "Printer connected",
        printerDisconnected: "Printer disconnected",
        selectTable: "Select a table",
        selectProducts: "Add products to order",
        confirmDelete: "Are you sure you want to delete this order?"
      }
    },
    
    // ========== KIOSK MODULE ==========
    kiosk: {
      title: "Self-Service Kiosk",
      subtitle: "Order at kiosk",
      
      // Welcome
      welcome: {
        title: "Welcome!",
        subtitle: "Touch screen to start",
        startOrder: "Start Order",
        scanQr: "Scan QR Code",
        chooseLanguage: "Choose Language"
      },
      
      // Menu
      menu: {
        title: "Menu",
        categories: "Categories",
        popular: "Popular",
        new: "New",
        deals: "Deals",
        search: "Search...",
        filter: "Filter",
        viewAll: "View All"
      },
      
      // Product
      product: {
        details: "Product Details",
        ingredients: "Ingredients",
        allergens: "Allergens",
        nutrition: "Nutrition Information",
        calories: "Calories",
        addToCart: "Add to Cart",
        customize: "Customize",
        extras: "Extras",
        remove: "Remove",
        quantity: "Quantity",
        size: {
          small: "Small",
          medium: "Medium",
          large: "Large"
        }
      },
      
      // Cart
      cart: {
        title: "Your Cart",
        empty: "Cart is empty",
        items: "Items",
        subtotal: "Subtotal",
        tax: "Tax",
        total: "Total",
        checkout: "Checkout",
        continueShopping: "Continue Shopping",
        clear: "Clear Cart",
        modify: "Modify"
      },
      
      // Checkout
      checkout: {
        title: "Checkout",
        orderType: "Order Type",
        dineIn: "Dine In",
        takeaway: "Takeaway",
        tableNumber: "Table Number",
        name: "Name",
        phone: "Phone",
        email: "Email",
        paymentMethod: "Payment Method",
        payNow: "Pay Now",
        payAtCounter: "Pay at Counter",
        confirmOrder: "Confirm Order",
        processing: "Processing..."
      },
      
      // Payment
      payment: {
        title: "Payment",
        insertCard: "Insert Card",
        tapCard: "Tap Card",
        enterPin: "Enter PIN",
        processing: "Processing payment...",
        approved: "Payment Approved",
        declined: "Payment Declined",
        tryAgain: "Try Again",
        cancel: "Cancel",
        receipt: "Receipt",
        print: "Print",
        email: "Email"
      },
      
      // Confirmation
      confirmation: {
        title: "Order Confirmed!",
        orderNumber: "Order Number",
        thankyou: "Thank you!",
        estimatedTime: "Estimated Time",
        minutes: "minutes",
        trackOrder: "Track Order",
        newOrder: "New Order",
        printReceipt: "Print Receipt"
      },
      
      // Messages
      messages: {
        selectCategory: "Select a category",
        addItems: "Add items to cart",
        minimumOrder: "Minimum order",
        sessionTimeout: "Session expires in",
        returning: "Returning to main screen..."
      }
    },
    
    // ========== ORDERS MODULE ==========
    orders: {
      title: "Orders",
      subtitle: "Order management",
      
      // Status
      status: {
        all: "All",
        pending: "Pending",
        confirmed: "Confirmed",
        preparing: "Preparing",
        ready: "Ready",
        delivered: "Delivered",
        completed: "Completed",
        cancelled: "Cancelled",
        failed: "Failed"
      },
      
      // Types
      types: {
        all: "All",
        dineIn: "Dine In",
        takeaway: "Takeaway",
        delivery: "Delivery",
        driveThru: "Drive-Thru",
        online: "Online",
        phone: "Phone"
      },
      
      // List
      list: {
        title: "Orders List",
        search: "Search orders...",
        filter: "Filter",
        sort: "Sort",
        orderNumber: "Order No.",
        customer: "Customer",
        table: "Table",
        items: "Items",
        total: "Total",
        time: "Time",
        status: "Status",
        actions: "Actions",
        noOrders: "No orders"
      },
      
      // Details
      details: {
        title: "Order Details",
        orderInfo: "Order Information",
        customerInfo: "Customer Information",
        items: "Ordered Items",
        product: "Product",
        quantity: "Quantity",
        price: "Price",
        subtotal: "Subtotal",
        total: "Total",
        tax: "Tax",
        discount: "Discount",
        notes: "Notes",
        timeline: "Timeline",
        print: "Print",
        email: "Email"
      },
      
      // Actions
      actions: {
        confirm: "Confirm",
        prepare: "Start Preparing",
        ready: "Mark Ready",
        deliver: "Deliver",
        complete: "Complete",
        cancel: "Cancel",
        edit: "Edit",
        duplicate: "Duplicate",
        refund: "Refund",
        printKitchen: "Print Kitchen",
        printReceipt: "Print Receipt"
      },
      
      // Takeaway
      takeaway: {
        title: "Takeaway Orders",
        newOrder: "New Order",
        pickupTime: "Pickup Time",
        customerName: "Customer Name",
        customerPhone: "Customer Phone",
        estimatedTime: "Estimated Time",
        readyAt: "Ready At",
        pickedUp: "Picked Up",
        notPickedUp: "Not Picked Up"
      },
      
      // Analytics
      analytics: {
        title: "Orders Analytics",
        todayOrders: "Today's Orders",
        revenue: "Revenue",
        avgOrderValue: "Avg Order Value",
        topProducts: "Top Products",
        byHour: "By Hour",
        byDay: "By Day",
        byType: "By Type",
        chart: "Chart"
      },
      
      // Archive
      archive: {
        title: "Orders Archive",
        dateRange: "Date Range",
        searchArchive: "Search archive...",
        exportData: "Export Data",
        restore: "Restore"
      },
      
      // Messages
      messages: {
        orderConfirmed: "Order confirmed",
        orderCancelled: "Order cancelled",
        orderCompleted: "Order completed",
        statusUpdated: "Status updated",
        confirmCancel: "Are you sure you want to cancel this order?",
        cannotModify: "Order cannot be modified",
        printSuccess: "Printed successfully",
        printFailed: "Print failed"
      }
    },
    
    // ========== MENU MODULE ==========
    menu: {
      title: "Menu",
      subtitle: "Menu management",
      
      // Categories
      categories: {
        title: "Categories",
        add: "Add Category",
        edit: "Edit Category",
        delete: "Delete Category",
        name: "Category Name",
        description: "Description",
        icon: "Icon",
        order: "Order",
        active: "Active",
        products: "Products",
        noCategories: "No categories"
      },
      
      // Products
      products: {
        title: "Products",
        add: "Add Product",
        edit: "Edit Product",
        delete: "Delete Product",
        name: "Product Name",
        description: "Description",
        category: "Category",
        price: "Price",
        cost: "Cost",
        margin: "Margin",
        image: "Image",
        sku: "SKU",
        barcode: "Barcode",
        stock: "Stock",
        available: "Available",
        outOfStock: "Out of Stock",
        active: "Active",
        inactive: "Inactive",
        noProducts: "No products",
        search: "Search products..."
      },
      
      // Variants
      variants: {
        title: "Variants",
        add: "Add Variant",
        size: "Size",
        color: "Color",
        price: "Price",
        sku: "SKU",
        stock: "Stock"
      },
      
      // Modifiers
      modifiers: {
        title: "Modifiers",
        add: "Add Modifier",
        group: "Modifier Group",
        name: "Name",
        price: "Additional Price",
        required: "Required",
        multiple: "Multiple Selection",
        min: "Minimum",
        max: "Maximum"
      },
      
      // Pricing
      pricing: {
        title: "Pricing",
        basePrice: "Base Price",
        costPrice: "Cost Price",
        salePrice: "Sale Price",
        margin: "Margin",
        marginPercent: "Margin %",
        tax: "Tax",
        taxIncluded: "Tax Included",
        priceHistory: "Price History",
        bulkUpdate: "Bulk Update"
      },
      
      // Import/Export
      importExport: {
        title: "Import/Export",
        import: "Import",
        export: "Export",
        template: "Template",
        download: "Download Template",
        upload: "Upload File",
        format: "Format",
        csv: "CSV",
        excel: "Excel",
        json: "JSON"
      },
      
      // Messages
      messages: {
        productAdded: "Product added",
        productUpdated: "Product updated",
        productDeleted: "Product deleted",
        categoryAdded: "Category added",
        categoryUpdated: "Category updated",
        categoryDeleted: "Category deleted",
        confirmDelete: "Are you sure you want to delete?",
        priceUpdated: "Price updated",
        stockUpdated: "Stock updated",
        imageUploaded: "Image uploaded",
        imageUploadFailed: "Image upload failed"
      }
    },
    
    // ========== DASHBOARD MODULE ==========
    dashboard: {
      title: "Dashboard",
      subtitle: "Overview",
      
      // Overview
      overview: {
        title: "Overview",
        today: "Today",
        yesterday: "Yesterday",
        thisWeek: "This Week",
        lastWeek: "Last Week",
        thisMonth: "This Month",
        lastMonth: "Last Month",
        compare: "Compare"
      },
      
      // Metrics
      metrics: {
        revenue: "Revenue",
        orders: "Orders",
        customers: "Customers",
        avgOrder: "Avg Order",
        sales: "Sales",
        profit: "Profit",
        margin: "Margin",
        growth: "Growth",
        change: "Change",
        vs: "vs",
        revenueToday: "Revenue Today",
        ordersToday: "Orders Today",
        profitToday: "Profit Today",
        cogsToday: "COGS Today",
        cogsDescription: "Cost of goods sold",
        marginLabel: "Margin",
        vsYesterday: "vs yesterday",
        salesToday: "Sales Today",
        estimatedProfit: "Estimated Profit",
        criticalStock: "Critical Stock",
        warnings: "warnings"
      },
      
      // KPI Business
      kpi: {
        loading: "Loading business KPIs...",
        error: "Error loading KPIs:",
        stockAlerts: "Stock Alerts",
        lowStockProducts: "Products below minimum stock",
        customerRetention: "Customer Retention",
        returningCustomers: "Returning customers",
        tableRotation: "Table Rotation",
        groupsPerTable: "Groups per occupied table",
        tableUtilization: "Table Utilization",
        tablesUsed: "Tables used out of 200",
        overallRating: "Overall Average Rating",
        overallRatings: "overall ratings",
        excellentRatings: "5★ Ratings (OVERALL)",
        veryHappyCustomers: "Very satisfied customers",
        lowRatings: "≤2★ Ratings (OVERALL)",
        needsAttention: "Needs urgent attention",
        revenueChart: "Revenue & Gross Margin Evolution (Last 7 days)",
        revenueLabel: "Revenue (RON)",
        grossMargin: "Gross Margin (%)",
        revenueTooltip: "Revenue:",
        marginTooltip: "Margin:",
        top5Products: "Top 5 Products Today",
        product: "Product",
        quantity: "Quantity",
        revenue: "Revenue",
        percentage: "%",
        noData: "No data available",
        topProductsDistribution: "Top Products - Revenue Distribution",
        revenueRon: "Revenue (RON)"
      },
      
      // Charts
      charts: {
        salesOverTime: "Sales Over Time",
        ordersByType: "Orders by Type",
        topProducts: "Top Products",
        revenueByCategory: "Revenue by Category",
        hourlyActivity: "Hourly Activity",
        dailyActivity: "Daily Activity",
        weeklyTrend: "Weekly Trend",
        monthlyTrend: "Monthly Trend",
        dailySalesPerPlatform: "Daily Sales per Platform",
        salesPerPlatformToday: "Sales per Platform (Today)",
        top10Products: "Top 10 Sold Products",
        cancellationRatePerPlatform: "Cancellation Rate per Platform"
      },
      
      // Widgets
      widgets: {
        liveOrders: "Live Orders",
        recentActivity: "Recent Activity",
        alerts: "Alerts",
        notifications: "Notifications",
        tasks: "Tasks",
        quickActions: "Quick Actions",
        performance: "Performance"
      },
      
      // Filters
      filters: {
        dateRange: "Date Range",
        location: "Location",
        category: "Category",
        paymentMethod: "Payment Method",
        orderType: "Order Type",
        apply: "Apply Filters",
        reset: "Reset Filters",
        from: "From",
        to: "To",
        date: "Date"
      },
      
      // PIN Rotation (DashboardPage)
      pinRotation: {
        title: "PIN Rotation Audit",
        subtitle: "Automated monitoring Admin · POS · KDS",
        interface: "Interface",
        category: "Category",
        status: "Status",
        lastRotation: "Last Rotation",
        summary: "Summary",
        errorLoading: "Could not load PIN statuses:",
        retry: "Retry",
        updating: "Updating PIN statuses...",
        filterPlaceholder: "Filter by interface, category or status",
        urgentRotations: "Urgent Rotations",
        noUrgentRotations: "No urgent rotations identified at this time."
      },
      
      // Monitoring
      monitoring: {
        title: "Monitoring & Performance Dashboard",
        refresh: "Refresh",
        tabOverview: "Overview",
        tabQueue: "Queue Monitor",
        tabPerformance: "Performance Metrics",
        systemMetrics: "System Metrics",
        responseTime: "Response Time:",
        activeConnections: "Active Connections:",
        memoryUsage: "Memory Usage:",
        orderMetrics: "Order Metrics",
        avgPrepTime: "Avg Preparation Time:",
        delayedOrders: "Delayed Orders",
        kitchenLoad: "Kitchen Load",
        barLoad: "Bar Load",
        alertsTitle: "Alerts",
        delayedOrdersAlert: "{count} delayed orders need attention!",
        kitchenLoadAlert: "Kitchen is loaded ({count} orders)",
        allOk: "Everything is running normally",
        loading: "Loading...",
        performanceMetrics: "Performance Metrics",
        systemPerformance: "System Performance",
        heapUsed: "Heap Memory Used:",
        heapTotal: "Total Heap Memory:",
        orderPerformance: "Order Performance",
        loadingMetrics: "Loading metrics..."
      },
      
      // Executive Dashboard
      executive: {
        title: "Executive Dashboard",
        subtitle: "Critical KPIs for management",
        loading: "Loading...",
        error: "Error",
        retry: "Retry",
        todaySales: "Sales Today",
        todayOrders: "Orders today",
        updateData: "Update data",
        updating: "Updating...",
        criticalStockTable: "Critical Stock",
        noCriticalStock: "No critical stock",
        ingredient: "Ingredient",
        stock: "Stock",
        minimum: "Minimum",
        unit: "Unit",
        pendingOrders: "Pending orders",
        noPendingOrders: "No pending orders",
        orderId: "ID",
        platform: "Platform",
        waiting: "Waiting",
        total: "Total",
        platformMobileApp: "Mobile App",
        platformPOS: "POS Restaurant",
        platformKIOSK: "KIOSK Self-Service",
        platformPhone: "Phone"
      },
      
      // Hostess Dashboard
      hostess: {
        title: "📊 Hostess Dashboard",
        subtitle: "Table occupancy and session analytics",
        totalSessions: "Total Sessions",
        totalCovers: "Total Covers",
        avgDuration: "Avg Duration (min)",
        coversPerSession: "Covers / Session",
        zoneDistribution: "distribution by zones",
        sessionsPerHour: "Sessions per Hour (selected day)",
        sessions: "Sessions",
        covers: "Covers",
        selectDay: "day for hourly chart"
      },
      
      // Coatroom Dashboard
      coatroom: {
        title: "📊 Coatroom Dashboard",
        subtitle: "Coatroom and valet ticket analytics",
        totalTickets: "Total Tickets",
        open: "Open",
        closed: "Closed",
        lost: "Lost",
        ticketsPerHour: "tickets per hour",
        statusDistribution: "status distribution",
        tickets: "Tickets"
      },
      
      // Lost & Found Dashboard
      lostFound: {
        title: "📊 Lost & Found Dashboard",
        subtitle: "Lost and found items analytics",
        totalItems: "Total Items",
        stored: "in storage",
        returned: "Returned",
        returnRate: "Return Rate",
        itemsByLocation: "items by locations",
        itemStatus: "Item Status",
        items: "Items",
        inStorage: "In Storage",
        returnedStatus: "Returned",
        disposed: "Disposed"
      }
    },
    
    // ========== RESERVATIONS MODULE ==========
    reservations: {
      title: "Reservations",
      subtitle: "Reservation management",
      
      // Status
      status: {
        all: "All",
        pending: "Pending",
        confirmed: "Confirmed",
        seated: "Seated",
        completed: "Completed",
        cancelled: "Cancelled",
        noShow: "No Show"
      },
      
      // List
      list: {
        title: "Reservations List",
        search: "Search reservations...",
        filter: "Filter",
        today: "Today",
        upcoming: "Upcoming",
        past: "Past",
        date: "Date",
        time: "Time",
        customer: "Customer",
        guests: "Guests",
        table: "Table",
        status: "Status",
        actions: "Actions",
        noReservations: "No reservations"
      },
      
      // Filters
      filters: {
        from: "From",
        to: "To",
        next7Days: "Next 7 days",
        searchPlaceholder: "Search by customer, phone, email or code",
        includeCancelled: "Include cancelled",
        exportCsv: "Export CSV"
      },
      
      // New Reservation
      new: {
        title: "New Reservation",
        customer: "Customer",
        date: "Date",
        time: "Time",
        guests: "Number of Guests",
        duration: "Duration",
        table: "Table",
        autoAssign: "Auto Assign",
        notes: "Notes",
        specialRequests: "Special Requests",
        occasion: "Occasion",
        create: "Create Reservation",
        cancel: "Cancel"
      },
      
      // Modal
      modal: {
        edit: "Edit reservation",
        table: "Table",
        fullNamePlaceholder: "Full name",
        phonePlaceholder: "07xx xxx xxx",
        emailPlaceholder: "client@email.com",
        duration: "Duration (minutes)",
        persons: "pers.",
        selectTable: "Select table",
        occupied: "occupied",
        checkingAvailability: "Checking table availability...",
        errorLoadingTables: "Error loading tables",
        customerNotes: "Customer notes",
        customerNotesPlaceholder: "Preferences, allergies, special requests",
        internalNotes: "Internal notes",
        internalNotesPlaceholder: "Staff instructions, host notifications",
        saving: "Saving...",
        saveChanges: "Save changes",
        errorSaving: "Could not save reservation"
      },
      
      // Calendar
      calendar: {
        title: "Reservations Calendar",
        day: "Day",
        week: "Week",
        month: "Month",
        timeline: "Timeline",
        today: "Today",
        next: "Next",
        previous: "Previous",
        slot: "Slot",
        available: "Available",
        booked: "Booked",
        blocked: "Blocked"
      },
      
      // Tables
      tables: {
        title: "Table Management",
        tableNumber: "Table Number",
        capacity: "Capacity",
        section: "Section",
        floor: "Floor",
        available: "Available",
        occupied: "Occupied",
        reserved: "Reserved",
        blocked: "Blocked",
        combine: "Combine Tables",
        split: "Split Tables"
      },
      
      // Customer
      customer: {
        name: "Name",
        phone: "Phone",
        email: "Email",
        vip: "VIP",
        notes: "Customer Notes",
        preferences: "Preferences",
        allergies: "Allergies",
        history: "Reservation History",
        visits: "Visits",
        lastVisit: "Last Visit"
      },
      
      // Actions
      actions: {
        confirm: "Confirm",
        seat: "Seat",
        complete: "Complete",
        cancel: "Cancel",
        noShow: "No Show",
        edit: "Edit",
        reschedule: "Reschedule",
        sendReminder: "Send Reminder",
        printConfirmation: "Print Confirmation"
      },
      
      // Messages
      messages: {
        reservationCreated: "Reservation created",
        reservationUpdated: "Reservation updated",
        reservationCancelled: "Reservation cancelled",
        reservationConfirmed: "Reservation confirmed",
        tableAssigned: "Table assigned",
        reminderSent: "Reminder sent",
        confirmCancel: "Are you sure you want to cancel this reservation?",
        noTablesAvailable: "No tables available",
        alreadyBooked: "Time slot already booked"
      },
      
      // Timeline
      timeline: {
        title: "Reservation timeline",
        loading: "Loading event history...",
        errorLoading: "Could not load timeline",
        noEvents: "No events recorded for this reservation",
        operatedBy: "Operated by",
        systemOperation: "System operation"
      },
      
      // Page
      page: {
        title: "Reservation Management",
        subtitle: "Plan, confirm and track restaurant reservations",
        refreshData: "Refresh data",
        reservationsToday: "Reservations Today",
        totalScheduledToday: "Total scheduled for today",
        confirmed: "Confirmed",
        cancelled: "Cancelled",
        selectedInterval: "Selected interval",
        includesNoShow: "Includes no-show",
        occupancyRate: "Occupancy Rate",
        tablesToday: "tables today",
        capacity: "Capacity",
        markCompleted: "Mark completed",
        sendReminder: "Send reminder",
        confirmationCode: "Confirmation Code",
        dateTime: "Date & Time",
        notSet: "Not set"
      }
    }
  }
};
