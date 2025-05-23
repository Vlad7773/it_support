import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { initializeDatabase } from './init-db.js';
import { query, getOne, run } from './database.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.get('/api/workstations', async (req, res) => {
  try {
    const workstations = await query(`
      SELECT w.*, d.name as department_name, u.full_name as responsible
      FROM workstations w
      LEFT JOIN departments d ON w.department_id = d.id
      LEFT JOIN users u ON w.responsible_id = u.id
    `);
    res.json(workstations);
  } catch (error) {
    console.error('Error fetching workstations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/workstationstatuses', async (req, res) => {
  try {
    const statuses = await query(`
      SELECT status, COUNT(*) as count
      FROM workstations
      GROUP BY status
    `);
    res.json(statuses);
  } catch (error) {
    console.error('Error fetching workstation statuses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await query('SELECT id, username, full_name, email, role, department_id FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const departments = await query('SELECT * FROM departments');
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await query(`
      SELECT t.*, u.full_name as user, w.inventory_number as workstation
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN workstations w ON t.workstation_id = w.id
    `);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/repairs', async (req, res) => {
  try {
    const repairs = await query(`
      SELECT r.*, w.inventory_number as workstation
      FROM repairs r
      LEFT JOIN workstations w ON r.workstation_id = w.id
    `);
    res.json(repairs);
  } catch (error) {
    console.error('Error fetching repairs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }); 