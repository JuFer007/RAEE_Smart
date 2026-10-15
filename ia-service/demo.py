import uvicorn

URL = "http://127.0.0.1:8010"


if __name__ == "__main__":
    print(f"[RAEE Smart] Vista de reconocimiento IA disponible en {URL}")
    uvicorn.run("app.demo_ui:app", host="127.0.0.1", port=8010, reload=False)
