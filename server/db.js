const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize tables
db.serialize(() => {
  // Table for general app statistics
  db.run(`
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value INTEGER DEFAULT 0
    )
  `);

  // Initialize total_emails_generated counter if it doesn't exist
  db.run(`
    INSERT OR IGNORE INTO stats (key, value) VALUES ('total_emails_generated', 0)
  `);
});

// Helper functions for easy access
const getStat = (key) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT value FROM stats WHERE key = ?', [key], (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.value : 0);
    });
  });
};

const incrementStat = (key) => {
  return new Promise((resolve, reject) => {
    db.run('UPDATE stats SET value = value + 1 WHERE key = ?', [key], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

module.exports = {
  db,
  getStat,
  incrementStat
};
