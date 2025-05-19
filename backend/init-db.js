const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  password: '0413',
  host: 'localhost',
  port: 5432,
  database: 'postgres' // Connect to default database first
});

async function initDatabase() {
  try {
    // Create database if it doesn't exist
    await pool.query('CREATE DATABASE it_support');
    console.log('Database created successfully');

    // Connect to the new database
    pool.end();
    const newPool = new Pool({
      user: 'postgres',
      password: '0413',
      host: 'localhost',
      port: 5432,
      database: 'it_support'
    });

    // Read and execute initialization script
    const initScript = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await newPool.query(initScript);
    console.log('Database initialized successfully');

    await newPool.end();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDatabase(); 