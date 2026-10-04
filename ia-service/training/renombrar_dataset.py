import os
from PIL import Image

CARPETA_DATASET = "dataset"

EXTENSIONES = (
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp"
)

def procesar_carpeta(carpeta):
    archivos = [
        archivo
        for archivo in os.listdir(carpeta)
        if archivo.lower().endswith(EXTENSIONES)
    ]

    archivos.sort()

    print("\n" + "=" * 60)
    print(f"CARPETA: {os.path.basename(carpeta)}")
    print("=" * 60)

    # Convertir WEBP a PNG
    archivos_convertidos = []

    for archivo in archivos:
        if archivo.lower().endswith(".webp"):

            ruta_original = os.path.join(
                carpeta,
                archivo
            )

            nombre_sin_extension = os.path.splitext(
                archivo
            )[0]

            ruta_png = os.path.join(
                carpeta,
                nombre_sin_extension + ".png"
            )

            try:
                imagen = Image.open(ruta_original)
                imagen.convert("RGB").save(
                    ruta_png,
                    "PNG"
                )

                os.remove(ruta_original)

                archivos_convertidos.append(
                    nombre_sin_extension + ".png"
                )

                print(
                    f"WEBP -> PNG: {archivo}"
                )

            except Exception as e:
                print(
                    f"Error convirtiendo {archivo}: {e}"
                )

    # Volver a obtener las imágenes
    archivos = [
        archivo
        for archivo in os.listdir(carpeta)
        if archivo.lower().endswith(EXTENSIONES)
    ]

    archivos.sort()

    # Renombrar temporalmente
    temporales = []

    for numero, archivo in enumerate(archivos, start=1):

        extension = os.path.splitext(
            archivo
        )[1].lower()

        temporal = f"temp_{numero:05d}{extension}"

        ruta_original = os.path.join(
            carpeta,
            archivo
        )

        ruta_temporal = os.path.join(
            carpeta,
            temporal
        )

        os.rename(
            ruta_original,
            ruta_temporal
        )

        temporales.append(
            (temporal, extension)
        )

    # Renombrar definitivamente
    for numero, (temporal, extension) in enumerate(
        temporales,
        start=1
    ):

        nuevo_nombre = f"{numero:03d}{extension}"

        ruta_temporal = os.path.join(
            carpeta,
            temporal
        )

        ruta_final = os.path.join(
            carpeta,
            nuevo_nombre
        )

        os.rename(
            ruta_temporal,
            ruta_final
        )

    print(
        f"\nTotal de imágenes: {len(temporales)}"
    )


def main():

    if not os.path.exists(CARPETA_DATASET):
        print(
            f"No existe la carpeta: {CARPETA_DATASET}"
        )
        return

    carpetas = [
        os.path.join(
            CARPETA_DATASET,
            carpeta
        )
        for carpeta in os.listdir(CARPETA_DATASET)
        if os.path.isdir(
            os.path.join(
                CARPETA_DATASET,
                carpeta
            )
        )
    ]

    carpetas.sort()

    for carpeta in carpetas:
        procesar_carpeta(carpeta)

    print("\n" + "=" * 60)
    print("PROCESO COMPLETADO")
    print("=" * 60)


if __name__ == "__main__":
    main()
    