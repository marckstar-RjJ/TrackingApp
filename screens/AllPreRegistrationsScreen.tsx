import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { BOA_COLORS } from '../theme';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { PreRegistrationDetailModal } from '../components/PreRegistrationDetailModal';

// URL de la API (ajustar si es necesario)
const API_URL = 'https://b113-66-203-113-32.ngrok-free.app/api';

// Definimos el tipo para un pre-registro
interface PreRegistration {
  id: number;
  trackingNumber: string;
  sender_name: string;
  sender_email: string;
  sender_phone: string;
  sender_address: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_email: string;
  weight: number;
  cargo_type: string;
  origin_city: string;
  destination_city: string;
  description: string;
  priority: string;
  shipping_type: string;
  cost: number;
  estimated_delivery_date: string;
  user_email: string;
  created_at: string;
  status?: string;
  approved_at?: string;
  approved_tracking_number?: string;
}

export const AllPreRegistrationsScreen = ({ navigation, currentUser, handleLogout }: any) => {
  const [preregistrations, setPreregistrations] = useState<PreRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos'); // 'Todos', 'Pendiente', 'Aprobado'
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPreregistration, setSelectedPreregistration] = useState<PreRegistration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Función para obtener los pre-registros
  const fetchPreRegistrations = async (query = '', status = 'Todos') => {
    setIsLoading(true);
    try {
      let url = `${API_URL}/preregistrations/all?search=${query}`;
      if (status !== 'Todos') {
        url += `&status=${status}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener los pre-registros');
      }
      const data = await response.json();
      setPreregistrations(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los pre-registros.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos cuando la pantalla se enfoca o cambian los filtros
  useFocusEffect(
    useCallback(() => {
      fetchPreRegistrations(searchQuery, filterStatus);
    }, [searchQuery, filterStatus])
  );

  const handleSearch = () => {
    fetchPreRegistrations(searchQuery, filterStatus);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  const handleShowDetails = (preregistration: PreRegistration) => {
    setSelectedPreregistration(preregistration);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPreregistration(null);
  };

  const handleUpdate = () => {
    fetchPreRegistrations(searchQuery, filterStatus); // Recargar la lista
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${datePart} ${timePart} hs`;
  };

  const handleCopyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copiado', 'El número de tracking ha sido copiado al portapapeles.');
  };

  const renderItem = ({ item }: { item: PreRegistration }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.trackingNumber}>{item.trackingNumber}</Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          {item.status && (
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.status === 'Aprobado' ? BOA_COLORS.success : BOA_COLORS.warning }
            ]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>Descripción:</Text> {item.description}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>Remitente:</Text> {item.sender_name}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>Destinatario:</Text> {item.recipient_name}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>Peso:</Text> {item.weight} kg
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>Costo:</Text> Bs. {item.cost}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>Usuario:</Text> {item.user_email}
        </Text>
        
        {item.status === 'Aprobado' && item.approved_tracking_number && (
          <View style={styles.approvedInfo}>
            <View style={styles.approvedHeader}>
              <MaterialIcons name="check-circle" size={18} color={BOA_COLORS.info} style={styles.approvedIcon} />
              <Text style={styles.approvedTextLabel}>Tracking Aprobado</Text>
            </View>
            <TouchableOpacity 
              style={styles.copyContainer}
              onPress={() => handleCopyToClipboard(item.approved_tracking_number || '')}
              activeOpacity={0.7}
            >
              <Text style={styles.approvedTextValue}>{item.approved_tracking_number}</Text>
              <MaterialIcons name="content-copy" size={16} color={BOA_COLORS.success} />
            </TouchableOpacity>
            {item.approved_at && (
              <Text style={styles.approvedDate}>
                {formatDateTime(item.approved_at)}
              </Text>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleShowDetails(item)}
        >
          <Text style={styles.buttonText}>Ver Detalles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: BOA_COLORS.primary }]}>
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        
        <View style={styles.container}>
          <FullScreenLoader visible={isDeleting} message="Eliminando..." />
          
          {/* Barra de búsqueda */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <MaterialIcons name="search" size={20} color={BOA_COLORS.gray} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por Nro. de Pre-Registro"
                placeholderTextColor={BOA_COLORS.gray}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <MaterialIcons name="search" size={20} color={BOA_COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filtros */}
          <View style={styles.filterContainer}>
            {['Todos', 'Pendiente', 'Aprobado'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  filterStatus === status && styles.activeFilterButton,
                ]}
                onPress={() => handleFilterChange(status)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterStatus === status && styles.activeFilterButtonText,
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contenido principal */}
          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={BOA_COLORS.white} />
                <Text style={styles.loaderText}>Cargando preregistros...</Text>
              </View>
            ) : preregistrations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="inbox" size={64} color={BOA_COLORS.white} />
                <Text style={styles.emptyText}>No se encontraron pre-registros</Text>
                <Text style={styles.emptySubtext}>Intenta con una búsqueda diferente</Text>
              </View>
            ) : (
              <FlatList
                data={preregistrations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                onRefresh={() => fetchPreRegistrations(searchQuery, filterStatus)}
                refreshing={isLoading}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>

        {/* Modal de Detalles */}
        <PreRegistrationDetailModal
          visible={showDetailModal}
          onClose={handleCloseModal}
          preregistration={selectedPreregistration}
          onUpdate={handleUpdate}
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 60,
  },
  searchContainer: {
    paddingHorizontal: 10,
    marginTop: 0,
    marginBottom: 10,
  },
  searchBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingRight: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: BOA_COLORS.dark,
  },
  searchButton: {
    backgroundColor: BOA_COLORS.secondary,
    padding: 8,
    borderRadius: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilterButton: {
    backgroundColor: BOA_COLORS.white,
  },
  filterButtonText: {
    color: BOA_COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterButtonText: {
    color: BOA_COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    marginTop: 10,
  },
  list: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: BOA_COLORS.white,
    marginTop: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: BOA_COLORS.white,
    marginTop: 8,
    opacity: 0.8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BOA_COLORS.lightGray,
    paddingBottom: 10,
  },
  trackingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
  },
  date: {
    fontSize: 14,
    color: BOA_COLORS.gray,
  },
  cardBody: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: BOA_COLORS.dark,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailsButton: {
    backgroundColor: BOA_COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: BOA_COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  approvedInfo: {
    marginTop: 10,
    backgroundColor: 'rgba(45, 156, 219, 0.15)', // Fondo azulado sutil
    borderRadius: 8,
    padding: 12,
  },
  approvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvedIcon: {
    marginRight: 6,
  },
  approvedTextLabel: {
    color: BOA_COLORS.info,
    fontSize: 13,
    fontWeight: '600',
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    marginBottom: 6,
  },
  approvedTextValue: {
    fontSize: 16,
    color: BOA_COLORS.success,
    fontWeight: 'bold',
    marginRight: 8,
  },
  approvedDate: {
    fontSize: 12,
    color: BOA_COLORS.success,
    fontStyle: 'italic',
    marginLeft: 24,
  },
}); 