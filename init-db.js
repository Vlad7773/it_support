import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { openDb, closeDb } from './database.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
    let db;
    try {
        console.log('Initializing database...');
        
        // Read SQL initialization script
        const sqlScriptPath = path.join(__dirname, 'init_sqlite.sql');
        const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');
        
        // Open database connection
        db = openDb();
        
        // Execute SQL script (створює таблиці та вставляє початкові дані)
        db.exec(sqlScript);
        
        // Тепер оновлюємо паролі користувачів на правильно хешовані
        console.log('Updating user passwords...');
        
        // Створюємо хешовані паролі
        const adminPassword = await bcrypt.hash('admin123', 10);
        const userPassword = await bcrypt.hash('user123', 10);
        
        // Оновлюємо паролі для всіх користувачів
        const updatePassword = db.prepare('UPDATE users SET password = ? WHERE username = ?');
        
        updatePassword.run(adminPassword, 'admin');
        updatePassword.run(userPassword, 'petrov.petro');
        updatePassword.run(userPassword, 'sidorova.maria');
        updatePassword.run(userPassword, 'kovalenko.olena');
        updatePassword.run(userPassword, 'melnik.oleg');
        updatePassword.run(userPassword, 'ivanov.ivan');
        
        console.log('Database initialized successfully');
        console.log('Users created:');
        console.log('  - admin/admin123 (admin role)');
        console.log('  - petrov.petro/user123 (user role)');
        console.log('  - sidorova.maria/user123 (user role)');
        console.log('  - kovalenko.olena/user123 (user role)');
        console.log('  - melnik.oleg/user123 (user role)');
        console.log('  - ivanov.ivan/user123 (user role)');
        
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        if (db) closeDb();
    }
}

// Run initialization if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
} 