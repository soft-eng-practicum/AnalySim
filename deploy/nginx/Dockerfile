# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app/src/Analysim.Web/ClientApp

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        ca-certificates \
        git \
        python3 \
        python3-pip \
        python3-venv \
    && rm -rf /var/lib/apt/lists/*

COPY src/Analysim.Web/ClientApp/package*.json ./
RUN npm ci --legacy-peer-deps

COPY src/Analysim.Web/ClientApp ./
RUN npm run build:jupyterlite
RUN find src/assets/jupyter -mindepth 1 -maxdepth 1 ! -name dist -exec rm -rf {} +
RUN npm run build -- --configuration production

FROM nginx:stable-alpine AS runtime
COPY deploy/nginx/nginx.conf /etc/nginx/nginx.conf
COPY deploy/nginx/conf.d/analysim.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/src/Analysim.Web/ClientApp/dist/ /usr/share/nginx/html/
EXPOSE 80 443
