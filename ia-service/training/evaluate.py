import json

import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix

from dataset_loader import cargar_dataset


DIRECTORIO_DATASET = "dataset"
RUTA_MODELO = "../model_weights/raee_mobilenetv2_v1.h5"
RUTA_CATEGORIAS = "../model_weights/categorias.json"

TAMANO_IMAGEN = 224
BATCH_SIZE = 32


def main():

    print("=" * 60)
    print("RAEE SMART - EVALUACIÓN DEL MODELO")
    print("=" * 60)

    # ========================================================
    # CARGAR CATEGORÍAS DEL MODELO
    # ========================================================

    with open(
        RUTA_CATEGORIAS,
        "r",
        encoding="utf-8"
    ) as f:
        categorias_modelo = json.load(f)

    print("\nCategorías del modelo:")

    for i, categoria in enumerate(categorias_modelo):
        print(f"{i}: {categoria}")

    # ========================================================
    # CARGAR DATASET
    # ========================================================

    print("\nCargando dataset con la misma división utilizada")
    print("durante el entrenamiento...")

    entrenamiento, validacion, categorias_dataset = cargar_dataset(
        DIRECTORIO_DATASET,
        TAMANO_IMAGEN,
        BATCH_SIZE
    )

    print("\nCategorías del dataset:")

    for i, categoria in enumerate(categorias_dataset):
        print(f"{i}: {categoria}")

    # ========================================================
    # VERIFICAR CATEGORÍAS
    # ========================================================

    if categorias_modelo != categorias_dataset:

        print("\nERROR:")
        print(
            "El orden de las categorías del modelo "
            "no coincide con el dataset."
        )

        print("\nModelo:")
        print(categorias_modelo)

        print("\nDataset:")
        print(categorias_dataset)

        return

    print(
        "\nOrden de categorías verificado correctamente."
    )

    # ========================================================
    # CARGAR MODELO
    # ========================================================

    print("\nCargando modelo...")

    modelo = tf.keras.models.load_model(
        RUTA_MODELO
    )

    # ========================================================
    # EVALUACIÓN
    # ========================================================

    print("\nEvaluando modelo...")

    perdida, precision = modelo.evaluate(
        validacion,
        verbose=1
    )

    print(
        f"\nPrecisión sobre el set de validación: "
        f"{precision * 100:.2f}%"
    )

    print(
        "Meta del proyecto (objetivo 1): 80% mínimo"
    )

    # ========================================================
    # PREDICCIONES
    # ========================================================

    y_true = []
    y_pred = []

    for imagenes, etiquetas in validacion:

        predicciones = modelo.predict(
            imagenes,
            verbose=0
        )

        predicciones = np.argmax(
            predicciones,
            axis=1
        )

        y_true.extend(
            etiquetas.numpy()
        )

        y_pred.extend(
            predicciones
        )

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # ========================================================
    # INFORMACIÓN DE LA VALIDACIÓN
    # ========================================================

    print("\nCantidad de imágenes evaluadas:")
    print(len(y_true))

    print("\nClases reales encontradas:")
    print(np.unique(y_true))

    print("\nClases predichas encontradas:")
    print(np.unique(y_pred))

    # ========================================================
    # CANTIDAD POR CATEGORÍA
    # ========================================================

    print("\nDistribución de imágenes de validación:")

    for indice, categoria in enumerate(categorias_modelo):

        cantidad = np.sum(
            y_true == indice
        )

        print(
            f"{indice}: {categoria} → {cantidad} imágenes"
        )

    # ========================================================
    # MATRIZ DE CONFUSIÓN
    # ========================================================

    etiquetas = list(
        range(len(categorias_modelo))
    )

    matriz = confusion_matrix(
        y_true,
        y_pred,
        labels=etiquetas
    )

    print(
        "\nMatriz de confusión "
        "(filas=real, columnas=predicho):"
    )

    print(matriz)

    # ========================================================
    # REPORTE DE CLASIFICACIÓN
    # ========================================================

    print("\nReporte de clasificación:\n")

    reporte = classification_report(
        y_true,
        y_pred,
        labels=etiquetas,
        target_names=categorias_modelo,
        zero_division=0
    )

    print(reporte)

    # ========================================================
    # RESUMEN
    # ========================================================

    print("=" * 60)
    print("RESUMEN DE EVALUACIÓN")
    print("=" * 60)

    print(
        f"Precisión global: "
        f"{precision * 100:.2f}%"
    )

    print(
        f"Imágenes evaluadas: "
        f"{len(y_true)}"
    )

    print(
        f"Categorías evaluadas: "
        f"{len(categorias_modelo)}"
    )

    if precision >= 0.80:
        print(
            "✓ El modelo supera el objetivo mínimo del 80%."
        )
    else:
        print(
            "✗ El modelo NO alcanza el objetivo mínimo del 80%."
        )

    print("=" * 60)


if __name__ == "__main__":
    main()
