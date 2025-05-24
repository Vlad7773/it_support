import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const Users = () => {
  const { users: contextUsers, addUser, updateUser, deleteUser, departments, loading, error } = useApp(); // Додано loading та error для обробки
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    if (contextUsers) {
      setUsers(contextUsers);
    }
  }, [contextUsers]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const [newUser, setNewUser] = useState({
    username: '',
    full_name: '', // Змінено name на full_name
    role: 'user',
    department_id: '',
    email: '',
    password: '',
  });

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.department_id) {
      alert('Будь ласка, виберіть відділ.');
      return;
    }
    try {
      await addUser(newUser);
      setShowAddModal(false);
      setNewUser({
        username: '',
        full_name: '', // Змінено name на full_name
        role: 'user',
        department_id: '',
        email: '',
        password: '',
      });
    } catch (error) {
      console.error("Failed to add user:", error);
      alert("Не вдалося додати користувача: " + (error.response?.data?.error || error.message)); // Використовуємо error.response?.data?.error
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!selectedUser.department_id) {
        alert('Будь ласка, виберіть відділ для користувача.');
        return;
    }
    try {
      const userToUpdate = { ...selectedUser };
      // Переконуємося, що поле називається full_name, якщо воно є в selectedUser.name
      if (userToUpdate.hasOwnProperty('name') && !userToUpdate.hasOwnProperty('full_name')) {
        userToUpdate.full_name = userToUpdate.name;
        delete userToUpdate.name;
      }
      delete userToUpdate.department; 
      await updateUser(userToUpdate.id, userToUpdate); // Передаємо ID окремо
      setShowEditModal(false);
      setSelectedUser(null); // Очищаємо selectedUser
    } catch (error) {
      console.error("Failed to edit user:", error);
      alert("Не вдалося редагувати користувача: " + (error.response?.data?.error || error.message)); // Використовуємо error.response?.data?.error
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      try {
        await deleteUser(id);
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Не вдалося видалити користувача: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const filteredUsers = (users || []).filter(user => {
    // const departmentName = departments.find(d => d.id === user.department_id)?.name || ''; // Це поле не використовується, можна видалити
    const matchesSearch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || // Використовуємо full_name
                         (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department_id === parseInt(filterDepartment);
    return matchesSearch && matchesRole && matchesDepartment;
  });

  if (loading) return <p className="text-white">Завантаження користувачів...</p>;
  if (error && !users.length) return <p className="text-red-500">Помилка завантаження користувачів: {error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Користувачі</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          Додати користувача
        </button>
      </div>

      <div className="bg-dark-card rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Пошук..."
            className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Всі ролі</option>
            <option value="admin">Адміністратор</option>
            <option value="user">Користувач</option>
          </select>
          <select
            className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="all">Всі відділи</option>
            {(departments || []).map(dept => ( // Динамічна генерація відділів
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-dark-textSecondary border-b border-dark-border">
                <th className="pb-3">Ім'я</th>
                <th className="pb-3">Логін</th>
                <th className="pb-3">Роль</th>
                <th className="pb-3">Відділ</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-dark-border">
                  <td className="py-3 text-white">{user.full_name}</td> {/* Використовуємо full_name */}
                  <td className="py-3 text-white">{user.username}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-primary-500 text-white' : 'bg-dark-border text-dark-textSecondary'
                    }`}>
                      {user.role === 'admin' ? 'Адміністратор' : 'Користувач'}
                    </span>
                  </td>
                  <td className="py-3 text-white">{departments.find(d => d.id === user.department_id)?.name || 'N/A'}</td>
                  <td className="py-3 text-white">{user.email}</td>
                  <td className="py-3">
                    <button
                      onClick={() => {
                        // При встановленні selectedUser, переконуємося, що використовується full_name
                        const userToEdit = { ...user };
                        if (userToEdit.hasOwnProperty('name') && !userToEdit.hasOwnProperty('full_name')) {
                            userToEdit.full_name = userToEdit.name;
                            delete userToEdit.name;
                        }
                        setSelectedUser(userToEdit); 
                        setShowEditModal(true);
                      }}
                      className="text-primary-400 hover:text-primary-300 mr-3"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
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
      </div>

      {/* Модальне вікно додавання користувача */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-dark-card p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold text-white mb-4">Додати користувача</h2>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-dark-textSecondary mb-2">Логін</label>
                <input
                  type="text"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-dark-textSecondary mb-2">Повне ім'я</label>
                <input
                  type="text"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={newUser.full_name} // Змінено на full_name
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} // Змінено на full_name
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-dark-textSecondary mb-2">Роль</label>
                <select
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="user">Користувач</option>
                  <option value="admin">Адміністратор</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-dark-textSecondary mb-2">Відділ</label>
                <select // Змінено input на select для відділу
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={newUser.department_id}
                  onChange={(e) => setNewUser({ ...newUser, department_id: parseInt(e.target.value) })}
                  required
                >
                  <option value="">Оберіть відділ</option>
                  {(departments || []).map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-dark-textSecondary mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-dark-textSecondary mb-2">Пароль</label>
                <input
                  type="password"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-dark-textSecondary hover:text-white"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                >
                  Додати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальне вікно редагування користувача */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-dark-card p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold text-white mb-4">Редагувати користувача</h2>
            {/* Переконайтеся, що selectedUser існує перед рендерингом форми */}
            <form onSubmit={handleEditUser}>
              <div className="mb-4">
                <label className="block text-dark-textSecondary mb-2">Логін</label>
                <input
                  type="text"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={selectedUser.username || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-dark-textSecondary mb-2">Повне ім'я</label>
                <input
                  type="text"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={selectedUser.full_name || ''} // Змінено на full_name
                  onChange={(e) => setSelectedUser({ ...selectedUser, full_name: e.target.value })} // Змінено на full_name
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-dark-textSecondary mb-2">Роль</label>
                <select
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                >
                  <option value="user">Користувач</option>
                  <option value="admin">Адміністратор</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-dark-textSecondary mb-2">Відділ</label>
                <select // Змінено input на select для відділу
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={selectedUser.department_id} // Використовуємо department_id
                  onChange={(e) => setSelectedUser({ ...selectedUser, department_id: parseInt(e.target.value) })} // Оновлюємо department_id
                  required
                >
                   {(departments || []).map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-dark-textSecondary mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-dark-textSecondary hover:text-white"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;