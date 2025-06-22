import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { BOA_COLORS } from '../theme';

interface ClaimResponseModalProps {
  visible: boolean;
  onClose: () => void;
  claim: any;
  onRespond: (response: string) => void;
}

export const ClaimResponseModal = ({ visible, onClose, claim, onRespond }: ClaimResponseModalProps) => {
  const [response, setResponse] = useState(claim?.response || '');

  const handleSendResponse = () => {
    onRespond(response);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.title}>Responder a Reclamo</Text>
            
            <Text style={styles.label}>Usuario:</Text>
            <Text style={styles.value}>{claim?.name} ({claim?.email})</Text>

            <Text style={styles.label}>Tipo de Reclamo:</Text>
            <Text style={styles.value}>{claim?.claim_type}</Text>

            <Text style={styles.label}>Descripción del Reclamo:</Text>
            <Text style={styles.value}>{claim?.description}</Text>

            <Text style={styles.label}>Respuesta del Administrador:</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              value={response}
              onChangeText={setResponse}
              placeholder="Escribe tu respuesta aquí..."
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.sendButton]} onPress={handleSendResponse}>
                <Text style={styles.buttonText}>Enviar Respuesta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: BOA_COLORS.primary,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: BOA_COLORS.dark,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
    color: BOA_COLORS.gray,
  },
  input: {
    borderWidth: 1,
    borderColor: BOA_COLORS.lightGray,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
  },
  sendButton: {
    backgroundColor: BOA_COLORS.primary,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: BOA_COLORS.danger,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 