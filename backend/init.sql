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
    name TEXT NOT NULL,
    processor TEXT NOT NULL,
    ram TEXT NOT NULL,
    storage TEXT NOT NULL,
    os TEXT NOT NULL,
    acquisition_date DATE NOT NULL,
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

-- Insert initial data
INSERT INTO departments (name) VALUES 
('IT department'),
('HR department'),
('Finance department'),
('Marketing department'),
('Sales department');

INSERT INTO workstation_statuses (name) VALUES 
('Active'),
('In Repair'),
('Decommissioned'),
('Reserved');

INSERT INTO it_users (name, position, login, password_hash, department_id) VALUES 
('John Doe', 'System Administrator', 'john.doe', 'password123', 1),
('Jane Smith', 'IT Support', 'jane.smith', 'password123', 1),
('Bob Johnson', 'HR Manager', 'bob.johnson', 'password123', 2),
('Alice Brown', 'Finance Director', 'alice.brown', 'password123', 3),
('Charlie Wilson', 'Marketing Manager', 'charlie.wilson', 'password123', 4),
('Diana Miller', 'Sales Representative', 'diana.miller', 'password123', 5),
('Eve Davis', 'IT Support', 'eve.davis', 'password123', 1);

INSERT INTO software (name, version) VALUES 
('Windows 10', '21H2'),
('Windows 11', '22H2'),
('Microsoft Office', '2021'),
('Adobe Photoshop', '2023'),
('Visual Studio Code', '1.80'),
('Chrome', '116'),
('Firefox', '117');

-- Insert workstations
INSERT INTO workstations (name, processor, ram, storage, os, acquisition_date, status_id, current_user_id, department_id) VALUES 
('WS-001', 'Intel i7-11700', '16GB', '512GB SSD', 'Windows 10', '2023-01-15', 1, 1, 1),
('WS-002', 'Intel i5-11600', '8GB', '256GB SSD', 'Windows 10', '2023-01-15', 1, 2, 1),
('WS-003', 'AMD Ryzen 7 5800X', '32GB', '1TB SSD', 'Windows 11', '2023-02-01', 1, 3, 2),
('WS-004', 'Intel i9-11900K', '64GB', '2TB SSD', 'Windows 11', '2023-02-01', 1, 4, 3),
('WS-005', 'AMD Ryzen 9 5950X', '32GB', '1TB SSD', 'Windows 10', '2023-02-15', 1, 5, 4),
('WS-006', 'Intel i7-11700K', '16GB', '512GB SSD', 'Windows 10', '2023-02-15', 1, 6, 5),
('WS-007', 'AMD Ryzen 5 5600X', '16GB', '256GB SSD', 'Windows 11', '2023-03-01', 1, 7, 1),
('WS-008', 'Intel i5-11600K', '8GB', '256GB SSD', 'Windows 10', '2023-03-01', 1, 1, 1),
('WS-009', 'AMD Ryzen 7 5800X', '32GB', '1TB SSD', 'Windows 11', '2023-03-15', 1, 2, 1),
('WS-010', 'Intel i9-11900K', '64GB', '2TB SSD', 'Windows 10', '2023-03-15', 1, 3, 2),
('WS-011', 'AMD Ryzen 9 5950X', '32GB', '1TB SSD', 'Windows 11', '2023-04-01', 1, 4, 3),
('WS-012', 'Intel i7-11700K', '16GB', '512GB SSD', 'Windows 10', '2023-04-01', 1, 5, 4),
('WS-013', 'AMD Ryzen 5 5600X', '16GB', '256GB SSD', 'Windows 10', '2023-04-15', 1, 6, 5),
('WS-014', 'Intel i5-11600K', '8GB', '256GB SSD', 'Windows 11', '2023-04-15', 1, 7, 1),
('WS-015', 'AMD Ryzen 7 5800X', '32GB', '1TB SSD', 'Windows 10', '2023-05-01', 1, 1, 1),
('WS-016', 'Intel i9-11900K', '64GB', '2TB SSD', 'Windows 11', '2023-05-01', 1, 2, 1),
('WS-017', 'AMD Ryzen 9 5950X', '32GB', '1TB SSD', 'Windows 10', '2023-05-15', 1, 3, 2),
('WS-018', 'Intel i7-11700K', '16GB', '512GB SSD', 'Windows 11', '2023-05-15', 1, 4, 3),
('WS-019', 'AMD Ryzen 5 5600X', '16GB', '256GB SSD', 'Windows 10', '2023-06-01', 1, 5, 4),
('WS-020', 'Intel i5-11600K', '8GB', '256GB SSD', 'Windows 11', '2023-06-01', 1, 6, 5);

