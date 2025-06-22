import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BOA_COLORS } from '../theme';
import { User, isAdmin, loginUser, registerUser } from '../utils/auth';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';
import { ShippingRegistrationModal } from '../components/ShippingRegistrationModal';
import { PackageScannerModal } from '../components/PackageScannerModal';
import { HomeAdminScreen } from './HomeAdminScreen';
import { HomePublicScreen } from './HomePublicScreen';

interface HomeScreenProps {
  navigation: any;
  route: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // Animación para el indicador de scroll
  const scrollIndicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scrollIndicatorAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scrollIndicatorAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startAnimation();
  }, [scrollIndicatorAnim]);

  // Datos simulados de paquetes del usuario
  const userPackages = [
    {
      id: '1',
      trackingNumber: 'BOA-2024-001',
      description: 'Documentos importantes',
      status: 'En vuelo a La Paz',
      location: 'Aeropuerto Internacional El Alto',
      date: '2024-01-15 14:30',
      icon: 'flight',
      color: BOA_COLORS.primary
    },
    {
      id: '2', 
      trackingNumber: 'BOA-2024-002',
      description: 'Paquete electrónico',
      status: 'Entregado',
      location: 'Oficina Central, La Paz',
      date: '2024-01-14 16:45',
      icon: 'check-circle',
      color: BOA_COLORS.success
    },
    {
      id: '3',
      trackingNumber: 'BOA-2024-003', 
      description: 'Muestra comercial',
      status: 'En tránsito',
      location: 'Centro de Distribución, Santa Cruz',
      date: '2024-01-15 09:15',
      icon: 'local-shipping' as any,
      color: BOA_COLORS.warning
    }
  ];

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
  };

  const handleQuickAction = (action: string) => {
    if (!navigation) {
      Alert.alert('Error', 'No se puede navegar en este momento');
      return;
    }

    if (isAdmin(currentUser)) {
      switch (action) {
        case 'register':
          setShowShippingModal(true);
          break;
        case 'scanner':
          setShowScannerModal(true);
          break;
        case 'tracking':
          navigation.navigate('Tracking', { currentUser });
          break;
        case 'alerts':
          navigation.navigate('Alerts', { currentUser });
          break;
        case 'internal-alerts':
          navigation.navigate('InternalAlerts', { currentUser });
          break;
        case 'claims':
          navigation.navigate('AdminClaims', { currentUser, handleLogout });
          break;
        case 'returns':
          navigation.navigate('AdminReturns');
          break;
        case 'preregistrations':
          navigation.navigate('AllPreRegistrations');
          break;
        case 'reports':
          Alert.alert('Reportes', 'Funcionalidad de reportes y estadísticas');
          break;
      }
    } else {
      switch (action) {
        case 'track':
          navigation.navigate('PublicTracking');
          break;
        case 'my-packages':
          navigation.navigate('UserPackages', { currentUser });
          break;
        case 'my-claims':
          navigation.navigate('UserClaims', { currentUser });
          break;
        case 'my-returns':
          navigation.navigate('UserReturns', { currentUser });
          break;
        case 'preregistrations':
          navigation.navigate('PreRegistration', { currentUser });
          break;
        case 'alerts':
          navigation.navigate('Alerts', { currentUser });
          break;
        case 'support':
          Alert.alert('Soporte', 'Funcionalidad de soporte al cliente');
          break;
        case 'support-claims':
          // Funcionalidad de soporte y reclamos para usuarios públicos
          Alert.alert(
            'Soporte y Reclamos',
            '¿En qué podemos ayudarte?',
            [
              {
                text: 'Reportar Problema',
                onPress: () => {
                  Alert.alert(
                    'Reportar Problema',
                    'Selecciona el tipo de problema:',
                    [
                      {
                        text: 'Paquete Retrasado',
                        onPress: () => {
                          Alert.alert(
                            'Reporte de Paquete Retrasado',
                            'Para reportar un paquete retrasado, necesitamos:\n\n• Número de tracking\n• Fecha esperada de entrega\n• Descripción del problema\n\n¿Deseas continuar?',
                            [
                              {
                                text: 'Continuar',
                                onPress: () => Alert.alert(
                                  'Reporte Enviado',
                                  'Tu reporte ha sido registrado. Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas.',
                                  [{ text: 'OK' }]
                                )
                              },
                              { text: 'Cancelar' }
                            ]
                          );
                        }
                      },
                      {
                        text: 'Paquete Dañado',
                        onPress: () => {
                          Alert.alert(
                            'Reporte de Paquete Dañado',
                            'Para reportar un paquete dañado, necesitamos:\n\n• Número de tracking\n• Descripción del daño\n• Fotos del daño (si es posible)\n\n¿Deseas continuar?',
                            [
                              {
                                text: 'Continuar',
                                onPress: () => Alert.alert(
                                  'Reporte Enviado',
                                  'Tu reporte ha sido registrado. Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas.',
                                  [{ text: 'OK' }]
                                )
                              },
                              { text: 'Cancelar' }
                            ]
                          );
                        }
                      },
                      {
                        text: 'Paquete Perdido',
                        onPress: () => {
                          Alert.alert(
                            'Reporte de Paquete Perdido',
                            'Para reportar un paquete perdido, necesitamos:\n\n• Número de tracking\n• Última ubicación conocida\n• Descripción del contenido\n\n¿Deseas continuar?',
                            [
                              {
                                text: 'Continuar',
                                onPress: () => Alert.alert(
                                  'Reporte Enviado',
                                  'Tu reporte ha sido registrado. Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas.',
                                  [{ text: 'OK' }]
                                )
                              },
                              { text: 'Cancelar' }
                            ]
                          );
                        }
                      },
                      { text: 'Cancelar' }
                    ]
                  );
                }
              },
              {
                text: 'Solicitar Devolución',
                onPress: () => {
                  Alert.alert(
                    'Solicitar Devolución',
                    'Para solicitar una devolución, necesitamos:\n\n• Número de tracking\n• Motivo de la devolución\n• Información de contacto\n\n¿Deseas continuar?',
                    [
                      {
                        text: 'Continuar',
                        onPress: () => Alert.alert(
                          'Solicitud Enviada',
                          'Tu solicitud de devolución ha sido registrada. Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas.',
                          [{ text: 'OK' }]
                        )
                      },
                      { text: 'Cancelar' }
                    ]
                  );
                }
              },
              {
                text: 'Información General',
                onPress: () => {
                  Alert.alert(
                    'Información General',
                    '¿En qué podemos ayudarte?\n\n• Horarios de atención\n• Ubicaciones de oficinas\n• Tarifas y costos\n• Tiempos de entrega\n• Requisitos de envío',
                    [
                      {
                        text: 'Llamar',
                        onPress: () => Alert.alert('Llamada', 'Redirigiendo a llamada...')
                      },
                      {
                        text: 'WhatsApp',
                        onPress: () => Alert.alert('WhatsApp', 'Redirigiendo a WhatsApp...')
                      },
                      { text: 'Cancelar' }
                    ]
                  );
                }
              },
              { text: 'Cancelar' }
            ]
          );
          break;
      }
    }
  };

  const handleShippingRegistered = (shippingData: any, trackingNumber: string) => {
    Alert.alert(
      'Envío Registrado Exitosamente',
      `Número de seguimiento: ${trackingNumber}\n\nEl envío ha sido agregado al sistema de tracking.`,
      [
        {
          text: 'Ver en Tracking',
          onPress: () => {
            if (navigation) {
              navigation.navigate('Tracking', { currentUser });
            } else {
              Alert.alert('Error', 'No se puede navegar en este momento');
            }
          }
        },
        { text: 'OK' }
      ]
    );
  };

  const handleEventRegistered = (trackingNumber: string, event: any) => {
    Alert.alert(
      'Evento Registrado',
      `Evento "${event.eventType}" registrado para el paquete ${trackingNumber}\n\nUbicación: ${event.location}\nOperador: ${event.operator}\nFecha: ${event.timestamp.toLocaleString()}`,
      [
        {
          text: 'Ver Detalles',
          onPress: () => {
            if (navigation) {
              navigation.navigate('TrackingDetail', { 
                trackingItem: { trackingNumber, events: [event] }, 
                currentUser 
              });
            } else {
              Alert.alert('Error', 'No se puede navegar en este momento');
            }
          }
        },
        { text: 'OK' }
      ]
    );
  };

  const handleRegister = () => {
    setShowRegisterModal(false);
    Alert.alert('Registro exitoso', 'Usuario creado correctamente. Ahora puedes iniciar sesión.');
  };

  // Renderizado según rol
  if (currentUser && isAdmin(currentUser)) {
    return (
      <HomeAdminScreen
        currentUser={currentUser}
        navigation={navigation}
        handleLogout={handleLogout}
      />
    );
  }
  if (currentUser) {
    return (
      <HomePublicScreen
        currentUser={currentUser}
        navigation={navigation}
        handleLogout={handleLogout}
        handleQuickAction={handleQuickAction}
      />
    );
  }

  // Vista pública (no logueado)
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}>
        <ImageBackground
          source={require('../assets/fondo_mobile.png')}
          style={styles.container}
          resizeMode="cover"
        >
          <Header 
            onLogin={() => setShowLoginModal(true)}
            isLoggedIn={false}
          />
          
          <ScrollView contentContainerStyle={styles.publicContent} showsVerticalScrollIndicator={false}>
            {/* Hero Section con Logo Central */}
            <View style={styles.heroSection}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.90)', borderRadius: 20, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 }}>
                {/* Logo Central */}
                <Image 
                  source={require('../assets/logo_central.png')} 
                  style={{ 
                    width: 150, 
                    height: 150, 
                    marginBottom: 24,
                    resizeMode: 'contain',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4
                  }} 
                />
                <Text style={{ 
                  fontSize: 38, 
                  fontWeight: '900', 
                  color: BOA_COLORS.primary, 
                  marginBottom: 8, 
                  textAlign: 'center', 
                  letterSpacing: 3,
                  textShadowColor: 'rgba(25,118,210,0.2)',
                  textShadowOffset: { width: 0, height: 3 },
                  textShadowRadius: 6,
                  fontFamily: 'System',
                  includeFontPadding: false,
                  textAlignVertical: 'center'
                }}>
                  TrackingApp
                </Text>
                <Text style={{ fontSize: 18, color: BOA_COLORS.dark, marginBottom: 16, textAlign: 'center', fontWeight: '500' }}>Seguimiento confiable de tus envíos internacionales</Text>
                <Text style={{ fontSize: 16, color: BOA_COLORS.gray, textAlign: 'center', lineHeight: 22 }}>
                  Rastrea tus paquetes en tiempo real desde cualquier parte del mundo. Recibe notificaciones instantáneas y mantén el control total de tus envíos.
                </Text>
              </View>
            </View>
            
            {/* Indicador de Scroll Animado */}
            <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 30 }}>
              <Animated.View
                style={{
                  transform: [
                    {
                      translateY: scrollIndicatorAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 10],
                      }),
                    },
                  ],
                  opacity: scrollIndicatorAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.6, 1, 0.6],
                  }),
                }}
              >
                <View style={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)', 
                  borderRadius: 20, 
                  padding: 12,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }}>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color={BOA_COLORS.primary} />
                </View>
              </Animated.View>
              <Text style={{ 
                color: BOA_COLORS.white, 
                fontSize: 12, 
                marginTop: 8, 
                textAlign: 'center',
                opacity: 0.8,
                fontWeight: '500'
              }}>
                Desliza para ver más
              </Text>
            </View>
            
            {/* Carrusel de motivos/funciones debajo de la presentación */}
            <View style={{ marginTop: 24, marginBottom: 8 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center', letterSpacing: 0.5 }}>¿Para qué sirve TrackingApp?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, gap: 12 }}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 20, alignItems: 'center', width: 220, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 }}>
                  <MaterialIcons name="track-changes" size={38} color={BOA_COLORS.primary} />
                  <Text style={{ color: BOA_COLORS.primary, fontWeight: 'bold', fontSize: 16, marginTop: 10, textAlign: 'center' }}>Sigue tu paquete en cada etapa</Text>
                  <Text style={{ color: BOA_COLORS.gray, fontSize: 14, textAlign: 'center', marginTop: 4 }}>Visualiza el recorrido y estado en tiempo real.</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 20, alignItems: 'center', width: 220, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 }}>
                  <MaterialIcons name="notifications-active" size={38} color={BOA_COLORS.primary} />
                  <Text style={{ color: BOA_COLORS.primary, fontWeight: 'bold', fontSize: 16, marginTop: 10, textAlign: 'center' }}>Recibe alertas automáticas</Text>
                  <Text style={{ color: BOA_COLORS.gray, fontSize: 14, textAlign: 'center', marginTop: 4 }}>Te avisamos cuando tu paquete cambia de estado.</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 20, alignItems: 'center', width: 220, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 }}>
                  <MaterialIcons name="history" size={38} color={BOA_COLORS.primary} />
                  <Text style={{ color: BOA_COLORS.primary, fontWeight: 'bold', fontSize: 16, marginTop: 10, textAlign: 'center' }}>Historial completo</Text>
                  <Text style={{ color: BOA_COLORS.gray, fontSize: 14, textAlign: 'center', marginTop: 4 }}>Consulta todos los eventos y movimientos de tus envíos.</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 20, alignItems: 'center', width: 220, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 }}>
                  <MaterialIcons name="smartphone" size={38} color={BOA_COLORS.primary} />
                  <Text style={{ color: BOA_COLORS.primary, fontWeight: 'bold', fontSize: 16, marginTop: 10, textAlign: 'center' }}>Fácil y desde tu móvil</Text>
                  <Text style={{ color: BOA_COLORS.gray, fontSize: 14, textAlign: 'center', marginTop: 4 }}>Toda la gestión y seguimiento desde la app, sin complicaciones.</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 20, alignItems: 'center', width: 220, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 }}>
                  <MaterialIcons name="verified-user" size={38} color={BOA_COLORS.primary} />
                  <Text style={{ color: BOA_COLORS.primary, fontWeight: 'bold', fontSize: 16, marginTop: 10, textAlign: 'center' }}>Seguro y confiable</Text>
                  <Text style={{ color: BOA_COLORS.gray, fontSize: 14, textAlign: 'center', marginTop: 4 }}>Tus datos y envíos protegidos con tecnología de punta.</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 20, alignItems: 'center', width: 220, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 }}>
                  <MaterialIcons name="support" size={38} color={BOA_COLORS.primary} />
                  <Text style={{ color: BOA_COLORS.primary, fontWeight: 'bold', fontSize: 16, marginTop: 10, textAlign: 'center' }}>Soporte rápido</Text>
                  <Text style={{ color: BOA_COLORS.gray, fontSize: 14, textAlign: 'center', marginTop: 4 }}>Ayuda y atención personalizada cuando la necesites.</Text>
                </View>
              </ScrollView>
            </View>
            {/* Sección de beneficios generales */}
            <View style={[styles.featuresSection, { marginTop: 32 }]}> 
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 18, textAlign: 'center', letterSpacing: 0.5 }}>¿Por qué elegirnos?</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 0 }}>
                {/* Card 1 */}
                <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 18, alignItems: 'center', width: '45%', margin: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 }}>
                  <MaterialIcons name="flight" size={36} color={BOA_COLORS.primary} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: BOA_COLORS.primary, marginTop: 10, marginBottom: 4, textAlign: 'center' }}>Envíos Internacionales</Text>
                  <Text style={{ fontSize: 14, color: BOA_COLORS.gray, textAlign: 'center', lineHeight: 18 }}>Cobertura global con las mejores aerolíneas</Text>
                </View>
                {/* Card 2 */}
                <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 18, alignItems: 'center', width: '45%', margin: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 }}>
                  <MaterialIcons name="schedule" size={36} color={BOA_COLORS.primary} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: BOA_COLORS.primary, marginTop: 10, marginBottom: 4, textAlign: 'center' }}>Tiempo Real</Text>
                  <Text style={{ fontSize: 14, color: BOA_COLORS.gray, textAlign: 'center', lineHeight: 18 }}>Actualizaciones instantáneas de tu paquete</Text>
                </View>
                {/* Card 3 */}
                <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 18, alignItems: 'center', width: '45%', margin: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 }}>
                  <MaterialIcons name="security" size={36} color={BOA_COLORS.primary} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: BOA_COLORS.primary, marginTop: 10, marginBottom: 4, textAlign: 'center' }}>Seguridad Garantizada</Text>
                  <Text style={{ fontSize: 14, color: BOA_COLORS.gray, textAlign: 'center', lineHeight: 18 }}>Manejo cuidadoso y seguro de tus envíos</Text>
                </View>
                {/* Card 4 */}
                <View style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 18, padding: 18, alignItems: 'center', width: '45%', margin: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 4 }}>
                  <MaterialIcons name="support-agent" size={36} color={BOA_COLORS.primary} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: BOA_COLORS.primary, marginTop: 10, marginBottom: 4, textAlign: 'center' }}>Soporte 24/7</Text>
                  <Text style={{ fontSize: 14, color: BOA_COLORS.gray, textAlign: 'center', lineHeight: 18 }}>Atención personalizada cuando la necesites</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <Footer onLogin={() => setShowLoginModal(true)} />

          <LoginModal
            visible={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLogin}
            onShowRegister={() => {
              setShowLoginModal(false);
              setShowRegisterModal(true);
            }}
          />

          <RegisterModal
            visible={showRegisterModal}
            onClose={() => setShowRegisterModal(false)}
            onRegisterSuccess={handleRegister}
          />
        </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  publicContent: { padding: 20, paddingBottom: 60 },
  loggedContent: { padding: 20, paddingBottom: 60 },
  heroSection: { alignItems: 'center', marginBottom: 32 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: BOA_COLORS.primary, marginBottom: 8, textAlign: 'center' },
  heroSubtitle: { fontSize: 18, color: BOA_COLORS.dark, marginBottom: 12, textAlign: 'center' },
  heroDescription: { fontSize: 14, color: BOA_COLORS.gray, textAlign: 'center', lineHeight: 20 },
  featuresSection: { marginBottom: 32 },
  featuresGrid: { gap: 16 },
  featureCard: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  featureTitle: { fontSize: 16, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, marginBottom: 4, textAlign: 'center' },
  featureText: { fontSize: 14, color: BOA_COLORS.gray, textAlign: 'center', lineHeight: 18 },
  ctaSection: { alignItems: 'center' },
  ctaTitle: { fontSize: 22, fontWeight: 'bold', color: BOA_COLORS.primary, marginBottom: 8, textAlign: 'center' },
  ctaText: { fontSize: 16, color: BOA_COLORS.dark, marginBottom: 20, textAlign: 'center' },
  ctaButtons: { flexDirection: 'column', gap: 12 },
  ctaButton: { backgroundColor: BOA_COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  ctaButtonPrimary: { backgroundColor: BOA_COLORS.primary },
  ctaButtonSecondary: { backgroundColor: 'transparent', borderWidth: 2, borderColor: BOA_COLORS.primary },
  ctaButtonText: { color: BOA_COLORS.white, fontWeight: 'bold', fontSize: 16 },
  ctaButtonTextPrimary: { color: BOA_COLORS.white },
  ctaButtonTextSecondary: { color: BOA_COLORS.primary },
  welcomeSection: { alignItems: 'center', marginBottom: 24 },
  welcomeCard: { 
    backgroundColor: 'rgba(255,255,255,0.8)', 
    borderRadius: 10, 
    padding: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.07, 
    shadowRadius: 2, 
    elevation: 1,
    minWidth: '90%',
  },
  welcomeTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: BOA_COLORS.primary, 
    marginBottom: 4, 
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  welcomeSubtitle: { 
    fontSize: 14, 
    color: BOA_COLORS.dark, 
    textAlign: 'center',
    fontWeight: '400',
  },
  adminDashboard: { marginBottom: 24 },
  userDashboard: { marginBottom: 24 },
  dashboardTitleCard: { 
    backgroundColor: 'rgba(255,255,255,0.7)', 
    borderRadius: 10, 
    padding: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 14, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.07, 
    shadowRadius: 2, 
    elevation: 1,
  },
  dashboardTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: BOA_COLORS.primary, 
    marginLeft: 8,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 16, alignItems: 'center', flex: 1, minWidth: '45%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: BOA_COLORS.primary, marginTop: 4 },
  statLabel: { fontSize: 12, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 2 },
  userInfoCard: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  userInfo: { marginLeft: 12 },
  userName: { fontSize: 18, fontWeight: 'bold', color: BOA_COLORS.dark },
  userEmail: { fontSize: 14, color: BOA_COLORS.gray },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 20, alignItems: 'center', flex: 1, minWidth: '30%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  actionTitle: { fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' },
  sectionTitleCard: { 
    backgroundColor: 'rgba(255,255,255,0.7)', 
    borderRadius: 10, 
    padding: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 14, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.07, 
    shadowRadius: 2, 
    elevation: 1,
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: BOA_COLORS.primary, 
    marginLeft: 8,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  packagesContainer: { marginBottom: 24 },
  packageCard: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  packageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  packageInfo: { flex: 1 },
  packageNumber: { fontSize: 18, fontWeight: 'bold', color: BOA_COLORS.dark },
  packageDescription: { fontSize: 14, color: BOA_COLORS.gray },
  packageStatus: { flexDirection: 'column', alignItems: 'flex-start' },
  statusText: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  locationText: { fontSize: 12, color: BOA_COLORS.gray, marginBottom: 2 },
  dateText: { fontSize: 12, color: BOA_COLORS.gray },
}); 