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
    role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'user')) DEFAULT 'user',
    department_id INTEGER REFERENCES departments(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Функція для валідації IP-адреси
CREATE TABLE IF NOT EXISTS temp_functions (
    func TEXT
);
INSERT INTO temp_functions (func) VALUES ('
    CREATE FUNCTION validate_ip(ip TEXT) 
    RETURNS BOOLEAN 
    BEGIN
        RETURN ip REGEXP ''^([0-9]{1,3}\.){3}[0-9]{1,3}$'' 
            AND NOT EXISTS (
                SELECT value 
                FROM (
                    SELECT CAST(value AS INTEGER) AS value 
                    FROM json_each(''['' || REPLACE(ip, ''.'', '','') || '']'')
                ) 
                WHERE value > 255
            );
    END
');

-- Workstations table (розширена схема відповідно до дизайну)
CREATE TABLE IF NOT EXISTS workstations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_number TEXT UNIQUE NOT NULL,
    ip_address TEXT CHECK(
        (ip_address IS NULL) OR 
        (ip_address REGEXP '^([0-9]{1,3}\.){3}[0-9]{1,3}$' AND 
         NOT EXISTS (
            SELECT value 
            FROM (
                SELECT CAST(value AS INTEGER) AS value 
                FROM json_each('[' || REPLACE(ip_address, '.', ',') || ']')
            ) 
            WHERE value > 255
        ))
    ),
    mac_address TEXT CHECK(
        mac_address IS NULL OR 
        mac_address REGEXP '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'
    ),
    grif TEXT NOT NULL CHECK(grif IN ('Особливої важливості', 'Цілком таємно', 'Таємно', 'ДСК', 'Відкрито')) DEFAULT 'ДСК',
    os_name TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id),
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_ip_grif CHECK(
        (grif IN ('ДСК', 'Відкрито')) OR 
        (ip_address IS NULL)
    ),
    CONSTRAINT check_responsible_department FOREIGN KEY (responsible_id, department_id) 
        REFERENCES users (id, department_id)
);

-- Тригер для перевірки відповідності відділу відповідальної особи
CREATE TRIGGER IF NOT EXISTS check_responsible_department_trigger
BEFORE INSERT ON workstations
FOR EACH ROW
BEGIN
    SELECT CASE
        WHEN NEW.responsible_id IS NOT NULL AND NEW.department_id IS NOT NULL AND
             NOT EXISTS (
                 SELECT 1 FROM users 
                 WHERE id = NEW.responsible_id 
                 AND department_id = NEW.department_id
             )
        THEN RAISE(ABORT, 'Відповідальна особа повинна належати до того ж відділу, що і робоча станція')
    END;
END;

-- Тригер для оновлення часу змін
CREATE TRIGGER IF NOT EXISTS update_workstation_timestamp
AFTER UPDATE ON workstations
BEGIN
    UPDATE workstations 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = OLD.id;
END;

-- Tickets table (виправлено відповідно до коду сервера)
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

-- Repairs table (виправлено відповідно до коду сервера)
CREATE TABLE IF NOT EXISTS repairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER REFERENCES tickets(id), -- Зв'язок з заявкою
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

-- Тригер для оновлення статусу заявки при створенні ремонту
CREATE TRIGGER IF NOT EXISTS update_ticket_status_on_repair
AFTER INSERT ON repairs
BEGIN
    UPDATE tickets 
    SET status = 'repair_in_progress',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.ticket_id;
END;

-- Тригер для оновлення статусу заявки при завершенні ремонту
CREATE TRIGGER IF NOT EXISTS update_ticket_status_on_repair_complete
AFTER UPDATE ON repairs
WHEN NEW.status = 'completed' AND OLD.status != 'completed'
BEGIN
    UPDATE tickets 
    SET status = 'resolved',
        resolution_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.ticket_id;
END;

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
INSERT OR IGNORE INTO users (username, password, full_name, role, department_id) VALUES
('admin', 'temp_password', 'Головний Адміністратор', 'admin', 1),
('editor.it', 'temp_password', 'Петров Петро Петрович', 'editor', 2),
('user.security', 'temp_password', 'Сидорова Марія Іванівна', 'user', 3),
('user.admin', 'temp_password', 'Коваленко Олена Василівна', 'user', 4),
('user.dsk', 'temp_password', 'Мельник Олег Андрійович', 'user', 5),
('user.hr', 'temp_password', 'Іванов Іван Іванович', 'user', 6);

-- Додаємо робочі станції з розширеними даними
INSERT OR IGNORE INTO workstations (inventory_number, ip_address, mac_address, grif, os_name, department_id, responsible_id, contacts, notes, processor, ram, storage, monitor, network, type, status, registration_date) VALUES
('АРМ-001', NULL, '00:1A:2B:3C:4D:01', 'Особливої важливості', 'Windows 11 Pro', 2, 2, '+380503456790', '', 'Intel Core i7-12700', '16 ГБ DDR4', 'SSD 512 ГБ', 'Dell 24" 1920x1080', 'Gigabit Ethernet', 'Десктоп', 'operational', '2024-01-01'),
('АРМ-002', NULL, '00:1A:2B:3C:4D:02', 'Цілком таємно', 'Windows 10 Pro', 3, 3, '+380503456791', '', 'AMD Ryzen 5 5600X', '32 ГБ DDR4', 'SSD 1 ТБ', 'Samsung 27" 2560x1440', 'Wi-Fi + Ethernet', 'Десктоп', 'operational', '2024-01-02'),
('АРМ-003', NULL, '00:1A:2B:3C:4D:03', 'Таємно', 'Windows 11 Pro', 4, 4, '+380503456792', 'Примітка для АРМ-003', 'Intel Core i5-11400', '8 ГБ DDR4', 'HDD 1 ТБ + SSD 256 ГБ', 'LG 22" 1920x1080', 'Ethernet', 'Десктоп', 'maintenance', '2024-01-03'),
('АРМ-004', '192.168.1.104', '00:1A:2B:3C:4D:04', 'ДСК', 'Windows 10 Pro', 5, 5, '+380503456793', '', 'Intel Core i3-10100', '8 ГБ DDR4', 'SSD 256 ГБ', 'HP 21.5" 1920x1080', 'Ethernet', 'Десктоп', 'operational', '2024-01-04'),
('АРМ-005', NULL, '00:1A:2B:3C:4D:05', 'Особливої важливості', 'Ubuntu 22.04', 1, 1, '+380503456794', '', 'Intel Xeon E-2224', '64 ГБ DDR4 ECC', 'SSD 2 ТБ NVMe', 'Dual Dell 24"', '10 Gigabit Ethernet', 'Сервер', 'operational', '2024-01-05');

-- Додаємо заявки
INSERT OR IGNORE INTO tickets (user_id, workstation_id, title, type, description, status, priority, assigned_to) VALUES
(2, 1, 'Блимає монітор', 'monitor_issue', 'Монітор періодично блимає, особливо при запуску програм', 'open', 'medium', 1),
(3, 3, 'Потрібно встановити ПЗ', 'software_issue', 'Необхідно встановити Microsoft Office та антивірус', 'in_progress', 'low', 1),
(2, 1, 'Не працює клавіатура', 'keyboard_issue', 'Клавіатура повністю не реагує на натискання клавіш', 'resolved', 'high', 1),
(3, 4, 'Проблеми з мережею', 'network_issue', 'Немає доступу до Інтернету та локальної мережі', 'open', 'critical', 1);

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