-- Insert workstation software
INSERT INTO workstation_software (workstation_id, software_id, installed_date) VALUES 
(1, 1, '2023-01-15'),
(1, 3, '2023-01-15'),
(1, 5, '2023-01-15'),
(1, 6, '2023-01-15'),
(2, 1, '2023-01-15'),
(2, 3, '2023-01-15'),
(2, 5, '2023-01-15'),
(2, 6, '2023-01-15'),
(3, 2, '2023-02-01'),
(3, 3, '2023-02-01'),
(3, 4, '2023-02-01'),
(3, 5, '2023-02-01'),
(3, 6, '2023-02-01'),
(4, 2, '2023-02-01'),
(4, 3, '2023-02-01'),
(4, 5, '2023-02-01'),
(4, 6, '2023-02-01'),
(5, 1, '2023-02-15'),
(5, 3, '2023-02-15'),
(5, 4, '2023-02-15'),
(5, 5, '2023-02-15'),
(5, 6, '2023-02-15');

-- Insert requests
INSERT INTO requests (type, description, status, priority, created_by_user_id, assigned_performer_id, workstation_id) VALUES 
('Hardware', 'Monitor not working', 'Pending', 'High', 1, 2, 1),
('Software', 'Office installation needed', 'In Progress', 'Medium', 3, 1, 3),
('Network', 'Internet connection issues', 'Completed', 'High', 4, 2, 4),
('Hardware', 'Keyboard replacement', 'Pending', 'Low', 5, 1, 5),
('Software', 'Windows update required', 'In Progress', 'Medium', 6, 2, 6);

-- Insert repairs
INSERT INTO repairs (workstation_id, description, status, assigned_performer_id, start_date, end_date) VALUES 
(1, 'Replaced monitor', 'Completed', 1, '2023-01-20', '2023-01-21'),
(3, 'Installed Office 2021', 'Completed', 2, '2023-02-05', '2023-02-05'),
(4, 'Fixed network card', 'Completed', 1, '2023-02-10', '2023-02-11'),
(5, 'Replaced keyboard', 'In Progress', 2, '2023-02-20', NULL),
(6, 'Updated Windows', 'In Progress', 1, '2023-02-25', NULL);

-- Create triggers for updated_at
CREATE TRIGGER update_departments_timestamp
AFTER UPDATE ON departments
BEGIN
    UPDATE departments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_workstation_statuses_timestamp
AFTER UPDATE ON workstation_statuses
BEGIN
    UPDATE workstation_statuses SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_it_users_timestamp
AFTER UPDATE ON it_users
BEGIN
    UPDATE it_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_workstations_timestamp
AFTER UPDATE ON workstations
BEGIN
    UPDATE workstations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_software_timestamp
AFTER UPDATE ON software
BEGIN
    UPDATE software SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_workstation_software_timestamp
AFTER UPDATE ON workstation_software
BEGIN
    UPDATE workstation_software SET updated_at = CURRENT_TIMESTAMP WHERE workstation_id = NEW.workstation_id AND software_id = NEW.software_id;
END;

CREATE TRIGGER update_requests_timestamp
AFTER UPDATE ON requests
BEGIN
    UPDATE requests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_repairs_timestamp
AFTER UPDATE ON repairs
BEGIN
    UPDATE repairs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;