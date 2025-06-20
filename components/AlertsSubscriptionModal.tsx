import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme/colors';

interface AlertsSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AlertsSubscriptionModal: React.FC<AlertsSubscriptionModalProps> = ({ visible, onClose }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] =useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!trackingNumber) {
      Alert.alert('Campo Requerido', 'Por favor, ingresa un número de seguimiento.');
      return;
    }
    if (emailEnabled && !email) {
      Alert.alert('Campo Requerido', 'Por favor, ingresa tu correo electrónico.');
      return;
    }
    if (smsEnabled && !phone) {
      Alert.alert('Campo Requerido', 'Por favor, ingresa tu número de teléfono.');
      return;
    }

    // Lógica para guardar la suscripción de alertas (simulada)
    console.log({
      trackingNumber,
      pushEnabled,
      emailEnabled,
      smsEnabled,
      email,
      phone,
    });

    Alert.alert(
      'Suscripción Guardada',
      `Recibirás alertas para el paquete ${trackingNumber}.`,
      [{ text: 'OK', onPress: onClose }]
    );
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
              <Text style={styles.headerTitle}>Configurar Alertas de Envío</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>
              Ingresa tu número de seguimiento y elige cómo quieres recibir las notificaciones sobre el estado de tu paquete.
            </Text>

            {/* Tracking Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de Seguimiento</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="local-shipping" size={20} color={BOA_COLORS.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: BOA-20240101-0001"
                  value={trackingNumber}
                  onChangeText={setTrackingNumber}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Notification Channels */}
            <View style={styles.notificationGroup}>
              <Text style={styles.label}>Canales de Notificación</Text>
              
              <View style={styles.switchRow}>
                <MaterialIcons name="notifications" size={24} color={BOA_COLORS.primary} />
                <Text style={styles.switchLabel}>Activar Notificaciones Push</Text>
                <Switch
                  trackColor={{ false: '#767577', true: BOA_COLORS.secondary }}
                  thumbColor={pushEnabled ? BOA_COLORS.primary : '#f4f3f4'}
                  onValueChange={setPushEnabled}
                  value={pushEnabled}
                />
              </View>

              <View style={styles.switchRow}>
                <MaterialIcons name="email" size={24} color={BOA_COLORS.primary} />
                <Text style={styles.switchLabel}>Alertas por Correo Electrónico</Text>
                <Switch
                  trackColor={{ false: '#767577', true: BOA_COLORS.secondary }}
                  thumbColor={emailEnabled ? BOA_COLORS.primary : '#f4f3f4'}
                  onValueChange={setEmailEnabled}
                  value={emailEnabled}
                />
              </View>
              {emailEnabled && (
                <View style={styles.conditionalInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="tu.correo@ejemplo.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              )}

              <View style={styles.switchRow}>
                <MaterialIcons name="sms" size={24} color={BOA_COLORS.primary} />
                <Text style={styles.switchLabel}>Alertas por SMS</Text>
                <Switch
                  trackColor={{ false: '#767577', true: BOA_COLORS.secondary }}
                  thumbColor={smsEnabled ? BOA_COLORS.primary : '#f4f3f4'}
                  onValueChange={setSmsEnabled}
                  value={smsEnabled}
                />
              </View>
              {smsEnabled && (
                <View style={styles.conditionalInput}>
                  <TextInput
                    style={styles.input}
                    placeholder="Número de teléfono"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
    maxHeight: '85%',
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: BOA_COLORS.primary,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BOA_COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: BOA_COLORS.dark,
  },
  notificationGroup: {
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BOA_COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  switchLabel: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: BOA_COLORS.dark,
  },
  conditionalInput: {
    backgroundColor: BOA_COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: -5,
  },
  saveButton: {
    backgroundColor: BOA_COLORS.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 