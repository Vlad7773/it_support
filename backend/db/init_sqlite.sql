-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create departments table
CREATE TABLE departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create workstation statuses table
CREATE TABLE workstation_statuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE it_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    department_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Create workstations table
CREATE TABLE workstations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_number TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    mac_address TEXT NOT NULL,
    processor TEXT NOT NULL,
    ram TEXT NOT NULL,
    storage TEXT NOT NULL,
    os TEXT NOT NULL,
    monitor TEXT,
    network TEXT,
    contacts TEXT,
    notes TEXT,
    registration_date DATE NOT NULL,
    status_id INTEGER,
    current_user_id INTEGER,
    department_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES workstation_statuses(id),
    FOREIGN KEY (current_user_id) REFERENCES it_users(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Create software table
CREATE TABLE software (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create workstation software table
CREATE TABLE workstation_software (
    workstation_id INTEGER,
    software_id INTEGER,
    installed_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workstation_id, software_id),
    FOREIGN KEY (workstation_id) REFERENCES workstations(id),
    FOREIGN KEY (software_id) REFERENCES software(id)
);

-- Create requests table
CREATE TABLE requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    created_by_user_id INTEGER,
    assigned_performer_id INTEGER,
    workstation_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES it_users(id),
    FOREIGN KEY (assigned_performer_id) REFERENCES it_users(id),
    FOREIGN KEY (workstation_id) REFERENCES workstations(id)
);

-- Create repairs table
CREATE TABLE repairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workstation_id INTEGER,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    assigned_performer_id INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workstation_id) REFERENCES workstations(id),
    FOREIGN KEY (assigned_performer_id) REFERENCES it_users(id)
);

-- Insert sample data into departments
INSERT INTO departments (name) VALUES 
('Відділ продажу'),
    ('Бухгалтерія'),
('IT-відділ'),
('Відділ кадрів'),
('Склад');

-- Insert sample data into workstation_statuses
INSERT INTO workstation_statuses (name) VALUES 
('Працює'),
('В ремонті'),
('Списано');

-- Insert sample data into it_users (~7 users)
INSERT INTO it_users (name, position, login, password_hash, department_id) VALUES
('Іван Петренко', 'Системний адміністратор', 'petrenko_i', 'hashed_password_1', 3),
('Олена Коваленко', 'Менеджер з продажу', 'kovalenko_o', 'hashed_password_2', 1),
('Сергій Бондаренко', 'Головний бухгалтер', 'bondarenko_s', 'hashed_password_3', 2),
('Наталія Мельник', 'Інженер техпідтримки', 'melnyk_n', 'hashed_password_4', 3),
('Віктор Ткаченко', 'Спеціаліст з кадрів', 'tkachenko_v', 'hashed_password_5', 4),
('Марина Сидоренко', 'Комірник', 'sydorenko_m', 'hashed_password_6', 5),
('Андрій Іванов', 'Менеджер з продажу', 'ivanov_a', 'hashed_password_7', 1);

