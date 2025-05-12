import sqlite3

def get_db_connection():
    """Створює підключення до бази даних."""
    try:
        conn = sqlite3.connect('workplaces.db')
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        raise Exception(f"Помилка підключення до бази даних: {e}")

def init_db():
    """Ініціалізує базу даних із необхідними таблицями."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS workplaces (
                inventory_number TEXT UNIQUE,
                ip_address TEXT,
                mac_address TEXT,
                access_level TEXT,
                unit TEXT,
                person TEXT,
                contacts TEXT,
                notes TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS software (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                inventory_number TEXT,
                date TEXT,
                software_name TEXT,
                version TEXT,
                license_key TEXT,
                comments TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS maintenance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                inventory_number TEXT,
                date TEXT,
                type TEXT,
                performed TEXT,
                performed_by TEXT,
                comments TEXT
            )
        ''')
        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Помилка ініціалізації бази даних: {e}")
    finally:
        conn.close()

# Функції для роботи з таблицею workplaces
def get_all_workplaces():
    """Отримує всі записи з таблиці workplaces."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT rowid, * FROM workplaces')
        return cursor.fetchall()
    except sqlite3.Error as e:
        raise Exception(f"Помилка отримання даних АРМ: {e}")
    finally:
        conn.close()

def get_inventory_numbers():
    """Отримує всі інвентарні номери з таблиці workplaces."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT inventory_number FROM workplaces')
        return [row['inventory_number'] for row in cursor.fetchall()]
    except sqlite3.Error as e:
        raise Exception(f"Помилка отримання інвентарних номерів: {e}")
    finally:
        conn.close()

def add_workplace(data):
    """Додає новий запис до таблиці workplaces."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Перевіряємо, чи існує інвентарний номер
        cursor.execute('SELECT inventory_number FROM workplaces WHERE inventory_number = ?', (data[0],))
        if cursor.fetchone():
            raise Exception(f"Інвентарний номер {data[0]} вже існує!")
        cursor.execute('''
            INSERT INTO workplaces (inventory_number, ip_address, mac_address, access_level, unit, person, contacts, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', data)
        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Помилка додавання АРМ: {e}")
    finally:
        conn.close()

def get_workplace_by_id(rowid):
    """Отримує запис АРМ за ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM workplaces WHERE rowid = ?', (rowid,))
        return cursor.fetchone()
    except sqlite3.Error as e:
        raise Exception(f"Помилка отримання АРМ за ID {rowid}: {e}")
    finally:
        conn.close()

def update_workplace(rowid, data):
    """Оновлює запис АРМ за ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE workplaces SET ip_address = ?, mac_address = ?, access_level = ?, unit = ?, person = ?, contacts = ?, notes = ?
            WHERE rowid = ?
        ''', (*data, rowid))
        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Помилка оновлення АРМ за ID {rowid}: {e}")
    finally:
        conn.close()

def delete_workplace(rowid):
    """Видаляє запис АРМ за ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM workplaces WHERE rowid = ?', (rowid,))
        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Помилка видалення АРМ за ID {rowid}: {e}")
    finally:
        conn.close()

def search_workplaces(search_term):
    """Шукає записи АРМ за пошуковим терміном."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT rowid, * FROM workplaces WHERE inventory_number LIKE ? OR ip_address LIKE ? OR mac_address LIKE ? OR person LIKE ?', 
                       ('%' + search_term + '%', '%' + search_term + '%', '%' + search_term + '%', '%' + search_term + '%'))
        return cursor.fetchall()
    except sqlite3.Error as e:
        raise Exception(f"Помилка пошуку АРМ: {e}")
    finally:
        conn.close()

# Функції для роботи з таблицею software
def get_all_software(sort_by_date='desc', search_term_inventory=None, search_term_name=None):
    """Отримує всі записи з таблиці software з можливістю сортування та пошуку."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        query = 'SELECT * FROM software'
        params = []
        
        # Додаємо умови пошуку
        conditions = []
        if search_term_inventory:
            conditions.append('inventory_number LIKE ?')
            params.append('%' + search_term_inventory + '%')
        if search_term_name:
            conditions.append('software_name LIKE ?')
            params.append('%' + search_term_name + '%')
        
        if conditions:
            query += ' WHERE ' + ' AND '.join(conditions)
        
        # Додаємо сортування
        query += ' ORDER BY date ' + ('DESC' if sort_by_date == 'desc' else 'ASC')
        
        cursor.execute(query, params)
        return cursor.fetchall()
    except sqlite3.Error as e:
        raise Exception(f"Помилка отримання даних ПЗ: {e}")
    finally:
        conn.close()

def add_software(data):
    """Додає новий запис до таблиці software."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO software (inventory_number, date, software_name, version, license_key, comments)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', data)
        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Помилка додавання ПЗ: {e}")
    finally:
        conn.close()

