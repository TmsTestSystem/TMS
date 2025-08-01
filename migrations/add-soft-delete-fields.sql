-- Миграция для добавления полей soft delete
-- Выполняется для существующих таблиц

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

-- Обновляем init-db.sql для новых установок
-- (этот файл будет обновлен отдельно) 