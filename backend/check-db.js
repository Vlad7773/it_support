const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: '0413',
  host: 'localhost',
  port: 5432,
  database: 'it_support'
});

async function checkDatabase() {
  try {
    // Check table structure
    console.log('Checking table structure...');
    const structure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'workstations'
    `);
    console.log('Table structure:', structure.rows);

    // Check data
    console.log('\nChecking data...');
    const data = await pool.query('SELECT * FROM workstations');
    console.log('Data:', data.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkDatabase(); 