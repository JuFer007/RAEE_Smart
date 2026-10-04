import io

import numpy as np
import tensorflow as tf
from PIL import Image


def bytes_a_tensor(
    bytes_imagen: bytes,
    tamano_imagen: int
) -> np.ndarray:
    """
    Convierte los bytes de una imagen al formato
    esperado por MobileNetV2.

    Resultado:
        Shape: (1, H, W, 3)
        Valores aproximadamente entre -1 y 1.
    """

    imagen = Image.open(
        io.BytesIO(bytes_imagen)
    ).convert("RGB")

    imagen = imagen.resize(
        (tamano_imagen, tamano_imagen)
    )

    arreglo = np.array(
        imagen,
        dtype=np.float32
    )

    # Preprocesamiento oficial de MobileNetV2.
    arreglo = tf.keras.applications.mobilenet_v2.preprocess_input(
        arreglo
    )

    return np.expand_dims(
        arreglo,
        axis=0
    )
