const fs = require('fs')
const pool = require('./db')

async function initDb() {
  try {
    // Optional: Drop old tables if they exist
    await pool.query('DROP TABLE IF EXISTS public.comments CASCADE;')
    await pool.query('DROP TABLE IF EXISTS public.posts CASCADE;')
    await pool.query('DROP TABLE IF EXISTS public.users CASCADE;')

    // Read and execute init_it.sql
    const initSql = fs.readFileSync('init_it.sql', 'utf8')
    await pool.query(initSql)
    console.log('IT structure initialized successfully!')

    // Read and execute seed_it.sql
    const seedSql = fs.readFileSync('seed_it.sql', 'utf8')
    await pool.query(seedSql)
    console.log('IT data seeded successfully!')

  } catch (err) {
    console.error('Error initializing IT database:', err)
  } finally {
    pool.end()
  }
}

initDb() 