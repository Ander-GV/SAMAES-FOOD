# ==========================================
# ETAPA 1: Construcción del JAR (Build Stage)
# ==========================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copiar configuración de dependencias primero para aprovechar la caché de Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente y compilar el proyecto empaquetando el JAR final
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# ETAPA 2: Imagen Ligera de Ejecución (Runtime)
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Crear usuario sin privilegios por seguridad
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copiar el ejecutable generado desde la etapa de compilación
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto del Backend
EXPOSE 8080

# Variables de entorno por defecto
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

# Comando de inicio del servicio
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
