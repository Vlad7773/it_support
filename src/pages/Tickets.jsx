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
    workstationId: '',
    type: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    createdByUserId: '',
    assignedPerformerId: '',
  });

  const handleAddTicket = async () => {
    const creatingUser = users.find(u => u.name === newTicket.createdByUserId);
    const assignedUser = users.find(u => u.name === newTicket.assignedPerformerId);

    if (!creatingUser) {
      console.error('Creating user not found');
      return;
    }
    if (newTicket.assignedPerformerId && !assignedUser) {
      console.error('Assigned performer not found');
      return;
    }

    const ticketToAdd = {
      workstation_id: parseInt(newTicket.workstationId),
      type: newTicket.type,
      description: newTicket.description,
      status: newTicket.status,
      priority: newTicket.priority,
      created_by_user_id: creatingUser.id,
      assigned_performer_id: assignedUser ? assignedUser.id : null,
    };

    try {
      await addTicket(ticketToAdd);
      setShowAddModal(false);
      setNewTicket({
        workstationId: '',
        type: '',
        description: '',
        status: 'Pending',
        priority: 'Medium',
        createdByUserId: '',
        assignedPerformerId: '',
      });
    } catch (error) {
      console.error('Failed to add ticket:', error);
    }
  };

  const handleStatusChange = (ticket, newStatus) => {
    const assignedUser = users.find(u => u.name === ticket.assigned_performer);

    const updatedTicket = {
      ...ticket,
      status: newStatus,
      workstation_id: ticket.workstation_id,
      created_by_user_id: ticket.created_by_user_id,
      assigned_performer_id: assignedUser ? assignedUser.id : null,
    };

    updateTicket(updatedTicket);

    if (newStatus === 'Completed') {
      const workstation = workstations.find(w => w.name === ticket.workstation);
      const assignedPerformer = users.find(u => u.name === ticket.assigned_performer);

      if (!workstation) {
        console.error('Workstation not found for repair');
        return;
      }

      const repair = {
        workstation_id: workstation.id,
        description: ticket.description,
        status: 'In Progress',
        assigned_performer_id: assignedPerformer ? assignedPerformer.id : null,
        start_date: new Date().toISOString().split('T')[0],
      };
      addRepair(repair);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Completed':
        return 'bg-green-500/20 text-green-400';
      case 'Pending':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Progress':
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
      case 'Completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'Pending':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  const filteredTickets = (tickets || []).filter(ticket => {
    const matchesSearch =
      (ticket.workstation?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
       ticket.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
       ticket.created_by_user?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
       ticket.assigned_performer?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
       ticket.type?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
       ticket.priority?.toLowerCase()?.includes(searchTerm.toLowerCase()));

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
              <option value="Pending">В очікуванні</option>
              <option value="In Progress">В процесі</option>
              <option value="Completed">Завершено</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-dark-textSecondary">ID</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">АРМ</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Тип</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Проблема</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Статус</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Пріоритет</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Користувач</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Виконавець</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Дата створення</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b border-dark-border hover:bg-dark-bg">
                  <td className="py-3 px-4 text-white">{ticket.id}</td>
                  <td className="py-3 px-4 text-white">{ticket.workstation}</td>
                  <td className="py-3 px-4 text-white">{ticket.type}</td>
                  <td className="py-3 px-4 text-white">{ticket.description}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(ticket.status)
                      }`}>
                        {ticket.status === 'Pending' && 'В очікуванні'}
                        {ticket.status === 'In Progress' && 'В процесі'}
                        {ticket.status === 'Completed' && 'Завершено'}
                        {!['Pending', 'In Progress', 'Completed'].includes(ticket.status) && ticket.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white">{ticket.priority}</td>
                  <td className="py-3 px-4 text-white">{ticket.created_by_user}</td>
                  <td className="py-3 px-4 text-white">{ticket.assigned_performer || 'Не призначено'}</td>
                  <td className="py-3 px-4 text-white">{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket, e.target.value)}
                      className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Pending">В очікуванні</option>
                      <option value="In Progress">В процесі</option>
                      <option value="Completed">Завершено</option>
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
                  value={newTicket.workstationId}
                  onChange={(e) => setNewTicket({ ...newTicket, workstationId: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Виберіть АРМ</option>
                  {workstations.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name} - {ws.department}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-dark-textSecondary mb-1">Тип заявки</label>
                <select
                  value={newTicket.type}
                  onChange={(e) => setNewTicket({ ...newTicket, type: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Виберіть тип</option>
                  <option value="Hardware">Обладнання</option>
                  <option value="Software">Програмне забезпечення</option>
                  <option value="Network">Мережа</option>
                  <option value="Other">Інше</option>
                </select>
              </div>
              <div>
                <label className="block text-dark-textSecondary mb-1">Опис проблеми</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Опишіть проблему"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-dark-textSecondary mb-1">Пріоритет</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="High">Високий</option>
                  <option value="Medium">Середній</option>
                  <option value="Low">Низький</option>
                </select>
              </div>
              <div>
                <label className="block text-dark-textSecondary mb-1">Користувач (Хто створив)</label>
                <select
                  value={newTicket.createdByUserId}
                  onChange={(e) => setNewTicket({ ...newTicket, createdByUserId: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Виберіть користувача</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.login})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-dark-textSecondary mb-1">Призначений виконавець</label>
                <select
                  value={newTicket.assignedPerformerId}
                  onChange={(e) => setNewTicket({ ...newTicket, assignedPerformerId: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Не призначено</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.login})
                    </option>
                  ))}
                </select>
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