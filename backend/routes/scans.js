const express = require('express');
const { stmts } = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/scans/all (All scans from all users)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const scans = await stmts.getAllScans();
    res.json({ scans });
  } catch (err) {
    console.error('All scans error:', err);
    res.status(500).json({ error: 'Failed to load scans.' });
  }
});

function safeJsonParse(str) {
  if (!str) return null;
  try { return JSON.parse(str); } catch { return null; }
}

// GET /api/scans
router.get('/', authMiddleware, async (req, res) => {
  try {
    const scans = await stmts.getScansByUser(req.user.userId);
    const stats = await stmts.getUserScanStats(req.user.userId);
    const parsed = scans.map(s => ({
      id: s.id, cropType: s.crop_type, diseaseDetected: s.disease_detected,
      confidenceScore: s.confidence_score, severityLevel: s.severity_level,
      severityPercent: s.severity_percent, spreadRisk: s.spread_risk,
      recoveryChance: s.recovery_chance, language: s.language,
      imageCount: s.image_count, createdAt: s.created_at,
      result: safeJsonParse(s.result_json),
    }));
    res.json({ scans: parsed, stats: { totalScans: stats?.total_scans || 0, diseaseCount: stats?.disease_count || 0, healthyCount: stats?.healthy_count || 0 } });
  } catch (err) {
    console.error('Scans error:', err);
    res.status(500).json({ error: 'Failed to load scan history.' });
  }
});

// GET /api/scans/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const scan = await stmts.getScanById(req.params.id);
    if (!scan) return res.status(404).json({ error: 'Scan not found.' });
    if (scan.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json({ ...scan, result: safeJsonParse(scan.result_json) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load scan.' });
  }
});

// DELETE /api/scans/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await stmts.deleteScan(req.params.id, req.user.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Scan not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete scan.' });
  }
});

module.exports = router;
