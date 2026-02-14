// Comprehensive translations for all modules - RO/EN
// This file will be integrated into translations.ts

export const comprehensiveTranslations = {
  ro: {
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
        noTables: "Nu există mese disponibile"
      },
      
      // Products
      products: {
        title: "Produse",
        search: "Caută produse...",
        category: "Categorie",
        allCategories: "Toate Categoriile",
        addToOrder: "Adaugă la Comandă",
        outOfStock: "Stoc Epuizat",
        price: "Preț"
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
        discount: "Discount",
        total: "Total",
        empty: "Coș gol",
        addProducts: "Adaugă produse la comandă",
        clearOrder: "Golește Comanda",
        confirmClear: "Sigur vrei să golești comanda?",
        removeItem: "Elimină Produs",
        quantity: "Cantitate",
        notes: "Observații",
        addNotes: "Adaugă observații..."
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
          account: "Cont"
        },
        amount: "Sumă",
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
        enterAmount: "Introdu suma"
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
        missingCodes: "Coduri Lipsă"
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
        vs: "vs"
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
        monthlyTrend: "Trend Lunar"
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
        reset: "Resetează Filtre"
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
      }
    }
  },
  
  en: {
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
        noTables: "No tables available"
      },
      
      // Products
      products: {
        title: "Products",
        search: "Search products...",
        category: "Category",
        allCategories: "All Categories",
        addToOrder: "Add to Order",
        outOfStock: "Out of Stock",
        price: "Price"
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
        discount: "Discount",
        total: "Total",
        empty: "Cart empty",
        addProducts: "Add products to order",
        clearOrder: "Clear Order",
        confirmClear: "Are you sure you want to clear the order?",
        removeItem: "Remove Item",
        quantity: "Quantity",
        notes: "Notes",
        addNotes: "Add notes..."
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
          account: "Account"
        },
        amount: "Amount",
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
        enterAmount: "Enter amount"
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
        missingCodes: "Missing Codes"
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
        vs: "vs"
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
        monthlyTrend: "Monthly Trend"
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
        reset: "Reset Filters"
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
      }
    }
  }
};
