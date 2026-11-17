# RAEE Smart · pdf-service (US-18)

Servicio Node + Puppeteer para exportar reportes de entregas en PDF. Misma estructura que `pdf-service` de PetHouse:
endpoints `POST /generar-reporte-...`, plantillas HTML con placeholders `{{}}` y PDF descargable.

Colócalo en la raíz del repo, junto a `ia-service/`. Lee el `.env` de la raíz, el mismo que usa el backend Spring.

## Variables (.env de la raíz)
```
PORT_PDF=3007
JWT_SECRET=<el mismo valor que usa el backend>
BACKEND_PORT=8080            # o BACKEND_URL=http://host:8080/api
CORS_ALLOWED_ORIGINS=http://localhost:5173
USE_MOCK=false               # true = datos de prueba, sin backend
```

## Uso
```bash
cd pdf-service && npm install && npm start
```

## Endpoints (header `Authorization: Bearer <JWT del panel>`)
| Rol | Endpoint | Plantilla |
|---|---|---|
| MUNICIPALIDAD, ADMIN | `POST /generar-reporte-municipalidad` | `templates/reporteMunicipalidad.html` |
| ADMIN | `POST /generar-reporte-superadmin` | `templates/reporteSuperadmin.html` |

Body (todo opcional salvo `municipalidadId` en el primero):
```json
{ "municipalidadId": 1, "fechaInicio": "2026-07-01", "fechaFin": "2026-09-30", "categoria": "LAPTOP" }
```
`categoria` usa el enum `TipoRAEE`. Sin entregas para los filtros responde `404` con `{ "error": "..." }`.

## Desde el panel (mismo patrón que scriptReportes.js)
```ts
const r = await fetch('http://localhost:3007/generar-reporte-municipalidad', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${obtenerToken()}` },
  body: JSON.stringify({ municipalidadId, fechaInicio, fechaFin, categoria }),
});
if (!r.ok) throw new Error((await r.json()).error);
const url = URL.createObjectURL(await r.blob());
Object.assign(document.createElement('a'), { href: url, download: 'reporte-entregas.pdf' }).click();
URL.revokeObjectURL(url);
```

## Datos
El servicio no recibe las entregas del cliente: las pide al backend reenviando el token.
- `GET /api/reportes/municipalidad/{id}` (el backend valida que la municipalidad sea la del usuario)
- `GET /api/municipalidades/{id}/puntos` (nombre de la municipalidad, horarios)
- `GET /api/admin/municipalidades` (solo ADMIN: distrito, dirección, email, estado)

Campos usados: `tipoRaee`, `nombreCategoriaVisible`, `confianzaIa`, `clasificacionCorregida`, `estado`,
`puntoRecoleccion*`, `certificadoCodigoQr`, `fechaRegistro`, `fechaConfirmacion`.
`CONFIRMADA` se muestra como "Certificada", igual que en el panel.

## Notas
- Con Docker, instala Chromium y define `PUPPETEER_EXECUTABLE_PATH`.
- Colores tomados de `web-panel/src/theme.ts`; el logo está en `recursos/logo.png`.
