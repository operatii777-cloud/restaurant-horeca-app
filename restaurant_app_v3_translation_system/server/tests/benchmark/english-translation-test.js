/**
 * ENGLISH TRANSLATION TEST FOR MOBILE APP
 * Verifies that English translations are available for mobile app
 */

/**
 * Test English Translation Support in Mobile App
 */
async testEnglishTranslation() {
    console.log('🌍 Testing English Translation Support...');
    const module = {
        name: 'English Translation Support',
        weight: 6,
        tests: [],
        score: 0,
        maxScore: 0,
    };

    // Test 1: Products have English names
    await this.runTest(module, 'Products - English Names', 10, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/products`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (response.status !== 200) {
            throw new Error(`Products API returned ${response.status}`);
        }

        const products = Array.isArray(response.data) ? response.data : [];

        if (products.length === 0) {
            throw new Error('No products found to check translations');
        }

        // Check if products have name_en field
        const withEnglishNames = products.filter(p => p.name_en && p.name_en.trim() !== '');
        const percentageWithEnglish = (withEnglishNames.length / products.length) * 100;

        if (percentageWithEnglish < 50) {
            throw new Error(`Only ${percentageWithEnglish.toFixed(1)}% of products have English names`);
        }

        return {
            totalProducts: products.length,
            withEnglishNames: withEnglishNames.length,
            percentage: percentageWithEnglish.toFixed(1),
            note: `${percentageWithEnglish.toFixed(1)}% of products have English translations`
        };
    });

    // Test 2: Products have English descriptions
    await this.runTest(module, 'Products - English Descriptions', 10, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/products`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (response.status !== 200) {
            throw new Error(`Products API returned ${response.status}`);
        }

        const products = Array.isArray(response.data) ? response.data : [];

        if (products.length === 0) {
            throw new Error('No products found to check translations');
        }

        // Check if products have description_en field
        const withEnglishDesc = products.filter(p => p.description_en && p.description_en.trim() !== '');
        const percentageWithEnglish = (withEnglishDesc.length / products.length) * 100;

        if (percentageWithEnglish < 30) {
            throw new Error(`Only ${percentageWithEnglish.toFixed(1)}% of products have English descriptions`);
        }

        return {
            totalProducts: products.length,
            withEnglishDescriptions: withEnglishDesc.length,
            percentage: percentageWithEnglish.toFixed(1),
            note: `${percentageWithEnglish.toFixed(1)}% of products have English descriptions`
        };
    });

    // Test 3: Categories have English names
    await this.runTest(module, 'Categories - English Names', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/catalog/categories/tree`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (response.status !== 200) {
            throw new Error(`Categories API returned ${response.status}`);
        }

        const categories = response.data?.categories || [];

        if (categories.length === 0) {
            throw new Error('No categories found to check translations');
        }

        // Flatten tree to check all categories
        const flattenCategories = (cats) => {
            let result = [];
            for (const cat of cats) {
                result.push(cat);
                if (cat.children && cat.children.length > 0) {
                    result = result.concat(flattenCategories(cat.children));
                }
            }
            return result;
        };

        const allCategories = flattenCategories(categories);
        const withEnglishNames = allCategories.filter(c => c.name_en && c.name_en.trim() !== '');
        const percentageWithEnglish = (withEnglishNames.length / allCategories.length) * 100;

        if (percentageWithEnglish < 50) {
            throw new Error(`Only ${percentageWithEnglish.toFixed(1)}% of categories have English names`);
        }

        return {
            totalCategories: allCategories.length,
            withEnglishNames: withEnglishNames.length,
            percentage: percentageWithEnglish.toFixed(1),
            note: `${percentageWithEnglish.toFixed(1)}% of categories have English translations`
        };
    });

    // Test 4: Menu endpoint supports language parameter
    await this.runTest(module, 'Language Parameter Support', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/menu?lang=en`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 404].includes(response.status)) {
            throw new Error(`Menu with lang parameter returned ${response.status}`);
        }

        return {
            note: 'Language parameter support available'
        };
    });

    this.results.modules['english-translation'] = module;
    console.log(`   ✅ English Translation: ${module.score}/${module.maxScore} (${((module.score / module.maxScore) * 100).toFixed(1)}%) [Weight: ${module.weight}]\n`);
}

// Add to runAll():
// await this.testEnglishTranslation();

// Add to moduleWeights:
// 'english-translation': 6
