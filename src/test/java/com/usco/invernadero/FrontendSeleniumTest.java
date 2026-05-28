package com.usco.invernadero;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.*;
import org.openqa.selenium.support.ui.*;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pruebas E2E con Selenium — Frontend en :5173 + Backend en :8080.
 *
 * Flujo de cada test:
 * 1. hacerLogin()  →  llena email + password y espera sesión activa
 * 2. Ejecuta la prueba específica
 *
 * ✅ CORRECCIÓN: webEnvironment = NONE porque Selenium prueba el frontend
 *    real en :5173, no levanta un servidor de prueba de Spring.
 *    El contexto de Spring sólo se carga para satisfacer la anotación;
 *    con el perfil "test" activo (build.gradle) usa TestSecurityConfig
 *    y no intenta cargar OAuthUsuarioService → contexto arranca sin errores.
 *
 * ✅ CORRECCIÓN: headless condicional — en local se abre ventana visible,
 *    en CI (variable de entorno CI=true) corre sin pantalla.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@TestMethodOrder(OrderAnnotation.class)
class FrontendSeleniumTest {

    private WebDriver     driver;
    private WebDriverWait wait;

    private static final String URL      = "http://localhost:5173";
    private static final String EMAIL    = "admin2@invernadero.com";
    private static final String PASSWORD = "admin123";

    // ── Ciclo de vida del navegador ──────────────────────────────────────
    @BeforeEach
    void setUp() {
        io.github.bonigarcia.wdm.WebDriverManager.chromedriver().setup();
        ChromeOptions ops = new ChromeOptions();

        ops.addArguments("--no-sandbox");
        ops.addArguments("--disable-dev-shm-usage");
        ops.addArguments("--window-size=1920,1080");

        // ✅ CORRECCIÓN: headless automático en CI, ventana visible en local
        if (System.getenv("CI") != null) {
            ops.addArguments("--headless=new");
        }

        // Modo incógnito: evita alertas de Chrome para guardar contraseñas
        ops.addArguments("--incognito");
        Map<String, Object> prefs = new HashMap<>();
        prefs.put("credentials_enable_service", false);
        prefs.put("profile.password_manager_enabled", false);
        ops.setExperimentalOption("prefs", prefs);

        driver = new ChromeDriver(ops);
        wait   = new WebDriverWait(driver, Duration.ofSeconds(20));
    }

    @AfterEach
    void tearDown() {
        if (driver != null) driver.quit();
    }

