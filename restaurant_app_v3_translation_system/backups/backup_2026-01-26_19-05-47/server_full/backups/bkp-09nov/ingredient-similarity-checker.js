/**
 * INGREDIENT SIMILARITY CHECKER
 * Detectează ingrediente similare pentru prevenirea duplicatelor
 */

/**
 * Calculează distanța Levenshtein între două string-uri
 * (numărul minim de operații pentru a transforma un string în altul)
 */
function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    // Inițializare matrice
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Calculare distanță
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // ștergere
                matrix[i][j - 1] + 1,      // inserare
                matrix[i - 1][j - 1] + cost // înlocuire
            );
        }
    }

    return matrix[len1][len2];
}

/**
 * Normalizează string pentru comparație
 * - elimină diacritice
 * - lowercase
 * - elimină apostroafe, ghilimele
 * - trimite spații
 */
function normalizeString(str) {
    if (!str) return '';
    
    return str
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // elimină diacritice
        .replace(/[''`]/g, '')  // elimină apostroafe
        .replace(/["""]/g, '')  // elimină ghilimele
        .replace(/\s+/g, ' ')   // normalizează spații
        .trim();
}

/**
 * Calculează similaritatea între două nume de ingrediente (0-100%)
 */
function calculateSimilarity(name1, name2) {
    const normalized1 = normalizeString(name1);
    const normalized2 = normalizeString(name2);
    
    // Cazuri exact identice
    if (normalized1 === normalized2) {
        return 100;
    }
    
    // Verifică dacă unul conține pe celălalt
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
        const longer = Math.max(normalized1.length, normalized2.length);
        const shorter = Math.min(normalized1.length, normalized2.length);
        return Math.round((shorter / longer) * 100);
    }
    
    // Calculare similaritate folosind Levenshtein
    const maxLen = Math.max(normalized1.length, normalized2.length);
    const distance = levenshteinDistance(normalized1, normalized2);
    const similarity = ((maxLen - distance) / maxLen) * 100;
    
    return Math.round(similarity);
}

/**
 * Analizează diferențele între două ingrediente similare
 * Pentru a ajuta utilizatorul să decidă dacă sunt cu adevărat diferite
 */
function analyzeDifferences(name1, name2) {
    const normalized1 = normalizeString(name1);
    const normalized2 = normalizeString(name2);
    
    const differences = [];
    
    // Cuvinte specifice care indică variante diferite
    const specificWords = [
        'tocata', 'tocat', 'cuburi', 'cubulete', 'felii', 'file', 'pulpa', 'piept',
        'macra', 'gras', 'degresat', 'integral', 'light',
        'proaspat', 'congelat', 'uscat', 'ras', 'maruntit',
        'neagra', 'alba', 'cu', 'fara', 'afumat', 'nepasteurizat'
    ];
    
    // Verifică dacă un nume are cuvinte specifice pe care celălalt nu le are
    specificWords.forEach(word => {
        const has1 = normalized1.includes(word);
        const has2 = normalized2.includes(word);
        
        if (has1 && !has2) {
            differences.push(`"${name1}" conține "${word}", dar "${name2}" nu`);
        } else if (has2 && !has1) {
            differences.push(`"${name2}" conține "${word}", dar "${name1}" nu`);
        }
    });
    
    // Verifică lungimea - dacă diferă mult, probabil sunt diferite
    const lengthDiff = Math.abs(name1.length - name2.length);
    if (lengthDiff > 10) {
        differences.push(`Diferență mare de lungime (${lengthDiff} caractere)`);
    }
    
    return {
        hasDifferences: differences.length > 0,
        differences: differences,
        recommendation: differences.length > 0 
            ? 'Pare să fie ingredient diferit (are specificații suplimentare)'
            : 'Pare să fie același ingredient (doar diferențe minore)'
    };
}

/**
 * Găsește ingrediente similare într-o listă
 * @param {string} newIngredientName - Numele ingredientului nou
 * @param {Array} existingIngredients - Lista ingredientelor existente [{id, name, ...}]
 * @param {number} threshold - Pragul de similaritate (0-100, default 75)
 * @returns {Array} - Lista ingredientelor similare sortată după similaritate
 */
function findSimilarIngredients(newIngredientName, existingIngredients, threshold = 75) {
    const similarities = [];
    
    existingIngredients.forEach(ingredient => {
        const similarity = calculateSimilarity(newIngredientName, ingredient.name);
        
        if (similarity >= threshold) {
            similarities.push({
                id: ingredient.id,
                name: ingredient.name,
                similarity: similarity,
                category: ingredient.category,
                unit: ingredient.unit,
                current_stock: ingredient.current_stock
            });
        }
    });
    
    // Sortează descrescător după similaritate
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities;
}

/**
 * Verifică dacă un ingredient există deja (exact sau foarte similar)
 * @returns {Object} {exists: boolean, exact: boolean, similar: Array}
 */
function checkIngredientExists(newIngredientName, existingIngredients) {
    const normalizedNew = normalizeString(newIngredientName);
    
    // Verificare exactă
    const exactMatch = existingIngredients.find(ing => 
        normalizeString(ing.name) === normalizedNew
    );
    
    if (exactMatch) {
        return {
            exists: true,
            exact: true,
            match: exactMatch,
            similar: []
        };
    }
    
    // Verificare similaritate mare (>= 85%)
    const similar = findSimilarIngredients(newIngredientName, existingIngredients, 85);
    
    return {
        exists: similar.length > 0,
        exact: false,
        match: similar[0] || null,
        similar: similar
    };
}

/**
 * Generează sugestii de ingrediente bazat pe input parțial
 * @param {string} partialName - Input parțial (ex: "bail")
 * @param {Array} existingIngredients - Lista ingredientelor existente
 * @param {number} limit - Număr maxim de sugestii (default 10)
 * @returns {Array} - Lista sugestiilor
 */
function getSuggestions(partialName, existingIngredients, limit = 10) {
    if (!partialName || partialName.length < 2) {
        return [];
    }
    
    const normalizedPartial = normalizeString(partialName);
    const suggestions = [];
    
    existingIngredients.forEach(ingredient => {
        const normalizedName = normalizeString(ingredient.name);
        
        // Verifică dacă începe cu input-ul
        if (normalizedName.startsWith(normalizedPartial)) {
            suggestions.push({
                ...ingredient,
                matchType: 'starts_with',
                priority: 3
            });
        }
        // Verifică dacă conține input-ul
        else if (normalizedName.includes(normalizedPartial)) {
            suggestions.push({
                ...ingredient,
                matchType: 'contains',
                priority: 2
            });
        }
        // Verifică similaritate
        else {
            const similarity = calculateSimilarity(partialName, ingredient.name);
            if (similarity >= 60) {
                suggestions.push({
                    ...ingredient,
                    matchType: 'similar',
                    similarity: similarity,
                    priority: 1
                });
            }
        }
    });
    
    // Sortează după prioritate și apoi alfabetic
    suggestions.sort((a, b) => {
        if (a.priority !== b.priority) {
            return b.priority - a.priority;
        }
        return a.name.localeCompare(b.name);
    });
    
    return suggestions.slice(0, limit);
}

module.exports = {
    calculateSimilarity,
    findSimilarIngredients,
    checkIngredientExists,
    getSuggestions,
    normalizeString,
    levenshteinDistance,
    analyzeDifferences
};

