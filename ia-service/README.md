# RAEE SMART - Servicio de IA

Microservicio en FastAPI que clasifica fotos de aparatos electrónicos en una
de 6 categorías (mismo enum `TipoRAEE` del backend Java).

## Correr en modo simulado (sin modelo entrenado)

```bash
python -m venv venv
source venv/bin/activate          # En Windows: venv\Scripts\activate
pip install fastapi "uvicorn[standard]" python-multipart pillow numpy pydantic
uvicorn app.main:app --reload --port 8001
```

Prueba en el navegador: http://localhost:8001/docs

## Correr en modo real (con el modelo ya entrenado)

1. Entrena el modelo (ver sección Entrenamiento) o copia
   `raee_mobilenetv2_v1.h5` y `categorias.json` dentro de `model_weights/`.
2. Instala todo, incluyendo TensorFlow: `pip install -r requirements.txt`
3. `export RAEE_IA_MODO_SIMULADO=false` (En Windows: `set RAEE_IA_MODO_SIMULADO=false`)
4. `uvicorn app.main:app --reload --port 8001`

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
   estos nombres: `TELEVISOR`, `LAPTOP`, `CELULAR`, `REFRIGERADORA`,
   `IMPRESORA`, `PEQUENO_ELECTRODOMESTICO`.
2. `cd training && python train.py`
3. `python evaluate.py` para ver la precisión y la matriz de confusión.

## Conectar con el backend Java

En el `application.properties` del backend:
```
raeesmart.ia.base-url=http://localhost:8001
```
