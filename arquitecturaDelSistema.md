# Arquitectura de RAEE SMART

Documento de referencia del sistema **RAEE Smart**: plataforma para la gestión de residuos de
aparatos eléctricos y electrónicos con clasificación por IA, certificación digital con QR y
reportes municipales.

> Última actualización: noviembre 2026.
> Este documento describe **el código actual** y el **despliegue objetivo**. Para ejecutar en
> local se usa `docker compose`; en la nube, Render + Vercel + Expo + Supabase.

---

## 1. Alcance y componentes

| Componente | Carpeta | Tecnología | Rol |
|---|---|---|---|
| Backend | `backend/` | Java 17 · Spring Boot 3.4.5 · Maven | API REST, seguridad JWT, reglas de negocio, PostgreSQL |
| Servicio de IA | `ia-service/` | Python 3.11 · FastAPI · TensorFlow/Keras | Clasificación de fotos en 8 categorías RAEE |
| Servidor de PDF | `servidor-pdf/` | Node 20 · Express · Puppeteer | Reportes y certificados PDF |
| Panel web | `web-panel/` | React 18 · Vite · TypeScript · Leaflet · Recharts | Landing, panel municipal y panel superadmin |
| App móvil | `app-movil/` | Expo SDK 58 · React Native 0.88 · React Navigation · Axios | Registro de entregas, mapa, notificaciones, certificados |
| Base de datos | — | PostgreSQL 16 (local) / Supabase Free (nube) | Persistencia relacional |
| Orquestación local | `docker-compose.yml` | Docker Compose | 7 servicios: `db`, `backend`, `ia-service`, `ia-demo`, `servidor-pdf`, `web-panel`, `app-movil` |
| Carga inicial | `scriptLlenado.sql` | SQL idempotente | 8 categorías, 12 municipalidades, 14 puntos, campañas, usuarios de prueba y datos de ejemplo |

No existe routing ni lógica de negocio en un único proceso: son servicios independientes que se
comunican por HTTPS/REST. El servidor de PDF **no** está dentro del backend Spring; es un
servicio aparte al que el backend y los clientes envían peticiones.

---

## 2. Arquitectura actual (alto nivel)

```
                      ┌──────────────────────┐
   Navegador  ───────▶│  web-panel (Vite)    │
                      └──────────┬───────────┘
                                 │ REST + JWT
   App móvil / Expo ─────────────┤
                                 ▼
                      ┌──────────────────────┐        ┌─────────────────┐
                      │  backend Spring Boot │───────▶│ PostgreSQL /    │
                      │  /api  ·  /api/health│        │ Supabase        │
                      └───────┬──────┬───────┘        └─────────────────┘
                              │      │
              /clasificar     │      │  datos para reportes
                              ▼      ▼
                   ┌────────────────┐  ┌────────────────────┐
                   │ ia-service     │  │ servidor-pdf       │
                   │ FastAPI/TF     │  │ Express/Puppeteer  │
                   └────────────────┘  └────────────────────┘
```

---

## 3. Backend — Spring Boot

### 3.1 Estructura real

`backend/src/main/java/com/raeesmart/backend/` (clase principal: `BackendApplication.java`):

