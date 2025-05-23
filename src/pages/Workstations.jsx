import React, { useState, useEffect } from 'react';

const Workstations = () => {
  const [workstations, setWorkstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWorkstation, setSelectedWorkstation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrif, setFilterGrif] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [modalView, setModalView] = useState('main');

  const [formData, setFormData] = useState({
    inventory_number: '',
    ip_address: '',
    mac_address: '',
    grif: 'ДСК',
    department: '',
    responsible: '',
    contacts: '',
    notes: '',
    processor: '',
    ram: '',
    storage: '',
    os: '',
    monitor: '',
    network: ''
  });

  useEffect(() => {
    setLoading(true);
    // try {
    //   const mockWorkstations = generateMockWorkstations();
    //   setTimeout(() => {
    //     setWorkstations(mockWorkstations);
    //     setLoading(false);
    //   }, 500);
    // } catch (err) {
    //   setError(err.message);
    //   setLoading(false);
    // }

    // Fetch data from the backend
    fetch('/api/workstations')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setWorkstations(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });

  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.inventory_number || !formData.ip_address || !formData.mac_address) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }
    const newWorkstation = {
      id: workstations.length + 1,
      ...formData,
      registration_date: new Date().toISOString().split('T')[0]
    };
    setWorkstations([...workstations, newWorkstation]);
    setShowAddModal(false);
    setModalView('main');
    setFormData({
      inventory_number: '',
      ip_address: '',
      mac_address: '',
      grif: 'ДСК',
      department: '',
      responsible: '',
      contacts: '',
      notes: '',
      processor: '',
      ram: '',
      storage: '',
      os: '',
      monitor: '',
      network: ''
    });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!formData.inventory_number || !formData.ip_address || !formData.mac_address) {
      alert('Будь ласка, заповніть обов\'язкові поля');
      return;
    }
    const updatedWorkstations = workstations.map(ws =>
      ws.id === selectedWorkstation.id ? { ...ws, ...formData } : ws
    );
    setWorkstations(updatedWorkstations);
    setShowEditModal(false);
    setModalView('main');
    setSelectedWorkstation(null);
    setFormData({
      inventory_number: '',
      ip_address: '',
      mac_address: '',
      grif: 'ДСК',
      department: '',
      responsible: '',
      contacts: '',
      notes: '',
      processor: '',
      ram: '',
      storage: '',
      os: '',
      monitor: '',
      network: ''
    });
  };

  const handleDelete = () => {
    const updatedWorkstations = workstations.filter(ws => ws.id !== selectedWorkstation.id);
    setWorkstations(updatedWorkstations);
    setShowDeleteModal(false);
    setSelectedWorkstation(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterGrif = (e) => {
    setFilterGrif(e.target.value);
  };

  const handleFilterDepartment = (e) => {
    setFilterDepartment(e.target.value);
  };

  const filteredWorkstations = workstations.filter(ws => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      ws.inventory_number.toLowerCase().includes(searchLower) ||
      ws.ip_address.toLowerCase().includes(searchLower) ||
      ws.mac_address.toLowerCase().includes(searchLower) ||
      (ws.department?.toLowerCase().includes(searchLower) ?? false) ||
      (ws.responsible?.toLowerCase().includes(searchLower) ?? false);

    const matchesGrif = filterGrif === 'all' || ws.grif === filterGrif;
    const matchesDepartment = filterDepartment === 'all' || (ws.department ? ws.department === filterDepartment : true);

    return matchesSearch && matchesGrif && matchesDepartment;
  });

  if (loading) {
    return <div className="p-6 text-white">Завантаження...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Помилка: {error}</div>;
  }

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Робочі станції</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Додати АРМ
        </button>
      </div>

      <div className="bg-dark-card rounded-lg shadow-card flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-dark-border flex-shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Пошук..."
                  className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-textSecondary">
                  🔍
                </div>
              </div>
            </div>
            <select
              className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterGrif}
              onChange={handleFilterGrif}
            >
              <option value="all">Всі грифи</option>
              <option value="ДСК">ДСК</option>
              <option value="Особливої важливості">Особливої важливості</option>
              <option value="Цілком таємно">Цілком таємно</option>
              <option value="Таємно">Таємно</option>
            </select>
            <select
              className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterDepartment}
              onChange={handleFilterDepartment}
            >
              <option value="all">Всі підрозділи</option>
              <option value="IT відділ">IT відділ</option>
              <option value="Безпека">Безпека</option>
              <option value="Адміністрація">Адміністрація</option>
            </select>
          </div>
        </div>

        <div className="relative overflow-y-auto flex-1">
          <div className="table-container overflow-y-auto w-full" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <table className="table-auto w-full">
              <thead className="sticky top-0 bg-dark-card z-10">
                <tr className="border-b border-dark-border">
                  <th className="px-4 py-2 text-left" style={{ width: '5%' }}>ID</th>
                  <th className="px-4 py-2 text-left" style={{ width: '15%' }}>Інвентарний номер</th>
                  <th className="px-4 py-2 text-left" style={{ width: '10%' }}>IP адреса</th>
                  <th className="px-4 py-2 text-left" style={{ width: '15%' }}>MAC адреса</th>
                  <th className="px-4 py-2 text-left" style={{ width: '15%' }}>Гриф</th>
                  <th className="px-4 py-2 text-left" style={{ width: '15%' }}>Підрозділ</th>
                  <th className="px-4 py-2 text-left" style={{ width: '15%' }}>Відповідальний</th>
                  <th className="px-4 py-2 text-left" style={{ width: '10%' }}>Контакти</th>
                  <th className="px-4 py-2 text-left" style={{ width: '5%' }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkstations.map((ws) => (
                  <tr key={ws.id} className="border-b border-dark-border hover:bg-dark-bg transition-colors duration-200">
                    <td className="py-3 px-4 text-white" style={{ width: '5%', wordBreak: 'break-word' }}>{ws.id}</td>
                    <td className="py-3 px-4 text-white" style={{ width: '15%', wordBreak: 'break-word' }}>{ws.inventory_number}</td>
                    <td className="py-3 px-4 text-white" style={{ width: '10%', wordBreak: 'break-word' }}>{ws.ip_address}</td>
                    <td className="py-3 px-4 text-white" style={{ width: '15%', wordBreak: 'break-word' }}>{ws.mac_address}</td>
                    <td className="py-3 px-4" style={{ width: '15%', wordBreak: 'break-word' }}>{ws.grif}</td>
                    <td className="py-3 px-4 text-white" style={{ width: '15%', wordBreak: 'break-word' }}>{ws.department}</td>
                    <td className="py-3 px-4 text-white" style={{ width: '15%', wordBreak: 'break-word' }}>{ws.responsible}</td>
                    <td className="py-3 px-4 text-white" style={{ width: '10%', wordBreak: 'break-word' }}>{ws.contacts}</td>
                    <td className="py-3 px-4" style={{ width: '5%' }}>
                      <button
                        onClick={() => {
                          setSelectedWorkstation(ws);
                          setShowDetailsModal(true);
                        }}
                        className="text-gray-400 hover:text-white transition-colors duration-200 text-2xl font-bold"
                      >
                        ☰
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Модальне вікно додавання АРМ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out z-50">
          <div className="bg-dark-card p-6 rounded-lg w-[600px] transform transition-all duration-300 ease-in-out scale-100">
            <h2 className="text-xl font-bold text-white mb-4">Додати АРМ</h2>
            <form onSubmit={handleAdd}>
              <div className="grid grid-cols-2 gap-4">
                {/* Основна інформація View */}
                {modalView === 'main' && (
                  <>
                    <div className="col-span-2">
                      <h3 className="text-lg font-semibold text-white mb-4">Основна інформація</h3>
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">Інвентарний номер</label>
                      <div className="flex">
                        <span className="bg-dark-bg border border-dark-border border-r-0 rounded-l-lg px-4 py-2 text-white">АРМ-</span>
                        <input
                          type="text"
                          className="flex-1 bg-dark-bg border border-dark-border rounded-r-lg px-4 py-2 text-white"
                          value={formData.inventory_number.replace('АРМ-', '')}
                          onChange={(e) => setFormData({ ...formData, inventory_number: `АРМ-${e.target.value}` })}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">IP адреса</label>
                      <input
                        type="text"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.ip_address}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = value.split('.');
                          if (parts.length <= 4) {
                            setFormData({ ...formData, ip_address: value });
                          }
                        }}
                        placeholder="192.168.1.1"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">MAC адреса</label>
                      <input
                        type="text"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.mac_address}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                          const parts = value.match(/.{1,2}/g) || [];
                          setFormData({ ...formData, mac_address: parts.join(':').toUpperCase() });
                        }}
                        placeholder="00:1A:2B:3C:4D:5E"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">Гриф</label>
                      <select
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.grif}
                        onChange={(e) => setFormData({ ...formData, grif: e.target.value })}
                      >
                        <option value="ДСК">ДСК</option>
                        <option value="Особливої важливості">Особливої важливості</option>
                        <option value="Цілком таємно">Цілком таємно</option>
                        <option value="Таємно">Таємно</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">Підрозділ</label>
                      <input
                        type="text"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        list="departments"
                      />
                      <datalist id="departments">
                        <option value="IT відділ" />
                        <option value="Безпека" />
                        <option value="Адміністрація" />
                      </datalist>
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">Відповідальний</label>
                      <input
                        type="text"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.responsible}
                        onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">Контакти</label>
                      <div className="flex">
                        <span className="bg-dark-bg border border-dark-border border-r-0 rounded-l-lg px-4 py-2 text-white">+380</span>
                        <input
                          type="tel"
                          className="flex-1 bg-dark-bg border border-dark-border rounded-r-lg px-4 py-2 text-white"
                          value={formData.contacts.replace('+380', '')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            if (value.length <= 9) {
                              setFormData({ ...formData, contacts: `+380${value}` });
                            }
                          }}
                          placeholder="501234567"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Додаткова інформація View */}
                {modalView === 'additional' && (
                  <>
                    <div className="col-span-2">
                      <h3 className="text-lg font-semibold text-white mb-4">Додаткова інформація</h3>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-base font-semibold text-white mb-4">Технічні характеристики</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">Процесор</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.processor}
                            onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                            placeholder="Intel Core i5-10400 2.9GHz"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">ОЗУ</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.ram}
                            onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                            placeholder="16GB DDR4"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">Накопичувач</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.storage}
                            onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                            placeholder="SSD 512GB"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">Операційна система</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.os}
                            onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                            placeholder="Windows 10 Pro 64-bit"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">Монітор</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.monitor}
                            onChange={(e) => setFormData({ ...formData, monitor: e.target.value })}
                            placeholder="Dell P2419H 24"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">Мережева карта</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.network}
                            onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                            placeholder="1Gbps"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Примітки */}
                    <div className="mb-4 col-span-2">
                      <h4 className="text-base font-semibold text-white mb-4">Примітки</h4>
                      <textarea
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                {modalView === 'main' && (
                  <button
                    type="button"
                    className="flex items-center text-dark-textSecondary hover:text-white transition-colors duration-200"
                    onClick={() => setModalView('additional')}
                  >
                    Додаткова інформація <span className="ml-2">→</span>
                  </button>
                )}
                {modalView === 'additional' && (
                  <button
                    type="button"
                    className="flex items-center text-dark-textSecondary hover:text-white transition-colors duration-200"
                    onClick={() => setModalView('main')}
                  >
                    ← Основна інформація
                  </button>
                )}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setModalView('main');
                    }}
                    className="px-4 py-2 text-dark-textSecondary hover:text-white"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                  >
                    Додати
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальне вікно редагування АРМ */}
      {showEditModal && selectedWorkstation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out z-50">
          <div className="bg-dark-card p-6 rounded-lg w-[600px] transform transition-all duration-300 ease-in-out scale-100">
            <h2 className="text-xl font-bold text-white mb-4">Редагувати АРМ</h2>
            <form onSubmit={handleEdit}>
              <div className="grid grid-cols-2 gap-4">
                {/* Основна інформація View */}
                {modalView === 'main' && (
                  <>
                    <div className="col-span-2">
                      <h3 className="text-lg font-semibold text-white mb-4">Основна інформація</h3>
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">Інвентарний номер</label>
                      <div className="flex">
                        <span className="bg-dark-bg border border-dark-border border-r-0 rounded-l-lg px-4 py-2 text-white">АРМ-</span>
                        <input
                          type="text"
                          className="flex-1 bg-dark-bg border border-dark-border rounded-r-lg px-4 py-2 text-white"
                          value={formData.inventory_number.replace('АРМ-', '')}
                          onChange={(e) => setFormData({ ...formData, inventory_number: `АРМ-${e.target.value}` })}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">IP адреса</label>
                      <input
                        type="text"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.ip_address}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          const parts = value.split('.');
                          if (parts.length <= 4) {
                            setFormData({ ...formData, ip_address: value });
                          }
                        }}
                        placeholder="192.168.1.1"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">MAC адреса</label>
                      <input
                        type="text"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.mac_address}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                          const parts = value.match(/.{1,2}/g) || [];
                          setFormData({ ...formData, mac_address: parts.join(':').toUpperCase() });
                        }}
                        placeholder="00:1A:2B:3C:4D:5E"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">Гриф</label>
                      <select
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.grif}
                        onChange={(e) => setFormData({ ...formData, grif: e.target.value })}
                      >
                        <option value="ДСК">ДСК</option>
                        <option value="Особливої важливості">Особливої важливості</option>
                        <option value="Цілком таємно">Цілком таємно</option>
                        <option value="Таємно">Таємно</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">Підрозділ</label>
                      <input
                        type="text"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        list="departments"
                      />
                      <datalist id="departments">
                        <option value="IT відділ" />
                        <option value="Безпека" />
                        <option value="Адміністрація" />
                      </datalist>
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">Відповідальний</label>
                      <input
                        type="text"
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.responsible}
                        onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-dark-textSecondary mb-2">Контакти</label>
                      <div className="flex">
                        <span className="bg-dark-bg border border-dark-border border-r-0 rounded-l-lg px-4 py-2 text-white">+380</span>
                        <input
                          type="tel"
                          className="flex-1 bg-dark-bg border border-dark-border rounded-r-lg px-4 py-2 text-white"
                          value={formData.contacts.replace('+380', '')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            if (value.length <= 9) {
                              setFormData({ ...formData, contacts: `+380${value}` });
                            }
                          }}
                          placeholder="501234567"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Додаткова інформація View */}
                {modalView === 'additional' && (
                  <>
                    <div className="col-span-2">
                      <h3 className="text-lg font-semibold text-white mb-4">Додаткова інформація</h3>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-base font-semibold text-white mb-4">Технічні характеристики</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">Процесор</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.processor}
                            onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                            placeholder="Intel Core i5-10400 2.9GHz"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">ОЗУ</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.ram}
                            onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                            placeholder="16GB DDR4"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">Накопичувач</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.storage}
                            onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                            placeholder="SSD 512GB"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">Операційна система</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.os}
                            onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                            placeholder="Windows 10 Pro 64-bit"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">Монітор</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.monitor}
                            onChange={(e) => setFormData({ ...formData, monitor: e.target.value })}
                            placeholder="Dell P2419H 24"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-dark-textSecondary mb-2">Мережева карта</label>
                          <input
                            type="text"
                            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                            value={formData.network}
                            onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                            placeholder="1Gbps"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Примітки */}
                    <div className="mb-4 col-span-2">
                      <h4 className="text-base font-semibold text-white mb-4">Примітки</h4>
                      <textarea
                        className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                {modalView === 'main' && (
                  <button
                    type="button"
                    className="flex items-center text-dark-textSecondary hover:text-white transition-colors duration-200"
                    onClick={() => setModalView('additional')}
                  >
                    Додаткова інформація <span className="ml-2">→</span>
                  </button>
                )}
                {modalView === 'additional' && (
                  <button
                    type="button"
                    className="flex items-center text-dark-textSecondary hover:text-white transition-colors duration-200"
                    onClick={() => setModalView('main')}
                  >
                    ← Основна інформація
                  </button>
                )}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setModalView('main');
                    }}
                    className="px-4 py-2 text-dark-textSecondary hover:text-white"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                  >
                    Зберегти
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальне вікно підтвердження видалення */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out z-50">
          <div className="bg-dark-card p-6 rounded-lg w-96 transform transition-all duration-300 ease-in-out scale-100">
            <h2 className="text-xl font-bold text-white mb-4">Підтвердження видалення</h2>
            <p className="text-dark-textSecondary mb-4">
              Ви впевнені, що хочете видалити АРМ {selectedWorkstation?.inventory_number}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-dark-bg text-white rounded-lg hover:bg-dark-border"
              >
                Скасувати
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно з детальною інформацією */}
      {showDetailsModal && selectedWorkstation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ease-in-out z-50">
          <div className="bg-dark-card p-6 rounded-lg w-[800px] transform transition-all duration-300 ease-in-out scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Детальна інформація про АРМ</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {/* Основна інформація */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Основна інформація</h3>
                <div className="space-y-2">
                  <p className="text-gray-300"><span className="text-gray-400">ID:</span> {selectedWorkstation.id}</p>
                  <p className="text-gray-300"><span className="text-gray-400">Інвентарний номер:</span> {selectedWorkstation.inventory_number}</p>
                  <p className="text-gray-300"><span className="text-gray-400">IP адреса:</span> {selectedWorkstation.ip_address}</p>
                  <p className="text-gray-300"><span className="text-gray-400">MAC адреса:</span> {selectedWorkstation.mac_address}</p>
                  <p className="text-gray-300"><span className="text-gray-400">Гриф:</span> {selectedWorkstation.grif}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Додаткова інформація</h3>
                <div className="space-y-2">
                  <p className="text-gray-300"><span className="text-gray-400">Підрозділ:</span> {selectedWorkstation.department}</p>
                  <p className="text-gray-300"><span className="text-gray-400">Відповідальний:</span> {selectedWorkstation.responsible}</p>
                  <p className="text-gray-300"><span className="text-gray-400">Контакти:</span> {selectedWorkstation.contacts}</p>
                  <p className="text-gray-300"><span className="text-gray-400">Дата реєстрації:</span> {selectedWorkstation.registration_date}</p>
                </div>
              </div>
            </div>

            {/* Технічні характеристики */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Технічні характеристики</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-gray-300"><span className="text-gray-400">Процесор:</span> Intel Core i5-10400 2.9GHz</p>
                  <p className="text-gray-300"><span className="text-gray-400">ОЗУ:</span> 16GB DDR4</p>
                  <p className="text-gray-300"><span className="text-gray-400">Накопичувач:</span> SSD 512GB</p>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-300"><span className="text-gray-400">ОС:</span> Windows 10 Pro 64-bit</p>
                  <p className="text-gray-300"><span className="text-gray-400">Монітор:</span> Dell P2419H 24"</p>
                  <p className="text-gray-300"><span className="text-gray-400">Мережева карта:</span> 1Gbps</p>
                </div>
              </div>
            </div>

            {/* Примітки */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Примітки</h3>
              <div className="bg-dark-bg rounded-lg p-4">
                <p className="text-gray-300">{selectedWorkstation.notes || 'Немає приміток'}</p>
              </div>
            </div>

            {/* Кнопки дій */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Закрити
              </button>
              <button
                type="button"
                onClick={() => {
                  // Navigate to tickets
                  window.location.href = `/tickets?arm=${selectedWorkstation.inventory_number}`;
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Заявки
              </button>
              <button
                type="button"
                onClick={() => {
                  // Navigate to repairs
                  window.location.href = `/repairs?arm=${selectedWorkstation.inventory_number}`;
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Ремонти
              </button>
              <button
                type="button"
                onClick={() => {
                  // Navigate to software
                  window.location.href = `/software?arm=${selectedWorkstation.inventory_number}`;
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                ПЗ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(true);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Редагувати
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Ви впевнені, що хочете видалити цей АРМ?')) {
                    handleDelete();
                    setShowDetailsModal(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workstations; 