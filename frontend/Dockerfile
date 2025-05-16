FROM node:18-alpine

WORKDIR /frontend

# Установка зависимостей
COPY package.json package-lock.json* ./
RUN npm install

# Копирование исходного кода
COPY . .

# Запуск приложения
CMD ["npm", "start"]