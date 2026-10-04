import json
import random
import time

from app.config import settings
from app.utils.image_preprocessing import bytes_a_tensor

CATEGORIAS_DEFECTO = [
    "CELULAR",
    "EQUIPO_DE_SONIDO",
    "IMPRESORA",
    "LAPTOP",
    "PEQUENO_ELECTRODOMESTICO",
    "REFRIGERADORA",
    "TABLET",
    "TELEVISOR",
]

class ClasificadorRAEE:
    """
    Envuelve el modelo real (MobileNetV2 + transfer learning) cuando existe,
    y cae automáticamente a un modo simulado si no hay modelo entrenado
    todavía o si TensorFlow no está instalado. Así el resto del sistema
    (backend, app móvil) se puede probar de punta a punta sin esperar a que
    el modelo esté listo.
    """

    def __init__(self):
        self.modelo = None
        self.categorias = CATEGORIAS_DEFECTO
        self.modo_simulado = settings.MODO_SIMULADO

        if not self.modo_simulado:
            self._cargar_modelo_real()

    def _cargar_modelo_real(self):
        try:
            import tensorflow as tf

            self.modelo = tf.keras.models.load_model(settings.RUTA_MODELO)

            with open(settings.RUTA_CATEGORIAS, "r", encoding="utf-8") as f:
                self.categorias = json.load(f)

            print(f"[IA] Modelo real cargado desde {settings.RUTA_MODELO}")
            print(f"[IA] Categorías (orden del modelo): {self.categorias}")
        except Exception as e:
            print(f"[IA] No se pudo cargar el modelo real ({e}). Usando modo simulado.")
            self.modo_simulado = True
            self.categorias = CATEGORIAS_DEFECTO

    def clasificar(self, bytes_imagen: bytes) -> dict:
        inicio = time.time()

        if self.modo_simulado:
            resultado = self._clasificar_simulado()
        else:
            resultado = self._clasificar_real(bytes_imagen)

        resultado["tiempo_inferencia_ms"] = int((time.time() - inicio) * 1000)
        resultado["modo_simulado"] = self.modo_simulado
        return resultado

    def _clasificar_simulado(self) -> dict:
        categoria = random.choice(CATEGORIAS_DEFECTO)
        confianza = round(random.uniform(0.75, 0.97), 2)

        otras = [c for c in CATEGORIAS_DEFECTO if c != categoria]
        top3 = [{"categoria": categoria, "confianza": confianza}] + [
            {"categoria": c, "confianza": round(random.uniform(0.02, 0.2), 2)}
            for c in random.sample(otras, 2)
        ]

        return {"categoria": categoria, "confianza": confianza, "top3": top3}

    def _clasificar_real(self, bytes_imagen: bytes) -> dict:
        entrada = bytes_a_tensor(bytes_imagen, settings.TAMANO_IMAGEN)

        predicciones = self.modelo.predict(entrada, verbose=0)[0]
        indices_ordenados = predicciones.argsort()[::-1]

        top3 = [
            {"categoria": self.categorias[i], "confianza": round(float(predicciones[i]), 2)}
            for i in indices_ordenados[:3]
        ]

        return {"categoria": top3[0]["categoria"], "confianza": top3[0]["confianza"], "top3": top3}

clasificador = ClasificadorRAEE()
