const express = require('express');
const router = express.Router();

const riskEvents = [];

function detectPatterns(events) {
  const refundSpike = events.filter(e => e.type === 'REFUND' && new Date(e.ts) > new Date(Date.now() - 3600000)).length > 5;
  const voidSpike = events.filter(e => e.type === 'VOID' && new Date(e.ts) > new Date(Date.now() - 3600000)).length > 8;
  return { refundSpike, voidSpike };
}

// Seed some demo risk events
['REFUND', 'VOID', 'REFUND', 'DISCOUNT', 'REFUND', 'VOID', 'SHRINKAGE'].forEach((type, i) => {
  riskEvents.push({
    id: 'RE-' + (i + 1),
    type,
    amount: Math.floor(Math.random() * 500),
    employeeId: 'EMP-' + (1 + Math.floor(Math.random() * 5)),
    location: ['LocationA', 'LocationB'][Math.floor(Math.random() * 2)],
    ts: new Date(Date.now() - i * 3600000).toISOString(),
    riskLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
  });
});

// GET /api/risk/events - List risk events
router.get('/events', (req, res) => {
  const { type, location, riskLevel } = req.query;
  let list = riskEvents;
  if (type) list = list.filter(e => e.type === type);
  if (location) list = list.filter(e => e.location === location);
  if (riskLevel) list = list.filter(e => e.riskLevel === riskLevel);
  res.json({ events: list, total: list.length });
});

// POST /api/risk/events - Report a risk event
router.post('/events', (req, res) => {
  const { type, amount, employeeId, location, description } = req.body;
  if (!type) return res.status(400).json({ error: 'type required' });
  const event = {
    id: 'RE-' + Date.now(), type, amount, employeeId, location, description,
    riskLevel: amount > 1000 ? 'HIGH' : amount > 300 ? 'MEDIUM' : 'LOW',
    ts: new Date().toISOString(),
  };
  riskEvents.push(event);
  res.json(event);
});

// GET /api/risk/fraud-detection - Internal fraud detection
router.get('/fraud-detection', (req, res) => {
  const employeeStats = {};
  riskEvents.forEach(e => {
    if (!e.employeeId) return;
    employeeStats[e.employeeId] = employeeStats[e.employeeId] || { refunds: 0, voids: 0, discounts: 0, total: 0 };
    if (e.type === 'REFUND') employeeStats[e.employeeId].refunds++;
    if (e.type === 'VOID') employeeStats[e.employeeId].voids++;
    if (e.type === 'DISCOUNT') employeeStats[e.employeeId].discounts++;
    employeeStats[e.employeeId].total++;
  });
  const suspects = Object.entries(employeeStats)
    .filter(([, s]) => s.refunds > 2 || s.voids > 3)
    .map(([id, stats]) => ({ employeeId: id, ...stats, riskLevel: stats.refunds > 3 || stats.voids > 5 ? 'HIGH' : 'MEDIUM' }));
  res.json({ suspects, totalEvents: riskEvents.length });
});

// GET /api/risk/shrinkage - Shrinkage detection
router.get('/shrinkage', (req, res) => {
  const shrinkageEvents = riskEvents.filter(e => e.type === 'SHRINKAGE');
  const totalShrinkage = shrinkageEvents.reduce((s, e) => s + (e.amount || 0), 0);
  res.json({ events: shrinkageEvents, totalShrinkage, alert: totalShrinkage > 5000 });
});

// GET /api/risk/collusion - Staff collusion patterns
router.get('/collusion', (req, res) => {
  const patterns = [];
  const employeeList = [...new Set(riskEvents.map(e => e.employeeId))];
  for (let i = 0; i < employeeList.length; i++) {
    for (let j = i + 1; j < employeeList.length; j++) {
      const e1Events = riskEvents.filter(e => e.employeeId === employeeList[i] && e.type === 'VOID');
      const e2Events = riskEvents.filter(e => e.employeeId === employeeList[j] && e.type === 'VOID');
      if (e1Events.length > 1 && e2Events.length > 1) {
        patterns.push({ employees: [employeeList[i], employeeList[j]], pattern: 'Multiple voids in same period', riskLevel: 'MEDIUM' });
      }
    }
  }
  res.json({ patterns });
});

// GET /api/risk/fake-reservations - Detect fake reservation patterns
router.get('/fake-reservations', (req, res) => {
  res.json({
    suspiciousPatterns: [
      { pattern: 'Same phone number used 5+ times in 24h', count: 2, riskLevel: 'HIGH' },
      { pattern: 'No-show rate > 80% for email domain', count: 3, riskLevel: 'MEDIUM' },
    ],
    totalFlagged: 5,
  });
});

// GET /api/risk/summary - Risk summary dashboard
router.get('/summary', (req, res) => {
  const patterns = detectPatterns(riskEvents);
  const highRisk = riskEvents.filter(e => e.riskLevel === 'HIGH').length;
  res.json({
    totalEvents: riskEvents.length,
    highRiskEvents: highRisk,
    refundSpike: patterns.refundSpike,
    voidSpike: patterns.voidSpike,
    overallRiskLevel: highRisk > 5 ? 'HIGH' : highRisk > 2 ? 'MEDIUM' : 'LOW',
  });
});

module.exports = router;
