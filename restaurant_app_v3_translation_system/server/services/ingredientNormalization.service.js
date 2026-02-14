// Ingredient Normalization Service
// Purpose: Standardize and unify ingredient names across recipes and stock
// Created: 13 Feb 2026
// Implements HORECA industry standards (Toast, Lightspeed, Freya, Boogit)

/**
 * Ingredient Normalization Service
 * Handles standardization, deduplication, and variant mapping for ingredients
 */
class IngredientNormalizationService {
    constructor() {
        // Items to ignore in stock management (non-stock ingredients)
        this.IGNORE_LIST = [
            'apa fierbinte',
            'apa caldă',
            'apa rece',
            'gheață',
            'apă fierbinte',
            'apă caldă',
            'apă rece',
            'spuma de lapte',
            'abur',
            'aer'
        ];

        // Standard ingredient mappings (variant -> canonical name)
        this.STANDARD_MAPPINGS = {
            // Bell peppers - all variants map to base name
            'ardei gras': 'ardei gras',
            'ardei roșu': 'ardei gras',
            'ardei rosu': 'ardei gras',
            'ardei galben': 'ardei gras',
            'ardei verde': 'ardei gras',
            'ardei grătar': 'ardei gras',
            'ardei capia': 'ardei gras',
            
            // Hot peppers - keep separate
            'ardei iute': 'ardei iute',
            'ardei iute roșu': 'ardei iute',
            'ardei iute rosu': 'ardei iute',
            'ardei iute verde': 'ardei iute',
            'chili': 'ardei iute',
            'ardei chili': 'ardei iute',
            
            // Specialty hot peppers - keep separate by type
            'ardei iute habanero': 'ardei iute habanero',
            'ardei iute jalapeño': 'ardei iute jalapeño',
            'ardei iute jalapeno': 'ardei iute jalapeño',
            'ardei iute serrano': 'ardei iute serrano',
            'ardei iute poblano': 'ardei iute poblano',
            'ardei iute anaheim': 'ardei iute anaheim',
            'ardei iute thai': 'ardei iute thai',
            
            // Onions
            'ceapă': 'ceapă',
            'ceapa': 'ceapă',
            'ceapă tocată': 'ceapă',
            'ceapa tocata': 'ceapă',
            'ceapă albă': 'ceapă',
            'ceapa alba': 'ceapă',
            'ceapă roșie': 'ceapă roșie',
            'ceapa rosie': 'ceapă roșie',
            'ceapă verde': 'ceapă verde',
            'ceapa verde': 'ceapă verde',
            
            // Milk variants
            'lapte': 'lapte',
            'lapte de vacă': 'lapte',
            'lapte de vaca': 'lapte',
            'lapte integral': 'lapte',
            'lapte condensat': 'lapte condensat',
            'lapte condensat îndulcit': 'lapte condensat',
            'lapte condensat indulcit': 'lapte condensat',
            
            // Bread
            'pâine': 'pâine',
            'paine': 'pâine',
            'pâine albă': 'pâine albă',
            'paine alba': 'pâine albă',
            'pâine neagră': 'pâine neagră',
            'paine neagra': 'pâine neagră',
            'pâine integrală': 'pâine integrală',
            'paine integrala': 'pâine integrală',
            
            // Flour
            'făină': 'făină',
            'faina': 'făină',
            'făină albă': 'făină albă',
            'faina alba': 'făină albă',
            'făină neagră': 'făină neagră',
            'faina neagra': 'făină neagră',
            'făină integrală': 'făină integrală',
            'faina integrala': 'făină integrală',
            
            // Ground meat - keep types separate
            'carne tocată': 'carne tocată',
            'carne tocata': 'carne tocată',
            'carne tocată vită': 'carne tocată vită',
            'carne tocata vita': 'carne tocată vită',
            'carne tocată viţă': 'carne tocată vită',
            'carne tocată porc': 'carne tocată porc',
            'carne tocată amestec': 'carne tocată amestec',
            'carne tocată amestec porc-vită': 'carne tocată amestec',
            'carne tocata amestec porc-vita': 'carne tocată amestec',
            
            // Pork cuts - keep separate
            'ceafă porc': 'ceafă porc',
            'ceafa porc': 'ceafă porc',
            'cotlet porc': 'cotlet porc',
            'cotlet de porc': 'cotlet porc',
            'pulpă porc': 'pulpă porc',
            'pulpa porc': 'pulpă porc',
            'mușchi porc': 'mușchi porc',
            'muschi porc': 'mușchi porc',
            
            // Chicken cuts - keep separate
            'piept pui': 'piept pui',
            'piept de pui': 'piept pui',
            'pulpe pui': 'pulpe pui',
            'pulpe de pui': 'pulpe pui',
            'aripioare pui': 'aripioare pui',
            'aripioare de pui': 'aripioare pui',
            'carne de pui': 'carne de pui'
        };

        // Diacritic normalization map
        this.DIACRITIC_MAP = {
            'ă': 'ă', 'â': 'â', 'î': 'î', 'ș': 'ș', 'ț': 'ț',
            'Ă': 'Ă', 'Â': 'Â', 'Î': 'Î', 'Ș': 'Ș', 'Ț': 'Ț',
            'a': 'a', 's': 's', 't': 't', 'i': 'i'
        };
    }

