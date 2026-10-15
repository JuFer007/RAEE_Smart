from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.models.mobilenet_classifier import clasificador
from app.routers import clasificacion_router

STATIC_DIR = Path(__file__).resolve().parent / "static"

app = FastAPI(
    title="RAEE Smart - Vista de reconocimiento IA",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

app.include_router(clasificacion_router.router)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", include_in_schema=False)
def vista():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/estado")
def estado():
    modo_simulado = clasificador.modo_simulado
    return {
        "servicio": "RAEE SMART IA",
        "estado": "activo",
        "modo_simulado": modo_simulado,
        "modelo": None if modo_simulado else Path(settings.RUTA_MODELO).name,
        "categorias": clasificador.categorias,
    }
