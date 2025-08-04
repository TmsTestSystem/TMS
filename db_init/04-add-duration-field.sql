-- Добавление поля duration в таблицу test_results
ALTER TABLE test_results ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0; 