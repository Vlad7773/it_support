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
  const fetchData = async () => {
    try {
      setLoading(true);
      const [workstationsRes, usersRes, ticketsRes, repairsRes, departmentsRes, workstationStatusesRes, grifLevelsRes, softwareRes] = await Promise.all([
        api.get('/workstations'),
        api.get('/users'),
        api.get('/tickets'),
        api.get('/repairs'),
        api.get('/departments'),
        api.get('/workstationstatuses'),
        api.get('/griflevels'),
        api.get('/software')
      ]);

      setWorkstations(workstationsRes.data);
      setUsers(usersRes.data);
      setTickets(ticketsRes.data);
      setRepairs(repairsRes.data);
      setDepartments(departmentsRes.data);
      setWorkstationStatuses(workstationStatusesRes.data);
      setGrifLevels(grifLevelsRes.data);
      setAllSoftware(softwareRes.data);

      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Доступ заборонено. Недостатньо прав.');
      } else {
        setError('Помилка завантаження даних');
        console.error('Error fetching data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

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
      handleApiError(err, 'Помилка додавання ПЗ');
      throw err;
    }
  };

  const updateInstalledSoftware = async (softwareId, softwareItem) => {
    try {
      const response = await api.put(`/software/${softwareId}`, softwareItem);
      setAllSoftware(prev => prev.map(s => s.id === softwareId ? response.data : s));
      return response.data;
    } catch (err) {
      handleApiError(err, 'Помилка оновлення ПЗ');
      throw err;
    }
  };

  const deleteInstalledSoftware = async (softwareId) => {
    try {
      await api.delete(`/software/${softwareId}`);
      setAllSoftware(prev => prev.filter(s => s.id !== softwareId));
    } catch (err) {
      handleApiError(err, 'Помилка видалення ПЗ');
      throw err;
    }
  };

  // Helper function to handle API errors
  const handleApiError = (err, defaultMessage) => {
    if (err.response?.status === 403) {
      setError('Доступ заборонено. Недостатньо прав.');
    } else if (err.response?.data?.error) {
      setError(err.response.data.error);
    } else {
      setError(defaultMessage);
    }
  };

  // Workstations CRUD
  const addWorkstation = async (workstation) => {
    try {
      const response = await api.post('/workstations', workstation);
      setWorkstations(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      handleApiError(err, 'Помилка додавання АРМ');
      throw err;
    }
  };

  const updateWorkstation = async (id, workstation) => {
    try {
      const response = await api.put(`/workstations/${id}`, workstation);
      setWorkstations(prev => prev.map(w => w.id === id ? response.data : w));
      return response.data;
    } catch (err) {
      handleApiError(err, 'Помилка оновлення АРМ');
      throw err;
    }
  };

  const deleteWorkstation = async (id) => {
    try {
      await api.delete(`/workstations/${id}`);
      setWorkstations(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      handleApiError(err, 'Помилка видалення АРМ');
      throw err;
    }
  };

  // Users CRUD
  const addUser = async (user) => {
    try {
      const response = await api.post('/users', user);
      setUsers(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      handleApiError(err, 'Помилка додавання користувача');
      throw err;
    }
  };

  const updateUser = async (id, user) => {
    try {
      const response = await api.put(`/users/${id}`, user);
      setUsers(prev => prev.map(u => u.id === id ? response.data : u));
      return response.data;
    } catch (err) {
      handleApiError(err, 'Помилка оновлення користувача');
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      handleApiError(err, 'Помилка видалення користувача');
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
      setError('Помилка додавання заявки');
      throw err;
    }
  };

  const updateTicket = async (id, ticket) => {
    try {
      const response = await api.put(`/tickets/${id}`, ticket);
      setTickets(prev => prev.map(t => t.id === id ? response.data : t));
      return response.data;
    } catch (err) {
      setError('Помилка оновлення заявки');
      throw err;
    }
  };

  const deleteTicket = async (id) => {
    try {
      await api.delete(`/tickets/${id}`);
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Помилка видалення заявки');
      throw err;
    }
  };

  // Repairs CRUD
  const addRepair = async (repair) => {
    try {
      const response = await api.post('/repairs', repair);
      setRepairs(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError('Помилка додавання ремонту');
      throw err;
    }
  };

  const updateRepair = async (id, repair) => {
    try {
      const response = await api.put(`/repairs/${id}`, repair);
      setRepairs(prev => prev.map(r => r.id === id ? response.data : r));
      return response.data;
    } catch (err) {
      setError('Помилка оновлення ремонту');
      throw err;
    }
  };

  const deleteRepair = async (id) => {
    try {
      await api.delete(`/repairs/${id}`);
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
    fetchData,
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