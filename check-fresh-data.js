const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function checkFreshData() {
  try {
    console.log('🔍 Проверяем данные в свежей базе...');
    
    // Проверяем проекты
    const projects = await pool.query(`
      SELECT id, name FROM projects WHERE is_deleted = FALSE
    `);
    console.log(`📋 Проектов: ${projects.rows.length}`);
    projects.rows.forEach(project => {
      console.log(`  - ${project.name} (ID: ${project.id})`);
    });
    
    // Проверяем тест-планы
    const plans = await pool.query(`
      SELECT id, name, project_id FROM test_plans WHERE is_deleted = FALSE
    `);
    console.log(`📋 Тест-планов: ${plans.rows.length}`);
    plans.rows.forEach(plan => {
      console.log(`  - ${plan.name} (проект: ${plan.project_id})`);
    });
    
    // Проверяем тест-кейсы
    const testCases = await pool.query(`
      SELECT id, title, project_id, section_id FROM test_cases WHERE is_deleted = FALSE
    `);
    console.log(`📝 Тест-кейсов: ${testCases.rows.length}`);
    testCases.rows.forEach(tc => {
      console.log(`  - ${tc.title} (проект: ${tc.project_id}, раздел: ${tc.section_id})`);
    });
    
    // Проверяем разделы
    const sections = await pool.query(`
      SELECT id, name, project_id, parent_id FROM test_case_sections WHERE is_deleted = FALSE
    `);
    console.log(`📁 Разделов: ${sections.rows.length}`);
    sections.rows.forEach(section => {
      console.log(`  - ${section.name} (проект: ${section.project_id}, родитель: ${section.parent_id})`);
    });
    
    // Проверяем таблицу test_plan_cases
    const planCases = await pool.query(`
      SELECT COUNT(*) as count FROM test_plan_cases
    `);
    console.log(`📊 Связей в test_plan_cases: ${planCases.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

checkFreshData(); 