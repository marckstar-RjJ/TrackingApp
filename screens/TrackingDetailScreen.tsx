import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BOA_COLORS } from '../theme';
import { User, isAdmin } from '../utils/auth';
import {
  TrackingEvent,
  TRACKING_STATUS_DESCRIPTIONS,
  calculateProgress,
} from '../utils/tracking';
import { TrackingEventModal } from '../components/TrackingEventModal';
import { ClaimModal } from '../components/ClaimModal';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';

interface TrackingDetailScreenProps {
  navigation: any;
  route: any;
}

export const TrackingDetailScreen: React.FC<TrackingDetailScreenProps> = ({ navigation, route }) => {
  const { trackingItem, currentUser } = route.params;
  const isPreRegistration = !trackingItem.status;

  const [updatedTrackingItem, setUpdatedTrackingItem] = useState(trackingItem);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>('');

  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    const {
      trackingNumber, tracking_number, description, cargo_type, weight, priority,
      shipping_type, cost, origin_city, destination_city, sender_name,
      recipient_name, sender_email, recipient_email, status
    } = updatedTrackingItem;
    
    // Usar el tracking number correcto
    const finalTrackingNumber = trackingNumber || tracking_number;
    
    // Determinar el tipo de documento basado en el estado
    const isApproved = status === 'Aprobado';
    const documentTitle = isApproved ? 'Orden de Tracking' : 'Confirmación de Pre-Registro';
    const documentSubtitle = isApproved ? 'Paquete Aprobado' : 'Pre-Registro Pendiente';
    
    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
            .container { padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { color: #1976D2; margin: 0; }
            .header p { margin: 5px 0; font-size: 14px; color: #777; }
            .status-badge { 
              display: inline-block; 
              padding: 5px 15px; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: bold; 
              margin-top: 5px;
              background-color: ${isApproved ? '#4CAF50' : '#FF9800'};
              color: white;
            }
            .section { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
            .section h2 { color: #1976D2; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-item { background-color: #f9f9f9; padding: 10px; border-radius: 5px; }
            .info-item strong { display: block; color: #555; margin-bottom: 5px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #aaa; }
            .tracking-number { 
              font-size: 18px; 
              font-weight: bold; 
              color: #1976D2; 
              background-color: #e3f2fd; 
              padding: 10px; 
              border-radius: 5px; 
              text-align: center;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${documentTitle}</h1>
              <p>${documentSubtitle}</p>
              <div class="tracking-number">${finalTrackingNumber}</div>
              <div class="status-badge">${isApproved ? 'APROBADO' : 'PENDIENTE'}</div>
            </div>
            
            <div class="section">
              <h2>Información del Envío</h2>
              <div class="info-grid">
                <div class="info-item"><strong>Descripción:</strong> ${description}</div>
                <div class="info-item"><strong>Tipo de Carga:</strong> ${cargo_type || 'No especificado'}</div>
                <div class="info-item"><strong>Peso:</strong> ${weight || 'No especificado'} kg</div>
                <div class="info-item"><strong>Prioridad:</strong> ${priority}</div>
                <div class="info-item"><strong>Tipo de Envío:</strong> ${shipping_type || 'Estándar'}</div>
                <div class="info-item"><strong>Costo Estimado:</strong> Bs ${cost || 'No calculado'}</div>
              </div>
            </div>

            <div class="section">
              <h2>Origen y Destino</h2>
              <div class="info-grid">
                <div class="info-item"><strong>Ciudad de Origen:</strong> ${origin_city}</div>
                <div class="info-item"><strong>Ciudad de Destino:</strong> ${destination_city}</div>
              </div>
            </div>

            <div class="section">
              <h2>Remitente y Destinatario</h2>
              <div class="info-grid">
                <div class="info-item"><strong>Remitente:</strong> ${sender_name}</div>
                <div class="info-item"><strong>Destinatario:</strong> ${recipient_name}</div>
                <div class="info-item"><strong>Email Remitente:</strong> ${sender_email || 'No especificado'}</div>
                <div class="info-item"><strong>Email Destinatario:</strong> ${recipient_email || 'No especificado'}</div>
              </div>
            </div>

            <div class="footer">
              <p>${isApproved ? 'Gracias por confiar en Boa Tracking. Su paquete ha sido aprobado y está en proceso.' : 'Gracias por confiar en Boa Tracking. Su pre-registro está siendo revisado.'}</p>
              <p>Fecha de generación: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el PDF.");
      console.error(error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation('Ubicación no disponible');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Obtener dirección a partir de coordenadas
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const addr = address[0];
        const locationString = `${addr.city || ''} ${addr.region || ''} ${addr.country || ''}`.trim();
        setCurrentLocation(locationString || 'Ubicación actual');
      } else {
        setCurrentLocation('Ubicación actual');
      }
    } catch (error) {
      setCurrentLocation('Ubicación no disponible');
    }
  };

  const fetchPackageData = useCallback(async () => {
    if (isPreRegistration) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`https://b113-66-203-113-32.ngrok-free.app/api/packages/tracking/${trackingItem.trackingNumber}`);
      const data = await res.json();
      
      if (data) {
        console.log('API Response - updatedTrackingItem:', data);
        setUpdatedTrackingItem(data);
        if (data.events && Array.isArray(data.events)) {
          const formattedEvents = data.events.map((event: TrackingEvent) => ({
            ...event,
            timestamp: new Date(event.timestamp),
          }));
          setEvents(formattedEvents);
        } else {
          setEvents([]);
        }
      }
    } catch (e) {
      Alert.alert("Error", "No se pudo cargar la información del paquete.");
    } finally {
      setIsLoading(false);
    }
  }, [trackingItem.trackingNumber, isPreRegistration]);

  useFocusEffect(
    useCallback(() => {
      fetchPackageData();
      getCurrentLocation();
    }, [fetchPackageData])
  );
  
  const progress = calculateProgress(events);
  const currentStatus = updatedTrackingItem.status ? updatedTrackingItem.status.toLowerCase() : 'pending';
  
  // Mapear tipos de eventos a descripciones disponibles
  const getStatusDescription = (eventType: string) => {
    switch (eventType) {
      case 'received':
        return 'Recibido en Centro de Distribución';
      case 'classified':
        return 'Clasificado y Preparado';
      case 'dispatched':
        return 'Despachado hacia Destino';
      case 'in_flight':
        return 'En Vuelo';
      case 'arrived':
        return 'Llegado a Destino';
      case 'departure':
        return 'En Tránsito';
      case 'processing':
        return 'En Procesamiento';
      case 'customs_clearance':
      case 'customs_hold':
        return 'En Aduana';
      case 'out_for_delivery':
        return 'En Ruta de Entrega';
      case 'delivered':
        return 'Entregado';
      case 'pending':
      default:
        return 'Pendiente de Procesamiento';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return BOA_COLORS.success;
      case 'in_transit':
      case 'arrived':
      case 'processing':
        return BOA_COLORS.warning;
      case 'customs_hold':
        return BOA_COLORS.danger;
      default:
        return BOA_COLORS.gray;
    }
  };

  const handleAddEvent = (event: TrackingEvent) => {
    setEvents([...events, event]);
    fetchPackageData(); // Refrescar datos después de agregar evento
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}>
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerContent}>
              <View style={styles.trackingInfo}>
                <MaterialIcons name="local-shipping" size={32} color={BOA_COLORS.primary} />
                <View style={styles.trackingDetails}>
                  <Text style={styles.trackingNumber}>{updatedTrackingItem.trackingNumber}</Text>
                  <Text style={[styles.status, { color: getStatusColor(currentStatus) }]}>
                    {isPreRegistration ? 'Pre-registrado' : getStatusDescription(currentStatus)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {isPreRegistration ? (
            <View style={styles.currentStatusCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="info-outline" size={24} color={BOA_COLORS.primary} />
                <Text style={styles.cardTitle}>Detalles del Pre-Registro</Text>
              </View>
              <View style={styles.currentStatusContent}>
                <View style={styles.statusInfoRow}><MaterialIcons name="person" size={20} color={BOA_COLORS.primary} /><View style={styles.statusInfoContent}><Text style={styles.statusInfoLabel}>Remitente:</Text><Text style={styles.statusInfoValue}>{updatedTrackingItem.sender_name}</Text></View></View>
                <View style={styles.statusInfoRow}><MaterialIcons name="person-outline" size={20} color={BOA_COLORS.primary} /><View style={styles.statusInfoContent}><Text style={styles.statusInfoLabel}>Destinatario:</Text><Text style={styles.statusInfoValue}>{updatedTrackingItem.recipient_name}</Text></View></View>
                <View style={styles.statusInfoRow}><MaterialIcons name="description" size={20} color={BOA_COLORS.primary} /><View style={styles.statusInfoContent}><Text style={styles.statusInfoLabel}>Descripción:</Text><Text style={styles.statusInfoValue}>{updatedTrackingItem.description}</Text></View></View>
                <View style={styles.statusInfoRow}><MaterialIcons name="place" size={20} color={BOA_COLORS.primary} /><View style={styles.statusInfoContent}><Text style={styles.statusInfoLabel}>Origen:</Text><Text style={styles.statusInfoValue}>{updatedTrackingItem.origin_city}</Text></View></View>
                <View style={styles.statusInfoRow}><MaterialIcons name="flag" size={20} color={BOA_COLORS.primary} /><View style={styles.statusInfoContent}><Text style={styles.statusInfoLabel}>Destino:</Text><Text style={styles.statusInfoValue}>{updatedTrackingItem.destination_city}</Text></View></View>
                <View style={styles.statusInfoRow}><MaterialIcons name="local-shipping" size={20} color={BOA_COLORS.primary} /><View style={styles.statusInfoContent}><Text style={styles.statusInfoLabel}>Tipo de Carga:</Text><Text style={styles.statusInfoValue}>{updatedTrackingItem.cargo_type || 'No especificado'}</Text></View></View>
                <View style={styles.statusInfoRow}><MaterialIcons name="line-weight" size={20} color={BOA_COLORS.primary} /><View style={styles.statusInfoContent}><Text style={styles.statusInfoLabel}>Peso:</Text><Text style={styles.statusInfoValue}>{updatedTrackingItem.weight || 'No especificado'} kg</Text></View></View>
                <View style={styles.statusInfoRow}>
                  <MaterialIcons name="event" size={20} color={BOA_COLORS.primary} />
                  <View style={styles.statusInfoContent}>
                    <Text style={styles.statusInfoLabel}>Fecha Estimada de Entrega:</Text>
                    <Text style={styles.statusInfoValue}>
                      {(() => {
                        const fecha = updatedTrackingItem.estimatedDelivery || updatedTrackingItem.estimated_delivery_date;
                        if (fecha && !isNaN(Date.parse(fecha))) {
                          return new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
                        } else if (fecha) {
                          return fecha;
                        } else {
                          return 'No especificada';
                        }
                      })()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <>
          {/* Progress Card */}
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Progreso del Envío</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{progress}% completado</Text>
            </View>
          </View>

          {/* Current Status Card - Nueva sección */}
          <View style={styles.currentStatusCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="info" size={24} color={BOA_COLORS.primary} />
              <Text style={styles.cardTitle}>Estado Actual</Text>
            </View>
            
            <View style={styles.currentStatusContent}>
              <View style={styles.statusInfoRow}>
                <MaterialIcons name="local-shipping" size={20} color={BOA_COLORS.primary} />
                <View style={styles.statusInfoContent}>
                  <Text style={styles.statusInfoLabel}>Estado:</Text>
                  <Text style={[styles.statusInfoValue, { color: getStatusColor(currentStatus) }]}>
                    {getStatusDescription(currentStatus)}
                  </Text>
                </View>
              </View>
              
              {events.length > 0 && (
                <>
                  <View style={styles.statusInfoRow}>
                    <MaterialIcons name="location-on" size={20} color={BOA_COLORS.primary} />
                    <View style={styles.statusInfoContent}>
                      <Text style={styles.statusInfoLabel}>Ubicación actual:</Text>
                          <Text style={styles.statusInfoValue}>{currentLocation}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.statusInfoRow}>
                    <MaterialIcons name="schedule" size={20} color={BOA_COLORS.primary} />
                    <View style={styles.statusInfoContent}>
                      <Text style={styles.statusInfoLabel}>Última actualización:</Text>
                      <Text style={styles.statusInfoValue}>
                        {new Date(events[0].timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.statusInfoRow}>
                    <MaterialIcons name="description" size={20} color={BOA_COLORS.primary} />
                    <View style={styles.statusInfoContent}>
                      <Text style={styles.statusInfoLabel}>Descripción del evento:</Text>
                      <Text style={styles.statusInfoValue}>{events[0].notes || 'Ninguna'}</Text>
                    </View>
                  </View>
                  
                </>
              )}
            </View>
          </View>

          {/* Timeline Card */}
          <View style={styles.timelineCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="timeline" size={24} color={BOA_COLORS.primary} />
              <Text style={styles.cardTitle}>Línea de Tiempo del Recorrido</Text>
            </View>
            
            {events.length === 0 && (
              <View style={styles.emptyState}>
                <MaterialIcons name="schedule" size={48} color={BOA_COLORS.gray} />
                <Text style={styles.emptyText}>No hay eventos registrados aún.</Text>
                <Text style={styles.emptySubtext}>Los eventos aparecerán aquí cuando se registren.</Text>
              </View>
            )}
            
            {events.slice(0, 5).map((event, idx) => (
              <View key={event.id} style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  <View style={[
                    styles.timelineIcon, 
                    { 
                          backgroundColor: idx === 0 ? getStatusColor(currentStatus) : BOA_COLORS.lightGray,
                          borderColor: idx === 0 ? getStatusColor(currentStatus) : BOA_COLORS.gray
                    }
                  ]}>
                    <MaterialIcons
                          name={ (event as any).icon || 'radio-button-checked'} 
                          size={16} 
                          color={idx === 0 ? 'white' : BOA_COLORS.gray} 
                        />
                      </View>
                      {idx < events.length -1 && <View style={styles.timelineConnector} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>{getStatusDescription(event.event_type)}</Text>
                      <Text style={styles.timelineSubtitle}>{event.notes || 'Ninguna'}</Text>
                      <Text style={styles.timelineDate}>{new Date(event.timestamp).toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
            
          {isAdmin(currentUser) && !isPreRegistration && (
              <TouchableOpacity 
              style={styles.fab} 
              onPress={() => setShowEventModal(true)}
              >
              <MaterialIcons name="add" size={24} color="white" />
              </TouchableOpacity>
            )}

          {/* Package Info Card */}
          <View style={styles.packageInfoCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="archive" size={24} color={BOA_COLORS.primary} />
              <Text style={styles.cardTitle}>Información del Paquete</Text>
            </View>
            <View style={styles.packageInfoContent}>
              <Text style={styles.packageInfoText}>
                <Text style={styles.bold}>Descripción:</Text> {updatedTrackingItem.description}
              </Text>
              <Text style={styles.packageInfoText}>
                <Text style={styles.bold}>Prioridad:</Text> {updatedTrackingItem.priority}
              </Text>
              <Text style={styles.packageInfoText}>
                <Text style={styles.bold}>Fecha estimada de entrega:</Text> {
                  (() => {
                    const fecha = updatedTrackingItem.estimatedDelivery || updatedTrackingItem.estimated_delivery_date;
                    if (fecha && !isNaN(Date.parse(fecha))) {
                      return new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
                    } else if (fecha) {
                      return fecha;
                    } else {
                      return 'No especificada';
                    }
                  })()
                }
                  </Text>
            </View>
          </View>

          {/* Admin Action Button */}
          {isAdmin(currentUser) && (
            <TouchableOpacity style={styles.addEventButton} onPress={() => setShowEventModal(true)}>
              <MaterialIcons name="add-circle" size={24} color={BOA_COLORS.white} />
              <Text style={styles.addEventButtonText}>Registrar Nuevo Evento</Text>
            </TouchableOpacity>
          )}

          {/* User Action: Report an issue */}
          {!isAdmin(currentUser) && (
            <TouchableOpacity style={styles.reportIssueButton} onPress={() => setShowClaimModal(true)}>
              <MaterialIcons name="report-problem" size={20} color={BOA_COLORS.danger} />
              <Text style={styles.reportIssueButtonText}>Reportar un Problema</Text>
            </TouchableOpacity>
          )}

          {/* Download PDF Button - for approved preregistrations or all packages */}
          {(updatedTrackingItem.status === 'Aprobado' || !isPreRegistration) && (
            <TouchableOpacity 
              style={[styles.downloadButton, { opacity: isGeneratingPdf ? 0.5 : 1 }]} 
              onPress={generatePdf}
              disabled={isGeneratingPdf}
            >
              <MaterialIcons name="file-download" size={20} color={BOA_COLORS.white} />
              <Text style={styles.downloadButtonText}>
                {isGeneratingPdf ? 'Generando PDF...' : 'Descargar Orden de Tracking'}
              </Text>
            </TouchableOpacity>
          )}

        </ScrollView>
        <TrackingEventModal
          visible={showEventModal}
          onClose={() => setShowEventModal(false)}
          onEventCreated={handleAddEvent}
          trackingNumber={updatedTrackingItem.tracking_number || updatedTrackingItem.trackingNumber || 'N/A'}
          operator={currentUser?.name || ''}
          currentLocation={currentLocation}
        />
        <ClaimModal
          visible={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          trackingNumber={updatedTrackingItem.trackingNumber}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  content: { 
    padding: 16,
    paddingBottom: 80,
  },
  headerCard: {
    backgroundColor: BOA_COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingDetails: {
    marginLeft: 12,
    alignItems: 'center',
  },
  trackingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 5,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: BOA_COLORS.success,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: BOA_COLORS.dark,
  },
  currentStatusCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BOA_COLORS.lightGray,
    paddingBottom: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginLeft: 8,
  },
  currentStatusContent: {
    gap: 12,
  },
  statusInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfoContent: {
    flex: 1,
    marginLeft: 12,
  },
  statusInfoLabel: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginBottom: 2,
  },
  statusInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: BOA_COLORS.dark,
  },
  timelineCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.gray,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: BOA_COLORS.lightGray,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginTop: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: BOA_COLORS.gray,
    marginTop: 4,
  },
  packageInfoCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  packageInfoContent: {
    gap: 8,
  },
  packageInfoText: {
    fontSize: 14,
    color: BOA_COLORS.dark,
  },
  bold: {
    fontWeight: 'bold',
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BOA_COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addEventButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reportIssueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BOA_COLORS.light,
    borderColor: BOA_COLORS.danger,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  reportIssueButtonText: {
    color: BOA_COLORS.danger,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BOA_COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: BOA_COLORS.accent,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
}); 