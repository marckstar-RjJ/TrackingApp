import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { BOA_COLORS } from '../theme';
import Signature from 'react-native-signature-canvas';

interface TrackingEvent {
  id: string;
  eventType: 'received' | 'classified' | 'dispatched' | 'in_flight' | 'delivered' | 'customs_clearance' | 'out_for_delivery';
  location: string;
  timestamp: Date;
  operator: string;
  notes?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface PackageScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onEventRegistered: (trackingNumber: string, event: TrackingEvent) => void;
  currentUser?: { name: string; email: string; };
}

export const PackageScannerModal: React.FC<PackageScannerModalProps> = ({
  visible,
  onClose,
  onEventRegistered,
  currentUser,
}) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<TrackingEvent['eventType']>('received');
  const [notes, setNotes] = useState('');
  const [operator, setOperator] = useState('Admin');
  const [isLoading, setIsLoading] = useState(false);
  const [recipientCI, setRecipientCI] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [realTrackingNumbers, setRealTrackingNumbers] = useState<string[]>([]);

  // Simulación de paquetes registrados (en producción vendría de una base de datos)
  const registeredPackages = [
    'BOA-20240115-0001',
    'BOA-20240115-0002', 
    'BOA-20240115-0003',
    'BOA-20240115-0004',
    'BOA-20240115-0005'
  ];

  const eventTypes = [
    { value: 'received', label: 'Recibido', icon: 'inbox' },
    { value: 'classified', label: 'Clasificado', icon: 'sort' },
    { value: 'dispatched', label: 'Despachado', icon: 'local-shipping' },
    { value: 'in_flight', label: 'En Vuelo', icon: 'flight' },
    { value: 'customs_clearance', label: 'Aduanas', icon: 'gavel' },
    { value: 'out_for_delivery', label: 'En Entrega', icon: 'delivery-dining' },
    { value: 'delivered', label: 'Entregado', icon: 'check-circle' },
  ];

  useEffect(() => {
    if (visible) {
      setTrackingNumber('');
      setCurrentLocation('');
      setCoordinates(null);
      setSelectedEventType('received');
      setNotes('');
      setOperator(currentUser && currentUser.name ? currentUser.name : 'Admin');
      setRecipientCI('');
      setSignature(null);
      // Fetch tracking numbers reales
      fetch('https://b113-66-203-113-32.ngrok-free.app/api/packages')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRealTrackingNumbers(data.map(pkg => pkg.tracking_number));
          }
        })
        .catch(() => setRealTrackingNumbers([]));
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos de ubicación para registrar la localización del evento.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCoordinates({ latitude, longitude });

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
      console.log('Error obteniendo ubicación:', error);
      setCurrentLocation('Ubicación no disponible');
    }
  };

  const handleScanQR = () => {
    // Simulación de escaneo QR usando tracking numbers reales
    if (realTrackingNumbers.length === 0) {
      Alert.alert('Sin paquetes', 'No hay paquetes registrados en el sistema para simular el escaneo.');
      return;
    }
    const randomPackage = realTrackingNumbers[Math.floor(Math.random() * realTrackingNumbers.length)];
    setTrackingNumber(randomPackage);
    Alert.alert('QR Escaneado', `Paquete detectado: ${randomPackage}`);
  };

  const handleSignatureOK = (sig: string) => {
    setSignature(sig);
    setShowSignature(false);
    Alert.alert('Firma Guardada', 'La firma digital ha sido capturada exitosamente.');
  };

  const validateTrackingNumber = (): boolean => {
    if (!trackingNumber.trim()) {
      Alert.alert('Error', 'Por favor ingresa o escanea un número de tracking.');
      return false;
    }
    if (!realTrackingNumbers.includes(trackingNumber)) {
      Alert.alert('Error', 'Número de tracking no encontrado en el sistema.');
      return false;
    }
    // Si es entrega, CI es obligatorio
    if (selectedEventType === 'delivered' && !recipientCI.trim()) {
      Alert.alert('Error', 'El CI del destinatario es obligatorio para la entrega.');
      return false;
    }
    return true;
  };

  const handleRegisterEvent = () => {
    if (!validateTrackingNumber()) return;
    if (!currentLocation.trim()) {
      Alert.alert('Error', 'No se pudo obtener la ubicación. Por favor, intenta de nuevo.');
      return;
    }
    // Mostrar confirmación antes de registrar
    Alert.alert(
      'Confirmar Registro',
      `¿Registrar el siguiente evento?\n\nPaquete: ${trackingNumber}\nEvento: ${getEventTypeInfo(selectedEventType).label}\nUbicación: ${currentLocation}\nOperador: ${operator}\nNotas: ${notes || 'Ninguna'}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Registrar',
          onPress: async () => {
            setIsLoading(true);
            // POST al backend
            const body = {
              package_tracking: trackingNumber,
              event_type: selectedEventType,
              location: currentLocation,
              operator: operator,
              notes: notes || '',
              timestamp: new Date().toISOString(),
            };
            try {
              const res = await fetch('https://b113-66-203-113-32.ngrok-free.app/api/packages/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
              });
              const data = await res.json();
              if (res.ok) {
                Alert.alert('Éxito', 'Evento registrado correctamente.');
                // Limpiar y cerrar
                setTrackingNumber('');
                setNotes('');
                setSelectedEventType('received');
                setRecipientCI('');
                setSignature(null);
                setIsLoading(false);
                onClose();
              } else {
                Alert.alert('Error', data.error || 'No se pudo registrar el evento.');
                setIsLoading(false);
              }
            } catch (e) {
              Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const getEventTypeInfo = (type: TrackingEvent['eventType']) => {
    return eventTypes.find(et => et.value === type) || eventTypes[0];
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Escáner de Paquetes</Text>
            <Pressable style={styles.close} onPress={onClose}>
              <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Sección de Escaneo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Identificar Paquete</Text>
              
              <View style={styles.scanSection}>
                <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
                  <MaterialIcons name="qr-code-scanner" size={32} color={BOA_COLORS.white} />
                  <Text style={styles.scanButtonText}>Escanear Código QR</Text>
                </TouchableOpacity>
                
                <Text style={styles.orText}>o</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Ingresar número de tracking manualmente"
                  value={trackingNumber}
                  onChangeText={setTrackingNumber}
                  placeholderTextColor={BOA_COLORS.gray}
                  autoCapitalize="characters"
                />
                {trackingNumber.length > 0 && (
                  realTrackingNumbers.includes(trackingNumber) ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <MaterialIcons name="check-circle" size={18} color={BOA_COLORS.success} />
                      <Text style={{ color: BOA_COLORS.success, marginLeft: 4, fontSize: 13 }}>Número válido</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <MaterialIcons name="error" size={18} color={BOA_COLORS.danger} />
                      <Text style={{ color: BOA_COLORS.danger, marginLeft: 4, fontSize: 13 }}>No existe en el sistema</Text>
                    </View>
                  )
                )}
              </View>

              {trackingNumber && (
                <View style={styles.trackingPreview}>
                  <MaterialIcons name="local-shipping" size={20} color={BOA_COLORS.primary} />
                  <Text style={styles.trackingText}>{trackingNumber}</Text>
                </View>
              )}
            </View>

            {/* Sección de Ubicación */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ubicación del Evento</Text>
              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Ingrese la ubicación o presione el botón"
                    value={currentLocation}
                    onChangeText={setCurrentLocation}
                    autoCorrect={false}
                    multiline
                    numberOfLines={2}
                  />
                  <TouchableOpacity onPress={getCurrentLocation} style={{ marginLeft: 8 }}>
                    <MaterialIcons name="my-location" size={24} color={BOA_COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              {coordinates && (
                <Text style={styles.coordinatesText}>
                  Coordenadas: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                </Text>
              )}
            </View>

            {/* Sección de Tipo de Evento */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Evento</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventTypesContainer}>
                {eventTypes.map((eventType) => (
                  <TouchableOpacity
                    key={eventType.value}
                    style={[
                      styles.eventTypeButton,
                      selectedEventType === eventType.value && styles.eventTypeButtonActive
                    ]}
                    onPress={() => setSelectedEventType(eventType.value as TrackingEvent['eventType'])}
                  >
                    <MaterialIcons 
                      name={eventType.icon as any} 
                      size={20} 
                      color={selectedEventType === eventType.value ? BOA_COLORS.white : BOA_COLORS.primary} 
                    />
                    <Text style={[
                      styles.eventTypeText,
                      selectedEventType === eventType.value && styles.eventTypeTextActive
                    ]}>
                      {eventType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Sección de Operador */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Operador</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Nombre del operador"
                value={operator}
                editable={false}
                placeholderTextColor={BOA_COLORS.gray}
              />
            </View>

            {/* Sección de Notas */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notas Adicionales (Opcional)</Text>
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Agregar notas sobre el evento..."
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor={BOA_COLORS.gray}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Si es entrega, pedir CI y firma */}
            {selectedEventType === 'delivered' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Confirmación de Entrega</Text>
                <TextInput
                  style={styles.input}
                  placeholder="CI del destinatario (obligatorio)"
                  value={recipientCI}
                  onChangeText={setRecipientCI}
                  placeholderTextColor={BOA_COLORS.gray}
                  keyboardType="default"
                />
                <TouchableOpacity
                  style={[styles.scanButton, { marginTop: 12, marginBottom: 0 }]}
                  onPress={() => setShowSignature(true)}
                >
                  <MaterialIcons name="gesture" size={24} color={BOA_COLORS.white} />
                  <Text style={styles.scanButtonText}>{signature ? 'Modificar Firma' : 'Agregar Firma Digital (opcional)'}</Text>
                </TouchableOpacity>
                {signature && (
                  <View style={{ alignItems: 'center', marginTop: 8 }}>
                    <Text style={{ color: BOA_COLORS.primary, fontSize: 12, marginBottom: 4 }}>Firma capturada:</Text>
                    <View style={{ borderWidth: 1, borderColor: BOA_COLORS.primary, borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff' }}>
                      <Image 
                        source={{ uri: signature }} 
                        style={{ width: 200, height: 80 }}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Vista Previa del Evento */}
            {trackingNumber && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vista Previa del Evento</Text>
                
                <View style={styles.previewCard}>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Paquete:</Text>
                    <Text style={styles.previewValue}>{trackingNumber}</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Evento:</Text>
                    <Text style={styles.previewValue}>{getEventTypeInfo(selectedEventType).label}</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Ubicación:</Text>
                    <Text style={styles.previewValue}>{currentLocation}</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Operador:</Text>
                    <Text style={styles.previewValue}>{operator}</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Fecha/Hora:</Text>
                    <Text style={styles.previewValue}>{new Date().toLocaleString()}</Text>
                  </View>
                  {notes.trim().length > 0 && (
                    <View style={styles.previewRow}>
                      <Text style={styles.previewLabel}>Notas:</Text>
                      <Text style={styles.previewValue}>{notes}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.primaryButton, (!trackingNumber || isLoading) && styles.disabledButton]} 
              onPress={handleRegisterEvent}
              disabled={!trackingNumber || isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading 
                  ? (selectedEventType === 'delivered' ? 'Confirmando entrega...' : 'Registrando...') 
                  : 'Registrar Evento'
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal de firma digital */}
      {showSignature && (
        <Modal visible={showSignature} animationType="slide" transparent>
          <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }] }>
            <View style={styles.signatureModal}>
              <View style={styles.signatureHeader}>
                <Text style={styles.signatureTitle}>Firma Digital del Destinatario</Text>
                <TouchableOpacity onPress={() => setShowSignature(false)}>
                  <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.signatureContainer}>
                <Signature
                  onOK={handleSignatureOK}
                  onEmpty={() => setShowSignature(false)}
                  descriptionText="Firme en el recuadro de abajo"
                  clearText="Limpiar Firma"
                  confirmText="Guardar Firma"
                  webStyle={`
                    .m-signature-pad {
                      box-shadow: none; 
                      border: 2px solid #1976D2; 
                      border-radius: 12px;
                      margin: 0;
                      width: 100%;
                      height: 300px;
                    }
                    .m-signature-pad--body {
                      border-radius: 10px;
                      height: 250px;
                    }
                    .m-signature-pad--footer {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 10px 15px;
                      background-color: #f5f5f5;
                      border-top: 1px solid #e0e0e0;
                      border-radius: 0 0 10px 10px;
                    }
                    .m-signature-pad--footer button {
                      background-color: #1976D2;
                      color: white;
                      border: none;
                      padding: 8px 16px;
                      border-radius: 6px;
                      font-size: 14px;
                      font-weight: bold;
                      cursor: pointer;
                    }
                    .m-signature-pad--footer button:first-child {
                      background-color: #f44336;
                    }
                    .m-signature-pad--footer button:hover {
                      opacity: 0.8;
                    }
                    .m-signature-pad--description {
                      text-align: center;
                      color: #666;
                      font-size: 14px;
                      margin-bottom: 10px;
                    }
                  `}
                  autoClear={true}
                  minWidth={2}
                  maxWidth={4}
                  minDistance={1}
                  backgroundColor="white"
                  penColor="#1976D2"
                />
              </View>
              
              <View style={styles.signatureFooter}>
                <TouchableOpacity 
                  style={styles.signatureCancelButton} 
                  onPress={() => setShowSignature(false)}
                >
                  <Text style={styles.signatureCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '95%',
    maxWidth: 500,
    backgroundColor: BOA_COLORS.white,
    borderRadius: 18,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BOA_COLORS.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
  },
  close: {
    padding: 4,
  },
  content: {
    padding: 20,
    maxHeight: 500,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 12,
  },
  scanSection: {
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: BOA_COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  orText: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginBottom: 16,
  },
  input: {
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: BOA_COLORS.dark,
    width: '100%',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  trackingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  trackingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginLeft: 8,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  locationText: {
    fontSize: 14,
    color: BOA_COLORS.dark,
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: BOA_COLORS.gray,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  eventTypesContainer: {
    marginBottom: 8,
  },
  eventTypeButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BOA_COLORS.lightGray,
    alignItems: 'center',
    marginRight: 8,
    minWidth: 100,
  },
  eventTypeButtonActive: {
    backgroundColor: BOA_COLORS.primary,
    borderColor: BOA_COLORS.primary,
  },
  eventTypeText: {
    fontSize: 12,
    color: BOA_COLORS.dark,
    marginTop: 4,
    textAlign: 'center',
  },
  eventTypeTextActive: {
    color: BOA_COLORS.white,
    fontWeight: 'bold',
  },
  previewCard: {
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 12,
    padding: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
  },
  previewValue: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: BOA_COLORS.lightGray,
  },
  primaryButton: {
    backgroundColor: BOA_COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 10,
  },
  primaryButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: BOA_COLORS.primary,
    flex: 1,
    marginRight: 10,
  },
  secondaryButtonText: {
    color: BOA_COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: BOA_COLORS.gray,
  },
  signatureModal: {
    backgroundColor: BOA_COLORS.white,
    borderRadius: 18,
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BOA_COLORS.lightGray,
    backgroundColor: BOA_COLORS.primary,
  },
  signatureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
    flex: 1,
  },
  signatureContainer: {
    padding: 20,
    height: 400,
  },
  signatureFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: BOA_COLORS.lightGray,
    alignItems: 'center',
  },
  signatureCancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: BOA_COLORS.primary,
  },
  signatureCancelText: {
    color: BOA_COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 8,
  },
}); 