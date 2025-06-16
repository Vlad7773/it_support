import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ComputerDesktopIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const Tickets = () => {
  const {
    tickets: contextTickets,
    workstations,
    users,
    departments,
    loading,
    error,
    addTicket,
    updateTicket,
    deleteTicket,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterWorkstation, setFilterWorkstation] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [activeTab, setActiveTab] = useState('main');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  const priorityLevels = [
    { id: 1, value: 'low', name: 'Низький' },
    { id: 2, value: 'medium', name: 'Середній' },
    { id: 3, value: 'high', name: 'Високий' },
    { id: 4, value: 'critical', name: 'Критичний' }
  ];

  const ticketTypes = [
    { id: 1, value: 'printer_issue', name: 'Проблеми з принтером' },
    { id: 2, value: 'mouse_issue', name: 'Проблеми з мишкою' },
    { id: 3, value: 'keyboard_issue', name: 'Проблеми з клавіатурою' },
    { id: 4, value: 'monitor_issue', name: 'Проблеми з монітором' },
    { id: 5, value: 'system_startup', name: 'Проблеми із запуском системи' },
    { id: 6, value: 'network_issue', name: 'Проблеми з мережею' },
    { id: 7, value: 'software_issue', name: 'Проблеми з ПЗ' },
    { id: 8, value: 'hardware_issue', name: 'Проблеми з апаратним забезпеченням' },
    { id: 9, value: 'maintenance', name: 'Планове обслуговування' },
    { id: 10, value: 'other', name: 'Інше' }
  ];

  const statusLevels = [
    { id: 1, value: 'new', name: 'Нова', color: 'bg-blue-500 text-blue-100' },
    { id: 2, value: 'assigned', name: 'Призначена', color: 'bg-purple-500 text-purple-100' },
    { id: 3, value: 'in_progress', name: 'В роботі', color: 'bg-yellow-500 text-yellow-100' },
    { id: 4, value: 'need_repair', name: 'Потребує ремонту', color: 'bg-orange-500 text-orange-100' },
    { id: 5, value: 'repair_in_progress', name: 'Ремонтується', color: 'bg-indigo-500 text-indigo-100' },
    { id: 6, value: 'resolved', name: 'Вирішена', color: 'bg-green-500 text-green-100' },
    { id: 7, value: 'closed', name: 'Закрита', color: 'bg-gray-500 text-gray-100' }
  ];

  const initialFormData = {
    workstation_id: '',
    workstation_number: 'АРМ-',
    title: '',
    type: 'other',
    description: '',
    status: 'new',
    priority: 'medium',
    user_id: '', // Хто створив заявку
    assigned_to: '', // Кому призначена
    resolution_notes: '', // Примітки щодо вирішення
    resolution_date: '', // Дата вирішення
  };

  const [formData, setFormData] = useState(initialFormData);
  const [localTickets, setLocalTickets] = useState([]);

  useEffect(() => {
    if (contextTickets) {
      setLocalTickets(contextTickets);
    }
  }, [contextTickets]);

  const location = useLocation();
  useEffect(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    setSelectedTicket(null);
  }, [location.pathname]);

  // Автопідтягування відповідального користувача при виборі АРМ
  const handleWorkstationChange = (workstationId) => {
    setFormData(prev => ({ ...prev, workstation_id: workstationId }));
    
    if (workstationId) {
      const workstation = workstations.find(w => w.id === parseInt(workstationId));
      if (workstation && workstation.responsible_id) {
        setFormData(prev => ({ ...prev, user_id: workstation.responsible_id.toString() }));
      }
    }
  };

  // Валідація форми
  const validateForm = () => {
    const errors = [];
    
    if (!formData.workstation_id) {
      errors.push('Виберіть АРМ');
    }
    
    if (!formData.title?.trim()) {
      errors.push('Додайте заголовок заявки');
    }
    
    if (!formData.description?.trim()) {
      errors.push('Додайте опис проблеми');
    }
    
    if (!formData.user_id) {
      errors.push('Виберіть користувача');
    }
    
    if (formData.status === 'resolved' || formData.status === 'closed') {
      if (!formData.resolution_notes?.trim()) {
        errors.push('Додайте примітки щодо вирішення');
      }
      if (!formData.resolution_date) {
        errors.push('Вкажіть дату вирішення');
      }
    }
    
    if (formData.status === 'assigned' && !formData.assigned_to) {
      errors.push('Виберіть виконавця');
    }
    
    return errors;
  };

  // Функція для показу помилок
  const showErrors = (errors) => {
    if (!Array.isArray(errors)) {
      errors = [errors];
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-fadeIn';
    errorDiv.innerHTML = `
      <div class="flex items-start gap-3">
        <svg class="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div>
          ${errors.map(err => `<div class="mb-1">${err}</div>`).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.classList.add('animate-fadeOut');
      setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      showErrors(errors);
      return;
    }
    
    try {
      const payload = {
        ...formData,
        workstation_id: parseInt(formData.workstation_id, 10),
        user_id: parseInt(formData.user_id, 10),
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null,
      };
      await addTicket(payload);
      setShowAddModal(false);
      setActiveTab('main');
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to add ticket:", err);
      showErrors(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      showErrors(errors);
      return;
    }
    
    try {
      const payload = {
        ...formData,
        workstation_id: parseInt(formData.workstation_id, 10),
        user_id: parseInt(formData.user_id, 10),
        assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null,
      };
      await updateTicket(selectedTicket.id, payload);
      setShowEditModal(false);
      setActiveTab('main');
      setSelectedTicket(null);
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to edit ticket:", err);
      showErrors(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedTicket) return;
    try {
      await deleteTicket(selectedTicket.id);
      setShowDeleteModal(false);
      setSelectedTicket(null);
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      alert(`Помилка видалення заявки: ${err.response?.data?.error || err.message}`);
    }
  };

  const openEditModal = (ticket) => {
    setSelectedTicket(ticket);
    const workstation = workstations.find(w => w.id === ticket.workstation_id);
    setFormData({
      workstation_id: ticket.workstation_id?.toString() || '',
      workstation_number: workstation?.inventory_number || 'АРМ-',
      title: ticket.title || '',
      type: ticket.type || 'other',
      description: ticket.description || '',
      status: ticket.status || 'new',
      priority: ticket.priority || 'medium',
      user_id: ticket.user_id?.toString() || '',
      assigned_to: ticket.assigned_to?.toString() || '',
    });
    setShowEditModal(true);
    setActiveTab('main');
  };

  const openDetailsModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <ExclamationTriangleIcon className="h-4 w-4 text-blue-400" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-yellow-400" />;
      case 'resolved':
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />;
      case 'closed':
        return <XCircleIcon className="h-4 w-4 text-gray-400" />;
      default:
        return <TicketIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-400" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-400" />;
      case 'medium':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />;
      case 'low':
        return <ExclamationTriangleIcon className="h-4 w-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const filteredTickets = (localTickets || [])
    .filter(ticket => {
      const workstation = workstations.find(w => w.id === ticket.workstation_id);
      const reporter = users.find(u => u.id === ticket.user_id);

      const matchesSearch = 
        ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workstation?.inventory_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reporter?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
      const matchesWorkstation = filterWorkstation === 'all' || ticket.workstation_id === parseInt(filterWorkstation);

      return matchesSearch && matchesStatus && matchesPriority && matchesWorkstation;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'title':
          aValue = a.title || a.description || '';
          bValue = b.title || b.description || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'inventory_number':
          const workstationA = workstations.find(w => w.id === a.workstation_id);
          const workstationB = workstations.find(w => w.id === b.workstation_id);
          aValue = workstationA?.inventory_number || '';
          bValue = workstationB?.inventory_number || '';
          break;
        default:
          aValue = a[sortField] || '';
          bValue = b[sortField] || '';
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Завантаження заявок...</p>
      </div>
    </div>
  );

  if (error && !localTickets.length) return (
    <div className="p-6 text-center">
      <p className="text-red-400">Помилка завантаження заявок: {error}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Заявки</h1>
          <p className="text-gray-400 mt-1">Управління заявками та технічною підтримкою</p>
        </div>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setShowAddModal(true);
            setActiveTab('main');
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Створити заявку
        </button>
      </div>

      {/* Компактні фільтри */}
      <div className="bg-dark-card rounded-lg shadow-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Пошук */}
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Пошук за описом, АРМ, користувачем..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-dark-textSecondary absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          {/* Фільтри */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Всі статуси</option>
            {statusLevels.map(status => (
              <option key={status.id} value={status.value}>{status.name}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Всі пріоритети</option>
            {priorityLevels.map(priority => (
              <option key={priority.id} value={priority.value}>{priority.name}</option>
            ))}
          </select>


        </div>
      </div>

      {/* Таблиця */}
      <div className="bg-dark-card rounded-lg shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-hover">
              <tr className="text-left text-dark-textSecondary text-sm">
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('id')}>
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('title')}>
                  Назва {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold">Тип</th>
                <th className="px-6 py-4 font-semibold">Пріоритет</th>
                <th className="px-6 py-4 font-semibold">Статус</th>
                <th className="px-6 py-4 font-semibold">Користувач</th>
                <th className="px-6 py-4 font-semibold">Відділ</th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('inventory_number')}>
                  Інв. номер {sortField === 'inventory_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('created_at')}>
                  Дата створення {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 font-semibold text-center">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredTickets.length > 0 ? filteredTickets.map(ticket => {
                const workstation = workstations.find(w => w.id === ticket.workstation_id);
                const reporter = users.find(u => u.id === ticket.user_id);
                const department = departments.find(d => d.id === workstation?.department_id);
                const statusObj = statusLevels.find(s => s.value === ticket.status);
                const priorityObj = priorityLevels.find(p => p.value === ticket.priority);
                const typeObj = ticketTypes.find(t => t.value === ticket.type);
                
                return (
                  <tr key={ticket.id} className="hover:bg-dark-hover transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{String(ticket.id).padStart(3, '0')}</td>
                    <td className="px-6 py-4 text-gray-300 max-w-[300px] truncate">{ticket.title || ticket.description}</td>
                    <td className="px-6 py-4 text-gray-300">{typeObj?.name || 'Інше'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(ticket.priority)}
                        <span className="text-gray-300">
                          {priorityObj?.name || ticket.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <span className="text-white">
                          {statusObj?.name || ticket.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{reporter?.full_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{department?.name || '-'}</td>
                    <td className="px-6 py-4 text-gray-300 font-mono">{workstation?.inventory_number || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{new Date(ticket.created_at).toLocaleDateString('uk-UA')}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openDetailsModal(ticket)}
                        className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                        title="Деталі"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-dark-textSecondary">
                    <TicketIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Немає заявок, що відповідають фільтрам</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальне вікно додавання/редагування заявки */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{showAddModal ? 'Створити заявку' : 'Редагувати заявку'}</h2>
              <button onClick={() => {
                showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                setActiveTab('main');
                setSelectedTicket(null);
                setFormData(initialFormData);
              }} className="text-dark-textSecondary hover:text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={showAddModal ? handleAdd : handleEdit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">
                    АРМ <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={formData.workstation_number || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({...formData, workstation_number: value});
                      
                      // Автопошук АРМ
                      if (value.length >= 3) {
                        const matchingWorkstation = workstations.find(ws => 
                          ws.inventory_number.toLowerCase().includes(value.toLowerCase())
                        );
                        if (matchingWorkstation) {
                          setFormData(prev => ({
                            ...prev, 
                            workstation_id: matchingWorkstation.id.toString(),
                            workstation_number: matchingWorkstation.inventory_number
                          }));
                        }
                      }
                    }}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    placeholder="АРМ-001"
                    required
                    list="workstation-suggestions"
                  />
                  <datalist id="workstation-suggestions">
                    {workstations
                      .filter(ws => formData.workstation_number ? 
                        ws.inventory_number.toLowerCase().includes(formData.workstation_number.toLowerCase()) : true)
                      .map(ws => (
                        <option key={ws.id} value={ws.inventory_number}>
                          {ws.inventory_number} - {departments.find(d => d.id === ws.department_id)?.name || 'Без підрозділу'}
                        </option>
                      ))
                    }
                  </datalist>
                  {formData.workstation_id && (
                    <div className="mt-2 text-sm text-gray-400">
                      <div>Відповідальний: {users.find(u => u.id === workstations.find(w => w.id === parseInt(formData.workstation_id))?.responsible_id)?.full_name || 'Не вказано'}</div>
                      <div>Відділ: {departments.find(d => d.id === workstations.find(w => w.id === parseInt(formData.workstation_id))?.department_id)?.name || 'Не вказано'}</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">
                    Користувач (хто звернувся) <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.user_id} 
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    required
                  >
                    <option value="">Виберіть користувача</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} - {departments.find(d => d.id === user.department_id)?.name || 'Без підрозділу'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">
                    Назва заявки <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    placeholder="Коротка назва проблеми..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">
                    Тип проблеми <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    {ticketTypes.map(type => (
                      <option key={type.id} value={type.value}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">
                    Детальний опис проблеми <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    rows="4"
                    placeholder="Детально опишіть проблему, коли вона виникла, які дії призвели до неї..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">Пріоритет</label>
                  <select 
                    value={formData.priority} 
                    onChange={(e) => setFormData({...formData, priority: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                  >
                    {priorityLevels.map(priority => (
                      <option key={priority.id} value={priority.value}>{priority.name}</option>
                    ))}
                  </select>
                </div>
                {showEditModal && (
                  <div>
                    <label className="block text-sm font-medium text-dark-textSecondary mb-1">Статус</label>
                    <select 
                      value={formData.status} 
                      onChange={(e) => setFormData({...formData, status: e.target.value})} 
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                    >
                      {statusLevels.map(status => (
                        <option key={status.id} value={status.value}>{status.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => { 
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false); 
                    setActiveTab('main'); 
                    setSelectedTicket(null); 
                    setFormData(initialFormData); 
                  }} 
                  className="px-4 py-2 rounded-lg bg-dark-bg text-dark-textSecondary hover:bg-dark-hover transition-colors"
                >
                  Скасувати
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  {showAddModal ? 'Створити' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальне вікно підтвердження видалення */}
      {showDeleteModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Підтвердити видалення</h3>
            <p className="text-dark-textSecondary mb-6">
              Ви впевнені, що хочете видалити заявку "TK-{String(selectedTicket.id).padStart(3, '0')}"? 
              Цю дію неможливо буде скасувати.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-4 py-2 rounded-lg bg-dark-bg text-dark-textSecondary hover:bg-dark-hover transition-colors"
              >
                Скасувати
              </button>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно деталей заявки */}
      {showDetailsModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Деталі заявки: TK-{String(selectedTicket.id).padStart(3, '0')}
              </h2>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-dark-textSecondary hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Основна інформація */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <strong>АРМ:</strong> {workstations.find(w => w.id === selectedTicket.workstation_id)?.inventory_number}
                </p>
                <p>
                  <strong>Заявник:</strong> {users.find(u => u.id === selectedTicket.user_id)?.full_name}
                </p>
                {selectedTicket.assigned_to && (
                  <p>
                    <strong>Виконавець:</strong> {users.find(u => u.id === selectedTicket.assigned_to)?.full_name}
                  </p>
                )}
                <p>
                  <strong>Тип проблеми:</strong> {ticketTypes.find(t => t.value === selectedTicket.type)?.name}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Статус:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${statusLevels.find(s => s.value === selectedTicket.status)?.color}`}>
                    {statusLevels.find(s => s.value === selectedTicket.status)?.name}
                  </span>
                </p>
                <p>
                  <strong>Пріоритет:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    priorityLevels.find(p => p.value === selectedTicket.priority)?.color
                  }`}>
                    {priorityLevels.find(p => p.value === selectedTicket.priority)?.name}
                  </span>
                </p>
                <p>
                  <strong>Створено:</strong> {new Date(selectedTicket.created_at).toLocaleDateString()}
                </p>
                {selectedTicket.resolution_date && (
                  <p>
                    <strong>Вирішено:</strong> {new Date(selectedTicket.resolution_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Опис та вирішення */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Опис проблеми:</h3>
                <p className="text-gray-300">{selectedTicket.description}</p>
              </div>
              
              {selectedTicket.resolution_notes && (
                <div>
                  <h3 className="font-medium mb-2">Примітки щодо вирішення:</h3>
                  <p className="text-gray-300">{selectedTicket.resolution_notes}</p>
                </div>
              )}
            </div>

            {/* Пов'язані ремонти */}
            {selectedTicket.status === 'repair_in_progress' && (
              <div>
                <h3 className="font-medium mb-2">Пов'язаний ремонт:</h3>
                {repairs.filter(r => r.workstation_id === selectedTicket.workstation_id).map(repair => (
                  <div key={repair.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{repair.repair_type}</h4>
                        <p className="text-sm text-gray-400">{repair.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        repair.status === 'completed' ? 'bg-green-500 text-green-100' :
                        repair.status === 'in_progress' ? 'bg-yellow-500 text-yellow-100' :
                        'bg-gray-500 text-gray-100'
                      }`}>
                        {repair.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      <p>Технік: {users.find(u => u.id === repair.technician_id)?.full_name}</p>
                      <p>Дата: {new Date(repair.repair_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Дії */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  onClick={() => openEditModal(selectedTicket)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Редагувати
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowDeleteModal(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Видалити
                </button>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => {
                    // Перенаправлення на сторінку АРМ з фільтром по поточному АРМ
                    window.location.href = `/workstations`;
                  }}
                  className="bg-dark-bg hover:bg-dark-hover text-white px-4 py-2 rounded-lg transition-colors"
                >
                  АРМ
                </button>
                <button 
                  onClick={() => {
                    // Перенаправлення на сторінку ремонтів з фільтром по поточному АРМ
                    window.location.href = `/repairs`;
                  }}
                  className="bg-dark-bg hover:bg-dark-hover text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Ремонти
                </button>
                <button 
                  onClick={() => {
                    // Перенаправлення на сторінку ПЗ з фільтром по поточному АРМ
                    window.location.href = `/software`;
                  }}
                  className="bg-dark-bg hover:bg-dark-hover text-white px-4 py-2 rounded-lg transition-colors"
                >
                  ПЗ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;