from pathlib import Path
from PIL import Image

DATASET = Path("dataset")

EXTENSIONES = {
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
}

archivos = []
danados = []
validos = 0

for archivo in DATASET.rglob("*"):
    if archivo.is_file() and archivo.suffix.lower() in EXTENSIONES:
        archivos.append(archivo)

print(f"\nImágenes encontradas: {len(archivos)}")
print("Revisando...\n")

for archivo in archivos:
    try:
        with Image.open(archivo) as img:
            img.verify()

        validos += 1

    except Exception as e:
        danados.append((archivo, str(e)))
        print(f"[DAÑADO] {archivo}")
        print(f"         {e}")

print("\n" + "=" * 60)
print("RESULTADO")
print("=" * 60)

print(f"Total de imágenes: {len(archivos)}")
print(f"Imágenes válidas:  {validos}")
print(f"Imágenes dañadas:  {len(danados)}")

if danados:
    print("\nArchivos que debes revisar/eliminar:")
    for archivo, error in danados:
        print(f" - {archivo}")
else:
    print("\nNo se encontraron imágenes dañadas.")
