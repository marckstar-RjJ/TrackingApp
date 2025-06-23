import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { BACKEND_URL } from '../utils/backend';

// Tema de colores Boa
const BOA_COLORS = {
  primary: '#1976D2',
  secondary: '#42A5F5',
  accent: '#0D47A1',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  light: '#E3F2FD',
  dark: '#1565C0',
  white: '#FFFFFF',
  gray: '#757575',
  lightGray: '#F5F5F5',
};

interface PublicTrackingQueryScreenProps {
  navigation: any;
  route: any;
}

export const PublicTrackingQueryScreen: React.FC<PublicTrackingQueryScreenProps> = ({ navigation, route }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simulación de paquetes registrados (como en el panel de administración)
  const registeredPackages = [
    'BOA-20240115-0001',
    'BOA-20240115-0002', 
    'BOA-20240115-0003',
    'BOA-20240115-0004',
    'BOA-20240115-0005',
    'BOA-20240116-0001',
    'BOA-20240116-0002',
    'BOA-20240116-0003'
  ];

  const handleManualTracking = async () => {
    if (!trackingNumber.trim()) {
      Alert.alert('Error', 'Por favor ingresa un número de seguimiento');
      return;
    }

    // Validar formato básico del tracking number
    if (trackingNumber.length < 8) {
      Alert.alert('Error', 'El número de seguimiento debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/packages/tracking/${trackingNumber.trim()}`);
      if (!res.ok) {
      Alert.alert(
        'Paquete no encontrado',
        'El número de seguimiento ingresado no se encuentra en nuestro sistema.\n\nVerifica el número o contacta con nuestro servicio al cliente.',
        [
            { text: 'Intentar otro número', style: 'cancel' }
          ]
        );
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      if (!data || !data.tracking_number) {
        Alert.alert('Paquete no encontrado', 'No se encontró información para este número de seguimiento.');
        setIsLoading(false);
      return;
    }
      // Adaptar datos al formato esperado por TrackingDetailScreen
    const trackingItem = {
        trackingNumber: data.tracking_number,
        description: data.description,
        status: data.status,
        location: data.location,
        priority: data.priority || 'No especificada',
        estimatedDelivery: data.estimatedDelivery || data.estimated_delivery_date || '',
        events: Array.isArray(data.events)
          ? data.events.map((ev: any) => ({
              ...ev,
              timestamp: ev.timestamp ? new Date(ev.timestamp.replace(' ', 'T')) : null
            }))
          : [],
      };
    navigation.navigate('TrackingDetail', { 
        trackingItem,
      currentUser: null,
      isPublicUser: true 
    });
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
    setIsLoading(false);
  };

  const handleScanQR = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/packages`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        Alert.alert('Sin paquetes', 'No hay paquetes registrados en el sistema para simular el escaneo.');
        return;
      }
      const randomPkg = data[Math.floor(Math.random() * data.length)];
      const tracking = randomPkg.tracking_number;
      setTrackingNumber(tracking);
            Alert.alert(
              'QR Escaneado Exitosamente',
        `Paquete detectado: ${tracking}\n\n¿Deseas consultar este envío?`,
              [
                { text: 'Cancelar', style: 'cancel' },
                { 
                  text: 'Consultar', 
            onPress: async () => {
              setIsLoading(true);
              try {
                const res2 = await fetch(`${BACKEND_URL}/packages/tracking/${tracking}`);
                if (!res2.ok) {
                  Alert.alert('Paquete no encontrado', 'El número de seguimiento ingresado no se encuentra en nuestro sistema.');
                  setIsLoading(false);
                  return;
                }
                const data2 = await res2.json();
                if (!data2 || !data2.tracking_number) {
                  Alert.alert('Paquete no encontrado', 'No se encontró información para este número de seguimiento.');
                  setIsLoading(false);
                  return;
                }
                    const trackingItem = {
                  trackingNumber: data2.tracking_number,
                  description: data2.description,
                  status: data2.status,
                  location: data2.location,
                  priority: data2.priority || 'No especificada',
                  estimatedDelivery: data2.estimatedDelivery || data2.estimated_delivery_date || '',
                  events: Array.isArray(data2.events)
                    ? data2.events.map((ev: any) => ({
                        ...ev,
                        timestamp: ev.timestamp ? new Date(ev.timestamp.replace(' ', 'T')) : null
                      }))
                    : [],
                };
                    navigation.navigate('TrackingDetail', { 
                  trackingItem,
                      currentUser: null,
                      isPublicUser: true 
                    });
              } catch (e) {
                Alert.alert('Error', 'No se pudo conectar con el servidor.');
              }
              setIsLoading(false);
                  }
                }
              ]
            );
    } catch (e) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
        }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}>
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <FullScreenLoader visible={isLoading} message="Cargando..." />
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Sección de bienvenida */}
            <View style={styles.welcomeCard}>
              <MaterialIcons name="search" size={56} color={BOA_COLORS.accent} style={{ marginBottom: 8 }} />
              <Text style={styles.welcomeTitle}>Consulta tu Envío</Text>
              <Text style={styles.welcomeSubtitle}>
                Ingresa tu número de seguimiento o escanea el código QR de tu paquete
              </Text>
            </View>

            {/* Opción 1: Consulta Manual */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{
                  backgroundColor: BOA_COLORS.accent,
                  borderRadius: 20,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <MaterialIcons name="edit" size={22} color={BOA_COLORS.white} />
                </View>
                <Text style={[styles.sectionTitle, { color: BOA_COLORS.white }]}>Consulta Manual</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu número de seguimiento"
                  placeholderTextColor={BOA_COLORS.gray}
                  value={trackingNumber}
                  onChangeText={setTrackingNumber}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={20}
                  selectionColor={BOA_COLORS.primary}
                />
                <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={handleManualTracking}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="search" size={24} color={BOA_COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Separador */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>O</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Opción 2: Escaneo QR */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{
                  backgroundColor: BOA_COLORS.success,
                  borderRadius: 20,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <MaterialIcons name="qr-code-scanner" size={22} color={BOA_COLORS.white} />
                </View>
                <Text style={[styles.sectionTitle, { color: BOA_COLORS.white }]}>Escanear Código QR</Text>
              </View>
              <TouchableOpacity 
                style={styles.scanButton}
                onPress={handleScanQR}
                activeOpacity={0.8}
              >
                <MaterialIcons name="qr-code-scanner" size={32} color={BOA_COLORS.white} />
                <Text style={styles.scanButtonText}>Escanear QR</Text>
              </TouchableOpacity>
              <Text style={[styles.scanInstructions, { color: BOA_COLORS.white }]}>
                Si tienes tu paquete o ticket impreso, puedes escanear el código QR para consultar automáticamente
              </Text>
            </View>

            {/* Información adicional mejorada */}
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <MaterialIcons name="info" size={32} color={BOA_COLORS.primary} style={{ marginTop: 2 }} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>¿Dónde encuentro mi número de seguimiento?</Text>
                  <Text style={styles.infoText}>
                    El número de seguimiento se encuentra en tu comprobante de envío o en la etiqueta del paquete. Suele tener el formato: BOA-YYYYMMDD-XXXX
                  </Text>
                </View>
              </View>
            </View>

            {/* Ejemplos mejorados */}
            <View style={styles.examplesSection}>
              <View style={styles.examplesCard}>
                <MaterialIcons name="list-alt" size={28} color={BOA_COLORS.warning} style={{ marginTop: 2 }} />
                <View style={styles.examplesContent}>
                  <Text style={styles.examplesTitle}>Ejemplos de Números de Seguimiento</Text>
                  <Text style={styles.examplesText}>
                    {registeredPackages.slice(0, 3).join('\n')}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(25, 118, 210, 0.9)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: BOA_COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245,245,245,0.95)',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: BOA_COLORS.dark,
  },
  searchButton: {
    backgroundColor: BOA_COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: BOA_COLORS.lightGray,
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 16,
    color: BOA_COLORS.gray,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: BOA_COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scanInstructions: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoSection: {
    marginTop: 32,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 10,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 15,
    color: BOA_COLORS.dark,
    lineHeight: 21,
  },
  examplesSection: {
    marginTop: 24,
  },
  examplesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  examplesContent: {
    flex: 1,
    marginLeft: 12,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.warning,
    marginBottom: 8,
  },
  examplesText: {
    fontSize: 15,
    color: BOA_COLORS.dark,
    lineHeight: 21,
    fontFamily: 'monospace',
  },
});
 