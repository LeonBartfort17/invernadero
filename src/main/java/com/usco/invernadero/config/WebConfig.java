package com.usco.invernadero.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración global de CORS para toda la API.
 *
 * CORRECCIÓN: Antes solo ZonaController tenía @CrossOrigin("http://localhost:5173").
 * Los demás controladores (Cultivo, Sensor, Medicion, Usuario, Invernadero) no lo
 * tenían, causando errores CORS inconsistentes desde el frontend React.
 *
 * Esta clase centraliza la política en un único lugar.
 * Para producción: reemplazar los orígenes con la URL real del frontend.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",  // Vite dev server
                        "http://localhost:3000"   // Alternativa CRA / Next.js
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // Cache del preflight: 1 hora
    }
}
