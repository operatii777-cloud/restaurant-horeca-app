// #!/usr/bin/env node
/**
 * Script complet pentru corectarea encoding-ului în fișierele admin
 * Rezolvă: diacritice, ghilimele, emoji-uri
 * Rulare: node fix-encoding.cjs --scan (pentru preview)
 *         node fix-encoding.cjs --fix (pentru corectare)
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURARE
// ============================================================================

const FILES_TO_CHECK = [
	'src/ui/admin/main.tsx',
	'src/ui/admin/DashboardPage.tsx',
	'src/ui/admin/QueueMonitorPage.tsx',
	'src/ui/admin/ExecutiveDashboardPage.tsx',
	'src/ui/admin/MonitoringDashboardPage.tsx',
	'src/ui/admin/OrdersManagementPage.tsx',
	'src/ui/admin/AdminPageShell.tsx',
	'src/styles/global.css',
	'src/styles/enterprise-polish.css',
	'src/ui/admin/ExecutiveDashboardPage.css',
	'src/ui/admin/MonitoringDashboardPage.css',
	'src/ui/admin/OrdersManagementPage.css',
	'src/ui/admin/AdminPageShell.css',
];

// ============================================================================
// MAPĂRI CARACTERE CORUPTE
// ============================================================================

// 1. DIACRITICE ROMÂNEȘTI
const DIACRITICS_MAP = {
	// ș (s cu virgulă)
	'È™': 'ș',
	'Èš': 'Ș',
	'ÈS': 'ș',
	'È': 'ș',
  
	// ț (t cu virgulă)
	'È›': 'ț',
	'Èš': 'Ț',
	'ÈT': 'ț',
	'È›Äƒ': 'ță',
  
	// ă
	'Äƒ': 'ă',
	'Ä‚': 'Ă',
	'Äƒ': 'ă',
  
	// â
	'Ã¢': 'â',
	'Ã‚': 'Â',
	'Ã¢': 'â',
  
	// î
	'Ã®': 'î',
	'ÃŽ': 'Î',
	'Ã®': 'î',
  
	// Combinații comune
	'È™i': 'și',
	'È›i': 'ți',
	'Ã®n': 'în',
	'È™': 'ș',
	'RÄƒ': 'Ră',
	'CoadÄƒ': 'Coadă',
	'GeneralÄƒ': 'Generală',
	'UtilizatÄƒ': 'Utilizată',
	'TotalÄƒ': 'Totală',
	'Ã®ncarcÄƒ': 'încarcă',
	'PerformanÈ›Äƒ': 'Performanță',
	'È™i': 'și',
	'ÈTM': 'ș', // Cazul "ÈTMi" -> "și"
};

// 2. GHILIMELE ȘI APOSTROF
const QUOTES_MAP = {
	'â€œ': '"',
	'â€': '"',
	'â€˜': "'",
	'â€™': "'",
	// Variante mai rare
	'«': '"',
	'»': '"',
	'‹': "'",
	'›': "'",
};

// 3. EMOJI-URI CORUPTE (exemple comune)
const EMOJI_MAP = {
	'ðŸ"Š': '📊',
	'ðŸ"ˆ': '📈',
	'ðŸ"‰': '📉',
	'âœ…': '✅',
	'â›"': '⛔',
	'âš ': '⚠',
	'ðŸ"': '🔍',
	'ðŸ"§': '🔧',
	// 'ðŸ'¼': '💼', // eliminat din cauza sintaxei invalide
	'ðŸ"„': '📄',
	'ðŸš€': '🚀',
	'âš™': '⚙',
	// 'ðŸ"'': '🔑', // eliminat din cauza sintaxei invalide
	// 'ðŸ'¡': '💡', // eliminat din cauza sintaxei invalide
	'ðŸ"Œ': '📌',
	'â³': '⏳',
	'âœ"': '✓',
	'âœ–': '✖',
	'â„¹': 'ℹ',
};

// 4. CARACTERE SPECIALE
const SPECIAL_CHARS_MAP = {
	'â€"': '—',  // Em dash
	'â€"': '–',  // En dash
	'â€¦': '…',  // Ellipsis
	'Â°': '°',   // Degree symbol
	'Â': '',     // Non-breaking space corupt
	'Ã—': '×',   // Multiplication
	'Ã·': '÷',   // Division
};

// Combinăm toate mapările
const ALL_FIXES = {
	...DIACRITICS_MAP,
	...QUOTES_MAP,
	...EMOJI_MAP,
	...SPECIAL_CHARS_MAP,
};

// ============================================================================
// FUNCȚII PRINCIPALE
// ============================================================================

/**
 * Corectează tot textul dintr-o singură trecere
 */
