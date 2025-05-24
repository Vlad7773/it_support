import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs'; // Додано для хешування та перевірки паролів
import { query, getOne, run } from './database.js';
import { initializeDatabase } from './init-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // Для парсингу JSON тіл запитів
app.use(express.static(path.join(__dirname, 'dist')));

// Middleware для логування запитів
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Ініціалізація бази даних
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully.');
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1); // Зупиняємо сервер, якщо БД не ініціалізовано
  });

// --- API Routes ---

// LOGIN ROUTE
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
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { password: _, ...userWithoutPassword } = user; // Не відправляємо пароль на клієнт
    res.json({ message: 'Login successful', user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// WORKSTATIONS API
app.get('/api/workstations', async (req, res) => {
  try {
    const workstations = await query(`
      SELECT w.*, d.name as department_name, u.full_name as responsible_name 
      FROM workstations w
      LEFT JOIN departments d ON w.department_id = d.id
      LEFT JOIN users u ON w.responsible_id = u.id
    `);
    res.json(workstations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workstations', async (req, res) => {
  const { inventory_number, os_name, department_id, responsible_id, status, notes } = req.body;
  if (!inventory_number || !os_name) {
    return res.status(400).json({ error: 'Inventory number and OS name are required' });
  }
  try {
    const result = await run(
      'INSERT INTO workstations (inventory_number, os_name, department_id, responsible_id, status, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [inventory_number, os_name, department_id, responsible_id, status || 'operational', notes]
    );
    const newWorkstation = await getOne('SELECT w.*, d.name as department_name, u.full_name as responsible_name FROM workstations w LEFT JOIN departments d ON w.department_id = d.id LEFT JOIN users u ON w.responsible_id = u.id WHERE w.id = ?', [result.lastInsertRowid]);
    res.status(201).json(newWorkstation);
  } catch (error) {
    console.error('Error creating workstation:', error);
    res.status(500).json({ error: 'Internal server error creating workstation' });
  }
});

app.put('/api/workstations/:id', async (req, res) => {
  const { id } = req.params;
  const { inventory_number, os_name, department_id, responsible_id, status, notes } = req.body;
  if (!inventory_number || !os_name) {
    return res.status(400).json({ error: 'Inventory number and OS name are required' });
  }
  try {
    await run(
      'UPDATE workstations SET inventory_number = ?, os_name = ?, department_id = ?, responsible_id = ?, status = ?, notes = ? WHERE id = ?',
      [inventory_number, os_name, department_id, responsible_id, status, notes, id]
    );
    const updatedWorkstation = await getOne('SELECT w.*, d.name as department_name, u.full_name as responsible_name FROM workstations w LEFT JOIN departments d ON w.department_id = d.id LEFT JOIN users u ON w.responsible_id = u.id WHERE w.id = ?', [id]);
    if (!updatedWorkstation) {
        return res.status(404).json({ error: 'Workstation not found' });
    }
    res.json(updatedWorkstation);
  } catch (error) {
    console.error('Error updating workstation:', error);
    res.status(500).json({ error: 'Internal server error updating workstation' });
  }
});

app.delete('/api/workstations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Спочатку перевіримо, чи є пов'язані заявки або ремонти
    const relatedTickets = await getOne('SELECT COUNT(*) as count FROM tickets WHERE workstation_id = ?', [id]);
    const relatedRepairs = await getOne('SELECT COUNT(*) as count FROM repairs WHERE workstation_id = ?', [id]);

    if (relatedTickets.count > 0 || relatedRepairs.count > 0) {
      return res.status(400).json({ error: 'Cannot delete workstation with active tickets or repairs. Please reassign or resolve them first.' });
    }

    const result = await run('DELETE FROM workstations WHERE id = ?', [id]);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Workstation not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting workstation:', error);
    res.status(500).json({ error: 'Internal server error deleting workstation' });
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
    res.status(500).json({ error: error.message });
  }
});


// USERS API
app.get('/api/users', async (req, res) => {
  try {
    const users = await query('SELECT id, username, full_name, role FROM users'); // Не повертаємо паролі
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, password, full_name, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, full_name, role || 'user']
    );
    const newUser = await getOne('SELECT id, username, full_name, role FROM users WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message.includes('UNIQUE constraint failed: users.username')) {
        return res.status(409).json({ error: 'Username already exists.' });
    }
    res.status(500).json({ error: 'Internal server error creating user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, full_name, role } = req.body;

  if (!username && !password && !full_name && !role) {
    return res.status(400).json({ error: 'No fields provided for update.' });
  }

  let fieldsToUpdate = [];
  let values = [];

  if (username) {
    fieldsToUpdate.push('username = ?');
    values.push(username);
  }
  if (full_name) {
    fieldsToUpdate.push('full_name = ?');
    values.push(full_name);
  }
  if (role) {
    fieldsToUpdate.push('role = ?');
    values.push(role);
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    fieldsToUpdate.push('password = ?');
    values.push(hashedPassword);
  }
  
  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: 'Nothing to update or invalid fields.' });
  }

  values.push(id); // For WHERE id = ?

  try {
    await run(`UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = ?`, values);
    const updatedUser = await getOne('SELECT id, username, full_name, role FROM users WHERE id = ?', [id]);
    if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.message.includes('UNIQUE constraint failed: users.username')) {
        return res.status(409).json({ error: 'Username already exists for another user.' });
    }
    res.status(500).json({ error: 'Internal server error updating user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
   // Заборона видалення адміністратора з ID 1 (або іншого основного адміна)
  if (parseInt(id, 10) === 1) { // Припускаємо, що admin з init-db.js має ID 1
    return res.status(403).json({ error: 'Cannot delete the primary admin user.' });
  }
  try {
    // Перевірка чи користувач не призначений відповідальним або виконавцем
    const isResponsible = await getOne('SELECT COUNT(*) as count FROM workstations WHERE responsible_id = ?', [id]);
    const isAssignedTicket = await getOne('SELECT COUNT(*) as count FROM tickets WHERE assigned_to = ? OR user_id = ?', [id, id]);
    const isRepairTechnician = await getOne('SELECT COUNT(*) as count FROM repairs WHERE technician_id = ?', [id]);

    if (isResponsible.count > 0 || isAssignedTicket.count > 0 || isRepairTechnician.count > 0) {
      return res.status(400).json({ error: 'Cannot delete user. User is associated with workstations, tickets, or repairs. Please reassign them first.' });
    }

    const result = await run('DELETE FROM users WHERE id = ?', [id]);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error deleting user' });
  }
});


// DEPARTMENTS API
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await query('SELECT * FROM departments');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// CRUD для departments можна додати за аналогією, якщо потрібно


// TICKETS API
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await query(`
      SELECT 
        t.id, t.description, t.status, t.priority, t.created_at, t.updated_at,
        u_reporter.full_name as reporter_name, 
        u_assignee.full_name as assignee_name,
        w.inventory_number as workstation_inventory_number
      FROM tickets t
      LEFT JOIN users u_reporter ON t.user_id = u_reporter.id
      LEFT JOIN users u_assignee ON t.assigned_to = u_assignee.id
      LEFT JOIN workstations w ON t.workstation_id = w.id
      ORDER BY t.created_at DESC
    `);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  const { user_id, workstation_id, description, status, priority, assigned_to } = req.body;
  if (!description || !user_id) { // user_id - хто створив, має бути відомий (наприклад, з сесії)
    return res.status(400).json({ error: 'Description and reporter ID (user_id) are required' });
  }
  try {
    const currentTime = new Date().toISOString();
    const result = await run(
      'INSERT INTO tickets (user_id, workstation_id, description, status, priority, created_at, updated_at, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, workstation_id, description, status || 'open', priority || 'medium', currentTime, currentTime, assigned_to]
    );
    const newTicket = await getOne(`
      SELECT t.id, t.description, t.status, t.priority, t.created_at, t.updated_at,
             u_reporter.full_name as reporter_name, 
             u_assignee.full_name as assignee_name,
             w.inventory_number as workstation_inventory_number
      FROM tickets t
      LEFT JOIN users u_reporter ON t.user_id = u_reporter.id
      LEFT JOIN users u_assignee ON t.assigned_to = u_assignee.id
      LEFT JOIN workstations w ON t.workstation_id = w.id
      WHERE t.id = ?
    `, [result.lastInsertRowid]);
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Internal server error creating ticket' });
  }
});

