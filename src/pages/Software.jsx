import React, { useState, useEffect } from 'react';
import {
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const Software = () => {
  const [workstations, setWorkstations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWorkstation, setSelectedWorkstation] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    inventory_number: '',
    department: '',
    responsible: '',
    model: '',
    serial_number: '',
    processor: '',
    ram: '',
    storage: '',
    os: '',
    additional_parameters: '',
  });

  // Mock data for workstations
  const mockWorkstations = [
    {
      id: 1,
      inventory_number: 'АРМ-001',
      department: 'IT відділ',
      responsible: 'Іванов Іван Іванович',
      model: 'HP ProDesk 400 G7',
      serial_number: 'SN123456',
      processor: 'Intel Core i5-10500',
      ram: '16GB DDR4',
      storage: 'SSD 512GB',
      os: 'Windows 10 Pro',
      additional_parameters: 'Додаткові параметри 1',
      software: [
        { name: 'Microsoft Office', version: '2021', license: 'Корпоративна' },
        { name: 'Adobe Acrobat', version: 'DC', license: 'Стандартна' },
        { name: 'Visual Studio Code', version: '1.85.1', license: 'Безкоштовна' },
      ]
    },
    {
      id: 2,
      inventory_number: 'АРМ-002',
      department: 'Безпека',
      responsible: 'Петров Петро Петрович',
      model: 'Dell OptiPlex 7090',
      serial_number: 'SN789012',
      processor: 'Intel Core i7-11700',
      ram: '32GB DDR4',
      storage: 'SSD 1TB',
      os: 'Windows 11 Pro',
      additional_parameters: 'Додаткові параметри 2',
      software: [
        { name: 'Microsoft Office', version: '2021', license: 'Корпоративна' },
        { name: 'Adobe Photoshop', version: '2023', license: 'Корпоративна' },
        { name: 'Chrome', version: '120.0.6099.130', license: 'Безкоштовна' },
      ]
    },
  ];

  useEffect(() => {
    setLoading(true);
    try {
      setTimeout(() => {
        setWorkstations(mockWorkstations);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const filteredWorkstations = workstations.filter(workstation => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      workstation.inventory_number.toLowerCase().includes(searchLower) ||
      workstation.department.toLowerCase().includes(searchLower) ||
      workstation.responsible.toLowerCase().includes(searchLower);

    const matchesDepartment = filterDepartment === 'all' || workstation.department === filterDepartment;

    return matchesSearch && matchesDepartment;
  });

  const handleAddWorkstation = (newWorkstationData) => {
    const newWorkstation = {
      id: workstations.length + 1,
      ...newWorkstationData,
      software: []
    };
    setWorkstations([...workstations, newWorkstation]);
  };

  const handleUpdateWorkstation = (updatedWorkstationData) => {
    const updatedWorkstationsList = workstations.map(workstation =>
      workstation.id === updatedWorkstationData.id ? { ...workstation, ...updatedWorkstationData } : workstation
    );
    setWorkstations(updatedWorkstationsList);
  };

  const handleDeleteWorkstation = (id) => {
    setWorkstations(workstations.filter(workstation => workstation.id !== id));
  };

  const colWidths = {
    id: 'w-16',
    inventory_number: 'w-32',
    department: 'w-40',
    responsible: 'w-52',
    model: 'w-40',
    os: 'w-40',
    actions: 'w-24',
  };

  if (loading) {
    return <div className="p-6 text-white">Завантаження...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Помилка: {error}</div>;
  }

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">ПЗ</h1>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-textSecondary">
                  🔍
                </div>
              </div>
            </div>
            <select
              className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">Всі підрозділи</option>
              <option value="IT відділ">IT відділ</option>
              <option value="Безпека">Безпека</option>
              <option value="Адміністрація">Адміністрація</option>
            </select>
          </div>
        </div>

        <div className="relative overflow-y-auto flex-1">
          <div className="table-container w-full" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <table className="table-auto w-full">
              <thead className="sticky top-0 bg-dark-card z-10">
                <tr className="border-b border-dark-border">
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.id }}>ID</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.inventory_number }}>Інвентарний номер</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.department }}>Підрозділ</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.responsible }}>Відповідальний</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.model }}>Модель</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.os }}>ОС</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.actions }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkstations.map((workstation) => (
                  <tr key={workstation.id} className="border-b border-dark-border hover:bg-dark-bg transition-colors duration-200">
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.id, wordBreak: 'break-word' }}>{workstation.id}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.inventory_number, wordBreak: 'break-word' }}>{workstation.inventory_number}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.department, wordBreak: 'break-word' }}>{workstation.department}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.responsible, wordBreak: 'break-word' }}>{workstation.responsible}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.model, wordBreak: 'break-word' }}>{workstation.model}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.os, wordBreak: 'break-word' }}>{workstation.os}</td>
                    <td className="py-3 px-4" style={{ width: colWidths.actions }}>
                      <button
                        onClick={() => {
                          setSelectedWorkstation(workstation);
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

      {/* Details Modal */}
      {showDetailsModal && selectedWorkstation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg p-6 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Відомості про АРМ {selectedWorkstation.inventory_number}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Підрозділ
                  </label>
                  <input
                    type="text"
                    value={selectedWorkstation.department}
                    disabled
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Відповідальний
                  </label>
                  <input
                    type="text"
                    value={selectedWorkstation.responsible}
                    disabled
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Модель
                  </label>
                  <input
                    type="text"
                    value={selectedWorkstation.model}
                    disabled
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Серійний номер
                  </label>
                  <input
                    type="text"
                    value={selectedWorkstation.serial_number}
                    disabled
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Процесор
                  </label>
                  <input
                    type="text"
                    value={selectedWorkstation.processor}
                    disabled
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    ОЗП
                  </label>
                  <input
                    type="text"
                    value={selectedWorkstation.ram}
                    disabled
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Накопичувач
                  </label>
                  <input
                    type="text"
                    value={selectedWorkstation.storage}
                    disabled
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Операційна система
                  </label>
                  <input
                    type="text"
                    value={selectedWorkstation.os}
                    disabled
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Додаткові параметри
                </label>
                <textarea
                  value={selectedWorkstation.additional_parameters}
                  disabled
                  rows="3"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Встановлене ПЗ</h3>
                <div className="bg-dark-bg rounded-lg p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-border">
                        <th className="text-left py-2 text-gray-300">Назва</th>
                        <th className="text-left py-2 text-gray-300">Версія</th>
                        <th className="text-left py-2 text-gray-300">Ліцензія</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWorkstation.software.map((software, index) => (
                        <tr key={index} className="border-b border-dark-border">
                          <td className="py-2 text-white">{software.name}</td>
                          <td className="py-2 text-white">{software.version}</td>
                          <td className="py-2 text-white">{software.license}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Workstation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Додати АРМ</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddWorkstation(formData);
              setShowAddModal(false);
              setFormData({
                inventory_number: '',
                department: '',
                responsible: '',
                model: '',
                serial_number: '',
                processor: '',
                ram: '',
                storage: '',
                os: '',
                additional_parameters: '',
              });
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Інвентарний номер
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                      value={formData.inventory_number}
                      onChange={(e) => setFormData({ ...formData, inventory_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Підрозділ
                    </label>
                    <select
                      required
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="">Виберіть підрозділ</option>
                      <option value="IT відділ">IT відділ</option>
                      <option value="Безпека">Безпека</option>
                      <option value="Адміністрація">Адміністрація</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Відповідальний
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                      value={formData.responsible}
                      onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Модель
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Серійний номер
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                      value={formData.serial_number}
                      onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Процесор
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                      value={formData.processor}
                      onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      ОЗП
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                      value={formData.ram}
                      onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Накопичувач
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                      value={formData.storage}
                      onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Операційна система
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                      value={formData.os}
                      onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Додаткові параметри
                  </label>
                  <textarea
                    rows="3"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                    value={formData.additional_parameters}
                    onChange={(e) => setFormData({ ...formData, additional_parameters: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Додати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Software; 