-- Insert sample data into workstations (20 workstations)
INSERT INTO workstations (inventory_number, ip_address, mac_address, processor, ram, storage, os, monitor, network, contacts, notes, registration_date, status_id, current_user_id, department_id) VALUES
('АРМ-001', '192.168.1.1', '00:1A:2B:3C:4D:5E', 'Intel Core i5', '8GB', '256GB SSD', 'Windows 10 Pro', '21.5"', 'Ethernet', 'Іван Петренко', 'Комірник', '2022-01-15', 1, 2, 1),
('АРМ-002', '192.168.1.2', '00:2A:3B:4C:5D:6E', 'Intel Core i7', '16GB', '512GB SSD', 'Windows 10 Pro', '24"', 'Wi-Fi', 'Олена Коваленко', 'Головний бухгалтер', '2021-05-20', 1, 3, 2),
('АРМ-003', '192.168.1.3', '00:3A:4B:5C:6D:7E', 'AMD Ryzen 5', '8GB', '500GB HDD', 'Windows 10 Pro', 'AMD Radeon RX 570', '24GB RAM', 'Сергій Бондаренко', 'Менеджер з продажу', '2023-03-10', 1, 5, 4),
('АРМ-004', '192.168.1.4', '00:4A:5B:6C:7D:8E', 'Intel Core i5', '8GB', '256GB SSD', 'Windows 10 Pro', '27"', 'Ethernet', 'Наталія Мельник', 'Інженер техпідтримки', '2022-08-01', 1, 6, 5),
('АРМ-005', '192.168.1.5', '00:5A:6B:7C:8D:9E', 'Intel Core i3', '4GB', '128GB SSD', 'Windows 10 Pro', '19.5"', 'Wi-Fi', 'Віктор Ткаченко', 'Спеціаліст з кадрів', '2020-11-11', 1, 7, 1),
('АРМ-006', '192.168.1.6', '00:6A:7B:8C:9D:AE', 'Intel Core i5', '8GB', '256GB SSD', 'Windows 10 Pro', '21"', 'Ethernet', 'Марина Сидоренко', 'Комірник', '2022-02-20', 1, 2, 1),
('АРМ-007', '192.168.1.7', '00:7A:8B:9C:AD:BE', 'Intel Core i7', '16GB', '512GB SSD', 'Windows 10 Pro', '23"', 'Wi-Fi', 'Андрій Іванов', 'Менеджер з продажу', '2021-06-25', 1, 3, 2),
('АРМ-008', '192.168.1.8', '00:8A:9B:AC:BD:CE', 'AMD Ryzen 5', '8GB', '500GB HDD', 'Windows 10 Pro', 'AMD Radeon RX 580', '16GB RAM', 'Іван Петренко', 'Головний бухгалтер', '2023-04-15', 1, 5, 4),
('АРМ-009', '192.168.1.9', '00:9A:AB:BC:CD:DE', 'Intel Core i5', '8GB', '256GB SSD', 'Windows 10 Pro', '25"', 'Ethernet', 'Олена Коваленко', 'Інженер техпідтримки', '2022-09-05', 1, 6, 5),
('АРМ-010', '192.168.1.10', '00:0B:1C:2D:3E:4F', 'Intel Core i3', '4GB', '128GB SSD', 'Windows 10 Pro', '18"', 'Wi-Fi', 'Віктор Ткаченко', 'Спеціаліст з кадрів', '2020-12-16', 1, 7, 1),
('АРМ-011', '192.168.1.11', '00:1B:2C:3D:4E:5F', 'Intel Core i5', '8GB', '256GB SSD', 'Windows 10 Pro', '22"', 'Ethernet', 'Марина Сидоренко', 'Комірник', '2022-03-01', 1, 2, 1),
('АРМ-012', '192.168.1.12', '00:2B:3C:4D:5E:6F', 'Intel Core i7', '16GB', '512GB SSD', 'Windows 10 Pro', '24"', 'Wi-Fi', 'Андрій Іванов', 'Головний бухгалтер', '2021-07-30', 1, 3, 2),
('АРМ-013', '192.168.1.13', '00:3B:4C:5D:6E:7F', 'AMD Ryzen 5', '8GB', '500GB HDD', 'Windows 10 Pro', 'AMD Radeon RX 590', '8GB RAM', 'Іван Петренко', 'Менеджер з продажу', '2023-05-20', 1, 5, 4),
('АРМ-014', '192.168.1.14', '00:4B:5C:6D:7E:8F', 'Intel Core i5', '8GB', '256GB SSD', 'Windows 10 Pro', '26"', 'Ethernet', 'Олена Коваленко', 'Інженер техпідтримки', '2022-10-10', 1, 6, 5),
('АРМ-015', '192.168.1.15', '00:5B:6C:7D:8E:9F', 'Intel Core i3', '4GB', '128GB SSD', 'Windows 10 Pro', '17"', 'Wi-Fi', 'Віктор Ткаченко', 'Спеціаліст з кадрів', '2021-01-21', 1, 7, 1),
('АРМ-016', '192.168.1.16', '00:6B:7C:8D:9E:AF', 'Intel Core i5', '8GB', '256GB SSD', 'Windows 10 Pro', '20"', 'Ethernet', 'Марина Сидоренко', 'Комірник', '2022-04-05', 1, 2, 1),
('АРМ-017', '192.168.1.17', '00:7B:8C:9D:AE:BF', 'Intel Core i7', '16GB', '512GB SSD', 'Windows 10 Pro', '22"', 'Wi-Fi', 'Андрій Іванов', 'Головний бухгалтер', '2021-08-14', 1, 3, 2),
('АРМ-018', '192.168.1.18', '00:8B:9C:AD:BE:CF', 'AMD Ryzen 5', '8GB', '500GB HDD', 'Windows 10 Pro', 'AMD Radeon RX 6700 XT', '12GB RAM', 'Іван Петренко', 'Інженер техпідтримки', '2023-06-01', 1, 5, 4),
('АРМ-019', '192.168.1.19', '00:9B:AC:BD:CE:DF', 'Intel Core i5', '8GB', '256GB SSD', 'Windows 10 Pro', '24"', 'Ethernet', 'Олена Коваленко', 'Спеціаліст з кадрів', '2022-11-15', 1, 6, 5),
('АРМ-020', '192.168.1.20', '00:0C:1D:2E:3F:40', 'Intel Core i3', '4GB', '128GB SSD', 'Windows 10 Pro', '15"', 'Wi-Fi', 'Віктор Ткаченко', 'Комірник', '2021-02-02', 1, 7, 1);

-- Insert sample data into software (example, ~2-3 per workstation)
INSERT INTO software (name, version) VALUES
('Microsoft Office', '2019'),
('Adobe Acrobat Reader', 'DC'),
('Google Chrome', 'latest'),
('Mozilla Firefox', 'latest'),
('WinRAR', '6.0'),
('7-Zip', '21.07'),
('VLC Media Player', '3.0.18'),
('Notepad++', '8.4.8');

