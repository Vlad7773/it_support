import axios from 'axios';

console.log('🚀 ФІНАЛЬНА ПЕРЕВІРКА СИСТЕМИ ARM Dashboard\n');

const checks = {
  database: false,
  authentication: false,
  apis: false,
  server: false
};

async function checkSystem() {
  console.log('1️⃣ Перевірка підключення до сервера...');
  try {
    const response = await axios.get('http://localhost:3001/api/departments');
    if (response.status === 200) {
      console.log('✅ Сервер відповідає');
      checks.server = true;
    }
  } catch (error) {
    console.log('❌ Сервер не відповідає:', error.message);
    return;
  }

  console.log('\n2️⃣ Перевірка автентифікації...');
  try {
    const loginResponse = await axios.post('http://localhost:3001/api/login', {
      username: 'admin',
      password: 'admin123'
    });
    if (loginResponse.data.user) {
      console.log(`✅ Автентифікація працює: ${loginResponse.data.user.full_name} (${loginResponse.data.user.role})`);
      checks.authentication = true;
    }
  } catch (error) {
    console.log('❌ Автентифікація не працює:', error.response?.data?.error);
    return;
  }

  console.log('\n3️⃣ Перевірка всіх API endpoints...');
  const endpoints = [
    { name: 'Departments', url: '/api/departments' },
    { name: 'Users', url: '/api/users' },
    { name: 'Workstations', url: '/api/workstations' },
    { name: 'Tickets', url: '/api/tickets' },
    { name: 'Repairs', url: '/api/repairs' }
  ];

  let allApisWork = true;
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`http://localhost:3001${endpoint.url}`);
      console.log(`✅ ${endpoint.name}: ${response.data.length} записів`);
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.response?.status || error.message}`);
      allApisWork = false;
    }
  }
  checks.apis = allApisWork;

  console.log('\n4️⃣ Перевірка структури бази даних...');
  try {
    const [departments, users, workstations, tickets, repairs] = await Promise.all([
      axios.get('http://localhost:3001/api/departments'),
      axios.get('http://localhost:3001/api/users'),
      axios.get('http://localhost:3001/api/workstations'),
      axios.get('http://localhost:3001/api/tickets'),
      axios.get('http://localhost:3001/api/repairs')
    ]);

    const hasData = departments.data.length > 0 && users.data.length > 0 && 
                   workstations.data.length > 0 && tickets.data.length > 0 && 
                   repairs.data.length > 0;

    if (hasData) {
      console.log('✅ База даних заповнена тестовими даними');
      checks.database = true;
    } else {
      console.log('⚠️ База даних порожня або неповна');
    }
  } catch (error) {
    console.log('❌ Помилка доступу до бази даних:', error.message);
  }

  console.log('\n📊 РЕЗУЛЬТАТИ ПЕРЕВІРКИ:');
  console.log(`🖥️  Сервер: ${checks.server ? '✅ Працює' : '❌ Не працює'}`);
  console.log(`🔐 Автентифікація: ${checks.authentication ? '✅ Працює' : '❌ Не працює'}`);
  console.log(`📡 API Endpoints: ${checks.apis ? '✅ Всі працюють' : '❌ Є проблеми'}`);
  console.log(`💾 База даних: ${checks.database ? '✅ Заповнена' : '❌ Порожня'}`);

  const allChecks = Object.values(checks).every(check => check);
  
  console.log('\n🎯 ЗАГАЛЬНИЙ СТАТУС:');
  if (allChecks) {
    console.log('🎉 ВСЕ ПРАЦЮЄ! Система готова до використання!');
    console.log('\n📝 Доступні облікові записи:');
    console.log('   - admin/admin123 (адміністратор)');
    console.log('   - john.doe/user123 (користувач)');
    console.log('   - jane.smith/user123 (користувач)');
    console.log('   - mike.tech/user123 (користувач)');
    console.log('\n🌐 Доступ:');
    console.log('   - Backend: http://localhost:3001');
    console.log('   - Frontend: http://localhost:5173');
  } else {
    console.log('❌ Є проблеми, які потребують вирішення');
  }
}

checkSystem().catch(error => {
  console.error('\n💥 Критична помилка:', error.message);
  process.exit(1);
}); 