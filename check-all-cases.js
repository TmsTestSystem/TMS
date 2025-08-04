const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function checkAllCases() {
  try {
    console.log('🔍 Проверяем все тест-кейсы...');
    
    // Проверяем все тест-кейсы проекта
    const allCases = await pool.query(`
      SELECT id, title, test_plan_id, section_id 
      FROM test_cases 
      WHERE project_id = '8508e37b-d232-4d95-a234-bd41ef3958f2'
      AND is_deleted = FALSE
    `);
    console.log(`📝 Всего тест-кейсов в проекте: ${allCases.rows.length}`);
    allCases.rows.forEach(tc => {
      console.log(`  - ${tc.title} (план: ${tc.test_plan_id}, раздел: ${tc.section_id})`);
    });
    
    // Проверяем тест-кейсы без плана
    const casesWithoutPlan = await pool.query(`
      SELECT id, title, section_id 
      FROM test_cases 
      WHERE project_id = '8508e37b-d232-4d95-a234-bd41ef3958f2'
      AND test_plan_id IS NULL
      AND is_deleted = FALSE
    `);
    console.log(`📝 Тест-кейсов без плана: ${casesWithoutPlan.rows.length}`);
    casesWithoutPlan.rows.forEach(tc => {
      console.log(`  - ${tc.title} (раздел: ${tc.section_id})`);
    });
    
    // Проверяем тест-кейсы в плане TEST1
    const casesInTest1 = await pool.query(`
      SELECT tc.title 
      FROM test_cases tc
      WHERE tc.test_plan_id = 'fcb2a77f-c984-459e-93f7-b5bf96c3dc00'
      AND tc.is_deleted = FALSE
    `);
    console.log(`📝 Тест-кейсов в плане TEST1: ${casesInTest1.rows.length}`);
    casesInTest1.rows.forEach(tc => {
      console.log(`  - ${tc.title}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

checkAllCases(); 