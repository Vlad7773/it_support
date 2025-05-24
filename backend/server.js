import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { query, getOne, run } from '../database.js';
import { initializeDatabase } from './db/init_db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

// --- USERS ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await query('SELECT id, username, full_name, email, role, department_id FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, full_name, email, role, department_id, password } = req.body;
  if (!username || !password || !full_name || !role) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await run(
      'INSERT INTO users (username, full_name, email, role, department_id, password) VALUES (?, ?, ?, ?, ?, ?)',
      [username, full_name, email || null, role, department_id || null, hashedPassword]
    );
    res.status(201).json({ id: result.lastID, username, full_name, email, role, department_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, full_name, email, role, department_id, password } = req.body;
  let queryStr = 'UPDATE users SET username = ?, full_name = ?, email = ?, role = ?, department_id = ?';
  const params = [username, full_name, email, role, department_id];
  if (password) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    queryStr += ', password = ?';
    params.push(hashedPassword);
  }
  queryStr += ' WHERE id = ?';
  params.push(id);
  try {
    await run(queryStr, params);
    res.json({ id: Number(id), username, full_name, email, role, department_id });
  } catch (err) {
    res.status(500).json({ error: `Failed to update user ${id}` });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM users WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: `Failed to delete user ${id}` });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const user = await getOne('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { password: _, ...userData } = user;
    res.json({ message: 'Login successful', user: userData });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- DEPARTMENTS ---
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await query('SELECT id, name FROM departments');
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// --- WORKSTATIONS ---
app.get('/api/workstations', async (req, res) => {
  try {
    const workstations = await query('SELECT * FROM workstations');
    res.json(workstations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workstations' });
  }
});

app.post('/api/workstations', async (req, res) => {
  const { inventory_number, os_name, department_id, responsible_id, status } = req.body;
  try {
    const result = await run(
      'INSERT INTO workstations (inventory_number, os_name, department_id, responsible_id, status) VALUES (?, ?, ?, ?, ?)',
      [inventory_number, os_name, department_id, responsible_id, status]
    );
    const newWorkstation = await getOne('SELECT * FROM workstations WHERE id = ?', [result.lastID]);
    res.status(201).json(newWorkstation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add workstation' });
  }
});

app.put('/api/workstations/:id', async (req, res) => {
  const { id } = req.params;
  const { inventory_number, os_name, department_id, responsible_id, status } = req.body;
  try {
    await run(
      'UPDATE workstations SET inventory_number = ?, os_name = ?, department_id = ?, responsible_id = ?, status = ? WHERE id = ?',
      [inventory_number, os_name, department_id, responsible_id, status, id]
    );
    const updatedWorkstation = await getOne('SELECT * FROM workstations WHERE id = ?', [id]);
    res.json(updatedWorkstation);
  } catch (err) {
    res.status(500).json({ error: `Failed to update workstation ${id}` });
  }
});

app.delete('/api/workstations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM workstations WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: `Failed to delete workstation ${id}` });
  }
});

// --- SOFTWARE ---
app.get('/api/software', async (req, res) => {
  try {
    const software = await query('SELECT * FROM software');
    res.json(software);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch software' });
  }
});

app.post('/api/software', async (req, res) => {
  const { name, version, license_key, workstation_id } = req.body;
  try {
    const result = await run(
      'INSERT INTO software (name, version, license_key, workstation_id) VALUES (?, ?, ?, ?)',
      [name, version, license_key, workstation_id]
    );
    const newSoftware = await getOne('SELECT * FROM software WHERE id = ?', [result.lastID]);
    res.status(201).json(newSoftware);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add software' });
  }
});

app.put('/api/software/:id', async (req, res) => {
  const { id } = req.params;
  const { name, version, license_key, workstation_id } = req.body;
  try {
    await run(
      'UPDATE software SET name = ?, version = ?, license_key = ?, workstation_id = ? WHERE id = ?',
      [name, version, license_key, workstation_id, id]
    );
    const updated = await getOne('SELECT * FROM software WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update software' });
  }
});

app.delete('/api/software/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM software WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete software' });
  }
});

app.get('/api/workstations/:id/software', async (req, res) => {
  const { id } = req.params;
  try {
    const softwareList = await query('SELECT * FROM software WHERE workstation_id = ?', [id]);
    res.json(softwareList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch software for workstation' });
  }
});

// --- DEPARTMENTS, TICKETS, REPAIRS: залишити як є або адаптувати за аналогією ---

// --- INIT DB & START SERVER ---
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});