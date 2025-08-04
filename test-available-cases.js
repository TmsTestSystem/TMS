const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function testAvailableCases() {
  try {
    console.log('🧪 Тестируем доступные тест-кейсы для плана "не"...');
    
    const planId = 'c6d840b0-3390-4cdc-bda1-e20cda987165'; // ID плана "не"
    
    // Проверяем, какие тест-кейсы доступны для добавления в план "не"
    const availableCases = await pool.query(`
      SELECT tc.title 
      FROM test_cases tc
      WHERE tc.project_id = '7d1db4e8-44c1-4356-8a1b-5446a529cd86'
      AND tc.is_deleted = FALSE
      AND tc.id NOT IN (
        SELECT test_case_id FROM test_plan_cases 
        WHERE test_plan_id = $1
      )
    `, [planId]);
    console.log(`📝 Доступных тест-кейсов для плана "не": ${availableCases.rows.length}`);
    availableCases.rows.forEach(row => {
      console.log(`  - ${row.title}`);
    });
    
    // Проверяем тест-кейсы в плане TEST1
    const test1Cases = await pool.query(`
      SELECT tc.title 
      FROM test_cases tc
      INNER JOIN test_plan_cases tpc ON tc.id = tpc.test_case_id
      WHERE tpc.test_plan_id = 'fcb2a77f-c984-459e-93f7-b5bf96c3dc00'
    `);
    console.log(`📝 Тест-кейсов в плане TEST1: ${test1Cases.rows.length}`);
    test1Cases.rows.forEach(row => {
      console.log(`  - ${row.title}`);
    });
    
    // Проверяем тест-кейсы без плана
    const casesWithoutPlan = await pool.query(`
      SELECT tc.title 
      FROM test_cases tc
      WHERE tc.project_id = '7d1db4e8-44c1-4356-8a1b-5446a529cd86'
      AND tc.test_plan_id IS NULL
      AND tc.is_deleted = FALSE
    `);
    console.log(`📝 Тест-кейсов без плана: ${casesWithoutPlan.rows.length}`);
    casesWithoutPlan.rows.forEach(row => {
      console.log(`  - ${row.title}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

testAvailableCases(); 