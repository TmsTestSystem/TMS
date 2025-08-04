const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function addCasesToPlanKuts() {
  try {
    console.log('🔍 Добавляем тест-кейсы в план "куц"...');
    
    // Находим план "куц"
    const planResult = await pool.query(
      'SELECT id, name FROM test_plans WHERE name = $1 AND is_deleted = FALSE',
      ['куц']
    );
    
    if (planResult.rows.length === 0) {
      console.log('❌ План "куц" не найден');
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
      LIMIT 10
    `, [planId]);
    
    console.log(`📝 Найдено ${testCasesResult.rows.length} тест-кейсов для добавления`);
    
    // Добавляем тест-кейсы в план
    for (const testCase of testCasesResult.rows) {
      console.log(`  ➕ Добавляем "${testCase.title}" в план "куц"`);
      await pool.query(
        'UPDATE test_cases SET test_plan_id = $1 WHERE id = $2',
        [planId, testCase.id]
      );
    }
    
    console.log(`✅ Добавлено ${testCasesResult.rows.length} тест-кейсов в план "куц"`);
    
    // Проверяем результат
    const finalResult = await pool.query(
      'SELECT id, title, section_id FROM test_cases WHERE test_plan_id = $1 AND is_deleted = FALSE',
      [planId]
    );
    
    console.log(`🎉 В плане "куц" теперь ${finalResult.rows.length} тест-кейсов:`);
    finalResult.rows.forEach(tc => {
      console.log(`  - ${tc.title} (раздел: ${tc.section_id})`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

addCasesToPlanKuts(); 