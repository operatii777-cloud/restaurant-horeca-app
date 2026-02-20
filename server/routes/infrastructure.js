const express = require('express');
const router = express.Router();
const os = require('os');

const services = [
  { name: 'api-server', status: 'healthy', lastCheck: new Date().toISOString(), restarts: 0, circuitBreaker: 'CLOSED' },
  { name: 'database', status: 'healthy', lastCheck: new Date().toISOString(), restarts: 0, circuitBreaker: 'CLOSED' },
  { name: 'payment-service', status: 'healthy', lastCheck: new Date().toISOString(), restarts: 0, circuitBreaker: 'CLOSED' },
  { name: 'notification-service', status: 'healthy', lastCheck: new Date().toISOString(), restarts: 0, circuitBreaker: 'CLOSED' },
  { name: 'analytics-service', status: 'healthy', lastCheck: new Date().toISOString(), restarts: 0, circuitBreaker: 'CLOSED' },
];

const healthHistory = [];

function checkService(service) {
  service.lastCheck = new Date().toISOString();
  const rand = Math.random();
  if (rand > 0.95) {
    service.status = 'unhealthy';
    service.restarts++;
    setTimeout(() => {
      service.status = 'healthy';
      service.circuitBreaker = 'CLOSED';
    }, 5000);
  } else {
    service.status = 'healthy';
  }
}

// GET /api/infrastructure/health - Overall health check
router.get('/health', (req, res) => {
  services.forEach(checkService);
  const allHealthy = services.every(s => s.status === 'healthy');
  const snap = { services, overall: allHealthy ? 'healthy' : 'degraded', ts: new Date().toISOString() };
  healthHistory.push(snap);
  res.json(snap);
});

// GET /api/infrastructure/services - List all services
router.get('/services', (req, res) => res.json({ services }));

// POST /api/infrastructure/services/:name/restart - Restart a service
router.post('/services/:name/restart', (req, res) => {
  const svc = services.find(s => s.name === req.params.name);
  if (!svc) return res.status(404).json({ error: 'Service not found' });
  svc.status = 'restarting';
  svc.restarts++;
  svc.lastCheck = new Date().toISOString();
  setTimeout(() => { svc.status = 'healthy'; }, 3000);
  res.json({ message: `Service ${svc.name} restart initiated`, service: svc });
});

// GET /api/infrastructure/circuit-breakers - Circuit breaker status
router.get('/circuit-breakers', (req, res) => {
  const breakers = services.map(s => ({ name: s.name, state: s.circuitBreaker, failures: s.restarts }));
  res.json({ circuitBreakers: breakers });
});

// POST /api/infrastructure/circuit-breakers/:name/trip - Manually trip a circuit breaker
router.post('/circuit-breakers/:name/trip', (req, res) => {
  const svc = services.find(s => s.name === req.params.name);
  if (!svc) return res.status(404).json({ error: 'Service not found' });
  svc.circuitBreaker = 'OPEN';
  svc.status = 'unhealthy';
  res.json({ message: `Circuit breaker tripped for ${svc.name}`, service: svc });
});

// POST /api/infrastructure/circuit-breakers/:name/reset - Reset circuit breaker
router.post('/circuit-breakers/:name/reset', (req, res) => {
  const svc = services.find(s => s.name === req.params.name);
  if (!svc) return res.status(404).json({ error: 'Service not found' });
  svc.circuitBreaker = 'CLOSED';
  svc.status = 'healthy';
  res.json({ message: `Circuit breaker reset for ${svc.name}`, service: svc });
});

// GET /api/infrastructure/system - System metrics
router.get('/system', (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  res.json({
    uptime: os.uptime(),
    cpus: os.cpus().length,
    platform: os.platform(),
    memoryTotal: (totalMem / 1024 / 1024).toFixed(0) + ' MB',
    memoryFree: (freeMem / 1024 / 1024).toFixed(0) + ' MB',
    memoryUsedPct: (((totalMem - freeMem) / totalMem) * 100).toFixed(1) + '%',
    loadAvg: os.loadavg(),
    healthHistory: healthHistory.slice(-10),
  });
});

// GET /api/infrastructure/scaling - Auto-scaling status
router.get('/scaling', (req, res) => {
  res.json({
    currentInstances: 2,
    minInstances: 1,
    maxInstances: 10,
    targetCpuPct: 70,
    currentCpuPct: Math.floor(Math.random() * 60 + 10),
    scalingPolicy: 'PREDICTIVE',
    lastScaleEvent: new Date(Date.now() - 3600000).toISOString(),
  });
});

module.exports = router;
