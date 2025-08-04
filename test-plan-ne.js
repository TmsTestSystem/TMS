const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function testPlanNe() {
  try {
    console.log('🧪 Тестируем план "не"...');
    
    // Проверяем тест-кейсы в плане "не"
    const planCases = await pool.query(`
      SELECT tc.title, tpc.test_plan_id 
      FROM test_cases tc
      INNER JOIN test_plan_cases tpc ON tc.id = tpc.test_case_id
      INNER JOIN test_plans tp ON tpc.test_plan_id = tp.id
      WHERE tp.name = 'не'
    `);
    console.log(`📝 Тест-кейсов в плане "не": ${planCases.rows.length}`);
    planCases.rows.forEach(row => {
      console.log(`  - ${row.title}`);
    });
    
    // Проверяем, какие тест-кейсы доступны для добавления в план "не"
    const availableCases = await pool.query(`
      SELECT tc.title 
      FROM test_cases tc
      WHERE tc.project_id = '8508e37b-d232-4d95-a234-bd41ef3958f2'
      AND tc.is_deleted = FALSE
      AND tc.id NOT IN (
        SELECT test_case_id FROM test_plan_cases 
        WHERE test_plan_id = (SELECT id FROM test_plans WHERE name = 'не')
      )
      LIMIT 10
    `);
    console.log(`📝 Доступных тест-кейсов для плана "не": ${availableCases.rows.length}`);
    availableCases.rows.forEach(row => {
      console.log(`  - ${row.title}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

testPlanNe(); 