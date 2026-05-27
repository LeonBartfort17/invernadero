# test_backend_automatico.py
# ══════════════════════════════════════════════════════════════════
#  Pruebas automáticas del BACKEND con pytest
#  Rúbrica punto 4: backend-junit y python
#
#  Requisito previo: Backend Spring Boot corriendo en :8080
#  Ejecutar:  python -m pytest test_backend_automatico.py -v
# ══════════════════════════════════════════════════════════════════

import pytest
import requests

BASE_URL = "http://localhost:8080"

# ── Credenciales de prueba ──────────────────────────────────────
EMAIL    = "admin2@invernadero.com"
PASSWORD = "admin123"


# ── Fixture: sesión autenticada con login automático ───────────
@pytest.fixture(scope="module")
def sesion_autenticada():
    """
    Abre una sesión HTTP, hace POST a /api/auth/login con las
    credenciales del administrador y devuelve la sesión lista
    para usar en todas las pruebas del módulo.
    """
    sesion = requests.Session()

    # El frontend envía form-urlencoded con 'username' y 'password'
    respuesta = sesion.post(
        f"{BASE_URL}/api/auth/login",
        data={"username": EMAIL, "password": PASSWORD},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        allow_redirects=True,
        timeout=10,
    )

    # El backend responde JSON  {"success": true, ...}  con HTTP 200
    assert respuesta.status_code == 200, (
        f"❌ Login fallido — código HTTP: {respuesta.status_code}.\n"
        f"   Respuesta: {respuesta.text}\n"
        f"   Verifica que el backend esté corriendo y las credenciales sean correctas."
    )

    datos = respuesta.json()
    assert datos.get("success") is True, (
        f"❌ Login no devolvió success=true. Respuesta: {datos}"
    )

    print(f"\n🔐 Sesión iniciada como {EMAIL}  →  {datos}")
    return sesion


# ══════════════════════════════════════════════════════════════════
# PRUEBA 1 — El servidor responde (sin autenticación)
# ══════════════════════════════════════════════════════════════════
def test_servidor_activo():
    """El backend debe estar corriendo y responder en el puerto 8080."""
    respuesta = requests.get(f"{BASE_URL}/api/auth/me", timeout=10)
    assert respuesta.status_code in (200, 401), (
        f"El servidor no respondió correctamente. Código: {respuesta.status_code}"
    )
    print(f"\n✅ Servidor activo — código HTTP: {respuesta.status_code}")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 2 — GET /api/auth/me devuelve el usuario autenticado
# ══════════════════════════════════════════════════════════════════
def test_usuario_autenticado(sesion_autenticada):
    """Tras el login, /api/auth/me debe devolver los datos del usuario."""
    respuesta = sesion_autenticada.get(f"{BASE_URL}/api/auth/me", timeout=10)
    assert respuesta.status_code == 200, (
        f"Se esperaba 200 pero se recibió {respuesta.status_code}. "
        f"Respuesta: {respuesta.text}"
    )
    datos = respuesta.json()
    assert "email" in datos, "La respuesta no contiene el campo 'email'"
    assert datos["email"] == EMAIL, (
        f"Email esperado: {EMAIL}  — Email recibido: {datos['email']}"
    )
    print(f"\n✅ /api/auth/me — usuario: {datos['email']}  rol: {datos.get('rol')}")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 3 — GET /api/zonas devuelve una lista
# ══════════════════════════════════════════════════════════════════
def test_obtener_zonas(sesion_autenticada):
    """GET /api/zonas debe devolver código 200 y una lista JSON."""
    respuesta = sesion_autenticada.get(f"{BASE_URL}/api/zonas", timeout=10)
    assert respuesta.status_code == 200, (
        f"Se esperaba 200 pero se recibió {respuesta.status_code}"
    )
    datos = respuesta.json()
    assert isinstance(datos, list), "La respuesta debe ser una lista JSON"
    print(f"\n✅ GET /api/zonas — {len(datos)} zona(s) encontrada(s)")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 4 — GET /api/invernaderos devuelve una lista
# ══════════════════════════════════════════════════════════════════
def test_obtener_invernaderos(sesion_autenticada):
    """GET /api/invernaderos debe devolver código 200 y una lista JSON."""
    respuesta = sesion_autenticada.get(f"{BASE_URL}/api/invernaderos", timeout=10)
    assert respuesta.status_code == 200, (
        f"Se esperaba 200 pero se recibió {respuesta.status_code}"
    )
    datos = respuesta.json()
    assert isinstance(datos, list), "La respuesta debe ser una lista JSON"
    print(f"\n✅ GET /api/invernaderos — {len(datos)} invernadero(s) encontrado(s)")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 5 — POST /api/zonas crea una nueva zona
# ══════════════════════════════════════════════════════════════════
def test_crear_zona(sesion_autenticada):
    """POST /api/zonas/{invernaderoId} debe crear una zona y devolver 201."""
    inv_resp = sesion_autenticada.get(f"{BASE_URL}/api/invernaderos", timeout=10)
    assert inv_resp.status_code == 200
    invernaderos = inv_resp.json()
    assert len(invernaderos) > 0, "Debe existir al menos un invernadero para crear una zona"

    invernadero_id = invernaderos[0]["id"]
    nueva_zona = {
        "nombre":       "Zona Python Test",
        "tipo_cultivo": "Prueba Automatica",
        "area_total":   99.9,
    }
    respuesta = sesion_autenticada.post(
        f"{BASE_URL}/api/zonas/{invernadero_id}",
        json=nueva_zona,
        headers={"Content-Type": "application/json"},
        timeout=10,
    )
    assert respuesta.status_code == 201, (
        f"Se esperaba 201 (Created) pero se recibió {respuesta.status_code}. "
        f"Respuesta: {respuesta.text}"
    )
    print(f"\n✅ POST /api/zonas — Zona creada. Respuesta: {respuesta.text}")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 6 — DELETE /api/zonas/{id} elimina la zona de prueba
# ══════════════════════════════════════════════════════════════════
def test_eliminar_zona_prueba(sesion_autenticada):
    """DELETE /api/zonas/{id} debe eliminar la zona y devolver 200."""
    zonas_resp = sesion_autenticada.get(f"{BASE_URL}/api/zonas", timeout=10)
    assert zonas_resp.status_code == 200
    zonas = zonas_resp.json()

    zona_prueba = next(
        (z for z in zonas if z.get("nombre") == "Zona Python Test"), None
    )
    assert zona_prueba is not None, (
        "No se encontró la zona 'Zona Python Test'. "
        "Asegúrate de que test_crear_zona haya pasado primero."
    )

    zona_id = zona_prueba["id"]
    respuesta = sesion_autenticada.delete(
        f"{BASE_URL}/api/zonas/{zona_id}", timeout=10
    )
    assert respuesta.status_code == 200, (
        f"Se esperaba 200 pero se recibió {respuesta.status_code}. "
        f"Respuesta: {respuesta.text}"
    )
    print(f"\n✅ DELETE /api/zonas/{zona_id} — Zona eliminada. Respuesta: {respuesta.text}")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 7 — Endpoint inexistente devuelve 404 o 401
# ══════════════════════════════════════════════════════════════════
def test_endpoint_inexistente():
    """Un endpoint que no existe debe devolver 404 o 401."""
    respuesta = requests.get(
        f"{BASE_URL}/api/recurso_que_no_existe", timeout=10
    )
    assert respuesta.status_code in (404, 401), (
        f"Se esperaba 404 o 401 pero se recibió {respuesta.status_code}"
    )
    print(f"\n✅ Endpoint inexistente — código HTTP: {respuesta.status_code}")
