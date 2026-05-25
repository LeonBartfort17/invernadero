package com.usco.invernadero;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.*;
import org.openqa.selenium.support.ui.*;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pruebas E2E con Selenium.
 * Requisito: Backend en :8080 y Frontend en :5173 ya corriendo.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@TestMethodOrder(OrderAnnotation.class)
class FrontendSeleniumTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private static final String URL = "http://localhost:5173";

    @BeforeEach
    void setUp() {
        io.github.bonigarcia.wdm.WebDriverManager.chromedriver().setup();
        ChromeOptions ops = new ChromeOptions();
        // --headless=new DESACTIVADO: Chrome abre ventana visible durante las pruebas
        ops.addArguments("--no-sandbox");
        ops.addArguments("--disable-dev-shm-usage");
        ops.addArguments("--window-size=1920,1080");
        driver = new ChromeDriver(ops);
        wait = new WebDriverWait(driver, Duration.ofSeconds(20));
    }

    @AfterEach
    void tearDown() {
        if (driver != null) driver.quit();
    }

    // ── TEST 1: Formulario visible ────────────────────────────────────────
    @Test @Order(1)
    void testFormularioVisible() {
        System.out.println("[TEST 1] Verificando formulario...");
        driver.get(URL);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[contains(.,'Guardar Zona')]")));

        assertNotNull(driver.findElement(By.tagName("select")));
        assertNotNull(driver.findElement(By.xpath("//input[@type='text']")));
        assertNotNull(driver.findElement(By.xpath("//input[@type='number']")));

        System.out.println("[TEST 1] OK - Formulario cargado");
    }

    // ── TEST 2: Validación campos vacíos ─────────────────────────────────
    @Test @Order(2)
    void testValidacionCamposVacios() {
        System.out.println("[TEST 2] Verificando validacion...");
        driver.get(URL);

        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[contains(.,'Guardar Zona')]")));

        driver.findElement(By.xpath("//button[contains(.,'Guardar Zona')]")).click();

        wait.until(ExpectedConditions.alertIsPresent());
        String alerta = driver.switchTo().alert().getText();
        System.out.println("[TEST 2] Alerta: " + alerta);
        driver.switchTo().alert().accept();

        assertTrue(alerta.contains("completa todos los campos"));
        System.out.println("[TEST 2] OK - Validacion correcta");
    }

    // ── TEST 3: Crear zona y verificar con conteo de tarjetas ────────────
    @Test @Order(3)
    void testCrearNuevaZona() {
        System.out.println("[TEST 3] Creando zona...");
        driver.get(URL);

        // Esperar que el selector cargue invernaderos
        wait.until(driver -> {
            Select sel = new Select(driver.findElement(By.tagName("select")));
            return sel.getOptions().size() > 1;
        });

        // Contar tarjetas ANTES de crear
        int tarjetasAntes = driver.findElements(
                By.xpath("//button[contains(.,'Eliminar Zona')]")).size();
        System.out.println("[TEST 3] Tarjetas antes: " + tarjetasAntes);

        // Seleccionar invernadero
        Select sel = new Select(driver.findElement(By.tagName("select")));
        sel.selectByIndex(1);
        System.out.println("[TEST 3] Invernadero: " + sel.getFirstSelectedOption().getText());

        // Llenar campos
        List<WebElement> inputs = driver.findElements(By.xpath("//input[@type='text']"));
        inputs.get(0).sendKeys("Zona Selenium Test");
        inputs.get(1).sendKeys("Tomate");
        driver.findElement(By.xpath("//input[@type='number']")).sendKeys("200");

        // Enviar
        driver.findElement(By.xpath("//button[contains(.,'Guardar Zona')]")).click();

        // Aceptar alerta de éxito
        wait.until(ExpectedConditions.alertIsPresent());
        String alerta = driver.switchTo().alert().getText();
        System.out.println("[TEST 3] Alerta: " + alerta);
        driver.switchTo().alert().accept();

        assertTrue(alerta.contains("xito"), "Alerta inesperada: " + alerta);

        // Verificar que hay UNA tarjeta más que antes
        int tarjetasAntesFinal = tarjetasAntes;
        wait.until(driver -> {
            int ahora = driver.findElements(
                    By.xpath("//button[contains(.,'Eliminar Zona')]")).size();
            System.out.println("[TEST 3] Tarjetas ahora: " + ahora);
            return ahora > tarjetasAntesFinal;
        });

        System.out.println("[TEST 3] OK - Zona creada, panel actualizado");
    }

    // ── TEST 4: Eliminar zona ─────────────────────────────────────────────
    @Test @Order(4)
    void testEliminarZona() {
        System.out.println("[TEST 4] Eliminando zona...");
        driver.get(URL);

        // Esperar que haya al menos un botón Eliminar
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[contains(.,'Eliminar Zona')]")));

        // Contar tarjetas antes
        int antes = driver.findElements(
                By.xpath("//button[contains(.,'Eliminar Zona')]")).size();
        System.out.println("[TEST 4] Zonas antes: " + antes);
        assertTrue(antes > 0, "Debe haber al menos una zona para eliminar");

        // Clic en el primer botón Eliminar
        driver.findElements(By.xpath("//button[contains(.,'Eliminar Zona')]"))
              .get(0).click();

        // Aceptar confirm()
        wait.until(ExpectedConditions.alertIsPresent());
        String confirm = driver.switchTo().alert().getText();
        System.out.println("[TEST 4] Confirmar: " + confirm);
        assertTrue(confirm.contains("Seguro"));
        driver.switchTo().alert().accept();

        // Aceptar alerta resultado
        wait.until(ExpectedConditions.alertIsPresent());
        String resultado = driver.switchTo().alert().getText();
        System.out.println("[TEST 4] Resultado: " + resultado);
        driver.switchTo().alert().accept();
        assertTrue(resultado.contains("eliminada"));

        // Verificar que hay una zona menos
        int antesFinal = antes;
        wait.until(driver -> {
            int ahora = driver.findElements(
                    By.xpath("//button[contains(.,'Eliminar Zona')]")).size();
            return ahora < antesFinal;
        });

        System.out.println("[TEST 4] OK - Zona eliminada del panel");
    }
}
