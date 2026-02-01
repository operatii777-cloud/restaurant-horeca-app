const routes = require('./routes');
const path = require('path');

module.exports = {
    name: 'call-center',
    description: 'Simulated Call Center & Caller ID Service',
    routes: routes,
    // Optional: Add socket listeners if needed directly here, 
    // but usually handled via service or global io reference
    init: async (app, io) => {
        console.log('📞 Call Center Module Initialized');
    }
};
