-- Миграция для добавления таблицы вложений
-- Выполняется для существующих таблиц

-- Создание таблицы вложений
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_case_id UUID REFERENCES test_cases(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    description TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_attachments_test_case_id ON attachments(test_case_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments(created_at);

-- Добавление комментария к таблице
COMMENT ON TABLE attachments IS 'Вложения к тест-кейсам (скриншоты, документы, логи и т.д.)';
COMMENT ON COLUMN attachments.filename IS 'Уникальное имя файла в системе';
COMMENT ON COLUMN attachments.original_filename IS 'Оригинальное имя файла';
COMMENT ON COLUMN attachments.file_path IS 'Путь к файлу в файловой системе';
COMMENT ON COLUMN attachments.file_size IS 'Размер файла в байтах';
COMMENT ON COLUMN attachments.mime_type IS 'MIME-тип файла';
COMMENT ON COLUMN attachments.description IS 'Описание вложения'; 