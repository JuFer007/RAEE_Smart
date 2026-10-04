from app.models.mobilenet_classifier import clasificador
from app.schemas.clasificacion_schema import ClasificacionResponse


async def clasificar_imagen(bytes_imagen: bytes) -> ClasificacionResponse:
    resultado = clasificador.clasificar(bytes_imagen)
    return ClasificacionResponse(**resultado)
