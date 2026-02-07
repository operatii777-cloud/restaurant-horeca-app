/**
 * RESTORAPP & COURIER APP SPECIFIC TESTS
 * Tests for native mobile app (RestorApp) and Courier Flutter App endpoints
 */

/**
 * Test RestorApp Endpoints (Native Mobile App)
 */
async function testRestorAppEndpoints(baseURL, timeout, testData) {
    const axios = require('axios');
    const tests = [];

    // Test 1: Mobile Stats API
    try {
        const response = await axios.get(`${baseURL}/api/mobile/stats/overview`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'RestorApp: Mobile Stats API',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: '/api/mobile/stats/overview',
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'RestorApp: Mobile Stats API', status: 'FAIL', error: error.message });
    }

    // Test 2: Reorder Last Order
    try {
        const response = await axios.get(`${baseURL}/api/mobile/orders/last`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'RestorApp: Reorder Last Order',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: '/api/mobile/orders/last',
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'RestorApp: Reorder Last Order', status: 'FAIL', error: error.message });
    }

    // Test 3: Frequent Orders
    try {
        const response = await axios.get(`${baseURL}/api/mobile/orders/frequent`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'RestorApp: Frequent Orders',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: '/api/mobile/orders/frequent',
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'RestorApp: Frequent Orders', status: 'FAIL', error: error.message });
    }

    // Test 4: Referral System
    try {
        const response = await axios.get(`${baseURL}/api/mobile/referral/stats`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'RestorApp: Referral System',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: '/api/mobile/referral/stats',
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'RestorApp: Referral System', status: 'FAIL', error: error.message });
    }

    // Test 5: Product Ratings
    try {
        const response = await axios.get(`${baseURL}/api/mobile/products/${testData.product_id}/ratings`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'RestorApp: Product Ratings',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: `/api/mobile/products/${testData.product_id}/ratings`,
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'RestorApp: Product Ratings', status: 'FAIL', error: error.message });
    }

    // Test 6: Nutrition Information
    try {
        const response = await axios.get(`${baseURL}/api/mobile/products/${testData.product_id}/nutrition`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'RestorApp: Nutrition Info',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: `/api/mobile/products/${testData.product_id}/nutrition`,
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'RestorApp: Nutrition Info', status: 'FAIL', error: error.message });
    }

    // Test 7: Location Services
    try {
        const response = await axios.get(`${baseURL}/api/mobile/location/nearest-restaurants`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'RestorApp: Location Services',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: '/api/mobile/location/nearest-restaurants',
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'RestorApp: Location Services', status: 'FAIL', error: error.message });
    }

    // Test 8: Personalized Deals
    try {
        const response = await axios.get(`${baseURL}/api/mobile/deals/personalized`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'RestorApp: Personalized Deals',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: '/api/mobile/deals/personalized',
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'RestorApp: Personalized Deals', status: 'FAIL', error: error.message });
    }

    // Test 9: Active Deals
    try {
        const response = await axios.get(`${baseURL}/api/mobile/deals/active`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'RestorApp: Active Deals',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: '/api/mobile/deals/active',
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'RestorApp: Active Deals', status: 'FAIL', error: error.message });
    }

    // Test 10: Loyalty Program
    try {
        const response = await axios.get(`${baseURL}/api/mobile/loyalty/points`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'RestorApp: Loyalty Program',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: '/api/mobile/loyalty/points',
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'RestorApp: Loyalty Program', status: 'FAIL', error: error.message });
    }

    return tests;
}

/**
 * Test Courier App Endpoints (Flutter App for Couriers)
 */
async function testCourierAppEndpoints(baseURL, timeout) {
    const axios = require('axios');
    const tests = [];

    // Test 1: Courier Login
    try {
        const response = await axios.post(`${baseURL}/api/couriers/login`, {
            username: 'test_courier',
            password: 'test123'
        }, { timeout, validateStatus: () => true });
        tests.push({
            name: 'Courier App: Login Endpoint',
            status: [200, 401, 404].includes(response.status) ? 'PASS' : 'FAIL',
            endpoint: '/api/couriers/login',
            httpStatus: response.status,
            note: response.status === 401 ? 'Endpoint exists (invalid credentials expected)' : ''
        });
    } catch (error) {
        tests.push({ name: 'Courier App: Login Endpoint', status: 'FAIL', error: error.message });
    }

    // Test 2: Get Couriers List
    try {
        const response = await axios.get(`${baseURL}/api/couriers`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'Courier App: Get Couriers List',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: '/api/couriers',
            httpStatus: response.status,
            couriersCount: response.data?.length || response.data?.couriers?.length || 0
        });
    } catch (error) {
        tests.push({ name: 'Courier App: Get Couriers List', status: 'FAIL', error: error.message });
    }

    // Test 3: Courier Assignments (requires auth, will fail but tests endpoint existence)
    try {
        const response = await axios.get(`${baseURL}/api/couriers/me/assignments`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'Courier App: Get Assignments',
            status: [200, 401, 403].includes(response.status) ? 'PASS' : 'FAIL',
            endpoint: '/api/couriers/me/assignments',
            httpStatus: response.status,
            note: response.status === 401 || response.status === 403 ? 'Endpoint exists (auth required)' : ''
        });
    } catch (error) {
        tests.push({ name: 'Courier App: Get Assignments', status: 'FAIL', error: error.message });
    }

    // Test 4: Courier Location Update (requires auth)
    try {
        const response = await axios.put(`${baseURL}/api/couriers/me/location`, {
            latitude: 44.4268,
            longitude: 26.1025
        }, { timeout, validateStatus: () => true });
        tests.push({
            name: 'Courier App: GPS Location Update',
            status: [200, 401, 403].includes(response.status) ? 'PASS' : 'FAIL',
            endpoint: '/api/couriers/me/location',
            httpStatus: response.status,
            note: response.status === 401 || response.status === 403 ? 'Endpoint exists (auth required)' : ''
        });
    } catch (error) {
        tests.push({ name: 'Courier App: GPS Location Update', status: 'FAIL', error: error.message });
    }

    // Test 5: Delivery History
    try {
        const response = await axios.get(`${baseURL}/api/couriers/me/history/delivered`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'Courier App: Delivery History',
            status: [200, 401, 403].includes(response.status) ? 'PASS' : 'FAIL',
            endpoint: '/api/couriers/me/history/delivered',
            httpStatus: response.status,
            note: response.status === 401 || response.status === 403 ? 'Endpoint exists (auth required)' : ''
        });
    } catch (error) {
        tests.push({ name: 'Courier App: Delivery History', status: 'FAIL', error: error.message });
    }

    // Test 6: Available Couriers for Dispatch
    try {
        const response = await axios.get(`${baseURL}/api/couriers/dispatch/available`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'Courier App: Available for Dispatch',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: '/api/couriers/dispatch/available',
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'Courier App: Available for Dispatch', status: 'FAIL', error: error.message });
    }

    // Test 7: Live Tracking
    try {
        const response = await axios.get(`${baseURL}/api/couriers/tracking/live`, { timeout, validateStatus: () => true });
        tests.push({
            name: 'Courier App: Live GPS Tracking',
            status: response.status === 200 ? 'PASS' : 'FAIL',
            endpoint: '/api/couriers/tracking/live',
            httpStatus: response.status
        });
    } catch (error) {
        tests.push({ name: 'Courier App: Live GPS Tracking', status: 'FAIL', error: error.message });
    }

    return tests;
}

module.exports = {
    testRestorAppEndpoints,
    testCourierAppEndpoints
};
