import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';

// URL de la API
const API_URL = 'http://192.168.100.16:3000/api';

interface PreRegistration {
  id: number;
  trackingNumber: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_email: string;
  weight: number;
  cargo_type: string;
  origin_city: string;
  destination_city: string;
  description: string;
  priority: string;
  shipping_type: string;
  cost: number;
  estimated_delivery_date: string;
  user_email: string;
  status?: string;
  approved_at?: string;
  approved_tracking_number?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  preregistration: PreRegistration | null;
  onUpdate: () => void;
}

export const PreRegistrationDetailModal = ({ visible, onClose, preregistration, onUpdate }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    sender_name: '',
    sender_email: '',
    sender_has_email: false,
    recipient_name: '',
    recipient_email: '',
    recipient_has_email: false,
    weight: '',
  });

  // Calcular costo basado en peso
  const calculateCost = (weight: number) => {
    if (weight <= 1) return 15;
    if (weight <= 3) return 25;
    if (weight <= 5) return 35;
    if (weight <= 10) return 50;
    return 50 + (Math.ceil(weight - 10) * 5);
  };

  // Calcular fecha de entrega (3 días hábiles)
  const calculateDeliveryDate = () => {
    const today = new Date();
    let deliveryDate = new Date(today);
    let businessDays = 0;
    
    while (businessDays < 3) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        businessDays++;
      }
    }
    
    return deliveryDate;
  };

  React.useEffect(() => {
    if (preregistration) {
      setEditData({
        sender_name: preregistration.sender_name,
        sender_email: preregistration.sender_email || '',
        sender_has_email: !!preregistration.sender_email,
        recipient_name: preregistration.recipient_name,
        recipient_email: preregistration.recipient_email || '',
        recipient_has_email: !!preregistration.recipient_email,
        weight: preregistration.weight.toString(),
      });
      setIsEditing(false); // Resetear el estado de edición cuando cambia el preregistration
    }
  }, [preregistration]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!preregistration) return;

    setIsLoading(true);
    
    const requestData = {
      sender_name: editData.sender_name,
      sender_email: editData.sender_has_email ? editData.sender_email : null,
      recipient_name: editData.recipient_name,
      recipient_email: editData.recipient_has_email ? editData.recipient_email : null,
      weight: parseFloat(editData.weight),
    };

    console.log('📤 Enviando datos al backend:', requestData);
    console.log('📤 URL:', `${API_URL}/preregistrations/${preregistration.id}`);

    try {
      const response = await fetch(`${API_URL}/preregistrations/${preregistration.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('📥 Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Error al actualizar el pre-registro: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Respuesta exitosa:', result);

      // Actualizar los datos del preregistro localmente
      if (preregistration) {
        preregistration.sender_name = editData.sender_name;
        preregistration.sender_email = editData.sender_has_email ? editData.sender_email : '';
        preregistration.recipient_name = editData.recipient_name;
        preregistration.recipient_email = editData.recipient_has_email ? editData.recipient_email : '';
        preregistration.weight = parseFloat(editData.weight);
        preregistration.cost = calculateCost(parseFloat(editData.weight));
      }

      Alert.alert(
        'Éxito', 
        'Pre-registro actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsEditing(false);
              onUpdate(); // Recargar la lista
              onClose(); // Cerrar el modal
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      Alert.alert('Error', 'No se pudo actualizar el pre-registro: ' + (error?.message || 'Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!preregistration) return;

    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este pre-registro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const response = await fetch(`${API_URL}/preregistrations/${preregistration.id}`, {
                method: 'DELETE',
              });

              if (!response.ok) {
                throw new Error('Error al eliminar el pre-registro');
              }

              Alert.alert('Éxito', 'Pre-registro eliminado correctamente');
              onUpdate(); // Recargar la lista
              onClose();
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'No se pudo eliminar el pre-registro');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (preregistration) {
      setEditData({
        sender_name: preregistration.sender_name,
        sender_email: preregistration.sender_email || '',
        sender_has_email: !!preregistration.sender_email,
        recipient_name: preregistration.recipient_name,
        recipient_email: preregistration.recipient_email || '',
        recipient_has_email: !!preregistration.recipient_email,
        weight: preregistration.weight.toString(),
      });
    }
  };

  const handleApprove = () => {
    if (!preregistration) return;

    Alert.alert(
      'Aprobar Pre-registro',
      '¿Estás seguro de que quieres aprobar este pre-registro? Esto lo convertirá en un paquete oficial con un número de tracking real.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          style: 'default',
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log('🚀 Aprobando preregistro ID:', preregistration.id);
              
              const response = await fetch(`${API_URL}/preregistrations/${preregistration.id}/approve`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              console.log('📥 Respuesta del servidor:', response.status, response.statusText);

              if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`Error al aprobar el pre-registro: ${response.status} ${response.statusText}`);
              }

              const result = await response.json();
              console.log('✅ Preregistro aprobado exitosamente:', result);

              Alert.alert(
                '¡Pre-registro Aprobado!',
                `El pre-registro ha sido convertido en paquete oficial.\n\nNúmero de Tracking: ${result.trackingNumber}\n\nEl usuario podrá ver su paquete en la sección de seguimiento.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onUpdate(); // Recargar la lista
                      onClose();
                    }
                  }
                ]
              );
            } catch (error: any) {
              console.error('❌ Error completo:', error);
              Alert.alert('Error', 'No se pudo aprobar el pre-registro: ' + (error?.message || 'Error desconocido'));
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCloseModal = () => {
    setIsEditing(false);
    onClose();
  };

  const handleUpdate = () => {
    onUpdate();
  };

  if (!preregistration) return null;

  const currentCost = calculateCost(parseFloat(editData.weight) || 0);
  const deliveryDate = calculateDeliveryDate();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Detalles del Pre-Registro</Text>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={BOA_COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Número de Tracking */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Número de Pre-Registro</Text>
              <Text style={styles.trackingNumber}>#{preregistration.trackingNumber}</Text>
            </View>

            {/* Información del Remitente */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Remitente</Text>
              {isEditing ? (
                <View>
                  <TextInput
                    style={styles.input}
                    value={editData.sender_name}
                    onChangeText={(text) => setEditData({ ...editData, sender_name: text })}
                    placeholder="Nombre del remitente"
                  />
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => setEditData({ 
                        ...editData, 
                        sender_has_email: !editData.sender_has_email 
                      })}
                    >
                      {editData.sender_has_email && (
                        <MaterialIcons name="check" size={16} color={BOA_COLORS.primary} />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.checkboxLabel}>Tiene email</Text>
                  </View>
                  {editData.sender_has_email && (
                    <TextInput
                      style={styles.input}
                      value={editData.sender_email}
                      onChangeText={(text) => setEditData({ ...editData, sender_email: text })}
                      placeholder="Email del remitente (opcional)"
                      keyboardType="email-address"
                    />
                  )}
                </View>
              ) : (
                <View>
                  <Text style={styles.detailText}>Nombre: {preregistration.sender_name}</Text>
                  <Text style={styles.detailText}>Email: {preregistration.sender_email || 'No especificado'}</Text>
                  <Text style={styles.detailText}>Teléfono: {preregistration.sender_phone}</Text>
                  <Text style={styles.detailText}>Dirección: {preregistration.sender_address}</Text>
                </View>
              )}
            </View>

            {/* Información del Destinatario */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Destinatario</Text>
              {isEditing ? (
                <View>
                  <TextInput
                    style={styles.input}
                    value={editData.recipient_name}
                    onChangeText={(text) => setEditData({ ...editData, recipient_name: text })}
                    placeholder="Nombre del destinatario"
                  />
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() => setEditData({ 
                        ...editData, 
                        recipient_has_email: !editData.recipient_has_email 
                      })}
                    >
                      {editData.recipient_has_email && (
                        <MaterialIcons name="check" size={16} color={BOA_COLORS.primary} />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.checkboxLabel}>Tiene email</Text>
                  </View>
                  {editData.recipient_has_email && (
                    <TextInput
                      style={styles.input}
                      value={editData.recipient_email}
                      onChangeText={(text) => setEditData({ ...editData, recipient_email: text })}
                      placeholder="Email del destinatario (opcional)"
                      keyboardType="email-address"
                    />
                  )}
                </View>
              ) : (
                <View>
                  <Text style={styles.detailText}>Nombre: {preregistration.recipient_name}</Text>
                  <Text style={styles.detailText}>Email: {preregistration.recipient_email || 'No especificado'}</Text>
                  <Text style={styles.detailText}>Teléfono: {preregistration.recipient_phone}</Text>
                  <Text style={styles.detailText}>Dirección: {preregistration.recipient_address}</Text>
                </View>
              )}
            </View>

            {/* Detalles del Envío */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detalles del Envío</Text>
              {isEditing ? (
                <View>
                  <Text style={styles.weightLabel}>Editar peso del paquete:</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.weight}
                    onChangeText={(text) => setEditData({ ...editData, weight: text })}
                    placeholder="Peso en kg"
                    keyboardType="numeric"
                  />
                  <Text style={styles.costPreview}>
                    Costo estimado: Bs. {currentCost}
                  </Text>
                </View>
              ) : (
                <Text style={styles.detailText}>Peso: {preregistration.weight} kg</Text>
              )}
              <Text style={styles.detailText}>Tipo de carga: {preregistration.cargo_type}</Text>
              <Text style={styles.detailText}>Origen: {preregistration.origin_city}</Text>
              <Text style={styles.detailText}>Destino: {preregistration.destination_city}</Text>
              <Text style={styles.detailText}>Descripción: {preregistration.description}</Text>
              <Text style={styles.detailText}>Prioridad: {preregistration.priority}</Text>
              <Text style={styles.detailText}>Tipo de envío: {preregistration.shipping_type}</Text>
            </View>

            {/* Información de Costos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información de Costos</Text>
              <Text style={styles.costText}>Costo: Bs. {isEditing ? currentCost : preregistration.cost}</Text>
              <Text style={styles.detailText}>Fecha estimada de entrega: {formatDate(deliveryDate.toISOString())}</Text>
            </View>

            {/* Información del Usuario */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Usuario Registrado</Text>
              <Text style={styles.detailText}>Email: {preregistration.user_email}</Text>
            </View>

            {/* Información de Aprobación */}
            {preregistration.status === 'Aprobado' && preregistration.approved_tracking_number && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Estado de Aprobación</Text>
                <View style={styles.approvedStatusContainer}>
                  <MaterialIcons name="check-circle" size={24} color={BOA_COLORS.success} />
                  <Text style={styles.approvedStatusText}>Pre-registro Aprobado</Text>
                </View>
                <Text style={styles.detailText}>
                  <Text style={styles.bold}>Número de Tracking:</Text> {preregistration.approved_tracking_number}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.bold}>Fecha de Aprobación:</Text> {formatDate(preregistration.approved_at || '')}
                </Text>
                <Text style={styles.approvedNote}>
                  Este preregistro ha sido convertido en paquete oficial y está disponible en el sistema de seguimiento.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Botones de Acción */}
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {preregistration.status !== 'Aprobado' && (
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={handleEdit}
                  >
                    <MaterialIcons name="edit" size={20} color={BOA_COLORS.white} />
                    <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDelete}
                >
                  <MaterialIcons name="delete" size={20} color={BOA_COLORS.white} />
                  <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
                {preregistration.status !== 'Aprobado' && (
                  <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={handleApprove}
                  >
                    <MaterialIcons name="check" size={20} color={BOA_COLORS.white} />
                    <Text style={styles.buttonText}>Aprobar</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: BOA_COLORS.white,
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  header: {
    backgroundColor: BOA_COLORS.primary,
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: BOA_COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 10,
  },
  trackingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    textAlign: 'center',
    backgroundColor: BOA_COLORS.light,
    padding: 10,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 16,
    color: BOA_COLORS.dark,
    marginBottom: 5,
  },
  costText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.success,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: BOA_COLORS.white,
  },
  weightLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 10,
  },
  costPreview: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.success,
    marginTop: 5,
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: BOA_COLORS.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    color: BOA_COLORS.dark,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: BOA_COLORS.primary,
  },
  deleteButton: {
    backgroundColor: BOA_COLORS.danger,
  },
  approveButton: {
    backgroundColor: BOA_COLORS.success,
  },
  saveButton: {
    backgroundColor: BOA_COLORS.success,
  },
  cancelButton: {
    backgroundColor: BOA_COLORS.gray,
  },
  buttonText: {
    color: BOA_COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  approvedStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  approvedStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.success,
    marginLeft: 8,
  },
  approvedNote: {
    fontSize: 16,
    color: BOA_COLORS.dark,
    marginTop: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
}); 