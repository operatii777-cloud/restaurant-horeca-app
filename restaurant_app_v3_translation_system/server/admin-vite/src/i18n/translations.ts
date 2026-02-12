// Translation keys for admin-vite interface
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
      duplicate: "Duplică"
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
      duplicate: "Duplicate"
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
    }
  }
};
