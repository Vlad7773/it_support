const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'it_support',
  password: '0413',
  port: 5432,
});

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:');
    result.rows.forEach(row => {
      console.log(row.table_name);
    });
  } catch (err) {
    console.error('Error checking tables:', err);
  } finally {
    pool.end();
  }
}

checkTables(); 