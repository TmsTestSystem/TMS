-- Миграция: Добавление полей soft delete
-- Этот файл выполняется после основной инициализации

-- Добавление полей is_deleted и deleted_at к существующим таблицам
DO $$ 
BEGIN
    -- Добавляем поля только если они еще не существуют
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_plans' AND column_name = 'is_deleted') THEN
        ALTER TABLE test_plans ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_plans' AND column_name = 'deleted_at') THEN
        ALTER TABLE test_plans ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_runs' AND column_name = 'is_deleted') THEN
        ALTER TABLE test_runs ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_runs' AND column_name = 'deleted_at') THEN
        ALTER TABLE test_runs ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_cases' AND column_name = 'is_deleted') THEN
        ALTER TABLE test_cases ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_cases' AND column_name = 'deleted_at') THEN
        ALTER TABLE test_cases ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_deleted') THEN
        ALTER TABLE projects ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deleted_at') THEN
        ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_deleted') THEN
        ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'deleted_at') THEN
        ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_case_sections' AND column_name = 'is_deleted') THEN
        ALTER TABLE test_case_sections ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_case_sections' AND column_name = 'deleted_at') THEN
        ALTER TABLE test_case_sections ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_results' AND column_name = 'is_deleted') THEN
        ALTER TABLE test_results ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_results' AND column_name = 'deleted_at') THEN
        ALTER TABLE test_results ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists' AND column_name = 'is_deleted') THEN
        ALTER TABLE checklists ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklists' AND column_name = 'deleted_at') THEN
        ALTER TABLE checklists ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items' AND column_name = 'is_deleted') THEN
        ALTER TABLE checklist_items ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_items' AND column_name = 'deleted_at') THEN
        ALTER TABLE checklist_items ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_results' AND column_name = 'is_deleted') THEN
        ALTER TABLE checklist_results ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'checklist_results' AND column_name = 'deleted_at') THEN
        ALTER TABLE checklist_results ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'is_deleted') THEN
        ALTER TABLE comments ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'deleted_at') THEN
        ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tags' AND column_name = 'is_deleted') THEN
        ALTER TABLE tags ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tags' AND column_name = 'deleted_at') THEN
        ALTER TABLE tags ADD COLUMN deleted_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_case_tags' AND column_name = 'is_deleted') THEN
        ALTER TABLE test_case_tags ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'test_case_tags' AND column_name = 'deleted_at') THEN
        ALTER TABLE test_case_tags ADD COLUMN deleted_at TIMESTAMP;
    END IF;
END $$; 