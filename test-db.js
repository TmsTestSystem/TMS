const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function testDB() {
  try {
    console.log('Подключение к базе данных...');
    
    // Проверяем тест-планы
    const testPlansResult = await pool.query('SELECT id, name, project_id FROM test_plans WHERE is_deleted = FALSE');
    console.log('Тест-планы:', testPlansResult.rows);
    
    // Проверяем тест-кейсы
    const testCasesResult = await pool.query('SELECT id, title, project_id, test_plan_id, section_id FROM test_cases WHERE is_deleted = FALSE LIMIT 10');
    console.log('Тест-кейсы:', testCasesResult.rows);
    
    // Проверяем разделы
    const sectionsResult = await pool.query('SELECT id, name, project_id, parent_id FROM test_case_sections LIMIT 10');
    console.log('Разделы:', sectionsResult.rows);
    
    // Проверяем проекты
    const projectsResult = await pool.query('SELECT id, name FROM projects WHERE is_deleted = FALSE');
    console.log('Проекты:', projectsResult.rows);
    
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await pool.end();
  }
}

testDB(); 