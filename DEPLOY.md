# 🚀 Guía de Despliegue — Invernadero

## Orden recomendado: primero Render (backend), luego Vercel (frontend)

---

## 1️⃣ Render — Backend (Spring Boot)

### Verificar que el servicio está vivo
1. Abre [render.com/dashboard](https://dashboard.render.com)
2. Entra a tu servicio `invernadero-backend`
3. El estado debe ser **🟢 Live**
4. **Copia la URL**, tiene el formato:
   ```
   https://invernadero-xxxx.onrender.com
   ```

### Variables de entorno en Render
En tu servicio → **Environment** → agregar:
```
SPRING_DATASOURCE_URL      = jdbc:postgresql://<host>:<port>/<db>
SPRING_DATASOURCE_USERNAME = postgres
SPRING_DATASOURCE_PASSWORD = hatsune
SPRING_PROFILES_ACTIVE     = prod
GOOGLE_CLIENT_ID           = <tu-client-id>
GOOGLE_CLIENT_SECRET       = <tu-client-secret>
ALLOWED_ORIGIN             = https://tu-proyecto.vercel.app
```

### Deploy hook (para CI automático)
1. Render → tu servicio → **Settings → Deploy Hook** → copiar URL
2. GitHub → tu repo → **Settings → Secrets → Actions → New secret**:
   - Nombre: `RENDER_DEPLOY_HOOK_URL`
   - Valor: la URL del hook

---

## 2️⃣ Vercel — Frontend (React + Vite)

### Paso A — Actualizar .env.production
Edita `frontend/.env.production` con la URL real de Render:
```
VITE_API_URL=https://invernadero-xxxx.onrender.com
```

### Paso B — Primera vez: vincular proyecto manualmente

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desde la carpeta frontend/
cd frontend

# Login
vercel login

# Vincular (esto crea .vercel/project.json con orgId y projectId)
vercel link

# Desplegar
vercel --prod
```

### Paso C — Obtener los 3 secrets para el CI

Después del `vercel link`, abre el archivo que se generó:
```
frontend/.vercel/project.json
```
Tendrá este contenido:
```json
{
  "orgId": "team_xxxxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxxxx"
}
```

Ve a [vercel.com/account/tokens](https://vercel.com/account/tokens) → **Create Token**

### Paso D — Agregar los 4 secrets en GitHub

**GitHub → tu repo → Settings → Secrets and variables → Actions → New repository secret**

| Nombre del secret     | De dónde sacarlo                          |
|-----------------------|-------------------------------------------|
| `VERCEL_TOKEN`        | vercel.com/account/tokens                 |
| `VERCEL_ORG_ID`       | `.vercel/project.json` → campo `orgId`    |
| `VERCEL_PROJECT_ID`   | `.vercel/project.json` → campo `projectId`|
| `RENDER_BACKEND_URL`  | URL de tu servicio en Render              |

### Paso E — Variable de entorno en Vercel Dashboard

**Vercel → tu proyecto → Settings → Environment Variables**:
```
VITE_API_URL = https://invernadero-xxxx.onrender.com
```
Seleccionar: ✅ Production  ✅ Preview  ✅ Development

### Paso F — Hacer push para disparar el CI
```bash
git add .
git commit -m "fix: configurar VITE_API_URL para producción"
git push origin main
```
El CI hará el build y deploy automáticamente. ✅

---

## 3️⃣ Verificar CORS en el backend

En `application.properties` (producción), la URL de Vercel debe estar en los orígenes permitidos:
```properties
cors.allowed-origins=https://tu-proyecto.vercel.app
```

---

## 4️⃣ Tests Selenium (locales)

Los tests E2E NO corren en CI (requieren Chrome + servers activos). Correrlos localmente:

```bash
# Terminal 1
./gradlew bootRun

# Terminal 2
cd frontend && npm run dev

# Terminal 3
./gradlew test --tests "com.usco.invernadero.FrontendSeleniumTest" --info
```

**8 tests:**
1. ✅ Formulario visible tras login
2. ✅ Validación campos vacíos  
3. ✅ Crear zona → aparece en panel
4. ✅ Eliminar zona → desaparece del panel
5. ✅ Navegar a Taiga → ver historias HU-01..HU-09
6. ✅ Navegar a Usuarios → tabla o acceso restringido
7. ✅ Botón "Descargar PDF" visible en Taiga
8. ✅ Sidebar colapsa y expande
