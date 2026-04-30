@echo off
title Lanzador Hamming Lab
color 0A
echo ==========================================
echo    INICIANDO LABORATORIO DE HAMMING
echo ==========================================
echo.

:: 1. Intentar liberar el puerto 8081 por si acaso
echo [1/3] Limpiando instancias previas en puerto 8081...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

:: 2. Lanzar la aplicación
echo [2/3] Iniciando servidor Java (esto puede tardar unos segundos)...
echo.
echo TIP: No cierres esta ventana mientras uses la app.
echo.

:: Ejecutar el JAR
java -jar Hamming-App.jar

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] No se pudo iniciar la aplicacion. 
    echo Asegurate de tener Java instalado (prueba escribir 'java -version' en una consola).
    pause
)

echo.
echo [3/3] Aplicacion cerrada.
pause
