const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function testNewAPI() {
  try {
    console.log('🧪 Тестируем новый API...');
    
    // Проверяем таблицу test_plan_cases
    const tableCheck = await pool.query(`
      SELECT COUNT(*) as count FROM test_plan_cases
    `);
    console.log(`📊 Связей в таблице test_plan_cases: ${tableCheck.rows[0].count}`);
    
    // Проверяем тест-кейсы в плане "куц"
    const planCases = await pool.query(`
      SELECT tc.title, tpc.test_plan_id 
      FROM test_cases tc
      INNER JOIN test_plan_cases tpc ON tc.id = tpc.test_case_id
      INNER JOIN test_plans tp ON tpc.test_plan_id = tp.id
      WHERE tp.name = 'куц'
    `);
    console.log(`📝 Тест-кейсов в плане "куц": ${planCases.rows.length}`);
    planCases.rows.forEach(row => {
      console.log(`  - ${row.title}`);
    });
    
    // Проверяем тест-кейсы в плане "234"
    const plan234Cases = await pool.query(`
      SELECT tc.title, tpc.test_plan_id 
      FROM test_cases tc
      INNER JOIN test_plan_cases tpc ON tc.id = tpc.test_case_id
      INNER JOIN test_plans tp ON tpc.test_plan_id = tp.id
      WHERE tp.name = '234'
    `);
    console.log(`📝 Тест-кейсов в плане "234": ${plan234Cases.rows.length}`);
    plan234Cases.rows.forEach(row => {
      console.log(`  - ${row.title}`);
    });
    
    // Проверяем, какие тест-кейсы доступны для добавления в план "куц"
    const availableCases = await pool.query(`
      SELECT tc.title 
      FROM test_cases tc
      WHERE tc.project_id = '8508e37b-d232-4d95-a234-bd41ef3958f2'
      AND tc.is_deleted = FALSE
      AND tc.id NOT IN (
        SELECT test_case_id FROM test_plan_cases 
        WHERE test_plan_id = (SELECT id FROM test_plans WHERE name = 'куц')
      )
      LIMIT 5
    `);
    console.log(`📝 Доступных тест-кейсов для плана "куц": ${availableCases.rows.length}`);
    availableCases.rows.forEach(row => {
      console.log(`  - ${row.title}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

testNewAPI(); 