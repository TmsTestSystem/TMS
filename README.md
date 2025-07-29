<<<<<<< HEAD
# TMS_NEXT — Система управления тестированием

Современная система управления тестированием с интеграцией Git и поддержкой Docker.

## 🚀 Быстрый старт

### 1. Клонирование и запуск
```bash
git clone <repository-url>
cd TMS_NEXT
cp .env.example .env
# Docker (рекомендуется)
docker compose up -d --build
# Для разработки
npm run install:all
npm run dev
```

### 2. Переменные окружения
В файле `.env` укажите:
```
GIT_TOKEN=ваш_токен_github
DB_HOST=postgres
DB_PORT=5432
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
├── server/    # Backend
├── client/    # Frontend
├── docker-compose.yml
├── nginx.conf
└── init-db.sql
```

## 📝 Лицензия
MIT License 
=======
# TMS
>>>>>>> ed78fbb56555ac596e2df1ad3bfa1e40800e540c
