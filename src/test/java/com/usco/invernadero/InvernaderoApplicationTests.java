package com.usco.invernadero;

import com.usco.invernadero.config.TestSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
class InvernaderoApplicationTests {

    @Test
    void contextLoads() {
        // Verifica que el contexto de Spring Boot arranca correctamente:
        // conexión a PostgreSQL, repositorios JPA y beans del sistema.
        // OAuth2 y Security están simplificados en el perfil "test".
    }
}
