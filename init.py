import sqlite3
from db import get_db_connection

def migrate_users_table():
    conn = sqlite3.connect("workplaces.db")
    cur = conn.cursor()
    columns_to_add = [
        ("full_name", "TEXT"),
        ("rank", "TEXT"),
        ("unit", "TEXT"),
        ("notes", "TEXT"),
        ("status", "TEXT DEFAULT 'active'"),
        ("attempts_left", "INTEGER DEFAULT 3")
    ]
    for column_name, column_type in columns_to_add:
        try:
            cur.execute(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}")
        except sqlite3.OperationalError:
            pass  # колонка вже є — пропускаємо
    conn.commit()
    conn.close()
    print("✅ Таблицю users оновлено успішно.")

if __name__ == "__main__":
    migrate_users_table()
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            full_name TEXT,
            rank TEXT,
            unit TEXT,
            notes TEXT,
            role TEXT DEFAULT 'user',
            status TEXT DEFAULT 'active',
            attempts_left INTEGER DEFAULT 3
        )
    ''')
    conn.commit()
    conn.close()
