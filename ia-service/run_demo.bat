@echo off
setlocal
cd /d "%~dp0"

if not exist "venv\Scripts\python.exe" (
  echo Creando entorno virtual...
  python -m venv venv
  if errorlevel 1 goto error

  echo Instalando dependencias ^(puede tardar varios minutos^)...
  "venv\Scripts\python.exe" -m pip install --upgrade pip
  "venv\Scripts\python.exe" -m pip install -r requirements.txt
  if errorlevel 1 goto error
)

echo Iniciando vista de reconocimiento IA...
"venv\Scripts\python.exe" demo.py
if errorlevel 1 goto error

goto :eof

:error
echo.
echo Ocurrio un error. Revisa el mensaje de arriba.
pause
exit /b 1
