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
import { BACKEND_URL } from '../utils/backend';

interface TrackingEvent {
  id: string;
  event_type: 'received' | 'classified' | 'dispatched' | 'in_flight' | 'delivered' | 'customs_clearance' | 'out_for_delivery';
  location: string;
  timestamp: Date;
  operator: string;
  notes?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface TrackingEventModalProps {
  visible: boolean;
  onClose: () => void;
  onEventCreated: (event: TrackingEvent) => void;
  trackingNumber: string;
  operator: string;
  currentLocation?: string;
}

export const TrackingEventModal: React.FC<TrackingEventModalProps> = ({
  visible,
  onClose,
  onEventCreated,
  trackingNumber,
  operator: initialOperator,
  currentLocation: initialLocation,
}) => {
  const [currentLocation, setCurrentLocation] = useState<string>(initialLocation || '');
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<TrackingEvent['event_type']>('received');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipientCI, setRecipientCI] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [operator, setOperator] = useState(initialOperator);

  // Debug: verificar el valor del trackingNumber
  console.log('TrackingEventModal - trackingNumber:', trackingNumber);

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
      setCurrentLocation(initialLocation || '');
      setCoordinates(null);
      setSelectedEventType('received');
      setNotes('');
      setRecipientCI('');
      setSignature(null);
      if (!initialLocation) {
        getCurrentLocation();
      }
    } else {
      // Limpiar todos los datos cuando el modal se cierra
      setCurrentLocation('');
      setCoordinates(null);
      setSelectedEventType('received');
      setNotes('');
      setRecipientCI('');
      setSignature(null);
    }
  }, [visible, initialLocation]);

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

  const handleSignatureOK = (sig: string) => {
    setSignature(sig);
    setShowSignature(false);
    Alert.alert('Firma Guardada', 'La firma digital ha sido capturada exitosamente.');
  };

  const validateForm = (): boolean => {
    if (!currentLocation.trim()) {
      Alert.alert('Error', 'No se pudo obtener la ubicación. Por favor, intenta de nuevo.');
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
    if (!validateForm()) return;
    
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
              timestamp: new Date().toISOString(), // Enviar timestamp desde frontend
            };
            try {
              const res = await fetch(`${BACKEND_URL}/packages/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
              });
              const data = await res.json();
              if (res.ok) {
                Alert.alert('Éxito', 'Evento registrado correctamente.');
                // Limpiar y cerrar
                setCurrentLocation('');
                setCoordinates(null);
                setNotes('');
                setSelectedEventType('received');
                setRecipientCI('');
                setSignature(null);
                setIsLoading(false);
                onClose();
                // Crear evento local para callback
                const event: TrackingEvent = {
                  id: Date.now().toString(),
                  event_type: selectedEventType,
                  location: currentLocation,
                  timestamp: new Date(),
                  operator: operator,
                  notes: notes || undefined,
                  coordinates: coordinates || undefined,
                };
                onEventCreated(event);
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

  const getEventTypeInfo = (type: TrackingEvent['event_type']) => {
    return eventTypes.find(et => et.value === type) || eventTypes[0];
  };

  const handleClose = () => {
    // Limpiar todos los datos antes de cerrar
    setCurrentLocation('');
    setCoordinates(null);
    setSelectedEventType('received');
    setNotes('');
    setRecipientCI('');
    setSignature(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Nuevo Evento</Text>
            <Pressable style={styles.close} onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Sección de Información del Paquete */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información del Paquete</Text>
              
              <View style={styles.trackingPreview}>
                <MaterialIcons name="local-shipping" size={20} color={BOA_COLORS.primary} />
                <Text style={styles.trackingText}>
                  {trackingNumber || 'Número de tracking no disponible'}
                </Text>
              </View>

              <View style={styles.operatorInfo}>
                <MaterialIcons name="person" size={16} color={BOA_COLORS.gray} />
                <Text style={styles.operatorText}>Operador: {operator}</Text>
              </View>
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
                    onPress={() => setSelectedEventType(eventType.value as TrackingEvent['event_type'])}
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vista Previa del Evento</Text>
              
              <View style={styles.previewCard}>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Paquete:</Text>
                  <Text style={styles.previewValue}>{trackingNumber || 'Número de tracking no disponible'}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Evento:</Text>
                  <Text style={styles.previewValue}>{getEventTypeInfo(selectedEventType).label}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Ubicación:</Text>
                  <Text style={styles.previewValue}>{currentLocation || 'No especificada'}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Operador:</Text>
                  <Text style={styles.previewValue}>{operator}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Fecha/Hora:</Text>
                  <Text style={styles.previewValue}>{new Date().toLocaleString()}</Text>
                </View>
                {notes && (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Notas:</Text>
                    <Text style={styles.previewValue}>{notes}</Text>
                  </View>
                )}
                {selectedEventType === 'delivered' && recipientCI && (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>CI Destinatario:</Text>
                    <Text style={styles.previewValue}>{recipientCI}</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Botón de Registro */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegisterEvent}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.registerButtonText}>Registrando...</Text>
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color={BOA_COLORS.white} />
                  <Text style={styles.registerButtonText}>Registrar Evento</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal de Firma */}
      {showSignature && (
        <Modal visible={showSignature} animationType="slide" transparent>
          <View style={styles.signatureOverlay}>
            <View style={styles.signatureModal}>
              <View style={styles.signatureHeader}>
                <Text style={styles.signatureTitle}>Capturar Firma</Text>
                <TouchableOpacity onPress={() => setShowSignature(false)}>
                  <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
                </TouchableOpacity>
              </View>
              <View style={styles.signatureContainer}>
                <Signature
                  onOK={handleSignatureOK}
                  onEmpty={() => Alert.alert('Firma vacía', 'Por favor, dibuja una firma.')}
                  descriptionText="Firma del destinatario"
                  clearText="Limpiar"
                  confirmText="Guardar"
                  webStyle={`
                    .m-signature-pad {
                      margin: 0;
                      box-shadow: none;
                      border: 1px solid #e0e0e0;
                      border-radius: 8px;
                    }
                    .m-signature-pad--body {
                      border: none;
                    }
                    .m-signature-pad--footer {
                      display: flex !important;
                      justify-content: space-between;
                      padding: 10px;
                      background-color: #f5f5f5;
                    }
                    .m-signature-pad--footer .button {
                      background-color: #007AFF;
                      color: white;
                      border: none;
                      padding: 8px 16px;
                      border-radius: 6px;
                      font-size: 14px;
                      font-weight: 500;
                      cursor: pointer;
                    }
                    .m-signature-pad--footer .button.clear {
                      background-color: #FF3B30;
                    }
                    .m-signature-pad--footer .button:hover {
                      opacity: 0.8;
                    }
                  `}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: BOA_COLORS.white,
    borderRadius: 16,
    elevation: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
  },
  close: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BOA_COLORS.dark,
    marginBottom: 12,
  },
  trackingPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BOA_COLORS.light,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  trackingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginLeft: 8,
  },
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorText: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: BOA_COLORS.lightGray,
  },
  coordinatesText: {
    fontSize: 12,
    color: BOA_COLORS.gray,
    fontStyle: 'italic',
  },
  eventTypesContainer: {
    marginBottom: 8,
  },
  eventTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOA_COLORS.lightGray,
    backgroundColor: BOA_COLORS.white,
  },
  eventTypeButtonActive: {
    backgroundColor: BOA_COLORS.primary,
    borderColor: BOA_COLORS.primary,
  },
  eventTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: BOA_COLORS.primary,
    marginLeft: 6,
  },
  eventTypeTextActive: {
    color: BOA_COLORS.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  scanButton: {
    backgroundColor: BOA_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  scanButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  previewCard: {
    backgroundColor: BOA_COLORS.light,
    borderRadius: 8,
    padding: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: BOA_COLORS.gray,
  },
  previewValue: {
    fontSize: 14,
    color: BOA_COLORS.dark,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: BOA_COLORS.lightGray,
  },
  registerButton: {
    backgroundColor: BOA_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  registerButtonDisabled: {
    backgroundColor: BOA_COLORS.gray,
  },
  registerButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  signatureOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureModal: {
    width: '90%',
    height: '70%',
    backgroundColor: BOA_COLORS.white,
    borderRadius: 16,
    elevation: 10,
  },
  signatureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BOA_COLORS.lightGray,
  },
  signatureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
  },
  signatureContainer: {
    flex: 1,
    padding: 20,
  },
}); 