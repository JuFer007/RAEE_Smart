# RAEE Smart · servidor-pdf (US-18)

Servicio Node + Puppeteer para generar los reportes PDF y el certificado PDF de RAEE Smart.
Las plantillas HTML están en `templates/`, el logo en `recursos/` y el servicio lee el `.env` de la raíz del repo.

## Variables (.env de la raíz)

```env
BACKEND_PORT=8080
PORT_PDF=3007
JWT_SECRET=<el mismo valor que usa el backend>
BACKEND_URL=http://localhost:8080/api
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:19006,http://localhost:8081
CERT_PDF_BASE_URL=http://localhost:3007
VITE_PDF_BASE_URL=http://localhost:3007
USE_MOCK=false
PUPPETEER_EXECUTABLE_PATH=<ruta opcional a Chrome/Edge>
```

En un dispositivo físico con Expo, define `EXPO_PUBLIC_PDF_BASE_URL=http://<IP-de-la-PC>:3007`.
Si no se define, la app deriva el host del servidor de Expo y usa el puerto `3007`.

## Uso

```bash
cd servidor-pdf
npm install
npm start
```

## Endpoints

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/generar-reporte-municipalidad` | MUNICIPALIDAD, ADMIN | Reporte PDF de entregas de una municipalidad |
| `POST` | `/generar-reporte-superadmin` | ADMIN | Reporte PDF consolidado |
| `POST` | `/generar-reporte-municipalidades` | ADMIN | Reporte PDF solo con el padrón de municipalidades |
| `POST` | `/generar-certificado` | JWT | Certificado PDF por `entregaId` |
| `GET` | `/certificado/entrega/:entregaId/pdf` | JWT | Certificado PDF por entrega, usado por la app móvil |
| `GET` | `/certificado/:codigoHash/pdf` | Público | Certificado PDF por código de verificación |
| `GET` | `/health` | Público | Estado del servicio |

### Reportes

Body (todo opcional salvo `municipalidadId` en el reporte municipal):

```json
{ "municipalidadId": 1, "fechaInicio": "2026-07-01", "fechaFin": "2026-09-30", "categoria": "LAPTOP" }
```

`categoria` usa el enum `TipoRAEE` o `TODAS`. Sin entregas para los filtros responde `404` con `{ "error": "..." }`.

### Certificado

Ejemplo para la app móvil:

```http
GET /certificado/entrega/15/pdf
Authorization: Bearer <JWT del ciudadano>
```

La respuesta es `application/pdf` en orientación horizontal con `Content-Disposition: attachment`. El PDF incluye el QR devuelto por el backend, los datos del titular (nombre y DNI), los datos de la entrega y el código de verificación.

El backend expone `urlPdf` en `GET /api/certificados/entrega/{id}` y `GET /api/certificados/verificar/{hash}` apuntando a `/certificado/{hash}/pdf` de este servicio.

## Desde el panel

Los botones “Exportar PDF” de Reportes, Reportes consolidados y Municipalidades llaman al servicio con el token del panel y descargan el blob.

```ts
const respuesta = await fetch('http://localhost:3007/generar-reporte-municipalidad', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ municipalidadId, fechaInicio, fechaFin, categoria }),
});
const blob = await respuesta.blob();
```

## Datos

El servicio no recibe las entregas del cliente: las pide al backend reenviando el token.

- `GET /api/reportes/municipalidad/{id}`
- `GET /api/municipalidades/{id}/puntos`
- `GET /api/admin/municipalidades`
- `GET /api/certificados/entrega/{id}`
- `GET /api/certificados/verificar/{hash}` (público)

## Notas

- Puppeteer usa Chromium descargado por `npm install`. Si ya tienes Chrome/Edge, define `PUPPETEER_EXECUTABLE_PATH`.
- Los reportes municipales, consolidados y de municipalidades usan `templates/estilos.css`; el certificado usa `templates/certificado.html`.
- El logo se incrusta como data URI para que el PDF no dependa de rutas relativas.
