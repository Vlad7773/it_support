import React from 'react';
import StatCard from '../components/dashboard/StatCard';
import ChartCard from '../components/dashboard/ChartCard';
import {
  ComputerDesktopIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const stats = [
    {
      title: 'Всього АРМ',
      value: '156',
      color: 'blue',
      icon: ComputerDesktopIcon,
      change: '+12%',
    },
    {
      title: 'Активні користувачі',
      value: '142',
      color: 'green',
      icon: UserGroupIcon,
      change: '+5%',
    },
    {
      title: 'На ремонті',
      value: '8',
      color: 'red',
      icon: WrenchScrewdriverIcon,
      change: '-2%',
    },
    {
      title: 'Відкриті заявки',
      value: '23',
      color: 'yellow',
      icon: ClipboardDocumentListIcon,
      change: '+8%',
    },
  ];

  const osData = {
    labels: ['Windows 10', 'Windows 11', 'Ubuntu', 'macOS'],
    datasets: [
      {
        label: 'Кількість АРМ',
        data: [85, 45, 15, 11],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthlyData = {
    labels: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'],
    datasets: [
      {
        label: 'Нові заявки',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const repairsData = {
    labels: ['Монітори', 'Системні блоки', 'Клавіатури', 'Миші', 'Принтери'],
    datasets: [
      {
        label: 'Кількість ремонтів',
        data: [15, 8, 12, 20, 5],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const recentTickets = [
    {
      id: 'TK-001',
      type: 'Несправність',
      status: 'Відкрита',
      user: 'Іван Петренко',
      date: '2024-02-17',
    },
    {
      id: 'TK-002',
      type: 'Встановлення',
      status: 'В процесі',
      user: 'Марія Коваленко',
      date: '2024-02-16',
    },
    {
      id: 'TK-003',
      type: 'Консультація',
      status: 'Завершена',
      user: 'Олександр Сидоренко',
      date: '2024-02-15',
    },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            color={stat.color}
            icon={stat.icon}
            change={stat.change}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Розподіл за ОС"
          subtitle="Статистика операційних систем"
          data={osData}
          type="bar"
        />
        <ChartCard
          title="Заявки за місяцями"
          subtitle="Динаміка нових заявок"
          data={monthlyData}
          type="line"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Статистика ремонтів"
          subtitle="За типом обладнання"
          data={repairsData}
          type="bar"
        />
        <div className="bg-dark-card rounded-lg shadow-card p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Останні заявки</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4 text-dark-textSecondary">ID</th>
                  <th className="text-left py-3 px-4 text-dark-textSecondary">Тип</th>
                  <th className="text-left py-3 px-4 text-dark-textSecondary">Статус</th>
                  <th className="text-left py-3 px-4 text-dark-textSecondary">Користувач</th>
                  <th className="text-left py-3 px-4 text-dark-textSecondary">Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-dark-border">
                    <td className="py-3 px-4 text-white">{ticket.id}</td>
                    <td className="py-3 px-4 text-white">{ticket.type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        ticket.status === 'Відкрита' ? 'bg-red-500/20 text-red-500' :
                        ticket.status === 'В процесі' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-green-500/20 text-green-500'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">{ticket.user}</td>
                    <td className="py-3 px-4 text-dark-textSecondary">{ticket.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 