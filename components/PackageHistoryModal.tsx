import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';
import { TrackingEvent } from '../utils/tracking';

interface PackageHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  trackingNumber: string;
  events: TrackingEvent[];
  isAdmin: boolean;
  onEventUpdated: (eventId: string, updatedEvent: TrackingEvent) => void;
  onEventDeleted: (eventId: string) => void;
}

export const PackageHistoryModal: React.FC<PackageHistoryModalProps> = ({
  visible,
  onClose,
  trackingNumber,
  events,
  isAdmin,
  onEventUpdated,
  onEventDeleted,
}) => {
  const [editingEvent, setEditingEvent] = useState<TrackingEvent | null>(null);
  const [editLocation, setEditLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editOperator, setEditOperator] = useState('');

  const eventTypeLabels = {
    received: 'Recibido',
    classified: 'Clasificado',
    dispatched: 'Despachado',
    in_flight: 'En Vuelo',
    customs_clearance: 'Aduanas',
    out_for_delivery: 'En Entrega',
    delivered: 'Entregado',
    arrival: 'Llegada',
    departure: 'Salida',
    processing: 'Procesando',
    pending: 'Pendiente',
  };

  const eventTypeIcons = {
    received: 'inbox',
    classified: 'sort',
    dispatched: 'local-shipping',
    in_flight: 'flight',
    customs_clearance: 'gavel',
    out_for_delivery: 'delivery-dining',
    delivered: 'check-circle',
    arrival: 'flight-land',
    departure: 'flight-takeoff',
    processing: 'settings',
    pending: 'schedule',
  };

  const eventTypeColors = {
    received: '#4CAF50',
    classified: '#2196F3',
    dispatched: '#FF9800',
    in_flight: '#9C27B0',
    customs_clearance: '#F44336',
    out_for_delivery: '#FF5722',
    delivered: '#4CAF50',
    arrival: '#4CAF50',
    departure: '#FF9800',
    processing: '#2196F3',
    pending: '#757575',
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleEditEvent = (event: TrackingEvent) => {
    setEditingEvent(event);
    setEditLocation(event.pointName);
    setEditNotes(event.notes || '');
    setEditOperator(event.operator);
  };

  const handleSaveEdit = () => {
    if (!editingEvent) return;

    if (!editLocation.trim()) {
      Alert.alert('Error', 'La ubicación es obligatoria');
      return;
    }

    const updatedEvent: TrackingEvent = {
      ...editingEvent,
      pointName: editLocation.trim(),
      notes: editNotes.trim() || undefined,
      operator: editOperator.trim(),
    };

    onEventUpdated(editingEvent.id, updatedEvent);
    setEditingEvent(null);
    setEditLocation('');
    setEditNotes('');
    setEditOperator('');
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setEditLocation('');
    setEditNotes('');
    setEditOperator('');
  };

  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onEventDeleted(eventId) },
      ]
    );
  };

  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={BOA_COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial del Paquete</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Package Info */}
        <View style={styles.packageInfo}>
          <Text style={styles.trackingNumber}>{trackingNumber}</Text>
          <Text style={styles.eventCount}>
            {events.length} evento{events.length !== 1 ? 's' : ''} registrado{events.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Events Timeline */}
        <ScrollView style={styles.eventsContainer} showsVerticalScrollIndicator={false}>
          {sortedEvents.map((event, index) => (
            <View key={event.id} style={styles.eventItem}>
              {/* Timeline Line */}
              <View style={styles.timelineContainer}>
                <View style={[styles.timelineDot, { backgroundColor: eventTypeColors[event.eventType] }]}>
                  <MaterialIcons 
                    name={eventTypeIcons[event.eventType] as any} 
                    size={16} 
                    color={BOA_COLORS.white} 
                  />
                </View>
                {index < sortedEvents.length - 1 && <View style={styles.timelineLine} />}
              </View>

              {/* Event Content */}
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={[styles.eventType, { color: eventTypeColors[event.eventType] }]}>
                    {eventTypeLabels[event.eventType]}
                  </Text>
                  <Text style={styles.eventDate}>{formatDate(event.timestamp)}</Text>
                </View>

                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="location-on" size={16} color={BOA_COLORS.gray} />
                    <Text style={styles.detailText}>{event.pointName}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialIcons name="description" size={16} color={BOA_COLORS.gray} />
                    <Text style={styles.detailText}>{event.description}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <MaterialIcons name="person" size={16} color={BOA_COLORS.gray} />
                    <Text style={styles.detailText}>Operador: {event.operator}</Text>
                  </View>

                  {event.notes && (
                    <View style={styles.detailRow}>
                      <MaterialIcons name="note" size={16} color={BOA_COLORS.gray} />
                      <Text style={styles.detailText}>{event.notes}</Text>
                    </View>
                  )}

                  {event.flightNumber && (
                    <View style={styles.detailRow}>
                      <MaterialIcons name="flight" size={16} color={BOA_COLORS.gray} />
                      <Text style={styles.detailText}>
                        Vuelo: {event.flightNumber} | Aerolínea: {event.airline}
                      </Text>
                    </View>
                  )}

                  {event.nextDestination && (
                    <View style={styles.detailRow}>
                      <MaterialIcons name="arrow-forward" size={16} color={BOA_COLORS.gray} />
                      <Text style={styles.detailText}>Próximo destino: {event.nextDestination}</Text>
                    </View>
                  )}

                  {event.coordinates && (
                    <View style={styles.detailRow}>
                      <MaterialIcons name="gps-fixed" size={16} color={BOA_COLORS.gray} />
                      <Text style={styles.detailText}>
                        {event.coordinates.latitude.toFixed(4)}, {event.coordinates.longitude.toFixed(4)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Admin Actions */}
                {isAdmin && (
                  <View style={styles.adminActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleEditEvent(event)}
                    >
                      <MaterialIcons name="edit" size={16} color={BOA_COLORS.primary} />
                      <Text style={styles.actionText}>Editar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteEvent(event.id)}
                    >
                      <MaterialIcons name="delete" size={16} color={BOA_COLORS.danger} />
                      <Text style={[styles.actionText, { color: BOA_COLORS.danger }]}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Edit Modal */}
        {editingEvent && (
          <View style={styles.editOverlay}>
            <View style={styles.editModal}>
              <Text style={styles.editTitle}>Editar Evento</Text>
              
              <Text style={styles.editLabel}>Ubicación *</Text>
              <TextInput
                style={styles.editInput}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="Ingrese la ubicación"
              />

              <Text style={styles.editLabel}>Operador</Text>
              <TextInput
                style={styles.editInput}
                value={editOperator}
                onChangeText={setEditOperator}
                placeholder="Ingrese el operador"
              />

              <Text style={styles.editLabel}>Notas</Text>
              <TextInput
                style={[styles.editInput, styles.notesInput]}
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Notas adicionales (opcional)"
                multiline
                numberOfLines={3}
              />

              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOA_COLORS.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BOA_COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  packageInfo: {
    padding: 20,
    backgroundColor: BOA_COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: BOA_COLORS.lightGray,
  },
  trackingNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 5,
  },
  eventCount: {
    fontSize: 14,
    color: BOA_COLORS.gray,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventItem: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    height: 60,
    backgroundColor: BOA_COLORS.lightGray,
    marginTop: 5,
  },
  eventContent: {
    flex: 1,
    backgroundColor: BOA_COLORS.white,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 12,
    color: BOA_COLORS.gray,
  },
  eventDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: BOA_COLORS.dark,
    marginLeft: 8,
    flex: 1,
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: BOA_COLORS.lightGray,
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
    borderRadius: 6,
    backgroundColor: BOA_COLORS.light,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 12,
    color: BOA_COLORS.primary,
    marginLeft: 4,
  },
  editOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModal: {
    backgroundColor: BOA_COLORS.white,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BOA_COLORS.dark,
    marginBottom: 5,
  },
  editInput: {
    borderWidth: 1,
    borderColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 15,
    backgroundColor: BOA_COLORS.white,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOA_COLORS.gray,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: BOA_COLORS.gray,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: BOA_COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: BOA_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
}); 