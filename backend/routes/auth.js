const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { stmts } = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cropdr_secret';

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// GET /api/auth/google/client-id
router.get('/google/client-id', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  res.json({ clientId });
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { credential, accessToken, demo } = req.body;
    let email, name;

    if (demo) {
      email = 'farmer.demo@gmail.com';
      name = 'Demo Google Farmer';
    } else if (credential) {
      // Verify Google ID token via Google's tokeninfo API
      const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!tokenRes.ok) {
        return res.status(401).json({ error: 'Invalid Google credential token.' });
      }
      const tokenData = await tokenRes.json();
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        if (tokenData.aud !== process.env.GOOGLE_CLIENT_ID) {
          return res.status(401).json({ error: 'Google Client ID mismatch.' });
        }
      }
      email = tokenData.email;
      name = tokenData.name || (email ? email.split('@')[0] : 'Farmer');
    } else if (accessToken) {
      // Verify Google access token via Google's userinfo API
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!userRes.ok) {
        return res.status(401).json({ error: 'Invalid Google access token.' });
      }
      const userData = await userRes.json();
      email = userData.email;
      name = userData.name || (email ? email.split('@')[0] : 'Farmer');
    } else {
      return res.status(400).json({ error: 'Google credential or access token is required.' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Could not retrieve email from Google account.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await stmts.getUserByEmail(normalizedEmail);

    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const result = await stmts.createUser({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        location: 'India',
        primaryCrops: '',
        preferredLanguage: 'English',
      });
      user = {
        id: result.lastID,
        name: name.trim(),
        email: normalizedEmail,
        location: 'India',
        primary_crops: '',
        preferred_language: 'English',
      };
    }

    res.json({
      token: generateToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        location: user.location,
        primaryCrops: user.primary_crops,
        preferredLanguage: user.preferred_language,
      },
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ error: 'Google login failed: ' + err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, location = 'India', primaryCrops = '', preferredLanguage = 'English' } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
    if (!email?.includes('@')) return res.status(400).json({ error: 'Valid email is required.' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await stmts.getUserByEmail(email.toLowerCase().trim());
    if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await stmts.createUser({
      name: name.trim(), email: email.toLowerCase().trim(),
      passwordHash, location, primaryCrops, preferredLanguage,
    });

    const user = { id: result.lastID, name: name.trim(), email: email.toLowerCase().trim() };
    res.status(201).json({ token: generateToken(user), user: { ...user, location, primaryCrops, preferredLanguage } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const user = await stmts.getUserByEmail(email.toLowerCase().trim());
    if (!user) return res.status(401).json({ error: 'No account found with this email.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password.' });

    res.json({
      token: generateToken(user),
      user: { id: user.id, name: user.name, email: user.email, location: user.location, primaryCrops: user.primary_crops, preferredLanguage: user.preferred_language },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

module.exports = router;
