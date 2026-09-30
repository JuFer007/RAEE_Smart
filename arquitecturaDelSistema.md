# Arquitectura de RAEE SMART

Documento de referencia con la estructura completa del sistema: Backend (Spring Boot),
Módulo de IA (Python/FastAPI), App móvil (React Native) y Panel municipal (React.js).

---

## 1. Backend — Spring Boot (Java)

```
com.raeesmart.backend
│
├── config/
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   └── SwaggerConfig.java
│
├── controller/
│   ├── AuthController.java
│   ├── UsuarioController.java
│   ├── EntregaController.java
│   ├── CertificadoController.java
│   ├── MunicipalidadController.java
│   └── ReporteController.java          # panel MINAM/SIGERSOL
│
├── service/
│   ├── UsuarioService.java (+ impl)
│   ├── EntregaService.java (+ impl)
│   ├── CertificadoService.java (+ impl)
│   ├── ClasificacionIAService.java (+ impl)   # consume el microservicio Python
│   ├── GeolocalizacionService.java (+ impl)   # consume API de mapas
│   └── QRService.java (+ impl)
│
├── repository/
│   ├── UsuarioRepository.java
│   ├── EntregaRepository.java
│   ├── CertificadoRepository.java
│   ├── MunicipalidadRepository.java
│   ├── PuntoRecoleccionRepository.java
│   └── CategoriaRAEERepository.java
│
├── model/ (entidades JPA)
│       ├── Enums 
│           ├── RolUsuario.java (enum)
│           ├── TipoRAEE.java (enum)
│           ├── EstadoEntrega.java (enum)
│   ├── Municipalidad.java
│   ├── PuntoRecoleccion.java
│   ├── CategoriaRAEE.java
│   ├── Entrega.java
│   ├── Certificado.java
│   └── ReporteIA.java
│   ├── Usuario.java
│
├── dto/
│   ├── request/
│   │   ├── EntregaRequestDTO.java
│   │   └── LoginRequestDTO.java
│   └── response/
│       ├── EntregaResponseDTO.java
│       ├── ClasificacionResponseDTO.java
│       └── CertificadoResponseDTO.java
│
├── exception/
│   ├── GlobalExceptionHandler.java
│   └── ResourceNotFoundException.java
│
└── RaeeSmartApplication.java
```

### Endpoints REST principales

| Método | Endpoint | Función |
|---|---|---|
| POST | `/api/auth/registro` | crear usuario |
| POST | `/api/auth/login` | autenticación (JWT) |
| POST | `/api/entregas` | crea entrega: foto + ubicación → llama IA y geolocalización |
| PUT | `/api/entregas/{id}/corregir` | corrección manual de la clasificación IA |
| GET | `/api/entregas/{id}` | detalle de una entrega |
| GET | `/api/usuarios/{id}/entregas` | historial del ciudadano |
| GET | `/api/certificados/{id}` | obtener certificado |
| GET | `/api/certificados/verificar/{codigoHash}` | verificación pública del QR |
| GET | `/api/municipalidades/{id}/puntos` | puntos de recolección de una municipalidad |
| GET | `/api/reportes/municipalidad/{id}` | estadísticas para el panel municipal |
| GET | `/api/reportes/minam` | data agregada para SIGERSOL (escalamiento) |

### Base de datos

- **PostgreSQL** con extensión **PostGIS** para consultas de cercanía geoespacial.
- Tablas principales: `usuarios`, `municipalidades`, `puntos_recoleccion`, `categorias_raee`,
  `entregas`, `certificados`, `reportes_ia`.

---

## 2. Módulo de IA — Python + FastAPI + TensorFlow

```
raee-ia-service/
├── app/
│   ├── main.py                      # arranque de FastAPI y registro de routers
│   ├── config.py                    # variables de entorno (puerto, path del modelo, umbral)
│   │
│   ├── routers/
│   │   └── clasificacion_router.py  # endpoint POST /clasificar
│   │
│   ├── schemas/
│   │   └── clasificacion_schema.py  # Pydantic: ClasificacionResponse
│   │
│   ├── services/
│   │   └── inference_service.py     # carga el modelo .h5 y ejecuta la predicción
│   │
│   ├── models/
│   │   └── mobilenet_classifier.py  # wrapper del modelo (carga, preprocesamiento, predict)
│   │
│   └── utils/
│       └── image_preprocessing.py   # resize, normalización, conversión a tensor
│
├── training/                        # separado del servicio en producción
│   ├── train.py                     # transfer learning con MobileNetV2
│   ├── dataset_loader.py            # dataset Kaggle + fotos propias del piloto
│   └── evaluate.py                  # métricas: accuracy, matriz de confusión
│
├── model_weights/
│   └── raee_mobilenetv2_v1.h5       # modelo entrenado exportado
│
├── requirements.txt                 # fastapi, uvicorn, tensorflow, pillow, python-multipart
├── Dockerfile                       # despliegue en Render / Hugging Face Spaces
└── README.md
```

