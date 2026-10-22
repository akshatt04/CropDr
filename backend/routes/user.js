const express = require('express');
const { stmts } = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/user/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await stmts.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const stats = await stmts.getUserScanStats(user.id);
    res.json({
      id: user.id, name: user.name, email: user.email,
      location: user.location, primaryCrops: user.primary_crops,
      preferredLanguage: user.preferred_language, memberSince: user.created_at,
      stats: { totalScans: stats?.total_scans || 0, diseaseCount: stats?.disease_count || 0, healthyCount: stats?.healthy_count || 0 },
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// PUT /api/user/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, location, primaryCrops, preferredLanguage } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    await stmts.updateUser({ id: req.user.userId, name: name.trim(), location: location || 'India', primaryCrops: primaryCrops || '', preferredLanguage: preferredLanguage || 'English' });
    const updated = await stmts.getUserById(req.user.userId);
    res.json({ id: updated.id, name: updated.name, email: updated.email, location: updated.location, primaryCrops: updated.primary_crops, preferredLanguage: updated.preferred_language });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// GET /api/user/crop-status
router.get('/crop-status', authMiddleware, async (req, res) => {
  try {
    const user = await stmts.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ cropStatus: user.crop_status || '' });
  } catch (err) {
    console.error('Crop status error:', err);
    res.status(500).json({ error: 'Failed to load crop status.' });
  }
});

// POST /api/user/crop-status
router.post('/crop-status', authMiddleware, async (req, res) => {
  try {
    const { cropStatus } = req.body;
    if (typeof cropStatus !== 'string') return res.status(400).json({ error: 'Invalid crop status.' });
    
    await stmts.updateCropStatus(req.user.userId, cropStatus);
    res.json({ success: true, cropStatus });
  } catch (err) {
    console.error('Crop status update error:', err);
    res.status(500).json({ error: 'Failed to save crop status.' });
  }
});

module.exports = router;
