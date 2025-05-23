import React, { useState, useEffect } from 'react';
import StatCard from '../components/dashboard/StatCard';
import ChartCard from '../components/dashboard/ChartCard';
// import { useApp } from '../context/AppContext';
import {
  ComputerDesktopIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  // const { workstations, tickets, repairs } = useApp();
  const [workstations, setWorkstations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [repairs, setRepairs] = useState([]);
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
  const [ticketPriorityData, setTicketPriorityData] = useState({
    labels: [],
    datasets: [{
      label: 'Кількість тікетів',
      data: [],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',  // Критичний - червоний
        'rgba(255, 159, 64, 0.8)',  // Високий - оранжевий
        'rgba(255, 205, 86, 0.8)',  // Середній - жовтий
        'rgba(75, 192, 192, 0.8)',  // Низький - блакитний
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    }],
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workstationsRes, ticketsRes, repairsRes] = await Promise.all([
          fetch('/api/workstations'),
          fetch('/api/tickets'),
          fetch('/api/repairs')
        ]);

        const [workstationsData, ticketsData, repairsData] = await Promise.all([
          workstationsRes.json(),
          ticketsRes.json(),
          repairsRes.json()
        ]);

        setWorkstations(workstationsData);
        setTickets(ticketsData);
        setRepairs(repairsData);

        // Оновлюємо статистику
        const totalArms = workstationsData.length;
        const activeUsers = new Set(workstationsData.map(w => w.responsible)).size;
        const repairsInProgress = repairsData.filter(r => r.status === 'В процесі').length;
        const openTickets = ticketsData.filter(t => t.status === 'В очікуванні').length;

        setStats([
          {
            title: 'Всього АРМ',
            value: totalArms.toString(),
            color: 'blue',
            icon: ComputerDesktopIcon,
          },
          {
            title: 'Активні користувачі',
            value: activeUsers.toString(),
            color: 'green',
            icon: UserGroupIcon,
          },
          {
            title: 'На ремонті',
            value: repairsInProgress.toString(),
            color: 'red',
            icon: WrenchScrewdriverIcon,
          },
          {
            title: 'Відкриті заявки',
            value: openTickets.toString(),
            color: 'yellow',
            icon: ClipboardDocumentListIcon,
          },
        ]);

        // Оновлюємо дані по ОС
        const osCounts = workstationsData.reduce((acc, w) => {
          acc[w.os_name] = (acc[w.os_name] || 0) + 1;
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
        const departmentData = workstationsData.reduce((acc, w) => {
          acc[w.department_name] = (acc[w.department_name] || 0) + 1;
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

        // Оновлюємо дані по пріоритетах тікетів
        const priorityCounts = ticketsData.reduce((acc, t) => {
          acc[t.priority] = (acc[t.priority] || 0) + 1;
          return acc;
        }, {});

        setTicketPriorityData({
          labels: Object.keys(priorityCounts),
          datasets: [
            {
              label: 'Кількість тікетів',
              data: Object.values(priorityCounts),
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',  // Критичний - червоний
                'rgba(255, 159, 64, 0.8)',  // Високий - оранжевий
                'rgba(255, 205, 86, 0.8)',  // Середній - жовтий
                'rgba(75, 192, 192, 0.8)',  // Низький - блакитний
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 205, 86, 1)',
                'rgba(75, 192, 192, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });

        // Оновлюємо останні заявки
        setRecentTickets(ticketsData.slice(-3));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Не вдалося завантажити дані дашборду');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-white">Завантаження...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Помилка: {error}</div>;
  }

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
          title="Пріоритети тікетів"
          subtitle="Розподіл тікетів за пріоритетами"
          data={ticketPriorityData}
          type="pie"
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
                  <th className="text-left py-3 px-4 text-dark-textSecondary">Пріоритет</th>
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
                    <td className="py-3 px-4 text-white">{ticket.priority}</td>
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