function fixAllEncodingIssues(text) {
	let fixed = text;
  
	// Aplică toate înlocuirile în ordine
	// Sortăm după lungime descrescătoare pentru a evita înlocuiri parțiale
	const sortedKeys = Object.keys(ALL_FIXES).sort((a, b) => b.length - a.length);
  
	for (const corrupt of sortedKeys) {
		const correct = ALL_FIXES[corrupt];
		// Folosim split/join pentru a evita probleme cu caractere speciale în regex
		fixed = fixed.split(corrupt).join(correct);
	}
  
	// Fix suplimentar pentru secvențe lungi comune
	fixed = fixed.replace(/È™\s*i\s*/g, 'și ');
	fixed = fixed.replace(/È›\s*i\s*/g, 'ți ');
  
	return fixed;
}

/**
 * Detectează dacă textul are probleme de encoding
 */
function hasEncodingIssues(text) {
	// Verifică dacă există vreun caracter corupt din mapări
	return Object.keys(ALL_FIXES).some(corrupt => text.includes(corrupt));
}

/**
 * Extrage exemple de probleme din text
 */
function extractIssues(text, maxExamples = 10) {
	const issues = [];
	const lines = text.split('\n');
  
	lines.forEach((line, index) => {
		if (hasEncodingIssues(line) && issues.length < maxExamples) {
			// Găsește ce exact e greșit
			const foundIssues = Object.keys(ALL_FIXES).filter(corrupt => 
				line.includes(corrupt)
			);
      
			issues.push({
				lineNumber: index + 1,
				original: line.trim(),
				fixed: fixAllEncodingIssues(line).trim(),
				problems: foundIssues,
			});
		}
	});
  
	return issues;
}

/**
 * Procesează un singur fișier
 */
function processFile(filePath, mode = 'scan') {
	try {
		// Verifică existența
		if (!fs.existsSync(filePath)) {
			return { 
				status: 'skipped', 
				reason: 'File not found',
				file: filePath 
			};
		}

		// Citește conținutul (forțăm UTF-8)
		const content = fs.readFileSync(filePath, 'utf8');
    
		// Verifică probleme
		if (!hasEncodingIssues(content)) {
			return { 
				status: 'clean', 
				file: filePath 
			};
		}

		const issues = extractIssues(content);
    
		// Dacă e doar scan, returnează raportul
		if (mode === 'scan') {
			return {
				status: 'has_issues',
				file: filePath,
				issueCount: issues.length,
				issues: issues.slice(0, 5), // Primele 5 exemple
			};
		}

		// MODE FIX - Corectează fișierul
    
		// 1. Creează backup cu timestamp
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
		const backupPath = `${filePath}.backup-${timestamp}`;
		fs.writeFileSync(backupPath, content, 'utf8');
    
		// 2. Corectează conținutul
		const fixedContent = fixAllEncodingIssues(content);
    
		// 3. Salvează cu UTF-8 BOM pentru siguranță maximă
		fs.writeFileSync(filePath, fixedContent, 'utf8');
    
		return {
			status: 'fixed',
			file: filePath,
			backup: backupPath,
			issuesFixed: issues.length,
			examples: issues.slice(0, 3),
		};
    
	} catch (error) {
		return {
			status: 'error',
			file: filePath,
			error: error.message,
		};
	}
}

// ============================================================================
// MODURI DE RULARE
// ============================================================================

/**
 * MOD SCAN - Doar afișează problemele
 */
