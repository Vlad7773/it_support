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

  const priorityLevels = [
    { id: 1, value: 'low', name: 'Низький' },
    { id: 2, value: 'medium', name: 'Середній' },
    { id: 3, value: 'high', name: 'Високий' },
    { id: 4, value: 'critical', name: 'Критичний' }
  ];

  const ticketTypes = [
    { id: 1, value: 'printer_issue', name: 'Не працює принтер' },
    { id: 2, value: 'mouse_issue', name: 'Не працює мишка' },
    { id: 3, value: 'keyboard_issue', name: 'Не працює клавіатура' },
    { id: 4, value: 'monitor_issue', name: 'Проблеми з монітором' },
    { id: 5, value: 'system_startup', name: 'Не запускається АРМ' },
    { id: 6, value: 'network_issue', name: 'Проблеми з мережею' },
    { id: 7, value: 'software_issue', name: 'Проблеми з ПЗ' },
    { id: 8, value: 'hardware_issue', name: 'Несправність обладнання' },
    { id: 9, value: 'other', name: 'Інше' }
  ];

  const statusLevels = [
    { id: 1, value: 'open', name: 'Відкрита' },
    { id: 2, value: 'in_progress', name: 'В процесі' },
    { id: 3, value: 'resolved', name: 'Вирішена' },
    { id: 4, value: 'closed', name: 'Закрита' }
  ];

  const initialFormData = {
    workstation_id: '',
    title: '',
    type: 'other',
    description: '',
    status: 'open',
    priority: 'medium',
    user_id: '', // Хто створив заявку
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

  const handleAdd = async (e) => {
    e.preventDefault();
    
    if (!formData.workstation_id || !formData.title || !formData.description || !formData.user_id) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        workstation_id: parseInt(formData.workstation_id, 10),
        user_id: parseInt(formData.user_id, 10),
      };
      await addTicket(payload);
      setShowAddModal(false);
      setActiveTab('main');
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to add ticket:", err);
      alert(`Помилка додавання заявки: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!formData.workstation_id || !formData.title || !formData.description || !formData.user_id) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        workstation_id: parseInt(formData.workstation_id, 10),
        user_id: parseInt(formData.user_id, 10),
      };
      await updateTicket(selectedTicket.id, payload);
      setShowEditModal(false);
      setActiveTab('main');
      setSelectedTicket(null);
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to edit ticket:", err);
      alert(`Помилка оновлення заявки: ${err.response?.data?.error || err.message}`);
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
    setFormData({
      workstation_id: ticket.workstation_id?.toString() || '',
      title: ticket.title || '',
      type: ticket.type || 'other',
      description: ticket.description || '',
      status: ticket.status || 'open',
      priority: ticket.priority || 'medium',
      user_id: ticket.user_id?.toString() || '',
    });
    setShowEditModal(true);
    setActiveTab('main');
  };

  const openDetailsModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
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
    .sort((a, b) => b.id - a.id); // Сортування за ID (найновіші спочатку)

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
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Назва</th>
                <th className="px-6 py-4 font-semibold">Тип</th>
                <th className="px-6 py-4 font-semibold">Пріоритет</th>
                <th className="px-6 py-4 font-semibold">Статус</th>
                <th className="px-6 py-4 font-semibold">Користувач</th>
                <th className="px-6 py-4 font-semibold">Відділ</th>
                <th className="px-6 py-4 font-semibold">Дата створення</th>
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
                  <td colSpan="9" className="text-center py-12 text-dark-textSecondary">
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
                  <select 
                    value={formData.workstation_id} 
                    onChange={(e) => handleWorkstationChange(e.target.value)} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    required
                  >
                    <option value="">Виберіть АРМ</option>
                    {workstations.map(ws => (
                      <option key={ws.id} value={ws.id}>
                        {ws.inventory_number} - {departments.find(d => d.id === ws.department_id)?.name || 'Без підрозділу'}
                      </option>
                    ))}
                  </select>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-dark-border pb-2">
                  Загальна інформація
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Номер заявки:</span>
                    <span className="text-white font-medium">TK-{String(selectedTicket.id).padStart(3, '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">АРМ:</span>
                    <span className="text-white">{workstations.find(w => w.id === selectedTicket.workstation_id)?.inventory_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Користувач:</span>
                    <span className="text-white">{users.find(u => u.id === selectedTicket.user_id)?.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Відділ:</span>
                    <span className="text-white">
                      {(() => {
                        const workstation = workstations.find(w => w.id === selectedTicket.workstation_id);
                        const department = departments.find(d => d.id === workstation?.department_id);
                        return department?.name || 'N/A';
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">IP адреса АРМ:</span>
                    <span className="text-white font-mono">{workstations.find(w => w.id === selectedTicket.workstation_id)?.ip_address || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-dark-border pb-2">
                  Статус та пріоритет
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Статус:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedTicket.status)}
                      <span className={`px-2 py-1 rounded text-xs ${statusLevels.find(s => s.value === selectedTicket.status)?.color || 'bg-gray-500 text-gray-100'}`}>
                        {statusLevels.find(s => s.value === selectedTicket.status)?.name || selectedTicket.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Пріоритет:</span>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(selectedTicket.priority)}
                      <span className={`px-2 py-1 rounded text-xs ${priorityLevels.find(p => p.value === selectedTicket.priority)?.color || 'bg-gray-500 text-gray-100'}`}>
                        {priorityLevels.find(p => p.value === selectedTicket.priority)?.name || selectedTicket.priority}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Дата створення:</span>
                    <span className="text-white">{new Date(selectedTicket.created_at).toLocaleDateString('uk-UA')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Останнє оновлення:</span>
                    <span className="text-white">{new Date(selectedTicket.updated_at).toLocaleDateString('uk-UA')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Опис проблеми */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white border-b border-dark-border pb-2 mb-4">
                Опис проблеми
              </h3>
              <div className="bg-dark-bg rounded-lg p-4">
                <p className="text-white whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>
            </div>

            {/* Технічна інформація АРМ */}
            {(() => {
              const workstation = workstations.find(w => w.id === selectedTicket.workstation_id);
              if (!workstation) return null;
              
              return (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white border-b border-dark-border pb-2 mb-4">
                    Технічна інформація АРМ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">IP адреса</div>
                      <div className="text-white font-medium font-mono">{workstation.ip_address || 'Не вказано'}</div>
                    </div>
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">MAC адреса</div>
                      <div className="text-white font-medium font-mono">{workstation.mac_address || 'Не вказано'}</div>
                    </div>
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">Операційна система</div>
                      <div className="text-white font-medium">{workstation.os_name || 'Не вказано'}</div>
                    </div>
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">Процесор</div>
                      <div className="text-white font-medium">{workstation.processor || 'Не вказано'}</div>
                    </div>
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">ОЗУ</div>
                      <div className="text-white font-medium">{workstation.ram || 'Не вказано'}</div>
                    </div>
                    <div className="bg-dark-bg rounded-lg p-4">
                      <div className="text-gray-400 text-sm">Накопичувач</div>
                      <div className="text-white font-medium">{workstation.storage || 'Не вказано'}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

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