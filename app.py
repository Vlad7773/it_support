import sqlite3
from flask import Flask, render_template, request, redirect, url_for
import uuid

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('workplaces.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
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
            notes TEXT,
            location TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS software (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            date TEXT,
            type TEXT,
            performed TEXT,
            performed_by TEXT,
            comments TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def index():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Список АРМ
    cursor.execute('SELECT rowid, * FROM workplaces')
    workplaces = cursor.fetchall()
    
    # Підрахунок статистики
    cursor.execute('SELECT COUNT(*) FROM workplaces')
    total_workplaces = cursor.fetchone()[0] or 0
    
    cursor.execute('SELECT COUNT(*) FROM software')
    total_software = cursor.fetchone()[0] or 0
    
    cursor.execute('SELECT COUNT(*) FROM maintenance')
    total_maintenance = cursor.fetchone()[0] or 0
    
    # Розподіл за підрозділами для графіку
    cursor.execute('SELECT unit, COUNT(*) as count FROM workplaces GROUP BY unit')
    unit_distribution = cursor.fetchall()
    units = [row['unit'] for row in unit_distribution if row['unit']] or ['Немає даних']
    unit_counts = [row['count'] for row in unit_distribution if row['unit']] or [0]
    
    conn.close()
    
    return render_template('index.html', workplaces=workplaces, 
                         total_workplaces=total_workplaces, 
                         total_software=total_software, 
                         total_maintenance=total_maintenance,
                         units=units, unit_counts=unit_counts)

# Решта коду залишається без змін (add, edit, delete, add_software, edit_software, delete_software, add_maintenance, edit_maintenance, delete_maintenance, details, search)

@app.route('/add', methods=['GET', 'POST'])
def add_workplace():
    if request.method == 'POST':
        inventory_number = str(uuid.uuid4())
        ip_address = request.form['ip_address']
        mac_address = request.form['mac_address']
        access_level = request.form['access_level']
        unit = request.form['unit']
        person = request.form['person']
        contacts = request.form['contacts']
        notes = request.form['notes']
        location = request.form['location']
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO workplaces (inventory_number, ip_address, mac_address, access_level, unit, person, contacts, notes, location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (inventory_number, ip_address, mac_address, access_level, unit, person, contacts, notes, location))
        conn.commit()
        conn.close()
        return redirect(url_for('index'))
    return render_template('add.html')

@app.route('/edit/<int:rowid>', methods=['GET', 'POST'])
def edit_workplace(rowid):
    conn = get_db_connection()
    cursor = conn.cursor()
    if request.method == 'POST':
        ip_address = request.form['ip_address']
        mac_address = request.form['mac_address']
        access_level = request.form['access_level']
        unit = request.form['unit']
        person = request.form['person']
        contacts = request.form['contacts']
        notes = request.form['notes']
        location = request.form['location']
        cursor.execute('''
            UPDATE workplaces SET ip_address = ?, mac_address = ?, access_level = ?, unit = ?, person = ?, contacts = ?, notes = ?, location = ?
            WHERE rowid = ?
        ''', (ip_address, mac_address, access_level, unit, person, contacts, notes, location, rowid))
        conn.commit()
        conn.close()
        return redirect(url_for('index'))
    cursor.execute('SELECT * FROM workplaces WHERE rowid = ?', (rowid,))
    workplace = cursor.fetchone()
    conn.close()
    return render_template('edit.html', workplace=workplace, rowid=rowid)

@app.route('/delete/<int:rowid>')
def delete_workplace(rowid):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM workplaces WHERE rowid = ?', (rowid,))
    conn.commit()
    conn.close()
    return redirect(url_for('index'))

@app.route('/add_software', methods=['GET', 'POST'])
def add_software():
    if request.method == 'POST':
        software_date = request.form['software_date']
        software_name = request.form['software_name']
        version = request.form['version']
        license_key = request.form['license_key']
        comments = request.form['software_comments']
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO software (date, software_name, version, license_key, comments)
                VALUES (?, ?, ?, ?, ?)
            ''', (software_date, software_name, version, license_key, comments))
            conn.commit()
        except Exception as e:
            conn.close()
            return f"Помилка при додаванні ПЗ: {e}"
        conn.close()
        return redirect(url_for('details'))
    return render_template('add_software.html')

@app.route('/edit_software/<int:software_id>', methods=['GET', 'POST'])
def edit_software(software_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    if request.method == 'POST':
        software_date = request.form['software_date']
        software_name = request.form['software_name']
        version = request.form['version']
        license_key = request.form['license_key']
        comments = request.form['software_comments']
        cursor.execute('''
            UPDATE software SET date = ?, software_name = ?, version = ?, license_key = ?, comments = ?
            WHERE id = ?
        ''', (software_date, software_name, version, license_key, comments, software_id))
        conn.commit()
        conn.close()
        return redirect(url_for('details'))
    cursor.execute('SELECT * FROM software WHERE id = ?', (software_id,))
    software = cursor.fetchone()
    conn.close()
    return render_template('edit_software.html', software=software)

@app.route('/delete_software/<int:software_id>')
def delete_software(software_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM software WHERE id = ?', (software_id,))
    conn.commit()
    conn.close()
    return redirect(url_for('details'))

@app.route('/add_maintenance', methods=['GET', 'POST'])
def add_maintenance():
    if request.method == 'POST':
        maintenance_date = request.form['maintenance_date']
        maintenance_type = request.form['type']
        performed = request.form['performed']
        performed_by = request.form['performed_by']
        comments = request.form['maintenance_comments']
        conn = get_db_connection()
        cursor = conn.cursor()
        try:
            cursor.execute('''
                INSERT INTO maintenance (date, type, performed, performed_by, comments)
                VALUES (?, ?, ?, ?, ?)
            ''', (maintenance_date, maintenance_type, performed, performed_by, comments))
            conn.commit()
        except Exception as e:
            conn.close()
            return f"Помилка при додаванні обслуговування: {e}"
        conn.close()
        return redirect(url_for('details'))
    return render_template('add_maintenance.html')

@app.route('/edit_maintenance/<int:maintenance_id>', methods=['GET', 'POST'])
def edit_maintenance(maintenance_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    if request.method == 'POST':
        maintenance_date = request.form['maintenance_date']
        maintenance_type = request.form['type']
        performed = request.form['performed']
        performed_by = request.form['performed_by']
        comments = request.form['maintenance_comments']
        cursor.execute('''
            UPDATE maintenance SET date = ?, type = ?, performed = ?, performed_by = ?, comments = ?
            WHERE id = ?
        ''', (maintenance_date, maintenance_type, performed, performed_by, comments, maintenance_id))
        conn.commit()
        conn.close()
        return redirect(url_for('details'))
    cursor.execute('SELECT * FROM maintenance WHERE id = ?', (maintenance_id,))
    maintenance = cursor.fetchone()
    conn.close()
    return render_template('edit_maintenance.html', maintenance=maintenance)

@app.route('/delete_maintenance/<int:maintenance_id>')
def delete_maintenance(maintenance_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM maintenance WHERE id = ?', (maintenance_id,))
    conn.commit()
    conn.close()
    return redirect(url_for('details'))

@app.route('/details')
def details():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM software')
    software_records = cursor.fetchall()
    cursor.execute('SELECT * FROM maintenance')
    maintenance_records = cursor.fetchall()
    conn.close()
    return render_template('details.html', software_records=software_records, maintenance_records=maintenance_records)

@app.route('/search', methods=['POST'])
def search():
    search_term = request.form['search_term']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT rowid, * FROM workplaces WHERE inventory_number LIKE ? OR ip_address LIKE ? OR mac_address LIKE ? OR person LIKE ?', 
                   ('%' + search_term + '%', '%' + search_term + '%', '%' + search_term + '%', '%' + search_term + '%'))
    workplaces = cursor.fetchall()
    conn.close()
    return render_template('index.html', workplaces=workplaces)

if __name__ == '__main__':
    app.run(debug=True)