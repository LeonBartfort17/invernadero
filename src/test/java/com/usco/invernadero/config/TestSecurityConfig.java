package com.usco.invernadero.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de seguridad para pruebas.
 * Al registrar SecurityFilterChain primero, desactiva el de SecurityConfig
 * gracias al @ConditionalOnMissingBean en ese archivo.
 */
@TestConfiguration
public class TestSecurityConfig {

    @Bean
    public SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
