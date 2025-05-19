const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '0413',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'it_support'
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database');
  release();
});

// Workstations (АРМ) routes
app.get('/api/workstations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ws.id,
        ws.name,
        ws.processor,
        ws.ram,
        ws.storage,
        ws.os,
        ws.acquisition_date,
        ws_status.name as status,
        it_users.name as current_user,
        departments.name as department
      FROM public.workstations ws
      LEFT JOIN public.it_users ON ws.current_user_id = it_users.id
      LEFT JOIN public.departments ON ws.department_id = departments.id
      LEFT JOIN public.workstation_statuses ws_status ON ws.status_id = ws_status.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/workstations', async (req, res) => {
  const { name, processor, ram, storage, os, acquisition_date, status_id, current_user_id, department_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO public.workstations (name, processor, ram, storage, os, acquisition_date, status_id, current_user_id, department_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, processor, ram, storage, os, acquisition_date, status_id, current_user_id, department_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/workstations/:id', async (req, res) => {
  const { id } = req.params;
  const { name, processor, ram, storage, os, acquisition_date, status_id, current_user_id, department_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE public.workstations SET name = $1, processor = $2, ram = $3, storage = $4, os = $5, acquisition_date = $6, status_id = $7, current_user_id = $8, department_id = $9 WHERE id = $10 RETURNING *`,
      [name, processor, ram, storage, os, acquisition_date, status_id, current_user_id, department_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workstation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/workstations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM public.workstations WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workstation not found' });
    }
    res.json({ message: 'Workstation deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Users routes (перейменовано на it_users)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT it_users.id, it_users.name, it_users.position, it_users.login, departments.name as department
      FROM public.it_users
      LEFT JOIN public.departments ON it_users.department_id = departments.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, position, login, password_hash, department_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO public.it_users (name, position, login, password_hash, department_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, position, login, password_hash, department_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tickets routes (перейменовано на requests)
app.get('/api/tickets', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.type, r.description, r.status, r.priority, r.created_at, r.updated_at,
             it_users1.name as created_by_user,
             it_users2.name as assigned_performer,
             ws.name as workstation
      FROM public.requests r
      LEFT JOIN public.it_users it_users1 ON r.created_by_user_id = it_users1.id
      LEFT JOIN public.it_users it_users2 ON r.assigned_performer_id = it_users2.id
      LEFT JOIN public.workstations ws ON r.workstation_id = ws.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/tickets', async (req, res) => {
  const { type, description, status, priority, created_by_user_id, assigned_performer_id, workstation_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO public.requests (type, description, status, priority, created_by_user_id, assigned_performer_id, workstation_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [type, description, status, priority, created_by_user_id, assigned_performer_id, workstation_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Repairs routes (перейменовано на repairs)
app.get('/api/repairs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.description, r.status, r.start_date, r.end_date,
             ws.name as workstation,
             it_users.name as assigned_performer
      FROM public.repairs r
      LEFT JOIN public.workstations ws ON r.workstation_id = ws.id
      LEFT JOIN public.it_users ON r.assigned_performer_id = it_users.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/repairs', async (req, res) => {
  const { workstation_id, description, status, assigned_performer_id, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO public.repairs (workstation_id, description, status, assigned_performer_id, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [workstation_id, description, status, assigned_performer_id, start_date, end_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 