const express = require('express');
const router = express.Router();

const franchises = new Map();
const complianceReports = [];
const auditLogs = [];

// Seed franchises
[
  { id: 'FR-001', name: 'Alpha Restaurant', city: 'Bucharest', royaltyRate: 0.05, revenue: 120000 },
  { id: 'FR-002', name: 'Beta Bistro', city: 'Cluj', royaltyRate: 0.05, revenue: 85000 },
  { id: 'FR-003', name: 'Gamma Grill', city: 'Timisoara', royaltyRate: 0.05, revenue: 95000 },
].forEach(f => {
  franchises.set(f.id, {
    ...f,
    complianceScore: 70 + Math.floor(Math.random() * 30),
    kpiScore: 60 + Math.floor(Math.random() * 40),
    lastAudit: new Date(Date.now() - 30 * 86400000).toISOString(),
    violations: Math.floor(Math.random() * 3),
    royaltyPaid: false,
  });
});

// GET /api/franchise/list - List all franchises
router.get('/list', (req, res) => {
  const list = [...franchises.values()];
  res.json({ franchises: list, total: list.length });
});

// GET /api/franchise/:id - Get franchise details
router.get('/:id', (req, res) => {
  const f = franchises.get(req.params.id);
  if (!f) return res.status(404).json({ error: 'Franchise not found' });
  res.json(f);
});

// GET /api/franchise/royalties/calculate - Auto-calculate royalties
router.get('/royalties/calculate', (req, res) => {
  const royalties = [...franchises.values()].map(f => ({
    franchiseId: f.id,
    name: f.name,
    revenue: f.revenue,
    royaltyRate: f.royaltyRate,
    royaltyAmount: (f.revenue * f.royaltyRate).toFixed(2),
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    paid: f.royaltyPaid,
  }));
  const totalDue = royalties.reduce((s, r) => s + parseFloat(r.royaltyAmount), 0);
  res.json({ royalties, totalDue: totalDue.toFixed(2) });
});

// POST /api/franchise/royalties/:id/pay - Mark royalty as paid
router.post('/royalties/:id/pay', (req, res) => {
  const f = franchises.get(req.params.id);
  if (!f) return res.status(404).json({ error: 'Franchise not found' });
  f.royaltyPaid = true;
  res.json({ franchiseId: f.id, royaltyPaid: true, paidAt: new Date().toISOString() });
});

// GET /api/franchise/compliance/scores - Compliance scoring per location
router.get('/compliance/scores', (req, res) => {
  const scores = [...franchises.values()].map(f => ({
    franchiseId: f.id,
    name: f.name,
    city: f.city,
    complianceScore: f.complianceScore,
    kpiScore: f.kpiScore,
    violations: f.violations,
    lastAudit: f.lastAudit,
    status: f.complianceScore >= 80 ? 'COMPLIANT' : f.complianceScore >= 60 ? 'WARNING' : 'NON_COMPLIANT',
  }));
  res.json({ scores });
});

// POST /api/franchise/:id/audit - Record audit
router.post('/:id/audit', (req, res) => {
  const f = franchises.get(req.params.id);
  if (!f) return res.status(404).json({ error: 'Franchise not found' });
  const { score, notes, auditor, violations } = req.body;
  f.complianceScore = score || f.complianceScore;
  f.violations = violations || f.violations;
  f.lastAudit = new Date().toISOString();
  const audit = { id: 'AUD-' + Date.now(), franchiseId: f.id, score, notes, auditor, violations, ts: new Date().toISOString() };
  auditLogs.push(audit);
  res.json(audit);
});

// GET /api/franchise/audits - List all audits
router.get('/audits/list', (req, res) => res.json({ audits: auditLogs }));

// GET /api/franchise/kpi/penalties - KPI penalty/reward automation
router.get('/kpi/penalties', (req, res) => {
  const results = [...franchises.values()].map(f => {
    let penalty = 0;
    let reward = 0;
    if (f.kpiScore >= 90) reward = f.revenue * 0.01;
    else if (f.kpiScore < 60) penalty = f.revenue * 0.02;
    return { franchiseId: f.id, name: f.name, kpiScore: f.kpiScore, penalty: penalty.toFixed(2), reward: reward.toFixed(2) };
  });
  res.json({ results });
});

// GET /api/franchise/mystery-shopper - Mystery shopper integration
router.get('/mystery-shopper', (req, res) => {
  const visits = [...franchises.values()].map(f => ({
    franchiseId: f.id,
    name: f.name,
    lastVisit: new Date(Date.now() - Math.random() * 60 * 86400000).toISOString(),
    score: 60 + Math.floor(Math.random() * 40),
    areas: ['Food Quality', 'Service Speed', 'Cleanliness', 'Brand Compliance'],
  }));
  res.json({ mysteryShopperVisits: visits });
});

module.exports = router;
