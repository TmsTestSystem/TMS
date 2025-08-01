const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'tms_db',
  user: 'postgres',
  password: 'postgres'
});

const migrationSQL = `
-- Добавляем поля is_deleted и deleted_at к таблице test_cases
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Добавляем поля is_deleted и deleted_at к таблице test_plans
ALTER TABLE test_plans ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE test_plans ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Добавляем поля is_deleted и deleted_at к таблице test_runs
ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE test_runs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Добавляем поля is_deleted и deleted_at к таблице test_case_sections
ALTER TABLE test_case_sections ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE test_case_sections ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_test_cases_is_deleted ON test_cases(is_deleted);
CREATE INDEX IF NOT EXISTS idx_test_plans_is_deleted ON test_plans(is_deleted);
CREATE INDEX IF NOT EXISTS idx_test_runs_is_deleted ON test_runs(is_deleted);
CREATE INDEX IF NOT EXISTS idx_test_case_sections_is_deleted ON test_case_sections(is_deleted);
`;

async function applyMigration() {
  try {
    console.log('Применяем миграцию soft delete...');
    await pool.query(migrationSQL);
    console.log('Миграция успешно применена!');
  } catch (error) {
    console.error('Ошибка при применении миграции:', error);
  } finally {
    await pool.end();
  }
}

applyMigration(); 