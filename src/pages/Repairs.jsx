import React, { useState, useEffect } from 'react';
import {
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const Repairs = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock data for requests
  const generateMockRequests = () => {
    const mockData = [];
    const statuses = ['В процесі', 'Завершено', 'В очікуванні', 'Скасовано'];
    const priorities = ['Високий', 'Середній', 'Низький'];
    const mockWorkstationsSimple = [
        { inventory_number: 'АРМ-001', department: 'IT відділ', responsible: 'Іванов Іван Іванович' },
        { inventory_number: 'АРМ-002', department: 'Безпека', responsible: 'Петров Петро Петрович' },
        { inventory_number: 'АРМ-003', department: 'Адміністрація', responsible: 'Сидорова Марія Іванівна' },
        { inventory_number: 'АРМ-004', department: 'Бухгалтерія', responsible: 'Коваленко Олена Василівна' },
        { inventory_number: 'АРМ-005', department: 'Кадри', responsible: 'Мельник Олег Андрійович' },
    ];

    for (let i = 1; i <= 20; i++) {
      const workstation = mockWorkstationsSimple[i % mockWorkstationsSimple.length];
      mockData.push({
        id: i,
        inventory_number: workstation.inventory_number,
        priority: priorities[i % priorities.length],
        status: statuses[i % statuses.length],
        department: workstation.department,
        responsible: workstation.responsible,
        creation_date: `2024-01-${String(i).padStart(2, '0')}`,
        description: `Опис заявки ${i} для АРМ ${workstation.inventory_number}`,
      });
    }
    return mockData;
  };

  const mockRequests = generateMockRequests();

  useEffect(() => {
    setLoading(true);
    try {
      setTimeout(() => {
        setRequests(mockRequests);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'В процесі':
        return 'text-yellow-500';
      case 'Завершено':
        return 'text-green-500';
      case 'В очікуванні':
        return 'text-blue-500';
      case 'Скасовано':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Високий':
        return 'text-red-500';
      case 'Середній':
        return 'text-yellow-500';
      case 'Низький':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const filteredRequests = requests.filter(request => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      request.inventory_number.toLowerCase().includes(searchLower) ||
      request.department.toLowerCase().includes(searchLower) ||
      request.responsible.toLowerCase().includes(searchLower) ||
      request.status.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || (request.department ? request.department === filterDepartment : true);

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleAddRequest = (newRequestData) => {
    const newRequest = {
      id: requests.length + 1,
      ...newRequestData,
      creation_date: new Date().toISOString().split('T')[0],
      status: 'В очікуванні',
    };
    setRequests([...requests, newRequest]);
  };

  const handleUpdateRequest = (updatedRequestData) => {
    const updatedRequestsList = requests.map(req =>
      req.id === updatedRequestData.id ? { ...req, ...updatedRequestData } : req
    );
    setRequests(updatedRequestsList);
  };

  const colWidths = {
    id: 'w-16',
    inventory_number: 'w-32',
    priority: 'w-24',
    status: 'w-32',
    department: 'w-40',
    responsible: 'w-52',
    creation_date: 'w-32',
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
        <h1 className="text-2xl font-bold text-white">Заявки</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Створити заявку
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Всі статуси</option>
              <option value="В процесі">В процесі</option>
              <option value="Завершено">Завершено</option>
              <option value="В очікуванні">В очікуванні</option>
              <option value="Скасовано">Скасовано</option>
            </select>
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
          <div className="table-container overflow-y-auto w-full" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <table className="table-auto w-full">
              <thead className="sticky top-0 bg-dark-card z-10">
                <tr className="border-b border-dark-border">
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.id }}>ID</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.inventory_number }}>Інвентарний номер АРМ</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.priority }}>Пріоритет</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.status }}>Статус</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.department }}>Підрозділ</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.responsible }}>Відповідальний</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.creation_date }}>Дата створення</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.actions }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-dark-border hover:bg-dark-bg transition-colors duration-200">
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.id, wordBreak: 'break-word' }}>{request.id}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.inventory_number, wordBreak: 'break-word' }}>{request.inventory_number}</td>
                    <td className={`py-3 px-4 ${getPriorityColor(request.priority)}`} style={{ width: colWidths.priority, wordBreak: 'break-word' }}>{request.priority}</td>
                    <td className="py-3 px-4" style={{ width: colWidths.status, wordBreak: 'break-word' }}>
                      <div className="flex items-center space-x-2">
                        <span className={getStatusColor(request.status)}>{request.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.department, wordBreak: 'break-word' }}>{request.department}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.responsible, wordBreak: 'break-word' }}>{request.responsible}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.creation_date, wordBreak: 'break-word' }}>{request.creation_date}</td>
                    <td className="py-3 px-4" style={{ width: colWidths.actions }}>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
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

      {/* TODO: Implement Add Request Modal */}
      {/* TODO: Implement Details/Edit Request Modal */}
    </div>
  );
};

export default Repairs; 