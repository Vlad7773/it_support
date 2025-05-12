from flask import Blueprint, render_template, request, redirect, url_for
import uuid
from db import (get_all_workplaces, get_inventory_numbers, add_workplace, get_workplace_by_id, update_workplace, delete_workplace, 
                search_workplaces, get_all_software, add_software, get_software_by_id, update_software, 
                delete_software, get_all_maintenance, add_maintenance, get_maintenance_by_id, 
                update_maintenance, delete_maintenance, get_stats)

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    try:
        workplaces = get_all_workplaces()
        stats = get_stats()
        stats['unit_data'] = [(unit, count) for unit, count in zip(stats['units'], stats['unit_counts'])]
        stats['software_data'] = [(name, count) for name, count in zip(stats['software_names'], stats['software_counts'])]
        return render_template('index.html', workplaces=workplaces, **stats)
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/add', methods=['GET', 'POST'])
def add_workplace_route():
    if request.method == 'POST':
        try:
            inventory_number = str(uuid.uuid4())
            data = (
                inventory_number,
                request.form['ip_address'],
                request.form['mac_address'],
                request.form['access_level'],
                request.form['unit'],
                request.form['person'],
                request.form['contacts'],
                request.form['notes']
            )
            add_workplace(data)
            return redirect(url_for('main.index'))
        except Exception as e:
            return f"Помилка: {e}", 500
    return render_template('add.html', inventory_number=str(uuid.uuid4()))

@main_bp.route('/edit/<int:rowid>', methods=['GET', 'POST'])
def edit_workplace(rowid):
    if request.method == 'POST':
        try:
            data = (
                request.form['ip_address'],
                request.form['mac_address'],
                request.form['access_level'],
                request.form['unit'],
                request.form['person'],
                request.form['contacts'],
                request.form['notes']
            )
            update_workplace(rowid, data)
            return redirect(url_for('main.index'))
        except Exception as e:
            return f"Помилка: {e}", 500
    try:
        workplace = get_workplace_by_id(rowid)
        if not workplace:
            return "АРМ не знайдено", 404
        return render_template('edit.html', workplace=workplace, rowid=rowid)
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/delete/<int:rowid>')
def delete_workplace_route(rowid):
    try:
        delete_workplace(rowid)
        return redirect(url_for('main.index'))
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/software', methods=['GET', 'POST'])
def software():
    try:
        sort_by_date = request.args.get('sort_by_date', 'desc')
        search_term_inventory = request.form.get('search_term_inventory', None) if request.method == 'POST' else request.args.get('search_term_inventory', None)
        search_term_name = request.form.get('search_term_name', None) if request.method == 'POST' else request.args.get('search_term_name', None)
        
        software_records = get_all_software(sort_by_date, search_term_inventory, search_term_name)
        return render_template('software.html', software_records=software_records, sort_by_date=sort_by_date, search_term_inventory=search_term_inventory, search_term_name=search_term_name)
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/add_software', methods=['GET', 'POST'])
def add_software():
    if request.method == 'POST':
        try:
            data = (
                request.form['inventory_number'],
                request.form['software_date'],
                request.form['software_name'],
                request.form['version'],
                request.form['license_key'],
                request.form['software_comments']
            )
            add_software(data)
            return redirect(url_for('main.software'))
        except Exception as e:
            return f"Помилка: {e}", 500
    try:
        inventory_numbers = get_inventory_numbers()
        return render_template('add_software.html', inventory_numbers=inventory_numbers)
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/edit_software/<int:software_id>', methods=['GET', 'POST'])
def edit_software(software_id):
    if request.method == 'POST':
        try:
            data = (
                request.form['inventory_number'],
                request.form['software_date'],
                request.form['software_name'],
                request.form['version'],
                request.form['license_key'],
                request.form['software_comments']
            )
            update_software(software_id, data)
            return redirect(url_for('main.software'))
        except Exception as e:
            return f"Помилка: {e}", 500
    try:
        software = get_software_by_id(software_id)
        inventory_numbers = get_inventory_numbers()
        if not software:
            return "ПЗ не знайдено", 404
        return render_template('edit_software.html', software=software, inventory_numbers=inventory_numbers)
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/delete_software/<int:software_id>')
def delete_software(software_id):
    try:
        delete_software(software_id)
        return redirect(url_for('main.software'))
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/maintenance', methods=['GET', 'POST'])
def maintenance():
    try:
        sort_by_date = request.args.get('sort_by_date', 'desc')
        search_term_inventory = request.form.get('search_term_inventory', None) if request.method == 'POST' else request.args.get('search_term_inventory', None)
        
        maintenance_records = get_all_maintenance(sort_by_date, search_term_inventory)
        return render_template('maintenance.html', maintenance_records=maintenance_records, sort_by_date=sort_by_date, search_term_inventory=search_term_inventory)
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/add_maintenance', methods=['GET', 'POST'])
def add_maintenance():
    if request.method == 'POST':
        try:
            data = (
                request.form['inventory_number'],
                request.form['maintenance_date'],
                request.form['type'],
                request.form['performed'],
                request.form['performed_by'],
                request.form['maintenance_comments']
            )
            add_maintenance(data)
            return redirect(url_for('main.maintenance'))
        except Exception as e:
            return f"Помилка: {e}", 500
    try:
        inventory_numbers = get_inventory_numbers()
        return render_template('add_maintenance.html', inventory_numbers=inventory_numbers)
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/edit_maintenance/<int:maintenance_id>', methods=['GET', 'POST'])
def edit_maintenance(maintenance_id):
    if request.method == 'POST':
        try:
            data = (
                request.form['inventory_number'],
                request.form['maintenance_date'],
                request.form['type'],
                request.form['performed'],
                request.form['performed_by'],
                request.form['maintenance_comments']
            )
            update_maintenance(maintenance_id, data)
            return redirect(url_for('main.maintenance'))
        except Exception as e:
            return f"Помилка: {e}", 500
    try:
        maintenance = get_maintenance_by_id(maintenance_id)
        inventory_numbers = get_inventory_numbers()
        if not maintenance:
            return "Обслуговування не знайдено", 404
        return render_template('edit_maintenance.html', maintenance=maintenance, inventory_numbers=inventory_numbers)
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/delete_maintenance/<int:maintenance_id>')
def delete_maintenance(maintenance_id):
    try:
        delete_maintenance(maintenance_id)
        return redirect(url_for('main.maintenance'))
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/users')
def users():
    try:
        return render_template('users.html')
    except Exception as e:
        return f"Помилка: {e}", 500

@main_bp.route('/search', methods=['POST'])
def search():
    try:
        search_term = request.form['search_term']
        workplaces = search_workplaces(search_term)
        stats = get_stats()
        stats['unit_data'] = [(unit, count) for unit, count in zip(stats['units'], stats['unit_counts'])]
        stats['software_data'] = [(name, count) for name, count in zip(stats['software_names'], stats['software_counts'])]
        return render_template('index.html', workplaces=workplaces, **stats)
    except Exception as e:
        return f"Помилка: {e}", 500