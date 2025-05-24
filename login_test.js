import axios from 'axios';

async function testLogin() {
  try {
    console.log('🔐 Тестування логіну admin/admin123...');
    const response = await axios.post('http://localhost:3001/api/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ Логін успішний!');
    console.log(`👤 Користувач: ${response.data.user.full_name}`);
    console.log(`🎯 Роль: ${response.data.user.role}`);
    console.log(`🆔 ID: ${response.data.user.id}`);
    
  } catch (error) {
    console.log('❌ Помилка логіну:', error.response?.data?.error || error.message);
  }
}

testLogin(); 