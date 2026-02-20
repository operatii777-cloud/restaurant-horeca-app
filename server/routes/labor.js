const express = require('express');
const router = express.Router();

const staff = new Map();
const shifts = [];
const performanceRecords = [];

// Seed staff
['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'].forEach((name, i) => {
  staff.set('EMP-' + (i + 1), {
    id: 'EMP-' + (i + 1),
    name,
    role: ['Server', 'Cook', 'Manager', 'Cashier', 'Host'][i],
    location: 'LocationA',
    hoursThisWeek: Math.floor(Math.random() * 40),
    performance: 70 + Math.floor(Math.random() * 30),
    burnoutRisk: Math.random() > 0.7 ? 'HIGH' : 'LOW',
  });
});

function forecastTraffic(hour) {
  const pattern = [5, 3, 2, 1, 1, 2, 5, 12, 18, 20, 22, 25, 30, 28, 22, 18, 15, 20, 28, 32, 30, 22, 15, 8];
  return pattern[hour % 24] || 10;
}

function suggestStaff(forecastedCovers) {
  if (forecastedCovers < 10) return 2;
  if (forecastedCovers < 20) return 3;
  if (forecastedCovers < 30) return 5;
  return 7;
}

// GET /api/labor/staff - List all staff
router.get('/staff', (req, res) => {
  const list = [...staff.values()];
  res.json({ staff: list, total: list.length });
});

// POST /api/labor/staff - Add staff member
router.post('/staff', (req, res) => {
  const { name, role, location } = req.body;
  const id = 'EMP-' + Date.now();
  const emp = { id, name, role, location, hoursThisWeek: 0, performance: 100, burnoutRisk: 'LOW' };
  staff.set(id, emp);
  res.json(emp);
});

// GET /api/labor/forecast - Traffic forecast for next 24h (15-min intervals)
router.get('/forecast', (req, res) => {
  const now = new Date();
  const intervals = [];
  for (let i = 0; i < 96; i++) {
    const t = new Date(now.getTime() + i * 15 * 60000);
    const covers = forecastTraffic(t.getHours()) + Math.floor(Math.random() * 5 - 2);
    intervals.push({
      time: t.toISOString(),
      expectedCovers: Math.max(0, covers),
      suggestedStaff: suggestStaff(covers),
    });
  }
  res.json({ forecast: intervals });
});

// GET /api/labor/shift-suggestions - Auto-generate shift suggestions
router.get('/shift-suggestions', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const suggestions = [
    { shift: 'Morning (07:00-15:00)', staffNeeded: 4, roles: ['Cook x2', 'Server x1', 'Host x1'] },
    { shift: 'Afternoon (12:00-20:00)', staffNeeded: 6, roles: ['Cook x2', 'Server x3', 'Cashier x1'] },
    { shift: 'Evening (17:00-01:00)', staffNeeded: 5, roles: ['Cook x2', 'Server x2', 'Manager x1'] },
  ];
  res.json({ date, suggestions });
});

// POST /api/labor/shifts - Schedule a shift
router.post('/shifts', (req, res) => {
  const { employeeId, date, start, end, location } = req.body;
  const emp = staff.get(employeeId);
  if (!emp) return res.status(404).json({ error: 'Employee not found' });
  const durationH = (new Date(`${date}T${end}`) - new Date(`${date}T${start}`)) / 3600000;
  emp.hoursThisWeek += durationH;
  const shift = { id: 'SHF-' + Date.now(), employeeId, date, start, end, location, durationH };
  shifts.push(shift);
  res.json(shift);
});

// GET /api/labor/shifts - List shifts
router.get('/shifts', (req, res) => {
  const { date, location } = req.query;
  let list = shifts;
  if (date) list = list.filter(s => s.date === date);
  if (location) list = list.filter(s => s.location === location);
  res.json({ shifts: list });
});

// GET /api/labor/overtime-risk - Detect overtime risk
router.get('/overtime-risk', (req, res) => {
  const risks = [...staff.values()]
    .filter(e => e.hoursThisWeek > 40)
    .map(e => ({ employee: e, hoursThisWeek: e.hoursThisWeek, overtimeHours: e.hoursThisWeek - 40 }));
  res.json({ overtimeRisks: risks });
});

// GET /api/labor/burnout - Burnout detection
router.get('/burnout', (req, res) => {
  const atRisk = [...staff.values()].filter(e => e.burnoutRisk === 'HIGH' || e.hoursThisWeek > 45);
  res.json({ burnoutRisk: atRisk });
});

// GET /api/labor/performance - Staff performance benchmarking
router.get('/performance', (req, res) => {
  const list = [...staff.values()].map(e => ({
    id: e.id, name: e.name, role: e.role, location: e.location, score: e.performance,
    benchmark: e.performance > 85 ? 'TOP' : e.performance > 70 ? 'AVERAGE' : 'NEEDS_IMPROVEMENT',
  }));
  res.json({ performance: list });
});

// GET /api/labor/cost-tracking - Labor cost % target tracking
router.get('/cost-tracking', (req, res) => {
  const totalRevenue = 50000;
  const totalLaborCost = [...staff.values()].reduce((sum, e) => sum + e.hoursThisWeek * 15, 0);
  const percentage = ((totalLaborCost / totalRevenue) * 100).toFixed(2);
  res.json({ totalRevenue, totalLaborCost, laborCostPct: parseFloat(percentage), target: 30, onTarget: parseFloat(percentage) <= 30 });
});

module.exports = router;
