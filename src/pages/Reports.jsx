import React, { useState, useEffect } from 'react';
import { 
  DocumentArrowDownIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  TicketIcon,
  CubeIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';

const Reports = () => {
  const {
    workstations,
    tickets,
    repairs,
    allSoftware,
    users,
    departments,
    loading,
    error
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedWorkstation, setSelectedWorkstation] = useState('all');
  const [reportType, setReportType] = useState('workstations');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    calculateStats();
    prepareData();
  }, [workstations, tickets, repairs, allSoftware, dateRange, reportType]);

  const calculateStats = () => {
    let currentStats = {};

    switch (reportType) {
      case 'workstations':
        currentStats = {
          total: workstations.length,
          byGrif: workstations.reduce((acc, ws) => {
            acc[ws.grif] = (acc[ws.grif] || 0) + 1;
            return acc;
          }, {}),
          byStatus: workstations.reduce((acc, ws) => {
            acc[ws.status] = (acc[ws.status] || 0) + 1;
            return acc;
          }, {}),
          byType: workstations.reduce((acc, ws) => {
            acc[ws.type] = (acc[ws.type] || 0) + 1;
            return acc;
          }, {})
        };
        break;

      case 'tickets':
        currentStats = {
          total: tickets.length,
          byStatus: tickets.reduce((acc, ticket) => {
            acc[ticket.status] = (acc[ticket.status] || 0) + 1;
            return acc;
          }, {}),
          byPriority: tickets.reduce((acc, ticket) => {
            acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
            return acc;
          }, {}),
          byType: tickets.reduce((acc, ticket) => {
            acc[ticket.type] = (acc[ticket.type] || 0) + 1;
            return acc;
          }, {}),
          averageResolutionTime: calculateAverageResolutionTime(tickets)
        };
        break;

      case 'repairs':
        currentStats = {
          total: repairs.length,
          byStatus: repairs.reduce((acc, repair) => {
            acc[repair.status] = (acc[repair.status] || 0) + 1;
            return acc;
          }, {}),
          byType: repairs.reduce((acc, repair) => {
            acc[repair.repair_type] = (acc[repair.repair_type] || 0) + 1;
            return acc;
          }, {}),
          totalCost: repairs.reduce((acc, repair) => acc + (repair.cost || 0), 0),
          averageRepairTime: calculateAverageRepairTime(repairs)
        };
        break;

      default:
        break;
    }

    setStats(currentStats);
  };

  const calculateAverageResolutionTime = (tickets) => {
    const resolvedTickets = tickets.filter(t => t.resolution_date);
    if (!resolvedTickets.length) return 0;

    const totalTime = resolvedTickets.reduce((acc, ticket) => {
      const created = new Date(ticket.created_at);
      const resolved = new Date(ticket.resolution_date);
      return acc + (resolved - created);
    }, 0);

    return Math.round(totalTime / resolvedTickets.length / (1000 * 60 * 60 * 24)); // в днях
  };

  const calculateAverageRepairTime = (repairs) => {
    const completedRepairs = repairs.filter(r => r.completion_date);
    if (!completedRepairs.length) return 0;

    const totalTime = completedRepairs.reduce((acc, repair) => {
      const started = new Date(repair.repair_date);
      const completed = new Date(repair.completion_date);
      return acc + (completed - started);
    }, 0);

    return Math.round(totalTime / completedRepairs.length / (1000 * 60 * 60 * 24)); // в днях
  };

  const prepareData = () => {
    let result = [];

    switch (reportType) {
      case 'workstations':
        result = workstations.map(ws => {
          const responsible = users.find(u => u.id === ws.responsible_id);
          return {
            'Інвентарний номер': ws.inventory_number,
            'IP адреса': ws.ip_address || '-',
            'MAC адреса': ws.mac_address || '-',
            'Гриф': ws.grif,
            'ОС': ws.os_name,
            'Відповідальний': responsible?.full_name || '-',
            'Контакти': ws.contacts || '-',
            'Процесор': ws.processor || '-',
            'RAM (GB)': ws.ram || '-',
            'Сховище': ws.storage || '-',
            'Монітор': ws.monitor || '-',
            'Мережа': ws.network || '-',
            'Тип': ws.type || '-',
            'Статус': ws.status || '-',
            'Примітки': ws.notes || '-',
            'Дата реєстрації': new Date(ws.registration_date).toLocaleDateString('uk-UA')
          };
        });
        break;

      case 'tickets':
        result = tickets.map(ticket => {
          const workstation = workstations.find(w => w.id === ticket.workstation_id);
          const user = users.find(u => u.id === ticket.user_id);
          const assignedTo = users.find(u => u.id === ticket.assigned_to);
          return {
            'Номер': ticket.id,
            'АРМ': workstation?.inventory_number || '-',
            'Заголовок': ticket.title,
            'Тип': ticket.type,
            'Опис': ticket.description,
            'Статус': ticket.status,
            'Пріоритет': ticket.priority,
            'Користувач': user?.full_name || '-',
            'Виконавець': assignedTo?.full_name || '-',
            'Примітки': ticket.resolution_notes || '-',
            'Створено': new Date(ticket.created_at).toLocaleDateString('uk-UA'),
            'Вирішено': ticket.resolution_date ? new Date(ticket.resolution_date).toLocaleDateString('uk-UA') : '-'
          };
        });
        break;

      case 'repairs':
        result = repairs.map(repair => {
          const workstation = workstations.find(w => w.id === repair.workstation_id);
          const technician = users.find(u => u.id === repair.technician_id);
          return {
            'Номер': repair.id,
            'АРМ': workstation?.inventory_number || '-',
            'Тип ремонту': repair.repair_type,
            'Опис': repair.description,
            'Статус': repair.status,
            'Технік': technician?.full_name || '-',
            'Діагноз': repair.diagnosis || '-',
            'Вартість': repair.cost ? `${repair.cost} грн` : '-',
            'Дата початку': new Date(repair.repair_date).toLocaleDateString('uk-UA'),
            'Дата завершення': repair.completion_date ? new Date(repair.completion_date).toLocaleDateString('uk-UA') : '-'
          };
        });
        break;

      default:
        break;
    }

    setData(result);
  };

  const downloadExcel = () => {
    if (!data.length) return;

    try {
      // Створюємо новий робочий зошит
      const wb = XLSX.utils.book_new();

      // Перетворюємо дані в формат для Excel
      const ws = XLSX.utils.json_to_sheet(data);

      // Додаємо лист до робочого зошита
      XLSX.utils.book_append_sheet(wb, ws, reportType);

      // Зберігаємо файл
      const fileName = `звіт_${reportType}_${new Date().toLocaleDateString('uk-UA')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Помилка при створенні Excel файлу:', err);
      alert('Помилка при створенні Excel файлу');
    }
  };

  const reportTypes = [
    {
      id: 'summary',
      name: 'Загальний звіт',
      description: 'Огляд всіх систем та статистики',
      icon: ChartBarIcon,
      color: 'bg-blue-500'
    },
    {
      id: 'workstations',
      name: 'Звіт по АРМ',
      description: 'Детальна інформація про робочі станції',
      icon: ComputerDesktopIcon,
      color: 'bg-green-500'
    },
    {
      id: 'tickets',
      name: 'Звіт по заявкам',
      description: 'Аналіз заявок та їх вирішення',
      icon: TicketIcon,
      color: 'bg-yellow-500'
    },
    {
      id: 'repairs',
      name: 'Звіт по ремонтам',
      description: 'Статистика ремонтних робіт',
      icon: WrenchScrewdriverIcon,
      color: 'bg-red-500'
    },
    {
      id: 'software',
      name: 'Звіт по ПЗ',
      description: 'Аналіз програмного забезпечення',
      icon: CubeIcon,
      color: 'bg-purple-500'
    },
    {
      id: 'departments',
      name: 'Звіт по підрозділам',
      description: 'Статистика по відділам',
      icon: BuildingOfficeIcon,
      color: 'bg-indigo-500'
    }
  ];

  const generateReport = async (type, format = 'pdf') => {
    const reportData = getReportData(type);
    
    if (format === 'pdf') {
      generatePDF(reportData, type);
    } else if (format === 'excel') {
      generateExcel(reportData, type);
    } else if (format === 'csv') {
      generateCSV(reportData, type);
    }
  };

  const getReportData = (type) => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    switch (type) {
      case 'summary':
        return {
          title: 'Загальний звіт',
          period: `${dateRange.start} - ${dateRange.end}`,
          stats: stats,
          charts: getSummaryCharts(),
          details: getSummaryDetails()
        };
      
      case 'workstations':
        return {
          title: 'Звіт по АРМ',
          period: `${dateRange.start} - ${dateRange.end}`,
          workstations: getWorkstationDetails(),
          summary: getWorkstationSummary()
        };
      
      case 'tickets':
        return {
          title: 'Звіт по заявкам',
          period: `${dateRange.start} - ${dateRange.end}`,
          tickets: getTicketDetails(),
          analysis: getTicketAnalysis()
        };
      
      case 'repairs':
        return {
          title: 'Звіт по ремонтам',
          period: `${dateRange.start} - ${dateRange.end}`,
          repairs: getRepairDetails(),
          costs: getRepairCosts()
        };
      
      case 'software':
        return {
          title: 'Звіт по ПЗ',
          period: `${dateRange.start} - ${dateRange.end}`,
          software: getSoftwareDetails(),
          licenses: getLicenseAnalysis()
        };
      
      case 'departments':
        return {
          title: 'Звіт по підрозділам',
          period: `${dateRange.start} - ${dateRange.end}`,
          departments: getDepartmentDetails(),
          comparison: getDepartmentComparison()
        };
      
      default:
        return {};
    }
  };

  const getSummaryCharts = () => {
    return {
      ticketsByStatus: getTicketsByStatus(),
      repairsByMonth: getRepairsByMonth(),
      topIssues: getTopIssues(),
      departmentActivity: getDepartmentActivity()
    };
  };

  const getTicketsByStatus = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const filteredTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_at);
      return ticketDate >= startDate && ticketDate <= endDate;
    });

    return {
      open: filteredTickets.filter(t => t.status === 'open').length,
      in_progress: filteredTickets.filter(t => t.status === 'in_progress').length,
      resolved: filteredTickets.filter(t => t.status === 'resolved').length,
      closed: filteredTickets.filter(t => t.status === 'closed').length
    };
  };

  const getTopIssues = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const filteredTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_at);
      return ticketDate >= startDate && ticketDate <= endDate;
    });

    const issueCount = {};
    filteredTickets.forEach(ticket => {
      const type = ticket.type || 'other';
      issueCount[type] = (issueCount[type] || 0) + 1;
    });

    return Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  };

  const generatePDF = (data, type) => {
    // Створюємо HTML для PDF
    const htmlContent = generateHTMLReport(data, type);
    
    // Створюємо новий документ
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #64ffda; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #0f0f23; }
            .period { font-size: 14px; color: #666; margin-top: 5px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
            .stat-card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center; }
            .stat-value { font-size: 32px; font-weight: bold; color: #64ffda; }
            .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
            .section { margin: 30px 0; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #0f0f23; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    
    // Запускаємо друк
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const generateHTMLReport = (data, type) => {
    let content = `
      <div class="header">
        <div class="title">${data.title}</div>
        <div class="period">Період: ${data.period}</div>
        <div class="period">Згенеровано: ${new Date().toLocaleString('uk-UA')}</div>
      </div>
    `;

    if (type === 'summary') {
      content += `
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.stats.workstations.total}</div>
            <div class="stat-label">Всього АРМ</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.stats.tickets.total}</div>
            <div class="stat-label">Заявок</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.stats.repairs.total}</div>
            <div class="stat-label">Ремонтів</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">₴${data.stats.repairs.cost.toFixed(2)}</div>
            <div class="stat-label">Витрати на ремонт</div>
          </div>
        </div>
      `;
    }

    // Додаємо детальні таблиці залежно від типу звіту
    if (data.workstations) {
      content += generateWorkstationTable(data.workstations);
    }
    if (data.tickets) {
      content += generateTicketTable(data.tickets);
    }
    if (data.repairs) {
      content += generateRepairTable(data.repairs);
    }

    content += `
      <div class="footer">
        <p>Звіт згенеровано системою управління IT-підтримкою</p>
        <p>© ${new Date().getFullYear()} IT Support System</p>
      </div>
    `;

    return content;
  };

  const generateWorkstationTable = (workstations) => {
    return `
      <div class="section">
        <div class="section-title">Робочі станції</div>
        <table>
          <thead>
            <tr>
              <th>Інв. номер</th>
              <th>IP адреса</th>
              <th>Підрозділ</th>
              <th>Відповідальний</th>
              <th>ОС</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            ${workstations.map(ws => {
              const department = departments.find(d => d.id === ws.department_id);
              const responsible = users.find(u => u.id === ws.responsible_id);
              return `
                <tr>
                  <td>${ws.inventory_number}</td>
                  <td>${ws.ip_address || '-'}</td>
                  <td>${department?.name || '-'}</td>
                  <td>${responsible?.full_name || '-'}</td>
                  <td>${ws.os_name}</td>
                  <td>${ws.status || 'Активний'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const generateTicketTable = (tickets) => {
    return `
      <div class="section">
        <div class="section-title">Заявки</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Назва</th>
              <th>АРМ</th>
              <th>Пріоритет</th>
              <th>Статус</th>
              <th>Дата створення</th>
            </tr>
          </thead>
          <tbody>
            ${tickets.map(ticket => {
              const workstation = workstations.find(w => w.id === ticket.workstation_id);
              return `
                <tr>
                  <td>TK-${String(ticket.id).padStart(3, '0')}</td>
                  <td>${ticket.title || ticket.description}</td>
                  <td>${workstation?.inventory_number || '-'}</td>
                  <td>${ticket.priority}</td>
                  <td>${ticket.status}</td>
                  <td>${new Date(ticket.created_at).toLocaleDateString('uk-UA')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const generateRepairTable = (repairs) => {
    return `
      <div class="section">
        <div class="section-title">Ремонти</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>АРМ</th>
              <th>Опис</th>
              <th>Технік</th>
              <th>Статус</th>
              <th>Вартість</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            ${repairs.map(repair => {
              const workstation = workstations.find(w => w.id === repair.workstation_id);
              const technician = users.find(u => u.id === repair.technician_id);
              return `
                <tr>
                  <td>RP-${String(repair.id).padStart(3, '0')}</td>
                  <td>${workstation?.inventory_number || '-'}</td>
                  <td>${repair.description}</td>
                  <td>${technician?.full_name || '-'}</td>
                  <td>${repair.status}</td>
                  <td>₴${parseFloat(repair.cost || 0).toFixed(2)}</td>
                  <td>${new Date(repair.repair_date).toLocaleDateString('uk-UA')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  };

  const generateExcel = (data, type) => {
    // Простий CSV експорт (можна розширити до справжнього Excel)
    generateCSV(data, type);
  };

  const generateCSV = (data, type) => {
    let csvContent = `${data.title}\nПеріод: ${data.period}\n\n`;
    
    if (type === 'workstations' && data.workstations) {
      csvContent += "Інв. номер,IP адреса,Підрозділ,Відповідальний,ОС\n";
      data.workstations.forEach(ws => {
        const department = departments.find(d => d.id === ws.department_id);
        const responsible = users.find(u => u.id === ws.responsible_id);
        csvContent += `"${ws.inventory_number}","${ws.ip_address || ''}","${department?.name || ''}","${responsible?.full_name || ''}","${ws.os_name}"\n`;
      });
    }

    // Створюємо та завантажуємо файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWorkstationDetails = () => {
    let filtered = workstations;
    
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(ws => ws.department_id === parseInt(selectedDepartment));
    }
    
    return filtered;
  };

  const getTicketDetails = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    let filtered = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_at);
      return ticketDate >= startDate && ticketDate <= endDate;
    });
    
    if (selectedWorkstation !== 'all') {
      filtered = filtered.filter(t => t.workstation_id === parseInt(selectedWorkstation));
    }
    
    return filtered;
  };

  const getRepairDetails = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    let filtered = repairs.filter(repair => {
      const repairDate = new Date(repair.created_at);
      return repairDate >= startDate && repairDate <= endDate;
    });
    
    if (selectedWorkstation !== 'all') {
      filtered = filtered.filter(r => r.workstation_id === parseInt(selectedWorkstation));
    }
    
    return filtered;
  };

  const previewReport = (type) => {
    const data = getReportData(type);
    setPreviewData(data);
    setShowPreview(true);
  };

  const renderTable = () => {
    if (!data.length) {
      return (
        <div className="text-center py-8 text-gray-500">
          Немає даних для відображення
        </div>
      );
    }

    const headers = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-800">
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    const formatNumber = (num) => new Intl.NumberFormat('uk-UA').format(num);

    const renderStatItem = (title, value) => (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      </div>
    );

    const renderDistribution = (data, title) => (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-gray-300">{key}</span>
              <span className="text-white font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {reportType === 'workstations' && (
          <>
            {renderStatItem('Всього АРМ', formatNumber(stats.total))}
            {renderDistribution(stats.byGrif, 'Розподіл за грифом')}
            {renderDistribution(stats.byStatus, 'Розподіл за статусом')}
            {renderDistribution(stats.byType, 'Розподіл за типом')}
          </>
        )}

        {reportType === 'tickets' && (
          <>
            {renderStatItem('Всього заявок', formatNumber(stats.total))}
            {renderStatItem('Середній час вирішення', `${formatNumber(stats.averageResolutionTime)} днів`)}
            {renderDistribution(stats.byStatus, 'Розподіл за статусом')}
            {renderDistribution(stats.byPriority, 'Розподіл за пріоритетом')}
            {renderDistribution(stats.byType, 'Розподіл за типом')}
          </>
        )}

        {reportType === 'repairs' && (
          <>
            {renderStatItem('Всього ремонтів', formatNumber(stats.total))}
            {renderStatItem('Загальна вартість', `${formatNumber(stats.totalCost)} грн`)}
            {renderStatItem('Середній час ремонту', `${formatNumber(stats.averageRepairTime)} днів`)}
            {renderDistribution(stats.byStatus, 'Розподіл за статусом')}
            {renderDistribution(stats.byType, 'Розподіл за типом')}
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Завантаження даних для звітів...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 w-full sm:w-auto"
          >
            <option value="workstations">АРМ</option>
            <option value="tickets">Заявки</option>
            <option value="repairs">Ремонти</option>
          </select>
          
          <button
            onClick={downloadExcel}
            disabled={loading || !data.length}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="h-5 w-5" />
            <span>Завантажити Excel</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Завантаження даних...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Помилка завантаження даних: {error}</p>
        </div>
      ) : (
        <>
          {renderStats()}
          {renderTable()}
        </>
      )}
    </div>
  );
};

export default Reports; 