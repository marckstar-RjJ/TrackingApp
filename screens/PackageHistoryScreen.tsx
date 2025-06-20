import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ImageBackground, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BOA_COLORS } from '../theme';
import { TrackingEvent } from '../utils/tracking';
import { User, isAdmin } from '../utils/auth';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

interface PackageHistoryScreenProps {
  navigation: any;
  route: any;
}

type TrackingEventWithLocation = TrackingEvent & { location?: string };

export const PackageHistoryScreen: React.FC<PackageHistoryScreenProps> = ({ navigation, route }) => {
  // Validación y valores por defecto
  const params = route?.params || {};
  const trackingNumber = params.trackingNumber || 'N/A';
  const currentUser = params.currentUser || null;

  const [editingEvent, setEditingEvent] = useState<TrackingEvent | null>(null);
  const [editLocation, setEditLocation] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editOperator, setEditOperator] = useState('');
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [editEventType, setEditEventType] = useState('received');
  const [editCoordinates, setEditCoordinates] = useState<{latitude: number, longitude: number} | null>(null);

  const eventTypeLabels: Record<string, string> = {
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

  const eventTypeIcons: Record<string, string> = {
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

  const eventTypeColors: Record<string, string> = {
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

  const handleSaveEdit = async () => {
    if (!editingEvent) return;

    if (!editLocation.trim()) {
      Alert.alert('Error', 'Debes obtener la ubicación actual antes de guardar.');
      return;
    }

    const updatedEvent: any = {
      ...editingEvent,
      eventType: editEventType,
      location: editLocation.trim(),
      notes: editNotes.trim() || undefined,
      operator: currentUser?.name || '',
      coordinates: editCoordinates,
    };

    try {
      const res = await fetch(`http://192.168.100.16:3000/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
      if (res.ok) {
    Alert.alert('Evento actualizado', 'El evento fue actualizado correctamente.');
        // Refrescar eventos
        const refreshed = await fetch(`http://192.168.100.16:3000/api/packages/tracking/${trackingNumber}`);
        const data = await refreshed.json();
        if (data && Array.isArray(data.events)) {
          const events = data.events.map((ev: any) => ({
            ...ev,
            timestamp: ev.timestamp ? new Date(ev.timestamp.replace(' ', 'T')) : null
          }));
          setEvents(events);
        } else {
          setEvents([]);
        }
      } else {
        Alert.alert('Error', 'No se pudo actualizar el evento.');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
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
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const res = await fetch(`http://192.168.100.16:3000/api/events/${eventId}`, { method: 'DELETE' });
              if (res.ok) {
            Alert.alert('Evento eliminado', 'El evento fue eliminado correctamente.');
                // Refrescar eventos
                const refreshed = await fetch(`http://192.168.100.16:3000/api/packages/tracking/${trackingNumber}`);
                const data = await refreshed.json();
                if (data && Array.isArray(data.events)) {
                  const events = data.events.map((ev: any) => ({
                    ...ev,
                    timestamp: ev.timestamp ? new Date(ev.timestamp.replace(' ', 'T')) : null
                  }));
                  setEvents(events);
                } else {
                  setEvents([]);
                }
              } else {
                Alert.alert('Error', 'No se pudo eliminar el evento.');
              }
            } catch (e) {
              Alert.alert('Error', 'No se pudo conectar con el servidor.');
            }
          }
        },
      ]
    );
  };

  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`http://192.168.100.16:3000/api/packages/tracking/${trackingNumber}`);
        const data = await res.json();
        if (data && Array.isArray(data.events)) {
          // Convertir timestamp a Date
          const events = data.events.map((ev: any) => ({
            ...ev,
            timestamp: ev.timestamp ? new Date(ev.timestamp.replace(' ', 'T')) : null
          }));
          setEvents(events);
        } else {
          setEvents([]);
        }
      } catch (e) {
        setEvents([]);
      }
    };
    if (trackingNumber && trackingNumber !== 'N/A') {
      fetchEvents();
    }
  }, [trackingNumber]);

  // Lógica para obtener ubicación actual
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos de ubicación para registrar la localización del evento.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setEditCoordinates({ latitude, longitude });
      // Obtener dirección a partir de coordenadas
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address.length > 0) {
        const addr = address[0];
        const locationString = `${addr.city || ''} ${addr.region || ''} ${addr.country || ''}`.trim();
        setEditLocation(locationString || 'Ubicación actual');
      } else {
        setEditLocation('Ubicación actual');
      }
    } catch (error) {
      setEditLocation('Ubicación no disponible');
    }
  };

  // Al abrir modal de edición, inicializar tipo de evento y coordenadas, y dejar ubicación vacía
  useEffect(() => {
    if (editingEvent) {
      setEditEventType(editingEvent.eventType || 'received');
      setEditCoordinates(editingEvent.coordinates || null);
      setEditLocation(''); // Siempre vacío al abrir
    }
  }, [editingEvent]);

  // Si no hay eventos, muestro un mensaje
  if (!Array.isArray(events) || events.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}> 
        <ImageBackground
          source={require('../assets/fondo_mobile.png')}
          style={styles.container}
          resizeMode="cover"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={BOA_COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Historial del Paquete</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: BOA_COLORS.white, fontSize: 18, textAlign: 'center' }}>
              No hay eventos registrados para este paquete.
            </Text>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}>
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={BOA_COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial del Paquete</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Package Info Card */}
          <View style={styles.packageInfoCard}>
            <View style={styles.packageHeader}>
              <MaterialIcons name="local-shipping" size={32} color={BOA_COLORS.primary} />
              <View style={styles.packageDetails}>
                <Text style={styles.trackingNumber}>{trackingNumber}</Text>
                <Text style={styles.eventCount}>
                  {events.length} evento{events.length !== 1 ? 's' : ''} registrado{events.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timelineContainer}>
            <Text style={styles.sectionTitle}>Cronología de Eventos</Text>
            {(sortedEvents as TrackingEventWithLocation[]).map((event, index) => {
              const isLast = index === 0; // El primer evento en sortedEvents es el más reciente
              return (
                <View key={event.id} style={styles.previewCard}>
                  <View style={styles.previewRow}>
                    <MaterialIcons name="event" size={18} color={BOA_COLORS.primary} />
                    <Text style={styles.previewLabel}>Evento:</Text>
                    <Text style={styles.previewValue}>{eventTypeLabels[event.eventType] || event.eventType}</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <MaterialIcons name="location-on" size={18} color={BOA_COLORS.primary} />
                    <Text style={styles.previewLabel}>Ubicación:</Text>
                    <Text style={styles.previewValue}>{event.location ? event.location : event.pointName}</Text>
                </View>
                  <View style={styles.previewRow}>
                    <MaterialIcons name="person" size={18} color={BOA_COLORS.primary} />
                    <Text style={styles.previewLabel}>Operador:</Text>
                    <Text style={styles.previewValue}>{event.operator}</Text>
                      </View>
                  <View style={styles.previewRow}>
                    <MaterialIcons name="schedule" size={18} color={BOA_COLORS.primary} />
                    <Text style={styles.previewLabel}>Fecha/Hora:</Text>
                    <Text style={styles.previewValue}>{event.timestamp ? formatDate(event.timestamp) : 'No disponible'}</Text>
                  </View>
                    {event.notes && (
                    <View style={styles.previewRow}>
                        <MaterialIcons name="note" size={18} color={BOA_COLORS.primary} />
                      <Text style={styles.previewLabel}>Notas:</Text>
                      <Text style={styles.previewValue}>{event.notes}</Text>
                      </View>
                    )}
                  {isAdmin(currentUser) && (
                    <View style={styles.adminActions}>
                      <TouchableOpacity 
                        style={[styles.actionButton, !isLast && { opacity: 0.4 }]}
                        onPress={() => isLast && handleEditEvent(event)}
                        disabled={!isLast}
                      >
                        <MaterialIcons name="edit" size={16} color={BOA_COLORS.primary} />
                        <Text style={styles.actionText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton, !isLast && { opacity: 0.4 }]}
                        onPress={() => isLast && handleDeleteEvent(event.id)}
                        disabled={!isLast}
                      >
                        <MaterialIcons name="delete" size={16} color={BOA_COLORS.danger} />
                        <Text style={[styles.actionText, { color: BOA_COLORS.danger }]}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Edit Modal */}
        {editingEvent && (
          <View style={styles.editOverlay}>
            <View style={styles.editModal}>
              <View style={styles.editHeader}>
                <Text style={styles.editTitle}>Editar Evento</Text>
                <TouchableOpacity onPress={handleCancelEdit}>
                  <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
                </TouchableOpacity>
              </View>
              
              {/* Tipo de evento */}
              <Text style={styles.editLabel}>Tipo de Evento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                {Object.keys(eventTypeLabels).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={{
                      backgroundColor: editEventType === type ? BOA_COLORS.primary : BOA_COLORS.lightGray,
                      borderRadius: 16,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      marginRight: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderWidth: editEventType === type ? 2 : 1,
                      borderColor: editEventType === type ? BOA_COLORS.primary : BOA_COLORS.lightGray,
                    }}
                    onPress={() => setEditEventType(type)}
                  >
                    <MaterialIcons 
                      name={eventTypeIcons[type] as any || 'info'} 
                      size={18} 
                      color={editEventType === type ? '#fff' : BOA_COLORS.primary} 
                      style={{ marginRight: 6 }}
                    />
                    <Text style={{ color: editEventType === type ? '#fff' : BOA_COLORS.primary, fontWeight: 'bold' }}>{eventTypeLabels[type]}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Ubicación con botón */}
              <Text style={styles.editLabel}>Ubicación *</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TextInput
                  style={[styles.editInput, { flex: 1 }]}
                value={editLocation}
                  editable={false}
                  placeholder="Ubicación del evento (obligatorio)"
                  multiline
                />
                <TouchableOpacity onPress={getCurrentLocation} style={{ marginLeft: 8 }}>
                  <MaterialIcons name="my-location" size={24} color={BOA_COLORS.primary} />
                </TouchableOpacity>
              </View>
              {editCoordinates && (
                <Text style={{ fontSize: 12, color: BOA_COLORS.gray, marginBottom: 8 }}>
                  Coordenadas: {editCoordinates.latitude.toFixed(6)}, {editCoordinates.longitude.toFixed(6)}
                </Text>
              )}

              {/* Operador */}
              <Text style={styles.editLabel}>Operador</Text>
              <TextInput
                style={styles.editInput}
                value={currentUser?.name || ''}
                editable={false}
                placeholder="Nombre del operador"
              />

              {/* Notas */}
              <Text style={styles.editLabel}>Notas</Text>
              <TextInput
                style={[styles.editInput, styles.notesInput]}
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Notas adicionales (opcional)"
                multiline
                numberOfLines={3}
              />

              {/* Fecha/hora solo lectura */}
              <Text style={styles.editLabel}>Fecha/Hora</Text>
              <Text style={{ fontSize: 14, color: BOA_COLORS.gray, marginBottom: 12 }}>{editingEvent.timestamp ? formatDate(editingEvent.timestamp) : 'No disponible'}</Text>

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
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BOA_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
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
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  packageInfoCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageDetails: {
    marginLeft: 15,
    flex: 1,
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
  timelineContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    fontWeight: 'bold',
    marginLeft: 6,
    minWidth: 80,
  },
  previewValue: {
    fontSize: 14,
    color: BOA_COLORS.dark,
    marginLeft: 4,
    flex: 1,
    textAlign: 'right',
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: BOA_COLORS.lightGray,
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: BOA_COLORS.light,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 12,
    color: BOA_COLORS.primary,
    marginLeft: 6,
    fontWeight: '600',
  },
  editOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editModal: {
    backgroundColor: BOA_COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BOA_COLORS.dark,
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: BOA_COLORS.lightGray,
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    marginBottom: 20,
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
    paddingVertical: 14,
    marginRight: 10,
    borderRadius: 12,
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
    paddingVertical: 14,
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: BOA_COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: BOA_COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
}); 