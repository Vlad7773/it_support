import { query } from './database.js';

console.log('🔍 Перевірка всіх даних в базі даних...\n');

try {
  console.log('📋 DEPARTMENTS:');
  const departments = query('SELECT * FROM departments');
  departments.forEach(dept => {
    console.log(`  - ${dept.id}: ${dept.name} (${dept.description})`);
  });

  console.log('\n👥 USERS:');
  const users = query('SELECT id, username, full_name, email, role, department_id FROM users');
  users.forEach(user => {
    console.log(`  - ${user.id}: ${user.username} (${user.full_name}) - ${user.role} - Dept: ${user.department_id}`);
  });

  console.log('\n💻 WORKSTATIONS:');
  const workstations = query(`
    SELECT w.*, d.name as dept_name, u.full_name as responsible_name 
    FROM workstations w
    LEFT JOIN departments d ON w.department_id = d.id
    LEFT JOIN users u ON w.responsible_id = u.id
  `);
  workstations.forEach(ws => {
    console.log(`  - ${ws.id}: ${ws.inventory_number} (${ws.os_name}) - ${ws.status} - Dept: ${ws.dept_name} - Resp: ${ws.responsible_name}`);
  });

  console.log('\n🎫 TICKETS:');
  const tickets = query(`
    SELECT t.*, u1.full_name as reporter, u2.full_name as assignee, w.inventory_number as workstation
    FROM tickets t
    LEFT JOIN users u1 ON t.user_id = u1.id
    LEFT JOIN users u2 ON t.assigned_to = u2.id
    LEFT JOIN workstations w ON t.workstation_id = w.id
  `);
  tickets.forEach(ticket => {
    console.log(`  - ${ticket.id}: ${ticket.description.substring(0, 30)}... - ${ticket.status} (${ticket.priority}) - Reporter: ${ticket.reporter} - Assignee: ${ticket.assignee}`);
  });

  console.log('\n🔧 REPAIRS:');
  const repairs = query(`
    SELECT r.*, w.inventory_number as workstation, u.full_name as technician
    FROM repairs r
    LEFT JOIN workstations w ON r.workstation_id = w.id
    LEFT JOIN users u ON r.technician_id = u.id
  `);
  repairs.forEach(repair => {
    console.log(`  - ${repair.id}: ${repair.description.substring(0, 30)}... - ${repair.status} - Cost: $${repair.cost} - Tech: ${repair.technician}`);
  });

  console.log('\n💿 SOFTWARE:');
  const software = query(`
    SELECT s.*, w.inventory_number as workstation
    FROM software s
    LEFT JOIN workstations w ON s.workstation_id = w.id
  `);
  software.forEach(sw => {
    console.log(`  - ${sw.id}: ${sw.name} v${sw.version} - ${sw.workstation}`);
  });

  console.log('\n✅ Перевірка завершена успішно!');

} catch (error) {
  console.error('❌ Помилка:', error.message);
} 