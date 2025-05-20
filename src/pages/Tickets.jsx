import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

// Mock data for workstations
const mockWorkstations = [
  { inventory_number: 'АРМ-001', department: 'IT відділ', responsible: 'Іванов Іван Іванович' },
  { inventory_number: 'АРМ-002', department: 'Безпека', responsible: 'Петров Петро Петрович' },
  { inventory_number: 'АРМ-003', department: 'Адміністрація', responsible: 'Сидорова Марія Іванівна' },
  { inventory_number: 'АРМ-004', department: 'Бухгалтерія', responsible: 'Коваленко Олена Василівна' },
  { inventory_number: 'АРМ-005', department: 'Кадри', responsible: 'Мельник Олег Андрійович' },
  { inventory_number: 'АРМ-006', department: 'IT відділ', responsible: 'Іванов Іван Іванович' },
  { inventory_number: 'АРМ-007', department: 'Безпека', responsible: 'Петров Петро Петрович' },
  { inventory_number: 'АРМ-008', department: 'Адміністрація', responsible: 'Сидорова Марія Іванівна' },
  { inventory_number: 'АРМ-009', department: 'Бухгалтерія', responsible: 'Коваленко Олена Василівна' },
  { inventory_number: 'АРМ-010', department: 'Кадри', responsible: 'Мельник Олег Андрійович' },
];

