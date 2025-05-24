import { query } from './database.js';
import bcrypt from 'bcryptjs';

console.log('🔍 Перевірка користувачів в БД...\n');

try {
  const users = query('SELECT id, username, full_name, role, password FROM users');
  
  console.log('👥 Знайдені користувачі:');
  users.forEach(user => {
    console.log(`  - ID: ${user.id}, Логін: ${user.username}, Ім'я: ${user.full_name}, Роль: ${user.role}`);
    console.log(`    Пароль (hash): ${user.password.substring(0, 30)}...`);
  });

  // Тестуємо пароль admin
  const adminUser = users.find(u => u.username === 'admin');
  if (adminUser) {
    console.log('\n🔐 Тестування пароля admin123...');
    
    const passwordMatch = bcrypt.compareSync('admin123', adminUser.password);
    console.log(`✅ Пароль admin123 співпадає: ${passwordMatch}`);
    
    if (!passwordMatch) {
      console.log('❌ Пароль не співпадає. Можливо, треба скинути пароль.');
    }
  }
  
} catch (error) {
  console.error('❌ Помилка:', error.message);
} 