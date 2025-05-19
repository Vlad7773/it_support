-- Create departments table
CREATE TABLE departments (
    id bigint generated always as identity primary key,
    name text not null
);

-- Create workstation_statuses table
CREATE TABLE workstation_statuses (
    id bigint generated always as identity primary key,
    name text not null
);

-- Create workstations table
CREATE TABLE workstations (
    id bigint generated always as identity primary key,
    name text not null,
    os text not null,
    status_id bigint references workstation_statuses(id),
    last_update timestamp with time zone default current_timestamp,
    user_id bigint references users(id),
    department_id bigint references departments(id)
);

-- Create users table
CREATE TABLE users (
    id bigint generated always as identity primary key,
    name text not null,
    department_id bigint references departments(id)
);

-- Create tickets table
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    created_by INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    workstation_id INTEGER REFERENCES workstations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create repairs table
CREATE TABLE repairs (
    id SERIAL PRIMARY KEY,
    workstation_id INTEGER REFERENCES workstations(id),
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    assigned_to INTEGER REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data
INSERT INTO departments (name) VALUES 
    ('IT'),
    ('Бухгалтерія'),
    ('HR');

INSERT INTO workstation_statuses (name) VALUES 
    ('active'),
    ('repair'),
    ('inactive');

INSERT INTO users (name, department_id) VALUES 
    ('Іван Петров', 1),
    ('Марія Сидорова', 2),
    ('Олександр Коваленко', 3);

INSERT INTO workstations (name, os, status_id, user_id, department_id) VALUES 
    ('WS001', 'Windows 10', 1, 1, 1),
    ('WS002', 'Windows 11', 1, 2, 2),
    ('WS003', 'Ubuntu 22.04', 2, 3, 3);

-- Insert sample tickets
INSERT INTO tickets (title, description, status, priority, created_by, assigned_to, workstation_id) VALUES
('Не працює мережа', 'Втрачено підключення до мережі в кабінеті 201', 'open', 'high', 6, 2, 4),
('Потрібна заміна клавіатури', 'Клавіатура не реагує на натискання', 'in_progress', 'medium', 8, 2, 7),
('Проблеми з принтером', 'Принтер не друкує, показує помилку застряглого паперу', 'open', 'low', 10, 3, 13),
('Оновлення програмного забезпечення', 'Потрібно оновити антивірус на всіх комп\'ютерах відділу', 'in_progress', 'high', 12, 2, 16),
('Не працює сканер', 'Сканер не відповідає на команди', 'open', 'medium', 14, 3, 19),
('Потрібна установка спеціалізованого ПЗ', 'Потрібно встановити нове програмне забезпечення для аналізу даних', 'in_progress', 'high', 16, 2, 22),
('Проблеми з аудіо', 'Не працює звук на спільному комп\'ютері', 'open', 'low', 18, 3, 25),
('Запит на доступ до бази даних', 'Потрібно налаштувати доступ до нової бази даних', 'in_progress', 'high', 20, 2, 28);

-- Insert sample repairs
INSERT INTO repairs (workstation_id, description, status, assigned_to, start_date, end_date) VALUES
(3, 'Заміна блоку живлення', 'completed', 2, '2024-03-01', '2024-03-02'),
(6, 'Чистка від пилу та заміна термопасти', 'in_progress', 3, '2024-03-10', NULL),
(9, 'Ремонт материнської плати', 'scheduled', 2, '2024-03-15', NULL),
(12, 'Заміна жорсткого диска', 'completed', 3, '2024-03-05', '2024-03-06'),
(15, 'Оновлення BIOS', 'in_progress', 2, '2024-03-12', NULL),
(18, 'Заміна оперативної пам\'яті', 'scheduled', 3, '2024-03-16', NULL),
(21, 'Ремонт USB портів', 'completed', 2, '2024-03-08', '2024-03-09'),
(24, 'Заміна відеокарти', 'in_progress', 3, '2024-03-11', NULL);