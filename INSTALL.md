# Инструкция по установке ТМС для СПР

## 📋 Что нужно установить

### 1. Node.js (версия 18 или выше)

#### Windows:
1. Скачайте установщик с [официального сайта](https://nodejs.org/)
2. Запустите установщик и следуйте инструкциям
3. Проверьте установку: `node --version` и `npm --version`

#### macOS:
```bash
# Через Homebrew
brew install node

# Или скачайте с официального сайта
```

#### Linux (Ubuntu/Debian):
```bash
# Добавление репозитория NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Установка Node.js
sudo apt-get install -y nodejs

# Проверка версии
node --version
npm --version
```

### 2. Git

#### Windows:
1. Скачайте с [git-scm.com](https://git-scm.com/)
2. Установите с настройками по умолчанию

#### macOS:
```bash
# Через Homebrew
brew install git

# Или через Xcode Command Line Tools
xcode-select --install
```

#### Linux:
```bash
# Ubuntu/Debian
sudo apt-get install git

# CentOS/RHEL
sudo yum install git
```

### 3. Docker и Docker Compose

#### Windows:
1. Установите [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Docker Compose включен в Docker Desktop

#### macOS:
1. Установите [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Docker Compose включен в Docker Desktop

#### Linux (Ubuntu):
```bash
# Удаление старых версий
sudo apt-get remove docker docker-engine docker.io containerd runc

# Установка зависимостей
sudo apt-get update
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Добавление GPG ключа Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Настройка репозитория
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker Engine
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезагрузка системы (для применения группы docker)
sudo reboot
```

### 4. PostgreSQL (для локальной разработки)

#### Windows:
1. Скачайте с [postgresql.org](https://www.postgresql.org/download/windows/)
2. Установите с настройками по умолчанию
3. Запомните пароль для пользователя postgres

#### macOS:
```bash
# Через Homebrew
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu):
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Запуск сервиса
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Настройка пользователя
sudo -u postgres createuser --interactive
sudo -u postgres createdb tms_spr
```

## 🚀 Быстрая установка (автоматический скрипт)

### Windows (PowerShell):
```powershell
# Скачивание и запуск скрипта установки
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/your-repo/install.ps1" -OutFile "install.ps1"
.\install.ps1
```

### Linux/macOS:
```bash
# Скачивание и запуск скрипта установки
curl -fsSL https://raw.githubusercontent.com/your-repo/install.sh | bash
```

## 🔧 Проверка установки

После установки всех компонентов выполните проверку:

```bash
# Проверка Node.js
node --version  # Должно быть v18.0.0 или выше
npm --version   # Должно быть 8.0.0 или выше

# Проверка Git
git --version

# Проверка Docker
docker --version
docker-compose --version

# Проверка PostgreSQL (если установлен локально)
psql --version
```

## 📦 Установка зависимостей проекта

После установки всех системных зависимостей:

```bash
# Клонирование репозитория
git clone <your-repository-url>
cd TMS_NEW

# Установка всех зависимостей
npm run install:all

# Или установка по отдельности
npm install
cd server && npm install
cd ../client && npm install
```

## 🌐 Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# База данных
DATABASE_URL=postgresql://tms_user:tms_password@localhost:5432/tms_spr

# JWT секрет (измените на свой)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Путь к Git репозиториям
GIT_REPO_PATH=./git-repos

# Режим работы
NODE_ENV=development

# Порт сервера
PORT=5000

# URL клиента
CLIENT_URL=http://localhost:3000
```

## 🐳 Запуск в Docker

```bash
# Сборка образов
npm run docker:build

# Запуск всех сервисов
npm run docker:up

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

## 🛠 Запуск для разработки

```bash
# Запуск сервера и клиента одновременно
npm run dev

# Или по отдельности
npm run server:dev  # Сервер на порту 5000
npm run client:dev  # Клиент на порту 3000
```

## 🔍 Устранение проблем

### Проблемы с Docker:
```bash
# Очистка Docker
docker system prune -a
docker volume prune

# Перезапуск Docker
sudo systemctl restart docker
```

### Проблемы с Node.js:
```bash
# Очистка npm кэша
npm cache clean --force

# Удаление node_modules и переустановка
rm -rf node_modules package-lock.json
npm install
```

### Проблемы с PostgreSQL:
```bash
# Проверка статуса сервиса
sudo systemctl status postgresql

# Перезапуск сервиса
sudo systemctl restart postgresql

# Проверка подключения
psql -h localhost -U tms_user -d tms_spr
```

## 📞 Поддержка

Если у вас возникли проблемы с установкой:

1. Проверьте версии установленных компонентов
2. Убедитесь, что все сервисы запущены
3. Проверьте логи: `docker-compose logs`
4. Создайте issue в репозитории с описанием проблемы

## 🔄 Обновление

Для обновления системы:

```bash
# Обновление кода
git pull origin main

# Пересборка Docker образов
docker-compose down
docker-compose build --no-cache
docker-compose up -d
``` 