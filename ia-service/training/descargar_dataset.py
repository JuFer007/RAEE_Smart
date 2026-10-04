from ddgs import DDGS
import requests
from PIL import Image
from io import BytesIO
import os
import hashlib
import time

IMAGENES_POR_BUSQUEDA = 100
CARPETA_DATASET = "dataset"

CATEGORIAS = {
    "LAPTOP": [
        "laptop computer",
        "old laptop",
        "used laptop",
        "broken laptop",
        "damaged laptop",
        "laptop electronic waste",
        "laptop e waste",
        "discarded laptop"
    ],

    "CELULAR": [
        "smartphone",
        "cell phone",
        "old smartphone",
        "old mobile phone",
        "used smartphone",
        "broken smartphone",
        "damaged smartphone",
        "discarded smartphone"
    ],

    "REFRIGERADORA": [
        "refrigerator",
        "old refrigerator",
        "used refrigerator",
        "broken refrigerator",
        "damaged refrigerator",
        "refrigerator appliance",
        "old fridge",
        "refrigerator electronic waste"
    ],

    "IMPRESORA": [
        "printer",
        "old printer",
        "used printer",
        "broken printer",
        "damaged printer",
        "printer electronic waste",
        "office printer",
        "discarded printer"
    ],

    "TELEVISOR": [
        "television",
        "old television",
        "old TV",
        "used TV",
        "broken TV",
        "damaged television",
        "television electronic waste",
        "discarded television"
    ],

    "PEQUENO_ELECTRODOMESTICO": [
        "small household appliance",
        "small electronic appliance",
        "old small appliance",
        "used small appliance",
        "broken small appliance",
        "damaged small appliance",
        "small electronic waste",
        "discarded small appliance"
    ],


    "EQUIPO_DE_SONIDO": [
        "sound system",
        "stereo system",
        "home audio system",
        "music system",
        "audio system",
        "old sound system",
        "used sound system",
        "broken sound system",
        "damaged sound system",
        "discarded sound system",
        "sound system electronic waste",
        "old stereo system"
    ],

    "TABLET": [
        "tablet",
        "tablet computer",
        "old tablet",
        "used tablet",
        "broken tablet",
        "damaged tablet",
        "discarded tablet",
        "tablet electronic waste",
        "tablet e waste",
        "old tablet computer",
        "used tablet computer"
    ]
}

def contar_imagenes(carpeta):
    extensiones = (
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    )

    if not os.path.exists(carpeta):
        return 0

    return sum(
        1
        for archivo in os.listdir(carpeta)
        if archivo.lower().endswith(extensiones)
    )


def descargar_imagen(url, carpeta):
    try:
        respuesta = requests.get(
            url,
            timeout=15,
            headers={
                "User-Agent": "Mozilla/5.0"
            }
        )

        if respuesta.status_code != 200:
            return False

        imagen = Image.open(
            BytesIO(respuesta.content)
        )

        imagen.verify()

        imagen = Image.open(
            BytesIO(respuesta.content)
        )

        if imagen.width < 100 or imagen.height < 100:
            return False

        imagen = imagen.convert("RGB")

        nombre_hash = hashlib.md5(
            respuesta.content
        ).hexdigest()

        ruta = os.path.join(
            carpeta,
            f"{nombre_hash}.jpg"
        )

        if os.path.exists(ruta):
            return False

        imagen.save(
            ruta,
            "JPEG",
            quality=90
        )

        return True

    except Exception:
        return False


def descargar_categoria(categoria, busquedas):

    carpeta = os.path.join(
        CARPETA_DATASET,
        categoria
    )

    os.makedirs(
        carpeta,
        exist_ok=True
    )

    print("\n" + "=" * 70)
    print(f"CATEGORIA: {categoria}")
    print("=" * 70)

    for numero, busqueda in enumerate(
        busquedas,
        start=1
    ):

        print(
            f"\n[{numero}/{len(busquedas)}] "
            f"Buscando: {busqueda}"
        )

        antes = contar_imagenes(carpeta)

        try:

            resultados = list(
                DDGS().images(
                    busqueda,
                    region="wt-wt",
                    safesearch="moderate",
                    type_image="photo",
                    max_results=IMAGENES_POR_BUSQUEDA
                )
            )

            print(
                f"Resultados encontrados: {len(resultados)}"
            )

            descargadas = 0

            for resultado in resultados:

                url = resultado.get("image")

                if not url:
                    continue

                if descargar_imagen(
                    url,
                    carpeta
                ):
                    descargadas += 1

                print(
                    f"\rDescargadas: {descargadas}",
                    end=""
                )

            despues = contar_imagenes(carpeta)

            print(
                f"\nImagenes nuevas: "
                f"{despues - antes}"
            )

            print(
                f"Total categoria: {despues}"
            )

        except Exception as e:

            print(
                f"\nError: {e}"
            )

        time.sleep(2)

    total = contar_imagenes(carpeta)

    print("\n" + "-" * 70)
    print(
        f"CATEGORIA TERMINADA: {categoria}"
    )
    print(
        f"TOTAL: {total} imagenes"
    )
    print("-" * 70)


def mostrar_resumen():

    print("\n")
    print("=" * 70)
    print("RESUMEN DEL DATASET")
    print("=" * 70)

    total_general = 0

    for categoria in CATEGORIAS:

        carpeta = os.path.join(
            CARPETA_DATASET,
            categoria
        )

        cantidad = contar_imagenes(carpeta)

        total_general += cantidad

        print(
            f"{categoria:<30}"
            f"{cantidad:>6} imagenes"
        )

    print("-" * 70)

    print(
        f"{'TOTAL':<30}"
        f"{total_general:>6} imagenes"
    )

    print("=" * 70)


def main():

    print("=" * 70)
    print("RAEE SMART - GENERADOR DE DATASET")
    print("=" * 70)

    os.makedirs(
        CARPETA_DATASET,
        exist_ok=True
    )

    for categoria, busquedas in CATEGORIAS.items():

        descargar_categoria(
            categoria,
            busquedas
        )

    mostrar_resumen()

    print("\n")
    print("=" * 70)
    print("PROCESO COMPLETADO")
    print("=" * 70)


if __name__ == "__main__":
    main()
    