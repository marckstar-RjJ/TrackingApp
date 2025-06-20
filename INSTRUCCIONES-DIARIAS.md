# 🚀 Instrucciones Diarias - Boa Tracking App

## 📅 **Para continuar mañana (o cualquier día):**

### **Opción 1: Usar el archivo automático (RECOMENDADO)**
1. Ve a la carpeta: `C:\Proyecto Boa\Boa-tracking-mobile\BoaTrackingApp-New`
2. **Doble clic** en `start-dev.bat`
3. ¡Listo! Se iniciará automáticamente

### **Opción 2: Manual (si prefieres control total)**

#### **Paso 1: Abrir terminal**
```bash
cd "C:\Proyecto Boa\Boa-tracking-mobile\BoaTrackingApp-New"
```

#### **Paso 2: Iniciar servidor (elige una opción)**

**🟢 Opción A: Tunnel (MÁS CONFIABLE)**
```bash
npm run tunnel
```

**🟡 Opción B: WiFi normal**
```bash
npm start
```

**🔵 Opción C: USB (si conectas el celular)**
```bash
npm run usb
```

#### **Paso 3: Conectar tu S22 Ultra**
- Abre **Expo Go** en tu celular
- Escanea el **código QR** que aparece en la terminal
- ¡Listo! Los cambios se verán en tiempo real

## 🔧 **Comandos útiles:**

| Comando | Descripción |
|---------|-------------|
| `npm run tunnel` | Inicia con tunnel (más confiable) |
| `npm run usb` | Inicia para conexión USB |
| `npm run clear` | Limpia cache y reinicia |
| `npm run reset` | Resetea todo (último recurso) |

## 📱 **En tu S22 Ultra:**

### **Si no conecta:**
1. **Cierra completamente Expo Go**
2. **Vuelve a abrir Expo Go**
3. **Escanea el código QR**

### **Si sigue cargando:**
1. Ve a **Configuración > Aplicaciones > Expo Go**
2. Toca **"Almacenamiento"**
3. Toca **"Borrar datos"**
4. Vuelve a abrir Expo Go

## 🎯 **Flujo de trabajo diario:**

1. **Iniciar:** `start-dev.bat` o `npm run tunnel`
2. **Desarrollar:** Edita archivos en tu editor
3. **Ver cambios:** Se reflejan automáticamente en tu celular
4. **Terminar:** `Ctrl+C` en la terminal

## 🚨 **Problemas comunes:**

### **"No apps connected"**
- Asegúrate de que Expo Go esté abierto
- Escanea el código QR de nuevo

### **Rueda de carga infinita**
- Usa `npm run clear`
- O borra datos de Expo Go

### **Error de red**
- Usa `npm run tunnel` (más confiable)
- O conecta vía USB

## 💡 **Tips:**

- ✅ **Siempre usa tunnel** (`npm run tunnel`) - es más confiable
- ✅ **Mantén Expo Go actualizado**
- ✅ **Asegúrate de estar en la misma red WiFi**
- ✅ **Si algo no funciona, reinicia todo**

¡Con estos pasos tendrás tu app funcionando en menos de 2 minutos cada día! 