import json
import time

from app.config import settings
from app.utils.image_preprocessing import bytes_a_tensor


class ModeloNoDisponibleError(RuntimeError):
    """Se lanza cuando el modelo entrenado no puede cargarse."""


class ClasificadorRAEE:
    """
    Carga el modelo real (MobileNetV2 + transfer learning) y clasifica
    imágenes de RAEE en una de las 8 categorías. El servicio funciona
    únicamente en modo real: si el modelo no puede cargarse, se lanza un
    error explícito en lugar de devolver resultados simulados.
    """

    def __init__(self):
        self.modelo = None
        self.categorias = []
        self._cargar_modelo()

    def _cargar_modelo(self):
        try:
            import tensorflow as tf

            self.modelo = tf.keras.models.load_model(
                settings.RUTA_MODELO,
                compile=False,
            )

            with open(settings.RUTA_CATEGORIAS, "r", encoding="utf-8") as f:
                self.categorias = json.load(f)
        except Exception as e:
            raise ModeloNoDisponibleError(
                "No se pudo cargar el modelo de IA desde "
                f"'{settings.RUTA_MODELO}'. Verifica que el modelo entrenado y "
                "'categorias.json' existan y que TensorFlow esté instalado. "
                f"Detalle: {e}"
            ) from e

        print(f"[IA] Modelo cargado desde {settings.RUTA_MODELO}")
        print(f"[IA] Categorías (orden del modelo): {self.categorias}")

    def clasificar(self, bytes_imagen: bytes) -> dict:
        inicio = time.time()

        entrada = bytes_a_tensor(bytes_imagen, settings.TAMANO_IMAGEN)

        predicciones = self.modelo.predict(entrada, verbose=0)[0]
        indices_ordenados = predicciones.argsort()[::-1]

        top3 = [
            {"categoria": self.categorias[i], "confianza": round(float(predicciones[i]), 2)}
            for i in indices_ordenados[:3]
        ]

        return {
            "categoria": top3[0]["categoria"],
            "confianza": top3[0]["confianza"],
            "top3": top3,
            "tiempo_inferencia_ms": int((time.time() - inicio) * 1000),
        }


clasificador = ClasificadorRAEE()
