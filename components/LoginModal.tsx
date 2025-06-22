import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { BOA_COLORS } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { loginUser, requestPasswordReset } from '../utils/auth';
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
        return;
      }
      
      onLoginSuccess(user);
      
      setEmail('');
      setPassword('');
      
    } catch (err) {
      setError('Error de red o inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setError('Por favor, ingresa un email válido.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await requestPasswordReset(forgotEmail);
      if (result.success) {
        setForgotSent(true);
      } else {
        setError(result.error || 'Error al solicitar recuperación');
      }
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotForm = () => {
    setShowForgot(false);
    setTimeout(() => {
      setForgotEmail('');
      setForgotSent(false);
      setError('');
    }, 500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <FullScreenLoader visible={isLoading} message="Procesando..." />
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
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
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
        
        <Modal visible={showForgot} animationType="fade" transparent>
          <View style={styles.overlay}>
            <View style={styles.forgotModal}>
              <Text style={styles.forgotTitle}>Recuperar contraseña</Text>
              
              {forgotSent ? (
                <View style={styles.successContainer}>
                  <MaterialIcons name="check-circle" size={48} color={BOA_COLORS.success} />
                  <Text style={styles.successText}>¡Instrucciones enviadas!</Text>
                  <Text style={styles.successSubtext}>
                    Revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña.
                  </Text>
                  <TouchableOpacity
                    style={[styles.loginButton, { marginTop: 20 }]}
                    onPress={resetForgotForm}
                  >
                    <Text style={styles.loginButtonText}>Entendido</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text style={styles.forgotDescription}>
                    Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu contraseña.
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu correo"
                    placeholderTextColor={BOA_COLORS.gray}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                  />
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleForgotPassword}
                    disabled={isLoading || !forgotEmail || !forgotEmail.includes('@')}
                  >
                    <Text style={styles.loginButtonText}>
                      {isLoading ? 'Enviando...' : 'Enviar Instrucciones'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              
              <Pressable style={styles.close} onPress={resetForgotForm} disabled={isLoading}>
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
    width: '85%',
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
  forgotDescription: {
    color: BOA_COLORS.dark,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successText: {
    color: BOA_COLORS.success,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  successSubtext: {
    color: BOA_COLORS.dark,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}); 