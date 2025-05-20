const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/it_support.db');
const dbPassword = process.env.DB_PASSWORD || 'supersecret123';

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    db.run(`PRAGMA key = '${dbPassword}'`, (err) => {
      if (err) {
        console.error('Error setting SQLCipher key:', err);
      } else {
        console.log('Connected to SQLCipher database with password');
        db.run('PRAGMA foreign_keys = ON');
      }
    });
  }
});

module.exports = db; 