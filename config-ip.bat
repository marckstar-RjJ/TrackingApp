@echo off
echo ========================================
echo    Configuracion IP Fija
echo ========================================
echo.

echo Configurando IP fija para conexion directa...
echo.

echo PASO 1: En tu S22 Ultra
echo 1. Ve a Configuracion ^> Conexiones ^> WiFi
echo 2. Toca en tu red WiFi
echo 3. Toca "Avanzado"
echo 4. Cambia "IP" a "Estatica"
echo 5. Configura IP: 192.168.1.100
echo 6. Guarda la configuracion
echo.

echo PASO 2: En tu PC
echo 1. Ve a Configuracion ^> Red e Internet ^> WiFi
echo 2. Toca en tu red WiFi
echo 3. Toca "Propiedades"
echo 4. Cambia "Configuracion de IP" a "Manual"
echo 5. Configura IP: 192.168.1.50
echo 6. Guarda la configuracion
echo.

echo PASO 3: Iniciar servidor
echo Una vez configurado, usa: npm run usb
echo.

pause

echo.
echo Iniciando servidor con IP fija...
call npm run usb

pause 