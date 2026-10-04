from fastapi import FastAPI

from app.config import settings
from app.routers import clasificacion_router

app = FastAPI(
    title="RAEE SMART - Servicio de IA",
    description="Clasificación de imágenes de RAEE (MobileNetV2 + transfer learning)",
    version="1.0.0",
)

app.include_router(clasificacion_router.router)


@app.get("/")
def estado():
    return {
        "servicio": "RAEE SMART IA",
        "estado": "activo",
        "modo_simulado": settings.MODO_SIMULADO,
    }


@app.get("/salud")
def salud():
    return {"ok": True}
