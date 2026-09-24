# ==========================================
# ETAPA 1: Construcción de la Web (React Vite)
# ==========================================
FROM node:20-alpine AS build
WORKDIR /app

# Copiar manifiesto de paquetes e instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Variables de entorno de compilación
ARG VITE_CLOUDINARY_CLOUD_NAME=rsoygtda
ARG VITE_CLOUDINARY_UPLOAD_PRESET=ra6ivstv
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET

# Copiar el código fuente y compilar bundle de producción
COPY . .
RUN npm run build

# ==========================================
# ETAPA 2: Servidor Nginx Optimizado
# ==========================================
FROM nginx:alpine

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados del frontend desde la etapa de build
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto HTTP
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
