PRAGMA foreign_keys = ON;

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

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workstations table
CREATE TABLE IF NOT EXISTS workstations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_number TEXT UNIQUE NOT NULL,
    os_name TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    responsible_id INTEGER REFERENCES users(id),
    status TEXT NOT NULL CHECK(status IN ('available', 'in_use', 'maintenance')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Software table
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

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('Hardware', 'Software', 'Network')),
    status TEXT NOT NULL CHECK(status IN ('В очікуванні', 'В процесі', 'Завершено')),
    priority TEXT NOT NULL CHECK(priority IN ('Критичний', 'Високий', 'Середній', 'Низький')),
    user_id INTEGER REFERENCES users(id),
    workstation_id INTEGER REFERENCES workstations(id),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Repairs table
CREATE TABLE IF NOT EXISTS repairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workstation_id INTEGER REFERENCES workstations(id),
    status TEXT NOT NULL CHECK(status IN ('В процесі', 'Завершено')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial admin user
INSERT OR IGNORE INTO users (username, password, full_name, role)
VALUES ('admin', '$2a$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX', 'Admin User', 'admin');

-- Insert initial departments
INSERT OR IGNORE INTO departments (name, description) VALUES
('IT', 'Information Technology Department'),
('HR', 'Human Resources Department'),
('Finance', 'Finance Department');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workstations_department ON workstations(department_id);
CREATE INDEX IF NOT EXISTS idx_workstations_responsible ON workstations(responsible_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_workstation ON tickets(workstation_id);
CREATE INDEX IF NOT EXISTS idx_repairs_workstation ON repairs(workstation_id);
CREATE INDEX IF NOT EXISTS idx_software_workstation ON software(workstation_id); 