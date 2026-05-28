# 🚀 Guía de Despliegue — Invernadero

## Frontend → Vercel

### Pasos manuales (primera vez)

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login en Vercel**
   ```bash
   vercel login
   ```

3. **Desplegar desde la carpeta `frontend/`**
   ```bash
   cd frontend
   vercel --prod
   ```
   - Framework: `Vite`
   - Root: `./` (dentro de `frontend/`)
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Variable de entorno en Vercel:**
   ```
   VITE_API_URL = https://tu-backend.onrender.com
   ```

### Despliegue automático (CI/CD)

Agrega estos **secrets** en GitHub (`Settings → Secrets → Actions`):

| Secret | Cómo obtenerlo |
|---|---|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | `vercel env ls` → `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |
| `RENDER_BACKEND_URL` | URL de tu servicio en Render |

---

## Backend → Render

### Pasos manuales (primera vez)

1. Ir a [render.com](https://render.com) → **New → Web Service**
2. Conectar el repositorio de GitHub
3. Configurar:
   - **Name:** `invernadero-backend`
   - **Environment:** `Java`
   - **Build command:** `./gradlew build -x test`
   - **Start command:** `java -jar build/libs/invernadero-*.jar`
   - **Plan:** Free

4. **Variables de entorno en Render:**
   ```
   SPRING_DATASOURCE_URL     = jdbc:postgresql://<host>:<port>/<db>
   SPRING_DATASOURCE_USERNAME = postgres
   SPRING_DATASOURCE_PASSWORD = <tu-password>
   SPRING_PROFILES_ACTIVE     = prod
   GOOGLE_CLIENT_ID           = <tu-client-id>
   GOOGLE_CLIENT_SECRET       = <tu-client-secret>
   ALLOWED_ORIGIN             = https://tu-frontend.vercel.app
   ```

5. Render provee una **PostgreSQL gratuita** en `New → PostgreSQL`.

### Deploy webhook (CI automático)

1. En Render → tu servicio → **Settings → Deploy Hook** → copiar URL
2. Agregar en GitHub Secrets como `RENDER_DEPLOY_HOOK_URL`
3. El CI en `.github/workflows/ci.yml` hará POST a ese hook en cada push a `main`

---

## Actualizar URL del backend en React

En `frontend/src/App.jsx` y demás páginas, cambia:
```js
// Desarrollo
fetch('http://localhost:8080/api/...')

// Producción (usa variable de entorno)
fetch(`${import.meta.env.VITE_API_URL}/api/...`)
```

---

## Tests Selenium (locales)

Los tests requieren Chrome instalado y el backend + frontend corriendo:

```bash
# Terminal 1 — Backend
./gradlew bootRun

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — Tests
./gradlew test --tests "com.usco.invernadero.FrontendSeleniumTest" --info
```

**8 tests incluidos:**
1. Formulario visible tras login
2. Validación campos vacíos
3. Crear nueva zona
4. Eliminar zona
5. Navegar a sección Taiga (historias de usuario)
6. Navegar a sección Usuarios
7. Botón "Descargar PDF" visible
8. Sidebar colapsa y expande
