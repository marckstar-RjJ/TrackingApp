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
import { loginUser } from '../utils/auth';
import { FullScreenLoader } from './FullScreenLoader';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  onShowRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose, onLoginSuccess, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (email.trim() === '' || password.trim() === '') {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setIsLoading(true);
    try {
      const user = await loginUser(email, password);
      if (!user) {
        setError('Usuario o contraseña incorrectos.');
        setIsLoading(false);
        return;
      }
      setEmail('');
      setPassword('');
      setError('');
      onLoginSuccess(user);
      onClose();
      setIsLoading(false);
    } catch (err) {
      setError('Error de red o inesperado. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  const handleForgot = () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      return;
    }
    setForgotSent(true);
    setTimeout(() => {
      setShowForgot(false);
      setForgotSent(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <FullScreenLoader visible={isLoading} message="Iniciando sesión..." />
        <View style={styles.modal}>
          <Text style={styles.title}>Iniciar sesión</Text>
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
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Ingresar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowForgot(true)}>
            <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onShowRegister}>
            <Text style={styles.registerText}>¿No tienes cuenta? Crear cuenta</Text>
          </TouchableOpacity>
          <Pressable style={styles.close} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
          </Pressable>
        </View>
        {/* Modal de recuperación */}
        <Modal visible={showForgot} animationType="fade" transparent>
          <View style={styles.overlay}>
            <View style={styles.forgotModal}>
              <Text style={styles.forgotTitle}>Recuperar contraseña</Text>
              {forgotSent ? (
                <Text style={styles.forgotSent}>Instrucciones enviadas a tu correo.</Text>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu correo"
                    placeholderTextColor={BOA_COLORS.gray}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                  />
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleForgot}
                    disabled={!forgotEmail || !forgotEmail.includes('@')}
                  >
                    <Text style={styles.loginButtonText}>Enviar</Text>
                  </TouchableOpacity>
                </>
              )}
              <Pressable style={styles.close} onPress={() => setShowForgot(false)}>
                <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
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
  loginButton: {
    backgroundColor: BOA_COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotText: {
    color: BOA_COLORS.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  registerText: {
    color: BOA_COLORS.primary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  error: {
    color: BOA_COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  close: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  forgotModal: {
    width: '80%',
    backgroundColor: BOA_COLORS.white,
    borderRadius: 18,
    padding: 24,
    alignItems: 'stretch',
    elevation: 8,
    position: 'relative',
  },
  forgotTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  forgotSent: {
    color: BOA_COLORS.success,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
}); 