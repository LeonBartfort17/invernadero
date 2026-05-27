# test_frontend_automatico.py
# ══════════════════════════════════════════════════════════════════
#  Pruebas automáticas del FRONTEND con pytest + Selenium
#  Rúbrica punto 4: frontend-selenium y python
#
#  Requisitos previos:
#     - Backend corriendo en  :8080
#     - Frontend corriendo en :5173  (npm run dev)
#     - Google Chrome instalado
#
#  Instalar dependencias:
#     pip install pytest selenium webdriver-manager
#
#  Ejecutar:
#     pytest test_frontend_automatico.py -v
# ══════════════════════════════════════════════════════════════════

import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

FRONTEND_URL  = "http://localhost:5173"
EMAIL         = "admin2@invernadero.com"
PASSWORD      = "admin123"


# ── Helpers ─────────────────────────────────────────────────────

def hacer_login(driver, wait):
    """
    Navega al frontend y completa el formulario de login con las
    credenciales del administrador. Espera hasta que la barra
    superior (botón 'ES'/'EN') confirme que la sesión está activa.
    """
    driver.get(FRONTEND_URL)

    # Esperar que aparezca el campo email del formulario de login
    campo_email = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
    )
    campo_email.clear()
    campo_email.send_keys(EMAIL)

    campo_password = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    campo_password.clear()
    campo_password.send_keys(PASSWORD)

    # Clic en el botón de submit del formulario de login local
    boton_login = driver.find_element(
        By.開頭 + "//button[@type='submit']" if hasattr(By, '開頭') else By.XPATH, "//button[@type='submit']"
    )
    boton_login.click()

    # Confirmar que la sesión inició → esperar el selector de idioma (ES/EN)
    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//button[contains(.,'ES') or contains(.,'EN')]")
        )
    )
    print(f"\n🔐 Sesión iniciada como {EMAIL}")


# ── Fixture: navegador Chrome reutilizable ──────────────────────
@pytest.fixture(scope="module")
def driver():
    """Abre Chrome de forma aislada una vez para todos los tests del módulo."""
    opciones = webdriver.ChromeOptions()
    opciones.add_argument("--no-sandbox")
    opciones.add_argument("--disable-dev-shm-usage")
    opciones.add_argument("--window-size=1920,1080")
    
    # 🛠️ SOLUCIÓN ALERTA GOOGLE CHROME: Modo incógnito y aislamiento de administrador de contraseñas
    opciones.add_argument("--incognito") 
    prefs = {
        "credentials_enable_service": False, 
        "profile.password_manager_enabled": False
    }
    opciones.add_experimental_option("prefs", prefs)

    # Para ver el navegador durante las pruebas, deja comentada la línea de abajo:
    # opciones.add_argument("--headless=new")

    navegador = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=opciones,
    )
    navegador.implicitly_wait(5)
    yield navegador
    navegador.quit()


@pytest.fixture
def wait(driver):
    return WebDriverWait(driver, 20)


# ══════════════════════════════════════════════════════════════════
# PRUEBA 1 — El frontend carga sin errores
# ══════════════════════════════════════════════════════════════════
def test_frontend_carga(driver, wait):
    """El frontend debe cargar correctamente en el navegador."""
    driver.get(FRONTEND_URL)
    wait.until(lambda d: d.execute_script("return document.readyState") == "complete")

    # La página debe contener algún contenido visible (login o app)
    assert len(driver.find_elements(By.TAG_NAME, "button")) > 0, \
        "El frontend cargó sin elementos interactivos"

    print(f"\n✅ Frontend cargó en {FRONTEND_URL}")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 2 — La pantalla de Login es visible antes de autenticarse
# ══════════════════════════════════════════════════════════════════
def test_pantalla_login_visible(driver, wait):
    """La pantalla de Login debe mostrarse cuando no hay sesión activa."""
    driver.get(FRONTEND_URL)

    # Esperar el formulario de login
    campo_email = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
    )
    assert campo_email.is_displayed(), "El campo de email no está visible"

    campo_pass = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    assert campo_pass.is_displayed(), "El campo de contraseña no está visible"

    print("\n✅ Pantalla de login visible — campos email y password encontrados")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 3 — El título de la página existe
