@echo off
setlocal
title RAEE Smart - Ejecutar todo

echo ============================================================
echo  RAEE Smart - Iniciando servicios
echo ============================================================
echo.

call :esta_escuchando 5432
if errorlevel 1 (
  echo [OK] PostgreSQL ya esta activo en 5432
) else (
  echo [AVISO] PostgreSQL no responde en 5432. Inicia la base de datos antes de usar el backend.
)

echo.
call :esta_escuchando 8000
if errorlevel 1 (
  echo [OK] IA ya esta activa en 8000
) else (
  echo [INICIANDO] IA real en 8000 ...
  start "RAEE Smart - IA (8000)" /D "%~dp0ia-service" cmd /k "run_api.bat"
  timeout /t 3 /nobreak >nul
)

call :esta_escuchando 8080
if errorlevel 1 (
  echo [OK] Backend ya esta activo en 8080
) else (
  echo [INICIANDO] Backend Spring Boot en 8080 ...
  start "RAEE Smart - Backend (8080)" /D "%~dp0backend" cmd /k "mvnw.cmd spring-boot:run"
  timeout /t 5 /nobreak >nul
)

call :esta_escuchando 5173
if errorlevel 1 (
  echo [OK] Panel web ya esta activo en 5173
) else (
  echo [INICIANDO] Panel web en 5173 ...
  start "RAEE Smart - Panel Web (5173)" /D "%~dp0web-panel" cmd /k "npm run dev"
)

call :esta_escuchando 8081
if errorlevel 1 (
  echo [OK] Expo ya esta activo en 8081
) else (
  echo [INICIANDO] Expo en modo LAN ...
  echo   URL: http://^<IP-de-la-PC^>:8081
  echo   El telefono debe estar en la misma Wi-Fi.
  start "RAEE Smart - App Movil Expo" /D "%~dp0app-movil" cmd /k "npx expo start --lan"
)

echo.
echo ============================================================
echo  Servicios listos
echo   Backend : http://localhost:8080/api
echo   Panel   : http://localhost:5173
echo   IA      : http://127.0.0.1:8000
echo   Expo    : terminal abierta en 8081, escanea con Expo Go
echo   Usuario : vecino@raee.com / 123456
echo ============================================================
echo.
pause
exit /b 0

:esta_escuchando
powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort %~1 -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
exit /b %errorlevel%
