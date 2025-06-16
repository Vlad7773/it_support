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
    loading
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
  const [error, setError] = useState(null);

  // Статистика
  const [stats, setStats] = useState({
    workstations: { total: 0, active: 0, issues: 0 },
    tickets: { total: 0, open: 0, resolved: 0, critical: 0 },
    repairs: { total: 0, pending: 0, completed: 0, cost: 0 },
    software: { total: 0, licensed: 0, unlicensed: 0 }
  });

  useEffect(() => {
    calculateStats();
    prepareData();
  }, [workstations, tickets, repairs, allSoftware, dateRange, reportType]);

  const calculateStats = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    // Фільтруємо дані за датою
    const filteredTickets = tickets.filter(ticket => {
      const ticketDate = new Date(ticket.created_at);
      return ticketDate >= startDate && ticketDate <= endDate;
    });

    const filteredRepairs = repairs.filter(repair => {
      const repairDate = new Date(repair.created_at);
      return repairDate >= startDate && repairDate <= endDate;
    });

    // Статистика АРМ
    const workstationStats = {
      total: workstations.length,
      active: workstations.filter(ws => ws.status !== 'inactive').length,
      issues: workstations.filter(ws => {
        const hasOpenTickets = filteredTickets.some(t => t.workstation_id === ws.id && t.status === 'open');
        const hasPendingRepairs = filteredRepairs.some(r => r.workstation_id === ws.id && r.status === 'pending');
        return hasOpenTickets || hasPendingRepairs;
      }).length
    };

    // Статистика заявок
    const ticketStats = {
      total: filteredTickets.length,
      open: filteredTickets.filter(t => t.status === 'open').length,
      resolved: filteredTickets.filter(t => t.status === 'resolved').length,
      critical: filteredTickets.filter(t => t.priority === 'critical').length
    };

    // Статистика ремонтів
    const repairStats = {
      total: filteredRepairs.length,
      pending: filteredRepairs.filter(r => r.status === 'pending').length,
      completed: filteredRepairs.filter(r => r.status === 'completed').length,
      cost: filteredRepairs.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0)
    };

    // Статистика ПЗ
    const softwareStats = {
      total: allSoftware.length,
      licensed: allSoftware.filter(s => s.license_key && s.license_key.trim() !== '').length,
      unlicensed: allSoftware.filter(s => !s.license_key || s.license_key.trim() === '').length
    };

    setStats({
      workstations: workstationStats,
      tickets: ticketStats,
      repairs: repairStats,
      software: softwareStats
    });
  };

  const prepareData = () => {
    try {
      let result = [];

      switch (reportType) {
        case 'workstations':
          result = workstations.map(ws => ({
            'Інвентарний номер': ws.inventory_number,
            'Відділ': departments.find(d => d.id === ws.department_id)?.name,
            'Відповідальний': users.find(u => u.id === ws.responsible_id)?.full_name,
            'Тип': ws.type,
            'Гриф': ws.grif,
            'Контакти': ws.contacts,
            'Програмне забезпечення': ws.software?.map(s => s.name).join(', '),
            'Створено': new Date(ws.created_at).toLocaleString(),
            'Оновлено': new Date(ws.updated_at).toLocaleString()
          }));
          break;

        case 'repairs':
          result = repairs.map(repair => ({
            'АРМ': workstations.find(w => w.id === repair.workstation_id)?.inventory_number,
            'Опис проблеми': repair.description,
            'Вирішення': repair.solution,
            'Статус': repair.status,
            'Технік': users.find(u => u.id === repair.technician_id)?.full_name,
            'Дата створення': new Date(repair.created_at).toLocaleString(),
            'Дата оновлення': new Date(repair.updated_at).toLocaleString()
          }));
          break;

        case 'tickets':
          result = tickets.map(ticket => ({
            'АРМ': workstations.find(w => w.id === ticket.workstation_id)?.inventory_number,
            'Тема': ticket.title,
            'Опис': ticket.description,
            'Пріоритет': ticket.priority,
            'Статус': ticket.status,
            'Призначено': users.find(u => u.id === ticket.assigned_to)?.full_name,
            'Створив': users.find(u => u.id === ticket.created_by)?.full_name,
            'Дата створення': new Date(ticket.created_at).toLocaleString(),
            'Дата оновлення': new Date(ticket.updated_at).toLocaleString()
          }));
          break;

        case 'software':
          result = allSoftware.map(sw => ({
            'Назва': sw.name,
            'Версія': sw.version,
            'Тип ліцензії': sw.license_type,
            'Дата створення': new Date(sw.created_at).toLocaleString(),
            'Дата оновлення': new Date(sw.updated_at).toLocaleString()
          }));
          break;
      }

      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
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
    if (!data.length) return <p className="text-center text-gray-500 mt-4">Немає даних для відображення</p>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-dark-bg border border-dark-border">
          <thead>
            <tr>
              {Object.keys(data[0]).map(key => (
                <th key={key} className="px-6 py-3 border-b border-dark-border text-left text-xs font-medium text-dark-textSecondary uppercase tracking-wider">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-dark-bg' : 'bg-dark-bgSecondary'}>
                {Object.entries(item).map(([key, value]) => (
                  <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                    {value || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-white">Звіти та аналітика</h1>
          <p className="text-gray-400 mt-1">Генерація детальних звітів та статистичний аналіз</p>
        </div>
      </div>

      {/* Фільтри */}
      <div className="bg-dark-card rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Параметри звіту</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Період з</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Період до</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Підрозділ</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Всі підрозділи</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">АРМ</label>
            <select
              value={selectedWorkstation}
              onChange={(e) => setSelectedWorkstation(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Всі АРМ</option>
              {workstations.map(ws => (
                <option key={ws.id} value={ws.id}>{ws.inventory_number}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">АРМ</p>
              <p className="text-2xl font-bold text-white">{stats.workstations.total}</p>
              <p className="text-sm text-gray-400">
                {stats.workstations.issues} з проблемами
              </p>
            </div>
            <ComputerDesktopIcon className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-dark-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Заявки</p>
              <p className="text-2xl font-bold text-white">{stats.tickets.total}</p>
              <p className="text-sm text-gray-400">
                {stats.tickets.open} відкритих
              </p>
            </div>
            <TicketIcon className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-dark-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ремонти</p>
              <p className="text-2xl font-bold text-white">{stats.repairs.total}</p>
              <p className="text-sm text-gray-400">
                {stats.repairs.completed} завершено
              </p>
            </div>
            <WrenchScrewdriverIcon className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="bg-dark-card rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Витрати</p>
              <p className="text-2xl font-bold text-white">₴{stats.repairs.cost.toFixed(0)}</p>
              <p className="text-sm text-gray-400">
                на ремонти
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Типи звітів */}
      <div className="bg-dark-card rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Доступні звіти</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map(report => {
            const Icon = report.icon;
            return (
              <div key={report.id} className="border border-dark-border rounded-lg p-6 hover:border-primary-500 transition-colors">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${report.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{report.name}</h3>
                    <p className="text-gray-400 text-sm">{report.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => previewReport(report.id)}
                    className="flex-1 px-4 py-2 rounded-lg bg-dark-bg text-white hover:bg-dark-hover transition-colors flex items-center justify-center gap-2"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Переглянути
                  </button>
                  <button
                    onClick={() => generateReport(report.id, 'pdf')}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    PDF
                  </button>
                  <button
                    onClick={() => generateReport(report.id, 'csv')}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                  >
                    CSV
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Швидка аналітика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ проблем */}
        <div className="bg-dark-card rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Найчастіші проблеми</h3>
          <div className="space-y-3">
            {getTopIssues().map((issue, index) => (
              <div key={issue.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-white">{issue.type}</span>
                </div>
                <span className="text-gray-400">{issue.count} заявок</span>
              </div>
            ))}
          </div>
        </div>

        {/* Статус заявок */}
        <div className="bg-dark-card rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Розподіл заявок за статусом</h3>
          <div className="space-y-3">
            {Object.entries(getTicketsByStatus()).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'open' ? 'bg-blue-500' :
                    status === 'in_progress' ? 'bg-yellow-500' :
                    status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-white capitalize">{status}</span>
                </div>
                <span className="text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Модальне вікно перегляду */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{previewData.title}</h2>
              <button 
                onClick={() => setShowPreview(false)} 
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="text-gray-400 mb-6">
              Період: {previewData.period}
            </div>

            {/* Попередній перегляд залежно від типу */}
            {previewData.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-dark-bg rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{previewData.stats.workstations.total}</div>
                  <div className="text-gray-400 text-sm">АРМ</div>
                </div>
                <div className="bg-dark-bg rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{previewData.stats.tickets.total}</div>
                  <div className="text-gray-400 text-sm">Заявок</div>
                </div>
                <div className="bg-dark-bg rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{previewData.stats.repairs.total}</div>
                  <div className="text-gray-400 text-sm">Ремонтів</div>
                </div>
                <div className="bg-dark-bg rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">₴{previewData.stats.repairs.cost.toFixed(0)}</div>
                  <div className="text-gray-400 text-sm">Витрати</div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 rounded-lg bg-dark-bg text-white hover:bg-dark-hover transition-colors"
              >
                Закрити
              </button>
              <button
                onClick={() => {
                  const reportType = reportTypes.find(r => r.name === previewData.title)?.id || 'summary';
                  generateReport(reportType, 'pdf');
                }}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Завантажити PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-dark-text">Звіти</h1>
        <button
          onClick={downloadExcel}
          disabled={loading || !data.length}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          <FiDownload className="mr-2" />
          Завантажити Excel
        </button>
      </div>

      <div className="mb-6">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="w-full md:w-64 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="workstations">АРМ</option>
          <option value="repairs">Ремонти</option>
          <option value="tickets">Заявки</option>
          <option value="software">Програмне забезпечення</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        renderTable()
      )}
    </div>
  );
};

export default Reports; 