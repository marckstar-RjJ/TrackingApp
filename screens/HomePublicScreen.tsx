import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';
import { Header } from '../components/Header';
import { AlertsSubscriptionModal } from '../components/AlertsSubscriptionModal';
import { ClaimModal } from '../components/ClaimModal';

export const HomePublicScreen = ({ currentUser, navigation, handleLogout, handleQuickAction }: any) => {
  const [isAlertModalVisible, setAlertModalVisible] = useState(false);
  const [isClaimModalVisible, setClaimModalVisible] = useState(false);

  const handleAlertsPress = () => {
    // En lugar de llamar a handleQuickAction, abrimos el modal
    setAlertModalVisible(true);
  };

  const handleClaimsPress = () => {
    setClaimModalVisible(true);
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
              <Text style={{ fontSize: 14, color: BOA_COLORS.dark, textAlign: 'center', fontWeight: '400' }}>Panel de Usuario</Text>
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
          {/* Acciones rápidas de usuario público */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <MaterialIcons name="flash-on" size={24} color={BOA_COLORS.primary} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: BOA_COLORS.primary, marginLeft: 8 }}>Acciones Rápidas</Text>
          </View>

          {/* Sección especial para pre-registros */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: 18, marginBottom: 18 }}>
            <Text style={{ color: BOA_COLORS.accent, fontWeight: 'bold', fontSize: 16, marginBottom: 8, textAlign: 'center' }}>
              Pre-registros: tu acceso rápido a la atención
            </Text>
            <Text style={{ color: BOA_COLORS.gray, fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
              Usa estos botones para crear y gestionar tus pre-registros. El número de pre-registro es tu referencia para cualquier consulta o atención en ventanilla.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={{ backgroundColor: 'rgba(25,118,210,0.10)', borderRadius: 12, padding: 18, alignItems: 'center', flex: 1 }} onPress={() => navigation.navigate('PreRegistration', { currentUser })}>
                <MaterialIcons name="add-box" size={32} color={BOA_COLORS.primary} />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Pre-registro</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: 'rgba(25,118,210,0.10)', borderRadius: 12, padding: 18, alignItems: 'center', flex: 1 }} onPress={() => handleQuickAction('my-packages')}>
                <MaterialIcons name="track-changes" size={32} color={BOA_COLORS.primary} />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Mis Paquetes</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 20, alignItems: 'center' }} onPress={() => navigation.navigate('PublicTrackingQuery')}>
                <MaterialIcons name="search" size={32} color={BOA_COLORS.primary} />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Consultar Paquete</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 13, color: BOA_COLORS.white, marginTop: 4, textAlign: 'center' }}>
                Consulta el estado de cualquier envío usando su número de seguimiento.
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 20, alignItems: 'center' }} onPress={handleAlertsPress}>
                <MaterialIcons name="notifications" size={32} color={BOA_COLORS.primary} />
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Mis Alertas</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 13, color: BOA_COLORS.white, marginTop: 4, textAlign: 'center' }}>
                Configura notificaciones automáticas para recibir avisos sobre el estado de tus envíos.
              </Text>
            </View>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: 18, marginBottom: 18, alignItems: 'center' }}>
            <TouchableOpacity style={{ backgroundColor: 'rgba(25,118,210,0.10)', borderRadius: 12, padding: 20, alignItems: 'center', width: '100%' }} onPress={handleClaimsPress}>
              <MaterialIcons name="support-agent" size={32} color={BOA_COLORS.primary} />
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: BOA_COLORS.dark, marginTop: 8, textAlign: 'center' }}>Soporte y Reclamos</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 13, color: BOA_COLORS.gray, marginTop: 4, textAlign: 'center' }}>
              ¿Tienes un problema o duda? Aquí puedes contactar a nuestro equipo de soporte y registrar reclamos.
            </Text>
          </View>
        </ScrollView>
        <AlertsSubscriptionModal
          visible={isAlertModalVisible}
          onClose={() => setAlertModalVisible(false)}
        />
        <ClaimModal
          visible={isClaimModalVisible}
          onClose={() => setClaimModalVisible(false)}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}; 