app.put('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { workstation_id, description, status, priority, assigned_to } = req.body;
   if (!description && !status && !priority && workstation_id === undefined && assigned_to === undefined) {
    return res.status(400).json({ error: 'At least one field must be provided for update.' });
  }
  try {
    const currentTime = new Date().toISOString();
    // Отримуємо поточні значення, щоб не перезаписувати їх NULL, якщо не передані
    const currentTicket = await getOne('SELECT * FROM tickets WHERE id = ?', [id]);
    if (!currentTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await run(
      'UPDATE tickets SET workstation_id = ?, description = ?, status = ?, priority = ?, updated_at = ?, assigned_to = ? WHERE id = ?',
      [
        workstation_id !== undefined ? workstation_id : currentTicket.workstation_id,
        description !== undefined ? description : currentTicket.description,
        status !== undefined ? status : currentTicket.status,
        priority !== undefined ? priority : currentTicket.priority,
        currentTime,
        assigned_to !== undefined ? assigned_to : currentTicket.assigned_to,
        id
      ]
    );
    const updatedTicket = await getOne(`
      SELECT t.id, t.description, t.status, t.priority, t.created_at, t.updated_at,
             u_reporter.full_name as reporter_name, 
             u_assignee.full_name as assignee_name,
             w.inventory_number as workstation_inventory_number
      FROM tickets t
      LEFT JOIN users u_reporter ON t.user_id = u_reporter.id
      LEFT JOIN users u_assignee ON t.assigned_to = u_assignee.id
      LEFT JOIN workstations w ON t.workstation_id = w.id
      WHERE t.id = ?
    `, [id]);
    res.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Internal server error updating ticket' });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await run('DELETE FROM tickets WHERE id = ?', [id]);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Ticket not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ error: 'Internal server error deleting ticket' });
  }
});

