import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const Tickets = () => {
  const { tickets, workstations, users, addTicket, updateTicket, addRepair } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newTicket, setNewTicket] = useState({
    workstation: '',
    problem: '',
    status: 'В очікуванні',
    user: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddTicket = () => {
    const ticket = {
      id: `T-${String(tickets.length + 1).padStart(3, '0')}`,
      ...newTicket,
    };
    addTicket(ticket);
    setShowAddModal(false);
    setNewTicket({
      workstation: '',
      problem: '',
      status: 'В очікуванні',
      user: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleStatusChange = (ticket, newStatus) => {
    updateTicket({ ...ticket, status: newStatus });
    
    // Якщо заявка завершена, додаємо її до ремонтів
    if (newStatus === 'Завершено') {
      const repair = {
        id: `R-${String(tickets.length + 1).padStart(3, '0')}`,
        workstation: ticket.workstation,
        description: ticket.problem,
        status: 'Завершено',
        technician: ticket.user,
        date: new Date().toISOString().split('T')[0],
      };
      addRepair(repair);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'В процесі':
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
      case 'Завершено':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'В очікуванні':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  const filteredTickets = (tickets || []).filter(ticket => {
    const matchesSearch = 
      ticket.workstation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Заявки</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Додати заявку
        </button>
      </div>

      <div className="bg-dark-card rounded-lg shadow-card overflow-hidden">
        <div className="p-4 border-b border-dark-border">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Пошук..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-dark-textSecondary absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Всі статуси</option>
              <option value="В очікуванні">В очікуванні</option>
              <option value="В процесі">В процесі</option>
              <option value="Завершено">Завершено</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-dark-textSecondary">ID</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">АРМ</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Проблема</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Статус</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Користувач</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Дата</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-dark-border hover:bg-dark-bg">
                  <td className="py-3 px-4 text-white">{ticket.id}</td>
                  <td className="py-3 px-4 text-white">{ticket.workstation}</td>
                  <td className="py-3 px-4 text-white">{ticket.problem}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.status === 'Завершено' 
                          ? 'bg-green-500/20 text-green-400' 
                          : ticket.status === 'В процесі'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white">{ticket.user}</td>
                  <td className="py-3 px-4 text-white">{ticket.date}</td>
                  <td className="py-3 px-4">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket, e.target.value)}
                      className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="В очікуванні">В очікуванні</option>
                      <option value="В процесі">В процесі</option>
                      <option value="Завершено">Завершено</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-card p-6 rounded-lg w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Додати заявку</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-dark-textSecondary hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-dark-textSecondary mb-1">АРМ</label>
                <select
                  value={newTicket.workstation}
                  onChange={(e) => setNewTicket({ ...newTicket, workstation: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Виберіть АРМ</option>
                  {workstations.map((ws) => (
                    <option key={ws.inventory_number} value={ws.inventory_number}>
                      {ws.inventory_number} - {ws.department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-dark-textSecondary mb-1">Проблема</label>
                <textarea
                  value={newTicket.problem}
                  onChange={(e) => setNewTicket({ ...newTicket, problem: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Опишіть проблему"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-dark-textSecondary mb-1">Користувач</label>
                <input
                  type="text"
                  value={newTicket.user}
                  onChange={(e) => setNewTicket({ ...newTicket, user: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Введіть ім'я користувача"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-dark-textSecondary hover:text-white"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleAddTicket}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Додати
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