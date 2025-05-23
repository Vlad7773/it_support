import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { openDb, closeDb } from './database.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        
        // Read SQL initialization script
        const sqlScriptPath = path.join(__dirname, 'init_sqlite.sql');
        const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');
        
        // Open database connection
        const db = openDb();
        
        // Execute SQL script
        db.exec(sqlScript);
        
        // Create admin user with hashed password
        const adminPassword = await bcrypt.hash('admin123', 10);
        db.prepare(`
            INSERT OR IGNORE INTO users (username, password, full_name, role)
            VALUES (?, ?, ?, ?)
        `).run('admin', adminPassword, 'Admin User', 'admin');
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        closeDb();
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