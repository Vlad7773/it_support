const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'it_support',
  password: '0413',
  port: 5432,
});

async function runSqlScript() {
  const sqlFilePath = path.join(__dirname, 'init_db_with_data.sql');
  const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

  try {
    await pool.query(sqlScript);
    console.log('SQL script executed successfully.');
  } catch (err) {
    console.error('Error executing SQL script:', err);
  } finally {
    pool.end();
  }
}

runSqlScript(); 