### Endpoint

```
POST /clasificar
Body: multipart/form-data { imagen: file }
Response: { "categoria": "Laptop", "confianza": 0.91, "top3": [...] }
```

**Flujo:** el Backend (`ClasificacionIAService`) envía la foto → FastAPI preprocesa →
`mobilenet_classifier.py` predice → devuelve JSON con categoría + confianza, usado para
crear la `Entrega`.

Categorías del MVP (6): Televisor CRT, Laptop, Refrigeradora, Celular, Impresora,
Pequeño electrodoméstico.

---

## 3. App Móvil — React Native

```
raee-smart-app/
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── RegistroScreen.js
│   │   ├── HomeScreen.js
│   │   ├── CapturaFotoScreen.js       # cámara + preview
│   │   ├── ConfirmacionScreen.js      # categoría sugerida por IA + corrección manual
│   │   ├── CertificadoScreen.js       # QR y detalle del certificado
│   │   └── HistorialScreen.js         # entregas pasadas del usuario
│   │
│   ├── components/
│   │   ├── CameraCapture.js
│   │   ├── MapPicker.js               # selecciona/confirma ubicación
│   │   ├── QRDisplay.js
│   │   ├── CategoriaCard.js
│   │   └── LoadingOverlay.js
│   │
│   ├── navigation/
│   │   └── AppNavigator.js            # Login → Home → Captura → Confirmación → Certificado
│   │
│   ├── services/
│   │   ├── api.js                     # instancia axios con baseURL del backend
│   │   ├── authService.js
│   │   ├── entregaService.js          # POST /api/entregas, GET historial
│   │   └── geolocationService.js      # expo-location / react-native-geolocation
│   │
│   ├── context/
│   │   └── AuthContext.js             # JWT y sesión del usuario
│   │
│   ├── hooks/
│   │   └── useLocation.js
│   │
│   └── utils/
│       └── constants.js               # URLs, colores, categorías
│
├── App.js
├── package.json
└── app.json
```

**Flujo:** `CapturaFotoScreen` sube la foto → backend responde con categoría IA + punto de
recojo asignado → `ConfirmacionScreen` (con opción de corregir) → al confirmar,
`CertificadoScreen` renderiza el QR recibido.

---

## 4. Panel Municipal — React.js (Dashboard)

```
raee-panel-municipal/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx              # resumen: entregas del día, totales por categoría
│   │   ├── Entregas.jsx               # tabla con filtros (estado, fecha, categoría)
│   │   └── Estadisticas.jsx           # gráficos para reportes MINAM/SIGERSOL
│   │
│   ├── components/
│   │   ├── EntregaTable.jsx
│   │   ├── StatsCard.jsx
│   │   ├── MapView.jsx                # puntos de recolección en mapa
│   │   └── ExportButton.jsx           # exportar reporte (CSV/PDF)
│   │
│   ├── services/
│   │   └── api.js                     # consume /api/reportes/municipalidad/{id}
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   └── App.jsx
│
├── package.json
└── vite.config.js
```

**Flujo:** consume `GET /api/reportes/municipalidad/{id}` para mostrar en tiempo real las
entregas gestionadas en el distrito, dando trazabilidad a la municipalidad.

---

## 5. Flujo de datos end-to-end

1. El ciudadano captura una foto del aparato desde la **app móvil** (React Native).
2. La foto + ubicación se envía vía **HTTPS/REST** al **Backend/API** (Spring Boot).
3. El backend reenvía la imagen al **Módulo de IA** (FastAPI/TensorFlow), que devuelve el
   tipo de RAEE identificado y su nivel de confianza.
4. El backend consulta el **servicio de geolocalización** para ubicar el punto municipal de
   recojo más cercano.
5. Se genera el **certificado digital con código QR**, almacenado en **PostgreSQL** junto
   con el registro de la entrega.
6. El **Panel Municipal** (React.js) consume la misma API para mostrar en tiempo real las
   solicitudes y estadísticas de RAEE gestionadas en su distrito.

---

*Documento de referencia — Proyecto RAEE SMART, Innovación y Transformación Digital
(26389), UTP Chiclayo 2026.*