# ══════════════════════════════════════════════════════════════════
def test_titulo_pagina(driver):
    """La página debe tener un título definido."""
    driver.get(FRONTEND_URL)
    titulo = driver.title
    assert titulo is not None and titulo != "", \
        "La página no tiene título definido en el <title>"
    print(f"\n✅ Título de la página: '{titulo}'")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 4 — Login automático con credenciales del admin
# ══════════════════════════════════════════════════════════════════
def test_login_automatico(driver, wait):
    """
    Completa el formulario de login con las credenciales del administrador
    y verifica que la aplicación principal carga correctamente.
    """
    # Limpiar cookies por si quedó sesión de prueba anterior
    driver.delete_all_cookies()
    hacer_login(driver, wait)

    # Verificar que el selector de idioma está visible (indica sesión activa)
    boton_idioma = driver.find_element(
        By.XPATH, "//button[contains(.,'ES') or contains(.,'EN')]"
    )
    assert boton_idioma.is_displayed(), "El selector de idioma no está visible tras el login"
    print("\n✅ Login exitoso — aplicación principal cargada")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 5 — El selector de idioma existe tras iniciar sesión
# ══════════════════════════════════════════════════════════════════
def test_selector_idioma_presente(driver, wait):
    """
    La barra superior debe tener los botones de idioma ES / EN
    una vez que el usuario ha iniciado sesión.
    """
    # Asegurar sesión activa
    if "input[type='email']" in driver.page_source or \
       len(driver.find_elements(By.CSS_SELECTOR, "input[type='email']")) > 0:
        hacer_login(driver, wait)

    boton_es = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//button[contains(.,'ES') or contains(.,'EN')]")
        )
    )
    assert boton_es is not None, "No se encontraron botones de idioma"
    print("\n✅ Selector de idioma encontrado en la barra superior")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 6 — Formulario con validación de campos vacíos
# ══════════════════════════════════════════════════════════════════
def test_formulario_validacion_campos_vacios(driver, wait):
    """
    Con sesión activa, al hacer clic en 'Guardar Zona' sin llenar
    los campos obligatorios debe aparecer una alerta de validación.
    """
    # Asegurar sesión activa
    if len(driver.find_elements(By.CSS_SELECTOR, "input[type='email']")) > 0:
        hacer_login(driver, wait)

    # Limpiar todos los campos de texto antes de intentar guardar
    for inp in driver.find_elements(By.XPATH, "//input[@type='text']"):
        inp.clear()
    for inp in driver.find_elements(By.XPATH, "//input[@type='number']"):
        inp.clear()

    # Asegurarse de que el select de invernadero quede en la opción vacía
    try:
        sel = Select(driver.find_element(By.TAG_NAME, "select"))
        sel.select_by_index(0)   # opción "Selecciona un invernadero..."
    except Exception:
        pass

    # Intentar guardar con campos vacíos
    # 🛠️ CORRECCIÓN SELECTOR: Localiza por el texto del botón debido al cambio de tipo de elemento
    boton_guardar = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(), 'Guardar Zona en el Sistema')]")
        )
    )
    boton_guardar.click()

    # Debe aparecer una alerta de validación
    wait.until(EC.alert_is_present())
    alerta = driver.switch_to.alert
    texto_alerta = alerta.text
    alerta.accept()

    assert texto_alerta != "", "La alerta de validación estaba vacía"
    print(f"\n✅ Validación activa — Alerta: '{texto_alerta}'")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 7 — Crear y eliminar una zona completa (flujo E2E)
