from pathlib import Path
from PIL import Image

DATASET = Path("dataset")

EXTENSIONES = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp",
    ".gif",
}

convertidas = 0
eliminadas = 0
errores = 0

for archivo in DATASET.rglob("*"):
    if not archivo.is_file():
        continue

    if archivo.suffix.lower() not in EXTENSIONES:
        continue

    try:
        with Image.open(archivo) as img:
            img.load()

            # Convertimos todo a RGB para que el dataset sea uniforme
            imagen = img.convert("RGB")

            nuevo_archivo = archivo.with_suffix(".png")

            # Si ya es PNG, no necesitamos crear otro
            if archivo.suffix.lower() == ".png":
                continue

            imagen.save(nuevo_archivo, "PNG")

        # Eliminamos el archivo original después de convertirlo correctamente
        archivo.unlink()

        convertidas += 1
        print(f"[CONVERTIDA] {archivo} -> {nuevo_archivo}")

    except Exception as e:
        errores += 1
        print(f"[ERROR] {archivo}")
        print(f"        {e}")

print("\n" + "=" * 60)
print("RESULTADO")
print("=" * 60)
print(f"Imágenes convertidas: {convertidas}")
print(f"Errores:              {errores}")

if errores == 0:
    print("\nDataset convertido correctamente.")
else:
    print("\nHay archivos que requieren revisión.")
