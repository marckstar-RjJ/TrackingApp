// Sistema de tracking para BOA Tracking

export interface TrackingPoint {
  id: string;
  name: string;
  location: string;
  country: string;
  type: 'origin' | 'transit' | 'destination' | 'customs' | 'airport' | 'warehouse';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TrackingEvent {
  id: string;
  event_type: 'received' | 'classified' | 'dispatched' | 'in_flight' | 'delivered' | 'customs_clearance' | 'out_for_delivery' | 'pending' | 'arrived' | 'departure' | 'processing';
  location: string;
  timestamp: Date;
  operator: string;
  notes?: string;
  pointName?: string;
  description?: string;
  flightNumber?: string;
  airline?: string;
  nextDestination?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface TrackingItem {
  id: string;
  trackingNumber: string;
  description: string;
  status: string;
  location: string;
  priority: string;
  estimatedDelivery: string;
  receivedBy?: string;
  receivedAt?: string;
  events: TrackingEvent[];
  senderName?: string;
  recipientName?: string;
  weight?: string;
  cargoType?: string;
  originCity?: string;
  destinationCity?: string;
}

export interface TrackingStatus {
  id: string;
  trackingNumber: string;
  currentStatus: 'pending' | 'in_transit' | 'arrived' | 'processing' | 'out_for_delivery' | 'delivered' | 'customs_hold' | 'returned';
  currentLocation: string;
  currentPoint: string;
  progress: number; // 0-100
  estimatedDelivery: string;
  lastUpdate: string;
  events: TrackingEvent[];
  origin: string;
  destination: string;
  packageInfo: {
    weight: string;
    dimensions: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'express';
  };
  recipient: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  sender: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export interface InternalAlert {
  id: string;
  trackingNumber: string;
  type: 'delay' | 'customs_hold' | 'missing' | 'damaged';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  createdAt: Date;
  lastUpdate: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  packageInfo: {
    description: string;
    recipient: string;
    origin: string;
    destination: string;
  };
  timeSinceLastUpdate: number; // in hours
}

// Puntos de control predefinidos (ejemplo Bolivia - España)
export const TRACKING_POINTS: TrackingPoint[] = [
  // Bolivia
  { id: 'COCHABAMBA_ORIGIN', name: 'Centro de Distribución Cochabamba', location: 'Cochabamba', country: 'Bolivia', type: 'origin' },
  { id: 'LA_PAZ_AIRPORT', name: 'Aeropuerto Internacional El Alto', location: 'La Paz', country: 'Bolivia', type: 'airport' },
  { id: 'SANTA_CRUZ_AIRPORT', name: 'Aeropuerto Internacional Viru Viru', location: 'Santa Cruz', country: 'Bolivia', type: 'airport' },
  
  // Brasil
  { id: 'SAO_PAULO_AIRPORT', name: 'Aeropuerto Internacional de São Paulo', location: 'São Paulo', country: 'Brasil', type: 'airport' },
  { id: 'RIO_AIRPORT', name: 'Aeropuerto Internacional de Río de Janeiro', location: 'Río de Janeiro', country: 'Brasil', type: 'airport' },
  
  // España
  { id: 'MADRID_AIRPORT', name: 'Aeropuerto Adolfo Suárez Madrid-Barajas', location: 'Madrid', country: 'España', type: 'airport' },
  { id: 'BARCELONA_AIRPORT', name: 'Aeropuerto Josep Tarradellas Barcelona-El Prat', location: 'Barcelona', country: 'España', type: 'airport' },
  { id: 'MADRID_WAREHOUSE', name: 'Centro de Distribución Madrid', location: 'Madrid', country: 'España', type: 'warehouse' },
  { id: 'BARCELONA_WAREHOUSE', name: 'Centro de Distribución Barcelona', location: 'Barcelona', country: 'España', type: 'warehouse' },
  { id: 'VALENCIA_WAREHOUSE', name: 'Centro de Distribución Valencia', location: 'Valencia', country: 'España', type: 'warehouse' },
  { id: 'SEVILLA_WAREHOUSE', name: 'Centro de Distribución Sevilla', location: 'Sevilla', country: 'España', type: 'warehouse' },
];

// Aerolíneas disponibles
export const AIRLINES = [
  { code: 'BOA', name: 'BOA Airlines', country: 'Bolivia' },
  { code: 'LATAM', name: 'LATAM Airlines', country: 'Chile' },
  { code: 'IBERIA', name: 'Iberia', country: 'España' },
  { code: 'AIR_EUROPA', name: 'Air Europa', country: 'España' },
  { code: 'TAP', name: 'TAP Air Portugal', country: 'Portugal' },
  { code: 'AMERICAN', name: 'American Airlines', country: 'Estados Unidos' },
  { code: 'DELTA', name: 'Delta Air Lines', country: 'Estados Unidos' },
];

// Descripciones de estados de tracking
export const TRACKING_STATUS_DESCRIPTIONS = {
  pending: 'Pendiente de procesamiento',
  in_transit: 'En tránsito',
  arrived: 'Llegado a destino',
  processing: 'En procesamiento',
  out_for_delivery: 'En ruta de entrega',
  delivered: 'Entregado',
  customs_hold: 'Retenido en aduanas',
  returned: 'Devuelto al remitente',
};

// Función para calcular el progreso basado en eventos
export const calculateProgress = (events: TrackingEvent[]): number => {
  if (events.length === 0) return 0;
  
  const lastEvent = events[0];
  
  switch (lastEvent.event_type) {
    case 'delivered':
      return 100;
    case 'out_for_delivery':
      return 90;
    case 'customs_clearance':
      return 85;
    case 'in_flight':
      return 75;
    case 'dispatched':
      return 60;
    case 'classified':
      return 40;
    case 'received':
      return 20;
    case 'pending':
    case 'processing':
    case 'arrived':
    case 'departure':
    default:
      return 10;
  }
};

// Función para obtener el estado actual basado en eventos
export const getCurrentStatus = (events: TrackingEvent[]): string => {
  if (events.length === 0) return 'pending';
  
  const lastEvent = events[events.length - 1];
  return lastEvent.event_type;
};

// Función para generar eventos de ejemplo
export const generateSampleEvents = (trackingNumber: string): TrackingEvent[] => {
  const now = new Date();
  const events: TrackingEvent[] = [
    {
      id: '1',
      event_type: 'received',
      location: 'Centro de Distribución Madrid',
      description: 'Paquete recibido en centro de distribución',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 día atrás
      operator: 'Admin',
    },
    {
      id: '2',
      event_type: 'classified',
      location: 'Centro de Distribución Madrid',
      description: 'Paquete clasificado y preparado para envío',
      timestamp: new Date(now.getTime() - 20 * 60 * 60 * 1000), // 20 horas atrás
      operator: 'Admin',
    },
    {
      id: '3',
      event_type: 'dispatched',
      location: 'Aeropuerto Madrid-Barajas',
      description: 'Paquete despachado hacia destino',
      timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000), // 18 horas atrás
      operator: 'Admin',
      flightNumber: 'IB123',
      airline: 'Iberia',
      nextDestination: 'Aeropuerto Internacional de Lima',
    },
  ];
  
  return events;
};

// Función para agregar un nuevo evento
export const addTrackingEvent = (
  trackingNumber: string,
  event_type: TrackingEvent['event_type'],
  location: string,
  operator: string,
  notes?: string,
  coordinates?: { latitude: number; longitude: number }
): TrackingEvent => {
  return {
    id: Date.now().toString(),
    event_type,
    location,
    description: `Evento ${event_type} registrado en ${location}`,
    timestamp: new Date(),
    operator,
    notes,
    coordinates,
  };
};

// Función para generar número de tracking
export const generateTrackingNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BOA-${year}-${random}`;
};

// Función para crear un nuevo evento de tracking
export const createTrackingEvent = (
  trackingNumber: string,
  pointId: string,
  event_type: TrackingEvent['event_type'],
  operator: string,
  description: string,
  flightNumber?: string,
  airline?: string,
  nextDestination?: string,
  notes?: string
): TrackingEvent => {
  const point = TRACKING_POINTS.find(p => p.id === pointId);
  
  return {
    id: `${trackingNumber}-${Date.now()}`,
    event_type,
    location: point?.name || 'Punto desconocido',
    description,
    timestamp: new Date(),
    operator,
    flightNumber,
    airline,
    nextDestination,
    notes,
  };
};

// Función para obtener el siguiente punto de control
export const getNextTrackingPoint = (currentPointId: string, destination: string): TrackingPoint | null => {
  const currentIndex = TRACKING_POINTS.findIndex(p => p.id === currentPointId);
  
  if (currentIndex === -1 || currentIndex === TRACKING_POINTS.length - 1) {
    return null;
  }
  
  return TRACKING_POINTS[currentIndex + 1];
};

// Función para obtener puntos de control por país
export const getTrackingPointsByCountry = (country: string): TrackingPoint[] => {
  return TRACKING_POINTS.filter(point => point.country === country);
};

// Función para obtener puntos de control por tipo
export const getTrackingPointsByType = (type: TrackingPoint['type']): TrackingPoint[] => {
  return TRACKING_POINTS.filter(point => point.type === type);
};

// Función para verificar alertas internas de retraso
export const checkInternalAlerts = (trackingItems: TrackingItem[]): InternalAlert[] => {
  const alerts: InternalAlert[] = [];
  const now = new Date();
  const DELAY_THRESHOLD_HOURS = 1.5;

  trackingItems.forEach(item => {
    if (item.events.length === 0) return;

    const lastEvent = item.events[item.events.length - 1];
    const timeSinceLastUpdate = (now.getTime() - lastEvent.timestamp.getTime()) / (1000 * 60 * 60); // hours

    if (timeSinceLastUpdate > DELAY_THRESHOLD_HOURS) {
      const severity = timeSinceLastUpdate > 6 ? 'critical' : 
                      timeSinceLastUpdate > 4 ? 'high' : 
                      timeSinceLastUpdate > 2.5 ? 'medium' : 'low';

      alerts.push({
        id: `alert_${item.trackingNumber}_${Date.now()}`,
        trackingNumber: item.trackingNumber,
        type: 'delay',
        severity,
        title: `Retraso en paquete ${item.trackingNumber}`,
        description: `El paquete no se ha actualizado desde hace ${timeSinceLastUpdate.toFixed(1)} horas`,
        createdAt: new Date(),
        lastUpdate: lastEvent.timestamp,
        isResolved: false,
        packageInfo: {
          description: item.description,
          recipient: item.recipientName || 'N/A',
          origin: item.originCity || 'N/A',
          destination: item.destinationCity || 'N/A',
        },
        timeSinceLastUpdate,
      });
    }
  });

  return alerts.sort((a, b) => b.severity.localeCompare(a.severity));
};

// Función para resolver una alerta
export const resolveAlert = (alertId: string, resolvedBy: string): InternalAlert | null => {
  // En una implementación real, esto actualizaría la base de datos
  // Por ahora, simulamos la resolución
  return null;
};

// Función para obtener estadísticas de alertas
export const getAlertStatistics = (alerts: InternalAlert[]) => {
  const total = alerts.length;
  const critical = alerts.filter(a => a.severity === 'critical').length;
  const high = alerts.filter(a => a.severity === 'high').length;
  const medium = alerts.filter(a => a.severity === 'medium').length;
  const low = alerts.filter(a => a.severity === 'low').length;
  const resolved = alerts.filter(a => a.isResolved).length;
  const pending = total - resolved;

  return {
    total,
    critical,
    high,
    medium,
    low,
    resolved,
    pending,
  };
}; 