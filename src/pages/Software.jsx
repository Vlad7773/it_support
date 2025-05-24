import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext'; // Імпорт useApp

const Software = () => {
  const {

    workstations,
    loading: loadingWorkstationsFromContext,
    error: errorWorkstationsFromContext,
    selectedWorkstationSoftware, // Використовуємо з AppContext
    loadingSoftware: loadingSoftwareFromContext, // Використовуємо з AppContext
    errorSoftware: errorSoftwareFromContext, // Використовуємо з AppContext
    fetchSoftwareForWorkstation, // Функція для завантаження ПЗ для станції
    addSoftwareToWorkstation,    // Функція для додавання ПЗ до станції (заглушка)
    updateInstalledSoftware,     // Функція для оновлення встановленого ПЗ (заглушка)
    deleteInstalledSoftware      // Функція для видалення встановленого ПЗ (заглушка)
  } = useApp();

  const [selectedWorkstationId, setSelectedWorkstationId] = useState('');
  // Локальні стани для ПЗ більше не потрібні, вони керуються AppContext
  // const [installedSoftware, setInstalledSoftware] = useState([]);
  // const [loadingSoftware, setLoadingSoftware] = useState(false);
  // const [errorSoftware, setErrorSoftware] = useState(null);

  // Завантаження ПЗ для обраної станції
  useEffect(() => {
    if (!selectedWorkstationId) {
      // Можливо, очистити selectedWorkstationSoftware в AppContext, якщо потрібно
      return;
    }

    // Викликаємо функцію з AppContext
    fetchSoftwareForWorkstation(selectedWorkstationId);
  }, [selectedWorkstationId, fetchSoftwareForWorkstation]);

  const handleWorkstationSelect = (event) => {
    setSelectedWorkstationId(event.target.value);
  };

  const handleAddSoftware = async () => {
    // TODO: Реалізувати модальне вікно для введення даних нового ПЗ
    // const newSoftwareData = { name: 'New App', version: '1.0', installed_date: new Date().toISOString().split('T')[0], manufacturer: 'Some Corp' };
    // if (selectedWorkstationId && addSoftwareToWorkstation) {
    //   try {
    //     await addSoftwareToWorkstation(selectedWorkstationId, newSoftwareData);
    //     // AppContext повинен автоматично оновити selectedWorkstationSoftware
    //   } catch (err) {
    //     alert(`Помилка додавання ПЗ: ${err.message}`);
    //   }
    // }
    console.log('Add Software clicked for workstation:', selectedWorkstationId);
    alert('Функціонал додавання ПЗ ще не реалізовано.');
  };

  const handleEditInstalledSoftware = async (softwareEntry) => {
    // TODO: Реалізувати модальне вікно для редагування даних ПЗ
    // const updatedSoftwareData = { ...softwareEntry, version: '1.1' }; // Приклад
    // if (updateInstalledSoftware) {
    //   try {
    //     await updateInstalledSoftware(softwareEntry.id, updatedSoftwareData); // Припускаємо, що softwareEntry має id
    //     // AppContext повинен автоматично оновити selectedWorkstationSoftware
    //   } catch (err) {
    //     alert(`Помилка оновлення ПЗ: ${err.message}`);
    //   }
    // }
    console.log(`Edit installed software ${softwareEntry.id}`, softwareEntry);
    alert('Функціонал редагування ПЗ ще не реалізовано.');
  };

  const handleDeleteInstalledSoftware = async (softwareEntryId) => {
    // if (deleteInstalledSoftware) {
    //   if (window.confirm('Ви впевнені, що хочете видалити це ПЗ?')) {
    //     try {
    //       await deleteInstalledSoftware(softwareEntryId);
    //       // AppContext повинен автоматично оновити selectedWorkstationSoftware
    //     } catch (err) {
    //       alert(`Помилка видалення ПЗ: ${err.message}`);
    //     }
    //   }
    // }
    console.log(`Delete installed software ${softwareEntryId}`);
    alert('Функціонал видалення ПЗ ще не реалізовано.');
  };

  if (loadingWorkstationsFromContext) {
    return <div className="p-6 text-white">Завантаження АРМ...</div>;
  }

  if (errorWorkstationsFromContext) {
    return <div className="p-6 text-red-500">Помилка завантаження АРМ: {errorWorkstationsFromContext}</div>;
  }

  return (
    <div className="p-6 flex flex-col h-full bg-dark-bg text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Програмне забезпечення</h1>
        {selectedWorkstationId && (
           <button
             onClick={() => setSelectedWorkstationId('')}
             className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
           >
             Змінити АРМ
           </button>
        )}
      </div>

      {!selectedWorkstationId && (
        <div className="mb-6">
          <label htmlFor="workstation-select" className="block text-dark-textSecondary mb-2">Оберіть АРМ:</label>
          <select
            id="workstation-select"
            className="bg-dark-card border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedWorkstationId}
            onChange={handleWorkstationSelect}
            disabled={loadingWorkstationsFromContext}
          >
            <option value="">-- Оберіть АРМ --</option>
            {workstations.map(ws => (
              <option key={ws.id} value={ws.id}>
                {ws.inventory_number} - {ws.ip_address} ({ws.department?.name})
              </option>
            ))}
          </select>
          {errorWorkstationsFromContext && <p className="text-red-500 mt-2">Помилка: {errorWorkstationsFromContext}</p>}
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

          {loadingSoftwareFromContext ? (
            <div className="p-6 text-white">Завантаження ПЗ...</div>
          ) : errorSoftwareFromContext ? (
            <div className="p-6 text-red-500">Помилка завантаження ПЗ: {errorSoftwareFromContext}</div>
          ) : selectedWorkstationSoftware.length === 0 ? (
            <div className="p-6 text-dark-textSecondary">На цьому АРМ немає встановленого ПЗ.</div>
          ) : (
            <div className="relative overflow-y-auto flex-1">
              <table className="table-auto w-full">
                <thead className="sticky top-0 bg-dark-card z-10">
                  <tr className="border-b border-dark-border">
                    <th className="px-4 py-2 text-left text-white" style={{ width: '30%' }}>Назва ПЗ</th>
                    <th className="px-4 py-2 text-left text-white" style={{ width: '15%' }}>Версія</th>
                    <th className="px-4 py-2 text-left text-white" style={{ width: '20%' }}>Дата встановлення</th>
                    <th className="px-4 py-2 text-left text-white" style={{ width: '20%' }}>Виробник</th> {/* Додано поле Виробник */} 
                    <th className="px-4 py-2 text-left text-white" style={{ width: '15%' }}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedWorkstationSoftware.map((software) => (
                    <tr key={software.id} className="border-b border-dark-border hover:bg-dark-hover">
                      <td className="px-4 py-2 text-dark-textPrimary">{software.name}</td>
                      <td className="px-4 py-2 text-dark-textPrimary">{software.version}</td>
                      <td className="px-4 py-2 text-dark-textPrimary">{new Date(software.installation_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-dark-textPrimary">{software.manufacturer || 'N/A'}</td> {/* Відображення виробника */} 
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleEditInstalledSoftware(software)} // Передаємо весь об'єкт software
                          className="text-blue-400 hover:text-blue-300 mr-2"
                        >
                          Редагувати
                        </button>
                        <button
                          onClick={() => handleDeleteInstalledSoftware(software.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Видалити
                        </button>
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