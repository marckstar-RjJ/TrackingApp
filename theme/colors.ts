// Tema de colores Boa - Configuración centralizada
export const BOA_COLORS = {
  primary: '#1976D2',      // Azul principal
  secondary: '#42A5F5',    // Azul claro
  accent: '#0D47A1',       // Azul oscuro
  success: '#4CAF50',      // Verde
  warning: '#FF9800',      // Naranja
  danger: '#F44336',       // Rojo
  light: '#E3F2FD',        // Azul muy claro
  dark: '#1565C0',         // Azul muy oscuro
  white: '#FFFFFF',
  gray: '#757575',
  lightGray: '#F5F5F5',
  background: '#f0f0f0',
  cardBackground: 'rgba(25, 118, 210, 0.15)',
  cardBorder: 'rgba(25, 118, 210, 0.2)',
  overlay: 'rgba(255, 255, 255, 0.1)',
  // Colores adicionales para componentes
  lightBlue: '#E3F2FD',    // Azul claro para botones
  lightRed: '#FFEBEE',     // Rojo claro para botones
  darkGray: '#424242',     // Gris oscuro para texto
  red: '#F44336',          // Rojo
  blue: '#2196F3',         // Azul
};

// Estados de tracking
export const TRACKING_STATUS = {
  IN_TRANSIT: 'En tránsito',
  DELIVERED: 'Entregado',
  IN_WAREHOUSE: 'En almacén',
  CUSTOMS: 'Retenido en aduana',
  ERROR: 'Error en el envío',
};

// Colores por estado
export const getStatusColor = (status: string) => {
  switch (status) {
    case TRACKING_STATUS.IN_TRANSIT:
      return BOA_COLORS.warning;
    case TRACKING_STATUS.DELIVERED:
      return BOA_COLORS.success;
    case TRACKING_STATUS.IN_WAREHOUSE:
      return BOA_COLORS.secondary;
    case TRACKING_STATUS.CUSTOMS:
      return BOA_COLORS.danger;
    case TRACKING_STATUS.ERROR:
      return BOA_COLORS.danger;
    default:
      return BOA_COLORS.gray;
  }
};

// Iconos por estado
export const getStatusIcon = (status: string) => {
  switch (status) {
    case TRACKING_STATUS.IN_TRANSIT:
      return 'local-shipping';
    case TRACKING_STATUS.DELIVERED:
      return 'check-circle';
    case TRACKING_STATUS.IN_WAREHOUSE:
      return 'warehouse';
    case TRACKING_STATUS.CUSTOMS:
      return 'gavel';
    case TRACKING_STATUS.ERROR:
      return 'error';
    default:
      return 'info';
  }
};

// Tipos de alertas
export const ALERT_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success',
};

// Colores por tipo de alerta
export const getAlertTypeColor = (type: string) => {
  switch (type) {
    case ALERT_TYPES.INFO:
      return BOA_COLORS.primary;
    case ALERT_TYPES.WARNING:
      return BOA_COLORS.warning;
    case ALERT_TYPES.ERROR:
      return BOA_COLORS.danger;
    case ALERT_TYPES.SUCCESS:
      return BOA_COLORS.success;
    default:
      return BOA_COLORS.gray;
  }
};

// Iconos por tipo de alerta
export const getAlertTypeIcon = (type: string) => {
  switch (type) {
    case ALERT_TYPES.INFO:
      return 'info';
    case ALERT_TYPES.WARNING:
      return 'warning';
    case ALERT_TYPES.ERROR:
      return 'error';
    case ALERT_TYPES.SUCCESS:
      return 'check-circle';
    default:
      return 'notifications';
  }
};

// Prioridades
export const PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Colores por prioridad
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case PRIORITIES.HIGH:
      return BOA_COLORS.danger;
    case PRIORITIES.MEDIUM:
      return BOA_COLORS.warning;
    case PRIORITIES.LOW:
      return BOA_COLORS.success;
    default:
      return BOA_COLORS.gray;
  }
}; 