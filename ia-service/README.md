# RAEE SMART - Servicio de IA

Microservicio en FastAPI que clasifica fotos de aparatos electrónicos en una
de 8 categorías (mismo enum `TipoRAEE` del backend Java).

## Cómo ejecutar el servicio de IA

Todos los comandos se ejecutan **desde la carpeta `ia-service`**.

### 1. Preparar el entorno (solo la primera vez)

> **Atajo Windows:** ejecuta `run_demo.bat` (doble clic o `.\run_demo.bat`).
> Crea la venv e instala dependencias automáticamente si faltan y arranca la demo.

```bash
python -m venv venv
source venv/bin/activate          # En Windows PowerShell: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

> En Windows, si `Activate.ps1` da error de *execution policy*, ejecuta una vez:
> `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

### 2. Arrancar la API (`/docs`)

```bash
uvicorn app.main:app --reload --port 8000
```

- Documentación interactiva (Swagger): http://127.0.0.1:8000/docs
- Estado del servicio: http://127.0.0.1:8000/estado

Por defecto arranca en **modo real** si encuentra el modelo en
`model_weights/raee_mobilenetv2_v1.h5`; si no, cae automáticamente a
**modo simulado** (resultados de ejemplo, sin modelo).

### 3. Vista amigable de reconocimiento IA (demo)

Página para subir una foto, previsualizarla, clasificarla y ver el estado del
servicio. Se sirve en http://127.0.0.1:8010 y es independiente de la API (`/docs`).

**Forma más fácil en Windows (un solo comando):** `run_demo.bat`

```powershell
.\run_demo.bat
```

Este comando inicia todo lo de Python: crea la venv e instala las dependencias
si faltan, y arranca la vista (equivale a `python demo.py`). También sirve
haciendo doble clic sobre `run_demo.bat`.

**Alternativa manual** (con la venv ya preparada):

```bash
python demo.py
```

Luego abre manualmente http://127.0.0.1:8010 en el navegador.

### Modo simulado forzado (sin usar el modelo)

```bash
# Linux / macOS
export RAEE_IA_MODO_SIMULADO=true
# Windows PowerShell
$env:RAEE_IA_MODO_SIMULADO="true"

uvicorn app.main:app --reload --port 8000
```

También puedes cambiar la ruta del modelo con las variables
`RAEE_IA_RUTA_MODELO` y `RAEE_IA_RUTA_CATEGORIAS`.

## Entrenamiento

### Paso 0 (opcional): descargar el dataset automáticamente

Si no tienes fotos propias todavía, `training/descargar_dataset.py` arma el
dataset buscando en Google Imágenes por categoría:

```bash
cd training
pip install icrawler
python descargar_dataset.py
```

Esto crea `training/dataset/<CATEGORIA>/` con fotos para cada término de
búsqueda (varias búsquedas por categoría, ~100 fotos cada una). Tarda varios
minutos porque son muchas descargas. **Revisa las carpetas después** y borra
a mano las fotos irrelevantes (logos, dibujos, resultados que no
correspondan) antes de entrenar — ningún crawler automático es 100% preciso.

### Pasos normales

1. Si prefieres fotos propias o de otra fuente en vez del paso 0, organízalas
   en `training/dataset/` con una carpeta por categoría, usando EXACTAMENTE
   estos nombres: `CELULAR`, `EQUIPO_DE_SONIDO`, `IMPRESORA`, `LAPTOP`,
   `PEQUENO_ELECTRODOMESTICO`, `REFRIGERADORA`, `TABLET`, `TELEVISOR`.
2. `cd training && python train.py`
3. `python evaluate.py` para ver la precisión y la matriz de confusión.

## Conectar con el backend Java

En el `application.properties` del backend:
```
raeesmart.ia.base-url=http://localhost:8000
```

---

## Captura del servicio de IA

<div align="center">
  <img src="../capturas/serivicioIA.png" alt="Vista del servicio de IA" width="720" style="border-radius: 12px;">
  <br><sub><b>Vista de reconocimiento de imágenes con IA</b></sub>
</div>
