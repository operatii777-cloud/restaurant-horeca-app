const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'retete', 'retete-actuale');

// Map of common mojibake to correct characters
const REPLACEMENTS = [
    // Corrected mappings based on verification
    { from: /ÃƒÂˆÃ¢Â„Â¢/g, to: 'ș' }, // Correct mapping for ș
    { from: /ÃƒÂˆÃ¢Â€Âº/g, to: 'ț' }, // Correct mapping for ț

    { from: /Ã„Âƒ/g, to: 'ă' },
    { from: /Ã†Â’/g, to: '' }, // Often follows Ã„Âƒ as garbage
    { from: /ÃƒÂ¢/g, to: 'â' },
    { from: /ÃƒÂ®/g, to: 'î' },
    { from: /ÃƒÂ‚/g, to: 'Â' },
    { from: /Ã‚/g, to: '' }, // Garbage
    { from: /Ã¢Â€Â“/g, to: '-' },
    { from: /Ã¢Â„Â¢/g, to: '' },
    { from: /Ã¢Â€Â/g, to: '' },
    { from: /Ã…Â£/g, to: 'ț' },
    { from: /Ã…Â/g, to: 'ș' },
    { from: /Â/g, to: '' }, // Often appears as spacer
    { from: /Ãƒ/g, to: '' }, // Leftover prefix

    // Direct word fixes based on observed data
    { from: /BÃ„ÂƒÃ†Â’uturi/g, to: 'Băuturi' },
    { from: /LÃ„ÂƒÃ†Â’mÃƒÂ¢ie/g, to: 'Lămâie' },
    { from: /GheaÃƒÂˆÃ¢Â€ÂºÃ„ÂƒÃ†Â’/g, to: 'Gheață' },
    { from: /AlbuÃƒÂˆÃ¢Â„Â¢/g, to: 'Albuș' },
    { from: /ÃƒÂˆÃ¢Â„Â¢i/g, to: 'și' },
    { from: /ZmeurÃ„ÂƒÃ†Â’/g, to: 'Zmeură' },
    { from: /MentÃ„ÂƒÃ†Â’/g, to: 'Mentă' },
    { from: /ProaspÃ„ÂƒÃ†Â’t/g, to: 'Proaspăt' },

    // Emoji pattern (generic fix for some common ones if possible, otherwise strip or manually map)
    { from: /ðŸŽ/g, to: '🎁' },
];

// Refined word-level fixes
const WORD_FIXES = [
    { from: /Albuț/g, to: 'Albuș' },
    { from: / ți /g, to: ' și ' },
    { from: / roții/g, to: ' roșii' },
    { from: /Roții/g, to: 'Roșii' },
    { from: /cațcaval/g, to: 'cașcaval' },
    { from: /Cațcaval/g, to: 'Cașcaval' },
    { from: /inghețatâ/g, to: 'inghețată' }, // â at end often ă
    { from: /Dulceațâ/g, to: 'Dulceață' },
    { from: /tâieti/g, to: 'tăieței' },
    { from: /mămăligâ/g, to: 'mămăligă' },
    { from: /muțtar/g, to: 'muștar' },
    { from: /Muțtar/g, to: 'Muștar' },
    { from: /mițcare/g, to: 'mișcare' },
    { from: /Mițcare/g, to: 'Mișcare' },
    { from: /șnițel/g, to: 'șnițel' },
    { from: /piure/g, to: 'piure' },
    { from: /ciorbâ/g, to: 'ciorbă' },
    { from: /Ciorbâ/g, to: 'Ciorbă' },
    { from: /gulaț/g, to: 'gulaș' },
    { from: /Gulaț/g, to: 'Gulaș' }
];

function repairString(str) {
    let newStr = str;

    // First try the specific replacements for known bad sequences
    REPLACEMENTS.forEach(r => {
        newStr = newStr.replace(r.from, r.to);
    });

    // Apply word-specific semantic fixes (second pass)
    WORD_FIXES.forEach(r => {
        newStr = newStr.replace(r.from, r.to);
    });

    // Manual cleanup for specific Romanian words observed if not caught
    newStr = newStr.replace(/BÃƒÂ¢uturi/g, 'Băuturi');

    return newStr;
}

function processFiles() {
    if (!fs.existsSync(TARGET_DIR)) {
        console.error('Target directory not found:', TARGET_DIR);
        return;
    }

    const files = fs.readdirSync(TARGET_DIR).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} JSON files to process.`);

    let fixedCount = 0;

    files.forEach(file => {
        const filePath = path.join(TARGET_DIR, file);
        try {
            const content = fs.readFileSync(filePath, 'utf8');

            // Remove BOM if present
            const cleanContent = content.replace(/^\uFEFF/, '');

            // Always run repair on content to catch secondary word fixes like 'Albuț'
            let fixedContent = repairString(cleanContent);

            if (fixedContent !== content) {
                fs.writeFileSync(filePath, fixedContent, 'utf8');
                console.log(`Fixed: ${file}`);
                fixedCount++;
            }
        } catch (err) {
            console.error(`Error processing ${file}:`, err.message);
        }
    });

    console.log(`\nComplete! Repaired ${fixedCount} files.`);
}

processFiles();
