import express from 'express';
import cors from 'cors';
// Не будемо поки підключати базу даних чи ініціалізацію, щоб мінімізувати точки відмови
// import path from 'path';
// import { fileURLToPath } from 'url';
// import bcrypt from 'bcryptjs';
// import { query, getOne, run } from './database.js';
// import { initializeDatabase } from './init-db.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'dist')));

// Middleware для логування запитів
app.use((req, res, next) => {
  console.log(`[Minimal Server] ${req.method} ${req.url}`);
  next();
});

console.log('[Minimal Server] Initializing...');

// --- API Routes ---

app.get('/api/test', (req, res) => {
  console.log('[Minimal Server] /api/test hit');
  res.json({ message: 'Test route is working!' });
});

// Додамо один маршрут з параметром, щоб перевірити саме його
app.get('/api/test/:id', (req, res) => {
  const { id } = req.params;
  console.log(`[Minimal Server] /api/test/${id} hit`);
  res.json({ message: `Test route with id ${id} is working!` });
});

// --- Serve React App ---
// app.get('*', (req, res) => {
//   if (!req.path.startsWith('/api/')) {
//     res.sendFile(path.join(__dirname, 'dist', 'index.html'));
//   } else {
//     res.status(404).json({ error: 'API endpoint not found' });
//   }
// });

app.listen(PORT, () => {
  console.log(`[Minimal Server] Server is running on http://localhost:${PORT}`);
});