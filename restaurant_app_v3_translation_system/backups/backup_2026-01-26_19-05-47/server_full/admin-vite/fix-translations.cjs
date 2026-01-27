// Script to fix translation keys in admin-vite
const fs = require('fs');
const path = require('path');

// Translation key mappings - old key -> new key with prefix
const keyMappings = {
  // Catalog
  'navigheaza_la_pagina_meniu_digital': 'catalog.navigheaza_la_pagina_meniu_digital',
  'navigheaza_la_pagina_retete': 'catalog.navigheaza_la_pagina_retete',
  'exporta_meniul_in_format_pdf': 'catalog.exporta_meniul_in_format_pdf',
  'catalog_produse_si_meniuri_active': 'catalog.catalog_produse_si_meniuri_active',
  'pret_mediu_vanzare': 'catalog.pret_mediu_vanzare',
  'retete_sincronizate': 'catalog.retete_sincronizate',
  'top_preturi_produse_active': 'catalog.top_preturi_produse_active',
  'distributie_pe_categorii': 'catalog.distributie_pe_categorii',
  'fara_date_disponibile': 'catalog.fara_date_disponibile',
  'cauta_produs_dupa_nume_categorie_sectiune_de_prepa': 'catalog.cauta_produs_dupa_nume_categorie_sectiune_de_prepa',
  'lista_completa_de_produse': 'catalog.lista_completa_de_produse',
  'genereaza_qr': 'catalog.genereaza_qr',
  'cu_cost_calculat': 'catalog.cu_cost_calculat',
  'retete_lipsa': 'catalog.retete_lipsa',
  'cost_reteta': 'catalog.cost_reteta',
  'status_reteta': 'catalog.status_reteta',
  'alergeni_monitorizati': 'catalog.alergeni_monitorizati',
  'selecteaza_un_produs_din_tabel_pentru_a_vedea_cost': 'catalog.selecteaza_un_produs_din_tabel_pentru_a_vedea_cost',
  'se_incarca_detaliile_pentru_chef': 'catalog.se_incarca_detaliile_pentru_chef',
  'fara_alergeni_declarati': 'catalog.fara_alergeni_declarati',
  'nu_exista_ingrediente_detaliate': 'catalog.nu_exista_ingrediente_detaliate',
  'in_curs_de_actualizare': 'catalog.in_curs_de_actualizare',
  'fluxuri_automate': 'catalog.fluxuri_automate',
  'actualizare_preturi': 'catalog.actualizare_preturi',

  // Menu
  'structura_meniuri': 'menu.structura_meniuri',
  'adauga_categorie': 'menu.adauga_categorie',
  'se_incarca_structura': 'menu.se_incarca_structura',
  'nu_exista_categorii_active_creeaza_una_noua_pentru': 'menu.nu_exista_categorii_active_creeaza_una_noua_pentru',
  'adauga_subcategorie': 'menu.adauga_subcategorie',
  'editeaza_categorie': 'menu.editeaza_categorie',
  'sterge_categorie': 'menu.sterge_categorie',
  'nu_am_putut_incarca_istoricul': 'menu.nu_am_putut_incarca_istoricul',
  'nu_exista_mesaje_inregistrate_pentru_administrator': 'menu.nu_exista_mesaje_inregistrate_pentru_administrator',
  'verifica_mesajul': 'menu.verifica_mesajul',
  'data_modificarii': 'menu.data_modificarii',
  'pret_vechi': 'menu.pret_vechi',
  'pret_nou': 'menu.pret_nou',
  'nu_exista_inregistrari_pentru_acest_produs': 'menu.nu_exista_inregistrari_pentru_acest_produs',

  // Daily menu
  'meniul_activ_astazi': 'daily-menu.meniul_activ_astazi',
  'programari_active': 'daily-menu.programari_active',
  'meniul_zilei_pentru_astazi': 'daily-menu.meniul_zilei_pentru_astazi',
  'pret_total': 'daily-menu.pret_total',
  'data_sfarsit': 'daily-menu.data_sfarsit',
  'nu_exista_programari_active': 'daily-menu.nu_exista_programari_active',
  'exceptie_pentru_o_zi_specifica': 'daily-menu.exceptie_pentru_o_zi_specifica',
  'exceptii_definite': 'daily-menu.exceptii_definite',
  'nu_exista_exceptii_definite': 'daily-menu.nu_exista_exceptii_definite',

  // Stocks
  'cu_diferente': 'stocks.cu_diferente',
  'se_incarca_produsele': 'stocks.se_incarca_produsele',
  'selecteaza_alergenii': 'stocks.selecteaza_alergenii',
  'alergeni_selectati': 'stocks.alergeni_selectati',
  'ajusta_stoc': 'stocks.ajusta_stoc',
  'se_incarca_ingredientele': 'stocks.se_incarca_ingredientele',
  'nu_exista_ingrediente': 'stocks.nu_exista_ingrediente',
  'adauga_ingredient': 'stocks.adauga_ingredient',
  'cauta_ingredient_categorie_um': 'stocks.cauta_ingredient_categorie_um',
  'cautare_ingrediente': 'stocks.cautare_ingrediente',
  'toate_categoriile': 'stocks.toate_categoriile',
  'stoc_scazut': 'stocks.stoc_scazut',

  // Allergens
  'selecteaza_alergenii': 'allergens.selecteaza_alergenii',
  'alergeni_selectati': 'allergens.alergeni_selectati',

  // Enterprise
  'document_nou': 'enterprise.document_nou',
  'de_la_data': 'enterprise.de_la_data',
  'pana_la_data': 'enterprise.pana_la_data',
  'filtreaza_dupa_furnizor': 'enterprise.filtreaza_dupa_furnizor',
  'filtreaza_dupa_client': 'enterprise.filtreaza_dupa_client',
  'uz_bucatarie': 'enterprise.uz_bucatarie',
  'masa_angajat': 'enterprise.masa_angajat',
  'locatie_destinatie': 'enterprise.locatie_destinatie',
  'filtreaza_dupa_destinatie': 'enterprise.filtreaza_dupa_destinatie',
  'filtreaza_dupa_locatie': 'enterprise.filtreaza_dupa_locatie',
  'preview_pdf_inainte_de_salvare': 'enterprise.preview_pdf_inainte_de_salvare',

  // App
  'verifica_consola_pentru_detalii': 'app.verifica_consola_pentru_detalii',
  'se_incarca_continutul': 'app.se_incarca_continutul',
  'se_incarca_vizitele': 'app.se_incarca_vizitele',

  // Settings
  'securitate_suplimentara_pentru_contul_tau': 'settings.securitate_suplimentara_pentru_contul_tau',
  'mfa_este_configurat_dar_nu_este_activat_completeaz': 'settings.mfa_este_configurat_dar_nu_este_activat_completeaz',
  'activeaza_mfa': 'settings.activeaza_mfa',
  'verifica_si_activeaza_mfa': 'settings.verifica_si_activeaza_mfa',
  'deschide_google_authenticator_pe_telefon': 'settings.deschide_google_authenticator_pe_telefon',
  'scaneaza_qr_code_ul_de_mai_jos': 'settings.scaneaza_qr_code_ul_de_mai_jos',
  'mfa_qr_code': 'settings.mfa_qr_code',
  'dezactiveaza_mfa': 'settings.dezactiveaza_mfa',

  // Archive
  'cea_mai_veche_comanda': 'archive.cea_mai_veche_comanda',
  'cea_mai_recenta_comanda': 'archive.cea_mai_recenta_comanda',
  'reguli_automatizare': 'archive.reguli_automatizare',
  'automatizarile_va_permit_sa_programati_actiuni_per': 'archive.automatizarile_va_permit_sa_programati_actiuni_per',
  'nu_exista_reguli_de_automatizare_configurate': 'archive.nu_exista_reguli_de_automatizare_configurate',
  'ultima_executie': 'archive.ultima_executie',
  'urmatoarea_executie': 'archive.urmatoarea_executie',
  'statistici_arhiva_pe_luna': 'archive.statistici_arhiva_pe_luna',
  'se_incarca': 'archive.se_incarca',
  'numar_comenzi': 'archive.numar_comenzi',
  'nu_exista_date_pentru_statistici': 'archive.nu_exista_date_pentru_statistici',

  // Delivery
  'nicio_comanda_in_preparare': 'delivery.nicio_comanda_in_preparare',
  'nicio_comanda_gata': 'delivery.nicio_comanda_gata',
  'informatii_livrare': 'delivery.informatii_livrare',
  'nicio_comanda_delivery_activa': 'delivery.nicio_comanda_delivery_activa',

  // Platform stats
  'toate_platformele': 'platform-stats.toate_platformele',
  'platforme_active': 'platform-stats.platforme_active',
  'comparatie_platforme': 'platform-stats.comparatie_platforme',
  'detalii_comparatie': 'platform-stats.detalii_comparatie',
  'clienti_unici': 'platform-stats.clienti_unici',

  // Reservations
  'gestionare_rezervari': 'reservations.gestionare_rezervari',
  'planifica_confirma_si_urmareste_rezervarile_din_re': 'reservations.planifica_confirma_si_urmareste_rezervarile_din_re',
  'rezervari_astazi': 'reservations.rezervari_astazi',
  'grad_ocupare': 'reservations.grad_ocupare'
};

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace all translation keys
    for (const [oldKey, newKey] of Object.entries(keyMappings)) {
      const regex = new RegExp(`t\\('${oldKey}'\\)`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `t('${newKey}')`);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      fixFile(filePath);
    }
  }
}

// Start processing from src directory
console.log('Starting translation key fixes...');
walkDirectory('./src');
console.log('Translation key fixes completed!');