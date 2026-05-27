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
        
        // 🛠️ SOLUCIÓN ALERTA GOOGLE CHROME: Forzar modo incógnito y aislar guardado de claves
        ops.addArguments("--incognito");
        Map<String, Object> prefs = new HashMap<>();
        prefs.put("credentials_enable_service", false);
        prefs.put("profile.password_manager_enabled", false);
        ops.setExperimentalOption("prefs", prefs);

        // Descomenta para correr sin ventana visible:
        // ops.addArguments("--headless=new");

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

        // Esperar campo email
        WebElement campoEmail = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("input[type='email']")
            )
        );
        campoEmail.clear();
        campoEmail.sendKeys(EMAIL);

        // Campo password
        WebElement campoPassword = driver.findElement(
            By.cssSelector("input[type='password']")
        );
        campoPassword.clear();
        campoPassword.sendKeys(PASSWORD);

        // Submit del Login Local
        driver.findElement(By.cssSelector("button[type='submit']")).click();

        // Esperar selector ES/EN como confirmación de sesión activa
        wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[contains(.,'ES') or contains(.,'EN')]")
            )
        );
        System.out.println("[LOGIN] Sesión activa como " + EMAIL);
    }

    // ════════════════════════════════════════════════════════════════════
    // TEST 1 — Formulario visible tras hacer login
    // ════════════════════════════════════════════════════════════════════
    @Test @Order(1)
    void testFormularioVisible() {
        System.out.println("[TEST 1] Verificando formulario...");

        hacerLogin();

        // 🛠️ CORRECCIÓN: Esperar el botón usando su texto real en el componente
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

        // Dejar el select en opción vacía
        Select sel = new Select(driver.findElement(By.tagName("select")));
        sel.selectByIndex(0);

        // Limpiar todos los inputs
        for (WebElement inp : driver.findElements(By.xpath("//input[@type='text']"))) {
            inp.clear();
        }
        driver.findElement(By.xpath("//input[@type='number']")).clear();

        // 🛠️ CORRECCIÓN: Clic en Guardar usando el texto exacto
        driver.findElement(By.xpath("//button[contains(text(), 'Guardar Zona en el Sistema')]")).click();

        // Debe aparecer la alerta de validación
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

        // Esperar que el select cargue opciones reales desde el backend
        wait.until(d -> {
            Select s = new Select(d.findElement(By.tagName("select")));
            return s.getOptions().size() > 1;
        });

        // Contar tarjetas ANTES usando una búsqueda más flexible por texto de emoji
        int tarjetasAntes = driver.findElements(
            By.xpath("//*[contains(text(), '🗑')]")
        ).size();
        System.out.println("[TEST 3] Tarjetas antes: " + tarjetasAntes);

        // Seleccionar primer invernadero real
        Select sel = new Select(driver.findElement(By.tagName("select")));
        sel.selectByIndex(1);

        // Llenar campos del formulario
        List<WebElement> textos = driver.findElements(
            By.xpath("//input[@type='text']")
        );
        textos.get(0).sendKeys("Zona Selenium Test");
        textos.get(1).sendKeys("Tomate");
        driver.findElement(By.xpath("//input[@type='number']")).sendKeys("200");

        // 🛠️ CORRECCIÓN: Enviar usando el selector por texto
        driver.findElement(By.xpath("//button[contains(text(), 'Guardar Zona en el Sistema')]")).click();

        // Aceptar alerta de éxito
        wait.until(ExpectedConditions.alertIsPresent());
        String alerta = driver.switchTo().alert().getText();
        System.out.println("[TEST 3] Alerta: " + alerta);
        driver.switchTo().alert().accept();

        assertTrue(
            alerta.contains("exitosamente") || alerta.contains("successfully") || alerta.contains("creada"),
            "Alerta inesperada al crear: " + alerta
        );

        // 🛠️ AJUSTE ASÍNCRONO: Esperar a que React renderice la nueva tarjeta en el panel
        Thread.sleep(1500);

        // Verificar que hay UNA tarjeta más
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

        // Esperar al menos un botón de eliminar
        wait.until(ExpectedConditions.visibilityOfElementLocated(
            By.xpath("//*[contains(text(), '🗑')]")
        ));

        int antes = driver.findElements(By.xpath("//*[contains(text(), '🗑')]")).size();
        System.out.println("[TEST 4] Zonas antes: " + antes);
        assertTrue(antes > 0, "Debe haber al menos una zona para eliminar");

        // Clic en el último botón de eliminar (el que acabamos de crear en el test previo)
        List<WebElement> basureros = driver.findElements(By.xpath("//*[contains(text(), '🗑')]"));
        basureros.get(basureros.size() - 1).click();

        // Confirmar el confirm() emergente
        wait.until(ExpectedConditions.alertIsPresent());
        String confirm = driver.switchTo().alert().getText();
        System.out.println("[TEST 4] Confirmar: " + confirm);
        driver.switchTo().alert().accept();

        // Alerta final de resultado exitoso
        wait.until(ExpectedConditions.alertIsPresent());
        String resultado = driver.switchTo().alert().getText();
        System.out.println("[TEST 4] Resultado: " + resultado);
        driver.switchTo().alert().accept();

        assertTrue(
            resultado.contains("eliminada") || resultado.contains("deleted") || resultado.contains("correctamente"),
            "Alerta inesperada al eliminar: " + resultado
        );

        // 🛠️ AJUSTE ASÍNCRONO: Breve pausa para la limpieza de la tarjeta del DOM
        Thread.sleep(1000);

        // Verificar que hay una zona menos
        final int antesFinal = antes;
        wait.until(d -> {
            int ahora = d.findElements(By.xpath("//*[contains(text(), '🗑')]")).size();
            return ahora < antesFinal;
        });

        System.out.println("[TEST 4] OK - Zona eliminada del panel");
    }
}