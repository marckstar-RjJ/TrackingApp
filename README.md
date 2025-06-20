# BOA Tracking Mobile App

Una aplicación móvil moderna para el seguimiento de envíos en tiempo real, desarrollada con React Native y Expo.

## 🚀 Características Principales

### 🔐 Sistema de Autenticación
- **Usuario Administrador**: `huancarodrigo1@gmail.com` / `Admi123@`
- **Usuario Público**: `marckstar1@gmail.com` / `User123@`

### 📱 Pantallas Principales

#### 🏠 Pantalla de Inicio (HomeScreen)
**Vista Pública (sin login):**
- Dashboard con información general
- Cards informativas y animadas
- Acciones rápidas para usuarios no registrados
- **Footer normal** con información de contacto y enlaces

**Vista de Usuario Público:**
- Dashboard personalizado con estadísticas
- Funciones de usuario: seguimiento, notificaciones, historial
- Acciones: escanear QR, ver historial, alertas, soporte
- **Navegación con tabs** en la parte inferior

**Vista de Administrador:**
- Panel de administración completo
- Funciones administrativas: recepción, gestión, reportes
- Acciones: recepción de paquetes, gestión, reportes, configuración
- **Navegación con tabs** en la parte inferior

#### 📦 Pantalla de Seguimiento (TrackingScreen)
**Para Usuario Público:**
- Lista completa de paquetes con filtros
- Búsqueda por número de tracking
- Estados visuales con colores e iconos
- Barras de progreso para cada envío
- Acciones: Ver detalles, consultar estado

**Para Administrador:**
- Gestión completa de paquetes
- Formulario de recepción de paquetes
- Registro de ubicación y estado
- Actualización de estados de envíos
- Información de quién recibió cada paquete

#### 🔍 Pantalla de Detalle de Tracking (TrackingDetailScreen)
**Características Generales:**
- Vista detallada de cada paquete
- Timeline visual de eventos con iconos y colores
- Barra de progreso del envío
- Información completa del paquete
- **Botón de Historial Completo** para ver todos los eventos

**Para Administrador:**
- **Botón "Registrar Evento"** para agregar nuevos eventos
- **Modal de Escáner de Paquetes** con:
  - Escaneo QR simulado
  - Entrada manual de número de tracking
  - Ubicación GPS automática
  - Selección de tipo de evento
  - Registro de operador y notas
- **Funcionalidad de Edición** en el historial completo

#### 📋 Pantalla de Historial de Paquetes (PackageHistoryScreen)
**Características:**
- **Pantalla dedicada** con diseño moderno y consistente
- **Cronología completa** de todos los eventos del paquete
- **Timeline visual** con iconos y colores por tipo de evento
- **Cards modernas** con sombras y efectos visuales
- **Información detallada** de cada evento:
  - Ubicación y descripción
  - Operador responsable
  - Fecha y hora exacta
  - Información de vuelo (si aplica)
  - Coordenadas GPS
  - Notas adicionales

**Para Administrador:**
- **Botones de Edición** en cada evento
- **Modal de Edición** con campos editables:
  - Ubicación (obligatorio)
  - Operador
  - Notas adicionales
- **Botones de Eliminación** con confirmación
- **Validación de datos** antes de guardar cambios

**Diseño Moderno:**
- **Fondo con imagen** consistente con el resto de la app
- **Cards con sombras** y bordes redondeados
- **Timeline visual** con puntos conectados
- **Colores diferenciados** por tipo de evento
- **Iconografía consistente** con Material Design
- **Navegación fluida** con botón de regreso

#### 🔔 Pantalla de Alertas (AlertsScreen)
**Para Usuario Público:**
- Notificaciones en tiempo real
- Configuración de alertas personalizables
- Historial de alertas con estados (leída/no leída)
- Filtros por tipo de alerta
- Acciones directas desde las alertas

**Para Administrador:**
- Gestión completa de alertas
- Creación de alertas personalizadas
- Eliminación de alertas
- Configuración avanzada del sistema
- Panel de administración de notificaciones

### 🎯 Navegación Diferenciada

#### **Sin Usuario Logueado:**
- Solo se muestra la **Pantalla de Inicio**
- **Footer normal** con información de contacto, enlaces y copyright
- Sin navegación por tabs

#### **Con Usuario Logueado:**
- **Navegación completa** con tabs en la parte inferior
- Acceso a todas las pantallas: Inicio, Seguimiento, Alertas
- Footer integrado en cada pantalla según el contexto

### 🔧 Sistema de Tracking Avanzado

#### **Tipos de Eventos Soportados:**
- **Recibido** - Paquete recibido en centro de distribución
- **Clasificado** - Paquete clasificado y preparado
- **Despachado** - Enviado hacia destino
- **En Vuelo** - En tránsito aéreo
- **Aduanas** - Procesamiento en aduanas
- **En Entrega** - En ruta de entrega final
- **Entregado** - Entrega completada
- **Llegada** - Llegada a punto de control
- **Salida** - Salida de punto de control
- **Procesando** - En procesamiento
- **Pendiente** - Pendiente de procesamiento

