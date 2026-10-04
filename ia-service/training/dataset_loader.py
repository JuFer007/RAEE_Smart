import os
import random
import tensorflow as tf


def cargar_dataset(
    directorio_dataset,
    tamano_imagen=224,
    batch_size=32
):
    """
    Carga el dataset realizando una división
    equilibrada por categoría.

    80% entrenamiento
    20% validación

    Devuelve:
        entrenamiento
        validacion
        categorias
    """

    # ========================================================
    # CONFIGURACIÓN
    # ========================================================

    random.seed(123)

    extensiones_validas = (
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp"
    )

    # ========================================================
    # OBTENER CATEGORÍAS
    # ========================================================

    categorias = sorted(
        [
            nombre
            for nombre in os.listdir(directorio_dataset)
            if os.path.isdir(
                os.path.join(
                    directorio_dataset,
                    nombre
                )
            )
        ]
    )

    print("\nCategorías detectadas:")

    for i, categoria in enumerate(categorias):
        print(f"{i}: {categoria}")

    # ========================================================
    # CREAR LISTAS DE ENTRENAMIENTO Y VALIDACIÓN
    # ========================================================

    rutas_entrenamiento = []
    etiquetas_entrenamiento = []

    rutas_validacion = []
    etiquetas_validacion = []

    print("\nDistribución del dataset:")

    for indice, categoria in enumerate(categorias):

        directorio_categoria = os.path.join(
            directorio_dataset,
            categoria
        )

        archivos = [
            archivo
            for archivo in os.listdir(
                directorio_categoria
            )
            if archivo.lower().endswith(
                extensiones_validas
            )
        ]

        # Ordenar para reproducibilidad
        archivos.sort()

        # Mezclar archivos de esta categoría
        random.shuffle(archivos)

        total = len(archivos)

        cantidad_validacion = int(
            total * 0.20
        )

        archivos_validacion = archivos[
            :cantidad_validacion
        ]

        archivos_entrenamiento = archivos[
            cantidad_validacion:
        ]

        print(
            f"{categoria}: "
            f"{total} imágenes → "
            f"{len(archivos_entrenamiento)} entrenamiento / "
            f"{len(archivos_validacion)} validación"
        )

        # --------------------------------------------
        # ENTRENAMIENTO
        # --------------------------------------------

        for archivo in archivos_entrenamiento:

            ruta = os.path.join(
                directorio_categoria,
                archivo
            )

            rutas_entrenamiento.append(ruta)
            etiquetas_entrenamiento.append(indice)

        # --------------------------------------------
        # VALIDACIÓN
        # --------------------------------------------

        for archivo in archivos_validacion:

            ruta = os.path.join(
                directorio_categoria,
                archivo
            )

            rutas_validacion.append(ruta)
            etiquetas_validacion.append(indice)

    # ========================================================
    # MEZCLAR ENTRENAMIENTO
    # ========================================================

    datos_entrenamiento = list(
        zip(
            rutas_entrenamiento,
            etiquetas_entrenamiento
        )
    )

    random.shuffle(datos_entrenamiento)

    rutas_entrenamiento, etiquetas_entrenamiento = zip(
        *datos_entrenamiento
    )

    rutas_entrenamiento = list(
        rutas_entrenamiento
    )

    etiquetas_entrenamiento = list(
        etiquetas_entrenamiento
    )

    # ========================================================
    # MEZCLAR VALIDACIÓN
    # ========================================================

    datos_validacion = list(
        zip(
            rutas_validacion,
            etiquetas_validacion
        )
    )

    random.shuffle(datos_validacion)

    rutas_validacion, etiquetas_validacion = zip(
        *datos_validacion
    )

    rutas_validacion = list(
        rutas_validacion
    )

    etiquetas_validacion = list(
        etiquetas_validacion
    )

    # ========================================================
    # FUNCIÓN PARA CARGAR IMÁGENES
    # ========================================================

    def cargar_imagen(ruta, etiqueta):

        imagen = tf.io.read_file(ruta)

        imagen = tf.image.decode_image(
            imagen,
            channels=3,
            expand_animations=False
        )

        imagen.set_shape(
            [None, None, 3]
        )

        imagen = tf.image.resize(
            imagen,
            [tamano_imagen, tamano_imagen]
        )

        imagen = tf.keras.applications.mobilenet_v2.preprocess_input(
            imagen
        )

        return imagen, etiqueta

    # ========================================================
    # DATASET DE ENTRENAMIENTO
    # ========================================================

    entrenamiento = tf.data.Dataset.from_tensor_slices(
        (
            rutas_entrenamiento,
            etiquetas_entrenamiento
        )
    )

    entrenamiento = entrenamiento.map(
        cargar_imagen,
        num_parallel_calls=tf.data.AUTOTUNE
    )

    entrenamiento = entrenamiento.batch(
        batch_size
    )

    entrenamiento = entrenamiento.prefetch(
        tf.data.AUTOTUNE
    )

    # ========================================================
    # DATASET DE VALIDACIÓN
    # ========================================================

    validacion = tf.data.Dataset.from_tensor_slices(
        (
            rutas_validacion,
            etiquetas_validacion
        )
    )

    validacion = validacion.map(
        cargar_imagen,
        num_parallel_calls=tf.data.AUTOTUNE
    )

    validacion = validacion.batch(
        batch_size
    )

    validacion = validacion.prefetch(
        tf.data.AUTOTUNE
    )

    # ========================================================
    # RESULTADO
    # ========================================================

    print(
        f"\nTotal entrenamiento: "
        f"{len(rutas_entrenamiento)}"
    )

    print(
        f"Total validación: "
        f"{len(rutas_validacion)}"
    )

    return (
        entrenamiento,
        validacion,
        categorias
    )
