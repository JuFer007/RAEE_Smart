from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.clasificacion_schema import ClasificacionResponse
from app.services.inference_service import clasificar_imagen

router = APIRouter()

@router.post("/clasificar", response_model=ClasificacionResponse)
async def clasificar(imagen: UploadFile = File(...)):
    if not imagen.content_type or not imagen.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")

    bytes_imagen = await imagen.read()
    if len(bytes_imagen) == 0:
        raise HTTPException(status_code=400, detail="La imagen está vacía")

    return await clasificar_imagen(bytes_imagen)
