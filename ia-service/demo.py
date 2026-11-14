import uvicorn

from app.config import settings

URL = f"http://{settings.DEMO_HOST}:{settings.DEMO_PORT}"


if __name__ == "__main__":
    print(f"[RAEE Smart] Vista de reconocimiento IA disponible en {URL}")
    uvicorn.run(
        "app.demo_ui:app",
        host=settings.DEMO_HOST,
        port=settings.DEMO_PORT,
        reload=False,
    )
