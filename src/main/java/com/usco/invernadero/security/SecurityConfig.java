package com.usco.invernadero.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private OAuthUsuarioService oAuthUsuarioService;

    /**
     * Este filterChain solo se crea si NO existe otro SecurityFilterChain.
     * En pruebas, TestSecurityConfig registra su propio bean primero,
     * por lo que este queda desactivado automáticamente.
     */
    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/login", "/login/**",
                    "/oauth2/**",
                    "/api/auth/me",
                    "/api/auth/login",
                    "/api/auth/registro",
                    "/swagger-ui/**", "/v3/api-docs/**",
                    "/error"
                ).permitAll()
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,    "/api/**").hasAnyRole("ADMIN", "OPERADOR", "VIEWER")
                .requestMatchers(HttpMethod.POST,   "/api/**").hasAnyRole("ADMIN", "OPERADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/**").hasAnyRole("ADMIN", "OPERADOR")
                .requestMatchers(HttpMethod.PUT,    "/api/**").hasAnyRole("ADMIN", "OPERADOR")
                .anyRequest().authenticated()
            )

            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/api/auth/login")
                .defaultSuccessUrl("http://localhost:5173", true)
                .failureUrl("http://localhost:5173/login?error=true")
                .permitAll()
            )

            .oauth2Login(oauth -> oauth
                .loginPage("/login")
                .userInfoEndpoint(ui -> ui.userService(oAuthUsuarioService))
                .defaultSuccessUrl("http://localhost:5173", true)
                .failureUrl("http://localhost:5173/login?error=google")
            )

            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessUrl("http://localhost:5173/login")
                .deleteCookies("JSESSIONID")
                .permitAll()
            )

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    if (req.getRequestURI().startsWith("/api/")) {
                        res.setStatus(401);
                        res.setContentType("application/json");
                        res.getWriter().write("{\"error\":\"No autenticado\"}");
                    } else {
                        res.sendRedirect("http://localhost:5173/login");
                    }
                })
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
