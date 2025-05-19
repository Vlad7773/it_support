-- Create database
CREATE DATABASE it_support;

-- Connect to database
\c it_support;

-- Create workstations table
CREATE TABLE workstations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    user VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    last_maintenance DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    department VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Insert initial admin user
INSERT INTO users (username, password, name, role, department, email)
VALUES ('admin', 'admin123', 'Адміністратор', 'admin', 'IT', 'admin@example.com');

-- Insert sample workstations
INSERT INTO workstations (name, model, status, location, user, department, last_maintenance)
VALUES 
    ('PC-001', 'Dell OptiPlex 7090', 'active', 'Кабінет 101', 'Іван Петров', 'Бухгалтерія', '2024-03-15'),
    ('PC-002', 'HP ProDesk 400', 'repair', 'Кабінет 102', 'Марія Сидорова', 'HR', '2024-03-10'),
    ('PC-003', 'Lenovo ThinkCentre', 'inactive', 'Кабінет 103', 'Петро Іваненко', 'IT', '2024-03-01'); 