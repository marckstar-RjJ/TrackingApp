import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { BOA_COLORS } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { registerUser } from '../utils/auth';
import { FullScreenLoader } from './FullScreenLoader';

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onRegisterSuccess: (userData: { name: string; email: string; password: string }) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ 
  visible, 
  onClose, 
  onRegisterSuccess 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Por favor, completa todos los campos.');
      return false;
    }
    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Por favor, ingresa un email válido.');
      return false;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError('La contraseña debe tener al menos una letra mayúscula.');
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('La contraseña debe tener al menos un carácter especial.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setError('');
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const result = await registerUser({ name, email, password });
      if (result && result.id) {
        onRegisterSuccess({ name, email, password });
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
      } else if (result && result.error) {
        setError(result.error);
      } else {
        setError('No se pudo crear la cuenta. El email puede estar registrado.');
      }
    } catch (error) {
      setError('Error al crear la cuenta. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <FullScreenLoader visible={isLoading} message="Creando cuenta..." />
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>Crear cuenta</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={BOA_COLORS.gray}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={BOA_COLORS.gray}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                placeholder="Contraseña"
                placeholderTextColor={BOA_COLORS.gray}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={BOA_COLORS.gray}
                />
              </TouchableOpacity>
            </View>
            {/* Indicaciones de contraseña */}
            <Text style={styles.passwordHint}>
              La contraseña debe tener al menos 6 caracteres, una mayúscula y un carácter especial.
            </Text>
            
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Confirmar contraseña"
                placeholderTextColor={BOA_COLORS.gray}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword((v) => !v)}>
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={BOA_COLORS.gray}
                />
              </TouchableOpacity>
            </View>
            
            {error ? <Text style={styles.error}>{error}</Text> : null}
            
            <TouchableOpacity 
              style={[styles.registerButton, isLoading && styles.disabledButton]} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Text>
            </TouchableOpacity>
            
            <Pressable style={styles.close} onPress={onClose}>
              <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: BOA_COLORS.white,
    borderRadius: 18,
    padding: 24,
    alignItems: 'stretch',
    elevation: 8,
    position: 'relative',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: BOA_COLORS.dark,
    marginBottom: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    marginBottom: 14,
    paddingRight: 10,
  },
  registerButton: {
    backgroundColor: BOA_COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: BOA_COLORS.gray,
  },
  registerButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: BOA_COLORS.danger,
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
  },
  passwordHint: {
    color: BOA_COLORS.gray,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
}); 