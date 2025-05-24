import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

console.log('🔍 Повне тестування всіх API endpoints...\n');

async function testAllAPIs() {
  const tests = [
    { name: 'Departments', url: `${API_BASE}/departments`, method: 'GET' },
    { name: 'Users', url: `${API_BASE}/users`, method: 'GET' },
    { name: 'Workstations', url: `${API_BASE}/workstations`, method: 'GET' },
    { name: 'Workstation Statuses', url: `${API_BASE}/workstationstatuses`, method: 'GET' },
    { name: 'Tickets', url: `${API_BASE}/tickets`, method: 'GET' },
    { name: 'Repairs', url: `${API_BASE}/repairs`, method: 'GET' },
  ];

  for (const test of tests) {
    try {
      const response = await axios.get(test.url);
      console.log(`✅ ${test.name}: OK (${response.status}) - ${response.data.length} записів`);
      
      // Показуємо перші 2 записи для кожного API
      if (response.data.length > 0) {
        console.log(`   Приклад: ${JSON.stringify(response.data[0], null, 2).substring(0, 100)}...`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${test.name}: Сервер не відповідає (ECONNREFUSED)`);
      } else {
        console.log(`⚠️ ${test.name}: ${error.response?.status || error.message}`);
      }
    }
  }

  // Тест логіну з різними користувачами
  console.log('\n🔐 Тестування логіну різних користувачів:');
  
  const loginTests = [
    { username: 'admin', password: 'admin123', expected: 'admin' },
    { username: 'john.doe', password: 'user123', expected: 'user' },
    { username: 'jane.smith', password: 'user123', expected: 'user' },
    { username: 'wrong', password: 'wrong', expected: 'fail' }
  ];

  for (const loginTest of loginTests) {
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        username: loginTest.username,
        password: loginTest.password
      });
      console.log(`✅ ${loginTest.username}: OK - ${response.data.user.full_name} (${response.data.user.role})`);
    } catch (error) {
      if (loginTest.expected === 'fail') {
        console.log(`✅ ${loginTest.username}: Правильно відхилено - ${error.response?.data?.error}`);
      } else {
        console.log(`❌ ${loginTest.username}: Несподівана помилка - ${error.response?.data?.error || error.message}`);
      }
    }
  }
}

testAllAPIs().then(() => {
  console.log('\n🎉 Повне тестування завершено!');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Критична помилка:', error.message);
  process.exit(1);
}); 