// Configuración del fondo de la aplicación
export const BACKGROUND_CONFIG = {
  // Opacidad del fondo (0.0 = transparente, 1.0 = completamente visible)
  backgroundOpacity: 0.8,
  
  // Opacidad del overlay (0.0 = sin overlay, 1.0 = completamente oscuro)
  overlayOpacity: 0.3,
  
  // Opacidad del contenido (0.0 = transparente, 1.0 = completamente opaco)
  contentOpacity: 0.95,
  
  // Modo de redimensionamiento del fondo
  resizeMode: 'cover', // 'cover', 'contain', 'stretch', 'repeat', 'center'
  
  // Configuraciones alternativas para diferentes dispositivos
  deviceSpecific: {
    // Para dispositivos con pantallas pequeñas
    small: {
      backgroundOpacity: 0.6,
      overlayOpacity: 0.4,
    },
    // Para dispositivos con pantallas grandes
    large: {
      backgroundOpacity: 0.9,
      overlayOpacity: 0.2,
    }
  }
};

// Función para obtener la configuración según el tamaño de pantalla
export const getBackgroundConfig = (screenWidth) => {
  if (screenWidth < 400) {
    return { ...BACKGROUND_CONFIG, ...BACKGROUND_CONFIG.deviceSpecific.small };
  } else if (screenWidth > 800) {
    return { ...BACKGROUND_CONFIG, ...BACKGROUND_CONFIG.deviceSpecific.large };
  }
  return BACKGROUND_CONFIG;
}; 