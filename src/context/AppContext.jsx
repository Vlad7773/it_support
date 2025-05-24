import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const API_URL = '/api'; // або 'http://localhost:3001/api' якщо proxy не працює

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [workstations, setWorkstations] = useState([]);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workstationStatuses, setWorkstationStatuses] = useState([]);
  const [selectedWorkstationSoftware, setSelectedWorkstationSoftware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
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

  // Function to fetch software for a specific workstation
  const fetchSoftwareForWorkstation = async (workstationId) => {
    try {
      setLoadingSoftware(true);
      const response = await axios.get(`${API_URL}/workstations/${workstationId}/software`);
      setSelectedWorkstationSoftware(response.data);
      setError(null);
    } catch (err) {
      setError(`Помилка завантаження ПЗ для АРМ ${workstationId}`);
      console.error('Error fetching software for workstation:', err);
      setSelectedWorkstationSoftware([]); // Clear software on error
    } finally {
      setLoadingSoftware(false);
    }
  };

  // Placeholder CRUD for software - implement as needed
  const addSoftware = async (workstationId, softwareItem) => {
    try {
      // const response = await axios.post(`${API_URL}/workstations/${workstationId}/software`, softwareItem);
      // TODO: Update local state if backend call is successful
      // For now, just log and refetch or update manually if needed
      console.log('Add software:', workstationId, softwareItem);
      // await fetchSoftwareForWorkstation(workstationId); // Optionally refetch
      alert('Функціонал додавання ПЗ ще не реалізовано на бекенді.');
      // return response.data;
    } catch (err) {
      setError('Помилка додавання ПЗ');
      throw err;
    }
  };

  const updateSoftware = async (workstationId, softwareId, softwareItem) => {
    try {
      // const response = await axios.put(`${API_URL}/workstations/${workstationId}/software/${softwareId}`, softwareItem);
      // TODO: Update local state
      console.log('Update software:', workstationId, softwareId, softwareItem);
      // await fetchSoftwareForWorkstation(workstationId); // Optionally refetch
      alert('Функціонал оновлення ПЗ ще не реалізовано на бекенді.');
      // return response.data;
    } catch (err) {
      setError('Помилка оновлення ПЗ');
      throw err;
    }
  };

  const deleteSoftware = async (workstationId, softwareId) => {
    try {
      // await axios.delete(`${API_URL}/workstations/${workstationId}/software/${softwareId}`);
      // TODO: Update local state
      console.log('Delete software:', workstationId, softwareId);
      // await fetchSoftwareForWorkstation(workstationId); // Optionally refetch
      alert('Функціонал видалення ПЗ ще не реалізовано на бекенді.');
    } catch (err) {
      setError('Помилка видалення ПЗ');
      throw err;
    }
  };

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
    departments,
    workstationStatuses,
    selectedWorkstationSoftware,
    loading,
    error,
    currentUser,
    loadingSoftware,
    errorSoftware,
    fetchData,
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
    fetchSoftwareForWorkstation,
    addSoftware,
    updateSoftware,
    deleteSoftware,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);