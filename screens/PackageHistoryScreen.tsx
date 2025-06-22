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
    console.log('handleEditEvent llamado con:', event);
    setEditingEvent(event);
    setEditEventType(event.event_type || 'received');
    setEditLocation(event.location || event.pointName || '');
    setEditNotes(event.notes || '');
    setEditOperator(event.operator || '');
    setEditCoordinates(event.coordinates || null);
  };

  const handleSaveEdit = async () => {
    console.log('handleSaveEdit llamado');
    if (!editingEvent) {
      console.log('No hay editingEvent');
      return;
    }

    if (!editLocation.trim()) {
      Alert.alert('Error', 'Debes obtener la ubicación actual antes de guardar.');
      return;
    }

    const updatedEvent: any = {
      ...editingEvent,
      event_type: editEventType,
      location: editLocation.trim(),
      notes: editNotes.trim() || undefined,
      operator: currentUser?.name || '',
      coordinates: editCoordinates,
    };

    console.log('Enviando evento editado:', updatedEvent);

    try {
      const res = await fetch(`http://192.168.100.16:3000/api/packages/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
      const responseText = await res.text();
      console.log('Respuesta del servidor:', res.status, responseText);
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
        console.error('Error al actualizar evento:', responseText);
        Alert.alert('Error', `No se pudo actualizar el evento.\n${responseText}`);
      }
    } catch (e: any) {
      console.error('Error de red al actualizar evento:', e);
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
    console.log('handleDeleteEvent llamado con eventId:', eventId);
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: async () => {
            console.log('Confirmando eliminación del evento:', eventId);
            try {
              const res = await fetch(`http://192.168.100.16:3000/api/packages/events/${eventId}`, { method: 'DELETE' });
              console.log('Respuesta de eliminación:', res.status);
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
                const errorText = await res.text();
                console.error('Error al eliminar evento:', errorText);
                Alert.alert('Error', `No se pudo eliminar el evento.\n${errorText}`);
              }
            } catch (e: any) {
              console.error('Error de red al eliminar evento:', e);
              Alert.alert('Error', 'No se pudo conectar con el servidor.');
            }
          }
        },
      ]
    );
  };

  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Función para determinar si un evento se puede editar/eliminar
  const canEditEvent = (event: TrackingEvent) => {
    if (!isAdmin(currentUser)) return false;
    
    // Solo el evento más reciente se puede editar
    return sortedEvents.length > 0 && event.id === sortedEvents[0].id;
  };

  // Función para obtener el estado visual de los botones
  const getButtonStyle = (event: TrackingEvent, isEdit: boolean = true) => {
    const canEdit = canEditEvent(event);
    if (canEdit) {
      return {}; // No aplicar estilos adicionales si se puede editar
    } else {
      return {
        opacity: 0.3,
        backgroundColor: BOA_COLORS.lightGray,
      };
    }
  };

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

  // Si no hay eventos, muestro un mensaje
  if (!Array.isArray(events) || events.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary, justifyContent: 'center', alignItems: 'center' }]}> 
        <ImageBackground
          source={require('../assets/fondo_mobile.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={60} color={BOA_COLORS.lightGray} />
            <Text style={styles.emptyText}>No hay eventos de historial para este paquete.</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}>
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {/* Información para administradores */}
          {isAdmin(currentUser) && (
            <View style={styles.adminInfo}>
              <MaterialIcons name="info" size={28} color={BOA_COLORS.white} style={{ marginRight: 10, alignSelf: 'center' }} />
              <Text style={[styles.adminInfoText, { color: '#fff', fontWeight: 'bold' }]}>
                Solo el último evento registrado se puede editar o eliminar para mantener la integridad del historial.
              </Text>
            </View>
          )}
          
          <View style={styles.timeline}>
            {sortedEvents.map((event: TrackingEventWithLocation, index: number) => (
              <View key={event.id} style={styles.eventItem}>
                <View style={styles.eventHeader}>
                  <MaterialIcons name={eventTypeIcons[event.event_type] as any || 'info'} size={24} color={eventTypeColors[event.event_type] || BOA_COLORS.primary} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.eventType}>{eventTypeLabels[event.event_type] || event.event_type}</Text>
                    {index === 0 && (
                      <Text style={{ fontSize: 12, color: BOA_COLORS.success, fontWeight: 'bold' }}>
                        ⭐ Último evento - Se puede editar
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.eventDetails}>
                  <View style={styles.eventRow}>
                    <MaterialIcons name="location-on" size={18} color={BOA_COLORS.primary} />
                    <Text style={styles.eventLabel}>Ubicación:</Text>
                    <Text style={styles.eventValue}>{event.location ? event.location : event.pointName}</Text>
                </View>
                  <View style={styles.eventRow}>
                    <MaterialIcons name="person" size={18} color={BOA_COLORS.primary} />
                    <Text style={styles.eventLabel}>Operador:</Text>
                    <Text style={styles.eventValue}>{event.operator}</Text>
                      </View>
                  <View style={styles.eventRow}>
                    <MaterialIcons name="schedule" size={18} color={BOA_COLORS.primary} />
                    <Text style={styles.eventLabel}>Fecha/Hora:</Text>
                    <Text style={styles.eventValue}>{event.timestamp ? formatDate(event.timestamp) : 'No disponible'}</Text>
                  </View>
                    {event.notes && (
                    <View style={styles.eventRow}>
                        <MaterialIcons name="note" size={18} color={BOA_COLORS.primary} />
                      <Text style={styles.eventLabel}>Notas:</Text>
                      <Text style={styles.eventValue}>{event.notes}</Text>
                      </View>
                    )}
                </View>
                  {canEditEvent(event) && (
                    <View style={styles.adminActions}>
                      <TouchableOpacity 
                        style={[styles.editButton, getButtonStyle(event, true)]} 
                        onPress={() => handleEditEvent(event)}
                      >
                        <MaterialIcons name="edit" size={16} color={BOA_COLORS.primary} />
                        <Text style={styles.editButtonText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.deleteButton, getButtonStyle(event, false)]} 
                        onPress={() => handleDeleteEvent(event.id)}
                      >
                        <MaterialIcons name="delete" size={16} color={BOA_COLORS.white} />
                        <Text style={[styles.deleteButtonText, { color: BOA_COLORS.white }]}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {isAdmin(currentUser) && !canEditEvent(event) && (
                    <View style={styles.adminActions}>
                      <Text style={{ fontSize: 12, color: BOA_COLORS.gray, fontStyle: 'italic', textAlign: 'center', flex: 1 }}>
                        🔒 Solo el último evento se puede editar/eliminar
                      </Text>
                    </View>
                  )}
                </View>
            ))}
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
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: BOA_COLORS.lightGray,
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: BOA_COLORS.primary,
  },
  backButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  timeline: {
    marginBottom: 20,
  },
  eventItem: {
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
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginLeft: 8,
  },
  eventDetails: {
    marginLeft: 32,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventLabel: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    fontWeight: 'bold',
    marginLeft: 6,
    minWidth: 80,
  },
  eventValue: {
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: BOA_COLORS.light,
  },
  editButtonText: {
    fontSize: 12,
    color: BOA_COLORS.primary,
    marginLeft: 6,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: BOA_COLORS.danger,
  },
  deleteButtonText: {
    fontSize: 12,
    color: BOA_COLORS.white,
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
  adminInfo: {
    backgroundColor: 'rgba(25,118,210,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminInfoText: {
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
}); 