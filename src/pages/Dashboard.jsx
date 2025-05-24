import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ComputerDesktopIcon,
  UsersIcon,
  TicketIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { workstations, users, tickets, repairs, loading, error } = useApp();
  const [stats, setStats] = useState([]);

  useEffect(() => {
    if (workstations && users && tickets && repairs) {
      const totalWorkstations = workstations.length;
      const activeUsers = users.filter(u => u.role === 'user').length;
      const openTickets = tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length;
      const ongoingRepairs = repairs.filter(r => ['pending', 'in_progress'].includes(r.status)).length;

      setStats([
        {
          title: 'Всього АРМ',
          value: totalWorkstations,
          icon: ComputerDesktopIcon,
          change: '+12%',
          bgGradient: 'from-blue-500 to-cyan-400',
          iconColor: 'text-blue-400'
        },
        {
          title: 'Активні користувачі',
          value: activeUsers,
          icon: UsersIcon,
          change: '+5%',
          bgGradient: 'from-green-500 to-emerald-400',
          iconColor: 'text-green-400'
        },
        {
          title: 'На ремонті',
          value: ongoingRepairs,
          icon: WrenchScrewdriverIcon,
          change: '-2%',
          bgGradient: 'from-red-500 to-pink-400',
          iconColor: 'text-red-400'
        },
        {
          title: 'Відкриті заявки',
          value: openTickets,
          icon: TicketIcon,
          change: '+8%',
          bgGradient: 'from-purple-500 to-violet-400',
          iconColor: 'text-purple-400'
        }
      ]);
    }
  }, [workstations, users, tickets, repairs]);

  // Дані для графіків
  const osData = {
    labels: ['Windows 10', 'Windows 11', 'Ubuntu', 'macOS'],
    datasets: [{
      label: 'Кількість АРМ',
      data: [
        workstations?.filter(w => w.os_name?.includes('Windows 10')).length || 0,
        workstations?.filter(w => w.os_name?.includes('Windows 11')).length || 0,
        workstations?.filter(w => w.os_name?.includes('Ubuntu')).length || 0,
        workstations?.filter(w => w.os_name?.includes('macOS')).length || 0,
      ],
      backgroundColor: ['#3b82f6', '#64ffda', '#f59e0b', '#8b5cf6'],
      borderRadius: 8,
    }]
  };

  const ticketTrendsData = {
    labels: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'],
    datasets: [{
      label: 'Нові заявки',
      data: [12, 19, 15, 25, 22, 30],
      borderColor: '#64ffda',
      backgroundColor: 'rgba(100, 255, 218, 0.1)',
      tension: 0.4,
      fill: true,
    }]
  };

  const repairStatsData = {
    labels: ['Завершено', 'В процесі', 'Очікує'],
    datasets: [{
      data: [
        repairs?.filter(r => r.status === 'completed').length || 0,
        repairs?.filter(r => r.status === 'in_progress').length || 0,
        repairs?.filter(r => r.status === 'pending').length || 0,
      ],
      backgroundColor: ['#4ade80', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        titleColor: '#64ffda',
        bodyColor: '#ffffff',
        borderColor: '#64ffda',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#64ffda] mx-auto mb-4"></div>
        <p className="text-[#8892b0]">Завантаження панелі управління...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-400">Помилка завантаження даних: {error}</p>
    </div>
  );

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Статистичні картки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card group cursor-pointer relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-5 rounded-xl group-hover:opacity-10 transition-opacity`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-[#8892b0]">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} bg-opacity-20`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-semibold text-green-400">{stat.change}</span>
                <span className="text-xs text-[#8892b0] ml-2">від минулого місяця</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Графіки та діаграми */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Розподіл за ОС */}
        <div className="dark-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Розподіл за ОС</h3>
            <ChartBarIcon className="h-5 w-5 text-[#64ffda]" />
          </div>
          <div className="h-48">
            <Bar data={osData} options={chartOptions} />
          </div>
          <div className="mt-4 text-sm text-[#8892b0]">
            Статистика операційних систем
          </div>
        </div>

        {/* Заявки за місяцями */}
        <div className="dark-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Заявки за місяцями</h3>
            <TicketIcon className="h-5 w-5 text-[#64ffda]" />
          </div>
          <div className="h-48">
            <Line data={ticketTrendsData} options={chartOptions} />
          </div>
          <div className="mt-4 text-sm text-[#8892b0]">
            Динаміка нових заявок
          </div>
        </div>
      </div>

      {/* Нижній ряд */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Статистика ремонтів */}
        <div className="dark-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Статистика ремонтів</h3>
            <WrenchScrewdriverIcon className="h-5 w-5 text-[#64ffda]" />
          </div>
          <div className="h-40 flex items-center justify-center">
            <div className="w-32 h-32">
              <Doughnut data={repairStatsData} options={{...chartOptions, cutout: '60%'}} />
            </div>
          </div>
          <div className="mt-4 text-sm text-[#8892b0]">
            За типом обладнання
          </div>
        </div>

        {/* Останні заявки */}
        <div className="lg:col-span-2 dark-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Останні заявки</h3>
            <TicketIcon className="h-5 w-5 text-[#64ffda]" />
          </div>
          <div className="space-y-4">
            {tickets?.slice(0, 4).map((ticket, index) => (
              <div key={ticket.id || index} className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f23] bg-opacity-50">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {ticket.status === 'open' && <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />}
                    {ticket.status === 'in_progress' && <ClockIcon className="h-5 w-5 text-yellow-400" />}
                    {ticket.status === 'resolved' && <CheckCircleIcon className="h-5 w-5 text-green-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">TK-{String(ticket.id).padStart(3, '0')}</p>
                    <p className="text-xs text-[#8892b0] max-w-[200px] truncate">{ticket.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`status-badge ${
                    ticket.status === 'open' ? 'bg-red-500 bg-opacity-20 text-red-400' :
                    ticket.status === 'in_progress' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                    'bg-green-500 bg-opacity-20 text-green-400'
                  }`}>
                    {ticket.status === 'open' ? 'Відкрита' :
                     ticket.status === 'in_progress' ? 'В процесі' : 'Вирішена'}
                  </span>
                  <p className="text-xs text-[#8892b0] mt-1">
                    {new Date(ticket.created_at || Date.now()).toLocaleDateString('uk-UA')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 