// REPAIRS API
app.get('/api/repairs', async (req, res) => {
  try {
    const repairs = await query(`
      SELECT 
        r.id, r.description, r.repair_date, r.cost, r.status,
        w.inventory_number as workstation_inventory_number,
        u_tech.full_name as technician_name
      FROM repairs r
      LEFT JOIN workstations w ON r.workstation_id = w.id
      LEFT JOIN users u_tech ON r.technician_id = u_tech.id
      ORDER BY r.repair_date DESC
    `);
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/repairs', async (req, res) => {
  const { workstation_id, technician_id, description, repair_date, cost, status } = req.body;
  if (!workstation_id || !description) {
    return res.status(400).json({ error: 'Workstation ID and description are required' });
  }
  try {
    const result = await run(
      'INSERT INTO repairs (workstation_id, technician_id, description, repair_date, cost, status) VALUES (?, ?, ?, ?, ?, ?)',
      [workstation_id, technician_id, description, repair_date, cost, status || 'pending']
    );
    const newRepair = await getOne(`
      SELECT r.id, r.description, r.repair_date, r.cost, r.status,
             w.inventory_number as workstation_inventory_number,
             u_tech.full_name as technician_name
      FROM repairs r
      LEFT JOIN workstations w ON r.workstation_id = w.id
      LEFT JOIN users u_tech ON r.technician_id = u_tech.id
      WHERE r.id = ?
    `, [result.lastInsertRowid]);
    res.status(201).json(newRepair);
  } catch (error) {
    console.error('Error creating repair:', error);
    res.status(500).json({ error: 'Internal server error creating repair' });
  }
});

app.put('/api/repairs/:id', async (req, res) => {
  const { id } = req.params;
  const { workstation_id, technician_id, description, repair_date, cost, status } = req.body;
  if (!workstation_id && !description && !repair_date && cost === undefined && !status && technician_id === undefined) {
    return res.status(400).json({ error: 'At least one field must be provided for update.' });
  }
  try {
    const currentRepair = await getOne('SELECT * FROM repairs WHERE id = ?', [id]);
    if (!currentRepair) {
      return res.status(404).json({ error: 'Repair not found' });
    }
    await run(
      'UPDATE repairs SET workstation_id = ?, technician_id = ?, description = ?, repair_date = ?, cost = ?, status = ? WHERE id = ?',
      [
        workstation_id !== undefined ? workstation_id : currentRepair.workstation_id,
        technician_id !== undefined ? technician_id : currentRepair.technician_id,
        description !== undefined ? description : currentRepair.description,
        repair_date !== undefined ? repair_date : currentRepair.repair_date,
        cost !== undefined ? cost : currentRepair.cost,
        status !== undefined ? status : currentRepair.status,
        id
      ]
    );
    const updatedRepair = await getOne(`
      SELECT r.id, r.description, r.repair_date, r.cost, r.status,
             w.inventory_number as workstation_inventory_number,
             u_tech.full_name as technician_name
      FROM repairs r
      LEFT JOIN workstations w ON r.workstation_id = w.id
      LEFT JOIN users u_tech ON r.technician_id = u_tech.id
      WHERE r.id = ?
    `, [id]);
    res.json(updatedRepair);
  } catch (error) {
    console.error('Error updating repair:', error);
    res.status(500).json({ error: 'Internal server error updating repair' });
  }
});

app.delete('/api/repairs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await run('DELETE FROM repairs WHERE id = ?', [id]);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Repair not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting repair:', error);
    res.status(500).json({ error: 'Internal server error deleting repair' });
  }
});


// --- Serve React App ---
// Має бути після всіх API маршрутів
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});