package com.usco.invernadero;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // activa application-test.properties
class InvernaderoApplicationTests {

    @Test
    void contextLoads() {
        // Verifica que el contexto de Spring Boot arranca correctamente:
        // conexión a PostgreSQL, repositorios JPA y beans del sistema.
        // OAuth2 y Security están deshabilitados en el perfil "test".
    }
}
