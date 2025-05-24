import axios from 'axios';

console.log('🔍 Тестування з\'єднання з сервером...\n');

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  const tests = [
    { name: 'Departments', url: `${API_BASE}/departments` },
    { name: 'Users', url: `${API_BASE}/users` },
    { name: 'Workstations', url: `${API_BASE}/workstations` },
    { name: 'Tickets', url: `${API_BASE}/tickets` },
    { name: 'Repairs', url: `${API_BASE}/repairs` },
  ];

  for (const test of tests) {
    try {
      const response = await axios.get(test.url);
      console.log(`✅ ${test.name}: OK (${response.status}) - ${response.data.length} записів`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}: Сервер не відповідає (ECONNREFUSED)`);
      } else {
        console.log(`⚠️ ${test.name}: ${error.response?.status || error.message}`);
      }
    }
  }

  // Тест логіну
  try {
    console.log('\n🔐 Тестування логіну...');
    const loginResponse = await axios.post(`${API_BASE}/login`, {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Логін: OK - користувач автентифікований');
    console.log(`   Користувач: ${loginResponse.data.user.full_name} (${loginResponse.data.user.role})`);
  } catch (error) {
    console.log(`❌ Логін: ${error.response?.data?.error || error.message}`);
  }
}

testAPI().then(() => {
  console.log('\n🎉 Тестування завершено!');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Критична помилка:', error.message);
  process.exit(1);
}); 