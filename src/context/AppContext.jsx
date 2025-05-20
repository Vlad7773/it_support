import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

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

  const addWorkstation = (workstation) => {
    setWorkstations([...workstations, workstation]);
  };

  const removeWorkstation = (inventoryNumber) => {
    setWorkstations(workstations.filter(w => w.inventory_number !== inventoryNumber));
  };

  const addTicket = (ticket) => {
    setTickets([...tickets, ticket]);
  };

  const updateTicket = (updatedTicket) => {
    const newTickets = tickets.map(ticket => 
      ticket.id === updatedTicket.id ? updatedTicket : ticket
    );
    setTickets(newTickets);

    // Якщо заявка завершена, додаємо її до ремонтів
    if (updatedTicket.status === 'Завершено') {
      const repair = {
        id: repairs.length + 1,
        workstation: updatedTicket.workstation,
        type: 'Ремонт',
        status: 'Завершено',
        user: updatedTicket.user,
        date: updatedTicket.date,
        problem: updatedTicket.problem,
        solution: 'Ремонт виконано',
      };
      setRepairs([...repairs, repair]);
    }
  };

  const addRepair = (repair) => {
    setRepairs([...repairs, repair]);
  };

  const value = {
    workstations,
    tickets,
    repairs,
    addWorkstation,
    removeWorkstation,
    addTicket,
    updateTicket,
    addRepair,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext; 