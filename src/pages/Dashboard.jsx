import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  ComputerDesktopIcon,
  UsersIcon,
  TicketIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CubeIcon
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
  const { workstations, users, tickets, repairs, allSoftware, loading, error } = useApp();
  const [stats, setStats] = useState([]);
  const navigate = useNavigate();

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
          link: '/workstations',
        },
        {
          title: 'Активні користувачі',
          value: activeUsers,
          icon: UsersIcon,
          change: '+5%',
          bgGradient: 'from-green-500 to-emerald-400',
          link: '/users',
        },
        {
          title: 'На ремонті',
          value: ongoingRepairs,
          icon: WrenchScrewdriverIcon,
          change: '-2%',
          bgGradient: 'from-red-500 to-pink-400',
          link: '/repairs',
        },
        {
          title: 'Відкриті заявки',
          value: openTickets,
          icon: TicketIcon,
          change: '+8%',
          bgGradient: 'from-purple-500 to-violet-400',
          link: '/tickets',
        }
      ]);
    }
  }, [workstations, users, tickets, repairs]);

  // Дані для графіків
  const osData = {
    labels: ['Win 11', 'Win 10', 'Linux'],
    datasets: [{
      label: 'Кількість АРМ',
      data: [
        workstations?.filter(w => w.os_name?.includes('Windows 11')).length || 0,
        workstations?.filter(w => w.os_name?.includes('Windows 10')).length || 0,
        workstations?.filter(w => w.os_name?.includes('Ubuntu') || w.os_name?.includes('Linux')).length || 0,
      ],
      backgroundColor: ['#eab308', '#3b82f6', '#f97316'],
      borderRadius: 8,
    }]
  };

  const ticketTrendsData = {
    labels: ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв'],
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

  // Додаємо дані для ПЗ діаграми
  const softwareData = {
    labels: ['Microsoft Office', 'Adobe', 'Безкоштовне ПЗ', 'Інше'],
    datasets: [{
      data: [
        allSoftware?.filter(s => s.name?.includes('Microsoft Office')).length || 0,
        allSoftware?.filter(s => s.name?.includes('Adobe')).length || 0,
        allSoftware?.filter(s => s.license_key === 'FREE').length || 0,
        allSoftware?.filter(s => !s.name?.includes('Microsoft Office') && !s.name?.includes('Adobe') && s.license_key !== 'FREE').length || 0,
      ],
      backgroundColor: ['#3b82f6', '#e11d48', '#10b981', '#8b5cf6'],
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
        display: true,
        grid: {
          color: 'rgba(136,146,176,0.15)',
          drawBorder: false,
        },
        ticks: {
          color: '#8892b0',
          font: { size: 11 }
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(136,146,176,0.15)',
          drawBorder: false,
        },
        ticks: {
          color: '#8892b0',
          font: { size: 11 }
        }
      }
    }
  };

  // Опції для стовпчастої діаграми з легендою збоку
  const barChartOptions = {
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
        display: true,
        grid: {
          color: 'rgba(136,146,176,0.15)',
          drawBorder: false,
        },
        ticks: {
          color: '#8892b0',
          font: { size: 11 }
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(136,146,176,0.15)',
          drawBorder: false,
        },
        ticks: {
          color: '#8892b0',
          font: { size: 11 },
          stepSize: (workstations && workstations.length > 15) ? 5 : 1,
        },
        beginAtZero: true
      }
    }
  };

  // Опції для кругових діаграм з легендою знизу
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#8892b0',
          usePointStyle: true,
          font: {
            size: 11
          },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        titleColor: '#64ffda',
        bodyColor: '#ffffff',
        borderColor: '#64ffda',
        borderWidth: 1,
      }
    },
    cutout: '60%'
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
          <div
            key={index}
            className="stat-card group cursor-pointer relative"
            onClick={() => stat.link && navigate(stat.link)}
            tabIndex={0}
            role="button"
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && stat.link && navigate(stat.link)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-5 rounded-xl group-hover:opacity-10 transition-opacity`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-[#8892b0]">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} bg-opacity-20 border-2 border-white border-opacity-30`}>
                  <stat.icon className="h-6 w-6 text-white drop-shadow-lg" style={{filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))'}} />
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
        {/* Операційні системи */}
        <div className="dark-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Операційні системи</h3>
            <ChartBarIcon className="h-5 w-5 text-[#64ffda]" />
          </div>
          <div className="h-48">
            <Bar data={osData} options={barChartOptions} />
          </div>
          {/* Кастомна легенда для ОС під діаграмою */}
          <div className="flex flex-row gap-4 items-center justify-end mt-2">
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{background:'#eab308'}}></span><span className="text-xs text-[#eab308]">Win 11</span></div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{background:'#3b82f6'}}></span><span className="text-xs text-[#3b82f6]">Win 10</span></div>
            <div className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full" style={{background:'#f97316'}}></span><span className="text-xs text-[#f97316]">Linux</span></div>
          </div>
        </div>

        {/* Заявки за місяцями */}
        <div className="dark-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Заявки за місяцями</h3>
            <TicketIcon className="h-5 w-5 text-[#64ffda]" />
          </div>
          <div className="h-48">
            <Line data={ticketTrendsData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: { display: false },
              }
            }} />
          </div>
        </div>
      </div>

      {/* Нижній ряд */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Статистика (об'єднані діаграми) */}
        <div className="dark-card rounded-xl p-6 flex flex-row gap-8 items-center justify-center h-full">
          {/* Статистика ремонтів */}
          <div>
            <h4 className="text-base font-semibold text-[#64ffda] mb-3 text-center">Ремонти</h4>
            <div className="h-60 flex items-center justify-center">
              <div className="w-60 h-60">
                <Doughnut data={repairStatsData} options={doughnutOptions} />
              </div>
            </div>
          </div>
          {/* Статистика ПЗ */}
          <div>
            <h4 className="text-base font-semibold text-[#64ffda] mb-3 text-center">Заявки за місяцями</h4>
            <div className="h-60 flex items-center justify-center">
              <div className="w-60 h-60">
                <Doughnut data={softwareData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Останні заявки */}
        <div className="dark-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Останні заявки</h3>
            <TicketIcon className="h-5 w-5 text-[#64ffda]" />
          </div>
          <div className="space-y-4">
            {tickets?.slice(0, 3).map((ticket, index) => (
              <div key={ticket.id || index} className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f23] bg-opacity-50">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {ticket.status === 'open' && <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />}
                    {ticket.status === 'in_progress' && <ClockIcon className="h-5 w-5 text-yellow-400" />}
                    {ticket.status === 'resolved' && <CheckCircleIcon className="h-5 w-5 text-green-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{ticket.workstation_inventory_number || ticket.inventory_number || '—'}</p>
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