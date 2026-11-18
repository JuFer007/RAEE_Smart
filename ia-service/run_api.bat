@echo off
setlocal
cd /d "%~dp0"

if not exist "venv\Scripts\python.exe" (
  echo Creando entorno virtual...
  python -m venv venv
  if errorlevel 1 goto error

  echo Instalando dependencias ^(puede tardar varios minutos^)...
  "venv\Scripts\python.exe" -m pip install --upgrade pip
  if errorlevel 1 goto error
  "venv\Scripts\python.exe" -m pip install -r requirements.txt
  if errorlevel 1 goto error
)

echo Iniciando API de IA en http://127.0.0.1:8000 ...
echo Endpoints: /salud  /categorias  /clasificar
"venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
if errorlevel 1 goto error

goto :eof

:error
echo.
echo Ocurrio un error. Revisa el mensaje de arriba.
pause
exit /b 1
