import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.sqlite');

// Ensure db directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

export function openDb() {
    if (!db) {
        db = new Database(dbPath);
        db.pragma('foreign_keys = ON');
    }
    return db;
}

export function closeDb() {
    if (db) {
        db.close();
        db = null;
    }
}

export function getDbInstance() {
    if (!db) {
        return openDb();
    }
    return db;
}

export function getOne(sql, params = []) {
    try {
        const stmt = getDbInstance().prepare(sql);
        return stmt.get(params);
    } catch (error) {
        console.error('Error in getOne:', error);
        throw error;
    }
}

export function query(sql, params = []) {
    try {
        const stmt = getDbInstance().prepare(sql);
        return stmt.all(params);
    } catch (error) {
        console.error('Error in query:', error);
        throw error;
    }
}

export function run(sql, params = []) {
    try {
        const stmt = getDbInstance().prepare(sql);
        return stmt.run(params);
    } catch (error) {
        console.error('Error in run:', error);
        throw error;
    }
}

export function transaction(callback) {
    const db = getDbInstance();
    try {
        db.prepare('BEGIN').run();
        const result = callback(db);
        db.prepare('COMMIT').run();
        return result;
    } catch (error) {
        db.prepare('ROLLBACK').run();
        throw error;
    }
} 