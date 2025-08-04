const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function fixProjectId() {
  try {
    console.log('🔧 Исправляем project_id у тест-кейсов...');
    
    // Проверяем тест-кейсы с NULL project_id
    const nullProjectCases = await pool.query(`
      SELECT id, title, project_id 
      FROM test_cases 
      WHERE project_id IS NULL
      AND is_deleted = FALSE
    `);
    console.log(`📝 Тест-кейсов с NULL project_id: ${nullProjectCases.rows.length}`);
    
    // Обновляем project_id для всех тест-кейсов
    const updateResult = await pool.query(`
      UPDATE test_cases 
      SET project_id = '8508e37b-d232-4d95-a234-bd41ef3958f2'
      WHERE project_id IS NULL
      AND is_deleted = FALSE
    `);
    console.log(`✅ Обновлено ${updateResult.rowCount} тест-кейсов`);
    
    // Проверяем результат
    const checkResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM test_cases 
      WHERE project_id = '8508e37b-d232-4d95-a234-bd41ef3958f2'
      AND is_deleted = FALSE
    `);
    console.log(`📊 Тест-кейсов с правильным project_id: ${checkResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

fixProjectId(); 