# ══════════════════════════════════════════════════════════════════
def test_crear_y_eliminar_zona(driver, wait):
    """
    Flujo completo E2E (requiere sesión activa con rol ADMIN u OPERADOR):
    1. Inicia sesión automáticamente
    2. Selecciona un invernadero
    3. Llena el formulario y guarda la zona
    4. Verifica que la zona aparece en el panel
    5. Elimina la zona y verifica que desapareció
    """
    # Asegurar sesión activa
    if len(driver.find_elements(By.CSS_SELECTOR, "input[type='email']")) > 0:
        hacer_login(driver, wait)

    # Esperar que el selector de invernaderos cargue opciones reales
    wait.until(lambda d: len(
        Select(d.find_element(By.TAG_NAME, "select")).options
    ) > 1)

    # Contar zonas antes de crear usando una búsqueda más flexible (cualquier elemento con el emoji)
    zonas_antes = len(
        driver.find_elements(By.XPATH, "//*[contains(text(), '🗑')]")
    )

    # Seleccionar el primer invernadero disponible (índice 1 = primero real)
    sel = Select(driver.find_element(By.TAG_NAME, "select"))
    sel.select_by_index(1)

    # Llenar los campos de texto
    inputs_texto = driver.find_elements(By.XPATH, "//input[@type='text']")
    inputs_texto[0].clear()
    inputs_texto[0].send_keys("Zona Pytest Selenium")

    inputs_texto[1].clear()
    inputs_texto[1].send_keys("Pepino")

    input_numero = driver.find_element(By.XPATH, "//input[@type='number']")
    input_numero.clear()
    input_numero.send_keys("123")

    # Guardar zona
    # 🛠️ CORRECCIÓN SELECTOR: Apunta de forma robusta al texto del botón
    boton_guardar = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(), 'Guardar Zona en el Sistema')]")
        )
    )
    boton_guardar.click()

    # Aceptar alerta de éxito
    wait.until(EC.alert_is_present())
    alerta_texto = driver.switch_to.alert.text
    driver.switch_to.alert.accept()
    assert "xito" in alerta_texto or "reated" in alerta_texto or "creada" in alerta_texto.lower(), \
        f"Alerta inesperada al crear: {alerta_texto}"

    # 🛠️ AJUSTE ASÍNCRONO: Esperar 1.5 segundos para que React termine de procesar el re-render de la tabla
    time.sleep(1.5)

    # Verificar que hay una zona más en el panel
    wait.until(lambda d: len(
        d.find_elements(By.XPATH, "//*[contains(text(), '🗑')]")
    ) > zonas_antes)

    zonas_despues = len(
        driver.find_elements(By.XPATH, "//*[contains(text(), '🗑')]")
    )
    assert zonas_despues == zonas_antes + 1, \
        "El número de zonas no aumentó tras crear"

    print(f"\n✅ Zona creada — zonas: {zonas_antes} → {zonas_despues}")

    # ── Eliminar la zona recién creada ──────────────────────────
    botones_eliminar = driver.find_elements(
        By.XPATH, "//*[contains(text(), '🗑')]"
    )
    botones_eliminar[-1].click()   # el último elemento con el emoji = la zona que acabamos de añadir

    # Confirmar el diálogo de confirmación emergente
    wait.until(EC.alert_is_present())
    driver.switch_to.alert.accept()

    # Aceptar la alerta final de resultado exitoso
    wait.until(EC.alert_is_present())
    resultado_texto = driver.switch_to.alert.text
    driver.switch_to.alert.accept()

    assert "eliminada" in resultado_texto.lower() or "deleted" in resultado_texto.lower(), \
        f"Alerta inesperada al eliminar: {resultado_texto}"

    # 🛠️ AJUSTE ASÍNCRONO: Breve espera para que la interfaz limpie la tarjeta removida
    time.sleep(1.0)

    # Verificar que volvimos exactamente al conteo original de zonas
    wait.until(lambda d: len(
        d.find_elements(By.XPATH, "//*[contains(text(), '🗑')]")
    ) == zonas_antes)

    print(f"✅ Zona eliminada — zonas restauradas a: {zonas_antes}")