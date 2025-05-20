import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const Tickets = () => {
  const { tickets, workstations, addTicket, updateTicket } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
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
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'В процесі':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'Завершено':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'В очікуванні':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Заявки</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Додати заявку
        </button>
      </div>

      <div className="bg-dark-card rounded-lg shadow-card overflow-hidden">
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
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-b border-dark-border">
                <td className="py-3 px-4 text-white">{ticket.id}</td>
                <td className="py-3 px-4 text-white">{ticket.workstation}</td>
                <td className="py-3 px-4 text-white">{ticket.problem}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(ticket.status)}
                    <span className="text-white">{ticket.status}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-white">{ticket.user}</td>
                <td className="py-3 px-4 text-white">{ticket.date}</td>
                <td className="py-3 px-4">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket, e.target.value)}
                    className="bg-dark-input text-white rounded-lg px-2 py-1"
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-dark-card p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold text-white mb-4">Додати заявку</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-dark-textSecondary mb-1">АРМ</label>
                <select
                  value={newTicket.workstation}
                  onChange={(e) => setNewTicket({ ...newTicket, workstation: e.target.value })}
                  className="w-full bg-dark-input text-white rounded-lg px-3 py-2"
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
                  className="w-full bg-dark-input text-white rounded-lg px-3 py-2"
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
                  className="w-full bg-dark-input text-white rounded-lg px-3 py-2"
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
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
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