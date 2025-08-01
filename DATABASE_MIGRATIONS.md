# Система автоматических миграций базы данных

## Обзор

Теперь база данных автоматически инициализируется при каждом запуске `docker-compose up --build`. Все миграции применяются в правильном порядке без необходимости ручного вмешательства.

## Структура миграций

Файлы миграций находятся в папке `db_init/` и выполняются в алфавитном порядке:

1. `01-init-db.sql` - Основная инициализация базы данных
   - Создание всех основных таблиц
   - Создание индексов
   - Вставка начальных данных

2. `02-add-soft-delete-fields.sql` - Добавление полей soft delete
   - Добавляет поля `is_deleted` и `deleted_at` ко всем таблицам
   - Использует проверки `IF NOT EXISTS` для безопасного выполнения

3. `03-add-attachments-table.sql` - Создание таблицы вложений
   - Создает таблицу `attachments` для хранения файлов
   - Добавляет необходимые индексы

## Как это работает

1. При запуске PostgreSQL контейнера, Docker автоматически выполняет все `.sql` файлы из папки `/docker-entrypoint-initdb.d/`
2. Файлы выполняются в алфавитном порядке
3. Каждая миграция использует `IF NOT EXISTS` проверки для безопасного повторного выполнения
4. База данных готова к работе сразу после запуска контейнеров

## Преимущества новой системы

✅ **Автоматическая инициализация** - не нужно вручную применять миграции  
✅ **Безопасность** - миграции можно выполнять многократно без ошибок  
✅ **Порядок выполнения** - файлы выполняются в правильном порядке  
✅ **Простота развертывания** - один `docker-compose up --build` и все готово  
✅ **Совместимость** - работает как с новой, так и с существующей базой данных  

## Добавление новых миграций

Для добавления новой миграции:

1. Создайте файл в папке `db_init/` с именем, начинающимся с номера (например, `04-add-new-feature.sql`)
2. Используйте `IF NOT EXISTS` проверки для безопасного выполнения
3. Добавьте комментарии для документации

Пример:
```sql
-- Миграция: Добавление новой функции
-- Этот файл выполняется после предыдущих миграций

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'table_name' AND column_name = 'new_column') THEN
        ALTER TABLE table_name ADD COLUMN new_column VARCHAR(255);
    END IF;
END $$;
```

## Проверка состояния базы данных

Для проверки, что миграции применились корректно:

```bash
# Проверить структуру таблицы
docker exec tms_next-postgres-1 psql -h localhost -p 55432 -U tms_user -d tms -c "\d table_name"

# Проверить список таблиц
docker exec tms_next-postgres-1 psql -h localhost -p 55432 -U tms_user -d tms -c "\dt"

# Проверить логи сервера
docker-compose logs server
```

## Сброс базы данных

Для полного сброса базы данных:

```bash
docker-compose down -v
docker-compose up -d
```

Флаг `-v` удаляет все volumes, включая данные базы данных. 