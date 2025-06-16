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
    workstation_number: 'АРМ-',
    name: '',
    version: '',
    license_key: '',
    installation_date: new Date().toISOString().split('T')[0],
    expiration_date: '',
    vendor: '',
    category: '',
    notes: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [localSoftware, setLocalSoftware] = useState([]);

  // Категорії ПЗ
  const softwareCategories = [
    { value: 'system', name: 'Системне ПЗ' },
    { value: 'office', name: 'Офісне ПЗ' },
    { value: 'security', name: 'Безпека' },
    { value: 'development', name: 'Розробка' },
    { value: 'specialized', name: 'Спеціалізоване' },
    { value: 'other', name: 'Інше' }
  ];

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

  // Валідація форми
  const validateForm = () => {
    const errors = [];
    
    if (!formData.workstation_id) {
      errors.push('Виберіть АРМ');
    }
    
    if (!formData.name?.trim()) {
      errors.push('Введіть назву ПЗ');
    }
    
    if (!formData.version?.trim()) {
      errors.push('Введіть версію ПЗ');
    }
    
    if (!formData.installation_date) {
      errors.push('Вкажіть дату встановлення');
    }
    
    // Перевірка дат
    if (formData.expiration_date) {
      const installDate = new Date(formData.installation_date);
      const expirationDate = new Date(formData.expiration_date);
      if (expirationDate < installDate) {
        errors.push('Дата закінчення ліцензії не може бути раніше дати встановлення');
      }
    }
    
    // Перевірка на дублікати
    const duplicateSoftware = localSoftware.find(s => 
      s.workstation_id === parseInt(formData.workstation_id, 10) &&
      s.name.toLowerCase() === formData.name.toLowerCase() &&
      s.id !== selectedSoftware?.id
    );
    if (duplicateSoftware) {
      errors.push(`ПЗ "${formData.name}" вже встановлено на цьому АРМ`);
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
      };
      await addSoftwareToWorkstation(formData.workstation_id, payload);
      setShowAddModal(false);
      setActiveTab('main');
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to add software:", err);
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
      };
      await updateInstalledSoftware(selectedSoftware.id, payload);
      setShowEditModal(false);
      setActiveTab('main');
      setSelectedSoftware(null);
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to edit software:", err);
      showErrors(err.response?.data?.error || err.message);
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
    const workstation = workstations.find(w => w.id === software.workstation_id);
    setFormData({
      workstation_id: software.workstation_id?.toString() || '',
      workstation_number: workstation?.inventory_number || 'АРМ-',
      name: software.name || '',
      version: software.version || '',
      license_key: software.license_key || '',
      installation_date: software.installation_date || new Date().toISOString().split('T')[0],
      expiration_date: software.expiration_date || '',
      vendor: software.vendor || '',
      category: software.category || '',
      notes: software.notes || '',
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
    .sort((a, b) => new Date(b.installation_date) - new Date(a.installation_date));

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
                    <td className="px-6 py-4 text-gray-300">{new Date(software.installation_date).toLocaleDateString('uk-UA')}</td>
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
                    list="workstation-suggestions-software"
                  />
                  <datalist id="workstation-suggestions-software">
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
                    value={formData.installation_date} 
                    onChange={(e) => setFormData({...formData, installation_date: e.target.value})} 
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p>
                  <strong>Назва:</strong> {selectedSoftware.name}
                </p>
                <p>
                  <strong>Версія:</strong> {selectedSoftware.version}
                </p>
                <p>
                  <strong>Виробник:</strong> {selectedSoftware.vendor || 'Не вказано'}
                </p>
                <p>
                  <strong>Категорія:</strong> {softwareCategories.find(c => c.value === selectedSoftware.category)?.name || 'Не вказано'}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>АРМ:</strong> {workstations.find(w => w.id === selectedSoftware.workstation_id)?.inventory_number}
                </p>
                <p>
                  <strong>Відділ:</strong> {departments.find(d => d.id === workstations.find(w => w.id === selectedSoftware.workstation_id)?.department_id)?.name}
                </p>
                <p>
                  <strong>Встановлено:</strong> {new Date(selectedSoftware.installation_date).toLocaleDateString()}
                </p>
                {selectedSoftware.expiration_date && (
                  <p>
                    <strong>Закінчення ліцензії:</strong> {new Date(selectedSoftware.expiration_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Ліцензія та примітки */}
            <div className="space-y-4">
              {selectedSoftware.license_key && (
                <div>
                  <h3 className="font-medium mb-2">Ліцензійний ключ:</h3>
                  <p className="text-gray-300 font-mono">{selectedSoftware.license_key}</p>
                </div>
              )}
              
              {selectedSoftware.notes && (
                <div>
                  <h3 className="font-medium mb-2">Примітки:</h3>
                  <p className="text-gray-300">{selectedSoftware.notes}</p>
                </div>
              )}
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