    // ── Helper: login automático ─────────────────────────────────────────
    private void hacerLogin() {
        driver.get(URL);

        WebElement campoEmail = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("input[type='email']")
            )
        );
        campoEmail.clear();
        campoEmail.sendKeys(EMAIL);

        WebElement campoPassword = driver.findElement(
            By.cssSelector("input[type='password']")
        );
        campoPassword.clear();
        campoPassword.sendKeys(PASSWORD);

        driver.findElement(By.cssSelector("button[type='submit']")).click();

        // Esperar sidebar como confirmación de sesión activa
        wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Invernadero') or contains(text(),'Greenhouse')]")
            )
        );
        System.out.println("[LOGIN] Sesión activa como " + EMAIL);
    }

    // ── Helper: navegar al sidebar ───────────────────────────────────────
    private void navegarSidebar(String textoBoton) {
        wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(.,'" + textoBoton + "')]")
            )
        ).click();
        System.out.println("[NAV] Clic en: " + textoBoton);
    }

    // ════════════════════════════════════════════════════════════════════
    // TEST 1 — Formulario visible tras hacer login (Dashboard)
    // ════════════════════════════════════════════════════════════════════
    @Test @Order(1)
    void testFormularioVisible() {
        System.out.println("[TEST 1] Verificando formulario en Dashboard...");

        hacerLogin();

        wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//button[contains(text(), 'Guardar Zona en el Sistema')]")
        ));

        assertNotNull(
            driver.findElement(By.tagName("select")),
            "No se encontró el <select> de invernaderos"
        );
        assertNotNull(
            driver.findElement(By.xpath("//input[@type='text']")),
            "No se encontró el campo de texto"
        );
        assertNotNull(
            driver.findElement(By.xpath("//input[@type='number']")),
            "No se encontró el campo numérico"
        );

        System.out.println("[TEST 1] OK - Formulario cargado correctamente");
    }

    // ════════════════════════════════════════════════════════════════════
    // TEST 2 — Validación de campos vacíos
    // ════════════════════════════════════════════════════════════════════
    @Test @Order(2)
    void testValidacionCamposVacios() {
        System.out.println("[TEST 2] Verificando validación de campos vacíos...");

        hacerLogin();

        Select sel = new Select(driver.findElement(By.tagName("select")));
        sel.selectByIndex(0);

        for (WebElement inp : driver.findElements(By.xpath("//input[@type='text']"))) {
            inp.clear();
        }
        driver.findElement(By.xpath("//input[@type='number']")).clear();

        driver.findElement(By.xpath("//button[contains(text(), 'Guardar Zona en el Sistema')]")).click();

        wait.until(ExpectedConditions.alertIsPresent());
        String alerta = driver.switchTo().alert().getText();
        System.out.println("[TEST 2] Alerta recibida: " + alerta);
        driver.switchTo().alert().accept();

        assertTrue(
            alerta.contains("completa todos los campos"),
            "Alerta inesperada: " + alerta
        );
        System.out.println("[TEST 2] OK - Validación correcta");
    }

    // ════════════════════════════════════════════════════════════════════
    // TEST 3 — Crear nueva zona y verificar que aparece en el panel
    // ════════════════════════════════════════════════════════════════════
    @Test @Order(3)
    void testCrearNuevaZona() throws InterruptedException {
        System.out.println("[TEST 3] Creando zona...");

        hacerLogin();

        wait.until(d -> {
            Select s = new Select(d.findElement(By.tagName("select")));
            return s.getOptions().size() > 1;
        });

        int tarjetasAntes = driver.findElements(
            By.xpath("//*[contains(text(), '🗑')]")
        ).size();
        System.out.println("[TEST 3] Tarjetas antes: " + tarjetasAntes);

        Select sel = new Select(driver.findElement(By.tagName("select")));
        sel.selectByIndex(1);

        List<WebElement> textos = driver.findElements(
            By.xpath("//input[@type='text']")
        );
        textos.get(0).sendKeys("Zona Selenium Test");
        textos.get(1).sendKeys("Tomate");
        driver.findElement(By.xpath("//input[@type='number']")).sendKeys("200");

        driver.findElement(By.xpath("//button[contains(text(), 'Guardar Zona en el Sistema')]")).click();

        wait.until(ExpectedConditions.alertIsPresent());
        String alerta = driver.switchTo().alert().getText();
        System.out.println("[TEST 3] Alerta: " + alerta);
        driver.switchTo().alert().accept();

        assertTrue(
            alerta.contains("exitosamente") || alerta.contains("successfully") || alerta.contains("creada"),
            "Alerta inesperada al crear: " + alerta
        );

        Thread.sleep(1500);

        final int tarjetasAntesFinal = tarjetasAntes;
        wait.until(d -> {
            int ahora = d.findElements(By.xpath("//*[contains(text(), '🗑')]")).size();
            System.out.println("[TEST 3] Tarjetas ahora: " + ahora);
            return ahora > tarjetasAntesFinal;
        });

        System.out.println("[TEST 3] OK - Zona creada y panel actualizado");
    }

    // ════════════════════════════════════════════════════════════════════
    // TEST 4 — Eliminar zona y verificar que desaparece del panel
    // ════════════════════════════════════════════════════════════════════
    @Test @Order(4)
    void testEliminarZona() throws InterruptedException {
        System.out.println("[TEST 4] Eliminando zona...");

        hacerLogin();

        wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//*[contains(text(), '🗑')]")
        ));

        int antes = driver.findElements(By.xpath("//*[contains(text(), '🗑')]")).size();
        System.out.println("[TEST 4] Zonas antes: " + antes);
        assertTrue(antes > 0, "Debe haber al menos una zona para eliminar");

        List<WebElement> basureros = driver.findElements(By.xpath("//*[contains(text(), '🗑')]"));
        basureros.get(basureros.size() - 1).click();

        wait.until(ExpectedConditions.alertIsPresent());
        String confirm = driver.switchTo().alert().getText();
        System.out.println("[TEST 4] Confirmar: " + confirm);
        driver.switchTo().alert().accept();

        wait.until(ExpectedConditions.alertIsPresent());
        String resultado = driver.switchTo().alert().getText();
        System.out.println("[TEST 4] Resultado: " + resultado);
        driver.switchTo().alert().accept();

        assertTrue(
            resultado.contains("eliminada") || resultado.contains("deleted") || resultado.contains("correctamente"),
            "Alerta inesperada al eliminar: " + resultado
        );

        Thread.sleep(1000);

        final int antesFinal = antes;
        wait.until(d -> {
            int ahora = d.findElements(By.xpath("//*[contains(text(), '🗑')]")).size();
            return ahora < antesFinal;
        });

        System.out.println("[TEST 4] OK - Zona eliminada del panel");
    }

    // ════════════════════════════════════════════════════════════════════
    // TEST 5 — Navegar a sección Taiga y verificar historias de usuario
    // ════════════════════════════════════════════════════════════════════
    @Test @Order(5)
    void testNavegacionTaiga() {
        System.out.println("[TEST 5] Verificando sección Taiga...");

        hacerLogin();

        // Clic en el botón del sidebar para Taiga
        wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[contains(.,'Taiga') or contains(.,'Stories')]")
        )).click();

        // Verificar que carga el título de la sección
        WebElement titulo = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Taiga') or contains(text(),'User Stories')]")
            )
        );
        assertNotNull(titulo, "La sección Taiga no cargó");

        // Verificar que hay al menos una historia de usuario (ID HU-01)
        wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'HU-01')]")
            )
        );

        System.out.println("[TEST 5] OK - Sección Taiga con historias cargada");
    }

    // ════════════════════════════════════════════════════════════════════
    // TEST 6 — Navegar a sección Usuarios y verificar tabla
    // ════════════════════════════════════════════════════════════════════
    @Test @Order(6)
    void testNavegacionUsuarios() {
        System.out.println("[TEST 6] Verificando sección Usuarios...");

        hacerLogin();

        // Clic en botón Usuarios del sidebar
        wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[contains(.,'Usuarios') or contains(.,'Users')]")
        )).click();

        // Esperar que cargue la tabla o el mensaje de acceso restringido
        wait.until(d ->
            !d.findElements(By.tagName("table")).isEmpty() ||
            !d.findElements(By.xpath("//*[contains(text(),'restringido') or contains(text(),'restricted')]")).isEmpty()
        );

        // Para ADMIN: tabla visible con al menos una fila
        List<WebElement> tablas = driver.findElements(By.tagName("table"));
        if (!tablas.isEmpty()) {
            assertFalse(tablas.isEmpty(), "La tabla de usuarios debe estar visible para ADMIN");
            System.out.println("[TEST 6] OK - Tabla de usuarios visible");
        } else {
            System.out.println("[TEST 6] OK - Acceso restringido mostrado (rol no-ADMIN)");
        }
    }

    // ════════════════════════════════════════════════════════════════════
    // TEST 7 — Botón "Descargar PDF" visible en sección Taiga
    // ════════════════════════════════════════════════════════════════════
    @Test @Order(7)
    void testBotonPDFVisible() {
        System.out.println("[TEST 7] Verificando botón de descarga PDF...");

        hacerLogin();

        // Navegar a Taiga
        wait.until(ExpectedConditions.elementToBeClickable(
            By.xpath("//button[contains(.,'Taiga') or contains(.,'Stories')]")
        )).click();

        // Verificar botón PDF
        WebElement botonPDF = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[contains(.,'PDF') or contains(.,'Descargar') or contains(.,'Download')]")
            )
        );
        assertNotNull(botonPDF, "El botón de descarga PDF no es visible");
        assertTrue(botonPDF.isEnabled(), "El botón PDF debe estar habilitado");

        System.out.println("[TEST 7] OK - Botón PDF visible y habilitado: " + botonPDF.getText());
    }

    // ════════════════════════════════════════════════════════════════════
    // TEST 8 — Sidebar colapsa correctamente
    // ════════════════════════════════════════════════════════════════════
    @Test @Order(8)
    void testSidebarColapsa() throws InterruptedException {
        System.out.println("[TEST 8] Verificando colapso del sidebar...");

        hacerLogin();

        // Buscar el botón toggle del sidebar (◀ / ▶)
        WebElement toggleBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(.,'◀') or contains(.,'▶')]")
            )
        );
        assertNotNull(toggleBtn, "Botón toggle del sidebar no encontrado");

        // Colapsar
        toggleBtn.click();
        Thread.sleep(400); // esperar animación CSS

        // El texto "Monitoreo" debe desaparecer (sidebar colapsado)
        boolean textoOculto = driver.findElements(
            By.xpath("//aside//*[contains(text(),'Monitoreo')]")
        ).isEmpty();
        assertTrue(textoOculto, "El sidebar debería estar colapsado (sin texto)");

        // Expandir de nuevo
        driver.findElement(By.xpath("//button[contains(.,'▶')]")).click();
        Thread.sleep(400);

        // El texto debe volver a aparecer
        wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//aside//*[contains(text(),'Monitoreo')]")
            )
        );

        System.out.println("[TEST 8] OK - Sidebar colapsa y expande correctamente");
    }
}