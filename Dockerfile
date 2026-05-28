# ── Etapa 1: compilar el proyecto con Gradle ──────────────────────
FROM gradle:8.5-jdk21 AS build
WORKDIR /app

# Copiar archivos de configuración de Gradle primero (cache de dependencias)
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
RUN ./gradlew dependencies --no-daemon || true

# Copiar el código fuente y compilar sin ejecutar tests
COPY src ./src
RUN ./gradlew build -x test --no-daemon

# ── Etapa 2: imagen final liviana solo con el JAR ─────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiar el JAR generado en la etapa anterior
COPY --from=build /app/build/libs/*.jar app.jar

# Puerto que expone el backend Spring Boot
EXPOSE 8080

# Comando de arranque
ENTRYPOINT ["java", "-jar", "app.jar"]
