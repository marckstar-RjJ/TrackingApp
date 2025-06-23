import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, SafeAreaView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';
import { Header } from '../components/Header';
import { ShippingRegistrationModal } from '../components/ShippingRegistrationModal';
import { PackageScannerModal } from '../components/PackageScannerModal';
import { BACKEND_URL } from '../utils/backend';

export const HomeAdminScreen = ({ currentUser, navigation, handleLogout }: any) => {
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [realPackages, setRealPackages] = useState<any[]>([]);
  const [searchTracking, setSearchTracking] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/packages`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setRealPackages(data);
        } else {
          setRealPackages([]);
        }
      } catch (e) {
        setRealPackages([]);
      }
    };

    fetchPackages();
  }, []);

  const handleShippingRegistered = (shippingData: any, trackingNumber: string) => {
    // Aquí puedes agregar lógica de feedback si lo deseas
    setShowShippingModal(false);
    navigation.navigate('Tracking', { currentUser });
  };

  const handleEventRegistered = (trackingNumber: string, event: any) => {
    setShowScannerModal(false);
    navigation.navigate('TrackingDetail', { trackingItem: { trackingNumber, events: [event] }, currentUser });
  };

  const handleOpenHistoryList = () => setShowHistoryList(true);
  const handleCloseHistoryList = () => setShowHistoryList(false);
  const handleSelectPackage = (pkg: any) => {
    setShowHistoryList(false);
    navigation.navigate('PackageHistory', {
      trackingNumber: pkg.tracking_number || pkg.trackingNumber,
      currentUser,
    });
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: BOA_COLORS.primary }]}> 
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <Header 
          onLogin={handleLogout}
          isLoggedIn={!!currentUser}
        />
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 15, padding: 16, minWidth: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: BOA_COLORS.primary, marginBottom: 6, textAlign: 'center' }}>
                ¡Bienvenido, {currentUser.name}!
              </Text>
              <Text style={{ fontSize: 16, color: BOA_COLORS.dark, textAlign: 'center', fontWeight: '500' }}>Panel de Administración</Text>
            </View>
          </View>

          {/* Información del usuario */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 15, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <MaterialIcons name="admin-panel-settings" size={28} color={BOA_COLORS.primary} />
            <View style={{ marginLeft: 15 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: BOA_COLORS.dark }}>{currentUser.name}</Text>
              <Text style={{ fontSize: 14, color: BOA_COLORS.gray }}>Administrador del Sistema</Text>
              <Text style={{ fontSize: 12, color: BOA_COLORS.primary }}>{currentUser.email}</Text>
            </View>
          </View>

          {/* ÁREA LOGÍSTICA */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ backgroundColor: 'rgba(156,39,176,0.1)', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <MaterialIcons name="local-shipping" size={24} color="#9C27B0" />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#9C27B0' }}>Área Logística</Text>
                <Text style={{ fontSize: 13, color: BOA_COLORS.gray }}>Gestión de envíos y seguimiento de paquetes</Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderRadius: 12, 
                  padding: 16, 
                  alignItems: 'center', 
                  flex: 1, 
                  minWidth: '45%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }} 
                onPress={() => setShowShippingModal(true)}
              >
                <MaterialIcons name="add-box" size={32} color="#9C27B0" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Registrar Envío</Text>
                <Text style={{ fontSize: 11, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 4 }}>Crear nuevo paquete en el sistema</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderRadius: 12, 
                  padding: 16, 
                  alignItems: 'center', 
                  flex: 1, 
                  minWidth: '45%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }} 
                onPress={() => setShowScannerModal(true)}
              >
                <MaterialIcons name="qr-code-scanner" size={32} color="#9C27B0" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Escanear Paquete</Text>
                <Text style={{ fontSize: 11, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 4 }}>Actualizar estado con escáner</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderRadius: 12, 
                  padding: 16, 
                  alignItems: 'center', 
                  flex: 1, 
                  minWidth: '45%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }} 
                onPress={() => navigation.navigate('Tracking', { currentUser })}
              >
                <MaterialIcons name="track-changes" size={32} color="#9C27B0" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Seguimiento</Text>
                <Text style={{ fontSize: 11, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 4 }}>Consultar estado de paquetes</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderRadius: 12, 
                  padding: 16, 
                  alignItems: 'center', 
                  flex: 1, 
                  minWidth: '45%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }} 
                onPress={handleOpenHistoryList}
              >
                <MaterialIcons name="history" size={32} color="#9C27B0" />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Historial</Text>
                <Text style={{ fontSize: 11, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 4 }}>Ver historial completo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ÁREA DE ATENCIÓN AL CLIENTE */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ backgroundColor: 'rgba(76,175,80,0.1)', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <MaterialIcons name="support-agent" size={24} color={BOA_COLORS.success} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: BOA_COLORS.success }}>Atención al Cliente</Text>
                <Text style={{ fontSize: 13, color: BOA_COLORS.gray }}>Gestión de reclamos y soporte</Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderRadius: 12, 
                  padding: 16, 
                  alignItems: 'center', 
                  flex: 1, 
                  minWidth: '45%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }} 
                onPress={() => navigation.navigate('AdminClaims', { currentUser, handleLogout })}
              >
                <MaterialIcons name="announcement" size={32} color={BOA_COLORS.success} />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Reclamos</Text>
                <Text style={{ fontSize: 11, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 4 }}>Gestionar reclamos de usuarios</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderRadius: 12, 
                  padding: 16, 
                  alignItems: 'center', 
                  flex: 1, 
                  minWidth: '45%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }} 
                onPress={() => navigation.navigate('AdminReturns')}
              >
                <MaterialIcons name="assignment-return" size={32} color={BOA_COLORS.success} />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Devoluciones</Text>
                <Text style={{ fontSize: 11, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 4 }}>Gestionar solicitudes de devolución</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ÁREA DE GESTIÓN OPERATIVA */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ backgroundColor: 'rgba(255,152,0,0.1)', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <MaterialIcons name="settings" size={24} color={BOA_COLORS.warning} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: BOA_COLORS.warning }}>Gestión Operativa</Text>
                <Text style={{ fontSize: 13, color: BOA_COLORS.gray }}>Control y monitoreo del sistema</Text>
              </View>
            </View>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <TouchableOpacity 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderRadius: 12, 
                  padding: 16, 
                  alignItems: 'center', 
                  flex: 1, 
                  minWidth: '45%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }} 
                onPress={() => navigation.navigate('InternalAlerts')}
              >
                <MaterialIcons name="notifications-active" size={32} color={BOA_COLORS.warning} />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Alertas Internas</Text>
                <Text style={{ fontSize: 11, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 4 }}>Monitorear paquetes retrasados</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  borderRadius: 12, 
                  padding: 16, 
                  alignItems: 'center', 
                  flex: 1, 
                  minWidth: '45%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3
                }} 
                onPress={() => navigation.navigate('AllPreRegistrations')}
              >
                <MaterialIcons name="list-alt" size={32} color={BOA_COLORS.warning} />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Pre-Registros</Text>
                <Text style={{ fontSize: 11, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 4 }}>Revisar y aprobar solicitudes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Modal/lista de paquetes para historial */}
          {showHistoryList && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
              <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, width: '90%', maxWidth: 400 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: BOA_COLORS.primary }}>Selecciona un paquete</Text>
                <TextInput
                  style={{ borderWidth: 1, borderColor: BOA_COLORS.lightGray, borderRadius: 8, padding: 10, marginBottom: 14, fontSize: 16 }}
                  placeholder="Buscar por número de tracking..."
                  value={searchTracking}
                  onChangeText={setSearchTracking}
                  autoCapitalize="characters"
                />
                {realPackages.length === 0 && (
                  <Text style={{ color: BOA_COLORS.gray, fontSize: 16, textAlign: 'center' }}>No hay paquetes registrados.</Text>
                )}
                {realPackages
                  .filter(pkg =>
                    !searchTracking.trim() ||
                    (pkg.tracking_number || '').toLowerCase().includes(searchTracking.trim().toLowerCase())
                  )
                  .map(pkg => (
                    <TouchableOpacity key={pkg.id} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }} onPress={() => handleSelectPackage(pkg)}>
                      <Text style={{ fontSize: 16, color: BOA_COLORS.dark }}>{pkg.tracking_number} - {pkg.description}</Text>
                    </TouchableOpacity>
                  ))}
                <TouchableOpacity style={{ marginTop: 16, alignSelf: 'flex-end' }} onPress={handleCloseHistoryList}>
                  <Text style={{ color: BOA_COLORS.danger, fontWeight: 'bold' }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
      <ShippingRegistrationModal
        visible={showShippingModal}
        onClose={() => setShowShippingModal(false)}
        onShippingRegistered={handleShippingRegistered}
      />
      <PackageScannerModal
        visible={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onEventRegistered={handleEventRegistered}
        currentUser={currentUser}
      />
    </SafeAreaView>
  );
};

function getAlertColor(severity: string) {
  switch (severity) {
    case 'critical': return '#d32f2f';
    case 'high': return '#f57c00';
    case 'medium': return '#fbc02d';
    default: return '#1976d2';
  }
} 