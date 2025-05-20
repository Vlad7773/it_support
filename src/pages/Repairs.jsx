import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const Repairs = () => {
  const { repairs, workstations, addRepair } = useAppContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRepair, setNewRepair] = useState({
    workstation: '',
    type: '',
    status: 'В очікуванні',
    user: '',
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
      type: '',
      status: 'В очікуванні',
      user: '',
      date: new Date().toISOString().split('T')[0],
    });
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
        <h1 className="text-2xl font-semibold text-white">Ремонти</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Додати ремонт
        </button>
      </div>

      <div className="bg-dark-card rounded-lg shadow-card overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left py-3 px-4 text-dark-textSecondary">ID</th>
              <th className="text-left py-3 px-4 text-dark-textSecondary">АРМ</th>
              <th className="text-left py-3 px-4 text-dark-textSecondary">Тип</th>
              <th className="text-left py-3 px-4 text-dark-textSecondary">Статус</th>
              <th className="text-left py-3 px-4 text-dark-textSecondary">Користувач</th>
              <th className="text-left py-3 px-4 text-dark-textSecondary">Дата</th>
            </tr>
          </thead>
          <tbody>
            {repairs.map((repair) => (
              <tr key={repair.id} className="border-b border-dark-border">
                <td className="py-3 px-4 text-white">{repair.id}</td>
                <td className="py-3 px-4 text-white">{repair.workstation}</td>
                <td className="py-3 px-4 text-white">{repair.type}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(repair.status)}
                    <span className="text-white">{repair.status}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-white">{repair.user}</td>
                <td className="py-3 px-4 text-white">{repair.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-dark-card p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold text-white mb-4">Додати ремонт</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-dark-textSecondary mb-1">АРМ</label>
                <select
                  value={newRepair.workstation}
                  onChange={(e) => setNewRepair({ ...newRepair, workstation: e.target.value })}
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
                <label className="block text-dark-textSecondary mb-1">Тип</label>
                <select
                  value={newRepair.type}
                  onChange={(e) => setNewRepair({ ...newRepair, type: e.target.value })}
                  className="w-full bg-dark-input text-white rounded-lg px-3 py-2"
                >
                  <option value="">Виберіть тип</option>
                  <option value="Несправність">Несправність</option>
                  <option value="Встановлення">Встановлення</option>
                  <option value="Консультація">Консультація</option>
                </select>
              </div>
              <div>
                <label className="block text-dark-textSecondary mb-1">Користувач</label>
                <input
                  type="text"
                  value={newRepair.user}
                  onChange={(e) => setNewRepair({ ...newRepair, user: e.target.value })}
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
                  onClick={handleAddRepair}
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

export default Repairs; 