#### **Información de Eventos:**
- **Ubicación GPS** automática con expo-location
- **Información de vuelos** (número y aerolínea)
- **Próximo destino** para eventos de tránsito
- **Operador responsable** de cada evento
- **Notas adicionales** para información extra
- **Timestamps** precisos de cada evento

## 🛠️ Tecnologías Utilizadas

- **React Native** - Framework principal
- **Expo** - Plataforma de desarrollo
- **React Navigation** - Navegación entre pantallas
- **TypeScript** - Tipado estático
- **Material Icons** - Iconografía

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI
- Android Studio (para desarrollo Android)
- Xcode (para desarrollo iOS, solo macOS)

## 🚀 Instalación y Configuración

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd BoaTrackingApp-New
```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar IP local:**
   ```bash
# Windows
config-ip.bat

# O manualmente en app.config.js
```

4. **Iniciar el servidor de desarrollo:**
   ```bash
# Desarrollo normal
   npm start

# O usar los scripts predefinidos
start-dev.bat      # Desarrollo
start-direct.bat   # Conexión directa
start-usb.bat      # Conexión USB
```

## 👥 Usuarios de Prueba

### 🔧 Administrador
- **Email:** `huancarodrigo1@gmail.com`
- **Password:** `Admi123@`
- **Funciones:** Gestión completa, recepción de paquetes, creación de alertas

### 👤 Usuario Público
- **Email:** `marckstar1@gmail.com`
- **Password:** `User123@`
- **Funciones:** Seguimiento de paquetes, configuración de alertas

## 📱 Funcionalidades por Tipo de Usuario

### �� Administrador
- **Dashboard:** Panel de administración con estadísticas completas
- **Gestión de Paquetes:** Recepción, registro y actualización de estados
- **Alertas:** Creación, gestión y eliminación de notificaciones
- **Reportes:** Generación de reportes del sistema
- **Configuración:** Configuración avanzada del sistema
- **Navegación:** Tabs completos para acceso a todas las funciones

### 👤 Usuario Público
- **Dashboard:** Panel personalizado con estadísticas de envíos
- **Seguimiento:** Consulta de estado de paquetes
- **Alertas:** Recepción y configuración de notificaciones
- **Historial:** Acceso al historial de envíos
- **Soporte:** Acceso al sistema de soporte
- **Navegación:** Tabs completos para acceso a todas las funciones

### 👥 Usuario No Registrado
- **Dashboard:** Información general de la empresa
- **Acciones Rápidas:** Tracking rápido y soporte
- **Footer:** Información de contacto y enlaces útiles
- **Navegación:** Solo pantalla de inicio, sin tabs

## 🎨 Características de Diseño

- **Tema Boa:** Colores corporativos azules
- **Interfaz Moderna:** Diseño limpio y profesional
- **Responsive:** Adaptable a diferentes tamaños de pantalla
- **Animaciones:** Transiciones suaves y efectos visuales
- **Iconografía:** Material Design Icons
- **Navegación Adaptativa:** Footer normal vs tabs según el estado de autenticación

## 📊 Estructura del Proyecto

```
BoaTrackingApp-New/
├── components/          # Componentes reutilizables
│   ├── Footer.tsx      # Footer normal para vista pública
│   ├── Header.tsx      # Header de navegación
│   └── ...
├── screens/            # Pantallas principales
├── navigation/         # Configuración de navegación
├── utils/             # Utilidades y helpers
├── assets/            # Imágenes y recursos
├── theme.ts           # Configuración de colores
└── App.tsx            # Componente principal
```

## 🔧 Scripts Disponibles

- `npm start` - Iniciar servidor de desarrollo
- `npm run android` - Ejecutar en Android
- `npm run ios` - Ejecutar en iOS
- `npm run web` - Ejecutar en web

## 📱 Pruebas en Dispositivo

1. **Instalar Expo Go** en tu dispositivo móvil
2. **Escanear el código QR** que aparece en el terminal
3. **O usar conexión USB** con `start-usb.bat`

## 🚀 Despliegue

### Android
   ```bash
eas build --platform android
   ```

### iOS
   ```bash
eas build --platform ios
```

## 📝 Notas de Desarrollo

- La aplicación utiliza un sistema de autenticación local para demostración
- Los datos se almacenan en memoria durante la sesión
- Para producción, se recomienda integrar con un backend real
- Las funcionalidades están diferenciadas por tipo de usuario
- **La navegación se adapta automáticamente** según el estado de autenticación:
  - **Sin login:** Solo HomeScreen con footer normal
  - **Con login:** Navegación completa con tabs

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@boa-tracking.com
- Documentación: [docs.boa-tracking.com](https://docs.boa-tracking.com)

---

**Desarrollado con ❤️ para BOA Tracking** 