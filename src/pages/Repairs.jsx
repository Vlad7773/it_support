import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const Repairs = () => {
  const { repairs, workstations, users } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newRepair, setNewRepair] = useState({
    workstation: '',
    description: '',
    status: 'В процесі',
    technician: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddRepair = () => {
    const repair = {
      id: `R-${String(repairs.length + 1).padStart(3, '0')}`,
      ...newRepair,
    };
    addRepair(repair);
    setShowAddModal(false);
    setNewRepair({
      workstation: '',
      description: '',
      status: 'В процесі',
      technician: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const filteredRepairs = (repairs || []).filter(repair => {
    const matchesSearch = 
      repair.workstation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.technician.toLowerCase().includes(searchTerm.toLowerCase());
    
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
                <th className="text-left py-3 px-4 text-dark-textSecondary">Опис</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Статус</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Технік</th>
                <th className="text-left py-3 px-4 text-dark-textSecondary">Дата</th>
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
                      repair.status === 'Завершено' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {repair.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{repair.technician}</td>
                  <td className="py-3 px-4 text-white">{repair.date}</td>
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
                  value={newRepair.workstation}
                  onChange={(e) => setNewRepair({ ...newRepair, workstation: e.target.value })}
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
                <label className="block text-dark-textSecondary mb-1">Технік</label>
                <input
                  type="text"
                  value={newRepair.technician}
                  onChange={(e) => setNewRepair({ ...newRepair, technician: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Введіть ім'я техніка"
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