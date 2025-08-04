const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function checkAllData() {
  try {
    console.log('🔍 Проверяем все данные...');
    
    // Проверяем все тест-кейсы
    const allCases = await pool.query(`
      SELECT id, title, project_id, test_plan_id, section_id 
      FROM test_cases 
      WHERE is_deleted = FALSE
    `);
    console.log(`📝 Всего тест-кейсов: ${allCases.rows.length}`);
    allCases.rows.forEach(tc => {
      console.log(`  - ${tc.title} (проект: ${tc.project_id}, план: ${tc.test_plan_id}, раздел: ${tc.section_id})`);
    });
    
    // Проверяем все проекты
    const allProjects = await pool.query(`
      SELECT id, name FROM projects WHERE is_deleted = FALSE
    `);
    console.log(`📋 Всего проектов: ${allProjects.rows.length}`);
    allProjects.rows.forEach(project => {
      console.log(`  - ${project.name} (ID: ${project.id})`);
    });
    
    // Проверяем все планы
    const allPlans = await pool.query(`
      SELECT id, name, project_id FROM test_plans WHERE is_deleted = FALSE
    `);
    console.log(`📋 Всего планов: ${allPlans.rows.length}`);
    allPlans.rows.forEach(plan => {
      console.log(`  - ${plan.name} (проект: ${plan.project_id})`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

checkAllData(); 