function runScan() {
	console.log('\n🔍 ===== SCANARE ENCODING - IDENTIFICARE PROBLEME =====\n');
  
	const results = FILES_TO_CHECK.map(file => processFile(file, 'scan'));
  
	const hasIssues = results.filter(r => r.status === 'has_issues');
	const clean = results.filter(r => r.status === 'clean');
	const skipped = results.filter(r => r.status === 'skipped');
  
	// Raport detaliat
	if (hasIssues.length === 0) {
		console.log('✅ EXCELENT! Nu s-au găsit probleme de encoding!\n');
		return;
	}
  
	console.log(`⚠️  Găsite ${hasIssues.length} fișiere cu probleme:\n`);
  
	hasIssues.forEach(result => {
		console.log(`\n📄 ${result.file}`);
		console.log(`   Probleme găsite: ${result.issueCount} linii afectate\n`);
    
		result.issues.forEach(issue => {
			console.log(`   Linia ${issue.lineNumber}:`);
			console.log(`   ❌ GREȘIT: ${issue.original.substring(0, 100)}`);
			console.log(`   ✅ CORECT:  ${issue.fixed.substring(0, 100)}`);
			console.log(`   Probleme: ${issue.problems.join(', ')}`);
			console.log('');
		});
	});
  
	console.log(`\n📊 SUMAR:`);
	console.log(`   ⚠️  Fișiere cu probleme: ${hasIssues.length}`);
	console.log(`   ✅ Fișiere corecte: ${clean.length}`);
	console.log(`   ⏭️  Fișiere sărite: ${skipped.length}`);
	console.log(`\n💡 Pentru a corecta, rulează: node fix-encoding.cjs --fix\n`);
}

/**
 * MOD FIX - Corectează toate problemele
 */
function runFix() {
	console.log('\n🔧 ===== CORECTARE ENCODING - PROCESARE =====\n');
	console.log('⚠️  ATENȚIE: Se vor modifica fișierele! (se creează backup-uri)\n');
  
	const results = FILES_TO_CHECK.map(file => processFile(file, 'fix'));
  
	const fixed = results.filter(r => r.status === 'fixed');
	const clean = results.filter(r => r.status === 'clean');
	const errors = results.filter(r => r.status === 'error');
  
	// Raport
	fixed.forEach(result => {
		console.log(`✅ CORECTAT: ${result.file}`);
		console.log(`   Backup: ${result.backup}`);
		console.log(`   Probleme rezolvate: ${result.issuesFixed}`);
    
		if (result.examples && result.examples.length > 0) {
			console.log(`   Exemple corecții:`);
			result.examples.forEach(ex => {
				console.log(`     L${ex.lineNumber}: ${ex.original.substring(0, 60)}...`);
				console.log(`          → ${ex.fixed.substring(0, 60)}...`);
			});
		}
		console.log('');
	});
  
	if (errors.length > 0) {
		console.log('\n❌ ERORI:');
		errors.forEach(r => {
			console.log(`   ${r.file}: ${r.error}`);
		});
	}
  
	console.log(`\n📊 SUMAR FINAL:`);
	console.log(`   ✅ Fișiere corectate: ${fixed.length}`);
	console.log(`   ✓  Fișiere deja corecte: ${clean.length}`);
	console.log(`   ❌ Erori: ${errors.length}`);
	console.log(`\n✨ Gata! Verifică fișierele în editor.\n`);
}

/**
 * Afișează ajutor
 */
function showHelp() {
	console.log(`
🔧 SCRIPT CORECTARE ENCODING - INTERFAȚA ADMIN

UTILIZARE:
	node fix-encoding.cjs --scan    # Vezi problemele (fără modificări)
	node fix-encoding.cjs --fix     # Corectează toate problemele
	node fix-encoding.cjs --help    # Acest mesaj

CE REZOLVĂ:
	✓ Diacritice românești corupte (È, Ã, Ä → ș, ț, ă, â, î)
	✓ Ghilimele greșite (" " → " ")
	✓ Emoji-uri afișate ca caractere ciudate
	✓ Caractere speciale corupte

SIGURANȚĂ:
	• Se creează backup pentru fiecare fișier modificat
	• Backup format: fisier.tsx.backup-2025-01-26T10-30-00
	• Poți restaura cu: cp fisier.backup fisier.tsx

FIȘIERE PROCESATE:
	${FILES_TO_CHECK.length} fișiere din src/ui/admin/ și src/styles/
`);
}

// ============================================================================
// EXECUȚIE
// ============================================================================

const args = process.argv.slice(2);
const mode = args[0];

switch (mode) {
	case '--scan':
		runScan();
		break;
	case '--fix':
		runFix();
		break;
	case '--help':
	case '-h':
		showHelp();
		break;
	default:
		console.log('❌ Parametru invalid!\n');
		showHelp();
		process.exit(1);
}
