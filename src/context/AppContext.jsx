import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const API_URL = '/api'; // або 'http://localhost:3001/api' якщо proxy не працює

// Створюємо інстанс axios з базовою конфігурацією
const api = axios.create({
  baseURL: API_URL
});

// Додаємо інтерцептор для додавання заголовка з роллю користувача
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user) {
    config.headers['user-role'] = user.role;
  }
  return config;
});

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [workstations, setWorkstations] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workstationStatuses, setWorkstationStatuses] = useState([]);
  const [grifLevels, setGrifLevels] = useState([]);
  const [selectedWorkstationSoftware, setSelectedWorkstationSoftware] = useState([]);
  const [allSoftware, setAllSoftware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
      console.error("Error parsing stored user:", e);
      return null;
    }
  });
  const [loadingSoftware, setLoadingSoftware] = useState(false);
  const [errorSoftware, setErrorSoftware] = useState(null);

  // Завантаження даних
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        workstationsRes,
        usersRes,
        ticketsRes,
        repairsRes,
        softwareRes,
        departmentsRes
      ] = await Promise.all([
        api.get('/workstations'),
        api.get('/users'),
        api.get('/tickets'),
        api.get('/repairs'),
        api.get('/software'),
        api.get('/departments')
      ]);

      // Встановлюємо грифи з бази даних
      setGrifLevels([
        { id: 1, value: 'Особливої важливості', name: 'Особливої важливості' },
        { id: 2, value: 'Цілком таємно', name: 'Цілком таємно' },
        { id: 3, value: 'Таємно', name: 'Таємно' },
        { id: 4, value: 'ДСК', name: 'ДСК' },
        { id: 5, value: 'Відкрито', name: 'Відкрито' }
      ]);

      setWorkstations(workstationsRes.data);
      setUsers(usersRes.data);
      setTickets(ticketsRes.data);
      setRepairs(repairsRes.data);
      setAllSoftware(softwareRes.data);
      setDepartments(departmentsRes.data);
    } catch (err) {
      handleError(err, 'Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  // Завантажуємо дані при монтуванні компонента
  useEffect(() => {
    loadData();
  }, []);

  // Оновлюємо дані кожні 5 хвилин
  useEffect(() => {
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Function to fetch software for a specific workstation
  const fetchSoftwareForWorkstation = async (workstationId) => {
    try {
      setLoadingSoftware(true);
      const response = await api.get(`/workstations/${workstationId}/software`);
      setSelectedWorkstationSoftware(response.data);
      setError(null);
    } catch (err) {
      setError(`Помилка завантаження ПЗ для АРМ ${workstationId}`);
      console.error('Error fetching software for workstation:', err);
      setSelectedWorkstationSoftware([]);
    } finally {
      setLoadingSoftware(false);
    }
  };

  // Software CRUD operations
  const addSoftwareToWorkstation = async (workstationId, softwareItem) => {
    try {
      const response = await api.post('/software', softwareItem);
      setAllSoftware(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      handleError(err, 'Помилка додавання ПЗ');
      throw err;
    }
  };

  const updateInstalledSoftware = async (softwareId, softwareItem) => {
    try {
      const response = await api.put(`/software/${softwareId}`, softwareItem);
      setAllSoftware(prev => prev.map(s => s.id === softwareId ? response.data : s));
      return response.data;
    } catch (err) {
      handleError(err, 'Помилка оновлення ПЗ');
      throw err;
    }
  };

  const deleteInstalledSoftware = async (softwareId) => {
    try {
      await api.delete(`/software/${softwareId}`);
      setAllSoftware(prev => prev.filter(s => s.id !== softwareId));
    } catch (err) {
      handleError(err, 'Помилка видалення ПЗ');
      throw err;
    }
  };

  const handleError = (error, customMessage) => {
    console.error(customMessage, error);
    const errorMessage = error.response?.data?.error || error.message || customMessage;
    setError(errorMessage);
    setTimeout(() => setError(null), 5000); // Очищаємо помилку через 5 секунд
    throw error;
  };

  // Workstations CRUD
  const addWorkstation = async (workstation) => {
    try {
      const response = await api.post('/workstations', workstation);
      setWorkstations(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      handleError(err, 'Помилка додавання АРМ');
    }
  };

  const updateWorkstation = async (id, workstation) => {
    try {
      const response = await api.put(`/workstations/${id}`, workstation);
      setWorkstations(prev => prev.map(w => w.id === id ? response.data : w));
      return response.data;
    } catch (err) {
      handleError(err, 'Помилка оновлення АРМ');
    }
  };

  const deleteWorkstation = async (id) => {
    try {
      await api.delete(`/workstations/${id}`);
      setWorkstations(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      handleError(err, 'Помилка видалення АРМ');
    }
  };

  // Users CRUD
  const addUser = async (user) => {
    try {
      const response = await api.post('/users', user);
      setUsers(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      handleError(err, 'Помилка додавання користувача');
      throw err;
    }
  };

  const updateUser = async (id, user) => {
    try {
      const response = await api.put(`/users/${id}`, user);
      setUsers(prev => prev.map(u => u.id === id ? response.data : u));
      return response.data;
    } catch (err) {
      handleError(err, 'Помилка оновлення користувача');
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      handleError(err, 'Помилка видалення користувача');
      throw err;
    }
  };

  // Tickets CRUD
  const addTicket = async (ticket) => {
    try {
      const response = await api.post('/tickets', ticket);
      setTickets(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      handleError(err, 'Помилка додавання заявки');
    }
  };

  const updateTicket = async (id, ticket) => {
    try {
      const response = await api.put(`/tickets/${id}`, ticket);
      setTickets(prev => prev.map(t => t.id === id ? response.data : t));
      return response.data;
    } catch (err) {
      handleError(err, 'Помилка оновлення заявки');
    }
  };

  const deleteTicket = async (id) => {
    try {
      await api.delete(`/tickets/${id}`);
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      handleError(err, 'Помилка видалення заявки');
    }
  };

  // Repairs CRUD
  const addRepair = async (repair) => {
    try {
      const response = await api.post('/repairs', repair);
      setRepairs(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      handleError(err, 'Помилка додавання ремонту');
    }
  };

  const updateRepair = async (id, repair) => {
    try {
      const response = await api.put(`/repairs/${id}`, repair);
      setRepairs(prev => prev.map(r => r.id === id ? response.data : r));
      return response.data;
    } catch (err) {
      handleError(err, 'Помилка оновлення ремонту');
    }
  };

  const deleteRepair = async (id) => {
    try {
      await api.delete(`/repairs/${id}`);
      setRepairs(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      handleError(err, 'Помилка видалення ремонту');
    }
  };

  const value = {
    workstations,
    users,
    tickets,
    repairs,
    departments,
    workstationStatuses,
    grifLevels,
    selectedWorkstationSoftware,
    allSoftware,
    loading,
    error,
    currentUser,
    setCurrentUser,
    loadingSoftware,
    errorSoftware,
    fetchData: loadData,
    fetchSoftwareForWorkstation,
    addSoftwareToWorkstation,
    updateInstalledSoftware,
    deleteInstalledSoftware,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);