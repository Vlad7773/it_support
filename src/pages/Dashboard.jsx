import React, { useState, useEffect } from 'react';
import StatCard from '../components/dashboard/StatCard';
import ChartCard from '../components/dashboard/ChartCard';
import { useApp } from '../context/AppContext';
import {
  ComputerDesktopIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { workstations, users, tickets, repairs } = useApp();
  const [stats, setStats] = useState([]);
  const [osData, setOsData] = useState({
    labels: [],
    datasets: [{
      label: 'Кількість АРМ',
      data: [],
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
    }],
  });
  const [monthlyData, setMonthlyData] = useState({
    labels: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'],
    datasets: [{
      label: 'Нові заявки',
      data: [0, 0, 0, 0, 0, 0],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      tension: 0.4,
    }],
  });
  const [repairsData, setRepairsData] = useState({
    labels: [],
    datasets: [{
      label: 'Кількість АРМ',
      data: [],
      backgroundColor: 'rgba(255, 99, 132, 0.8)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    }],
  });
  const [recentTickets, setRecentTickets] = useState([]);

  useEffect(() => {
    // Оновлюємо статистику
    const totalArms = workstations.length;
    const activeUsers = new Set(workstations.map(w => w.responsible)).size;
    const repairsInProgress = repairs.filter(r => r.status === 'В процесі').length;
    const openTickets = tickets.filter(t => t.status === 'В очікуванні').length;

    setStats([
      {
        title: 'Всього АРМ',
        value: totalArms.toString(),
        color: 'blue',
        icon: ComputerDesktopIcon,
        change: '0%',
      },
      {
        title: 'Активні користувачі',
        value: activeUsers.toString(),
        color: 'green',
        icon: UserGroupIcon,
        change: '0%',
      },
      {
        title: 'На ремонті',
        value: repairsInProgress.toString(),
        color: 'red',
        icon: WrenchScrewdriverIcon,
        change: '0%',
      },
      {
        title: 'Відкриті заявки',
        value: openTickets.toString(),
        color: 'yellow',
        icon: ClipboardDocumentListIcon,
        change: '0%',
      },
    ]);

    // Оновлюємо дані по ОС
    const osCounts = workstations.reduce((acc, w) => {
      acc[w.os] = (acc[w.os] || 0) + 1;
      return acc;
    }, {});

    setOsData({
      labels: Object.keys(osCounts),
      datasets: [
        {
          label: 'Кількість АРМ',
          data: Object.values(osCounts),
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
    });

    // Оновлюємо дані по відділах
    const departmentData = workstations.reduce((acc, w) => {
      acc[w.department] = (acc[w.department] || 0) + 1;
      return acc;
    }, {});

    setRepairsData({
      labels: Object.keys(departmentData),
      datasets: [
        {
          label: 'Кількість АРМ',
          data: Object.values(departmentData),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    });

    // Оновлюємо останні заявки
    setRecentTickets(tickets.slice(-3));
  }, [workstations, tickets, repairs]);

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
          title="Статистика по відділах"
          subtitle="Кількість АРМ за відділами"
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
                    <td className="py-3 px-4 text-white">{ticket.status}</td>
                    <td className="py-3 px-4 text-white">{ticket.user}</td>
                    <td className="py-3 px-4 text-white">{ticket.date}</td>
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