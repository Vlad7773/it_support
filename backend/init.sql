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