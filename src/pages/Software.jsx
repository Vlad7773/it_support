import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  CubeIcon,
  CalendarIcon,
  ComputerDesktopIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const Software = () => {
  const {
    workstations,
    users,
    departments,
    loading,
    error,
    allSoftware,
    selectedWorkstationSoftware,
    loadingSoftware,
    errorSoftware,
    fetchSoftwareForWorkstation,
    addSoftwareToWorkstation,
    updateInstalledSoftware,
    deleteInstalledSoftware
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWorkstation, setFilterWorkstation] = useState('all');
  const [filterName, setFilterName] = useState('all');
  const [activeTab, setActiveTab] = useState('main');

  const initialFormData = {
    workstation_id: '',
    name: '',
    version: '',
    license_key: '',
    installed_date: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [localSoftware, setLocalSoftware] = useState([]);

  useEffect(() => {
    if (allSoftware) {
      setLocalSoftware(allSoftware);
    }
  }, [allSoftware]);

  const location = useLocation();
  useEffect(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    setSelectedSoftware(null);
  }, [location.pathname]);

  // Не потрібно завантажувати ПЗ для окремого АРМ, використовуємо allSoftware

  const handleAdd = async (e) => {
    e.preventDefault();
    
    if (!formData.workstation_id || !formData.name || !formData.version) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        workstation_id: parseInt(formData.workstation_id, 10),
      };
      await addSoftwareToWorkstation(formData.workstation_id, payload);
      setShowAddModal(false);
      setActiveTab('main');
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to add software:", err);
      alert(`Помилка додавання ПЗ: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    if (!formData.workstation_id || !formData.name || !formData.version) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }
    
    try {
      const payload = {
        ...formData,
        workstation_id: parseInt(formData.workstation_id, 10),
      };
      await updateInstalledSoftware(selectedSoftware.id, payload);
      setShowEditModal(false);
      setActiveTab('main');
      setSelectedSoftware(null);
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to edit software:", err);
      alert(`Помилка оновлення ПЗ: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedSoftware) return;
    try {
      await deleteInstalledSoftware(selectedSoftware.id);
      setShowDeleteModal(false);
      setSelectedSoftware(null);
    } catch (err) {
      console.error("Failed to delete software:", err);
      alert(`Помилка видалення ПЗ: ${err.response?.data?.error || err.message}`);
    }
  };

  const openEditModal = (software) => {
    setSelectedSoftware(software);
    setFormData({
      workstation_id: software.workstation_id?.toString() || '',
      name: software.name || '',
      version: software.version || '',
      license_key: software.license_key || '',
      installed_date: software.installed_date || new Date().toISOString().split('T')[0],
    });
    setShowEditModal(true);
    setActiveTab('main');
  };

  const openDetailsModal = (software) => {
    setSelectedSoftware(software);
    setShowDetailsModal(true);
  };

  const filteredSoftware = (localSoftware || [])
    .filter(software => {
      const workstation = workstations.find(w => w.id === software.workstation_id);

      const matchesSearch = 
        software.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        software.version?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workstation?.inventory_number?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesWorkstation = filterWorkstation === 'all' || software.workstation_id === parseInt(filterWorkstation);

      return matchesSearch && matchesWorkstation;
    })
    .sort((a, b) => new Date(b.installed_date) - new Date(a.installed_date));

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Завантаження ПЗ...</p>
      </div>
    </div>
  );

  if (error && !localSoftware.length) return (
    <div className="p-6 text-center">
      <p className="text-red-400">Помилка завантаження ПЗ: {error}</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Програмне забезпечення</h1>
          <p className="text-gray-400 mt-1">Управління програмним забезпеченням на АРМ</p>
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
          Додати ПЗ
        </button>
      </div>

      {/* Компактні фільтри */}
      <div className="bg-dark-card rounded-lg shadow-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Пошук */}
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Пошук за назвою, версією, АРМ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-dark-textSecondary absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          {/* Фільтри */}
          <select
            value={filterWorkstation}
            onChange={(e) => setFilterWorkstation(e.target.value)}
            className="bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Всі АРМ</option>
            {workstations.map(workstation => (
              <option key={workstation.id} value={workstation.id}>
                {workstation.inventory_number} - {departments.find(d => d.id === workstation.department_id)?.name || 'Без підрозділу'}
              </option>
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
                <th className="px-6 py-4 font-semibold">Назва ПЗ</th>
                <th className="px-6 py-4 font-semibold">Версія</th>
                <th className="px-6 py-4 font-semibold">АРМ</th>
                <th className="px-6 py-4 font-semibold">Відділ</th>
                <th className="px-6 py-4 font-semibold">Дата встановлення</th>
                <th className="px-6 py-4 font-semibold">Ліцензійний ключ</th>
                <th className="px-6 py-4 font-semibold text-center">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredSoftware.length > 0 ? filteredSoftware.map(software => {
                const workstation = workstations.find(w => w.id === software.workstation_id);
                const department = departments.find(d => d.id === workstation?.department_id);
                
                return (
                  <tr key={software.id} className="hover:bg-dark-hover transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{software.name}</td>
                    <td className="px-6 py-4 text-gray-300">{software.version}</td>
                    <td className="px-6 py-4 text-gray-300">{workstation?.inventory_number || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-300">{department?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-300">{new Date(software.installed_date).toLocaleDateString('uk-UA')}</td>
                    <td className="px-6 py-4 text-gray-300 font-mono text-sm">{software.license_key || 'Не вказано'}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openDetailsModal(software)}
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
                  <td colSpan="7" className="text-center py-12 text-dark-textSecondary">
                    <CubeIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Немає ПЗ, що відповідає фільтрам</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальне вікно додавання/редагування ПЗ */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{showAddModal ? 'Додати ПЗ' : 'Редагувати ПЗ'}</h2>
              <button onClick={() => {
                showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                setActiveTab('main');
                setSelectedSoftware(null);
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
                    onChange={(e) => setFormData({...formData, workstation_id: e.target.value})} 
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
                    Назва ПЗ <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    placeholder="Назва програми..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">
                    Версія <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    value={formData.version} 
                    onChange={(e) => setFormData({...formData, version: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" 
                    placeholder="1.0.0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">Дата встановлення</label>
                  <input 
                    type="date"
                    value={formData.installed_date} 
                    onChange={(e) => setFormData({...formData, installed_date: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-dark-textSecondary mb-1">Ліцензійний ключ</label>
                  <input 
                    type="text"
                    value={formData.license_key} 
                    onChange={(e) => setFormData({...formData, license_key: e.target.value})} 
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500 font-mono text-sm" 
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => { 
                    showAddModal ? setShowAddModal(false) : setShowEditModal(false); 
                    setActiveTab('main'); 
                    setSelectedSoftware(null); 
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
                  {showAddModal ? 'Додати' : 'Зберегти'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальне вікно підтвердження видалення */}
      {showDeleteModal && selectedSoftware && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Підтвердити видалення</h3>
            <p className="text-dark-textSecondary mb-6">
              Ви впевнені, що хочете видалити ПЗ "{selectedSoftware.name} v{selectedSoftware.version}"? 
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

      {/* Модальне вікно деталей ПЗ */}
      {showDetailsModal && selectedSoftware && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Деталі ПЗ: {selectedSoftware.name}
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
                  Інформація про ПЗ
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Назва:</span>
                    <span className="text-white font-medium">{selectedSoftware.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Версія:</span>
                    <span className="text-white">{selectedSoftware.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Дата встановлення:</span>
                    <span className="text-white">{new Date(selectedSoftware.installed_date).toLocaleDateString('uk-UA')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ліцензійний ключ:</span>
                    <span className="text-white font-mono text-sm">{selectedSoftware.license_key || 'Не вказано'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-dark-border pb-2">
                  Інформація про АРМ
                </h3>
                <div className="space-y-3">
                  {(() => {
                    const workstation = workstations.find(w => w.id === selectedSoftware.workstation_id);
                    const department = departments.find(d => d.id === workstation?.department_id);
                    const responsible = users.find(u => u.id === workstation?.responsible_id);
                    
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">АРМ:</span>
                          <span className="text-white">{workstation?.inventory_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Відділ:</span>
                          <span className="text-white">{department?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Відповідальний:</span>
                          <span className="text-white">{responsible?.full_name || 'Не вказано'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">IP адреса:</span>
                          <span className="text-white font-mono">{workstation?.ip_address || 'Не вказано'}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Дії */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  onClick={() => openEditModal(selectedSoftware)}
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
                     // Перенаправлення на сторінку заявок з фільтром по поточному АРМ
                     window.location.href = `/tickets`;
                   }}
                   className="bg-dark-bg hover:bg-dark-hover text-white px-4 py-2 rounded-lg transition-colors"
                 >
                   Заявки
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Software;