    /**
     * Normalize ingredient name to standard form
     * @param {string} name - Raw ingredient name
     * @returns {string} Normalized name
     */
    normalizeIngredientName(name) {
        if (!name) return '';
        
        // Convert to lowercase for comparison
        const lowerName = name.toLowerCase().trim();
        
        // Check if in ignore list
        if (this.isIgnoredIngredient(lowerName)) {
            return null; // Signal to skip this ingredient
        }
        
        // Apply standard mapping if exists
        if (this.STANDARD_MAPPINGS[lowerName]) {
            return this.STANDARD_MAPPINGS[lowerName];
        }
        
        // Return normalized form (proper casing, trimmed)
        return this.normalizeCase(name.trim());
    }

    /**
     * Check if ingredient should be ignored in stock
     * @param {string} name - Ingredient name
     * @returns {boolean}
     */
    isIgnoredIngredient(name) {
        const lowerName = name.toLowerCase().trim();
        return this.IGNORE_LIST.some(ignored => lowerName.includes(ignored));
    }

    /**
     * Normalize case (capitalize first letter of each word)
     * @param {string} name - Ingredient name
     * @returns {string}
     */
    normalizeCase(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    /**
     * Find duplicate ingredients based on normalized names
     * @param {Array} ingredients - List of ingredient objects
     * @returns {Object} Map of normalized names to ingredient IDs
     */
    findDuplicates(ingredients) {
        const normalizedMap = new Map();
        const duplicates = [];
        
        for (const ingredient of ingredients) {
            const normalized = this.normalizeIngredientName(ingredient.name);
            
            // Skip ignored ingredients
            if (normalized === null) {
                continue;
            }
            
            if (normalizedMap.has(normalized)) {
                // Found duplicate
                duplicates.push({
                    normalized,
                    existing: normalizedMap.get(normalized),
                    duplicate: ingredient
                });
            } else {
                normalizedMap.set(normalized, ingredient);
            }
        }
        
        return {
            normalizedMap,
            duplicates
        };
    }

    /**
     * Get canonical ingredient for a variant name
     * @param {string} variantName - Variant ingredient name
     * @returns {string} Canonical ingredient name
     */
    getCanonicalName(variantName) {
        return this.normalizeIngredientName(variantName);
    }

    /**
     * Remove variant suffixes (Bio, Premium, Organic, etc.)
     * @param {string} name - Ingredient name
     * @returns {string} Base name without suffixes
     */
    removeVariantSuffixes(name) {
        const suffixes = [
            ' - Bio',
            ' - Premium',
            ' - Organic',
            ' - Proaspăt',
            ' - Proaspat',
            ' - Artizanal',
            ' - Maturat',
            ' - Porție',
            ' - Portie',
            ' - File'
        ];
        
        let baseName = name;
        for (const suffix of suffixes) {
            if (baseName.endsWith(suffix)) {
                baseName = baseName.slice(0, -suffix.length);
            }
        }
        
        return baseName.trim();
    }

    /**
     * Analyze ingredients and generate normalization report
     * @param {Array} ingredients - List of ingredient objects
     * @returns {Object} Analysis report
     */
    analyzeIngredients(ingredients) {
        const { normalizedMap, duplicates } = this.findDuplicates(ingredients);
        const ignoredCount = ingredients.filter(i => this.isIgnoredIngredient(i.name)).length;
        
        // Group by base name (without suffixes)
        const baseNameGroups = new Map();
        for (const ingredient of ingredients) {
            const normalized = this.normalizeIngredientName(ingredient.name);
            if (normalized === null) continue;
            
            const baseName = this.removeVariantSuffixes(normalized);
            if (!baseNameGroups.has(baseName)) {
                baseNameGroups.set(baseName, []);
            }
            baseNameGroups.get(baseName).push(ingredient);
        }
        
        // Find groups with multiple variants
        const variantGroups = [];
        for (const [baseName, group] of baseNameGroups.entries()) {
            if (group.length > 1) {
                variantGroups.push({
                    baseName,
                    count: group.length,
                    variants: group.map(i => i.name)
                });
            }
        }
        
        return {
            totalIngredients: ingredients.length,
            uniqueNormalized: normalizedMap.size,
            duplicateCount: duplicates.length,
            ignoredCount,
            duplicates,
            variantGroups: variantGroups.sort((a, b) => b.count - a.count).slice(0, 50), // Top 50
            summary: {
                needsNormalization: duplicates.length > 0,
                hasVariants: variantGroups.length > 0,
                hasIgnoredItems: ignoredCount > 0
            }
        };
    }

    /**
     * Generate unification mapping for database update
     * @param {Array} duplicates - List of duplicate pairs
     * @returns {Array} Mapping for updates
     */
    generateUnificationMapping(duplicates) {
        const mapping = [];
        
        for (const dup of duplicates) {
            mapping.push({
                from: dup.duplicate.id,
                to: dup.existing.id,
                fromName: dup.duplicate.name,
                toName: dup.existing.name,
                normalizedName: dup.normalized
            });
        }
        
        return mapping;
    }
}

module.exports = IngredientNormalizationService;
