import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [workstations, setWorkstations] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Додаємо стани для підрозділів та статусів робочих станцій
  const [departments, setDepartments] = useState([]);
  const [workstationStatuses, setWorkstationStatuses] = useState([]);

  // Завантаження даних
  const fetchData = async () => {
    try {
      setLoading(true);
      const [workstationsRes, usersRes, ticketsRes, repairsRes, departmentsRes, workstationStatusesRes] = await Promise.all([
        axios.get(`${API_URL}/workstations`),
        axios.get(`${API_URL}/users`),
        axios.get(`${API_URL}/tickets`),
        axios.get(`${API_URL}/repairs`),
        // Додаємо запити до нових ендпоінтів
        axios.get(`${API_URL}/departments`),
        axios.get(`${API_URL}/workstationstatuses`)
      ]);

      setWorkstations(workstationsRes.data);
      setUsers(usersRes.data);
      setTickets(ticketsRes.data);
      setRepairs(repairsRes.data);
      // Встановлюємо отримані дані у відповідні стани
      setDepartments(departmentsRes.data);
      setWorkstationStatuses(workstationStatusesRes.data);

      setError(null);
    } catch (err) {
      setError('Помилка завантаження даних');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Workstations CRUD
  const addWorkstation = async (workstation) => {
    try {
      const response = await axios.post(`${API_URL}/workstations`, workstation);
      setWorkstations(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Помилка додавання АРМ');
      throw err;
    }
  };

  const updateWorkstation = async (id, workstation) => {
    try {
      const response = await axios.put(`${API_URL}/workstations/${id}`, workstation);
      setWorkstations(prev => prev.map(w => w.id === id ? response.data : w));
      return response.data;
    } catch (err) {
      setError('Помилка оновлення АРМ');
      throw err;
    }
  };

  const deleteWorkstation = async (id) => {
    try {
      await axios.delete(`${API_URL}/workstations/${id}`);
      setWorkstations(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      setError('Помилка видалення АРМ');
      throw err;
    }
  };

  // Users CRUD
  const addUser = async (user) => {
    try {
      const response = await axios.post(`${API_URL}/users`, user);
      setUsers(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Помилка додавання користувача');
      throw err;
    }
  };

  const updateUser = async (id, user) => {
    try {
      const response = await axios.put(`${API_URL}/users/${id}`, user);
      setUsers(prev => prev.map(u => u.id === id ? response.data : u));
      return response.data;
    } catch (err) {
      setError('Помилка оновлення користувача');
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError('Помилка видалення користувача');
      throw err;
    }
  };

  // Tickets CRUD
  const addTicket = async (ticket) => {
    try {
      const response = await axios.post(`${API_URL}/tickets`, ticket);
      setTickets(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Помилка додавання заявки');
      throw err;
    }
  };

  const updateTicket = async (id, ticket) => {
    try {
      const response = await axios.put(`${API_URL}/tickets/${id}`, ticket);
      setTickets(prev => prev.map(t => t.id === id ? response.data : t));
      return response.data;
    } catch (err) {
      setError('Помилка оновлення заявки');
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    try {
      await axios.delete(`${API_URL}/tickets/${id}`);
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Помилка видалення заявки');
      throw err;
    }
  };

  // Repairs CRUD
  const addRepair = async (repair) => {
    try {
      const response = await axios.post(`${API_URL}/repairs`, repair);
      setRepairs(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Помилка додавання ремонту');
      throw err;
    }
  };

  const updateRepair = async (id, repair) => {
    try {
      const response = await axios.put(`${API_URL}/repairs/${id}`, repair);
      setRepairs(prev => prev.map(r => r.id === id ? response.data : r));
      return response.data;
    } catch (err) {
      setError('Помилка оновлення ремонту');
      throw err;
    }
  };

  const deleteRepair = async (id) => {
    try {
      await axios.delete(`${API_URL}/repairs/${id}`);
      setRepairs(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError('Помилка видалення ремонту');
      throw err;
    }
  };

  const value = {
    workstations,
    users,
    tickets,
    repairs,
    loading,
    error,
    departments,
    workstationStatuses,
    addWorkstation,
    updateWorkstation,
    deleteWorkstation,
    addUser,
    updateUser,
    deleteUser,
    addTicket,
    updateTicket,
    deleteTicket,
    addRepair,
    updateRepair,
    deleteRepair,
    refreshData: fetchData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext; 