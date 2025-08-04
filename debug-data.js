const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function debugData() {
  try {
    console.log('🔍 Отладка данных...');
    
    // Проверяем планы
    const plans = await pool.query(`
      SELECT id, name FROM test_plans WHERE is_deleted = FALSE
    `);
    console.log('📋 Планы:');
    plans.rows.forEach(plan => {
      console.log(`  - ${plan.name} (ID: ${plan.id})`);
    });
    
    // Проверяем тест-кейсы с test_plan_id
    const testCasesWithPlan = await pool.query(`
      SELECT id, title, test_plan_id FROM test_cases 
      WHERE test_plan_id IS NOT NULL AND is_deleted = FALSE
    `);
    console.log(`📝 Тест-кейсов с test_plan_id: ${testCasesWithPlan.rows.length}`);
    testCasesWithPlan.rows.forEach(tc => {
      console.log(`  - ${tc.title} (план: ${tc.test_plan_id})`);
    });
    
    // Проверяем таблицу test_plan_cases
    const planCases = await pool.query(`
      SELECT tpc.*, tc.title, tp.name as plan_name
      FROM test_plan_cases tpc
      INNER JOIN test_cases tc ON tpc.test_case_id = tc.id
      INNER JOIN test_plans tp ON tpc.test_plan_id = tp.id
    `);
    console.log(`📊 Связей в test_plan_cases: ${planCases.rows.length}`);
    planCases.rows.forEach(row => {
      console.log(`  - ${row.title} -> ${row.plan_name}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

debugData(); 