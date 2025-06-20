# 🧪 Instrucciones de Prueba - BOA Tracking App

## 📋 Checklist de Pruebas

### ✅ Configuración Inicial
- [ ] Instalar dependencias: `npm install`
- [ ] Verificar que Expo CLI esté instalado: `expo --version`
- [ ] Iniciar el servidor: `npm start`
- [ ] Verificar que se abra el Metro Bundler en el navegador

### 📱 Pruebas de Navegación

#### 1. Splash Screen
- [ ] La pantalla de splash se muestra al iniciar la app
- [ ] El logo de BOA se muestra correctamente
- [ ] La transición a la pantalla principal es suave
- [ ] Duración apropiada (2-3 segundos)

#### 2. Pantalla de Inicio (Home)
- [ ] **Vista Pública** (sin login):
  - [ ] Se muestra la presentación de BOA Tracking
  - [ ] HeroCard con información principal
  - [ ] AnimatedCards con ventajas del sistema
  - [ ] Botón de login en el header
  - [ ] Acciones rápidas funcionan

- [ ] **Vista Privada** (con login):
  - [ ] Dashboard con estadísticas (4 cards)
  - [ ] Cards informativas sobre el sistema
  - [ ] Acciones rápidas (Escanear QR, Historial, Alertas, Soporte)
  - [ ] Botón de logout en el header

#### 3. Navegación con Tabs
- [ ] Tab "Inicio" funciona correctamente
- [ ] Tab "Seguimiento" navega a la pantalla de tracking
- [ ] Tab "Alertas" navega a la pantalla de alertas
- [ ] Iconos de tabs se muestran correctamente
- [ ] Colores activos/inactivos funcionan

### 🔍 Pruebas de Seguimiento

#### Pantalla de Tracking
- [ ] **Header**:
  - [ ] Título "Seguimiento de Paquetes"
  - [ ] Botón de escanear QR
  - [ ] Botón de agregar nuevo paquete

- [ ] **Búsqueda**:
  - [ ] Campo de búsqueda funciona
  - [ ] Filtra por número de tracking
  - [ ] Filtra por descripción del paquete

- [ ] **Filtros**:
  - [ ] Botón "Todos" muestra todos los paquetes
  - [ ] Botón "En tránsito" filtra correctamente
  - [ ] Botón "Entregado" filtra correctamente
  - [ ] Botón "En almacén" filtra correctamente
  - [ ] Botón "Retenido en aduana" filtra correctamente

- [ ] **Lista de Paquetes**:
  - [ ] Se muestran 5 paquetes de ejemplo
  - [ ] Cada paquete tiene número de tracking
  - [ ] Estados con colores correctos
  - [ ] Barras de progreso funcionan
  - [ ] Botones "Ver Detalles" y "Actualizar" funcionan

### 🔔 Pruebas de Alertas

#### Pantalla de Alertas
- [ ] **Tabs de Alertas**:
  - [ ] Tab "Notificaciones" muestra alertas
  - [ ] Tab "Configuración" muestra opciones

- [ ] **Notificaciones**:
  - [ ] Se muestran 5 alertas de ejemplo
  - [ ] Diferentes tipos (info, warning, error, success)
  - [ ] Estados leída/no leída funcionan
  - [ ] Botón "Marcar todas como leídas" funciona
  - [ ] Botón eliminar funciona
  - [ ] Acciones directas funcionan

- [ ] **Configuración**:
  - [ ] 7 opciones de configuración
  - [ ] Switches funcionan correctamente
  - [ ] Estados se guardan

### 🔐 Pruebas de Autenticación

#### Login Modal
- [ ] Se abre al hacer clic en "Login"
- [ ] Campos de email y contraseña funcionan
- [ ] Validación de campos
- [ ] Botón "Iniciar Sesión" funciona
- [ ] Link "¿No tienes cuenta?" abre registro
- [ ] Botón cerrar (X) funciona

