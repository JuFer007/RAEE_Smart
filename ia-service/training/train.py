import json

import tensorflow as tf

from dataset_loader import cargar_dataset


DIRECTORIO_DATASET = "dataset"

TAMANO_IMAGEN = 224

EPOCAS_INICIALES = 10
EPOCAS_FINE_TUNING = 15

RUTA_MODELO_SALIDA = "../model_weights/raee_mobilenetv2_v1.h5"

RUTA_MEJOR_MODELO = "../model_weights/best_raee_mobilenetv2_v1.h5"

RUTA_CATEGORIAS_SALIDA = "../model_weights/categorias.json"


def construir_modelo(num_categorias):

    base = tf.keras.applications.MobileNetV2(
        input_shape=(
            TAMANO_IMAGEN,
            TAMANO_IMAGEN,
            3
        ),
        include_top=False,
        weights="imagenet"
    )

    # Primera etapa:
    # MobileNetV2 congelado.
    base.trainable = False

    modelo = tf.keras.Sequential([
        base,

        tf.keras.layers.GlobalAveragePooling2D(),

        tf.keras.layers.Dropout(0.3),

        tf.keras.layers.Dense(
            num_categorias,
            activation="softmax"
        )
    ])

    modelo.compile(
        optimizer=tf.keras.optimizers.Adam(
            learning_rate=0.0001
        ),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    return modelo, base


def main():

    print("=" * 60)
    print("RAEE SMART - ENTRENAMIENTO DEL MODELO")
    print("=" * 60)

    # ========================================================
    # CARGAR DATASET
    # ========================================================

    entrenamiento, validacion, categorias = cargar_dataset(
        DIRECTORIO_DATASET,
        TAMANO_IMAGEN
    )

    print("\nCategorías detectadas:")

    for i, categoria in enumerate(categorias):
        print(f"{i}: {categoria}")

    print(
        f"\nTotal de categorías: {len(categorias)}"
    )

    # ========================================================
    # CONSTRUIR MODELO
    # ========================================================

    modelo, base = construir_modelo(
        len(categorias)
    )

    print("\nModelo construido correctamente.")

    # ========================================================
    # CALLBACKS
    # ========================================================

    callbacks = [

        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=4,
            mode="max",
            restore_best_weights=True,
            verbose=1
        ),

        tf.keras.callbacks.ModelCheckpoint(
            RUTA_MEJOR_MODELO,
            monitor="val_accuracy",
            mode="max",
            save_best_only=True,
            verbose=1
        )
    ]

    # ========================================================
    # ETAPA 1
    # MOBILE NETV2 CONGELADO
    # ========================================================

    print("\n" + "=" * 60)
    print("ETAPA 1: ENTRENAMIENTO INICIAL")
    print("=" * 60)

    modelo.fit(
        entrenamiento,
        validation_data=validacion,
        epochs=EPOCAS_INICIALES,
        callbacks=callbacks
    )

    # ========================================================
    # ETAPA 2
    # FINE-TUNING
    # ========================================================

    print("\n" + "=" * 60)
    print("ETAPA 2: FINE-TUNING DE MOBILENETV2")
    print("=" * 60)

    # Descongelar MobileNetV2.
    base.trainable = True

    # Congelar las primeras capas.
    fine_tune_at = 100

    for capa in base.layers[:fine_tune_at]:
        capa.trainable = False

    print(
        f"\nPrimeras {fine_tune_at} capas congeladas."
    )

    print(
        f"Total de capas MobileNetV2: {len(base.layers)}"
    )

    # ========================================================
    # RECOMPILAR CON LEARNING RATE PEQUEÑO
    # ========================================================

    modelo.compile(
        optimizer=tf.keras.optimizers.Adam(
            learning_rate=0.00001
        ),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    # ========================================================
    # ENTRENAMIENTO FINE-TUNING
    # ========================================================

    modelo.fit(
        entrenamiento,
        validation_data=validacion,
        epochs=EPOCAS_FINE_TUNING,
        callbacks=callbacks
    )

    # ========================================================
    # CARGAR MEJOR MODELO
    # ========================================================

    print(
        "\nCargando el mejor modelo encontrado..."
    )

    mejor_modelo = tf.keras.models.load_model(
        RUTA_MEJOR_MODELO
    )

    # ========================================================
    # GUARDAR MODELO FINAL
    # ========================================================

    mejor_modelo.save(
        RUTA_MODELO_SALIDA
    )

    # ========================================================
    # GUARDAR CATEGORÍAS
    # ========================================================

    with open(
        RUTA_CATEGORIAS_SALIDA,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            categorias,
            f,
            ensure_ascii=False,
            indent=2
        )

    # ========================================================
    # FINAL
    # ========================================================

    print("\n" + "=" * 60)
    print("ENTRENAMIENTO FINALIZADO")
    print("=" * 60)

    print(
        "\nModelo final:"
    )
    print(
        RUTA_MODELO_SALIDA
    )

    print(
        "\nMejor modelo:"
    )
    print(
        RUTA_MEJOR_MODELO
    )

    print(
        "\nCategorías:"
    )
    print(
        RUTA_CATEGORIAS_SALIDA
    )

    print(
        "\nCategorías utilizadas:"
    )

    for categoria in categorias:
        print(
            f"  - {categoria}"
        )


if __name__ == "__main__":
    main()
    