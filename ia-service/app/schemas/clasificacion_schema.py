from typing import List
from pydantic import BaseModel


class PrediccionCategoria(BaseModel):
    categoria: str
    confianza: float


class ClasificacionResponse(BaseModel):
    categoria: str
    confianza: float
    tiempo_inferencia_ms: int

    top3: List[PrediccionCategoria] = []
    modo_simulado: bool = False
    