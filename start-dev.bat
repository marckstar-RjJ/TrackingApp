@echo off
echo ========================================
echo    Iniciando Boa Tracking App
echo ========================================
echo.

cd /d "%~dp0"
echo Directorio actual: %CD%
echo.

echo Instalando dependencias...
call npm install
echo.

echo Iniciando servidor de desarrollo...
echo.
echo Opciones disponibles:
echo 1. WiFi (normal): npm start
echo 2. Tunnel (recomendado): npm run tunnel
echo 3. USB: npm run usb
echo.

echo Iniciando con tunnel (mas confiable)...
call npm run tunnel

pause 