-- Insert sample data into workstation_software (linking software to workstations)
INSERT INTO workstation_software (workstation_id, software_id, installed_date) VALUES
(1, 1, '2022-01-15'), (1, 3, '2022-01-15'),
(2, 1, '2021-05-20'), (2, 4, '2021-05-20'), (2, 5, '2021-05-20'),
(3, 1, '2023-03-10'), (3, 3, '2023-03-10'), (3, 6, '2023-03-10'),
(4, 1, '2022-08-01'), (4, 4, '2022-08-01'),
(5, 1, '2020-11-11'), (5, 3, '2020-11-11'), (5, 7, '2020-11-11'),
(6, 1, '2022-02-20'), (6, 4, '2022-02-20'),
(7, 1, '2021-06-25'), (7, 3, '2021-06-25'), (7, 8, '2021-06-25'),
(8, 1, '2023-04-15'), (8, 4, '2023-04-15'), (8, 5, '2023-04-15'),
(9, 1, '2022-09-05'), (9, 3, '2022-09-05'),
(10, 1, '2020-12-16'), (10, 4, '2020-12-16'), (10, 6, '2020-12-16'),
(11, 1, '2022-03-01'), (11, 3, '2022-03-01'),
(12, 1, '2021-07-30'), (12, 4, '2021-07-30'), (12, 7, '2021-07-30'),
(13, 1, '2023-05-20'), (13, 3, '2023-05-20'), (13, 8, '2023-05-20'),
(14, 1, '2022-10-10'), (14, 4, '2022-10-10'),
(15, 1, '2021-01-21'), (15, 3, '2021-01-21'), (15, 5, '2021-01-21'),
(16, 1, '2022-04-05'), (16, 4, '2022-04-05'),
(17, 1, '2021-08-14'), (17, 3, '2021-08-14'), (17, 6, '2021-08-14'),
(18, 1, '2023-06-01'), (18, 4, '2023-06-01'), (18, 7, '2023-06-01'),
(19, 1, '2022-11-15'), (19, 3, '2022-11-15'),
(20, 1, '2021-02-02'), (20, 4, '2021-02-02'), (20, 8, '2021-02-02');

-- Insert sample data into requests table
INSERT INTO requests (type, description, status, priority, created_by_user_id, assigned_performer_id, workstation_id, created_at, updated_at) VALUES
('Програмна', 'Потрібно встановити Adobe Acrobat Reader', 'Відкрита', 'Низький', 2, 1, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Обладнання', 'Не вмикається монітор', 'В роботі', 'Високий', 3, 4, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Мережа', 'Немає доступу до мережевого диску', 'Закрита', 'Середній', 5, 1, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Програмна', 'Помилка при збереженні документа в Word', 'Відкрита', 'Низький', 6, 4, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Обладнання', 'Шумить системний блок', 'В роботі', 'Середній', 7, 1, 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Мережа', 'Дуже повільний інтернет', 'Відкрита', 'Високий', 2, 4, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Програмна', 'Проблема з доступом до корпоративної пошти', 'В роботі', 'Високий', 3, 1, 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Обладнання', 'Не працює клавіатура', 'Закрита', 'Низький', 5, 4, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Програмна', 'Потрібно оновити антивірус', 'Відкрита', 'Середній', 6, 1, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Мережа', 'Проблема з VPN підключенням', 'В роботі', 'Високий', 7, 4, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample data into repairs table (example)
INSERT INTO repairs (workstation_id, description, status, assigned_performer_id, start_date, end_date, created_at, updated_at) VALUES
(12, 'Заміна блоку живлення', 'Завершено', 4, DATE('now'), DATE('now'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 'Діагностика рівня шуму', 'В роботі', 1, DATE('now'), NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create triggers for updated_at
CREATE TRIGGER update_departments_timestamp
AFTER UPDATE ON departments
FOR EACH ROW
BEGIN
    UPDATE departments SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_workstation_statuses_timestamp
AFTER UPDATE ON workstation_statuses
FOR EACH ROW
BEGIN
    UPDATE workstation_statuses SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_it_users_timestamp
AFTER UPDATE ON it_users
FOR EACH ROW
BEGIN
    UPDATE it_users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_workstations_timestamp
AFTER UPDATE ON workstations
FOR EACH ROW
BEGIN
    UPDATE workstations SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_software_timestamp
AFTER UPDATE ON software
FOR EACH ROW
BEGIN
    UPDATE software SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_workstation_software_timestamp
AFTER UPDATE ON workstation_software
FOR EACH ROW
BEGIN
    UPDATE workstation_software SET updated_at = CURRENT_TIMESTAMP WHERE workstation_id = OLD.workstation_id AND software_id = OLD.software_id;
END;

CREATE TRIGGER update_requests_timestamp
AFTER UPDATE ON requests
FOR EACH ROW
BEGIN
    UPDATE requests SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER update_repairs_timestamp
AFTER UPDATE ON repairs
FOR EACH ROW
BEGIN
    UPDATE repairs SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END; 