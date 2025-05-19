const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'it_support',
  password: '0413',
  port: 5432,
});

async function checkDataCounts() {
  const tables = ['departments', 'workstation_statuses', 'it_users', 'workstations', 'requests', 'repairs'];

  try {
    console.log('Checking data counts in tables:');
    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) FROM public.${table}`);
      console.log(`${table}: ${result.rows[0].count} rows`);
    }
  } catch (err) {
    console.error('Error checking data counts:', err);
  } finally {
    pool.end();
  }
}

checkDataCounts(); 