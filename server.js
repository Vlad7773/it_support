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
      ORDER BY w.registration_date DESC, w.created_at DESC
    `);
    res.json(workstations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/workstations', async (req, res) => {
  const { 
    inventory_number, 
    ip_address, 
    mac_address, 
    grif, 
    os_name, 
    department_id, 
    responsible_id, 
    contacts, 
    notes, 
    processor,
    ram,
    storage,
    monitor,
    network,
    type,
    status, 
    registration_date 
  } = req.body;
  
  if (!inventory_number || !os_name || !grif) {
    return res.status(400).json({ error: 'Inventory number, OS name and grif are required' });
  }

  // Перевірка IP-адреси для грифів вище ДСК
  if (ip_address && !['ДСК', 'Відкрито'].includes(grif)) {
    return res.status(400).json({ error: 'IP-адреса може бути вказана тільки для грифів ДСК та Відкрито' });
  }

  // Перевірка формату IP-адреси
  if (ip_address) {
    const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip_address)) {
      return res.status(400).json({ error: 'Некоректний формат IP-адреси' });
    }
    const octets = ip_address.split('.').map(Number);
    if (octets.some(octet => octet < 0 || octet > 255)) {
      return res.status(400).json({ error: 'IP-адреса повинна містити числа від 0 до 255' });
    }
  }

  // Перевірка формату MAC-адреси
  if (mac_address) {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(mac_address)) {
      return res.status(400).json({ error: 'Некоректний формат MAC-адреси' });
    }
  }

  // Перевірка відповідності відділу відповідальної особи
  if (responsible_id && department_id) {
    const responsible = await getOne('SELECT department_id FROM users WHERE id = ?', [responsible_id]);
    if (!responsible || responsible.department_id !== department_id) {
      return res.status(400).json({ error: 'Відповідальна особа повинна належати до того ж відділу, що і робоча станція' });
    }
  }
  
  try {
    const result = await run(
      `INSERT INTO workstations 
       (inventory_number, ip_address, mac_address, grif, os_name, department_id, responsible_id, contacts, notes, processor, ram, storage, monitor, network, type, status, registration_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        inventory_number, 
        ip_address, 
        mac_address, 
        grif, 
        os_name, 
        department_id, 
        responsible_id, 
        contacts, 
        notes, 
        processor,
        ram,
        storage,
        monitor,
        network,
        type || 'Десктоп',
        status || 'operational', 
        registration_date || new Date().toISOString().split('T')[0]
      ]
    );
    
    const newWorkstation = await getOne(`
      SELECT w.*, d.name as department_name, u.full_name as responsible_name 
      FROM workstations w 
      LEFT JOIN departments d ON w.department_id = d.id 
      LEFT JOIN users u ON w.responsible_id = u.id 
      WHERE w.id = ?
    `, [result.lastInsertRowid]);
    
    res.status(201).json(newWorkstation);
  } catch (error) {
    console.error('Error creating workstation:', error);
    if (error.message.includes('check_ip_grif')) {
      res.status(400).json({ error: 'IP-адреса може бути вказана тільки для грифів ДСК та Відкрито' });
    } else if (error.message.includes('check_responsible_department')) {
      res.status(400).json({ error: 'Відповідальна особа повинна належати до того ж відділу, що і робоча станція' });
    } else {
      res.status(500).json({ error: 'Internal server error creating workstation' });
    }
  }
});

