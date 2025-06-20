@echo off
echo ========================================
echo    Boa Tracking App - USB Directo
echo ========================================
echo.

cd /d "%~dp0"
echo Directorio actual: %CD%
echo.

echo Conectando via USB...
echo.
echo IMPORTANTE:
echo 1. Conecta tu S22 Ultra via USB
echo 2. Activa "Depuracion USB" en tu celular
echo 3. Presiona cualquier tecla cuando estes listo
echo.
pause

echo.
echo Iniciando servidor USB...
call npm run usb

pause 