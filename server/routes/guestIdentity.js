const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory store (replace with DB in production)
const guests = new Map();
const loyaltyTransactions = [];

function generateGuestId() {
  return 'HPID-' + crypto.randomBytes(8).toString('hex').toUpperCase();
}

function riskScore(guest) {
  let score = 0;
  if (guest.chargebacks > 2) score += 40;
  if (guest.refunds > 5) score += 20;
  if (guest.loyaltyPoints < 0) score += 30;
  return Math.min(score, 100);
}

// POST /api/guests - Create or retrieve universal guest
router.post('/', (req, res) => {
  const { email, name, phone, brand, country, gdprConsent } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  let guest = [...guests.values()].find(g => g.email === email);
  if (!guest) {
    guest = {
      id: generateGuestId(),
      email,
      name: name || '',
      phone: phone || '',
      brands: [brand || 'default'],
      countries: [country || 'RO'],
      gdprConsent: gdprConsent || false,
      gdprConsentDate: gdprConsent ? new Date().toISOString() : null,
      loyaltyPoints: 0,
      loyaltyWallet: {},
      lifetimeValue: 0,
      chargebacks: 0,
      refunds: 0,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
    };
    guests.set(guest.id, guest);
  } else {
    if (brand && !guest.brands.includes(brand)) guest.brands.push(brand);
    if (country && !guest.countries.includes(country)) guest.countries.push(country);
    guest.lastSeen = new Date().toISOString();
    if (gdprConsent !== undefined) {
      guest.gdprConsent = gdprConsent;
      guest.gdprConsentDate = gdprConsent ? new Date().toISOString() : null;
    }
  }

  res.json({ ...guest, riskScore: riskScore(guest) });
});

// GET /api/guests - List all guests
router.get('/', (req, res) => {
  const list = [...guests.values()].map(g => ({ ...g, riskScore: riskScore(g) }));
  res.json({ guests: list, total: list.length });
});

// GET /api/guests/:id - Get guest details
router.get('/:id', (req, res) => {
  const guest = guests.get(req.params.id);
  if (!guest) return res.status(404).json({ error: 'Guest not found' });
  res.json({ ...guest, riskScore: riskScore(guest) });
});

// POST /api/guests/:id/loyalty/add - Add loyalty points
router.post('/:id/loyalty/add', (req, res) => {
  const guest = guests.get(req.params.id);
  if (!guest) return res.status(404).json({ error: 'Guest not found' });
  const { points, brand, source } = req.body;
  guest.loyaltyPoints += points || 0;
  guest.loyaltyWallet[brand || 'default'] = (guest.loyaltyWallet[brand || 'default'] || 0) + (points || 0);
  loyaltyTransactions.push({ guestId: guest.id, points, brand, source, type: 'ADD', ts: new Date().toISOString() });
  res.json({ loyaltyPoints: guest.loyaltyPoints, wallet: guest.loyaltyWallet });
});

// POST /api/guests/:id/loyalty/transfer - Cross-brand point transfer
router.post('/:id/loyalty/transfer', (req, res) => {
  const guest = guests.get(req.params.id);
  if (!guest) return res.status(404).json({ error: 'Guest not found' });
  const { fromBrand, toBrand, points } = req.body;
  if ((guest.loyaltyWallet[fromBrand] || 0) < points)
    return res.status(400).json({ error: 'Insufficient points in source brand wallet' });
  guest.loyaltyWallet[fromBrand] -= points;
  guest.loyaltyWallet[toBrand] = (guest.loyaltyWallet[toBrand] || 0) + points;
  loyaltyTransactions.push({ guestId: guest.id, points, fromBrand, toBrand, type: 'TRANSFER', ts: new Date().toISOString() });
  res.json({ wallet: guest.loyaltyWallet });
});

// GET /api/guests/:id/analytics - Behavioral analytics
router.get('/:id/analytics', (req, res) => {
  const guest = guests.get(req.params.id);
  if (!guest) return res.status(404).json({ error: 'Guest not found' });
  const txns = loyaltyTransactions.filter(t => t.guestId === guest.id);
  res.json({
    guestId: guest.id,
    lifetimeValue: guest.lifetimeValue,
    totalPoints: guest.loyaltyPoints,
    riskScore: riskScore(guest),
    brands: guest.brands,
    countries: guest.countries,
    transactions: txns,
  });
});

// DELETE /api/guests/:id/gdpr - GDPR erasure request
router.delete('/:id/gdpr', (req, res) => {
  const guest = guests.get(req.params.id);
  if (!guest) return res.status(404).json({ error: 'Guest not found' });
  guests.delete(req.params.id);
  res.json({ message: 'Guest data erased per GDPR request', guestId: req.params.id });
});

module.exports = router;
