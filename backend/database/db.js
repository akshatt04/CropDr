const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'cropdr.sqlite');
const db = new sqlite3.Database(DB_PATH);

// Helper: run a statement (INSERT/UPDATE/DELETE) — returns Promise<{lastID, changes}>
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Helper: get one row
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper: get all rows
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// ─── Schema ────────────────────────────────────────────────────────────────

function initDB() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA journal_mode = WAL');
      db.run('PRAGMA foreign_keys = ON');

      db.run(`CREATE TABLE IF NOT EXISTS users (
        id                 INTEGER PRIMARY KEY AUTOINCREMENT,
        name               TEXT    NOT NULL,
        email              TEXT    UNIQUE NOT NULL,
        password_hash      TEXT    NOT NULL,
        location           TEXT    DEFAULT 'India',
        primary_crops      TEXT    DEFAULT '',
        preferred_language TEXT    DEFAULT 'English',
        crop_status        TEXT    DEFAULT '',
        created_at         DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS scans (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id          INTEGER NOT NULL,
        crop_type        TEXT,
        disease_detected TEXT,
        confidence_score INTEGER,
        severity_level   TEXT,
        severity_percent INTEGER,
        spread_risk      TEXT,
        recovery_chance  INTEGER,
        language         TEXT    DEFAULT 'English',
        image_count      INTEGER DEFAULT 1,
        result_json      TEXT,
        created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`);

      db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id    INTEGER NOT NULL,
        session_id TEXT,
        role       TEXT    NOT NULL,
        content    TEXT    NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) return reject(err);
        
        // Safely migrate existing databases
        db.run(`ALTER TABLE chat_messages ADD COLUMN session_id TEXT`, () => {
          // Add crop_status column if it doesn't exist
          db.run(`ALTER TABLE users ADD COLUMN crop_status TEXT DEFAULT ''`, () => {
            resolve();
          });
        });
      });
    });
  });
}

// ─── Query helpers ─────────────────────────────────────────────────────────

const stmts = {
  createUser: (p) => run(
    `INSERT INTO users (name, email, password_hash, location, primary_crops, preferred_language) VALUES (?,?,?,?,?,?)`,
    [p.name, p.email, p.passwordHash, p.location, p.primaryCrops, p.preferredLanguage]
  ),
  getUserByEmail: (email) => get(`SELECT * FROM users WHERE email = ?`, [email]),
  getUserById: (id) => get(
    `SELECT id, name, email, location, primary_crops, preferred_language, crop_status, created_at FROM users WHERE id = ?`, [id]
  ),
  updateUser: (p) => run(
    `UPDATE users SET name=?, location=?, primary_crops=?, preferred_language=? WHERE id=?`,
    [p.name, p.location, p.primaryCrops, p.preferredLanguage, p.id]
  ),
  updateCropStatus: (userId, cropStatus) => run(
    `UPDATE users SET crop_status=? WHERE id=?`,
    [cropStatus, userId]
  ),

  createScan: (p) => run(
    `INSERT INTO scans (user_id, crop_type, disease_detected, confidence_score, severity_level, severity_percent, spread_risk, recovery_chance, language, image_count, result_json)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [p.userId, p.cropType, p.diseaseDetected, p.confidenceScore, p.severityLevel, p.severityPercent,
     p.spreadRisk, p.recoveryChance, p.language, p.imageCount, p.resultJson]
  ),
  getScansByUser: (userId) => all(
    `SELECT * FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`, [userId]
  ),
  getAllScans: () => all(
    `SELECT s.id, s.crop_type, s.disease_detected, s.confidence_score, 
            s.severity_level, s.spread_risk, s.created_at, u.name as userName
     FROM scans s
     JOIN users u ON s.user_id = u.id
     ORDER BY s.created_at DESC
     LIMIT 50`
  ),
  getScanById: (id) => get(`SELECT * FROM scans WHERE id = ?`, [id]),
  deleteScan: (id, userId) => run(`DELETE FROM scans WHERE id = ? AND user_id = ?`, [id, userId]),
  getUserScanStats: (userId) => get(
    `SELECT COUNT(*) as total_scans,
            SUM(CASE WHEN disease_detected != 'Healthy' THEN 1 ELSE 0 END) as disease_count,
            SUM(CASE WHEN disease_detected = 'Healthy' THEN 1 ELSE 0 END) as healthy_count
     FROM scans WHERE user_id = ?`, [userId]
  ),

  saveChatMsg: (userId, sessionId, role, content) => run(
    `INSERT INTO chat_messages (user_id, session_id, role, content) VALUES (?,?,?,?)`, [userId, sessionId, role, content]
  ),
  getChatHistory: (userId, sessionId) => all(
    `SELECT role, content FROM chat_messages WHERE user_id = ? AND (session_id = ? OR (session_id IS NULL AND ? = 'legacy')) ORDER BY created_at DESC LIMIT 50`, [userId, sessionId, sessionId]
  ),
  getChatSessions: (userId) => all(
    `SELECT IFNULL(session_id, 'legacy') as session_id, MIN(created_at) as started_at, content as first_message
     FROM chat_messages
     WHERE user_id = ? AND role = 'user'
     GROUP BY IFNULL(session_id, 'legacy')
     ORDER BY started_at DESC
     LIMIT 20`, [userId]
  ),
  deleteChatSession: (userId, sessionId) => run(
    `DELETE FROM chat_messages WHERE user_id = ? AND (session_id = ? OR (session_id IS NULL AND ? = 'legacy'))`, [userId, sessionId, sessionId]
  ),
};

module.exports = { db, stmts, initDB };
