import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDbInstance } from '../../database.js'; // Виправлено шлях до database.js

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Шлях до SQL файлу ініціалізації
// Важливо: __dirname тут буде вказувати на каталог backend/db/
// Тому для init_sqlite.sql, який в корені, шлях буде '../../init_sqlite.sql'
const sqlFilePath = path.join(__dirname, '..', '..', 'init_sqlite.sql');

export async function initializeDatabase() {
  try {
    const db = getDbInstance(); // Отримуємо екземпляр бази даних
    console.log('Database instance obtained in init_db.js');

    // Читаємо SQL-скрипт
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('SQL script read successfully from:', sqlFilePath);

    // Виконуємо SQL-скрипт
    // better-sqlite3 дозволяє виконувати кілька інструкцій через exec()
    db.exec(sqlScript);
    console.log('Database schema initialized successfully from init_sqlite.sql');

  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error; // Перекидаємо помилку, щоб її можна було обробити в server.js
  }
}

// Якщо ви хочете мати можливість запускати цей файл окремо для ініціалізації
// (наприклад, через `node backend/db/init_db.js`)
// можна додати наступний блок:
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Running init_db.js directly...');
  initializeDatabase()
    .then(() => {
      console.log('Manual database initialization complete.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Manual database initialization failed:', err);
      process.exit(1);
    });
}