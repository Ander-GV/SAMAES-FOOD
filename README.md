SAMAES FOOD — Sistema de Gestión Gastronómica & POS

Sistema integral para restaurantes con Punto de Venta (POS), control de comandas, escandallo de ingredientes, gestión de inventario, arqueo de caja con control de pagos diarios a empleados, fotos en la nube (Cloudinary) y base de datos PostgreSQL Serverless (NeonDB).

---

Despliegue con Docker Compose (Un solo comando)

Para compilar y levantar todo el sistema (Backend Java 21 + Frontend React Nginx):

```bash
docker compose up -d --build
```

 Acceso a los Servicios:
 Aplicación Web / POS:** `http://localhost` (Puerto 80)
 Backend API REST:** `http://localhost:8080` (Puerto 8080)
 Documentación Swagger OpenAPI:** `http://localhost:8080/swagger-ui.html`

---

Base de datos

SAMAES FOOD utiliza PostgreSQL como sistema de gestión de base de datos y puede ejecutarse mediante Docker.

Por motivos de seguridad, el archivo de semilla utilizado durante el desarrollo (neon_seed.sql) no se incluye en este repositorio, ya que contiene datos de configuración y credenciales de prueba que no deben exponerse públicamente.

Para ejecutar el proyecto:

Configura las variables de entorno utilizando .env.example como referencia.
Crea una base de datos PostgreSQL.
Ejecuta las migraciones/configuración de la aplicación.
Si deseas utilizar datos iniciales, puedes crear tus propios registros de prueba.


---


 Stack Tecnológico

 **Frontend:** React 19, Vite, Lucide Icons, Canvas Confetti, CSS personalizado temático.
* **Backend:** Java 21, Spring Boot 4 / 3, Spring Security, JWT, MapStruct, Lombok.
* **Base de Datos:** PostgreSQL en la Nube ([Neon.tech](https://neon.tech)).
* **Imágenes / CDN:** [Cloudinary](https://cloudinary.com) con auto-compresión WebP.
* **Servidor Web:** Nginx Alpine con Proxy Inverso y compresión Gzip.
