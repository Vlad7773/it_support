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

// Placeholder routes
app.get('/api/workstations', (req, res) => {
  console.log('GET /api/workstations requested');
  res.json([]);
});

app.get('/api/workstationstatuses', (req, res) => {
  console.log('GET /api/workstationstatuses requested');
  res.json([]);
});

app.get('/api/users', (req, res) => {
  console.log('GET /api/users requested');
  res.json([]);
});

app.get('/api/departments', (req, res) => {
  console.log('GET /api/departments requested');
  res.json([]);
});

app.get('/api/tickets', (req, res) => {
  console.log('GET /api/tickets requested');
  res.json([]);
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