// Add this at the top of the file, after imports
const scrollbarStyles = `
  .table-container::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .table-container::-webkit-scrollbar-track {
    background: #1a1a1a; /* Dark background */
    border-radius: 4px;
  }
  .table-container::-webkit-scrollbar-thumb {
    background: #3a3a3a; /* Darker thumb */
    border-radius: 4px;
  }
  .table-container::-webkit-scrollbar-thumb:hover {
    background: #555; /* Lighter on hover */
  }
`;

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [armSearchTerm, setArmSearchTerm] = useState('');
  const [filteredArms, setFilteredArms] = useState([]);
  const [selectedArm, setSelectedArm] = useState(null);

  // Mock data for tickets
  const generateMockTickets = () => {
    const mockData = [];
    const statuses = ['В процесі', 'Завершено', 'В очікуванні', 'Скасовано'];
    const priorities = ['Високий', 'Середній', 'Низький'];

    for (let i = 1; i <= 20; i++) {
      const workstation = mockWorkstations[i % mockWorkstations.length];
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

  const mockTickets = generateMockTickets();

  useEffect(() => {
    setLoading(true);
    try {
      setTimeout(() => {
        setTickets(mockTickets);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (armSearchTerm) {
      const filtered = mockWorkstations.filter(arm => 
        arm.inventory_number.toLowerCase().includes(armSearchTerm.toLowerCase())
      );
      setFilteredArms(filtered);
    } else {
      setFilteredArms([]);
    }
  }, [armSearchTerm]);

  useEffect(() => {
    // Add scrollbar styles
    const style = document.createElement('style');
    style.textContent = scrollbarStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'В процесі':
        return <WrenchScrewdriverIcon className="h-5 w-5 text-yellow-500" />;
      case 'Завершено':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'В очікуванні':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'Скасовано':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
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

  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      ticket.inventory_number.toLowerCase().includes(searchLower) ||
      ticket.department.toLowerCase().includes(searchLower) ||
      ticket.responsible.toLowerCase().includes(searchLower) ||
      ticket.status.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || (ticket.department ? ticket.department === filterDepartment : true);

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleAddTicket = (newTicketData) => {
    const newTicket = {
      id: tickets.length + 1,
      ...newTicketData,
      creation_date: new Date().toISOString().split('T')[0],
      status: 'В очікуванні',
    };
    setTickets([...tickets, newTicket]);
  };

  const handleUpdateTicket = (updatedTicketData) => {
    const updatedTicketsList = tickets.map(ticket =>
      ticket.id === updatedTicketData.id ? { ...ticket, ...updatedTicketData } : ticket
    );
    setTickets(updatedTicketsList);
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
          <div className="table-container w-full" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            <table className="table-auto w-full">
              <thead className="sticky top-0 bg-dark-card z-10">
                <tr className="border-b border-dark-border">
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.id }}>ID</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.inventory_number }}>Інвентарний номер</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.priority }}>Пріоритет</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.status }}>Статус</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.department }}>Підрозділ</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.responsible }}>Відповідальний</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.creation_date }}>Дата створення</th>
                  <th className="px-4 py-2 text-left" style={{ width: colWidths.actions }}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-dark-border hover:bg-dark-bg transition-colors duration-200">
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.id, wordBreak: 'break-word' }}>{ticket.id}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.inventory_number, wordBreak: 'break-word' }}>{ticket.inventory_number}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.priority, wordBreak: 'break-word' }}>{ticket.priority}</td>
                    <td className="py-3 px-4" style={{ width: colWidths.status, wordBreak: 'break-word' }}>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(ticket.status)}
                        <span className="text-white">{ticket.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.department, wordBreak: 'break-word' }}>{ticket.department}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.responsible, wordBreak: 'break-word' }}>{ticket.responsible}</td>
                    <td className="py-3 px-4 text-white" style={{ width: colWidths.creation_date, wordBreak: 'break-word' }}>{ticket.creation_date}</td>
                    <td className="py-3 px-4" style={{ width: colWidths.actions }}>
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
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

      {/* Add Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Створити заявку</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setArmSearchTerm('');
                  setSelectedArm(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!selectedArm) return;
              
              const formData = new FormData(e.target);
              handleAddTicket({
                inventory_number: selectedArm.inventory_number,
                department: selectedArm.department,
                responsible: selectedArm.responsible,
                priority: formData.get('priority'),
                description: formData.get('description'),
              });
              setShowAddModal(false);
              setArmSearchTerm('');
              setSelectedArm(null);
            }}>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    АРМ
                  </label>
                  <input
                    type="text"
                    placeholder="Введіть номер АРМ..."
                    value={armSearchTerm}
                    onChange={(e) => setArmSearchTerm(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  />
                  {filteredArms.length > 0 && !selectedArm && (
                    <div className="absolute z-10 w-full mt-1 bg-dark-bg border border-dark-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredArms.map(arm => (
                        <div
                          key={arm.inventory_number}
                          onClick={() => {
                            setSelectedArm(arm);
                            setArmSearchTerm(arm.inventory_number);
                            setFilteredArms([]);
                          }}
                          className="px-4 py-2 hover:bg-dark-card cursor-pointer text-white"
                        >
                          {arm.inventory_number} - {arm.department}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedArm && (
                    <div className="mt-2 p-2 bg-dark-bg border border-dark-border rounded-lg">
                      <div className="text-white">АРМ: {selectedArm.inventory_number}</div>
                      <div className="text-gray-400">Підрозділ: {selectedArm.department}</div>
                      <div className="text-gray-400">Відповідальний: {selectedArm.responsible}</div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Пріоритет
                  </label>
                  <select
                    name="priority"
                    required
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  >
                    <option value="Низький">Низький</option>
                    <option value="Середній">Середній</option>
                    <option value="Високий">Високий</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Опис проблеми
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="4"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setArmSearchTerm('');
                    setSelectedArm(null);
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={!selectedArm}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Створити
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details/Edit Ticket Modal */}
      {showDetailsModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Заявка #{selectedTicket.id}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdateTicket({
                ...selectedTicket,
                status: formData.get('status'),
                priority: formData.get('priority'),
                description: formData.get('description'),
              });
              setShowDetailsModal(false);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      АРМ
                    </label>
                    <input
                      type="text"
                      value={selectedTicket.inventory_number}
                      disabled
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Підрозділ
                    </label>
                    <input
                      type="text"
                      value={selectedTicket.department}
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
                      value={selectedTicket.responsible}
                      disabled
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Дата створення
                    </label>
                    <input
                      type="text"
                      value={selectedTicket.creation_date}
                      disabled
                      className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Статус
                  </label>
                  <select
                    name="status"
                    defaultValue={selectedTicket.status}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  >
                    <option value="В очікуванні">В очікуванні</option>
                    <option value="В процесі">В процесі</option>
                    <option value="Завершено">Завершено</option>
                    <option value="Скасовано">Скасовано</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Пріоритет
                  </label>
                  <select
                    name="priority"
                    defaultValue={selectedTicket.priority}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  >
                    <option value="Низький">Низький</option>
                    <option value="Середній">Середній</option>
                    <option value="Високий">Високий</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Опис проблеми
                  </label>
                  <textarea
                    name="description"
                    defaultValue={selectedTicket.description}
                    rows="4"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets; 