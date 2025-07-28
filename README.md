# ТМС для СПР - Система управления тестированием

Современная система управления тестированием с интеграцией Git и поддержкой Docker.

## 🚀 Быстрый старт

### 1. Клонирование и настройка
```bash
git clone <repository-url>
cd TMS_NEXT
cp .env.example .env
```

### 2. Настройка переменных окружения
Отредактируйте файл `.env`:
```env
GIT_TOKEN=ваш_токен_github
DB_HOST=postgres
DB_PORT=5432
DB_USER=tms_user
DB_PASSWORD=tms_password
DB_NAME=tms
```

### 3. Запуск
```bash
# Docker (рекомендуется)
docker compose up -d --build

# Локальная разработка
npm run install:all
npm run dev
```

### 4. Доступ к приложению
- **Основной интерфейс**: http://localhost:8080
- **API сервер**: http://localhost:5000

## �� Доступ к системе

Авторизация отключена: система работает в дефолтном открытом режиме, все функции доступны сразу после запуска без ввода логина и пароля.

**Примечание**: В будущих версиях может быть добавлена система авторизации для безопасности.

## 🛠 Технологический стек

- **Backend**: Node.js + TypeScript + Express + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS
- **Инфраструктура**: Docker + Nginx + Git

## 📁 Структура проекта

```
TMS_NEXT/
├── server/                 # Backend
├── client/                 # Frontend
├── docker-compose.yml      # Docker конфигурация
├── nginx.conf             # Nginx конфигурация
└── init-db.sql            # Инициализация БД
```

## 🔧 Разработка

```bash
# Установка зависимостей
npm run install:all

# Запуск для разработки
npm run dev

# Тесты
npm run test
```

## 📝 Лицензия

MIT License 