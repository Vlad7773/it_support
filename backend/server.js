const express = require('express');
const cors = require('cors');
const db = require('./config/database');
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

// Workstations routes
app.get('/api/workstations', (req, res) => {
  db.all(`
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
    FROM workstations ws
    LEFT JOIN it_users ON ws.current_user_id = it_users.id
    LEFT JOIN departments ON ws.department_id = departments.id
    LEFT JOIN workstation_statuses ws_status ON ws.status_id = ws_status.id
  `, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

app.post('/api/workstations', (req, res) => {
  const { name, processor, ram, storage, os, acquisition_date, status_id, current_user_id, department_id } = req.body;
  db.run(
    `INSERT INTO workstations (name, processor, ram, storage, os, acquisition_date, status_id, current_user_id, department_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, processor, ram, storage, os, acquisition_date, status_id, current_user_id, department_id],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

app.put('/api/workstations/:id', (req, res) => {
  const { id } = req.params;
  const { name, processor, ram, storage, os, acquisition_date, status_id, current_user_id, department_id } = req.body;
  db.run(
    `UPDATE workstations 
     SET name = ?, processor = ?, ram = ?, storage = ?, os = ?, acquisition_date = ?, 
         status_id = ?, current_user_id = ?, department_id = ?
     WHERE id = ?`,
    [name, processor, ram, storage, os, acquisition_date, status_id, current_user_id, department_id, id],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Workstation not found' });
      }
      res.json({ id, ...req.body });
    }
  );
});

app.delete('/api/workstations/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM workstations WHERE id = ?', [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Workstation not found' });
    }
    res.json({ message: 'Workstation deleted successfully' });
  });
});

// Users routes
app.get('/api/users', (req, res) => {
  db.all(`
    SELECT it_users.id, it_users.name, it_users.position, it_users.login, departments.name as department
    FROM it_users
    LEFT JOIN departments ON it_users.department_id = departments.id
  `, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { name, position, login, password_hash, department_id } = req.body;
  db.run(
    `INSERT INTO it_users (name, position, login, password_hash, department_id) 
     VALUES (?, ?, ?, ?, ?)`,
    [name, position, login, password_hash, department_id],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

// Tickets routes
app.get('/api/tickets', (req, res) => {
  db.all(`
    SELECT r.id, r.type, r.description, r.status, r.priority, r.created_at, r.updated_at,
           it_users1.name as created_by_user,
           it_users2.name as assigned_performer,
           ws.name as workstation
    FROM requests r
    LEFT JOIN it_users it_users1 ON r.created_by_user_id = it_users1.id
    LEFT JOIN it_users it_users2 ON r.assigned_performer_id = it_users2.id
    LEFT JOIN workstations ws ON r.workstation_id = ws.id
  `, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

app.post('/api/tickets', (req, res) => {
  const { type, description, status, priority, created_by_user_id, assigned_performer_id, workstation_id } = req.body;
  db.run(
    `INSERT INTO requests (type, description, status, priority, created_by_user_id, assigned_performer_id, workstation_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [type, description, status, priority, created_by_user_id, assigned_performer_id, workstation_id],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

// Repairs routes
app.get('/api/repairs', (req, res) => {
  db.all(`
    SELECT r.id, r.description, r.status, r.start_date, r.end_date,
           ws.name as workstation,
           it_users.name as assigned_performer
    FROM repairs r
    LEFT JOIN workstations ws ON r.workstation_id = ws.id
    LEFT JOIN it_users ON r.assigned_performer_id = it_users.id
  `, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

app.post('/api/repairs', (req, res) => {
  const { workstation_id, description, status, assigned_performer_id, start_date, end_date } = req.body;
  db.run(
    `INSERT INTO repairs (workstation_id, description, status, assigned_performer_id, start_date, end_date) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [workstation_id, description, status, assigned_performer_id, start_date, end_date],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 