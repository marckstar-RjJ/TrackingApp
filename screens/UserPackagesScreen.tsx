import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { BOA_COLORS } from '../theme/colors';
import { Alert as RNAlert } from 'react-native';
import { FullScreenLoader } from '../components/FullScreenLoader';

interface UserPackagesScreenProps {
  navigation: any;
  route: any;
}

export const UserPackagesScreen: React.FC<UserPackagesScreenProps> = ({ navigation, route }) => {
  const { currentUser } = route.params || {};
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && currentUser.email) {
      fetchUserPreRegistrations();
    } else {
      Alert.alert("Error", "No se ha podido identificar al usuario.");
      setIsLoading(false);
    }
  }, [currentUser]);

  const fetchUserPreRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://192.168.100.16:3000/api/preregistrations/${currentUser.email}`);
      const data = await response.json();
      if (response.ok) {
        setPackages(data);
      } else {
        Alert.alert("Error", data.error || "No se pudieron cargar los pre-registros.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error de Conexión", "No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackagePress = (pkg: any) => {
    navigation.navigate('TrackingDetail', { 
      trackingItem: { 
        ...pkg,
        trackingNumber: pkg.preregistration_tracking_number,
        status: 'Pre-registrado',
        estimatedDelivery: pkg.estimated_delivery_date,
        events: [{
          id: pkg.id,
          eventType: 'Pre-Registro',
          description: 'Envío pre-registrado por el cliente.',
          location: pkg.origin_city,
          timestamp: new Date(pkg.created_at),
          operator: 'Sistema'
        }]
      }, 
      currentUser 
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDelete = (pkg: any) => {
    RNAlert.alert(
      '¿Borrar pre-registro?',
      '¿Estás seguro de que deseas borrar este pre-registro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(pkg.id);
            try {
              const res = await fetch(`http://192.168.100.16:3000/api/preregistrations/${pkg.id}`, { method: 'DELETE' });
              if (res.ok) {
                setPackages((prev) => prev.filter((p: any) => p.id !== pkg.id));
              } else {
                Alert.alert('Error', 'No se pudo borrar el pre-registro.');
              }
            } catch (e) {
              Alert.alert('Error', 'No se pudo conectar con el servidor.');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const handleCopyTracking = (trackingNumber: string) => {
    Clipboard.setStringAsync(trackingNumber);
    Alert.alert('¡Copiado!', 'El número de tracking se copió al portapapeles.');
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={BOA_COLORS.white} style={{ marginTop: 50 }} />;
    }

    if (packages.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inbox" size={64} color={BOA_COLORS.lightGray} />
          <Text style={styles.emptyText}>No tienes pre-registros.</Text>
          <Text style={styles.emptySubtitle}>Cuando crees un pre-registro, aparecerá aquí.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('PreRegistration', { currentUser })}>
            <Text style={styles.emptyButtonText}>Crear Pre-registro</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.packagesContainer}>
        {packages.map((pkg: any) => (
          <TouchableOpacity
            key={pkg.id}
            style={styles.packageCard}
            onPress={() => handlePackagePress(pkg)}
          >
            <View style={styles.packageHeader}>
              <View style={styles.packageInfo}>
                <View style={styles.trackingRow}>
                  <Text style={styles.packageNumber}>{pkg.preregistration_tracking_number}</Text>
                  <TouchableOpacity onPress={() => handleCopyTracking(pkg.preregistration_tracking_number)} style={styles.copyIconBtn}>
                    <MaterialIcons name="content-copy" size={18} color={BOA_COLORS.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.packageDescription}>{pkg.description}</Text>
              </View>
              <MaterialIcons name="assignment" size={32} color={BOA_COLORS.primary} />
            </View>

            <View style={styles.packageStatus}>
              <View style={styles.statusRow}>
                <MaterialIcons name="info" size={16} color={BOA_COLORS.gray} />
                <Text style={[styles.statusText, { color: BOA_COLORS.warning }]}>
                  Pre-registrado
                </Text>
              </View>

              <View style={styles.statusRow}>
                <MaterialIcons name="person" size={16} color={BOA_COLORS.gray} />
                <Text style={styles.locationText}>De: {pkg.sender_name}</Text>
              </View>

              <View style={styles.statusRow}>
                <MaterialIcons name="person-pin" size={16} color={BOA_COLORS.gray} />
                <Text style={styles.locationText}>Para: {pkg.recipient_name}</Text>
              </View>

              <View style={styles.statusRow}>
                <MaterialIcons name="schedule" size={16} color={BOA_COLORS.gray} />
                <Text style={styles.dateText}>{new Date(pkg.created_at).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { marginRight: 8 }]}
                  onPress={() => handlePackagePress(pkg)}
                >
                  <MaterialIcons name="visibility" size={20} color={BOA_COLORS.white} />
                  <Text style={styles.actionButtonText}>Ver Detalles</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton, { marginRight: 0, opacity: deletingId === pkg.id ? 0.5 : 1 }]}
                  onPress={() => handleDelete(pkg)}
                  disabled={deletingId === pkg.id}
                >
                  <MaterialIcons name="delete" size={20} color={BOA_COLORS.white} />
                  <Text style={styles.actionButtonText}>Borrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}>
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {/* Loader global para carga y borrado */}
        <FullScreenLoader visible={isLoading || !!deletingId} message={deletingId ? 'Borrando...' : 'Cargando...'} />
        {/* Header simplificado */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color={BOA_COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Pre-Registros</Text>
          <View style={styles.headerRight} />
        </View>
        
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <View style={styles.headerCard}>
              <MaterialIcons name="assignment" size={32} color={BOA_COLORS.primary} />
              <Text style={styles.headerTitleCard}>Mis Pre-Registros</Text>
              {!isLoading && (
              <Text style={styles.headerSubtitle}>
                  {packages.length} pre-registros encontrados
              </Text>
              )}
            </View>
          </View>
          {renderContent()}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(25, 118, 210, 0.9)',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
    headerTitleCard: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginTop: 8,
  },
  headerRight: {
    width: 40,
  },
  content: { padding: 20, paddingBottom: 60 },
  headerSection: { marginBottom: 24 },
  headerCard: { 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    borderRadius: 12, 
    padding: 20, 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: BOA_COLORS.gray, 
    textAlign: 'center' 
  },
  packagesContainer: {
    gap: 20,
  },
  packageCard: { 
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12, 
    padding: 16,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  packageHeader: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: BOA_COLORS.lightGray,
    paddingBottom: 12,
    marginBottom: 12,
  },
  packageInfo: {
    flex: 1,
  },
  trackingRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
  },
  packageNumber: { 
    fontSize: 16,
    fontWeight: 'bold', 
    color: BOA_COLORS.accent,
  },
  packageDescription: { 
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginTop: 4,
  },
  packageStatus: {
    marginBottom: 12,
    gap: 8,
  },
  statusRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  statusText: { 
    fontSize: 14,
    fontWeight: 'bold', 
    marginLeft: 8,
  },
  locationText: { 
    fontSize: 14, 
    color: BOA_COLORS.dark, 
    marginLeft: 8,
    flex: 1,
  },
  dateText: { 
    fontSize: 14, 
    color: BOA_COLORS.dark,
    marginLeft: 8,
  },
  actionRow: { 
    borderTopWidth: 1,
    borderTopColor: BOA_COLORS.lightGray,
    paddingTop: 12,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: BOA_COLORS.danger,
  },
  actionButton: { 
    backgroundColor: BOA_COLORS.primary,
    borderRadius: 8,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 14,
    flex: 1,
  },
  actionButtonText: { 
    color: BOA_COLORS.white, 
    fontWeight: 'bold', 
    fontSize: 16,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: BOA_COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
  },
    emptyButton: {
    backgroundColor: BOA_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 24,
  },
  emptyButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  copyIconBtn: {
    marginLeft: 6,
    padding: 4,
  },
}); 