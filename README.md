# TMS_NEXT — Система управления тестированием

Современная система управления тестированием с интеграцией Git и поддержкой Docker.

## 🚀 Быстрый старт

### 1. Клонирование и запуск
```bash
git clone <repository-url>
cd TMS_NEXT
cp .env.example .env
# Docker (рекомендуется)
docker-compose up -d --build
# Для разработки
npm run install:all
npm run dev
```

### 2. Переменные окружения
В файле `.env` укажите:
```
GIT_TOKEN=ваш_токен_github
DB_HOST=postgres
DB_PORT=55432
DB_USER=tms_user
DB_PASSWORD=tms_password
DB_NAME=tms
```

### 3. Доступ
- Интерфейс: http://localhost:8080
- API: http://localhost:5000

## 🛠 Стек
- Backend: Node.js, TypeScript, Express, PostgreSQL
- Frontend: React, TypeScript, Tailwind CSS
- Docker, Nginx, Git

## 📁 Структура
```
TMS_NEXT/
├── server/           # Backend
├── client/           # Frontend
├── db_init/          # Автоматические миграции БД
├── migrations/       # Ручные миграции
├── docker-compose.yml
└── nginx.conf
```

## 🔄 Автоматические миграции

База данных автоматически инициализируется при запуске. Все миграции применяются в правильном порядке:

- `01-init-db.sql` - Основная инициализация
- `02-add-soft-delete-fields.sql` - Поля soft delete
- `03-add-attachments-table.sql` - Таблица вложений

Подробности в [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)

## 📝 Лицензия
MIT License
