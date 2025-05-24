PRAGMA foreign_keys = ON;

-- Departments table (створюємо першою для foreign keys)
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
    department_id INTEGER REFERENCES departments(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workstations table (розширена схема відповідно до дизайну)
CREATE TABLE IF NOT EXISTS workstations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_number TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    mac_address TEXT,
    grif TEXT NOT NULL CHECK(grif IN ('Особливої важливості', 'Цілком таємно', 'Таємно', 'ДСК', 'Відкрито')) DEFAULT 'ДСК',
    os_name TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    responsible_id INTEGER REFERENCES users(id),
    contacts TEXT,
    notes TEXT,
    status TEXT NOT NULL CHECK(status IN ('operational', 'maintenance', 'repair', 'decommissioned')) DEFAULT 'operational',
    registration_date DATE DEFAULT (date('now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table (виправлено відповідно до коду сервера)
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    workstation_id INTEGER REFERENCES workstations(id),
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    assigned_to INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Repairs table (виправлено відповідно до коду сервера)
CREATE TABLE IF NOT EXISTS repairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workstation_id INTEGER REFERENCES workstations(id),
    technician_id INTEGER REFERENCES users(id),
    description TEXT NOT NULL,
    repair_date DATE,
    cost DECIMAL(10,2),
    status TEXT NOT NULL CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Software table (опціональна)
CREATE TABLE IF NOT EXISTS software (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    version TEXT,
    license_key TEXT,
    workstation_id INTEGER REFERENCES workstations(id),
    installed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- ДАНІ-ПРИКЛАДИ ДЛЯ ВСІХ ТАБЛИЦЬ
-- ===============================

-- Додаємо відділи
INSERT OR IGNORE INTO departments (name, description) VALUES
('IT', 'Information Technology Department'),
('Безпека', 'Служба безпеки'),
('Адміністрація', 'Адміністративний відділ'),
('Бухгалтерія', 'Бухгалтерський відділ'),
('ДСК', 'Відділ документообігу'),
('Кадри', 'Відділ кадрів');

-- Додаємо користувачів (пароль буде замінений в init-db.js)
INSERT OR IGNORE INTO users (username, password, full_name, email, role, department_id) VALUES
('admin', 'temp_password', 'Admin User', 'admin@company.com', 'admin', 1),
('petrov.petro', 'temp_password', 'Петров Петро Петрович', 'petrov@company.com', 'user', 2),
('sidorova.maria', 'temp_password', 'Сидорова Марія Іванівна', 'sidorova@company.com', 'user', 3),
('kovalenko.olena', 'temp_password', 'Коваленко Олена Василівна', 'kovalenko@company.com', 'user', 4),
('melnik.oleg', 'temp_password', 'Мельник Олег Андрійович', 'melnik@company.com', 'user', 5),
('ivanov.ivan', 'temp_password', 'Іванов Іван Іванович', 'ivanov@company.com', 'user', 6);

-- Додаємо робочі станції з розширеними даними
INSERT OR IGNORE INTO workstations (inventory_number, ip_address, mac_address, grif, os_name, department_id, responsible_id, contacts, notes, status, registration_date) VALUES
('АРМ-001', '192.168.1.101', '00:1A:2B:3C:4D:01', 'Особливої важливості', 'Windows 11 Pro', 2, 2, '+380503456790', '', 'operational', '2024-01-01'),
('АРМ-002', '192.168.1.102', '00:1A:2B:3C:4D:02', 'Цілком таємно', 'Windows 10 Pro', 3, 3, '+380503456791', '', 'operational', '2024-01-02'),
('АРМ-003', '192.168.1.103', '00:1A:2B:3C:4D:03', 'Таємно', 'Windows 11 Pro', 4, 4, '+380503456792', 'Примітка для АРМ-003', 'maintenance', '2024-01-03'),
('АРМ-004', '192.168.1.104', '00:1A:2B:3C:4D:04', 'ДСК', 'Windows 10 Pro', 5, 5, '+380503456793', '', 'operational', '2024-01-04'),
('АРМ-005', '192.168.1.105', '00:1A:2B:3C:4D:05', 'Особливої важливості', 'Ubuntu 22.04', 1, 6, '+380503456794', '', 'operational', '2024-01-05');

-- Додаємо заявки
INSERT OR IGNORE INTO tickets (user_id, workstation_id, description, status, priority, assigned_to) VALUES
(2, 1, 'Monitor flickering issue', 'open', 'medium', 1),
(3, 3, 'Software installation request', 'in_progress', 'low', 1),
(2, 1, 'Keyboard not working', 'resolved', 'high', 1),
(3, 4, 'Network connectivity issues', 'open', 'critical', 1);

-- Додаємо ремонти
INSERT OR IGNORE INTO repairs (workstation_id, technician_id, description, repair_date, cost, status) VALUES
(3, 1, 'RAM upgrade from 8GB to 16GB', '2024-01-15', 150.00, 'completed'),
(1, 1, 'Replace faulty graphics card', '2024-01-20', 350.00, 'in_progress'),
(2, 1, 'SSD replacement', '2024-01-10', 200.00, 'completed'),
(4, 1, 'Screen replacement', '2024-01-25', 450.00, 'pending');

-- Додаємо програмне забезпечення
INSERT OR IGNORE INTO software (name, version, license_key, workstation_id) VALUES
('Microsoft Office', '2021', 'ABC123-DEF456-GHI789', 1),
('Adobe Photoshop', '2024', 'PS2024-LICENSE-KEY', 4),
('Visual Studio Code', '1.85', 'FREE', 1),
('Docker Desktop', '4.16', 'FREE', 2);

-- Створюємо індекси для продуктивності
CREATE INDEX IF NOT EXISTS idx_workstations_department ON workstations(department_id);
CREATE INDEX IF NOT EXISTS idx_workstations_responsible ON workstations(responsible_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_workstation ON tickets(workstation_id);
CREATE INDEX IF NOT EXISTS idx_repairs_workstation ON repairs(workstation_id);
CREATE INDEX IF NOT EXISTS idx_software_workstation ON software(workstation_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id); 