- **Config/**: `SecurityConfig` (JWT stateless, reglas por rol), `CorsConfig` (orígenes y
  patrones configurables), `AsyncConfig`, `IAContratoValidator`, `SwaggerConfig`.
- **Controller/**: `AuthController`, `UsuarioController`, `EntregaController`,
  `ClasificacionController`, `CertificadoController`, `MunicipalidadController`,
  `ReporteController`, `NotificacionController`, `SatisfaccionController`, `HealthController`
  y los controladores de administración (`AdminPuntoController`, `AdminCampanaController`,
  `AdminMunicipalidadController`, `AdminUsuarioController`, `AdminAuditoriaController`,
  `AdminSatisfaccionController`).
- **Service/** (+ `Impl/`): usuarios, entregas, certificados, QR, almacenamiento,
  geolocalización, clasificación IA, campañas, notificaciones, satisfacción, auditoría,
  correo y recuperación de contraseña.
- **Repository/**, **Model/** (entidades JPA y enums), **Dto/** (request/response),
  **Exception/** (`GlobalExceptionHandler`, `ResourceNotFoundException`,
  `ServicioIaNoDisponibleException`, `RespuestaIaInvalidaException`,
  `PeticionRechazadaIaException`), **Security/** (`JwtAuthenticationFilter`, `JwtService`).

### 3.2 Endpoints principales

| Método | Endpoint | Función |
|---|---|---|
| GET | `/api/health` | Health check público para el keep-alive (sin acceso a BD) |
| POST | `/api/auth/registro`, `/login`, `/login/movil` | Registro y autenticación JWT |
| POST/GET | `/api/auth/recuperar-password`, `/reenviar-codigo`, `/verificar-codigo`, `/restablecer-password`, `/auth/me` | Recuperación de contraseña y sesión |
| POST | `/api/entregas` | Crea entrega (multipart: `foto`, `latitud`, `longitud`, `puntoRecoleccionId?`) |
| PUT | `/api/entregas/{id}/confirmar`, `/rechazar`, `/corregir` | Recepción municipal y correcciones (roles MUNICIPALIDAD/ADMIN) |
| GET | `/api/entregas/{id}`, `/api/usuarios/{id}/entregas` | Detalle e historial |
| POST | `/api/clasificaciones`, GET `/api/clasificaciones/estado` | Clasificación y estado del servicio IA |
| GET | `/api/certificados/entrega/{entregaId}`, `/verificar/{codigoHash}` | Certificado por entrega y verificación pública del QR |
| GET | `/api/municipalidades/puntos`, `/{id}/puntos`, `/{id}/campanas`, `/campanas/{campanaId}` | Puntos y campañas públicos |
| GET | `/api/reportes/municipalidad/{municipalidadId}` | Estadísticas del panel municipal |
| CRUD | `/api/admin/puntos`, `/campanas`, `/usuarios`, `/municipalidades` | Administración |
| GET | `/api/admin/auditoria`, `/api/admin/satisfaccion` | Auditoría y satisfacción |
| GET/POST/PUT | `/api/notificaciones/...`, `/api/satisfaccion`, `/api/satisfaccion/mia` | Notificaciones y valoración |
| GET | `/swagger-ui/**`, `/v3/api-docs/**` | Documentación OpenAPI |

**No existen** `/api/certificados/{id}` ni `/api/reportes/minam` (mencionados en versiones
antiguas de este documento).

### 3.3 Seguridad y CORS

JWT stateless con BCrypt. Roles: `CIUDADANO`, `MUNICIPALIDAD`, `ADMIN`; `CanalAcceso` distingue
web y móvil. El token incluye `usuarioId`, `rol`, `canal` y `passwordVersion`.
Los orígenes permitidos se construyen desde `CORS_ALLOWED_ORIGINS` y
`CORS_ALLOWED_ORIGIN_PATTERNS`; los patrones por defecto incluyen localhost, IPs de red local,
`https://*.vercel.app`, `https://*.onrender.com` y `https://*.expo.app`.

### 3.4 Base de datos y persistencia

- Motor: PostgreSQL. Esquema generado por Hibernate (`ddl-auto=update`); no hay Flyway.
- Tablas: `usuario`, `municipalidad`, `puntos_recoleccion`, `categorias_raee`, `campanas`,
  `entregas`, `certificados`, `reportes_ia`, `notificaciones`, `password_reset_codigo`,
  `valoracion_app`, `auditoria_evento`.
- Enums: `RolUsuario`, `TipoRAEE` (8 valores), `EstadoEntrega` (`REGISTRADA`, `EN_PROCESO`,
  `CONFIRMADA`, `RECHAZADA`), `TipoNotificacion`, `CanalAcceso`.
- **PostGIS:** `hibernate-spatial` está como dependencia, pero la cercanía se calcula en Java
  con Haversine sobre `latitud`/`longitud` (`GeolocalizacionServiceImpl`); no hay columnas
  `geometry` ni consultas `ST_Distance`.
- **Fotos:** `AlmacenamientoServiceImpl` escribe en `UPLOADS_DIR` (`./uploads/raee-smart`) y
  guarda la ruta del filesystem en `entregas.foto_url`. En Docker se usa el volumen `uploads`.
  En Render el filesystem es efímero: las fotos se pierden al reiniciar o redesplegar.
- `scriptLlenado.sql` se ejecuta manualmente **después** de que Hibernate crea las tablas.
  Incluye usuarios de prueba con contraseña `123456`: no ejecutar tal cual en producción.

---

## 4. Servicio de IA — FastAPI + TensorFlow

Carpeta `ia-service/` (no `raee-ia-service/`):

- `app/main.py`: endpoints `GET /`, `GET /salud`, `GET /categorias`, `POST /clasificar`.
- `app/routers/clasificacion_router.py`: `POST /clasificar`, campo multipart **`imagen`**.
- `app/schemas/clasificacion_schema.py`: `{categoria, confianza, tiempo_inferencia_ms, top3[]}`.
- `app/services/inference_service.py`, `app/models/mobilenet_classifier.py`,
  `app/utils/image_preprocessing.py`: carga del modelo, resize 224×224 y `predict`.
- `app/config.py`: `IA_HOST`, `IA_PORT`, `IA_RUTA_MODELO`, `IA_RUTA_CATEGORIAS`,
  `IA_TAMANO_IMAGEN`.
- `model_weights/raee_mobilenetv2_v1.h5` (9 MB) es el modelo en producción;
  `model_weights/categorias.json` define las 8 categorías: `CELULAR`, `EQUIPO_DE_SONIDO`,
  `IMPRESORA`, `LAPTOP`, `PEQUENO_ELECTRODOMESTICO`, `REFRIGERADORA`, `TABLET`, `TELEVISOR`.
- `demo.py` / `app/demo_ui.py`: interfaz de prueba en el puerto 8010 (`ia-demo` en Compose).
- `requirements.txt` (local, incluye entrenamiento) y `requirements.prod.txt` (Docker/Render,
  sin `scikit-learn` ni `icrawler`). `training/` se excluye de la imagen de producción.

El backend llama a `/clasificar` con timeout de 30 s y a `/salud` y `/categorias` con 5 s.
El modelo se carga al importar el módulo: si falla, el servicio no arranca (no hay modo
degradado). **Consumo observado:** ~316 MB al importar TensorFlow, ~372 MB tras cargar el
modelo y ~406 MB tras la primera inferencia.

---

## 5. Servidor de PDF — Node + Puppeteer

Carpeta `servidor-pdf/`; `server.js` + plantillas en `templates/` y logo en `recursos/`.

| Método | Endpoint | Acceso |
|---|---|---|
| POST | `/generar-reporte-municipalidad` | MUNICIPALIDAD / ADMIN |
| POST | `/generar-reporte-superadmin`, `/generar-reporte-municipalidades` | ADMIN |
| POST | `/generar-certificado` | JWT |
| GET | `/certificado/entrega/:entregaId/pdf` | JWT |
| GET | `/certificado/:codigoHash/pdf` | Público (QR) |
| GET | `/health`, `/` | Público (keep-alive) |

Valida el mismo JWT que el backend usando `JWT_SECRET`, obtiene los datos del backend mediante
`BACKEND_URL` reenviando el token (`datos.js`, `certificado.js`) y renderiza HTML con Puppeteer
sobre Chromium del sistema (`PUPPETEER_EXECUTABLE_PATH`). El puerto es
`PORT_PDF || PORT || 3007`. CORS admite orígenes exactos y patrones.

---

## 6. Panel web — React + Vite + TypeScript

Carpeta `web-panel/` (`npm run dev` en 5173; `npm run build` → `dist`).

- **Rutas** (`src/routes/AppRoutes.tsx`): landing `/`, `/login`, `/acceso-denegado`;
  panel municipal `/panel/municipal/*` (dashboard, entregas, recepción, puntos, horarios,
  campañas, estadísticas, reportes, satisfacción, verificar-certificado); panel superadmin
  `/panel/*` (resumen, municipalidades, usuarios, reportes, calidad-ia, satisfacción).
- Usa `BrowserRouter`: requiere rewrite `/* → /index.html` en cualquier hosting estático.
- `src/api/client.ts`: `VITE_API_BASE_URL` o `http://<host>:8080/api`; token en
  `localStorage`/`sessionStorage` y logout automático en 401.
- `src/api/pdf.ts`: `VITE_PDF_BASE_URL` o `http://<host>:3007` para descargar PDFs.
- `src/components/MapView.tsx`: Leaflet con teselas de OpenStreetMap (sin clave).
- Las variables `VITE_*` se incrustan en el bundle **en tiempo de build**.

**No hay** WebSocket/SSE: los datos se consultan por REST periódicamente; "tiempo real" en
documentos anteriores era una descripción imprecisa.

---

## 7. App móvil — Expo / React Native

Carpeta `app-movil/`: Expo SDK 58, React Native 0.88, React 19, React Navigation
(native-stack + bottom-tabs), Axios, cámara, ubicación, notificaciones, impresión y
compartir. Entry point `App.js`; `app.json` con `bundleIdentifier`/`package`
`pe.raeesmart.app` y `web.output: "single"`.

- `src/theme/index.js` resuelve `API_BASE_URL` y `PDF_BASE_URL` desde
  `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_PDF_BASE_URL`, con detección automática del host de
  Expo en desarrollo (`10.0.2.2` en Android). `app.config.js` lee el `.env` de la raíz.
- Flujos: bienvenida/login/registro, recuperación de contraseña, captura con cámara,
  corrección de categoría, registro de entrega, selección de punto y mapa, horarios y
  campañas, certificado con QR, historial, notificaciones, perfil y contenido informativo.
- La app **no** llama directamente a la IA: envía la foto a `/api/clasificaciones` del backend.

### Distribución gratuita

1. **Web:** `npx expo export --platform web` → Vercel (root `app-movil`, `dist`, rewrite).
2. **APK interno:** `eas.json` con perfil `preview` (`distribution: internal`, `buildType: apk`)
   y el plan gratuito de Expo (15 builds Android/mes) → link de descarga, sin tienda.
3. **OTA opcional:** Expo Update gratis hasta 1.000 usuarios activos mensuales (requiere
   instalar `expo-updates`; no cambia código nativo).
4. Para publicación en tiendas se requiere Play Console (~$25 único) o Apple ($99/año).

---

## 8. Flujos end-to-end

1. El ciudadano captura la foto y envía foto + ubicación al backend (`POST /api/entregas`).
2. El backend reenvía la imagen a `ia-service` (`POST /clasificar`) y valida la categoría
   contra `TipoRAEE`; si no se envió punto, `GeolocalizacionServiceImpl` elige el más cercano
   con Haversine.
3. La entrega queda en `REGISTRADA`/`EN_PROCESO`; la municipalidad confirma o rechaza
   (`PUT /api/entregas/{id}/confirmar|rechazar`).
4. Al confirmar se genera el certificado con `codigoHash` y QR (ZXing) y se construye la URL
   pública con `CERT_VERIFICATION_BASE_URL` y `CERT_PDF_BASE_URL`.
5. El QR se verifica públicamente en `/api/certificados/verificar/{codigoHash}` y el PDF se
   descarga desde `servidor-pdf`.
6. El panel municipal y el superadmin consumen reportes, entregas, satisfacción y auditoría;
   los PDFs se generan en el servicio Node, no en el backend.

Flujo adicional: registro/login, recuperación de contraseña por correo (SMTP en local; en
Render Free requiere pasar a una API HTTP de correo), campañas, puntos, horarios y
notificaciones.

---

## 9. Variables de entorno

Plantilla: `.env.example`. En local, los servicios importan `.env` de la raíz (Spring
`spring.config.import`, Python `load_dotenv`, Node `dotenv`). En la nube se configuran en los
dashboards; **el `.env` real no se sube al repositorio**.

| Servicio | Variables principales |
|---|---|
| Backend | `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `BACKEND_PORT`, `JWT_SECRET`, `JWT_EXPIRATION_MS`, `PASSWORD_RESET_SECRET`, `IA_BASE_URL`, `UPLOADS_DIR`, `CERT_VERIFICATION_BASE_URL`, `CERT_PDF_BASE_URL`, `CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_ORIGIN_PATTERNS`, `SMTP_*`, `SHOW_SQL`, `FORMAT_SQL` |
| IA | `IA_HOST`, `IA_PORT`, `IA_RUTA_MODELO`, `IA_RUTA_CATEGORIAS`, `IA_TAMANO_IMAGEN`, `TF_NUM_*_THREADS`, `OMP_NUM_THREADS` |
| PDF | `PORT_PDF`, `PORT`, `JWT_SECRET`, `BACKEND_URL`, `PUPPETEER_EXECUTABLE_PATH`, `CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_ORIGIN_PATTERNS`, `NODE_ENV` |
| Web (build) | `VITE_API_BASE_URL`, `VITE_PDF_BASE_URL` |
| Móvil (build) | `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_PDF_BASE_URL`, `EXPO_PUBLIC_MAP_STYLE_URL`, `EXPO_PUBLIC_USAR_DATOS_PRUEBA` |

**Credenciales:** rotar `JWT_SECRET`, `PASSWORD_RESET_SECRET` y la contraseña de la BD antes de
publicar. El seed con contraseñas `123456` es solo para desarrollo.

---

## 10. Despliegue objetivo

### 10.1 Topología

| Plataforma | Recurso | Plan | Contenido |
|---|---|---|---|
| Render (workspace A) | Web Service Docker `backend` | Free | Spring Boot, `/api/health` |
| Render (workspace B) | Web Service Docker `ia-service` | Free | FastAPI, `/salud` |
| Render (workspace C) | Web Service Docker `servidor-pdf` | Free | Express + Chromium, `/health` |
| Supabase | PostgreSQL | Free | Esquema + seed |
| Vercel | Static Site `web-panel` | Hobby (gratis) | Panel web |
| Vercel | Static Site `app-movil` | Hobby (gratis) | Versión web de la app |
| Expo Services | Build `preview` + Update | Free | APK interno y OTA |
| Pinger externo | cron-job.org / UptimeRobot | Gratis | 3 peticiones cada 10 min |

Se usan **tres workspaces de Render** porque el límite de 750 horas es por workspace: un
servicio siempre encendido consume ~720-744 h al mes; dos servicios en el mismo workspace
agotarían el cupón a mitad de mes. Vercel y los Static Sites no duermen.

### 10.2 Compatibilidad local y nube

- Los Dockerfiles usan `${PORT:-8080}`, `${PORT:-8000}` y `${PORT:-3007}`: Render inyecta
  `PORT`; en `docker compose` no existe y se mantienen los puertos locales.
- `servidor-pdf` prefiere `PORT_PDF`, luego `PORT`, luego `3007`; el `.env` local sigue
  funcionando igual.
- `/api/health` es un endpoint nuevo, público y liviano; no sustituye a ningún endpoint
  existente ni cambia el comportamiento local.
- `requirements.prod.txt` solo se usa en Docker/Render; `requirements.txt` se mantiene para
  desarrollo y entrenamiento local.
- `vercel.json` y `eas.json` solo los consumen esas plataformas; `npm run dev` y
  `expo start` siguen igual.

### 10.3 Pasos de despliegue

1. **Supabase:** crear proyecto, copiar la cadena *Session pooler* (IPv4) y ejecutar
   `scriptLlenado.sql` después de que Hibernate cree las tablas. Definir `DB_URL` con
   `?sslmode=require`.
2. **Render:** crear tres workspaces; en cada uno *New → Web Service → Docker* con Root
   Directory `backend`, `ia-service` y `servidor-pdf`, plan Free. Configurar las variables de
   la sección 9 con URLs públicas `https://…onrender.com`. Health Check Path:
   `/api/health`, `/salud`, `/health`.
3. **Vercel:** dos proyectos desde el mismo repositorio con Root Directory `web-panel` y
   `app-movil`; `vercel.json` ya define build, `dist` y rewrites. Definir `VITE_*` y
   `EXPO_PUBLIC_*` en **build time**.
4. **Expo:** `npm i -g eas-cli`, `eas login`, `eas build --platform android --profile preview`
   → compartir el link del APK; `eas update` para cambios JS.
5. **Keep-alive:** en cron-job.org o UptimeRobot crear tres chequeos cada 10 minutos hacia
   `https://<backend>/api/health`, `https://<ia>/salud` y `https://<pdf>/health`.
   No apuntar a `/robots.txt`: Render responde desde la plataforma y **no** despierta el
   servicio. GitHub Actions `schedule` es alternativa, pero se desactiva tras 60 días sin
   actividad y puede retrasarse.

---

## 11. Limitaciones y pendientes

- **Render Free:** 512 MB RAM, <1 CPU, suspensión tras 15 min inactivo, arranque ~1 min,
  filesystem efímero, sin discos persistentes, sin SMTP saliente (25/465/587), 750 h/mes por
  workspace. Los servicios free no reciben tráfico de red privada entrante: usar URLs públicas
  para `IA_BASE_URL` y `BACKEND_URL`.
- **IA:** TensorFlow + modelo ~406 MB en un límite de 512 MB. Si hay OOM, migrar a
  `tflite-runtime` (conversion del `.h5` a TFLite) o subir solo ese servicio a `1c-2g`.
  El backend tiene timeout de 5 s en `/salud`: un cold start puede hacerlo fallar.
- **Correo:** la recuperación de contraseña por SMTP no funciona en Render Free; migrar a una
  API HTTP de correo.
- **Fotos:** se pierden en cada redespliegue de Render; migrar a Supabase Storage u otro
  object storage si se necesita persistencia.
- **Supabase Free:** los proyectos se pausan tras una semana de inactividad; el tráfico del
  backend evita la pausa mientras la app esté en uso.
- **PostGIS:** dependencia `hibernate-spatial` sin uso real; documentado para evitar supuestos.
- **Swagger:** `/swagger-ui/**` es público; valorar cerrarlo en producción.
- **No implementado:** `/api/reportes/minam`, actualizaciones en tiempo real por WebSocket.

---

## 12. Changelog de este documento

- Se corrigió el número de categorías (6 → 8) y la afirmación de PostGIS (ahora Haversine).
- Se actualizaron nombres de carpetas y de la clase principal; se añadió `servidor-pdf`.
- Se reemplazaron endpoints inexistentes por los reales y se eliminó el mito de "tiempo real".
- Se añadieron secciones de entorno, CORS, keep-alive, límites del plan gratuito y
  compatibilidad local/nube.
- Se añadió `/api/health` y se documentó el despliegue Render + Vercel + Expo + Supabase.

---

*Documento de referencia — Proyecto RAEE SMART, Innovación y Transformación Digital
(26389), UTP Chiclayo 2026.*
