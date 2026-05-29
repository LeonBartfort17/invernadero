# test_frontend_automatico.py
# ══════════════════════════════════════════════════════════════════
#  Pruebas automáticas del FRONTEND con pytest + Selenium
#  Rúbrica punto 4: frontend-selenium y python
#
#  Requisitos previos:
#     - Backend corriendo en :8080 (o en producción)
#     - Frontend corriendo en :5173  (npm run dev) o en producción
#     - Google Chrome instalado
#
#  Instalar dependencias:
#     pip install pytest selenium webdriver-manager
#
#  Ejecutar local:
#     pytest test_frontend_automatico.py -v
#
#  Ejecutar producción:
#     FRONTEND_URL=https://invernadero-three.vercel.app pytest test_frontend_automatico.py -v
# ══════════════════════════════════════════════════════════════════

import time
import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
EMAIL        = "admin@invernadero.com"
PASSWORD     = "admin123"


# ── Helper: login ───────────────────────────────────────────────
def hacer_login(driver, wait):
    driver.get(FRONTEND_URL)

    # Limpiar localStorage para forzar login limpio
    driver.execute_script("localStorage.clear();")
    driver.get(FRONTEND_URL)

    campo_email = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
    )
    campo_email.clear()
    campo_email.send_keys(EMAIL)

    campo_password = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    campo_password.clear()
    campo_password.send_keys(PASSWORD)

    boton_login = driver.find_element(By.XPATH, "//button[@type='submit']")
    boton_login.click()

    # Esperar sidebar o selector de idioma (confirma sesión activa)
    wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//*[contains(text(),'Invernadero') or contains(text(),'Greenhouse')]")
        )
    )
    print(f"\n🔐 Sesión iniciada como {EMAIL}")


# ── Fixture: navegador Chrome ───────────────────────────────────
@pytest.fixture(scope="module")
def driver():
    opciones = webdriver.ChromeOptions()
    opciones.add_argument("--no-sandbox")
    opciones.add_argument("--disable-dev-shm-usage")
    opciones.add_argument("--window-size=1920,1080")
    opciones.add_argument("--incognito")
    prefs = {
        "credentials_enable_service": False,
        "profile.password_manager_enabled": False
    }
    opciones.add_experimental_option("prefs", prefs)
    # Descomenta para modo headless (sin ventana):
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
    driver.get(FRONTEND_URL)
    driver.execute_script("localStorage.clear();")
    driver.get(FRONTEND_URL)
    wait.until(lambda d: d.execute_script("return document.readyState") == "complete")
    assert len(driver.find_elements(By.TAG_NAME, "button")) > 0, \
        "El frontend cargó sin elementos interactivos"
    print(f"\n✅ Frontend cargó en {FRONTEND_URL}")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 2 — La pantalla de Login es visible antes de autenticarse
# ══════════════════════════════════════════════════════════════════
def test_pantalla_login_visible(driver, wait):
    driver.execute_script("localStorage.clear();")
    driver.get(FRONTEND_URL)
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
    driver.get(FRONTEND_URL)
    titulo = driver.title
    assert titulo is not None and titulo != "", \
        "La página no tiene título definido en el <title>"
    print(f"\n✅ Título de la página: '{titulo}'")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 4 — Login automático con credenciales del admin
# ══════════════════════════════════════════════════════════════════
def test_login_automatico(driver, wait):
    driver.execute_script("localStorage.clear();")
    hacer_login(driver, wait)

    # Verificar que el sidebar está visible (indica sesión activa)
    sidebar = driver.find_element(
        By.XPATH, "//*[contains(text(),'Monitoreo') or contains(text(),'Panel')]"
    )
    assert sidebar.is_displayed(), "El panel principal no está visible tras el login"
    print("\n✅ Login exitoso — aplicación principal cargada")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 5 — El selector de idioma existe tras iniciar sesión
# ══════════════════════════════════════════════════════════════════
def test_selector_idioma_presente(driver, wait):
    if len(driver.find_elements(By.CSS_SELECTOR, "input[type='email']")) > 0:
        hacer_login(driver, wait)

    boton_es = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//button[contains(.,'ES') or contains(.,'EN')]")
        )
    )
    assert boton_es is not None, "No se encontraron botones de idioma"
    print("\n✅ Selector de idioma encontrado en la barra lateral")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 6 — Formulario con validación de campos vacíos
# ══════════════════════════════════════════════════════════════════
def test_formulario_validacion_campos_vacios(driver, wait):
    if len(driver.find_elements(By.CSS_SELECTOR, "input[type='email']")) > 0:
        hacer_login(driver, wait)

    for inp in driver.find_elements(By.XPATH, "//input[@type='text']"):
        inp.clear()
    for inp in driver.find_elements(By.XPATH, "//input[@type='number']"):
        inp.clear()

    try:
        sel = Select(driver.find_element(By.TAG_NAME, "select"))
        sel.select_by_index(0)
    except Exception:
        pass

    boton_guardar = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Guardar')]")
        )
    )
    boton_guardar.click()

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
    if len(driver.find_elements(By.CSS_SELECTOR, "input[type='email']")) > 0:
        hacer_login(driver, wait)

    # Esperar que el select cargue opciones reales
    wait.until(lambda d: len(
        Select(d.find_element(By.TAG_NAME, "select")).options
    ) > 1)

    zonas_antes = len(
        driver.find_elements(By.XPATH, "//*[contains(text(), '🗑')]")
    )

    sel = Select(driver.find_element(By.TAG_NAME, "select"))
    sel.select_by_index(1)

    inputs_texto = driver.find_elements(By.XPATH, "//input[@type='text']")
    inputs_texto[0].clear()
    inputs_texto[0].send_keys("Zona Pytest Selenium")
    inputs_texto[1].clear()
    inputs_texto[1].send_keys("Pepino")

    input_numero = driver.find_element(By.XPATH, "//input[@type='number']")
    input_numero.clear()
    input_numero.send_keys("123")

    boton_guardar = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Guardar')]")
        )
    )
    boton_guardar.click()

    wait.until(EC.alert_is_present())
    alerta_texto = driver.switch_to.alert.text
    driver.switch_to.alert.accept()

    time.sleep(1.5)

    wait.until(lambda d: len(
        d.find_elements(By.XPATH, "//*[contains(text(), '🗑')]")
    ) > zonas_antes)

    zonas_despues = len(driver.find_elements(By.XPATH, "//*[contains(text(), '🗑')]"))
    assert zonas_despues == zonas_antes + 1, "El número de zonas no aumentó"
    print(f"\n✅ Zona creada — zonas: {zonas_antes} → {zonas_despues}")

    botones_eliminar = driver.find_elements(By.XPATH, "//*[contains(text(), '🗑')]")
    botones_eliminar[-1].click()

    wait.until(EC.alert_is_present())
    driver.switch_to.alert.accept()

    wait.until(EC.alert_is_present())
    resultado_texto = driver.switch_to.alert.text
    driver.switch_to.alert.accept()

    assert "eliminada" in resultado_texto.lower() or "deleted" in resultado_texto.lower(), \
        f"Alerta inesperada al eliminar: {resultado_texto}"

    time.sleep(1.0)

    wait.until(lambda d: len(
        d.find_elements(By.XPATH, "//*[contains(text(), '🗑')]")
    ) == zonas_antes)

    print(f"✅ Zona eliminada — zonas restauradas a: {zonas_antes}")