/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GENERATOR PDF UNIFICAT - TIPIZATE ANAF
 * Conform OMFP 2634/2015 - Suport complet caractere românești
 * ═══════════════════════════════════════════════════════════════════════════
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Paths pentru fonturile Times New Roman (Windows) - Suport UTF-8 complet
const FONTS = {
  regular: 'C:\\Windows\\Fonts\\times.ttf',
  bold: 'C:\\Windows\\Fonts\\timesbd.ttf',
  italic: 'C:\\Windows\\Fonts\\timesi.ttf'
};

/**
 * Obține fontul corect (cu fallback la Helvetica)
 */
function getFont(style = 'regular') {
  const fontPath = FONTS[style] || FONTS.regular;
  try {
    if (fs.existsSync(fontPath)) {
      return fontPath;
    }
  } catch (err) {
    console.warn(`Font ${style} not found, using Helvetica`);
  }
  return style === 'bold' ? 'Helvetica-Bold' : 'Helvetica';
}

/**
 * Formatează dată în format RO (DD.MM.YYYY)
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Generează PDF pentru Aviz de Însoțire a Mărfii (Cod ANAF 14-3-6A)
 */
async function generateAvizInsotirePDF(avizData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Înregistrează fonturi
      try {
        doc.registerFont('Times-Roman', getFont('regular'));
        doc.registerFont('Times-Bold', getFont('bold'));
      } catch (err) {
        console.warn('Could not register Times fonts, using default');
      }
      
      // Header
      doc.font(getFont('bold')).fontSize(16).text('AVIZ DE ÎNSOȚIRE A MĂRFII', { align: 'center' });
      doc.font(getFont('regular')).fontSize(10).text('Cod ANAF: 14-3-6A', { align: 'center' });
      doc.moveDown(1);
      
      // Informații document
      doc.fontSize(10);
      doc.text(`Serie: ${avizData.serie || 'AVZ'}`, { continued: true });
      doc.text(`Număr: ${avizData.numar || ''}`, { align: 'right' });
      doc.text(`Data emitere: ${formatDate(avizData.data_emitere)}`);
      doc.moveDown(0.5);
      
      // Expeditor
      doc.font(getFont('bold')).fontSize(11).text('EXPEDITOR:', { underline: true });
      doc.font(getFont('regular')).fontSize(10);
      doc.text(`Denumire: ${avizData.expeditor_denumire || ''}`);
      if (avizData.expeditor_cif) doc.text(`CIF: ${avizData.expeditor_cif}`);
      if (avizData.expeditor_adresa) doc.text(`Adresă: ${avizData.expeditor_adresa}`);
      doc.moveDown(0.5);
      
      // Destinatar
      doc.font(getFont('bold')).fontSize(11).text('DESTINATAR/PRIMITOR:', { underline: true });
      doc.font(getFont('regular')).fontSize(10);
      doc.text(`Denumire: ${avizData.destinatar_denumire || ''}`);
      if (avizData.destinatar_cif) doc.text(`CIF: ${avizData.destinatar_cif}`);
      if (avizData.destinatar_adresa) doc.text(`Adresă: ${avizData.destinatar_adresa}`);
      doc.moveDown(0.5);
      
      // Transport
      if (avizData.delegat_nume || avizData.mijloc_transport) {
        doc.font(getFont('bold')).fontSize(11).text('DETALII TRANSPORT:', { underline: true });
        doc.font(getFont('regular')).fontSize(10);
        if (avizData.delegat_nume) doc.text(`Delegat: ${avizData.delegat_nume}`);
        if (avizData.delegat_ci) doc.text(`CI: ${avizData.delegat_ci}`);
        if (avizData.mijloc_transport) doc.text(`Mijloc transport: ${avizData.mijloc_transport}`);
        if (avizData.ora_plecare) doc.text(`Ora plecare: ${avizData.ora_plecare}`);
        doc.moveDown(0.5);
      }
      
      // Tabel bunuri
      if (avizData.items && avizData.items.length > 0) {
        doc.font(getFont('bold')).fontSize(11).text('DETALII BUNURI (ÎNSOȚITE):', { underline: true });
        doc.moveDown(0.3);
        
        const tableTop = doc.y;
        const nrX = 50;
        const denumireX = 80;
        const umX = 350;
        const cantitateX = 400;
        const observatiiX = 480;
        
        doc.fontSize(9).font(getFont('bold'));
        doc.text('Nr.', nrX, tableTop);
        doc.text('Denumire bun', denumireX, tableTop);
        doc.text('UM', umX, tableTop);
        doc.text('Cantitate', cantitateX, tableTop);
        doc.text('Observații', observatiiX, tableTop);
        
        doc.moveTo(nrX, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.moveDown(0.5);
        
        let y = doc.y;
        doc.fontSize(9).font(getFont('regular'));
        avizData.items.forEach((item, index) => {
          if (y > 750) {
            doc.addPage();
            y = 50;
          }
          
          doc.text(String(index + 1), nrX, y);
          doc.text(item.denumire || '', denumireX, y, { width: 250 });
          doc.text(item.um || 'buc', umX, y);
          doc.text(String(item.cantitate || 0), cantitateX, y);
          doc.text(item.observatii || '', observatiiX, y, { width: 70 });
          
          y += 15;
        });
        
        doc.y = y;
        doc.moveDown(0.5);
      }
      
      // Mențiuni
      if (avizData.tip_operatiune || avizData.observatii) {
        doc.font(getFont('bold')).fontSize(10).text('MENȚIUNI:', { underline: true });
        doc.font(getFont('regular')).fontSize(10);
        if (avizData.tip_operatiune) {
          const tipMap = {
            'fara_factura': '☐ Fără factură',
            'transfer': '☐ Transfer',
            'retur': '☐ Retur',
            'prelucrare': '☐ Pentru prelucrare la terți'
          };
          doc.text(tipMap[avizData.tip_operatiune] || avizData.tip_operatiune);
        }
        if (avizData.observatii) {
          doc.text(`Alte mențiuni: ${avizData.observatii}`);
        }
        doc.moveDown(1);
      }
      
      // Semnături
      doc.font(getFont('bold')).fontSize(10).text('SEMNĂTURI:', { underline: true });
      doc.moveDown(0.5);
      doc.font(getFont('regular')).fontSize(9);
      doc.text('Expeditor:', 50, doc.y);
      doc.text('___________________', 50, doc.y + 20);
      doc.text('Delegat:', 50, doc.y + 40);
      doc.text('___________________', 50, doc.y + 60);
      doc.text('Primitor:', 350, doc.y - 60);
      doc.text('___________________', 350, doc.y - 40);
      doc.text('Responsabil gestiune:', 350, doc.y - 20);
      doc.text('___________________', 350, doc.y);
      
      // Footer
      doc.fontSize(8).text('Document generat electronic – AdminV4', { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generează PDF pentru Bon de Consum (Cod ANAF 14-3-4A)
 */
async function generateBonConsumPDF(bonData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Înregistrează fonturi
      try {
        doc.registerFont('Times-Roman', getFont('regular'));
        doc.registerFont('Times-Bold', getFont('bold'));
      } catch (err) {
        console.warn('Could not register Times fonts, using default');
      }
      
      // Header
      doc.font(getFont('bold')).fontSize(16).text('BON DE CONSUM', { align: 'center' });
      doc.font(getFont('regular')).fontSize(10).text('Cod ANAF: 14-3-4A', { align: 'center' });
      doc.moveDown(1);
      
      // Informații document
      doc.fontSize(10);
      doc.text(`Serie: ${bonData.series || 'BC'}`, { continued: true });
      doc.text(`Număr: ${bonData.number || ''}`, { align: 'right' });
      doc.text(`Data: ${formatDate(bonData.issue_date)}`);
      doc.text(`Eliberat din depozit/gestiune: ${bonData.source_warehouse || ''}`);
      doc.moveDown(0.5);
      
      // Solicitant / Departament
      if (bonData.destination || bonData.departament) {
        doc.font(getFont('bold')).fontSize(11).text('SOLICITANT / DEPARTAMENT:', { underline: true });
        doc.font(getFont('regular')).fontSize(10);
        if (bonData.destination) doc.text(bonData.destination);
        if (bonData.departament) doc.text(`Departament: ${bonData.departament}`);
        doc.moveDown(0.5);
      }
      
      // Tabel materiale
      if (bonData.items && bonData.items.length > 0) {
        doc.font(getFont('bold')).fontSize(11).text('MATERIALE:', { underline: true });
        doc.moveDown(0.3);
        
        const tableTop = doc.y;
        const nrX = 50;
        const denumireX = 80;
        const umX = 350;
        const cantitateX = 400;
        const semnaturaX = 480;
        
        doc.fontSize(9).font(getFont('bold'));
        doc.text('Nr.', nrX, tableTop);
        doc.text('Denumire material', denumireX, tableTop);
        doc.text('UM', umX, tableTop);
        doc.text('Cantitate', cantitateX, tableTop);
        doc.text('Semnătură primire', semnaturaX, tableTop);
        
        doc.moveTo(nrX, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.moveDown(0.5);
        
        let y = doc.y;
        doc.fontSize(9).font(getFont('regular'));
        bonData.items.forEach((item, index) => {
          if (y > 750) {
            doc.addPage();
            y = 50;
          }
          
          doc.text(String(index + 1), nrX, y);
          doc.text(item.product_name || '', denumireX, y, { width: 250 });
          doc.text(item.unit_of_measure || 'buc', umX, y);
          doc.text(String(item.quantity || 0), cantitateX, y);
          doc.text('', semnaturaX, y);
          
          y += 15;
        });
        
        doc.y = y;
        doc.moveDown(0.5);
      }
      
      // Total
      if (bonData.total_value) {
        doc.font(getFont('bold')).fontSize(10);
        doc.text(`Total bunuri consumate: ${bonData.total_value.toFixed(2)} RON`, { align: 'right' });
        doc.moveDown(1);
      }
      
      // Semnături
      doc.font(getFont('bold')).fontSize(10).text('SEMNĂTURI:', { underline: true });
      doc.moveDown(0.5);
      doc.font(getFont('regular')).fontSize(9);
      doc.text('Gestiune:', 50, doc.y);
      doc.text('___________________', 50, doc.y + 20);
      doc.text('Solicitant:', 350, doc.y - 20);
      doc.text('___________________', 350, doc.y);
      
      // Footer
      doc.fontSize(8).text('Document generat electronic – AdminV4', { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generează PDF pentru Proces-Verbal de Scoatere din Gestiune
 */
async function generateProcesVerbalPDF(pvData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Înregistrează fonturi
      try {
        doc.registerFont('Times-Roman', getFont('regular'));
        doc.registerFont('Times-Bold', getFont('bold'));
      } catch (err) {
        console.warn('Could not register Times fonts, using default');
      }
      
      // Header
      doc.font(getFont('bold')).fontSize(16).text('PROCES-VERBAL', { align: 'center' });
      doc.moveDown(1);
      
      // Informații document
      doc.fontSize(10).font(getFont('regular'));
      doc.text(`Nr.: ${pvData.numar || ''}`);
      doc.text(`Data: ${formatDate(pvData.data)}`);
      
      const tipMap = {
        'pierdere': '☑ pierderi de stoc',
        'deteriorare': '☑ marfă deteriorată',
        'expirare': '☑ rebuturi',
        'furt': '☑ furt',
        'inventar': '☑ inventar'
      };
      doc.text(`Referitor la: ${tipMap[pvData.tip] || pvData.tip || ''}`);
      doc.moveDown(0.5);
      
      // Comisie
      doc.font(getFont('bold')).fontSize(11).text('COMISIE:', { underline: true });
      doc.font(getFont('regular')).fontSize(10);
      if (pvData.membru1_nume) doc.text(`1. ${pvData.membru1_nume} - ${pvData.membru1_functie || ''}`);
      if (pvData.membru2_nume) doc.text(`2. ${pvData.membru2_nume} - ${pvData.membru2_functie || ''}`);
      if (pvData.membru3_nume) doc.text(`3. ${pvData.membru3_nume} - ${pvData.membru3_functie || ''}`);
      doc.moveDown(0.5);
      
      // Constatări
      doc.font(getFont('bold')).fontSize(11).text('CONSTATĂRI:', { underline: true });
      doc.font(getFont('regular')).fontSize(10);
      doc.text('Comisia a verificat stocul și a identificat următoarele bunuri neconforme/deteriorate/pierderi:');
      doc.moveDown(0.3);
      
      // Tabel bunuri
      if (pvData.items && pvData.items.length > 0) {
        const tableTop = doc.y;
        const nrX = 50;
        const denumireX = 80;
        const umX = 350;
        const cantitateX = 400;
        const motivX = 480;
        
        doc.fontSize(9).font(getFont('bold'));
        doc.text('Nr.', nrX, tableTop);
        doc.text('Denumire bun', denumireX, tableTop);
        doc.text('UM', umX, tableTop);
        doc.text('Cantitate', cantitateX, tableTop);
        doc.text('Motiv', motivX, tableTop);
        
        doc.moveTo(nrX, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.moveDown(0.5);
        
        let y = doc.y;
        doc.fontSize(9).font(getFont('regular'));
        pvData.items.forEach((item, index) => {
          if (y > 750) {
            doc.addPage();
            y = 50;
          }
          
          doc.text(String(index + 1), nrX, y);
          doc.text(item.denumire || '', denumireX, y, { width: 250 });
          doc.text(item.um || 'buc', umX, y);
          doc.text(String(item.cantitate || 0), cantitateX, y);
          doc.text(pvData.tip || '', motivX, y, { width: 70 });
          
          y += 15;
        });
        
        doc.y = y;
        doc.moveDown(0.5);
      }
      
      // Măsură dispusă
      doc.font(getFont('bold')).fontSize(11).text('MĂSURĂ DISPUSĂ:', { underline: true });
      doc.font(getFont('regular')).fontSize(10);
      const masuraMap = {
        'casare': '☑ Scoaterea din gestiune și casarea',
        'distrugere': '☑ Distrugere',
        'donatie': '☑ Transfer la gestiunea rebuturi',
        'ajustare_stoc': '☑ Ajustare stoc'
      };
      doc.text(masuraMap[pvData.masura] || pvData.masura || '');
      doc.moveDown(1);
      
      // Semnături comisie
      doc.font(getFont('bold')).fontSize(10).text('SEMNĂTURI COMISIE:', { underline: true });
      doc.moveDown(0.5);
      doc.font(getFont('regular')).fontSize(9);
      if (pvData.membru1_nume) {
        doc.text('1. ___________________', 50, doc.y);
        doc.y += 20;
      }
      if (pvData.membru2_nume) {
        doc.text('2. ___________________', 50, doc.y);
        doc.y += 20;
      }
      if (pvData.membru3_nume) {
        doc.text('3. ___________________', 50, doc.y);
      }
      doc.moveDown(0.5);
      doc.text('Gestiune: ___________________', 50, doc.y);
      
      // Footer
      doc.fontSize(8).text('Document generat electronic – AdminV4', { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generează PDF pentru Bon Pierderi / Rebuturi / Casare
 */
async function generateBonPierderiPDF(bonData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      
      // Înregistrează fonturi
      try {
        doc.registerFont('Times-Roman', getFont('regular'));
        doc.registerFont('Times-Bold', getFont('bold'));
      } catch (err) {
        console.warn('Could not register Times fonts, using default');
      }
      
      // Header
      doc.font(getFont('bold')).fontSize(16).text('BON DE CASARE/PIERDERI/REBUTURI', { align: 'center' });
      doc.moveDown(1);
      
      // Informații document
      doc.fontSize(10).font(getFont('regular'));
      doc.text(`Serie: ${bonData.serie || 'BP'}`, { continued: true });
      doc.text(`Număr: ${bonData.numar || ''}`, { align: 'right' });
      doc.text(`Data: ${formatDate(bonData.data)}`);
      doc.text(`Eliberat de gestiune: ${bonData.gestiune_id || ''}`);
      doc.moveDown(0.5);
      
      // Tabel articole
      if (bonData.items && bonData.items.length > 0) {
        doc.font(getFont('bold')).fontSize(11).text('ARTICOLE:', { underline: true });
        doc.moveDown(0.3);
        
        const tableTop = doc.y;
        const nrX = 50;
        const denumireX = 80;
        const umX = 350;
        const cantitateX = 400;
        const motivX = 480;
        
        doc.fontSize(9).font(getFont('bold'));
        doc.text('Nr.', nrX, tableTop);
        doc.text('Denumire articol', denumireX, tableTop);
        doc.text('UM', umX, tableTop);
        doc.text('Cantitate', cantitateX, tableTop);
        doc.text('Motiv casare/pierdere', motivX, tableTop);
        
        doc.moveTo(nrX, doc.y + 5).lineTo(550, doc.y + 5).stroke();
        doc.moveDown(0.5);
        
        let y = doc.y;
        doc.fontSize(9).font(getFont('regular'));
        bonData.items.forEach((item, index) => {
          if (y > 750) {
            doc.addPage();
            y = 50;
          }
          
          doc.text(String(index + 1), nrX, y);
          doc.text(item.denumire || '', denumireX, y, { width: 250 });
          doc.text(item.um || 'buc', umX, y);
          doc.text(String(item.cantitate || 0), cantitateX, y);
          doc.text(item.motiv || '', motivX, y, { width: 70 });
          
          y += 15;
        });
        
        doc.y = y;
        doc.moveDown(0.5);
      }
      
      // Semnături
      doc.font(getFont('bold')).fontSize(10).text('SEMNĂTURI:', { underline: true });
      doc.moveDown(0.5);
      doc.font(getFont('regular')).fontSize(9);
      doc.text('Gestiune: ___________________', 50, doc.y);
      doc.text('Observații: ___________________', 50, doc.y + 20);
      
      // Footer
      doc.fontSize(8).text('Document generat electronic – AdminV4', { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateAvizInsotirePDF,
  generateBonConsumPDF,
  generateProcesVerbalPDF,
  generateBonPierderiPDF
};
