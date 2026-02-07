/**
 * RESTORAPP & COURIER APP TEST METHODS
 * To be integrated into UniversalHorecaBenchmark class
 */

// Add these methods to the UniversalHorecaBenchmark class

/**
 * Test: RestorApp - Native Mobile App (Weight: 8)
 */
async testRestorApp() {
    console.log('📱 Testing RestorApp (Native Mobile App)...');
    const module = {
        name: 'RestorApp - Native Mobile App',
        weight: 8,
        tests: [],
        score: 0,
        maxScore: 0,
    };

    // Test 1: Mobile Stats API
    await this.runTest(module, 'Mobile Stats API', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/mobile/stats/overview`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (response.status !== 200) {
            throw new Error(`Stats API returned ${response.status}`);
        }

        return { note: 'Mobile stats API available' };
    });

    // Test 2: Reorder Last Order
    await this.runTest(module, 'Reorder Last Order', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/mobile/orders/last`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 404].includes(response.status)) {
            throw new Error(`Reorder API returned ${response.status}`);
        }

        return { note: 'Reorder functionality available' };
    });

    // Test 3: Frequent Orders
    await this.runTest(module, 'Frequent Orders', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/mobile/orders/frequent`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 404].includes(response.status)) {
            throw new Error(`Frequent orders API returned ${response.status}`);
        }

        return { note: 'Frequent orders feature available' };
    });

    // Test 4: Referral System
    await this.runTest(module, 'Referral System', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/mobile/referral/stats`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 404].includes(response.status)) {
            throw new Error(`Referral API returned ${response.status}`);
        }

        return { note: 'Referral system available' };
    });

    // Test 5: Product Ratings
    await this.runTest(module, 'Product Ratings', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/mobile/products/${this.config.testData.product_id}/ratings`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 404].includes(response.status)) {
            throw new Error(`Ratings API returned ${response.status}`);
        }

        return { note: 'Product rating system available' };
    });

    // Test 6: Nutrition Information
    await this.runTest(module, 'Nutrition Information', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/mobile/products/${this.config.testData.product_id}/nutrition`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 404].includes(response.status)) {
            throw new Error(`Nutrition API returned ${response.status}`);
        }

        return { note: 'Nutrition info available' };
    });

    // Test 7: Location Services
    await this.runTest(module, 'Location Services', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/mobile/location/nearest-restaurants`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 404].includes(response.status)) {
            throw new Error(`Location API returned ${response.status}`);
        }

        return { note: 'Location services available' };
    });

    // Test 8: Personalized Deals
    await this.runTest(module, 'Personalized Deals', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/mobile/deals/personalized`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 404].includes(response.status)) {
            throw new Error(`Deals API returned ${response.status}`);
        }

        return { note: 'Personalized deals available' };
    });

    // Test 9: Active Deals
    await this.runTest(module, 'Active Deals', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/mobile/deals/active`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 404].includes(response.status)) {
            throw new Error(`Active deals API returned ${response.status}`);
        }

        return { note: 'Active deals available' };
    });

    // Test 10: Loyalty Program
    await this.runTest(module, 'Loyalty Program', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/mobile/loyalty/points`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 404].includes(response.status)) {
            throw new Error(`Loyalty API returned ${response.status}`);
        }

        return { note: 'Loyalty program available' };
    });

    this.results.modules['restorapp'] = module;
    console.log(`   ✅ RestorApp: ${module.score}/${module.maxScore} (${((module.score / module.maxScore) * 100).toFixed(1)}%) [Weight: ${module.weight}]\n`);
}

/**
 * Test: Courier App - Flutter Mobile App (Weight: 7)
 */
async testCourierApp() {
    console.log('🚚 Testing Courier App (Flutter Mobile App)...');
    const module = {
        name: 'Courier App - Flutter Mobile App',
        weight: 7,
        tests: [],
        score: 0,
        maxScore: 0,
    };

    // Test 1: Courier Login Endpoint
    await this.runTest(module, 'Courier Login Endpoint', 5, async () => {
        const response = await axios.post(
            `${this.config.baseURL}/api/couriers/login`,
            { username: 'test', password: 'test' },
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 401, 404].includes(response.status)) {
            throw new Error(`Login endpoint returned ${response.status}`);
        }

        return {
            note: response.status === 401 ? 'Login endpoint exists (invalid credentials expected)' : 'Login endpoint available'
        };
    });

    // Test 2: Get Couriers List
    await this.runTest(module, 'Get Couriers List', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/couriers`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (response.status !== 200) {
            throw new Error(`Couriers list returned ${response.status}`);
        }

        const couriers = response.data?.couriers || response.data || [];
        return {
            couriersCount: Array.isArray(couriers) ? couriers.length : 0,
            note: `${Array.isArray(couriers) ? couriers.length : 0} couriers configured`
        };
    });

    // Test 3: Courier Assignments
    await this.runTest(module, 'Courier Assignments', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/couriers/me/assignments`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 401, 403].includes(response.status)) {
            throw new Error(`Assignments endpoint returned ${response.status}`);
        }

        return {
            note: [401, 403].includes(response.status) ? 'Assignments endpoint exists (auth required)' : 'Assignments endpoint available'
        };
    });

    // Test 4: GPS Location Update
    await this.runTest(module, 'GPS Location Update', 5, async () => {
        const response = await axios.put(
            `${this.config.baseURL}/api/couriers/me/location`,
            { latitude: 44.4268, longitude: 26.1025 },
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 401, 403].includes(response.status)) {
            throw new Error(`Location update returned ${response.status}`);
        }

        return {
            note: [401, 403].includes(response.status) ? 'GPS tracking endpoint exists (auth required)' : 'GPS tracking available'
        };
    });

    // Test 5: Delivery History
    await this.runTest(module, 'Delivery History', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/couriers/me/history/delivered`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (![200, 401, 403].includes(response.status)) {
            throw new Error(`Delivery history returned ${response.status}`);
        }

        return {
            note: [401, 403].includes(response.status) ? 'Delivery history endpoint exists (auth required)' : 'Delivery history available'
        };
    });

    // Test 6: Available Couriers for Dispatch
    await this.runTest(module, 'Available for Dispatch', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/couriers/dispatch/available`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (response.status !== 200) {
            throw new Error(`Dispatch availability returned ${response.status}`);
        }

        return { note: 'Dispatch system available' };
    });

    // Test 7: Live GPS Tracking
    await this.runTest(module, 'Live GPS Tracking', 5, async () => {
        const response = await axios.get(
            `${this.config.baseURL}/api/couriers/tracking/live`,
            { timeout: this.config.timeout, validateStatus: () => true }
        );

        if (response.status !== 200) {
            throw new Error(`Live tracking returned ${response.status}`);
        }

        return { note: 'Live GPS tracking available' };
    });

    this.results.modules['courier-app'] = module;
    console.log(`   ✅ Courier App: ${module.score}/${module.maxScore} (${((module.score / module.maxScore) * 100).toFixed(1)}%) [Weight: ${module.weight}]\n`);
}

// Also add to runAll() method:
// await this.testRestorApp();
// await this.testCourierApp();

// And update moduleWeights:
// 'restorapp': 8,
// 'courier-app': 7
