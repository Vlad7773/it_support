import React, { useState, useEffect } from 'react';
import { FaDesktop, FaLaptop, FaRegWindowMaximize } from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import { useLocation } from 'react-router-dom';

const Workstations = () => {
  const {
    workstations: contextWorkstations, // Перейменовуємо, щоб уникнути конфлікту з локальним станом, якщо він ще десь використовується
    loading,
    error,
    addWorkstation,
    updateWorkstation,
    deleteWorkstation,
    departments,
    users, // Отримуємо користувачів з контексту
    workstationStatuses, // Отримуємо статуси з контексту
  } = useApp();

  // Видаляємо локальні стани workstations, loading, error, оскільки вони беруться з AppContext
  // const [workstations, setWorkstations] = useState([]); 
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWorkstation, setSelectedWorkstation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // const [filterGrif, setFilterGrif] = useState('all'); // Поле grif відсутнє в моделі даних, можливо, його потрібно додати або видалити фільтр
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // Додаємо фільтр за статусом
  const [filterResponsible, setFilterResponsible] = useState('all'); // Додаємо фільтр за відповідальним
  const [modalView, setModalView] = useState('main');

  const initialFormData = {
    inventory_number: '',
    // ip_address: '', // Ці поля відсутні в моделі даних workstations в init_sqlite.sql
    // mac_address: '', // та server.js. Потрібно або додати їх туди, або видалити з форми.
    // grif: 'ДСК', // Також відсутнє
    os_name: '', // Змінено з os на os_name відповідно до init_sqlite.sql
    department_id: '',
    responsible_id: '', // Змінено на responsible_id
    // contacts: '', // Відсутнє
    // notes: '', // Відсутнє
    // processor: '', // Відсутнє
    // ram: '', // Відсутнє
    // storage: '', // Відсутнє
    // monitor: '', // Відсутнє
    // network: '', // Відсутнє
    // type: 'Десктоп', // Відсутнє
    status: '', // Змінено на status (текстове значення)
  };

  const [formData, setFormData] = useState(initialFormData);

  // Локальний стан для робочих станцій, який синхронізується з контекстом
  // Це може бути корисним, якщо ви хочете виконувати якісь локальні маніпуляції 
  // без негайного впливу на глобальний стан, хоча зазвичай краще працювати напряму з контекстом.
  const [localWorkstations, setLocalWorkstations] = useState([]);

  useEffect(() => {
    if (contextWorkstations) {
      setLocalWorkstations(contextWorkstations);
    }
  }, [contextWorkstations]);

  const location = useLocation();
  useEffect(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    setSelectedWorkstation(null);
  }, [location.pathname]);

  const handleAdd = async (e) => {
    e.preventDefault();
    // Оновлюємо перевірку обов'язкових полів відповідно до моделі даних
    if (!formData.inventory_number || !formData.os_name || !formData.department_id || !formData.status) {
      alert('Будь ласка, заповніть обов\'язкові поля (Інвентарний номер, ОС, Підрозділ, Статус)');
      return;
    }
    try {
      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id, 10),
        responsible_id: formData.responsible_id ? parseInt(formData.responsible_id, 10) : null,
        // status передається як є (текст)
      };
      await addWorkstation(payload);
      setShowAddModal(false);
      setModalView('main');
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to add workstation:", err);
      alert(`Помилка додавання АРМ: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!formData.inventory_number || !formData.os_name || !formData.department_id || !formData.status) {
      alert('Будь ласка, заповніть обов\'язкові поля (Інвентарний номер, ОС, Підрозділ, Статус)');
      return;
    }
    try {
      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id, 10),
        responsible_id: formData.responsible_id ? parseInt(formData.responsible_id, 10) : null,
      };
      await updateWorkstation(selectedWorkstation.id, payload);
      setShowEditModal(false);
      setModalView('main');
      setSelectedWorkstation(null);
      setFormData(initialFormData);
    } catch (err) {
      console.error("Failed to edit workstation:", err);
      alert(`Помилка оновлення АРМ: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedWorkstation) return;
    try {
      await deleteWorkstation(selectedWorkstation.id);
      setShowDeleteModal(false);
      setSelectedWorkstation(null);
    } catch (err) {
      console.error("Failed to delete workstation:", err);
      alert(`Помилка видалення АРМ: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // const handleFilterGrif = (e) => { // Видаляємо, якщо поле grif не використовується
  //   setFilterGrif(e.target.value);
  // };

  const handleFilterDepartment = (e) => {
    setFilterDepartment(e.target.value);
  };

  const handleFilterStatus = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleFilterResponsible = (e) => {
    setFilterResponsible(e.target.value);
  };

  const openEditModal = (workstation) => {
    setSelectedWorkstation(workstation);
    setFormData({
      inventory_number: workstation.inventory_number || '',
      os_name: workstation.os_name || '',
      department_id: workstation.department_id || '',
      responsible_id: workstation.responsible_id || '',
      status: workstation.status || '',
      // Залишаємо тільки поля, які є в initialFormData та моделі даних
    });
    setShowEditModal(true);
    setModalView('main');
  };

  const openDetailsModal = (workstation) => {
    setSelectedWorkstation(workstation);
    setShowDetailsModal(true);
  };

  const filteredWorkstations = (localWorkstations || []).filter(ws => {
    const department = departments.find(d => d.id === ws.department_id);
    const responsibleUser = users.find(u => u.id === ws.responsible_id);

    const matchesSearch = ws.inventory_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ws.os_name && ws.os_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (department && department.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (responsibleUser && responsibleUser.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDepartment = filterDepartment === 'all' || ws.department_id === parseInt(filterDepartment);
    const matchesStatus = filterStatus === 'all' || ws.status === filterStatus;
    const matchesResponsible = filterResponsible === 'all' || ws.responsible_id === parseInt(filterResponsible);
    // const matchesGrif = filterGrif === 'all' || ws.grif === filterGrif; // Видаляємо, якщо поле grif не використовується

    return matchesSearch && matchesDepartment && matchesStatus && matchesResponsible; // && matchesGrif;
  });

  if (loading) return <p className="text-white">Завантаження робочих станцій...</p>;
  // Показуємо помилку, тільки якщо дані не завантажені
  if (error && !localWorkstations.length) return <p className="text-red-500">Помилка завантаження робочих станцій: {error}</p>; 

  return (
    <div className="container mx-auto p-4 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Робочі станції</h1>
        <button
          onClick={() => {
            setFormData(initialFormData); // Скидаємо форму перед відкриттям
            setShowAddModal(true);
            setModalView('main');
          }}
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
        >
          Додати АРМ
        </button>
      </div>

      {/* Фільтри */}
      <div className="bg-dark-card shadow-xl rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Пошук за інв. номером, ОС, відділом..."
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={handleSearch}
          />
          <select
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filterDepartment}
            onChange={handleFilterDepartment}
          >
            <option value="all">Всі підрозділи</option>
            {(departments || []).map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <select
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filterStatus}
            onChange={handleFilterStatus}
          >
            <option value="all">Всі статуси</option>
            {(workstationStatuses || []).map(status => (
              <option key={status.id} value={status.value}>{status.name}</option> // Використовуємо status.value для фільтрації, status.name для відображення
            ))}
          </select>
          <select
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filterResponsible}
            onChange={handleFilterResponsible}
          >
            <option value="all">Всі відповідальні</option>
            {(users || []).map(user => (
              <option key={user.id} value={user.id}>{user.full_name}</option>
            ))}
          </select>
          {/* Фільтр по грифу, якщо потрібен */}
          {/* <select
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filterGrif}
            onChange={handleFilterGrif}
          >
            <option value="all">Весь гриф</option>
            <option value="ДСК">ДСК</option>
            <option value="Відкрито">Відкрито</option>
          </select> */}
        </div>
      </div>

      {/* Таблиця АРМ */}
      <div className="bg-dark-card shadow-xl rounded-lg overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-dark-hover">
            <tr className="text-left text-dark-textSecondary">
              <th className="px-6 py-3 font-semibold">Інв. №</th>
              <th className="px-6 py-3 font-semibold">ОС</th>
              <th className="px-6 py-3 font-semibold">Підрозділ</th>
              <th className="px-6 py-3 font-semibold">Відповідальний</th>
              <th className="px-6 py-3 font-semibold">Статус</th>
              <th className="px-6 py-3 font-semibold text-center">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {filteredWorkstations.length > 0 ? filteredWorkstations.map(ws => {
              const department = departments.find(d => d.id === ws.department_id);
              const responsibleUser = users.find(u => u.id === ws.responsible_id);
              const statusObj = workstationStatuses.find(s => s.value === ws.status); // Знаходимо об'єкт статусу для відображення імені
              return (
                <tr key={ws.id} className="hover:bg-dark-hover transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">{ws.inventory_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ws.os_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{department ? department.name : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{responsibleUser ? responsibleUser.full_name : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusObj && statusObj.color ? statusObj.color : 'bg-gray-500 text-gray-100'}`}>
                      {statusObj ? statusObj.name : ws.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => openDetailsModal(ws)} 
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      Деталі
                    </button>
                    <button 
                      onClick={() => openEditModal(ws)} 
                      className="text-primary-400 hover:text-primary-300 mr-3"
                    >
                      Редагувати
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedWorkstation(ws);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" className="text-center py-10 text-dark-textSecondary">Немає АРМ, що відповідають вашим фільтрам.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Модальне вікно додавання/редагування АРМ */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">{showAddModal ? 'Додати АРМ' : 'Редагувати АРМ'}</h2>
              <button onClick={() => {
                showAddModal ? setShowAddModal(false) : setShowEditModal(false);
                setModalView('main');
                setSelectedWorkstation(null);
                setFormData(initialFormData);
              }} className="text-dark-textSecondary hover:text-white text-2xl">&times;</button>
            </div>
            
            {/* Основна форма */}
            {modalView === 'main' && (
              <form onSubmit={showAddModal ? handleAdd : handleEdit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-textSecondary mb-1">Інвентарний номер <span className="text-red-500">*</span></label>
                    <input type="text" name="inventory_number" value={formData.inventory_number} onChange={(e) => setFormData({...formData, inventory_number: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-textSecondary mb-1">Операційна система <span className="text-red-500">*</span></label>
                    <input type="text" name="os_name" value={formData.os_name} onChange={(e) => setFormData({...formData, os_name: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-textSecondary mb-1">Підрозділ <span className="text-red-500">*</span></label>
                    <select name="department_id" value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" required>
                      <option value="">Виберіть підрозділ</option>
                      {(departments || []).map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-textSecondary mb-1">Відповідальний</label>
                    <select name="responsible_id" value={formData.responsible_id} onChange={(e) => setFormData({...formData, responsible_id: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500">
                      <option value="">Виберіть відповідального</option>
                      {(users || []).map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-textSecondary mb-1">Статус <span className="text-red-500">*</span></label>
                    <select name="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500" required>
                      <option value="">Виберіть статус</option>
                      {(workstationStatuses || []).map(status => <option key={status.id} value={status.value}>{status.name}</option>)}
                    </select>
                  </div>
                </div>
                
                {/* Кнопки для переходу до додаткових полів (якщо вони будуть) */}
                {/* <div className="flex justify-center space-x-4 mb-4">
                  <button type="button" onClick={() => setModalView('hardware')} className="text-primary-400 hover:underline">Обладнання</button>
                  <button type="button" onClick={() => setModalView('network')} className="text-primary-400 hover:underline">Мережа</button>
                  <button type="button" onClick={() => setModalView('other')} className="text-primary-400 hover:underline">Інше</button>
                </div> */}

                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => { showAddModal ? setShowAddModal(false) : setShowEditModal(false); setModalView('main'); setSelectedWorkstation(null); setFormData(initialFormData); }} className="px-4 py-2 rounded-lg bg-dark-bg text-dark-textSecondary hover:bg-dark-hover">Скасувати</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600">{showAddModal ? 'Додати' : 'Зберегти'}</button>
                </div>
              </form>
            )}

            {/* Тут можна додати інші view для модального вікна, якщо поля будуть розбиті по вкладках */}
            {/* Наприклад, для 'hardware', 'network', 'other' */}

          </div>
        </div>
      )}

      {/* Модальне вікно підтвердження видалення */}
      {showDeleteModal && selectedWorkstation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Підтвердити видалення</h3>
            <p className="text-dark-textSecondary mb-6">Ви впевнені, що хочете видалити АРМ "{selectedWorkstation.inventory_number}"? Цю дію неможливо буде скасувати.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-lg bg-dark-bg text-dark-textSecondary hover:bg-dark-hover">Скасувати</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Видалити</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно деталей АРМ */}
      {showDetailsModal && selectedWorkstation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Деталі АРМ: {selectedWorkstation.inventory_number}</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-dark-textSecondary hover:text-white text-2xl">&times;</button>
            </div>
            <div className="space-y-3">
              <p><strong className="text-dark-textSecondary">Інвентарний номер:</strong> {selectedWorkstation.inventory_number}</p>
              <p><strong className="text-dark-textSecondary">ОС:</strong> {selectedWorkstation.os_name}</p>
              <p><strong className="text-dark-textSecondary">Підрозділ:</strong> {departments.find(d => d.id === selectedWorkstation.department_id)?.name || 'N/A'}</p>
              <p><strong className="text-dark-textSecondary">Відповідальний:</strong> {users.find(u => u.id === selectedWorkstation.responsible_id)?.full_name || 'N/A'}</p>
              <p><strong className="text-dark-textSecondary">Статус:</strong> {workstationStatuses.find(s => s.value === selectedWorkstation.status)?.name || selectedWorkstation.status}</p>
              {/* Додайте сюди інші поля, якщо вони є в моделі даних */}
              {/* Наприклад: 
              <p><strong className="text-dark-textSecondary">IP адреса:</strong> {selectedWorkstation.ip_address || 'N/A'}</p>
              <p><strong className="text-dark-textSecondary">MAC адреса:</strong> {selectedWorkstation.mac_address || 'N/A'}</p>
              <p><strong className="text-dark-textSecondary">Гриф:</strong> {selectedWorkstation.grif || 'N/A'}</p>
              */} 
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workstations;