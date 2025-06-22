import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, StyleSheet, Alert, ImageBackground, TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';
import { Header } from '../components/Header';
import { ClaimResponseModal } from '../components/ClaimResponseModal';

// FIXME: Replace with your actual IP address
const API_URL = 'http://192.168.100.16:3000/api';

export const AdminClaimsScreen = ({ route, navigation }: any) => {
  const { currentUser, handleLogout } = route.params;
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos'); // 'Todos', 'Pendiente', 'Respondido'

  const fetchClaims = async () => {
    try {
      const response = await fetch(`${API_URL}/claims`);
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setClaims(data);
      } else {
        console.error("Error fetching claims or data is not an array:", data);
        setClaims([]);
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
      setClaims([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClaims();
  }, []);

  const handleOpenModal = (claim: any) => {
    setSelectedClaim(claim);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedClaim(null);
    setIsModalVisible(false);
  };

  const handleRespond = async (response: string) => {
    if (!selectedClaim) return;
    try {
      await fetch(`${API_URL}/claims/${selectedClaim.id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response, admin_name: currentUser.name }),
      });
      fetchClaims(); // Refresh claims list
      handleCloseModal();
    } catch (error) {
      console.error("Error responding to claim:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copiado', 'Número de seguimiento copiado al portapapeles.');
  };

  const filteredClaims = claims.filter(claim => {
    const matchesId = claim.id.toString().includes(searchId);
    
    let matchesStatus = true; // 'Todos'
    if (statusFilter === 'Pendiente') {
      matchesStatus = (claim.status || '').toLowerCase() !== 'respondido';
    } else if (statusFilter === 'Respondido') {
      matchesStatus = (claim.status || '').toLowerCase() === 'respondido';
    }

    return matchesId && matchesStatus;
  });

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
          <View style={styles.filtersContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por ID de reclamo..."
              value={searchId}
              onChangeText={setSearchId}
              keyboardType="number-pad"
            />
            <View style={styles.statusButtons}>
              <TouchableOpacity
                style={[styles.statusButton, statusFilter === 'Todos' && styles.activeStatus]}
                onPress={() => setStatusFilter('Todos')}
              >
                <Text style={[styles.statusButtonText, statusFilter === 'Todos' && styles.activeStatusText]}>Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, statusFilter === 'Pendiente' && styles.activeStatus]}
                onPress={() => setStatusFilter('Pendiente')}
              >
                <Text style={[styles.statusButtonText, statusFilter === 'Pendiente' && styles.activeStatusText]}>Pendientes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, statusFilter === 'Respondido' && styles.activeStatus]}
                onPress={() => setStatusFilter('Respondido')}
              >
                <Text style={[styles.statusButtonText, statusFilter === 'Respondido' && styles.activeStatusText]}>Respondidos</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={BOA_COLORS.primary} />
          ) : (
            filteredClaims.map((claim) => (
              <View key={claim.id} style={styles.claimContainer}>
                <Text style={styles.claimText}><Text style={styles.bold}>De:</Text> {claim.name}</Text>
                <Text style={styles.emailText}>{claim.email}</Text>
                {claim.tracking_number && (
                  <View style={styles.trackingContainer}>
                    <Text style={styles.claimText}><Text style={styles.bold}>Tracking:</Text> {claim.tracking_number}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(claim.tracking_number)}>
                      <MaterialIcons name="content-copy" size={22} color={BOA_COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                )}
                <Text style={styles.claimText}><Text style={styles.bold}>Reclamo:</Text> {claim.description}</Text>
                <Text style={styles.claimText}><Text style={styles.bold}>Estado:</Text> {claim.status || 'Pendiente'}</Text>
                {claim.response && (
                   <Text style={styles.claimText}><Text style={styles.bold}>Respuesta:</Text> {claim.response}</Text>
                )}
                <TouchableOpacity style={styles.button} onPress={() => handleOpenModal(claim)}>
                  <Text style={styles.buttonText}>{claim.response ? 'Ver/Editar Respuesta' : 'Responder'}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
        {selectedClaim && (
          <ClaimResponseModal
            visible={isModalVisible}
            onClose={handleCloseModal}
            claim={selectedClaim}
            onRespond={handleRespond}
          />
        )}
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
  filtersContainer: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeStatus: {
    backgroundColor: BOA_COLORS.primary,
  },
  statusButtonText: {
    color: BOA_COLORS.dark,
    fontWeight: '600',
  },
  activeStatusText: {
    color: '#fff',
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
  emailText: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginLeft: 10,
    marginBottom: 10,
    fontStyle: 'italic',
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
  button: {
    backgroundColor: BOA_COLORS.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
}); 