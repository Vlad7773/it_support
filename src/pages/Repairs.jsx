import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  UserIcon,
  ComputerDesktopIcon,
  XMarkIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const Repairs = () => {
  const {
    repairs: contextRepairs,
    workstations,
    users,
    departments,
    loading,
    error,
    addRepair,
    updateRepair,
    deleteRepair,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTechnician, setFilterTechnician] = useState('all');
  const [filterWorkstation, setFilterWorkstation] = useState('all');
  const [activeTab, setActiveTab] = useState('main');

  const statusLevels = [
    { id: 1, value: 'pending', name: 'Очікує', color: 'bg-blue-500 text-blue-100' },
    { id: 2, value: 'in_progress', name: 'В процесі', color: 'bg-yellow-500 text-yellow-100' },
    { id: 3, value: 'completed', name: 'Завершено', color: 'bg-green-500 text-green-100' },
    { id: 4, value: 'cancelled', name: 'Скасовано', color: 'bg-gray-500 text-gray-100' }
  ];

  const initialFormData = {
    workstation_id: '',
    technician_id: '',
    description: '',
    repair_date: new Date().toISOString().split('T')[0],
    cost: '',
    status: 'pending',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [localRepairs, setLocalRepairs] = useState([]);

  useEffect(() => {
    if (contextRepairs) {
      setLocalRepairs(contextRepairs);
    }
  }, [contextRepairs]);

  const location = useLocation();
  useEffect(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    setSelectedRepair(null);
  }, [location.pathname]);

  // Автопідтягування відповідального користувача при виборі АРМ
  const handleWorkstationChange = (workstationId) => {
    setFormData(prev => ({ ...prev, workstation_id: workstationId }));
    
    if (workstationId) {
      const workstation = workstations.find(w => w.id === parseInt(workstationId));
      if (workstation && workstation.responsible_id) {
        // Можна автоматично призначити відповідального як техніка або залишити на вибір
        // setFormData(prev => ({ ...prev, technician_id: workstation.responsible_id.toString() }));
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    if (!formData.workstation_id || !formData.description || !formData.technician_id) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        workstation_id: parseInt(formData.workstation_id, 10),
        technician_id: parseInt(formData.technician_id, 10),
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };
      await addRepair(payload);
      setShowAddModal(false);
      setActiveTab('main');
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to add repair:", err);
      alert(`Помилка додавання ремонту: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!formData.workstation_id || !formData.description || !formData.technician_id) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        workstation_id: parseInt(formData.workstation_id, 10),
        technician_id: parseInt(formData.technician_id, 10),
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };
      await updateRepair(selectedRepair.id, payload);
      setShowEditModal(false);
      setActiveTab('main');
      setSelectedRepair(null);
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to edit repair:", err);
      alert(`Помилка оновлення ремонту: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedRepair) return;
    try {
      await deleteRepair(selectedRepair.id);
      setShowDeleteModal(false);
      setSelectedRepair(null);
    } catch (err) {
      console.error("Failed to delete repair:", err);
      alert(`Помилка видалення ремонту: ${err.response?.data?.error || err.message}`);
    }
  };

  const openEditModal = (repair) => {
    setSelectedRepair(repair);
    setFormData({
      workstation_id: repair.workstation_id?.toString() || '',
      technician_id: repair.technician_id?.toString() || '',
      description: repair.description || '',
      repair_date: repair.repair_date || new Date().toISOString().split('T')[0],
      cost: repair.cost?.toString() || '',
      status: repair.status || 'pending',
    });
    setShowEditModal(true);
    setActiveTab('main');
  };

  const openDetailsModal = (repair) => {
    setSelectedRepair(repair);
    setShowDetailsModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />;
      case 'in_progress':
        return <PlayIcon className="h-4 w-4" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <WrenchScrewdriverIcon className="h-4 w-4" />;
    }
  };

  const filteredRepairs = (localRepairs || []).filter(repair => {
    const workstation = workstations.find(w => w.id === repair.workstation_id);
    const technician = users.find(u => u.id === repair.technician_id);

    const matchesSearch = 
      repair.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workstation?.inventory_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || repair.status === filterStatus;
    const matchesTechnician = filterTechnician === 'all' || repair.technician_id === parseInt(filterTechnician);
    const matchesWorkstation = filterWorkstation === 'all' || repair.workstation_id === parseInt(filterWorkstation);

    return matchesSearch && matchesStatus && matchesTechnician && matchesWorkstation;
  });

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Завантаження ремонтів...</p>
      </div>
    </div>
  );

  if (error && !localRepairs.length) return (
    <div className="p-6 text-center">
      <p className="text-red-400">Помилка завантаження ремонтів: {error}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Ремонти</h1>
          <p className="text-gray-400 mt-1">Управління ремонтними роботами та технічним обслуговуванням</p>
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
          Створити ремонт
        </button>
      </div>

      {/* Компактні фільтри */}
      <div className="bg-dark-card rounded-lg shadow-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Пошук */}
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Пошук за описом, АРМ, технік..."
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
            value={filterTechnician}
            onChange={(e) => setFilterTechnician(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Всі техніки</option>
            {users.filter(u => u.role === 'admin').map(user => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
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
                <th className="px-6 py-4 font-semibold">АРМ</th>
                <th className="px-6 py-4 font-semibold">Опис роботи</th>
                <th className="px-6 py-4 font-semibold">Статус</th>
                <th className="px-6 py-4 font-semibold">Технік</th>
                <th className="px-6 py-4 font-semibold">Дата ремонту</th>
                <th className="px-6 py-4 font-semibold">Вартість</th>
                <th className="px-6 py-4 font-semibold text-center">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredRepairs.length > 0 ? filteredRepairs.map(repair => {
                const workstation = workstations.find(w => w.id === repair.workstation_id);
                const technician = users.find(u => u.id === repair.technician_id);
                const statusObj = statusLevels.find(s => s.value === repair.status);
                
                return (
                  <tr key={repair.id} className="hover:bg-dark-hover transition-colors">
                    <td className="px-6 py-4 text-white font-medium">RP-{String(repair.id).padStart(3, '0')}</td>
                    <td className="px-6 py-4 text-gray-300">{workstation?.inventory_number || '-'}</td>
                    <td className="px-6 py-4 text-gray-300 max-w-[300px] truncate">{repair.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(repair.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusObj?.color || 'bg-gray-500 text-gray-100'}`}>
                          {statusObj?.name || repair.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{technician?.full_name || '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{repair.repair_date ? new Date(repair.repair_date).toLocaleDateString('uk-UA') : '-'}</td>
                    <td className="px-6 py-4 text-gray-300">{repair.cost ? `₴${parseFloat(repair.cost).toFixed(2)}` : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openDetailsModal(repair)}
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
                  <td colSpan="8" className="text-center py-12 text-dark-textSecondary">
                    <WrenchScrewdriverIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Немає ремонтів, що відповідають фільтрам</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальне вікно додавання/редагування ремонту */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{showAddModal ? 'Створити ремонт' : 'Редагувати ремонт'}</h2>
              <button onClick={() => {
                showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                setActiveTab('main');
                setSelectedRepair(null);
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">
                    Технік <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={formData.technician_id} 
                    onChange={(e) => setFormData({...formData, technician_id: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    required
                  >
                    <option value="">Виберіть техніка</option>
                    {users.filter(u => u.role === 'admin').map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name} - {departments.find(d => d.id === user.department_id)?.name || 'Без підрозділу'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">
                    Опис ремонтних робіт <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    rows="4"
                    placeholder="Детально опишіть виконані роботи..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">Дата ремонту</label>
                  <input 
                    type="date"
                    value={formData.repair_date} 
                    onChange={(e) => setFormData({...formData, repair_date: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">Вартість ремонту (₴)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost} 
                    onChange={(e) => setFormData({...formData, cost: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-2">
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
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => { 
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false); 
                    setActiveTab('main'); 
                    setSelectedRepair(null); 
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
      {showDeleteModal && selectedRepair && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Підтвердити видалення</h3>
            <p className="text-dark-textSecondary mb-6">
              Ви впевнені, що хочете видалити ремонт "RP-{String(selectedRepair.id).padStart(3, '0')}"? 
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

      {/* Модальне вікно деталей ремонту */}
      {showDetailsModal && selectedRepair && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Деталі ремонту: RP-{String(selectedRepair.id).padStart(3, '0')}
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
                    <span className="text-gray-400">Номер ремонту:</span>
                    <span className="text-white font-medium">RP-{String(selectedRepair.id).padStart(3, '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">АРМ:</span>
                    <span className="text-white">{workstations.find(w => w.id === selectedRepair.workstation_id)?.inventory_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Технік:</span>
                    <span className="text-white">{users.find(u => u.id === selectedRepair.technician_id)?.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Відділ:</span>
                    <span className="text-white">
                      {(() => {
                        const workstation = workstations.find(w => w.id === selectedRepair.workstation_id);
                        const department = departments.find(d => d.id === workstation?.department_id);
                        return department?.name || 'N/A';
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Дата ремонту:</span>
                    <span className="text-white">{selectedRepair.repair_date ? new Date(selectedRepair.repair_date).toLocaleDateString('uk-UA') : 'Не вказано'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-dark-border pb-2">
                  Статус та вартість
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Статус:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedRepair.status)}
                      <span className={`px-2 py-1 rounded text-xs ${statusLevels.find(s => s.value === selectedRepair.status)?.color || 'bg-gray-500 text-gray-100'}`}>
                        {statusLevels.find(s => s.value === selectedRepair.status)?.name || selectedRepair.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Вартість:</span>
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-400" />
                      <span className="text-white font-medium">
                        {selectedRepair.cost ? `₴${parseFloat(selectedRepair.cost).toFixed(2)}` : 'Не вказано'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Дата створення:</span>
                    <span className="text-white">{new Date(selectedRepair.created_at).toLocaleDateString('uk-UA')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Останнє оновлення:</span>
                    <span className="text-white">{new Date(selectedRepair.updated_at).toLocaleDateString('uk-UA')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Опис ремонтних робіт */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white border-b border-dark-border pb-2 mb-4">
                Опис ремонтних робіт
              </h3>
              <div className="bg-dark-bg rounded-lg p-4">
                <p className="text-white whitespace-pre-wrap">{selectedRepair.description}</p>
              </div>
            </div>

            {/* Технічна інформація АРМ */}
            {(() => {
              const workstation = workstations.find(w => w.id === selectedRepair.workstation_id);
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
                  onClick={() => openEditModal(selectedRepair)}
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
                    // Перенаправлення на сторінку заявок з фільтром по поточному АРМ
                    window.location.href = `/tickets`;
                  }}
                  className="bg-dark-bg hover:bg-dark-hover text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Заявки
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

export default Repairs; 