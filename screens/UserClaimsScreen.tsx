import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl, StyleSheet, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';

// FIXME: Replace with your actual IP address
const API_URL = 'https://b113-66-203-113-32.ngrok-free.app/api';

export const UserClaimsScreen = ({ route, navigation }: any) => {
  const { currentUser, handleLogout } = route.params;
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClaims = async () => {
    if (!currentUser?.email) return;
    try {
      const response = await fetch(`${API_URL}/claims/user/${currentUser.email}`);
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setClaims(data);
      } else {
        console.error("Error fetching user claims or data is not an array:", data);
        setClaims([]);
      }
    } catch (error) {
      console.error("Error fetching user claims:", error);
      setClaims([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [currentUser]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClaims();
  }, [currentUser]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading ? (
            <ActivityIndicator size="large" color={BOA_COLORS.primary} />
          ) : claims.length === 0 ? (
            <Text style={styles.noClaimsText}>No tienes reclamos registrados.</Text>
          ) : (
            claims.map((claim) => (
              <View key={claim.id} style={styles.claimContainer}>
                <Text style={styles.claimText}><Text style={styles.bold}>Reclamo ID:</Text> {claim.id}</Text>
                {claim.tracking_number && (
                  <Text style={styles.claimText}><Text style={styles.bold}>Tracking del paquete:</Text> {claim.tracking_number}</Text>
                )}
                <Text style={styles.claimText}><Text style={styles.bold}>Tipo:</Text> {claim.claim_type}</Text>
                <Text style={styles.claimText}><Text style={styles.bold}>Descripción:</Text> {claim.description}</Text>
                <Text style={styles.claimText}><Text style={styles.bold}>Estado:</Text> {claim.status || 'Pendiente'}</Text>
                {claim.response && (
                  <View style={styles.responseContainer}>
                    <Text style={styles.bold}>Respuesta del Administrador:</Text>
                    <Text>{claim.response}</Text>
                    <Text style={styles.responseText}>Respondido por: {claim.response_by} el {new Date(claim.responded_at).toLocaleString()}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOA_COLORS.primary,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  claimContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  claimText: {
    fontSize: 16,
    color: BOA_COLORS.dark,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  trackingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    borderRadius: 5,
    marginBottom: 5,
  },
  responseContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'rgba(0, 99, 178, 0.05)',
    padding: 10,
    borderRadius: 5,
  },
  responseText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: BOA_COLORS.gray,
    marginTop: 5,
  },
  noClaimsText: {
    textAlign: 'center',
    fontSize: 16,
    color: BOA_COLORS.gray,
    marginTop: 20,
  }
}); 