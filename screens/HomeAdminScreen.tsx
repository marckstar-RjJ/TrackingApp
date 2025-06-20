import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, SafeAreaView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';
import { Header } from '../components/Header';
import { ShippingRegistrationModal } from '../components/ShippingRegistrationModal';
import { PackageScannerModal } from '../components/PackageScannerModal';
import { checkInternalAlerts } from '../utils/tracking';

export const HomeAdminScreen = ({ currentUser, navigation, handleLogout }: any) => {
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [realPackages, setRealPackages] = useState<any[]>([]);
  const [searchTracking, setSearchTracking] = useState('');
  const [internalAlerts, setInternalAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('http://192.168.100.16:3000/api/packages');
        const data = await res.json();
        if (Array.isArray(data)) {
          setRealPackages(data);
          // Procesar alertas internas
          // Mapear eventos a formato TrackingItem
          const trackingItems = data.map((pkg: any) => ({
            ...pkg,
            trackingNumber: pkg.tracking_number,
            events: Array.isArray(pkg.events)
              ? pkg.events.map((ev: any) => ({
                  ...ev,
                  timestamp: ev.timestamp ? new Date(ev.timestamp.replace(' ', 'T')) : null
                }))
              : [],
          }));
          setInternalAlerts(checkInternalAlerts(trackingItems));
        } else {
          setRealPackages([]);
          setInternalAlerts([]);
        }
      } catch (e) {
        setRealPackages([]);
        setInternalAlerts([]);
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
            <View style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 10, padding: 12, minWidth: '90%' }}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: BOA_COLORS.primary, marginBottom: 4, textAlign: 'center' }}>
                ¡Bienvenido, {currentUser.name}!
              </Text>
              <Text style={{ fontSize: 14, color: BOA_COLORS.dark, textAlign: 'center', fontWeight: '400' }}>Panel de Administración</Text>
            </View>
          </View>
          {/* Información del usuario */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <MaterialIcons name="person" size={24} color={BOA_COLORS.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: BOA_COLORS.dark }}>{currentUser.name}</Text>
              <Text style={{ fontSize: 14, color: BOA_COLORS.gray }}>{currentUser.email}</Text>
            </View>
          </View>
          {/* Panel de administración */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <MaterialIcons name="dashboard" size={24} color={BOA_COLORS.primary} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: BOA_COLORS.primary, marginLeft: 8 }}>Panel de Administración</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 16, alignItems: 'center', flex: 1, minWidth: '45%' }} onPress={() => setShowShippingModal(true)}>
                <MaterialIcons name="add-box" size={28} color={BOA_COLORS.primary} />
                <Text style={{ fontSize: 12, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 2 }}>Registrar Envío</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 16, alignItems: 'center', flex: 1, minWidth: '45%' }} onPress={() => setShowScannerModal(true)}>
                <MaterialIcons name="qr-code-scanner" size={28} color={BOA_COLORS.primary} />
                <Text style={{ fontSize: 12, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 2 }}>Escanear Paquete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 16, alignItems: 'center', flex: 1, minWidth: '45%' }} onPress={() => navigation.navigate('Tracking', { currentUser })}>
                <MaterialIcons name="local-shipping" size={28} color={BOA_COLORS.primary} />
                <Text style={{ fontSize: 12, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 2 }}>Seguimiento</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 16, alignItems: 'center', flex: 1, minWidth: '45%' }} onPress={handleOpenHistoryList}>
                <MaterialIcons name="history" size={28} color={BOA_COLORS.primary} />
                <Text style={{ fontSize: 12, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 2 }}>Historial</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 16, alignItems: 'center', flex: 1, minWidth: '45%' }} onPress={() => navigation.navigate('InternalAlerts', { currentUser })}>
                <MaterialIcons name="notifications-active" size={28} color={BOA_COLORS.primary} />
                <Text style={{ fontSize: 12, color: BOA_COLORS.gray, textAlign: 'center', marginTop: 2 }}>Alertas Internas</Text>
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
          {/* Panel de alertas internas */}
          {internalAlerts.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <MaterialIcons name="notifications-active" size={24} color={BOA_COLORS.danger} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: BOA_COLORS.danger, marginLeft: 8 }}>Alertas Internas de Retraso</Text>
              </View>
              {internalAlerts.map(alert => (
                <View key={alert.id} style={{ backgroundColor: getAlertColor(alert.severity), borderRadius: 12, padding: 16, marginBottom: 10 }}>
                  <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 16 }}>{alert.title}</Text>
                  <Text style={{ color: '#fff', marginTop: 4 }}>{alert.description}</Text>
                  <Text style={{ color: '#fff', marginTop: 4, fontSize: 13 }}>Tracking: {alert.trackingNumber}</Text>
                  <Text style={{ color: '#fff', marginTop: 2, fontSize: 13 }}>Última actualización: {alert.lastUpdate ? new Date(alert.lastUpdate).toLocaleString() : 'N/A'}</Text>
                  <Text style={{ color: '#fff', marginTop: 2, fontSize: 13 }}>Retraso: {alert.timeSinceLastUpdate.toFixed(1)} horas</Text>
                </View>
              ))}
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