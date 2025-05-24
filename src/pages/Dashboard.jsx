import React, { useState, useEffect } from 'react';
import { 
  ComputerDesktopIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
} from 'chart.js';
import { Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale
);

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [workstations, setWorkstations] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#d1d5db',
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: { color: '#374151', drawBorder: false },
        ticks: { color: '#9ca3af', font: { family: 'Inter' } }
      },
      y: {
        grid: { color: '#374151', drawBorder: false },
        ticks: { color: '#9ca3af', font: { family: 'Inter' } }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#d1d5db',
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wsRes, ticketsRes, repairsRes, usersRes, deptRes] = await Promise.all([
          fetch('/api/workstations'),
          fetch('/api/tickets'),
          fetch('/api/repairs'),
          fetch('/api/users'),
          fetch('/api/departments')
        ]);

        const [wsData, ticketsData, repairsData, usersData, deptData] = await Promise.all([
          wsRes.json(),
          ticketsRes.json(),
          repairsRes.json(),
          usersRes.json(),
          deptRes.json()
        ]);

        setWorkstations(wsData);
        setTickets(ticketsData);
        setRepairs(repairsData);
        setUsers(usersData);
        setDepartments(deptData);

        // Підрахунок статистики
        const totalWorkstations = wsData.length;
        const activeUsers = usersData.filter(u => u.role === 'user').length;
        const openTickets = ticketsData.filter(t => t.status === 'open').length;
        const inProgressRepairs = repairsData.filter(r => r.status === 'in_progress').length;

        setStats([
          {
            title: 'Всього АРМ',
            value: totalWorkstations,
            change: '+12%',
            changeType: 'increase',
            color: 'blue',
            icon: ComputerDesktopIcon,
            bgGradient: 'from-blue-500 to-blue-600'
          },
          {
            title: 'Активні користувачі',
            value: activeUsers,
            change: '+5%',
            changeType: 'increase',
            color: 'green',
            icon: UserGroupIcon,
            bgGradient: 'from-green-500 to-green-600'
          },
          {
            title: 'На ремонті',
            value: inProgressRepairs,
            change: '-2%',
            changeType: 'decrease',
            color: 'red',
            icon: WrenchScrewdriverIcon,
            bgGradient: 'from-red-500 to-red-600'
          },
          {
            title: 'Відкриті заявки',
            value: openTickets,
            change: '+8%',
            changeType: 'increase',
            color: 'yellow',
            icon: ClipboardDocumentListIcon,
            bgGradient: 'from-yellow-500 to-yellow-600'
          }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Підготовка даних для діаграм
  const osData = {
    labels: [...new Set(workstations.map(w => w.os_name))],
    datasets: [{
      label: 'Кількість АРМ',
      data: [...new Set(workstations.map(w => w.os_name))].map(os => 
        workstations.filter(w => w.os_name === os).length
      ),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(236, 72, 153, 1)'
      ],
      borderWidth: 2
    }]
  };

  const grifData = {
    labels: [...new Set(workstations.map(w => w.grif))],
    datasets: [{
      label: 'За грифом',
      data: [...new Set(workstations.map(w => w.grif))].map(grif => 
        workstations.filter(w => w.grif === grif).length
      ),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const departmentData = {
    labels: departments.map(d => d.name),
    datasets: [{
      label: 'Кількість АРМ',
      data: departments.map(dept => 
        workstations.filter(w => w.department_id === dept.id).length
      ),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      borderRadius: 4
    }]
  };

  const ticketTrendsData = {
    labels: ['Січ', 'Лют', 'Мар', 'Кві', 'Тра', 'Чер'],
    datasets: [
      {
        label: 'Нові заявки',
        data: [12, 19, 15, 23, 18, 25],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Виконані заявки',
        data: [8, 15, 12, 20, 16, 22],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Завантаження даних...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Панель управління АРМ</h1>
        <p className="text-gray-400">Загальний огляд системи обліку робочих станцій</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card group cursor-pointer relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-5 rounded-lg group-hover:opacity-10 transition-opacity`}></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.bgGradient}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-400 ml-2">від минулого місяця</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* OS Distribution */}
        <div className="chart-container">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-5 h-5 text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Розподіл за ОС</h3>
          </div>
          <div className="h-64">
            <Bar data={osData} options={chartOptions} />
          </div>
        </div>

        {/* Security Classification */}
        <div className="chart-container">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="w-5 h-5 text-yellow-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Розподіл за грифом</h3>
          </div>
          <div className="h-64">
            <Doughnut data={grifData} options={pieOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Distribution */}
        <div className="chart-container">
          <div className="flex items-center mb-4">
            <ChartPieIcon className="w-5 h-5 text-green-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">АРМ за відділами</h3>
          </div>
          <div className="h-64">
            <Bar data={departmentData} options={chartOptions} />
          </div>
        </div>

        {/* Ticket Trends */}
        <div className="chart-container">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Динаміка заявок</h3>
          </div>
          <div className="h-64">
            <Line data={ticketTrendsData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Останні заявки</h3>
          <div className="space-y-3">
            {tickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    ticket.priority === 'critical' ? 'bg-red-400' :
                    ticket.priority === 'high' ? 'bg-orange-400' :
                    ticket.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                  <div>
                    <p className="text-white text-sm font-medium">TK-{String(ticket.id).padStart(3, '0')}</p>
                    <p className="text-gray-400 text-xs">{ticket.description?.substring(0, 30)}...</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                  ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Стан системи</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Працюючі АРМ</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-700 rounded-full mr-3">
                  <div className="w-20 h-2 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-green-400 text-sm font-medium">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">На обслуговуванні</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-700 rounded-full mr-3">
                  <div className="w-3 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <span className="text-yellow-400 text-sm font-medium">12%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Потребують ремонту</span>
              <div className="flex items-center">
                <div className="w-24 h-2 bg-gray-700 rounded-full mr-3">
                  <div className="w-1 h-2 bg-red-400 rounded-full"></div>
                </div>
                <span className="text-red-400 text-sm font-medium">3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 