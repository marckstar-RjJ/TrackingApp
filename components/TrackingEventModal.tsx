import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';
import { 
  TrackingPoint, 
  TrackingEvent, 
  TRACKING_POINTS, 
  AIRLINES,
  createTrackingEvent 
} from '../utils/tracking';

interface TrackingEventModalProps {
  visible: boolean;
  onClose: () => void;
  onEventCreated: (event: TrackingEvent) => void;
  trackingNumber: string;
  currentLocation?: string;
  operator: string;
  estimatedDelivery?: string;
}

export const TrackingEventModal: React.FC<TrackingEventModalProps> = ({
  visible,
  onClose,
  onEventCreated,
  trackingNumber,
  currentLocation,
  operator,
  estimatedDelivery,
}) => {
  const [selectedPoint, setSelectedPoint] = useState<TrackingPoint | null>(null);
  const [eventType, setEventType] = useState<TrackingEvent['eventType']>('arrival');
  const [description, setDescription] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [nextDestination, setNextDestination] = useState('');
  const [notes, setNotes] = useState('');

  const eventTypes = [
    { value: 'arrival', label: 'Llegada', icon: 'flight-land' },
    { value: 'departure', label: 'Salida', icon: 'flight-takeoff' },
    { value: 'processing', label: 'Procesamiento', icon: 'settings' },
    { value: 'customs_clearance', label: 'Aduana', icon: 'gavel' },
    { value: 'in_transit', label: 'En Tránsito', icon: 'local-shipping' },
    { value: 'delivered', label: 'Entregado', icon: 'check-circle' },
  ];

  const handleSubmit = () => {
    if (!selectedPoint) {
      Alert.alert('Error', 'Por favor selecciona un punto de control');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción del evento');
      return;
    }

    const event = createTrackingEvent(
      trackingNumber,
      selectedPoint.id,
      eventType,
      operator,
      description,
      flightNumber || undefined,
      selectedAirline || undefined,
      nextDestination || undefined,
      notes || undefined
    );

    onEventCreated(event);
    handleClose();
  };

  const handleClose = () => {
    setSelectedPoint(null);
    setEventType('arrival');
    setDescription('');
    setFlightNumber('');
    setSelectedAirline('');
    setNextDestination('');
    setNotes('');
    onClose();
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'arrival':
        return BOA_COLORS.success;
      case 'departure':
        return BOA_COLORS.warning;
      case 'processing':
        return BOA_COLORS.primary;
      case 'customs_clearance':
        return BOA_COLORS.danger;
      case 'in_transit':
        return BOA_COLORS.secondary;
      case 'delivered':
        return BOA_COLORS.success;
      default:
        return BOA_COLORS.gray;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Registrar Evento de Tracking</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Información del paquete */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información del Paquete</Text>
              <View style={styles.infoRow}>
                <MaterialIcons name="local-shipping" size={16} color={BOA_COLORS.primary} />
                <Text style={styles.infoText}>Tracking: {trackingNumber}</Text>
              </View>
              {currentLocation && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="location-on" size={16} color={BOA_COLORS.primary} />
                  <Text style={styles.infoText}>Ubicación actual: {currentLocation}</Text>
                </View>
              )}
              {estimatedDelivery && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="schedule" size={16} color={BOA_COLORS.primary} />
                  <Text style={styles.infoText}>Entrega estimada: {estimatedDelivery}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <MaterialIcons name="person" size={16} color={BOA_COLORS.primary} />
                <Text style={styles.infoText}>Operador: {operator}</Text>
              </View>
            </View>

            {/* Punto de control */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Punto de Control *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pointsContainer}>
                {TRACKING_POINTS.map((point) => (
                  <TouchableOpacity
                    key={point.id}
                    style={[
                      styles.pointButton,
                      selectedPoint?.id === point.id && styles.pointButtonActive
                    ]}
                    onPress={() => setSelectedPoint(point)}
                  >
                    <MaterialIcons 
                      name={point.type === 'airport' ? 'flight' : 'warehouse'} 
                      size={16} 
                      color={selectedPoint?.id === point.id ? BOA_COLORS.white : BOA_COLORS.primary} 
                    />
                    <Text style={[
                      styles.pointButtonText,
                      selectedPoint?.id === point.id && styles.pointButtonTextActive
                    ]}>
                      {point.location}
                    </Text>
                    <Text style={[
                      styles.pointButtonSubtext,
                      selectedPoint?.id === point.id && styles.pointButtonTextActive
                    ]}>
                      {point.country}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Tipo de evento */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tipo de Evento *</Text>
              <View style={styles.eventTypesContainer}>
                {eventTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.eventTypeButton,
                      eventType === type.value && styles.eventTypeButtonActive
                    ]}
                    onPress={() => setEventType(type.value as TrackingEvent['eventType'])}
                  >
                    <MaterialIcons 
                      name={type.icon as any} 
                      size={20} 
                      color={eventType === type.value ? BOA_COLORS.white : getEventTypeColor(type.value)} 
                    />
                    <Text style={[
                      styles.eventTypeText,
                      eventType === type.value && styles.eventTypeTextActive
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Descripción */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe el evento (ej: Paquete llegó al aeropuerto, procesado para embarque)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                placeholderTextColor={BOA_COLORS.gray}
              />
            </View>

            {/* Información de vuelo (solo para aeropuertos) */}
            {selectedPoint?.type === 'airport' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información de Vuelo</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Número de vuelo (ej: BOA-123)"
                  value={flightNumber}
                  onChangeText={setFlightNumber}
                  placeholderTextColor={BOA_COLORS.gray}
                />

                <Text style={styles.inputLabel}>Aerolínea:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.airlinesContainer}>
                  {AIRLINES.map((airline) => (
                    <TouchableOpacity
                      key={airline.code}
                      style={[
                        styles.airlineButton,
                        selectedAirline === airline.code && styles.airlineButtonActive
                      ]}
                      onPress={() => setSelectedAirline(airline.code)}
                    >
                      <Text style={[
                        styles.airlineButtonText,
                        selectedAirline === airline.code && styles.airlineButtonTextActive
                      ]}>
                        {airline.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TextInput
                  style={styles.input}
                  placeholder="Próximo destino"
                  value={nextDestination}
                  onChangeText={setNextDestination}
                  placeholderTextColor={BOA_COLORS.gray}
                />
              </View>
            )}

            {/* Notas adicionales */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notas Adicionales</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Información adicional, observaciones, etc."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
                placeholderTextColor={BOA_COLORS.gray}
              />
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <MaterialIcons name="save" size={16} color={BOA_COLORS.white} />
              <Text style={styles.submitButtonText}>Registrar Evento</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BOA_COLORS.dark,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginLeft: 8,
  },
  pointsContainer: {
    marginBottom: 10,
  },
  pointButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOA_COLORS.primary,
    alignItems: 'center',
    minWidth: 80,
  },
  pointButtonActive: {
    backgroundColor: BOA_COLORS.primary,
  },
  pointButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: BOA_COLORS.primary,
    marginTop: 4,
  },
  pointButtonTextActive: {
    color: BOA_COLORS.white,
  },
  pointButtonSubtext: {
    fontSize: 10,
    color: BOA_COLORS.gray,
  },
  eventTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOA_COLORS.lightGray,
    minWidth: '48%',
  },
  eventTypeButtonActive: {
    backgroundColor: BOA_COLORS.primary,
    borderColor: BOA_COLORS.primary,
  },
  eventTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: BOA_COLORS.dark,
    marginLeft: 8,
  },
  eventTypeTextActive: {
    color: BOA_COLORS.white,
  },
  input: {
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: BOA_COLORS.dark,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  airlinesContainer: {
    marginBottom: 10,
  },
  airlineButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BOA_COLORS.gray,
  },
  airlineButtonActive: {
    backgroundColor: BOA_COLORS.primary,
    borderColor: BOA_COLORS.primary,
  },
  airlineButtonText: {
    fontSize: 12,
    color: BOA_COLORS.gray,
  },
  airlineButtonTextActive: {
    color: BOA_COLORS.white,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: BOA_COLORS.lightGray,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOA_COLORS.gray,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: BOA_COLORS.gray,
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BOA_COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 