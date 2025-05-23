import React, { useState, useEffect } from 'react';
// Можливо, тут будуть потрібні іконки пізніше, поки що залишаю коментар
// import { ComputerDesktopIcon, WrenchScrewdriverIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Software = () => {
  const [workstations, setWorkstations] = useState([]);
  const [selectedWorkstationId, setSelectedWorkstationId] = useState('');
  const [installedSoftware, setInstalledSoftware] = useState([]);
  const [loadingWorkstations, setLoadingWorkstations] = useState(true);
  const [loadingSoftware, setLoadingSoftware] = useState(false);
  const [errorWorkstations, setErrorWorkstations] = useState(null);
  const [errorSoftware, setErrorSoftware] = useState(null);

  // Fetch list of all workstations for the select dropdown
  useEffect(() => {
    setLoadingWorkstations(true);
    fetch('/api/workstations')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setWorkstations(data);
        setLoadingWorkstations(false);
      })
      .catch(error => {
        setErrorWorkstations(error.message);
        setLoadingWorkstations(false);
      });
  }, []); // Empty dependency array means this runs once on mount

  // Fetch installed software for the selected workstation
  useEffect(() => {
    if (!selectedWorkstationId) {
      setInstalledSoftware([]); // Clear list if no workstation is selected
      return;
    }

    setLoadingSoftware(true);
    // NOTE: This endpoint /api/workstations/:id/software needs to be implemented on the backend
    fetch(`/api/workstations/${selectedWorkstationId}/software`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setInstalledSoftware(data);
        setLoadingSoftware(false);
      })
      .catch(error => {
        setErrorSoftware(error.message);
        setLoadingSoftware(false);
      });

  }, [selectedWorkstationId]); // Rerun when selectedWorkstationId changes

  const handleWorkstationSelect = (event) => {
    setSelectedWorkstationId(event.target.value);
  };

  // Placeholder functions for future functionality
  const handleAddSoftware = () => {
    console.log('Add Software clicked');
    // TODO: Implement modal/form to add software to selectedWorkstationId
  };

  const handleEditInstalledSoftware = (softwareId) => {
    console.log(`Edit installed software ${softwareId}`);
    // TODO: Implement modal/form to edit details of installed software
  };

  const handleDeleteInstalledSoftware = (softwareId) => {
    console.log(`Delete installed software ${softwareId}`);
    // TODO: Implement delete logic (API call)
  };

  if (loadingWorkstations) {
    return <div className="p-6 text-white">Завантаження...</div>;
  }

  if (errorWorkstations) {
    return <div className="p-6 text-red-500">Помилка: {errorWorkstations}</div>;
  }

  return (
    <div className="p-6 flex flex-col h-full bg-dark-bg text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Програмне забезпечення</h1>
        {/* Кнопка "Оберіть АРМ" для скидання вибору або переходу до вибору */}
        {selectedWorkstationId && (
           <button
             onClick={() => setSelectedWorkstationId('')}
             className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
           >
             Змінити АРМ
           </button>
        )}
      </div>

      {/* Workstation Select */}
      {!selectedWorkstationId && (
        <div className="mb-6">
          <label htmlFor="workstation-select" className="block text-dark-textSecondary mb-2">Оберіть АРМ:</label>
          <select
            id="workstation-select"
            className="bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedWorkstationId}
            onChange={handleWorkstationSelect}
            disabled={loadingWorkstations}
          >
            <option value="">-- Оберіть АРМ --</option>
            {/* Опції завантаження/помилки для випадаючого списку */}
            {loadingWorkstations && <option value="" disabled>Завантаження АРМ...</option>}
            {errorWorkstations && <option value="" disabled>Помилка завантаження АРМ</option>}
            {/* Список АРМів */}
            {workstations.map(ws => (
              <option key={ws.id} value={ws.id}>
                {ws.inventory_number} - {ws.ip_address}
              </option>
            ))}
          </select>
          {errorWorkstations && <p className="text-red-500 mt-2">Помилка: {errorWorkstations}</p>}
        </div>
      )}


      {selectedWorkstationId && (
        <div className="bg-dark-card rounded-lg shadow-card flex flex-col flex-1 overflow-hidden">
          <div className="p-4 border-b border-dark-border flex-shrink-0 flex justify-between items-center">
             <h2 className="text-xl font-bold text-white">
               ПЗ на АРМ: {workstations.find(ws => ws.id == selectedWorkstationId)?.inventory_number}
             </h2>
             <button
               onClick={handleAddSoftware}
               className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
             >
               Додати ПЗ на це АРМ
             </button>
          </div>

          {/* Відображення стану завантаження, помилки або порожнього списку ПЗ */}
          {loadingSoftware ? (
            <div className="p-6 text-white">Завантаження ПЗ...</div>
          ) : errorSoftware ? (
            <div className="p-6 text-red-500">Помилка завантаження ПЗ: {errorSoftware}</div>
          ) : installedSoftware.length === 0 ? (
            <div className="p-6 text-dark-textSecondary">На цьому АРМ немає встановленого ПЗ.</div>
          ) : (
            // Таблиця встановленого ПЗ
            <div className="relative overflow-y-auto flex-1">
              <table className="table-auto w-full">
                <thead className="sticky top-0 bg-dark-card z-10">
                  <tr className="border-b border-dark-border">
                    <th className="px-4 py-2 text-left text-white" style={{ width: '30%' }}>Назва ПЗ</th>
                    <th className="px-4 py-2 text-left text-white" style={{ width: '15%' }}>Версія</th>
                    <th className="px-4 py-2 text-left text-white" style={{ width: '20%' }}>Дата встановлення</th>
                    <th className="px-4 py-2 text-left text-white" style={{ width: '20%' }}>Виробник</th>
                    {/* Можна додати інші колонки, якщо дані будуть доступні через API */}
                    {/* <th className="px-4 py-2 text-left" style={{ width: '10%' }}>Ліцензія</th> */}
                    {/* <th className="px-4 py-2 text-left" style={{ width: '10%' }}>Ключ продукту</th> */}
                    <th className="px-4 py-2 text-left text-white" style={{ width: '15%' }}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Рядки таблиці для кожного встановленого ПЗ */}
                  {installedSoftware.map((sw) => (
                    <tr key={sw.id} className="border-b border-dark-border hover:bg-dark-bg transition-colors duration-200">
                      <td className="py-3 px-4 text-white">{sw.name}</td>
                      <td className="py-3 px-4 text-white">{sw.version}</td>
                      <td className="py-3 px-4 text-white">{sw.installed_date}</td>
                      <td className="py-3 px-4 text-white">{sw.manufacturer || '-'}</td> {/* Виробник опціонально */}
                      {/* <td className="py-3 px-4 text-white">{sw.license_type || '-'}</td> */}
                      {/* <td className="py-3 px-4 text-white">{sw.product_key || '-'}</td> */}
                      <td className="py-3 px-4 flex items-center space-x-2">
                         {/* Кнопки дій для встановленого ПЗ */}
                         <button onClick={() => handleEditInstalledSoftware(sw.id)} className="text-gray-400 hover:text-white">Редагувати</button>
                         <button onClick={() => handleDeleteInstalledSoftware(sw.id)} className="text-red-500 hover:text-red-600">Видалити</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Software;