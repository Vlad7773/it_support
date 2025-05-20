import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [workstations, setWorkstations] = useState([
    { inventory_number: 'АРМ-001', department: 'IT відділ', responsible: 'Іванов Іван Іванович', os: 'Windows 10' },
    { inventory_number: 'АРМ-002', department: 'Безпека', responsible: 'Петров Петро Петрович', os: 'Windows 11' },
    { inventory_number: 'АРМ-003', department: 'Адміністрація', responsible: 'Сидорова Марія Іванівна', os: 'Windows 10' },
    { inventory_number: 'АРМ-004', department: 'Бухгалтерія', responsible: 'Коваленко Олена Василівна', os: 'Ubuntu' },
    { inventory_number: 'АРМ-005', department: 'Кадри', responsible: 'Мельник Олег Андрійович', os: 'macOS' },
  ]);

  const [tickets, setTickets] = useState([
    {
      id: 'T-001',
      workstation: 'АРМ-001',
      problem: 'Не працює мишка',
      status: 'В процесі',
      user: 'Іванов Іван Іванович',
      date: '2024-01-01',
    },
    {
      id: 'T-002',
      workstation: 'АРМ-002',
      problem: 'Встановлення ПЗ',
      status: 'Завершено',
      user: 'Петров Петро Петрович',
      date: '2024-01-02',
    },
    {
      id: 'T-003',
      workstation: 'АРМ-003',
      problem: 'Консультація по налаштуванню',
      status: 'В очікуванні',
      user: 'Сидорова Марія Іванівна',
      date: '2024-01-03',
    },
  ]);

  const [repairs, setRepairs] = useState([
    {
      id: 'R-001',
      workstation: 'АРМ-001',
      type: 'Несправність',
      status: 'В процесі',
      user: 'Іванов Іван Іванович',
      date: '2024-01-01',
    },
    {
      id: 'R-002',
      workstation: 'АРМ-002',
      type: 'Встановлення',
      status: 'Завершено',
      user: 'Петров Петро Петрович',
      date: '2024-01-02',
    },
    {
      id: 'R-003',
      workstation: 'АРМ-003',
      type: 'Консультація',
      status: 'В очікуванні',
      user: 'Сидорова Марія Іванівна',
      date: '2024-01-03',
    },
  ]);

  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      name: 'Адміністратор',
      role: 'admin',
      department: 'IT відділ',
      email: 'admin@example.com',
    },
    {
      id: 2,
      username: 'user1',
      password: 'user123',
      name: 'Іванов Іван Іванович',
      role: 'user',
      department: 'IT відділ',
      email: 'user1@example.com',
    },
    {
      id: 3,
      username: 'user2',
      password: 'user123',
      name: 'Петров Петро Петрович',
      role: 'user',
      department: 'Безпека',
      email: 'user2@example.com',
    },
  ]);

  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'uk',
    notifications: {
      email: true,
      browser: true,
      sound: false
    },
    display: {
      fontSize: 'medium',
      density: 'comfortable',
      showAvatars: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiry: 90
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionPeriod: 30
    }
  });

  const addWorkstation = (workstation) => {
    setWorkstations([...workstations, workstation]);
  };

  const removeWorkstation = (inventoryNumber) => {
    setWorkstations(workstations.filter(w => w.inventory_number !== inventoryNumber));
  };

  const addTicket = (ticket) => {
    setTickets([...tickets, ticket]);
    
    // Автоматично створюємо запис в ремонтах
    const repair = {
      id: `R-${String(repairs.length + 1).padStart(3, '0')}`,
      workstation: ticket.workstation,
      description: ticket.problem,
      status: ticket.status,
      technician: ticket.user,
      date: ticket.date,
    };
    setRepairs([...repairs, repair]);
  };

  const updateTicket = (updatedTicket) => {
    const newTickets = tickets.map(ticket => 
      ticket.id === updatedTicket.id ? updatedTicket : ticket
    );
    setTickets(newTickets);

    // Оновлюємо відповідний запис в ремонтах
    const newRepairs = repairs.map(repair => {
      if (repair.workstation === updatedTicket.workstation && 
          repair.date === updatedTicket.date) {
        return {
          ...repair,
          status: updatedTicket.status,
          description: updatedTicket.problem,
        };
      }
      return repair;
    });
    setRepairs(newRepairs);
  };

  const addRepair = (repair) => {
    setRepairs([...repairs, repair]);
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
  };

  const value = {
    workstations,
    tickets,
    repairs,
    users,
    addWorkstation,
    removeWorkstation,
    addTicket,
    updateTicket,
    addRepair,
    settings,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext; 