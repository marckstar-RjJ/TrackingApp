// Tema de colores Boa - Sistema de tracking
export const BOA_COLORS = {
  // Colores principales
  primary: '#1976D2',      // Azul principal de Boa
  secondary: '#42A5F5',    // Azul claro
  accent: '#0D47A1',       // Azul oscuro
  
  // Estados
  success: '#4CAF50',      // Verde - Entregado
  warning: '#FF9800',      // Naranja - En tránsito
  danger: '#F44336',       // Rojo - Problemas
  info: '#2196F3',         // Azul info
  
  // Variaciones
  light: '#E3F2FD',        // Azul muy claro
  dark: '#1565C0',         // Azul muy oscuro
  white: '#FFFFFF',
  gray: '#757575',
  lightGray: '#F5F5F5',
  
  // Gradientes
  gradientStart: '#1976D2',
  gradientEnd: '#42A5F5',
};

// Configuración de la aplicación
export const APP_CONFIG = {
  name: 'BOA Tracking',
  version: '1.0.0',
  description: 'Sistema de seguimiento en tiempo real',
  
  // Configuración de tracking
  tracking: {
    refreshInterval: 30000, // 30 segundos
    maxHistoryDays: 30,
    defaultStatus: 'En tránsito',
  },
  
  // Configuración de UI
  ui: {
    borderRadius: 12,
    cardElevation: 3,
    headerHeight: 80,
    animationDuration: 300,
  },
};

// Tipos de estado de tracking
export const TRACKING_STATUS = {
  IN_TRANSIT: 'En tránsito',
  DELIVERED: 'Entregado',
  IN_WAREHOUSE: 'En almacén',
  PENDING: 'Pendiente',
  CANCELLED: 'Cancelado',
} as const;

// Iconos por estado
export const STATUS_ICONS = {
  [TRACKING_STATUS.IN_TRANSIT]: 'local-shipping',
  [TRACKING_STATUS.DELIVERED]: 'check-circle',
  [TRACKING_STATUS.IN_WAREHOUSE]: 'warehouse',
  [TRACKING_STATUS.PENDING]: 'schedule',
  [TRACKING_STATUS.CANCELLED]: 'cancel',
} as const;

// Colores por estado
export const STATUS_COLORS = {
  [TRACKING_STATUS.IN_TRANSIT]: BOA_COLORS.warning,
  [TRACKING_STATUS.DELIVERED]: BOA_COLORS.success,
  [TRACKING_STATUS.IN_WAREHOUSE]: BOA_COLORS.secondary,
  [TRACKING_STATUS.PENDING]: BOA_COLORS.gray,
  [TRACKING_STATUS.CANCELLED]: BOA_COLORS.danger,
} as const; 