const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function testAddCase() {
  try {
    console.log('🧪 Тестируем добавление тест-кейса в план...');
    
    const planId = 'c6d840b0-3390-4cdc-bda1-e20cda987165'; // ID плана "не"
    
    // Находим тест-кейс из плана TEST1
    const testCase = await pool.query(`
      SELECT tc.id, tc.title 
      FROM test_cases tc
      INNER JOIN test_plan_cases tpc ON tc.id = tpc.test_case_id
      WHERE tpc.test_plan_id = 'fcb2a77f-c984-459e-93f7-b5bf96c3dc00'
      LIMIT 1
    `);
    
    if (testCase.rows.length === 0) {
      console.log('❌ Не найден тест-кейс для тестирования');
      return;
    }
    
    const testCaseId = testCase.rows[0].id;
    const testCaseTitle = testCase.rows[0].title;
    
    console.log(`📝 Добавляем тест-кейс "${testCaseTitle}" в план "не"...`);
    
    // Добавляем тест-кейс в план "не"
    await pool.query(`
      INSERT INTO test_plan_cases (test_plan_id, test_case_id)
      VALUES ($1, $2)
      ON CONFLICT (test_plan_id, test_case_id) DO NOTHING
    `, [planId, testCaseId]);
    
    console.log('✅ Тест-кейс добавлен в план "не"');
    
    // Проверяем результат
    const result = await pool.query(`
      SELECT tc.title, tp.name as plan_name
      FROM test_cases tc
      INNER JOIN test_plan_cases tpc ON tc.id = tpc.test_case_id
      INNER JOIN test_plans tp ON tpc.test_plan_id = tp.id
      WHERE tc.id = $1
    `, [testCaseId]);
    
    console.log(`📊 Тест-кейс "${testCaseTitle}" теперь в планах:`);
    result.rows.forEach(row => {
      console.log(`  - ${row.plan_name}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

testAddCase(); 