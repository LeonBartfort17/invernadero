# test_backend_automatico.py
# ══════════════════════════════════════════════════════════════════
#  Pruebas automáticas del BACKEND con pytest
#  Rúbrica punto 4: backend-junit y python
#
#  Ejecutar local:      python -m pytest test_backend_automatico.py -v
#  Ejecutar producción: BASE_URL=https://invernadero-pyen.onrender.com python -m pytest test_backend_automatico.py -v
# ══════════════════════════════════════════════════════════════════

import pytest
import requests
import os

BASE_URL = os.getenv("BASE_URL", "http://localhost:8080")

# ── Credenciales de prueba ──────────────────────────────────────
EMAIL    = "admin@invernadero.com"
PASSWORD = "admin123"


# ── Fixture: token JWT con login automático ────────────────────
@pytest.fixture(scope="module")
def token_jwt():
    """
    Hace POST a /api/auth/login y devuelve el token JWT
    para usarlo en todas las pruebas del módulo.
    """
    respuesta = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={"username": EMAIL, "password": PASSWORD},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=15,
    )

    assert respuesta.status_code == 200, (
        f"❌ Login fallido — código HTTP: {respuesta.status_code}.\n"
        f"   Respuesta: {respuesta.text}\n"
        f"   Verifica que el backend esté corriendo y las credenciales sean correctas."
    )

    datos = respuesta.json()
    assert datos.get("success") is True, (
        f"❌ Login no devolvió success=true. Respuesta: {datos}"
    )
    assert "token" in datos, "❌ La respuesta no contiene el token JWT"

    print(f"\n🔐 Token JWT obtenido para {EMAIL}")
    return datos["token"]


def auth_headers(token, extra=None):
    """Genera headers con el token JWT."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    if extra:
        headers.update(extra)
    return headers


# ══════════════════════════════════════════════════════════════════
# PRUEBA 1 — El servidor responde (sin autenticación)
# ══════════════════════════════════════════════════════════════════
def test_servidor_activo():
    """El backend debe estar corriendo y responder."""
    respuesta = requests.get(f"{BASE_URL}/api/auth/me", timeout=15)
    assert respuesta.status_code in (200, 401), (
        f"El servidor no respondió correctamente. Código: {respuesta.status_code}"
    )
    print(f"\n✅ Servidor activo — código HTTP: {respuesta.status_code}")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 2 — GET /api/auth/me devuelve el usuario autenticado
# ══════════════════════════════════════════════════════════════════
def test_usuario_autenticado(token_jwt):
    """Tras el login, /api/auth/me debe devolver los datos del usuario."""
    respuesta = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers=auth_headers(token_jwt),
        timeout=15,
    )
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
def test_obtener_zonas(token_jwt):
    """GET /api/zonas debe devolver código 200 y una lista JSON."""
    respuesta = requests.get(
        f"{BASE_URL}/api/zonas",
        headers=auth_headers(token_jwt),
        timeout=15,
    )
    assert respuesta.status_code == 200, (
        f"Se esperaba 200 pero se recibió {respuesta.status_code}"
    )
    datos = respuesta.json()
    assert isinstance(datos, list), "La respuesta debe ser una lista JSON"
    print(f"\n✅ GET /api/zonas — {len(datos)} zona(s) encontrada(s)")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 4 — GET /api/invernaderos devuelve una lista
# ══════════════════════════════════════════════════════════════════
def test_obtener_invernaderos(token_jwt):
    """GET /api/invernaderos debe devolver código 200 y una lista JSON."""
    respuesta = requests.get(
        f"{BASE_URL}/api/invernaderos",
        headers=auth_headers(token_jwt),
        timeout=15,
    )
    assert respuesta.status_code == 200, (
        f"Se esperaba 200 pero se recibió {respuesta.status_code}"
    )
    datos = respuesta.json()
    assert isinstance(datos, list), "La respuesta debe ser una lista JSON"
    print(f"\n✅ GET /api/invernaderos — {len(datos)} invernadero(s) encontrado(s)")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 5 — POST /api/zonas crea una nueva zona
# ══════════════════════════════════════════════════════════════════
def test_crear_zona(token_jwt):
    """POST /api/zonas/{invernaderoId} debe crear una zona y devolver 201."""
    inv_resp = requests.get(
        f"{BASE_URL}/api/invernaderos",
        headers=auth_headers(token_jwt),
        timeout=15,
    )
    assert inv_resp.status_code == 200
    invernaderos = inv_resp.json()
    assert len(invernaderos) > 0, "Debe existir al menos un invernadero para crear una zona"

    invernadero_id = invernaderos[0]["id"]
    nueva_zona = {
        "nombre":       "Zona Python Test",
        "tipo_cultivo": "Prueba Automatica",
        "area_total":   99.9,
    }
    respuesta = requests.post(
        f"{BASE_URL}/api/zonas/{invernadero_id}",
        json=nueva_zona,
        headers=auth_headers(token_jwt),
        timeout=15,
    )
    assert respuesta.status_code == 201, (
        f"Se esperaba 201 (Created) pero se recibió {respuesta.status_code}. "
        f"Respuesta: {respuesta.text}"
    )
    print(f"\n✅ POST /api/zonas — Zona creada. Respuesta: {respuesta.text}")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 6 — DELETE /api/zonas/{id} elimina la zona de prueba
# ══════════════════════════════════════════════════════════════════
def test_eliminar_zona_prueba(token_jwt):
    """DELETE /api/zonas/{id} debe eliminar la zona y devolver 200."""
    zonas_resp = requests.get(
        f"{BASE_URL}/api/zonas",
        headers=auth_headers(token_jwt),
        timeout=15,
    )
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
    respuesta = requests.delete(
        f"{BASE_URL}/api/zonas/{zona_id}",
        headers=auth_headers(token_jwt),
        timeout=15,
    )
    assert respuesta.status_code == 200, (
        f"Se esperaba 200 pero se recibió {respuesta.status_code}. "
        f"Respuesta: {respuesta.text}"
    )
    print(f"\n✅ DELETE /api/zonas/{zona_id} — Zona eliminada.")


# ══════════════════════════════════════════════════════════════════
# PRUEBA 7 — Endpoint inexistente devuelve 404 o 401
# ══════════════════════════════════════════════════════════════════
def test_endpoint_inexistente():
    """Un endpoint que no existe debe devolver 404 o 401."""
    respuesta = requests.get(
        f"{BASE_URL}/api/recurso_que_no_existe", timeout=15
    )
    assert respuesta.status_code in (404, 401), (
        f"Se esperaba 404 o 401 pero se recibió {respuesta.status_code}"
    )
    print(f"\n✅ Endpoint inexistente — código HTTP: {respuesta.status_code}")