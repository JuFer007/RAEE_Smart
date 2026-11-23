FROM node:20-alpine
ENV CI=1
ENV EXPO_NO_TELEMETRY=1
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 8081
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "8081"]
