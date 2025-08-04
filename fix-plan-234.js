const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function fixPlan234() {
  try {
    console.log('🔍 Исправляем план "234"...');
    
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
    
    // Находим все тест-кейсы проекта
    const testCasesResult = await pool.query(`
      SELECT id, title, test_plan_id, section_id 
      FROM test_cases 
      WHERE project_id = '8508e37b-d232-4d95-a234-bd41ef3958f2' 
      AND is_deleted = FALSE
    `);
    
    console.log(`📝 Найдено ${testCasesResult.rows.length} тест-кейсов`);
    
    // Связываем все тест-кейсы с планом "234"
    let linkedCount = 0;
    for (const testCase of testCasesResult.rows) {
      if (testCase.test_plan_id !== planId) {
        console.log(`  🔗 Связываем "${testCase.title}" с планом "234"`);
        await pool.query(
          'UPDATE test_cases SET test_plan_id = $1 WHERE id = $2',
          [planId, testCase.id]
        );
        linkedCount++;
      }
    }
    
    console.log(`✅ Связано ${linkedCount} тест-кейсов с планом "234"`);
    
    // Проверяем результат
    const finalResult = await pool.query(
      'SELECT id, title FROM test_cases WHERE test_plan_id = $1 AND is_deleted = FALSE',
      [planId]
    );
    
    console.log(`🎉 В плане "234" теперь ${finalResult.rows.length} тест-кейсов:`);
    finalResult.rows.forEach(tc => {
      console.log(`  - ${tc.title}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

fixPlan234(); 