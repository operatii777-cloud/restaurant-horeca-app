const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Feature routes
const guestIdentityRoutes = require('./routes/guestIdentity');
const paymentsRoutes = require('./routes/payments');
const supplyChainRoutes = require('./routes/supplyChain');
const laborRoutes = require('./routes/labor');
const warRoomRoutes = require('./routes/warRoom');
const infrastructureRoutes = require('./routes/infrastructure');
const experienceRoutes = require('./routes/experience');
const darkKitchenRoutes = require('./routes/darkKitchen');
const revenueRoutes = require('./routes/revenue');
const franchiseRoutes = require('./routes/franchise');
const apiEconomyRoutes = require('./routes/apiEconomy');
const dataNetworkRoutes = require('./routes/dataNetwork');
const riskRoutes = require('./routes/risk');
const financialRoutes = require('./routes/financial');
const superappRoutes = require('./routes/superapp');

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', version: '2.0.0' });
});

// Mount feature routes
app.use('/api/guests', guestIdentityRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/supply-chain', supplyChainRoutes);
app.use('/api/labor', laborRoutes);
app.use('/api/war-room', warRoomRoutes);
app.use('/api/infrastructure', infrastructureRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/dark-kitchen', darkKitchenRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/franchise', franchiseRoutes);
app.use('/api/api-economy', apiEconomyRoutes);
app.use('/api/data-network', dataNetworkRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/superapp', superappRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
