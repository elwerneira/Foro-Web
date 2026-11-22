FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY angular.json tsconfig*.json ./
COPY src src
COPY public public
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine
COPY --chmod=644 nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/foro-web/browser /usr/share/nginx/html
EXPOSE 8080
