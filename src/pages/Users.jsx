import React, { useState } from 'react';

const Users = () => {
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', name: 'Адміністратор', role: 'admin', department: 'IT', email: 'admin@example.com' },
    { id: 2, username: 'user1', name: 'Іван Петров', role: 'user', department: 'Бухгалтерія', email: 'user1@example.com' },
    { id: 3, username: 'user2', name: 'Марія Сидорова', role: 'user', department: 'HR', email: 'user2@example.com' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    role: 'user',
    department: '',
    email: '',
    password: '',
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    const user = {
      id: users.length + 1,
      ...newUser,
    };
    setUsers([...users, user]);
    setShowAddModal(false);
    setNewUser({
      username: '',
      name: '',
      role: 'user',
      department: '',
      email: '',
      password: '',
    });
  };

  const handleEditUser = (e) => {
    e.preventDefault();
    setUsers(users.map(user => 
      user.id === selectedUser.id ? { ...user, ...selectedUser } : user
    ));
    setShowEditModal(false);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    return matchesSearch && matchesRole && matchesDepartment;
  });

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
            <option value="IT">IT</option>
            <option value="Бухгалтерія">Бухгалтерія</option>
            <option value="HR">HR</option>
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
                  <td className="py-3 text-white">{user.name}</td>
                  <td className="py-3 text-white">{user.username}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' ? 'bg-primary-500 text-white' : 'bg-dark-border text-dark-textSecondary'
                    }`}>
                      {user.role === 'admin' ? 'Адміністратор' : 'Користувач'}
                    </span>
                  </td>
                  <td className="py-3 text-white">{user.department}</td>
                  <td className="py-3 text-white">{user.email}</td>
                  <td className="py-3">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
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
                <label className="block text-dark-textSecondary mb-2">Ім'я</label>
                <input
                  type="text"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
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
                <input
                  type="text"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  required
                />
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
            <form onSubmit={handleEditUser}>
              <div className="mb-4">
                <label className="block text-dark-textSecondary mb-2">Логін</label>
                <input
                  type="text"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-dark-textSecondary mb-2">Ім'я</label>
                <input
                  type="text"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
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
                <input
                  type="text"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={selectedUser.department}
                  onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-dark-textSecondary mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white"
                  value={selectedUser.email}
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