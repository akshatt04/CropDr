const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initDB } = require('./database/db');

// Routes
const authRoutes    = require('./routes/auth');
const analyzeRoutes = require('./routes/analyze');
const chatRoutes    = require('./routes/chat');
const weatherRoutes = require('./routes/weather');
const scansRoutes   = require('./routes/scans');
const userRoutes    = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────────────────────────

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (so you can open frontend pages via Express too)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rate limiting — generous for a demo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter rate limit for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'AI rate limit: max 10 requests per minute.' },
});

// ─── Routes ──────────────────────────────────────────────────────────────

app.use('/api/auth',    authRoutes);
app.use('/api/analyze', aiLimiter, analyzeRoutes);
app.use('/api/chat',    aiLimiter, chatRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/scans',   scansRoutes);
app.use('/api/user',    userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CropDr. Backend',
    version: '1.0.0',
    time: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'),
  });
});

// Fallback — serve the HTML for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ─── Error handler ───────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────────────────

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🌾 CropDr. Backend running at http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend:     http://localhost:${PORT}/index.html`);
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      console.log(`\n⚠️  WARNING: GEMINI_API_KEY not set in backend/.env`);
      console.log(`   Get your free key at: https://aistudio.google.com/app/apikey`);
    } else {
      console.log(`\n✅  Gemini API: configured`);
    }
  });
}).catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});

