from pathlib import Path

from fastapi import FastAPI, Response

from app.config import settings
from app.models.mobilenet_classifier import clasificador
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
        "modelo": Path(settings.RUTA_MODELO).name,
        "categorias": clasificador.categorias,
    }


@app.get("/salud")
def salud():
    return {"ok": True}


@app.head("/salud", include_in_schema=False)
def salud_head():
    return Response(status_code=200)


@app.get("/categorias")
def categorias():
    return {
        "categorias": clasificador.categorias,
        "total": len(clasificador.categorias),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT)

