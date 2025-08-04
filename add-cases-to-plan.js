const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function addCasesToPlan() {
  try {
    console.log('🔍 Добавляем тест-кейсы в план "234"...');
    
    // Находим план "234"
    const planResult = await pool.query(
      'SELECT id, name FROM test_plans WHERE name = $1 AND is_deleted = FALSE',
      ['234']
    );
    
    if (planResult.rows.length === 0) {
      console.log('❌ План "234" не найден');
      return;
    }
    
    const planId = planResult.rows[0].id;
    console.log('🎯 Найден план:', planResult.rows[0].name, 'ID:', planId);
    
    // Находим тест-кейсы, которые не связаны с планом
    const testCasesResult = await pool.query(`
      SELECT id, title, section_id 
      FROM test_cases 
      WHERE project_id = '8508e37b-d232-4d95-a234-bd41ef3958f2' 
      AND (test_plan_id IS NULL OR test_plan_id != $1)
      AND is_deleted = FALSE
      LIMIT 5
    `, [planId]);
    
    console.log(`📝 Найдено ${testCasesResult.rows.length} тест-кейсов для добавления`);
    
    // Добавляем тест-кейсы в план
    for (const testCase of testCasesResult.rows) {
      console.log(`  ➕ Добавляем "${testCase.title}" в план "234"`);
      await pool.query(
        'UPDATE test_cases SET test_plan_id = $1 WHERE id = $2',
        [planId, testCase.id]
      );
    }
    
    console.log(`✅ Добавлено ${testCasesResult.rows.length} тест-кейсов в план "234"`);
    
    // Проверяем результат
    const finalResult = await pool.query(
      'SELECT id, title, section_id FROM test_cases WHERE test_plan_id = $1 AND is_deleted = FALSE',
      [planId]
    );
    
    console.log(`🎉 В плане "234" теперь ${finalResult.rows.length} тест-кейсов:`);
    finalResult.rows.forEach(tc => {
      console.log(`  - ${tc.title} (раздел: ${tc.section_id})`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

addCasesToPlan(); 