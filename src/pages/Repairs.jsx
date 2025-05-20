import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const Repairs = () => {
  const { repairs, workstations, users, addRepair, updateRepair } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newRepair, setNewRepair] = useState({
    workstationId: '',
    description: '',
    status: 'In Progress',
    assignedPerformerId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });

  const handleAddRepair = async () => {
    const assignedUser = users.find(u => u.id === parseInt(newRepair.assignedPerformerId));

    if (newRepair.assignedPerformerId && !assignedUser) {
      console.error('Assigned performer not found');
      return;
    }

    const repairToAdd = {
      workstation_id: parseInt(newRepair.workstationId),
      description: newRepair.description,
      status: newRepair.status,
      assigned_performer_id: assignedUser ? assignedUser.id : null,
      start_date: newRepair.startDate,
      end_date: newRepair.endDate || null,
    };

    try {
      await addRepair(repairToAdd);
      setShowAddModal(false);
      setNewRepair({
        workstationId: '',
        description: '',
        status: 'In Progress',
        assignedPerformerId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
    } catch (error) {
      console.error('Failed to add repair:', error);
    }
  };

  const handleStatusChange = (repair, newStatus) => {
    const assignedPerformer = users.find(u => u.name === repair.assigned_performer);

    const updatedRepair = {
      ...repair,
      status: newStatus,
      workstation_id: repair.workstation_id,
      assigned_performer_id: assignedPerformer ? assignedPerformer.id : null,
      end_date: newStatus === 'Completed' && !repair.end_date ? new Date().toISOString().split('T')[0] : repair.end_date
    };

    updateRepair(updatedRepair);
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

  const filteredRepairs = (repairs || []).filter(repair => {
    const matchesSearch =
      (repair.workstation?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
       repair.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
       repair.assigned_performer?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
       repair.status?.toLowerCase()?.includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || repair.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Ремонти</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Додати ремонт
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
                <th className="text-left py-3 px-4 text-dark-textSecondary">Опис</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Статус</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Виконавець</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Дата початку</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Дата завершення</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredRepairs.map((repair) => (
                <tr key={repair.id} className="border-b border-dark-border hover:bg-dark-bg">
                  <td className="py-3 px-4 text-white">{repair.id}</td>
                  <td className="py-3 px-4 text-white">{repair.workstation}</td>
                  <td className="py-3 px-4 text-white">{repair.description}</td>
                  <td className="py-3 px-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(repair.status)
                      }`}>
                        {repair.status === 'In Progress' && 'В процесі'}
                        {repair.status === 'Completed' && 'Завершено'}
                         {!['In Progress', 'Completed'].includes(repair.status) && repair.status}
                      </span>
                  </td>
                  <td className="py-3 px-4 text-white">{repair.assigned_performer || 'Не призначено'}</td>
                  <td className="py-3 px-4 text-white">{new Date(repair.start_date).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-white">{repair.end_date ? new Date(repair.end_date).toLocaleDateString() : 'В процесі'}</td>
                  <td className="py-3 px-4">
                    <select
                      value={repair.status}
                      onChange={(e) => handleStatusChange(repair, e.target.value)}
                      className="bg-dark-bg border border-dark-border rounded-lg px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
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
              <h2 className="text-xl font-semibold text-white">Додати ремонт</h2>
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
                  value={newRepair.workstationId}
                  onChange={(e) => setNewRepair({ ...newRepair, workstationId: e.target.value })}
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
                <label className="block text-dark-textSecondary mb-1">Опис роботи</label>
                <textarea
                  value={newRepair.description}
                  onChange={(e) => setNewRepair({ ...newRepair, description: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Опишіть виконану роботу"
                  rows="3"
                />
              </div>
               <div> 
                <label className="block text-dark-textSecondary mb-1">Призначений виконавець</label>
                 <select
                  value={newRepair.assignedPerformerId}
                  onChange={(e) => setNewRepair({ ...newRepair, assignedPerformerId: e.target.value })}
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
              <div>
                <label className="block text-dark-textSecondary mb-1">Дата початку</label>
                <input
                  type="date"
                  value={newRepair.startDate}
                  onChange={(e) => setNewRepair({ ...newRepair, startDate: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-dark-textSecondary mb-1">Дата завершення</label>
                <input
                  type="date"
                  value={newRepair.endDate}
                  onChange={(e) => setNewRepair({ ...newRepair, endDate: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  onClick={handleAddRepair}
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

export default Repairs; 