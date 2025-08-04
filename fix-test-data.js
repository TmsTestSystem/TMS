const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'tms_user',
  password: 'tms_password',
  database: 'tms'
});

async function fixTestData() {
  try {
    console.log('🔍 Проверка данных в базе...');
    
    // 1. Проверяем проекты
    const projectsResult = await pool.query('SELECT id, name FROM projects WHERE is_deleted = FALSE');
    console.log('📁 Проекты:', projectsResult.rows);
    
    if (projectsResult.rows.length === 0) {
      console.log('❌ Нет проектов в базе данных');
      return;
    }
    
    const projectId = projectsResult.rows[0].id;
    console.log('🎯 Используем проект:', projectsResult.rows[0].name, 'ID:', projectId);
    
    // 2. Проверяем тест-планы
    const testPlansResult = await pool.query('SELECT id, name, project_id FROM test_plans WHERE is_deleted = FALSE');
    console.log('📋 Тест-планы:', testPlansResult.rows);
    
    if (testPlansResult.rows.length === 0) {
      console.log('❌ Нет тест-планов в базе данных');
      return;
    }
    
    const testPlanId = testPlansResult.rows[0].id;
    console.log('🎯 Используем тест-план:', testPlansResult.rows[0].name, 'ID:', testPlanId);
    
    // 3. Проверяем тест-кейсы
    const testCasesResult = await pool.query('SELECT id, title, project_id, test_plan_id, section_id FROM test_cases WHERE is_deleted = FALSE LIMIT 10');
    console.log('🧪 Тест-кейсы:', testCasesResult.rows);
    
    // 4. Проверяем разделы
    const sectionsResult = await pool.query('SELECT id, name, project_id, parent_id FROM test_case_sections LIMIT 10');
    console.log('📂 Разделы:', sectionsResult.rows);
    
    // 5. Если есть тест-кейсы, но они не связаны с тест-планом, связываем их
    if (testCasesResult.rows.length > 0) {
      console.log('🔗 Связываем тест-кейсы с тест-планом...');
      
      for (const testCase of testCasesResult.rows) {
        if (!testCase.test_plan_id) {
          console.log(`  📝 Связываем кейс "${testCase.title}" с планом`);
          await pool.query(
            'UPDATE test_cases SET test_plan_id = $1 WHERE id = $2',
            [testPlanId, testCase.id]
          );
        }
      }
      
      console.log('✅ Тест-кейсы связаны с планом');
    }
    
    // 6. Если нет разделов, создаем базовые разделы
    if (sectionsResult.rows.length === 0) {
      console.log('📂 Создаем базовые разделы...');
      
      const basicSections = [
        { name: 'Функциональное тестирование', order_index: 1 },
        { name: 'Интеграционное тестирование', order_index: 2 },
        { name: 'Системное тестирование', order_index: 3 },
        { name: 'Приемочное тестирование', order_index: 4 }
      ];
      
      for (const section of basicSections) {
        await pool.query(
          `INSERT INTO test_case_sections (project_id, name, order_index, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())`,
          [projectId, section.name, section.order_index]
        );
        console.log(`  📁 Создан раздел: ${section.name}`);
      }
      
      console.log('✅ Базовые разделы созданы');
    }
    
    // 7. Финальная проверка
    console.log('\n🔍 Финальная проверка:');
    
    const finalTestCasesResult = await pool.query(
      'SELECT id, title, test_plan_id FROM test_cases WHERE test_plan_id = $1 AND is_deleted = FALSE',
      [testPlanId]
    );
    console.log('🧪 Тест-кейсы в плане:', finalTestCasesResult.rows.length);
    
    const finalSectionsResult = await pool.query(
      'SELECT id, name FROM test_case_sections WHERE project_id = $1',
      [projectId]
    );
    console.log('📂 Разделы в проекте:', finalSectionsResult.rows.length);
    
    console.log('✅ Проверка завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await pool.end();
  }
}

fixTestData(); 