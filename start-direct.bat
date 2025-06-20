@echo off
echo ========================================
echo    Boa Tracking App - Conexion Directa
echo ========================================
echo.

cd /d "%~dp0"
echo Directorio actual: %CD%
echo.

echo Iniciando servidor...
echo.
echo Una vez que aparezca el codigo QR:
echo 1. Abre Expo Go en tu S22 Ultra
echo 2. Toca "Enter URL manually"
echo 3. Copia y pega la URL que aparece
echo 4. ¡Listo! Se conectara automaticamente
echo.

call npm run tunnel

pause 