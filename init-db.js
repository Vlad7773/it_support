import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');

// Ensure db directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

export async function initializeDatabase() {
    console.log('Initializing database...');
    
    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');

    try {
        // Read and execute SQL initialization file
        const sqlInit = fs.readFileSync(path.join(__dirname, 'init_sqlite.sql'), 'utf8');
        db.exec(sqlInit);

        // Hash passwords for users
        const saltRounds = 10;
        const defaultPassword = await bcrypt.hash('password123', saltRounds);

        // Update passwords for existing users
        const users = db.prepare('SELECT id FROM users').all();
        const updatePassword = db.prepare('UPDATE users SET password = ? WHERE id = ?');
        
        for (const user of users) {
            updatePassword.run(defaultPassword, user.id);
        }

        console.log('Database initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        db.close();
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