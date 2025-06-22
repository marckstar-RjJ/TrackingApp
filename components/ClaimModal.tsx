import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme/colors';
import { Picker } from '@react-native-picker/picker';

interface ClaimModalProps {
  visible: boolean;
  onClose: () => void;
  trackingNumber?: string;
  currentUser?: any;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({ visible, onClose, trackingNumber: initialTrackingNumber, currentUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber || '');
  const [claimType, setClaimType] = useState('paquete_demorado');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
    } else {
      setName('');
      setEmail('');
    }
    setTrackingNumber(initialTrackingNumber || '');
  }, [visible, currentUser, initialTrackingNumber]);

  const handleSubmit = async () => {
    if (!name || !email || !description) {
      Alert.alert('Campos Requeridos', 'Por favor, completa tu nombre, email y la descripción del problema.');
      return;
    }

    try {
      const response = await fetch('http://192.168.100.16:3000/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          tracking_number: trackingNumber,
          claim_type: claimType,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo enviar el reclamo. Inténtalo de nuevo.');
      }

      const result = await response.json();

      Alert.alert(
        'Reclamo Enviado Exitosamente',
        `Tu reclamo ha sido registrado con el número de seguimiento: ${result.claimId}. Recibirás una respuesta en un plazo máximo de 24 horas.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Reportar un Problema</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>
              Describe tu problema y nuestro equipo de soporte se pondrá en contacto contigo.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tu Nombre</Text>
              <TextInput style={[styles.input, currentUser && styles.disabledInput]} placeholder="Nombre completo" value={name} onChangeText={setName} editable={!currentUser} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tu Correo Electrónico</Text>
              <TextInput style={[styles.input, currentUser && styles.disabledInput]} placeholder="tu.correo@ejemplo.com" value={email} onChangeText={setEmail} keyboardType="email-address" editable={!currentUser}/>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de Seguimiento (Opcional)</Text>
              <TextInput style={styles.input} placeholder="Ej: BOA-20240101-0001" value={trackingNumber} onChangeText={setTrackingNumber} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Reclamo</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={claimType}
                  onValueChange={(itemValue) => setClaimType(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Paquete Demorado" value="paquete_demorado" />
                  <Picker.Item label="Paquete Dañado" value="paquete_dañado" />
                  <Picker.Item label="Información Incorrecta" value="info_incorrecta" />
                  <Picker.Item label="Problema con la Entrega" value="problema_entrega" />
                  <Picker.Item label="Otro" value="otro" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Describe el Problema</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Por favor, detalla tu problema aquí..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Enviar Reclamo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalContent: {
        backgroundColor: BOA_COLORS.lightGray,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
      },
      headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: BOA_COLORS.dark,
      },
      closeButton: {
        padding: 5,
      },
      description: {
        fontSize: 14,
        color: BOA_COLORS.gray,
        marginBottom: 20,
        lineHeight: 20,
      },
      inputGroup: {
        marginBottom: 15,
      },
      label: {
        fontSize: 16,
        fontWeight: '600',
        color: BOA_COLORS.primary,
        marginBottom: 8,
      },
      input: {
        backgroundColor: BOA_COLORS.white,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: BOA_COLORS.dark,
        borderWidth: 1,
        borderColor: '#ddd',
      },
      disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#a0a0a0',
      },
      multilineInput: {
        height: 100,
        textAlignVertical: 'top',
      },
      pickerContainer: {
        backgroundColor: BOA_COLORS.white,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
      },
      picker: {
        width: '100%',
      },
      submitButton: {
        backgroundColor: BOA_COLORS.primary,
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
      },
      submitButtonText: {
        color: BOA_COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
      },
}); 