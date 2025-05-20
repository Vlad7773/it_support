const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'it_support.db');
const db = new sqlite3.Database(dbPath);

// Read and parse SQL file
const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

// Custom parser: collect CREATE TRIGGER ... END; as a single statement
function splitSqlStatements(sql) {
  const statements = [];
  let buffer = '';
  let inTrigger = false;
  const lines = sql.split(/\r?\n/);
  for (let line of lines) {
    if (/^\s*CREATE\s+TRIGGER/i.test(line)) inTrigger = true;
    buffer += line + '\n';
    if (inTrigger) {
      if (/END;\s*$/i.test(line)) {
        statements.push(buffer.trim());
        buffer = '';
        inTrigger = false;
      }
    } else if (/;\s*$/.test(line)) {
      statements.push(buffer.trim());
      buffer = '';
    }
  }
  if (buffer.trim().length > 0) statements.push(buffer.trim());
  return statements;
}

const statements = splitSqlStatements(sql);

db.serialize(() => {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Begin transaction
  db.run('BEGIN TRANSACTION');

  // Execute each statement
  for (const statement of statements) {
    if (statement.trim()) {
      db.run(statement, err => {
        if (err) {
          console.error('Error executing statement:', err);
          console.error('Statement:', statement);
          db.run('ROLLBACK');
          process.exit(1);
        }
      });
    }
  }

  // Commit transaction
  db.run('COMMIT', err => {
    if (err) {
      console.error('Error committing transaction:', err);
      db.run('ROLLBACK');
      process.exit(1);
    } else {
      console.log('Database initialized successfully');
    }
  });
});

// Close database connection
db.close(err => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database connection closed');
  }
}); 