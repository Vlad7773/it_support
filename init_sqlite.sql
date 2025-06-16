PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('admin', 'technician', 'user')) DEFAULT 'user',
    department_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workstations table
CREATE TABLE IF NOT EXISTS workstations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_number TEXT UNIQUE NOT NULL,
    ip_address TEXT CHECK(
        ip_address IS NULL OR 
        ip_address LIKE '___.___.___.___'
    ),
    mac_address TEXT CHECK(
        mac_address IS NULL OR 
        mac_address LIKE '__:__:__:__:__:__' OR
        mac_address LIKE '__-__-__-__-__-__'
    ),
    grif TEXT NOT NULL CHECK(grif IN ('Особливої важливості', 'Цілком таємно', 'Таємно', 'ДСК', 'Відкрито')) DEFAULT 'ДСК',
    os_name TEXT NOT NULL,
    department_id INTEGER,
    responsible_id INTEGER REFERENCES users(id),
    contacts TEXT,
    notes TEXT,
    -- Технічні характеристики
    processor TEXT,
    ram TEXT,
    storage TEXT,
    monitor TEXT,
    network TEXT,
    type TEXT CHECK(type IN ('Десктоп', 'Ноутбук', 'Моноблок', 'Сервер')) DEFAULT 'Десктоп',
    status TEXT NOT NULL CHECK(status IN ('operational', 'maintenance', 'repair', 'decommissioned')) DEFAULT 'operational',
    registration_date DATE DEFAULT (date('now')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Тригер для оновлення часу змін
CREATE TRIGGER IF NOT EXISTS update_workstation_timestamp
AFTER UPDATE ON workstations
BEGIN
    UPDATE workstations 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = OLD.id;
END;

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    workstation_id INTEGER REFERENCES workstations(id),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN (
        'printer_issue',     -- Проблеми з принтером
        'mouse_issue',       -- Проблеми з мишкою
        'keyboard_issue',    -- Проблеми з клавіатурою
        'monitor_issue',     -- Проблеми з монітором
        'system_startup',    -- Проблеми із запуском системи
        'network_issue',     -- Проблеми з мережею
        'software_issue',    -- Проблеми з ПЗ
        'hardware_issue',    -- Проблеми з апаратним забезпеченням
        'maintenance',       -- Планове обслуговування
        'other'             -- Інше
    )) DEFAULT 'other',
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN (
        'new',              -- Нова заявка
        'assigned',         -- Призначено виконавця
        'in_progress',      -- В роботі
        'need_repair',      -- Потребує ремонту
        'repair_in_progress', -- Ремонтується
        'resolved',         -- Вирішено
        'closed'            -- Закрито
    )) DEFAULT 'new',
    priority TEXT NOT NULL CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    assigned_to INTEGER REFERENCES users(id),
    resolution_notes TEXT,   -- Примітки щодо вирішення
    resolution_date DATETIME,-- Дата вирішення
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Repairs table
CREATE TABLE IF NOT EXISTS repairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workstation_id INTEGER REFERENCES workstations(id),
    technician_id INTEGER REFERENCES users(id),
    repair_type TEXT NOT NULL CHECK(repair_type IN (
        'hardware_replacement', -- Заміна комплектуючих
        'hardware_repair',     -- Ремонт комплектуючих
        'maintenance',         -- Технічне обслуговування
        'upgrade',            -- Оновлення компонентів
        'other'               -- Інше
    )) DEFAULT 'other',
    description TEXT NOT NULL,
    diagnosis TEXT,           -- Діагностика
    parts_used TEXT,         -- Використані запчастини
    repair_date DATE,        -- Планова дата ремонту
    completion_date DATE,    -- Фактична дата завершення
    cost DECIMAL(10,2),      -- Вартість ремонту
    warranty_period TEXT,    -- Гарантійний термін
    status TEXT NOT NULL CHECK(status IN (
        'pending',           -- Очікує ремонту
        'diagnosed',         -- Продіагностовано
        'parts_ordered',     -- Замовлено запчастини
        'in_progress',       -- В процесі ремонту
        'testing',          -- Тестування після ремонту
        'completed',         -- Завершено
        'cancelled'          -- Скасовано
    )) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Software table
CREATE TABLE IF NOT EXISTS software (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    version TEXT,
    license_type TEXT CHECK(license_type IN ('free', 'paid', 'trial')) DEFAULT 'free',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workstation Software table (для зв'язку many-to-many)
CREATE TABLE IF NOT EXISTS workstation_software (
    workstation_id INTEGER REFERENCES workstations(id) ON DELETE CASCADE,
    software_id INTEGER REFERENCES software(id) ON DELETE CASCADE,
    installation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workstation_id, software_id)
);

-- Створюємо індекси для продуктивності
CREATE INDEX IF NOT EXISTS idx_workstations_department ON workstations(department_id);
CREATE INDEX IF NOT EXISTS idx_workstations_responsible ON workstations(responsible_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_workstation ON tickets(workstation_id);
CREATE INDEX IF NOT EXISTS idx_repairs_workstation ON repairs(workstation_id);
CREATE INDEX IF NOT EXISTS idx_software_workstation ON workstation_software(workstation_id);

-- Додаємо тестових користувачів
INSERT OR IGNORE INTO users (username, password, full_name, role) VALUES
('admin', 'temp_password', 'Головний Адміністратор', 'admin'),
('tech1', 'temp_password', 'Петров Петро Петрович', 'technician'),
('tech2', 'temp_password', 'Іванов Іван Іванович', 'technician'),
('user1', 'temp_password', 'Сидорова Марія Василівна', 'user'),
('user2', 'temp_password', 'Коваленко Олена Петрівна', 'user');

-- Додаємо тестове програмне забезпечення
INSERT OR IGNORE INTO software (name, version, license_type) VALUES
('Microsoft Office', '2021', 'paid'),
('Adobe Photoshop', '2024', 'paid'),
('Visual Studio Code', '1.85', 'free'),
('Docker Desktop', '4.16', 'free'),
('Windows 10 Pro', '21H2', 'paid'),
('Ubuntu Server', '22.04 LTS', 'free'),
('Kaspersky Endpoint Security', '11.9', 'paid'),
('Google Chrome', '120.0', 'free'),
('Mozilla Firefox', '121.0', 'free'),
('7-Zip', '23.01', 'free'); 