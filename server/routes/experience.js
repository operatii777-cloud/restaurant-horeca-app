const express = require('express');
const router = express.Router();

const scenes = new Map();
const signageContent = [];

const defaultScene = {
  music: { genre: 'jazz', bpm: 90, volume: 60 },
  lighting: { brightness: 80, colorTemp: 3000, color: '#FFF5E0' },
  temperature: 22,
  signage: 'WELCOME',
};

['LocationA', 'LocationB', 'LocationC'].forEach(loc => {
  scenes.set(loc, { ...defaultScene, location: loc, mode: 'NORMAL', updatedAt: new Date().toISOString() });
});

function moodToSettings(mood, peakHour) {
  const settings = {
    ROMANTIC: { music: { genre: 'soft_jazz', bpm: 70, volume: 45 }, lighting: { brightness: 40, colorTemp: 2200, color: '#FF8C42' } },
    ENERGETIC: { music: { genre: 'pop', bpm: 130, volume: 75 }, lighting: { brightness: 100, colorTemp: 6500, color: '#FFFFFF' } },
    CALM: { music: { genre: 'classical', bpm: 60, volume: 35 }, lighting: { brightness: 60, colorTemp: 3500, color: '#FFF8DC' } },
    PEAK_HOUR: { music: { genre: 'upbeat', bpm: 120, volume: 70 }, lighting: { brightness: 95, colorTemp: 5000, color: '#FFFFF0' } },
    CLOSING: { music: { genre: 'lounge', bpm: 75, volume: 40 }, lighting: { brightness: 30, colorTemp: 2700, color: '#FFE4C4' } },
  };
  if (peakHour) return settings.PEAK_HOUR || defaultScene;
  return settings[mood] || defaultScene;
}

// GET /api/experience/scenes - List all scenes
router.get('/scenes', (req, res) => {
  const result = {};
  scenes.forEach((scene, loc) => { result[loc] = scene; });
  res.json(result);
});

// GET /api/experience/scenes/:location - Get scene for location
router.get('/scenes/:location', (req, res) => {
  const scene = scenes.get(req.params.location);
  if (!scene) return res.status(404).json({ error: 'Location not found' });
  res.json(scene);
});

// PUT /api/experience/scenes/:location - Update scene
router.put('/scenes/:location', (req, res) => {
  const loc = req.params.location;
  const current = scenes.get(loc) || { ...defaultScene, location: loc };
  const updated = { ...current, ...req.body, updatedAt: new Date().toISOString() };
  scenes.set(loc, updated);
  res.json(updated);
});

// POST /api/experience/scenes/:location/mood - Set mood
router.post('/scenes/:location/mood', (req, res) => {
  const loc = req.params.location;
  const { mood, peakHour } = req.body;
  const settings = moodToSettings(mood, peakHour);
  const current = scenes.get(loc) || { ...defaultScene, location: loc };
  const updated = { ...current, ...settings, mode: mood || 'AUTO', updatedAt: new Date().toISOString() };
  scenes.set(loc, updated);
  res.json(updated);
});

// POST /api/experience/scenes/:location/peak - Peak hour adjustment
router.post('/scenes/:location/peak', (req, res) => {
  const loc = req.params.location;
  const settings = moodToSettings(null, true);
  const current = scenes.get(loc) || { ...defaultScene, location: loc };
  const updated = { ...current, ...settings, mode: 'PEAK_HOUR', updatedAt: new Date().toISOString() };
  scenes.set(loc, updated);
  res.json(updated);
});

// GET /api/experience/signage - Smart signage content
router.get('/signage', (req, res) => res.json({ content: signageContent }));

// POST /api/experience/signage - Add signage content
router.post('/signage', (req, res) => {
  const { location, type, content, startAt, endAt, priority } = req.body;
  const item = { id: 'SGN-' + Date.now(), location, type, content, startAt, endAt, priority: priority || 1, active: true, createdAt: new Date().toISOString() };
  signageContent.push(item);
  res.json(item);
});

// GET /api/experience/music/genres - Available music genres
router.get('/music/genres', (req, res) => {
  res.json({ genres: ['jazz', 'soft_jazz', 'classical', 'pop', 'lounge', 'upbeat', 'acoustic', 'electronic', 'latin'] });
});

// PUT /api/experience/scenes/:location/music - Update music settings
router.put('/scenes/:location/music', (req, res) => {
  const scene = scenes.get(req.params.location);
  if (!scene) return res.status(404).json({ error: 'Location not found' });
  scene.music = { ...scene.music, ...req.body };
  scene.updatedAt = new Date().toISOString();
  res.json(scene);
});

module.exports = router;
