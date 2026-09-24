#!/bin/bash
# ==============================================================================
# SAMAES FOOD — Script Automatizado de Configuración SSL / HTTPS (Let's Encrypt)
# ==============================================================================

set -e

if [ "$#" -lt 2 ]; then
    echo "====================================================================="
    echo "❌ USO: ./setup_ssl.sh <tu-dominio.com> <tu-email@gmail.com>"
    echo "Ejemplo: ./setup_ssl.sh samaesfood.com admin@samaesfood.com"
    echo "====================================================================="
    exit 1
fi

DOMINIO=$1
EMAIL=$2

echo "🚀 Iniciando configuración SSL para: $DOMINIO ($EMAIL)"

# 1. Instalar Certbot si no está instalado
echo "📦 1/5 Instalando Certbot..."
apt-get update -qq
apt-get install -y certbot -qq

# 2. Detener frontend para liberar el puerto 80
echo "🛑 2/5 Deteniendo contenedor frontend temporalmente..."
cd /root/restaurante-api
docker compose stop frontend || true

# 3. Obtener certificado SSL Let's Encrypt
echo "🔒 3/5 Solicitando certificado SSL gratuito a Let's Encrypt..."
certbot certonly --standalone \
    -d "$DOMINIO" \
    --agree-tos \
    --non-interactive \
    --email "$EMAIL"

# 4. Crear configuración Nginx con soporte HTTPS y redirección automática
echo "⚙️ 4/5 Configurando Nginx con SSL y Proxy Inverso..."
cat <<EOF > /root/restaurante-api/frontend/nginx.conf
server {
    listen 80;
    server_name $DOMINIO www.$DOMINIO localhost;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name $DOMINIO www.$DOMINIO localhost;

    ssl_certificate /etc/letsencrypt/live/$DOMINIO/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMINIO/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /usr/share/nginx/html;
    index index.html;

    # Compresión Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;

    # SPA Routing (React Router)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API REST Proxy al Backend Spring Boot
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Caché estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# 5. Asegurar montaje de certificados en docker-compose.yml
echo "🐳 5/5 Actualizando docker-compose.yml con puerto 443 y volumen SSL..."
cat <<EOF > /root/restaurante-api/docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: samaes_postgres
    restart: always
    environment:
      POSTGRES_DB: restaurante_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${DB_PASSWORD:-RestaurantePostgres2026Secure}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./neon_seed.sql:/docker-entrypoint-initdb.d/init.sql:ro
    ports:
      - "5432:5432"
    networks:
      - samaes_network

  backend:
    build:
      context: ./restaurante-api
      dockerfile: Dockerfile
    container_name: samaes_backend
    restart: always
    depends_on:
      - postgres
    environment:
      - SPRING_DATASOURCE_URL=\${SPRING_DATASOURCE_URL:-jdbc:postgresql://postgres:5432/restaurante_db}
      - SPRING_DATASOURCE_USERNAME=\${SPRING_DATASOURCE_USERNAME:-postgres}
      - SPRING_DATASOURCE_PASSWORD=\${SPRING_DATASOURCE_PASSWORD:-RestaurantePostgres2026Secure}
      - SPRING_JPA_HIBERNATE_DDL_AUTO=\${SPRING_JPA_HIBERNATE_DDL_AUTO:-update}
      - APP_JWT_SECRET=\${JWT_SECRET:-RestauranteSecretKeyForJWTAuthTokenGeneration2026SecureKeyWithMin256Bits}
      - JAVA_OPTS=-Xms256m -Xmx512m -XX:+UseG1GC
    ports:
      - "8080:8080"
    networks:
      - samaes_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_CLOUDINARY_CLOUD_NAME=\${VITE_CLOUDINARY_CLOUD_NAME:-rsoygtda}
        - VITE_CLOUDINARY_UPLOAD_PRESET=\${VITE_CLOUDINARY_UPLOAD_PRESET:-ra6ivstv}
    container_name: samaes_frontend
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend
    networks:
      - samaes_network

volumes:
  postgres_data:
    driver: local

networks:
  samaes_network:
    driver: bridge
EOF

# 6. Levantar todo el stack con HTTPS
echo "🚀 Levantando contenedores con HTTPS activo..."
docker compose up -d --build

echo "====================================================================="
echo "✅ ¡SSL / HTTPS configurado exitosamente!"
echo "🌐 Ya puedes ingresar con candado verde seguro en:"
echo "👉 https://$DOMINIO"
echo "====================================================================="