def get_software_by_id(software_id):
    """Отримує запис ПЗ за ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM software WHERE id = ?', (software_id,))
        return cursor.fetchone()
    except sqlite3.Error as e:
        raise Exception(f"Помилка отримання ПЗ за ID {software_id}: {e}")
    finally:
        conn.close()

def update_software(software_id, data):
    """Оновлює запис ПЗ за ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE software SET inventory_number = ?, date = ?, software_name = ?, version = ?, license_key = ?, comments = ?
            WHERE id = ?
        ''', (*data, software_id))
        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Помилка оновлення ПЗ за ID {software_id}: {e}")
    finally:
        conn.close()

def delete_software(software_id):
    """Видаляє запис ПЗ за ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM software WHERE id = ?', (software_id,))
        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Помилка видалення ПЗ за ID {software_id}: {e}")
    finally:
        conn.close()

# Функції для роботи з таблицею maintenance
def get_all_maintenance(sort_by_date='desc', search_term_inventory=None):
    """Отримує всі записи з таблиці maintenance з можливістю сортування та пошуку."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        query = 'SELECT * FROM maintenance'
        params = []
        
        # Додаємо умови пошуку
        if search_term_inventory:
            query += ' WHERE inventory_number LIKE ?'
            params.append('%' + search_term_inventory + '%')
        
        # Додаємо сортування
        query += ' ORDER BY date ' + ('DESC' if sort_by_date == 'desc' else 'ASC')
        
        cursor.execute(query, params)
        return cursor.fetchall()
    except sqlite3.Error as e:
        raise Exception(f"Помилка отримання даних обслуговування: {e}")
    finally:
        conn.close()

def add_maintenance(data):
    """Додає новий запис до таблиці maintenance."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO maintenance (inventory_number, date, type, performed, performed_by, comments)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', data)
        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Помилка додавання обслуговування: {e}")
    finally:
        conn.close()

def get_maintenance_by_id(maintenance_id):
    """Отримує запис обслуговування за ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM maintenance WHERE id = ?', (maintenance_id,))
        return cursor.fetchone()
    except sqlite3.Error as e:
        raise Exception(f"Помилка отримання обслуговування за ID {maintenance_id}: {e}")
    finally:
        conn.close()

def update_maintenance(maintenance_id, data):
    """Оновлює запис обслуговування за ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE maintenance SET inventory_number = ?, date = ?, type = ?, performed = ?, performed_by = ?, comments = ?
            WHERE id = ?
        ''', (*data, maintenance_id))
        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Помилка оновлення обслуговування за ID {maintenance_id}: {e}")
    finally:
        conn.close()

def delete_maintenance(maintenance_id):
    """Видаляє запис обслуговування за ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM maintenance WHERE id = ?', (maintenance_id,))
        conn.commit()
    except sqlite3.Error as e:
        raise Exception(f"Помилка видалення обслуговування за ID {maintenance_id}: {e}")
    finally:
        conn.close()

# Функції для статистики
def get_stats():
    """Отримує статистику для головної сторінки."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        # Підрахунок загальної кількості
        cursor.execute('SELECT COUNT(*) FROM workplaces')
        total_workplaces = cursor.fetchone()[0] or 0
        
        cursor.execute('SELECT COUNT(*) FROM software')
        total_software = cursor.fetchone()[0] or 0
        
        cursor.execute('SELECT COUNT(*) FROM maintenance')
        total_maintenance = cursor.fetchone()[0] or 0
        
        # Розподіл за підрозділами
        cursor.execute('SELECT unit, COUNT(*) as count FROM workplaces GROUP BY unit')
        unit_distribution = cursor.fetchall()
        units = [row['unit'] for row in unit_distribution if row['unit']] or ['Немає даних']
        unit_counts = [row['count'] for row in unit_distribution if row['unit']] or [0]
        
        # Розподіл ПЗ за назвами
        cursor.execute('SELECT software_name, COUNT(*) as count FROM software GROUP BY software_name')
        software_distribution = cursor.fetchall()
        software_names = [row['software_name'] for row in software_distribution if row['software_name']] or ['Немає даних']
        software_counts = [row['count'] for row in software_distribution if row['software_name']] or [0]
        
        return {
            'total_workplaces': total_workplaces,
            'total_software': total_software,
            'total_maintenance': total_maintenance,
            'units': units,
            'unit_counts': unit_counts,
            'software_names': software_names,
            'software_counts': software_counts
        }
    except sqlite3.Error as e:
        raise Exception(f"Помилка отримання статистики: {e}")
    finally:
        conn.close()