#### Register Modal
- [ ] Se abre desde el modal de login
- [ ] Campos de registro funcionan
- [ ] Validación de campos
- [ ] Botón "Registrarse" funciona
- [ ] Link "¿Ya tienes cuenta?" regresa a login
- [ ] Botón cerrar (X) funciona

### 🎨 Pruebas de Diseño

#### Colores y Tema
- [ ] Colores corporativos BOA se aplican correctamente
- [ ] Estados de tracking tienen colores apropiados:
  - [ ] En tránsito: Naranja
  - [ ] Entregado: Verde
  - [ ] En almacén: Azul claro
  - [ ] Retenido en aduana: Rojo
- [ ] Tipos de alertas tienen colores correctos
- [ ] Contraste de texto es legible

#### Componentes
- [ ] Cards tienen sombras y bordes redondeados
- [ ] Botones tienen estados hover/press
- [ ] Iconos se muestran correctamente
- [ ] Animaciones son suaves
- [ ] Layout es responsive

### 📱 Pruebas de Responsividad

#### Diferentes Tamaños
- [ ] **Móvil pequeño** (320px): Layout se adapta
- [ ] **Móvil mediano** (375px): Layout se adapta
- [ ] **Móvil grande** (414px): Layout se adapta
- [ ] **Tablet** (768px+): Layout se adapta

#### Orientación
- [ ] **Portrait**: Funciona correctamente
- [ ] **Landscape**: Layout se adapta (si es necesario)

### ⚡ Pruebas de Rendimiento

- [ ] La app inicia en menos de 3 segundos
- [ ] Navegación entre pantallas es fluida
- [ ] No hay lag al hacer scroll
- [ ] Animaciones son fluidas (60fps)
- [ ] No hay memory leaks

### 🐛 Casos de Error

#### Manejo de Errores
- [ ] Campos vacíos muestran validación
- [ ] Email inválido muestra error
- [ ] Contraseña corta muestra error
- [ ] Alertas de error se muestran correctamente
- [ ] La app no se cuelga con datos inválidos

## 🚀 Cómo Ejecutar las Pruebas

### 1. Preparación
```bash
cd BoaTrackingApp-New
npm install
npm start
```

### 2. Pruebas en Dispositivo Físico
1. Instalar Expo Go en tu dispositivo
2. Escanear el código QR del Metro Bundler
3. La app se abrirá en tu dispositivo

### 3. Pruebas en Emulador
```bash
# Para Android
npm run android

# Para iOS (solo macOS)
npm run ios
```

### 4. Pruebas en Web
```bash
npm run web
```

## 📝 Notas de Prueba

### Datos de Prueba
- **Paquetes de ejemplo**: 5 paquetes con diferentes estados
- **Alertas de ejemplo**: 5 alertas con diferentes tipos
- **Usuario de prueba**: Cualquier email/contraseña funciona

### Flujo Recomendado
1. Probar vista pública (sin login)
2. Probar login y registro
3. Probar vista privada (con login)
4. Probar navegación entre tabs
5. Probar funcionalidades de cada pantalla
6. Probar casos de error

### Problemas Comunes
- **Metro Bundler no inicia**: Ejecutar `npm run clear`
- **Dependencias faltantes**: Ejecutar `npm install`
- **Error de puerto**: Cambiar puerto en `package.json`
- **Dispositivo no conecta**: Verificar red WiFi

## ✅ Criterios de Aceptación

La aplicación se considera **funcional** cuando:
- [ ] Todas las pantallas principales se muestran correctamente
- [ ] La navegación funciona sin errores
- [ ] Los componentes visuales son consistentes
- [ ] La autenticación funciona (login/registro)
- [ ] Las funcionalidades básicas operan correctamente
- [ ] No hay errores críticos en la consola
- [ ] La app es responsive en diferentes tamaños

---

**¡Listo para probar! 🎉** 