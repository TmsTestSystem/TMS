FROM node:18-alpine as build

WORKDIR /app

# Копирование package.json и установка зависимостей
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Копирование исходного кода
COPY . .

# Диагностика: выводим содержимое src/components и сам файл MainLayout.tsx
RUN ls -l /app/src/components
RUN cat /app/src/components/MainLayout.tsx

# Сборка приложения
RUN npm run build

# Продакшн этап
FROM nginx:alpine

# Копирование собранного приложения
COPY --from=build /app/build /usr/share/nginx/html

# Копирование конфигурации nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открытие порта
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"] 