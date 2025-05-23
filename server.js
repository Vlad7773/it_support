import express from 'express';
import cors from 'cors';
import 'dotenv/config';

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

// Mock data
const mockWorkstations = [
  { id: 1, inventory_number: 'ARM-001', os_name: 'Windows 10', department_name: 'IT', responsible: 'John Doe', status: 'available' },
  { id: 2, inventory_number: 'ARM-002', os_name: 'Windows 11', department_name: 'HR', responsible: 'Jane Smith', status: 'in_use' },
  { id: 3, inventory_number: 'ARM-003', os_name: 'Windows 10', department_name: 'IT', responsible: 'Mike Johnson', status: 'maintenance' },
  { id: 4, inventory_number: 'ARM-004', os_name: 'Windows 11', department_name: 'Finance', responsible: 'Sarah Williams', status: 'available' },
];

const mockTickets = [
  { id: 1, type: 'Hardware', status: 'В очікуванні', user: 'John Doe', date: '2024-03-20', priority: 'Високий' },
  { id: 2, type: 'Software', status: 'В процесі', user: 'Jane Smith', date: '2024-03-19', priority: 'Середній' },
  { id: 3, type: 'Network', status: 'В очікуванні', user: 'Mike Johnson', date: '2024-03-18', priority: 'Критичний' },
  { id: 4, type: 'Hardware', status: 'Завершено', user: 'Sarah Williams', date: '2024-03-17', priority: 'Низький' },
  { id: 5, type: 'Software', status: 'В процесі', user: 'John Doe', date: '2024-03-16', priority: 'Високий' },
  { id: 6, type: 'Hardware', status: 'В очікуванні', user: 'Jane Smith', date: '2024-03-15', priority: 'Середній' },
];

const mockRepairs = [
  { id: 1, workstation_id: 3, status: 'В процесі', description: 'Hardware repair' },
  { id: 2, workstation_id: 1, status: 'Завершено', description: 'Software update' },
];

const mockUsers = [
  { id: 1, name: 'John Doe', department: 'IT' },
  { id: 2, name: 'Jane Smith', department: 'HR' },
  { id: 3, name: 'Mike Johnson', department: 'IT' },
  { id: 4, name: 'Sarah Williams', department: 'Finance' },
];

// Routes with mock data
app.get('/api/workstations', (req, res) => {
  console.log('GET /api/workstations requested');
  res.json(mockWorkstations);
});

app.get('/api/workstationstatuses', (req, res) => {
  console.log('GET /api/workstationstatuses requested');
  const statuses = mockWorkstations.reduce((acc, ws) => {
    acc[ws.status] = (acc[ws.status] || 0) + 1;
    return acc;
  }, {});
  res.json(Object.entries(statuses).map(([status, count]) => ({ status, count })));
});

app.get('/api/users', (req, res) => {
  console.log('GET /api/users requested');
  res.json(mockUsers);
});

app.get('/api/departments', (req, res) => {
  console.log('GET /api/departments requested');
  const departments = [...new Set(mockWorkstations.map(ws => ws.department_name))];
  res.json(departments);
});

app.get('/api/tickets', (req, res) => {
  console.log('GET /api/tickets requested');
  res.json(mockTickets);
});

app.get('/api/repairs', (req, res) => {
  console.log('GET /api/repairs requested');
  res.json(mockRepairs);
});

// Error handling middleware (basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 