app.put('/api/workstations/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    inventory_number, 
    ip_address, 
    mac_address, 
    grif, 
    os_name, 
    department_id, 
    responsible_id, 
    contacts, 
    notes, 
    processor,
    ram,
    storage,
    monitor,
    network,
    type,
    status 
  } = req.body;
  
  if (!inventory_number || !os_name || !grif) {
    return res.status(400).json({ error: 'Inventory number, OS name and grif are required' });
  }

  // Перевірка IP-адреси для грифів вище ДСК
  if (ip_address && !['ДСК', 'Відкрито'].includes(grif)) {
    return res.status(400).json({ error: 'IP-адреса може бути вказана тільки для грифів ДСК та Відкрито' });
  }

  // Перевірка формату IP-адреси
  if (ip_address) {
    const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ip_address)) {
      return res.status(400).json({ error: 'Некоректний формат IP-адреси' });
    }
    const octets = ip_address.split('.').map(Number);
    if (octets.some(octet => octet < 0 || octet > 255)) {
      return res.status(400).json({ error: 'IP-адреса повинна містити числа від 0 до 255' });
    }
  }

  // Перевірка формату MAC-адреси
  if (mac_address) {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(mac_address)) {
      return res.status(400).json({ error: 'Некоректний формат MAC-адреси' });
    }
  }

  // Перевірка відповідності відділу відповідальної особи
  if (responsible_id && department_id) {
    const responsible = await getOne('SELECT department_id FROM users WHERE id = ?', [responsible_id]);
    if (!responsible || responsible.department_id !== department_id) {
      return res.status(400).json({ error: 'Відповідальна особа повинна належати до того ж відділу, що і робоча станція' });
    }
  }
  
  try {
    await run(
      `UPDATE workstations 
       SET inventory_number = ?, ip_address = ?, mac_address = ?, grif = ?, os_name = ?, 
           department_id = ?, responsible_id = ?, contacts = ?, notes = ?, processor = ?, 
           ram = ?, storage = ?, monitor = ?, network = ?, type = ?, status = ?, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        inventory_number, 
        ip_address, 
        mac_address, 
        grif, 
        os_name, 
        department_id, 
        responsible_id, 
        contacts, 
        notes, 
        processor,
        ram,
        storage,
        monitor,
        network,
        type,
        status, 
        id
      ]
    );
    
    const updatedWorkstation = await getOne(`
      SELECT w.*, d.name as department_name, u.full_name as responsible_name 
      FROM workstations w 
      LEFT JOIN departments d ON w.department_id = d.id 
      LEFT JOIN users u ON w.responsible_id = u.id 
      WHERE w.id = ?
    `, [id]);
    
    if (!updatedWorkstation) {
        return res.status(404).json({ error: 'Workstation not found' });
    }
    res.json(updatedWorkstation);
  } catch (error) {
    console.error('Error updating workstation:', error);
    if (error.message.includes('check_ip_grif')) {
      res.status(400).json({ error: 'IP-адреса може бути вказана тільки для грифів ДСК та Відкрито' });
    } else if (error.message.includes('check_responsible_department')) {
      res.status(400).json({ error: 'Відповідальна особа повинна належати до того ж відділу, що і робоча станція' });
    } else {
      res.status(500).json({ error: 'Internal server error updating workstation' });
    }
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
    // Перевіряємо роль користувача (припускаємо, що роль передається в заголовку)
    const userRole = req.headers['user-role'];
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено. Ця сторінка доступна тільки для адміністраторів.' });
    }

    const users = await query(`
      SELECT u.id, u.username, u.full_name, u.role, 
             d.id as department_id, d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
    `);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get departments (for user creation/editing)
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await query('SELECT id, name FROM departments ORDER BY name');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new department
app.post('/api/departments', async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Назва відділу обов\'язкова' });
  }
  try {
    const result = await run(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description || '']
    );
    const newDepartment = await getOne('SELECT * FROM departments WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(newDepartment);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Відділ з такою назвою вже існує' });
    }
    res.status(500).json({ error: 'Помилка при створенні відділу' });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, password, full_name, role, department_id, department_name } = req.body;
  
  // Перевіряємо роль користувача, який створює
  const userRole = req.headers['user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Доступ заборонено. Тільки адміністратор може створювати користувачів.' });
  }

  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'Логін, пароль та ПІБ обов\'язкові' });
  }

  try {
    let finalDepartmentId = department_id;

    // Якщо вказано нову назву відділу, створюємо його
    if (!department_id && department_name) {
      const newDepartmentResult = await run(
        'INSERT INTO departments (name) VALUES (?)',
        [department_name]
      );
      finalDepartmentId = newDepartmentResult.lastInsertRowid;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (username, password, full_name, role, department_id) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, full_name, role || 'user', finalDepartmentId]
    );

    const newUser = await getOne(`
      SELECT u.id, u.username, u.full_name, u.role, 
             d.id as department_id, d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ?
    `, [result.lastInsertRowid]);

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message.includes('UNIQUE constraint failed: users.username')) {
      return res.status(409).json({ error: 'Користувач з таким логіном вже існує' });
    }
    res.status(500).json({ error: 'Помилка при створенні користувача' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, full_name, role, department_id, department_name } = req.body;

  // Перевіряємо роль користувача, який редагує
  const userRole = req.headers['user-role'];
  if (userRole !== 'admin' && userRole !== 'editor') {
    return res.status(403).json({ error: 'Доступ заборонено. Ви не маєте прав на редагування користувачів.' });
  }

  // Звичайний користувач не може змінювати дані
  if (userRole === 'user') {
    return res.status(403).json({ error: 'Доступ заборонено. Ви не маєте прав на редагування.' });
  }

  try {
    let finalDepartmentId = department_id;

    // Якщо вказано нову назву відділу, створюємо його
    if (!department_id && department_name) {
      const newDepartmentResult = await run(
        'INSERT INTO departments (name) VALUES (?)',
        [department_name]
      );
      finalDepartmentId = newDepartmentResult.lastInsertRowid;
    }

    let updates = [];
    let values = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (full_name) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (role && userRole === 'admin') { // Тільки адмін може змінювати ролі
      updates.push('role = ?');
      values.push(role);
    }
    if (finalDepartmentId) {
      updates.push('department_id = ?');
      values.push(finalDepartmentId);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Не вказано даних для оновлення' });
    }

    values.push(id);
    await run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedUser = await getOne(`
      SELECT u.id, u.username, u.full_name, u.role, 
             d.id as department_id, d.name as department_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.id = ?
    `, [id]);

    if (!updatedUser) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.message.includes('UNIQUE constraint failed: users.username')) {
      return res.status(409).json({ error: 'Користувач з таким логіном вже існує' });
    }
    res.status(500).json({ error: 'Помилка при оновленні користувача' });
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


// SOFTWARE API
app.get('/api/software', async (req, res) => {
  try {
    const software = await query(`
      SELECT s.*, w.inventory_number as workstation_inventory_number
      FROM software s
      LEFT JOIN workstations w ON s.workstation_id = w.id
      ORDER BY s.installed_date DESC
    `);
    res.json(software);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/software', async (req, res) => {
  const { name, version, license_key, workstation_id, installed_date } = req.body;
  if (!name || !version || !workstation_id) {
    return res.status(400).json({ error: 'Name, version and workstation_id are required' });
  }
  try {
    const result = await run(
      'INSERT INTO software (name, version, license_key, workstation_id, installed_date) VALUES (?, ?, ?, ?, ?)',
      [name, version, license_key, workstation_id, installed_date || new Date().toISOString().split('T')[0]]
    );
    const newSoftware = await getOne(`
      SELECT s.*, w.inventory_number as workstation_inventory_number
      FROM software s
      LEFT JOIN workstations w ON s.workstation_id = w.id
      WHERE s.id = ?
    `, [result.lastInsertRowid]);
    res.status(201).json(newSoftware);
  } catch (error) {
    console.error('Error creating software:', error);
    res.status(500).json({ error: 'Internal server error creating software' });
  }
});

app.put('/api/software/:id', async (req, res) => {
  const { id } = req.params;
  const { name, version, license_key, workstation_id, installed_date } = req.body;
  if (!name && !version && !workstation_id && !license_key && !installed_date) {
    return res.status(400).json({ error: 'At least one field must be provided for update.' });
  }
  try {
    const currentSoftware = await getOne('SELECT * FROM software WHERE id = ?', [id]);
    if (!currentSoftware) {
      return res.status(404).json({ error: 'Software not found' });
    }
    await run(
      'UPDATE software SET name = ?, version = ?, license_key = ?, workstation_id = ?, installed_date = ? WHERE id = ?',
      [
        name !== undefined ? name : currentSoftware.name,
        version !== undefined ? version : currentSoftware.version,
        license_key !== undefined ? license_key : currentSoftware.license_key,
        workstation_id !== undefined ? workstation_id : currentSoftware.workstation_id,
        installed_date !== undefined ? installed_date : currentSoftware.installed_date,
        id
      ]
    );
    const updatedSoftware = await getOne(`
      SELECT s.*, w.inventory_number as workstation_inventory_number
      FROM software s
      LEFT JOIN workstations w ON s.workstation_id = w.id
      WHERE s.id = ?
    `, [id]);
    res.json(updatedSoftware);
  } catch (error) {
    console.error('Error updating software:', error);
    res.status(500).json({ error: 'Internal server error updating software' });
  }
});

app.delete('/api/software/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await run('DELETE FROM software WHERE id = ?', [id]);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Software not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting software:', error);
    res.status(500).json({ error: 'Internal server error deleting software' });
  }
});

// Get software for specific workstation (if needed)
app.get('/api/workstations/:id/software', async (req, res) => {
  const { id } = req.params;
  try {
    const software = await query(`
      SELECT s.*, w.inventory_number as workstation_inventory_number
      FROM software s
      LEFT JOIN workstations w ON s.workstation_id = w.id
      WHERE s.workstation_id = ?
      ORDER BY s.installed_date DESC
    `, [id]);
    res.json(software);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WORKSTATION STATUSES API  
app.get('/api/workstationstatuses', async (req, res) => {
  try {
    // Статичні статуси для робочих станцій
    const statuses = [
      { id: 1, value: 'operational', name: 'Працює', color: 'bg-green-500 text-green-100' },
      { id: 2, value: 'maintenance', name: 'Обслуговування', color: 'bg-yellow-500 text-yellow-100' },
      { id: 3, value: 'repair', name: 'Ремонт', color: 'bg-red-500 text-red-100' },
      { id: 4, value: 'decommissioned', name: 'Списано', color: 'bg-gray-500 text-gray-100' }
    ];
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GRIF LEVELS API
app.get('/api/griflevels', async (req, res) => {
  try {
    // Статичні рівні грифів
    const grifLevels = [
      { id: 1, value: 'Відкрито', name: 'Відкрито', color: 'bg-blue-500 text-blue-100' },
      { id: 2, value: 'ДСК', name: 'ДСК', color: 'bg-green-500 text-green-100' },
      { id: 3, value: 'Таємно', name: 'Таємно', color: 'bg-yellow-500 text-yellow-100' },
      { id: 4, value: 'Цілком таємно', name: 'Цілком\nтаємно', color: 'bg-orange-500 text-orange-100' },
      { id: 5, value: 'Особливої важливості', name: 'Особливої\nважливості', color: 'bg-red-500 text-red-100' }
    ];
    res.json(grifLevels);
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
        t.id, t.title, t.type, t.description, t.status, t.priority, t.user_id, t.workstation_id, t.assigned_to, t.created_at, t.updated_at,
        u_reporter.full_name as reporter_name, 
        u_assignee.full_name as assignee_name,
        w.inventory_number as workstation_inventory_number
      FROM tickets t
      LEFT JOIN users u_reporter ON t.user_id = u_reporter.id
      LEFT JOIN users u_assignee ON t.assigned_to = u_assignee.id
      LEFT JOIN workstations w ON t.workstation_id = w.id
      ORDER BY t.id DESC
    `);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  const { user_id, workstation_id, title, type, description, status, priority, assigned_to } = req.body;
  if (!title || !description || !user_id || !workstation_id) {
    return res.status(400).json({ error: 'Title, description, user_id and workstation_id are required' });
  }
  try {
    const currentTime = new Date().toISOString();
    const result = await run(
      'INSERT INTO tickets (user_id, workstation_id, title, type, description, status, priority, created_at, updated_at, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, workstation_id, title, type || 'other', description, status || 'open', priority || 'medium', currentTime, currentTime, assigned_to]
    );
    const newTicket = await getOne(`
      SELECT t.id, t.title, t.type, t.description, t.status, t.priority, t.user_id, t.workstation_id, t.assigned_to, t.created_at, t.updated_at,
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
  const { workstation_id, title, type, description, status, priority, assigned_to } = req.body;
   if (!title && !type && !description && !status && !priority && workstation_id === undefined && assigned_to === undefined) {
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
      'UPDATE tickets SET workstation_id = ?, title = ?, type = ?, description = ?, status = ?, priority = ?, updated_at = ?, assigned_to = ? WHERE id = ?',
      [
        workstation_id !== undefined ? workstation_id : currentTicket.workstation_id,
        title !== undefined ? title : currentTicket.title,
        type !== undefined ? type : currentTicket.type,
        description !== undefined ? description : currentTicket.description,
        status !== undefined ? status : currentTicket.status,
        priority !== undefined ? priority : currentTicket.priority,
        currentTime,
        assigned_to !== undefined ? assigned_to : currentTicket.assigned_to,
        id
      ]
    );
    const updatedTicket = await getOne(`
      SELECT t.id, t.title, t.type, t.description, t.status, t.priority, t.user_id, t.workstation_id, t.assigned_to, t.created_at, t.updated_at,
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
        r.id, r.workstation_id, r.technician_id, r.description, r.repair_date, r.cost, r.status, r.created_at, r.updated_at,
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
      SELECT r.id, r.workstation_id, r.technician_id, r.description, r.repair_date, r.cost, r.status, r.created_at, r.updated_at,
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
      SELECT r.id, r.workstation_id, r.technician_id, r.description, r.repair_date, r.cost, r.status, r.created_at, r.updated_at,
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
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Handle client-side routing
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});