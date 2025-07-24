-- Создание базы данных ТМС для СПР
-- База данных уже создана через переменные окружения

-- Создание пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание проектов
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    git_repo_url VARCHAR(255),
    git_branch VARCHAR(100) DEFAULT 'main',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание тест-планов
CREATE TABLE test_plans (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Разделы для тест-кейсов
CREATE TABLE test_case_sections (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES test_case_sections(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание тест-кейсов
CREATE TABLE test_cases (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    test_plan_id INTEGER REFERENCES test_plans(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    preconditions TEXT,
    steps TEXT,
    expected_result TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'draft',
    created_by INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    section_id INTEGER REFERENCES test_case_sections(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание чек-листов
CREATE TABLE checklists (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание элементов чек-листа
CREATE TABLE checklist_items (
    id SERIAL PRIMARY KEY,
    checklist_id INTEGER REFERENCES checklists(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание тестовых прогонов
CREATE TABLE test_runs (
    id SERIAL PRIMARY KEY,
    test_plan_id INTEGER REFERENCES test_plans(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'planned',
    started_by INTEGER REFERENCES users(id),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание результатов тестов
CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    test_run_id INTEGER REFERENCES test_runs(id) ON DELETE CASCADE,
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_run',
    executed_by INTEGER REFERENCES users(id),
    executed_at TIMESTAMP,
    notes TEXT,
    duration INTEGER, -- в секундах
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание результатов чек-листов
CREATE TABLE checklist_results (
    id SERIAL PRIMARY KEY,
    test_result_id INTEGER REFERENCES test_results(id) ON DELETE CASCADE,
    checklist_item_id INTEGER REFERENCES checklist_items(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_checked',
    notes TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание комментариев
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(20) NOT NULL, -- 'test_case', 'test_run', 'test_result'
    entity_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание тегов
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Связь тег-тест-кейс
CREATE TABLE test_case_tags (
    test_case_id INTEGER REFERENCES test_cases(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (test_case_id, tag_id)
);

-- Создание индексов для оптимизации
CREATE INDEX idx_test_cases_project_id ON test_cases(project_id);
CREATE INDEX idx_test_cases_test_plan_id ON test_cases(test_plan_id);
CREATE INDEX idx_test_results_test_run_id ON test_results(test_run_id);
CREATE INDEX idx_test_results_test_case_id ON test_results(test_case_id);
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);

-- Вставка начальных данных
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('admin', 'admin@spr.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aA0bB1cC2dE3fF4gG5hH6iI7jJ8kK9lL0mM1nN2oO3pP4qQ5rR6sS7tT8uU9vV0wW1xX2yY3zZ', 'Администратор', 'Системы', 'admin');

INSERT INTO tags (name, color) VALUES
('Критический', '#EF4444'),
('Высокий', '#F59E0B'),
('Средний', '#10B981'),
('Низкий', '#6B7280'),
('Баг', '#DC2626'),
('Улучшение', '#2563EB');

-- Создание проекта СПР
INSERT INTO projects (name, description, created_by, created_at, updated_at) VALUES
('СПР', 'Система поддержки решений - основной проект для тестирования функциональности ТМС', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 