# Soft Delete Implementation

## Обзор

Реализована система мягкого удаления (soft delete) для основных сущностей TMS:
- Test Cases (тест-кейсы)
- Test Plans (тест-планы) 
- Test Runs (тестовые прогоны)
- Test Case Sections (разделы тест-кейсов)

## Изменения в базе данных

### Новые поля
Для каждой таблицы добавлены поля:
- `is_deleted` (BOOLEAN DEFAULT FALSE) - флаг удаления
- `deleted_at` (TIMESTAMP) - время удаления

### Индексы
Созданы индексы для оптимизации запросов:
- `idx_test_cases_is_deleted`
- `idx_test_plans_is_deleted`
- `idx_test_runs_is_deleted`
- `idx_test_case_sections_is_deleted`

## API изменения

### DELETE endpoints
Все DELETE endpoints теперь выполняют soft delete:
```sql
UPDATE table_name SET is_deleted = TRUE, deleted_at = NOW() 
WHERE id = $1 AND is_deleted = FALSE
```

### GET endpoints
Все GET endpoints фильтруют удаленные записи:
```sql
SELECT * FROM table_name WHERE is_deleted = FALSE
```

### Новые RESTORE endpoints
Добавлены endpoints для восстановления:
- `POST /api/test-cases/:id/restore`
- `POST /api/test-plans/:id/restore`
- `POST /api/test-runs/:id/restore`

## Git синхронизация

### Экспорт
При экспорте в Git включаются все записи (включая удаленные) для синхронизации статуса удаления между репозиториями.

### Импорт
При импорте из Git корректно обрабатываются поля `is_deleted` и `deleted_at`, обеспечивая синхронизацию удалений между участниками команды.

## Миграция существующих данных

### Для новых установок
Файл `init-db.sql` обновлен и включает новые поля.

### Для существующих баз данных
Выполните SQL-скрипт `migrations/add-soft-delete-fields.sql`:

```sql
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
```

## Клиентские интерфейсы

Обновлены TypeScript интерфейсы для поддержки новых полей:
- `TestCase`
- `TestPlan`
- `TestRun`

## Преимущества

1. **Сохранение истории** - удаленные записи остаются в базе данных
2. **Возможность восстановления** - удаленные записи можно восстановить
3. **Git синхронизация** - удаления синхронизируются между репозиториями
4. **Обратная совместимость** - существующие данные не затрагиваются
5. **Производительность** - индексы обеспечивают быстрые запросы

## Тестирование

Для проверки работы soft delete:

1. Создайте тест-кейс/план/прогон
2. Удалите его через UI
3. Проверьте, что он исчез из списков
4. Выполните Git push
5. На другой машине выполните Git pull
6. Проверьте, что удаление синхронизировалось
7. Используйте RESTORE endpoint для восстановления 