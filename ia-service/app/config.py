import os

class Settings:
    MODO_SIMULADO: bool = os.getenv(
        "RAEE_IA_MODO_SIMULADO",
        "false"
    ).lower() == "true"

    RUTA_MODELO: str = os.getenv(
        "RAEE_IA_RUTA_MODELO",
        "model_weights/raee_mobilenetv2_v1.h5"
    )

    RUTA_CATEGORIAS: str = os.getenv(
        "RAEE_IA_RUTA_CATEGORIAS",
        "model_weights/categorias.json"
    )

    TAMANO_IMAGEN: int = 224

settings = Settings()
