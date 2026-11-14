import os
from pathlib import Path

from dotenv import load_dotenv

RAIZ_PROYECTO = Path(__file__).resolve().parents[2]
DIRECTORIO_SERVICIO = Path(__file__).resolve().parents[1]

load_dotenv(dotenv_path=RAIZ_PROYECTO / ".env", override=False)


def _ruta(valor: str) -> str:
    ruta = Path(valor)
    return str(ruta if ruta.is_absolute() else DIRECTORIO_SERVICIO / ruta)


def _entero(nombre: str, defecto: int) -> int:
    try:
        return int(os.getenv(nombre, str(defecto)))
    except (TypeError, ValueError):
        return defecto


class Settings:
    HOST: str = os.getenv("IA_HOST", "0.0.0.0")
    PORT: int = _entero("IA_PORT", 8000)
    DEMO_HOST: str = os.getenv("IA_DEMO_HOST", "127.0.0.1")
    DEMO_PORT: int = _entero("IA_DEMO_PORT", 8010)

    RUTA_MODELO: str = _ruta(
        os.getenv("IA_RUTA_MODELO")
        or os.getenv("RAEE_IA_RUTA_MODELO")
        or "model_weights/raee_mobilenetv2_v1.h5"
    )

    RUTA_CATEGORIAS: str = _ruta(
        os.getenv("IA_RUTA_CATEGORIAS")
        or os.getenv("RAEE_IA_RUTA_CATEGORIAS")
        or "model_weights/categorias.json"
    )

    TAMANO_IMAGEN: int = _entero("IA_TAMANO_IMAGEN", 224)


settings = Settings()
