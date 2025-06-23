import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  Clipboard,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, isAdmin, isPublic } from '../utils/auth';
import { TrackingDetailScreen } from './TrackingDetailScreen';
import { calculateProgress } from '../utils/tracking';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { BACKEND_URL } from '../utils/backend';

const { width } = Dimensions.get('window');

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

interface TrackingItem {
  id: number;
  trackingNumber: string;
  status: string;
  location: string;
  lastUpdate: string;
  estimatedDelivery: string;
  progress: number;
  description: string;
  priority: 'low' | 'medium' | 'high';
  receivedBy?: string;
  receivedAt?: string;
  events?: any[];
}

export const TrackingScreen = ({ navigation, route }: any) => {
  const currentUser: User | null = route.params?.currentUser || null;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showReceptionForm, setShowReceptionForm] = useState(false);
  const [showTrackingSearch, setShowTrackingSearch] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<TrackingItem | null>(null);
  
  const [newPackage, setNewPackage] = useState({
    trackingNumber: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    location: '',
  });

  // Datos de ejemplo para tracking
  const [trackingData, setTrackingData] = useState<TrackingItem[]>([
    {
      id: 1,
      trackingNumber: 'BOA-2024-001',
      status: 'En vuelo',
      location: 'En vuelo hacia La Paz',
      lastUpdate: 'Hace 2 horas',
      estimatedDelivery: '15 Mar 2024',
      progress: 75,
      description: 'Paquete electrónico - 2kg',
      priority: 'high',
    },
    {
      id: 2,
      trackingNumber: 'BOA-2024-002',
      status: 'Entregado',
      location: 'Barcelona, España',
      lastUpdate: 'Hace 1 día',
      estimatedDelivery: '12 Mar 2024',
      progress: 100,
      description: 'Documentos importantes - 0.5kg',
      priority: 'medium',
    },
    {
      id: 3,
      trackingNumber: 'BOA-2024-003',
      status: 'En procesamiento',
      location: 'Centro de Distribución Madrid',
      lastUpdate: 'Hace 3 horas',
      estimatedDelivery: '18 Mar 2024',
      progress: 25,
      description: 'Mercancía general - 5kg',
      priority: 'low',
    },
    {
      id: 4,
      trackingNumber: 'BOA-2024-004',
      status: 'En tránsito',
      location: 'En ruta hacia Sevilla',
      lastUpdate: 'Hace 30 min',
      estimatedDelivery: '16 Mar 2024',
      progress: 60,
      description: 'Productos frágiles - 1.5kg',
      priority: 'high',
    },
    {
      id: 5,
      trackingNumber: 'BOA-2024-005',
      status: 'Retenido en aduana',
      location: 'Aduana de Bilbao',
      lastUpdate: 'Hace 5 horas',
      estimatedDelivery: '20 Mar 2024',
      progress: 40,
      description: 'Importación internacional - 10kg',
      priority: 'high',
    },
    {
      id: 6,
      trackingNumber: 'BOA-2024-006',
      status: 'En almacén',
      location: 'Centro de Distribución Valencia',
      lastUpdate: 'Hace 1 hora',
      estimatedDelivery: '17 Mar 2024',
      progress: 30,
      description: 'Ropa y accesorios - 3kg',
      priority: 'medium',
    },
  ]);

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/packages`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // Adaptar los datos del backend al formato esperado
          const mapped = data.map((pkg, idx) => ({
            id: pkg.id || idx,
            trackingNumber: pkg.tracking_number,
            status: pkg.status || 'Desconocido',
            location: pkg.location || '',
            lastUpdate: pkg.updated_at || pkg.created_at || '',
            estimatedDelivery: pkg.estimated_delivery_date || '',
            progress: calculateProgress(pkg.events || []),
            description: pkg.description || '',
            priority: pkg.priority || 'medium',
            receivedBy: '',
            receivedAt: '',
            events: pkg.events || [],
          }));
          setTrackingData(mapped);
        }
      } catch (e) {
        // Puedes mostrar un error si quieres
      }
      setIsLoading(false);
    };
    fetchPackages();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
      case 'recibido':
      case 'en almacén':
        return BOA_COLORS.success;
      case 'classified':
      case 'clasificado':
      case 'en procesamiento':
        return BOA_COLORS.secondary;
      case 'dispatched':
      case 'despachado':
      case 'en tránsito':
        return BOA_COLORS.warning;
      case 'in_flight':
      case 'en vuelo':
        return BOA_COLORS.primary;
      case 'customs_clearance':
      case 'aduanas':
      case 'retenido en aduana':
        return BOA_COLORS.danger;
      case 'out_for_delivery':
      case 'en entrega':
        return BOA_COLORS.accent;
      case 'delivered':
      case 'entregado':
        return BOA_COLORS.success;
      default:
        return BOA_COLORS.gray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
      case 'recibido':
      case 'en almacén':
        return 'inbox';
      case 'classified':
      case 'clasificado':
      case 'en procesamiento':
        return 'sort';
      case 'dispatched':
      case 'despachado':
      case 'en tránsito':
        return 'local-shipping';
      case 'in_flight':
      case 'en vuelo':
        return 'flight';
      case 'customs_clearance':
      case 'aduanas':
      case 'retenido en aduana':
        return 'gavel';
      case 'out_for_delivery':
      case 'en entrega':
        return 'delivery-dining';
      case 'delivered':
      case 'entregado':
        return 'check-circle';
      default:
        return 'local-shipping';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return BOA_COLORS.danger;
      case 'medium':
        return BOA_COLORS.warning;
      case 'low':
        return BOA_COLORS.success;
      default:
        return BOA_COLORS.gray;
    }
  };

  const filteredData = trackingData.filter(item => {
    const matchesSearch = item.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Lógica de filtrado actualizada para los nuevos tipos de eventos
    let matchesFilter = true;
    if (selectedFilter !== 'all') {
      // Mapear los filtros a los estados correspondientes
      const statusMapping: { [key: string]: string[] } = {
        'received': ['received', 'Recibido', 'En almacén'],
        'classified': ['classified', 'Clasificado', 'En procesamiento'],
        'dispatched': ['dispatched', 'Despachado', 'En tránsito'],
        'in_flight': ['in_flight', 'En vuelo'],
        'customs_clearance': ['customs_clearance', 'Aduanas', 'Retenido en aduana'],
        'out_for_delivery': ['out_for_delivery', 'En Entrega'],
        'delivered': ['delivered', 'Entregado']
      };
      
      const validStatuses = statusMapping[selectedFilter] || [];
      matchesFilter = validStatuses.some(status => 
        item.status.toLowerCase().includes(status.toLowerCase())
      );
    }
    
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (item: TrackingItem) => {
    if (navigation) {
      navigation.navigate('TrackingDetail', {
        trackingItem: {
          ...item,
          events: item.events || [],
          progress: calculateProgress(item.events || []),
        },
        currentUser,
      });
    } else {
      Alert.alert('Error', 'No se puede navegar en este momento');
    }
  };

  const handleScanQR = () => {
    Alert.alert(
      'Escanear Código QR',
      'Funcionalidad de escaneo QR\n\nEn producción se usaría la cámara para escanear códigos QR de tracking.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Simular Escaneo',
          onPress: () => {
            const sampleTracking = 'BOA-2024-001';
            setTrackingInput(sampleTracking);
            setNewPackage(prev => ({ ...prev, location: '' }));
            Alert.alert('QR Escaneado', `Número de tracking detectado: ${sampleTracking}`);
          }
        }
      ]
    );
  };

  const handleSearchTracking = () => {
    if (!trackingInput.trim()) {
      Alert.alert('Error', 'Por favor ingresa un número de tracking');
      return;
    }

    setIsSearching(true);
    
    // Simular búsqueda
    setTimeout(() => {
      const found = trackingData.find(item => 
        item.trackingNumber.toLowerCase() === trackingInput.toLowerCase()
      );
      
      if (found) {
        setSearchResult(found);
        setShowTrackingSearch(false);
        
        const lastEventInfo = getLastEventInfo(found);
        const statusDescription = getStatusDescription(found.status, found.location);
        
        Alert.alert(
          'Paquete Encontrado',
          `📦 ${found.trackingNumber}\n\n` +
          `📋 ${found.description}\n\n` +
          `🔄 Estado Actual:\n${statusDescription}\n\n` +
          `📍 Ubicación: ${found.location}\n` +
          `⏰ Última actualización: ${found.lastUpdate}\n` +
          `📅 Entrega estimada: ${found.estimatedDelivery}\n\n` +
          `📝 Último evento:\n${lastEventInfo.description}\n` +
          `📍 En: ${lastEventInfo.location}\n` +
          `⏰ Hora: ${lastEventInfo.time}`,
          [
            {
              text: 'Ver Detalles Completos',
              onPress: () => handleViewDetails(found)
            },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert(
          'No Encontrado',
          `No se encontró ningún paquete con el número de tracking: ${trackingInput}\n\nVerifica el número e intenta de nuevo.`
        );
      }
      
      setIsSearching(false);
    }, 1000);
  };

  const handleAddNew = () => {
    if (isAdmin(currentUser)) {
      setNewPackage(prev => ({ ...prev, location: '' }));
      setShowReceptionForm(true);
    } else {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden agregar paquetes');
    }
  };

  const handleReceptionSubmit = () => {
    if (!newPackage.trackingNumber || !newPackage.description || !newPackage.location) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const newItem: TrackingItem = {
      id: Date.now(),
      trackingNumber: newPackage.trackingNumber,
      status: 'En almacén',
      location: newPackage.location,
      lastUpdate: 'Ahora',
      estimatedDelivery: 'Por definir',
      progress: 10,
      description: newPackage.description,
      priority: newPackage.priority,
    };

    setTrackingData([newItem, ...trackingData]);
    setNewPackage({
      trackingNumber: '',
      description: '',
      priority: 'medium',
      location: '',
    });
    setShowReceptionForm(false);
    Alert.alert('Éxito', 'Paquete agregado correctamente');
  };

  const handleUpdateStatus = (item: TrackingItem) => {
    if (!isAdmin(currentUser)) {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden actualizar estados');
      return;
    }

    Alert.alert(
      'Actualizar Estado',
      `Paquete: ${item.trackingNumber}\nEstado actual: ${item.status}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Actualizar', onPress: () => {
          // Aquí se abriría un modal para actualizar el estado
          Alert.alert('Funcionalidad', 'Modal de actualización de estado');
        }}
      ]
    );
  };

  // Nueva función para obtener descripción detallada del estado
  const getStatusDescription = (status: string, location?: string) => {
    switch (status.toLowerCase()) {
      case 'received':
      case 'recibido':
      case 'en almacén':
        return location ? `Recibido en ${location}` : 'Recibido en centro de distribución';
      case 'classified':
      case 'clasificado':
      case 'en procesamiento':
        return location ? `Clasificado en ${location}` : 'En proceso de clasificación';
      case 'dispatched':
      case 'despachado':
      case 'en tránsito':
        return location ? `Despachado hacia ${location}` : 'En tránsito';
      case 'in_flight':
      case 'en vuelo':
        return location ? `En vuelo hacia ${location}` : 'En vuelo';
      case 'customs_clearance':
      case 'aduanas':
      case 'retenido en aduana':
        return location ? `En aduana de ${location}` : 'En proceso aduanero';
      case 'out_for_delivery':
      case 'en entrega':
        return location ? `En ruta de entrega en ${location}` : 'En ruta de entrega';
      case 'delivered':
      case 'entregado':
        return 'Paquete entregado exitosamente';
      default:
        return status;
    }
  };

  // Nueva función para obtener información del último evento
  const getLastEventInfo = (item: TrackingItem) => {
    const now = new Date();
    const lastUpdate = item.lastUpdate;
    
    // Simular información del último evento basada en el estado
    let eventDescription = '';
    let eventLocation = item.location;
    let eventTime = lastUpdate;
    
    switch (item.status) {
      case 'En tránsito':
        eventDescription = 'Paquete despachado desde centro de distribución';
        break;
      case 'Entregado':
        eventDescription = 'Paquete entregado al destinatario';
        break;
      case 'En almacén':
        eventDescription = 'Paquete recibido en centro de distribución';
        break;
      case 'Retenido en aduana':
        eventDescription = 'Paquete retenido para inspección aduanera';
        break;
      case 'En vuelo':
        eventDescription = 'Paquete embarcado en vuelo';
        break;
      case 'En procesamiento':
        eventDescription = 'Paquete en proceso de clasificación';
        break;
      default:
        eventDescription = 'Estado actualizado';
    }
    
    return {
      description: eventDescription,
      location: eventLocation,
      time: eventTime
    };
  };

  // Componente para la búsqueda de tracking
  const TrackingSearchModal = () => (
    <View style={styles.searchModal}>
      <View style={styles.searchHeader}>
        <Text style={styles.searchTitle}>Consultar Tracking</Text>
        <TouchableOpacity onPress={() => setShowTrackingSearch(false)}>
          <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContent}>
        <Text style={styles.searchSubtitle}>
          Ingresa el número de tracking de tu paquete para consultar su estado en tiempo real
        </Text>
        
        <View style={styles.searchSection}>
          <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
            <MaterialIcons name="qr-code-scanner" size={32} color={BOA_COLORS.white} />
            <Text style={styles.scanButtonText}>Escanear Código QR</Text>
          </TouchableOpacity>
          
          <Text style={styles.orText}>o</Text>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Ingresa el número de tracking"
            value={trackingInput}
            onChangeText={setTrackingInput}
            placeholderTextColor={BOA_COLORS.gray}
            autoCapitalize="characters"
            autoFocus
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.searchButton, (!trackingInput.trim() || isSearching) && styles.disabledButton]}
          onPress={handleSearchTracking}
          disabled={!trackingInput.trim() || isSearching}
        >
          <Text style={styles.searchButtonText}>
            {isSearching ? 'Buscando...' : 'Consultar Estado'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.searchTips}>
          <Text style={styles.tipsTitle}>💡 Consejos:</Text>
          <Text style={styles.tipText}>• El número de tracking se encuentra en tu ticket de envío</Text>
          <Text style={styles.tipText}>• También puedes escanear el código QR si lo tienes</Text>
          <Text style={styles.tipText}>• Ejemplo: BOA-2024-001</Text>
        </View>
      </View>
    </View>
  );

  const renderTrackingItem = ({ item }: { item: TrackingItem }) => {
    const lastEventInfo = getLastEventInfo(item);
    const statusDescription = getStatusDescription(item.status, item.location);
    const handleCopyTracking = () => {
      Clipboard.setString(item.trackingNumber);
      Alert.alert('Copiado', 'Número de tracking copiado al portapapeles');
    };
    return (
      <TouchableOpacity style={styles.trackingCard} onPress={() => handleViewDetails(item)}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={getStatusIcon(item.status) as any} size={36} color={getStatusColor(item.status)} />
          </View>
          <View style={styles.trackingInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={styles.trackingNumber}>{item.trackingNumber}</Text>
              <TouchableOpacity onPress={handleCopyTracking} style={{ marginLeft: 6 }}>
                <MaterialIcons name="content-copy" size={18} color={BOA_COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.trackingDescription} numberOfLines={2} ellipsizeMode="tail">{item.description}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <View style={{ flex: 1 }} />
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status), alignSelf: 'flex-end' }]}> 
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.currentStatusSection}>
          <View style={styles.statusRow}>
            <MaterialIcons name="info" size={18} color={BOA_COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.statusDescription}>{statusDescription}</Text>
          </View>
        </View>
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: getStatusColor(item.status) }]} />
          </View>
          <Text style={styles.progressText}>{item.progress}% completado</Text>
        </View>
        <View style={styles.lastEventSection}>
          <Text style={styles.lastEventTitle}>Último evento:</Text>
          <View style={styles.lastEventContent}>
            <Text style={styles.lastEventDescription} numberOfLines={1} ellipsizeMode="tail">{lastEventInfo.description}</Text>
            <View style={styles.lastEventDetails}>
              <View style={styles.detailRow}>
                <MaterialIcons name="location-on" size={16} color={BOA_COLORS.gray} />
                <Text style={styles.detailText}>{lastEventInfo.location}</Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="schedule" size={16} color={BOA_COLORS.gray} />
                <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">{lastEventInfo.time}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={16} color={BOA_COLORS.gray} />
            <Text style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
              Entrega estimada: {
                item.estimatedDelivery && !isNaN(Date.parse(item.estimatedDelivery))
                  ? new Date(item.estimatedDelivery).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                  : item.estimatedDelivery || 'No disponible'
              }
            </Text>
          </View>
        </View>
        {isAdmin(currentUser) && (
          <View style={styles.adminActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleUpdateStatus(item)}
            >
              <MaterialIcons name="edit" size={18} color={BOA_COLORS.primary} />
              <Text style={styles.actionText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderReceptionForm = () => (
    <View style={styles.receptionModal}>
      <View style={styles.receptionHeader}>
        <Text style={styles.receptionTitle}>Registrar Recepción</Text>
        <TouchableOpacity onPress={() => setShowReceptionForm(false)}>
          <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.receptionContent}>
        <TextInput
          style={styles.input}
          placeholder="Número de tracking"
          value={newPackage.trackingNumber}
          onChangeText={(text) => setNewPackage({...newPackage, trackingNumber: text})}
          placeholderTextColor={BOA_COLORS.gray}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción del paquete"
          value={newPackage.description}
          onChangeText={(text) => setNewPackage({...newPackage, description: text})}
          placeholderTextColor={BOA_COLORS.gray}
        />
        <TextInput
          style={styles.input}
          placeholder="Ubicación"
          value={newPackage.location}
          onChangeText={(text) => setNewPackage({...newPackage, location: text})}
          placeholderTextColor={BOA_COLORS.gray}
        />
        
        <Text style={styles.priorityLabel}>Prioridad:</Text>
        <View style={styles.priorityButtons}>
          {['low', 'medium', 'high'].map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.priorityButton,
                newPackage.priority === priority && styles.priorityButtonActive
              ]}
              onPress={() => setNewPackage({...newPackage, priority: priority as any})}
            >
              <Text style={[
                styles.priorityText,
                newPackage.priority === priority && styles.priorityTextActive
              ]}>
                {priority === 'low' ? 'Baja' : priority === 'medium' ? 'Media' : 'Alta'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.receptionFooter}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowReceptionForm(false)}>
          <Text style={styles.secondaryButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleReceptionSubmit}>
          <Text style={styles.primaryButtonText}>Registrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Vista para usuarios públicos (no logueados)
  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}>
        <ImageBackground
          source={require('../assets/fondo_mobile.png')}
          style={styles.container}
          resizeMode="cover"
        >
          <FullScreenLoader visible={isLoading || isSearching} message={isSearching ? 'Buscando...' : 'Cargando...'} />
          <View style={styles.publicHeader}>
            <Text style={styles.publicTitle}>Consulta tu Paquete</Text>
            <Text style={styles.publicSubtitle}>
              Rastrea el estado de tu envío en tiempo real
            </Text>
          </View>

          <View style={styles.publicContent}>
            <View style={styles.searchCard}>
              <MaterialIcons name="search" size={48} color={BOA_COLORS.primary} />
              <Text style={styles.searchCardTitle}>¿Dónde está mi paquete?</Text>
              <Text style={styles.searchCardText}>
                Ingresa tu número de tracking o escanea el código QR para consultar el estado de tu envío
              </Text>
              
              <TouchableOpacity 
                style={styles.mainSearchButton}
                onPress={() => setShowTrackingSearch(true)}
              >
                <MaterialIcons name="qr-code-scanner" size={24} color={BOA_COLORS.white} />
                <Text style={styles.mainSearchButtonText}>Consultar Tracking</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.featuresSection}>
              <Text style={styles.featuresTitle}>¿Por qué elegir BOA Tracking?</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="schedule" size={24} color={BOA_COLORS.primary} />
                  <Text style={styles.featureText}>Actualizaciones en tiempo real</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="location-on" size={24} color={BOA_COLORS.primary} />
                  <Text style={styles.featureText}>Seguimiento de ubicación</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="notifications" size={24} color={BOA_COLORS.primary} />
                  <Text style={styles.featureText}>Notificaciones automáticas</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="security" size={24} color={BOA_COLORS.primary} />
                  <Text style={styles.featureText}>Seguridad garantizada</Text>
                </View>
              </View>
            </View>

            {/* Nueva sección: Estados de ejemplo */}
            <View style={styles.exampleSection}>
              <Text style={styles.exampleTitle}>Estados de Tracking Disponibles</Text>
              <View style={styles.exampleList}>
                <View style={styles.exampleItem}>
                  <View style={[styles.exampleStatus, { backgroundColor: BOA_COLORS.primary }]}>
                    <MaterialIcons name="flight" size={16} color={BOA_COLORS.white} />
                    <Text style={styles.exampleStatusText}>En vuelo</Text>
                  </View>
                  <Text style={styles.exampleDescription}>Paquete en vuelo hacia su destino</Text>
                </View>
                
                <View style={styles.exampleItem}>
                  <View style={[styles.exampleStatus, { backgroundColor: BOA_COLORS.warning }]}>
                    <MaterialIcons name="local-shipping" size={16} color={BOA_COLORS.white} />
                    <Text style={styles.exampleStatusText}>En tránsito</Text>
                  </View>
                  <Text style={styles.exampleDescription}>Paquete en ruta de entrega</Text>
                </View>
                
                <View style={styles.exampleItem}>
                  <View style={[styles.exampleStatus, { backgroundColor: BOA_COLORS.success }]}>
                    <MaterialIcons name="check-circle" size={16} color={BOA_COLORS.white} />
                    <Text style={styles.exampleStatusText}>Entregado</Text>
                  </View>
                  <Text style={styles.exampleDescription}>Paquete entregado exitosamente</Text>
                </View>
                
                <View style={styles.exampleItem}>
                  <View style={[styles.exampleStatus, { backgroundColor: BOA_COLORS.danger }]}>
                    <MaterialIcons name="gavel" size={16} color={BOA_COLORS.white} />
                    <Text style={styles.exampleStatusText}>Retenido en aduana</Text>
                  </View>
                  <Text style={styles.exampleDescription}>Paquete en inspección aduanera</Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>

        {showTrackingSearch && <TrackingSearchModal />}
      </SafeAreaView>
    );
  }

  // Vista para usuarios logueados
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}>
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <FullScreenLoader visible={isLoading || isSearching} message={isSearching ? 'Buscando...' : 'Cargando...'} />
        <View style={styles.header}>
          <Text style={styles.title}>Seguimiento de Paquetes</Text>
        </View>

        <View style={styles.content}>
          {/* Barra de búsqueda */}
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={BOA_COLORS.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por número de tracking o descripción..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={BOA_COLORS.gray}
            />
          </View>

          {/* Filtros */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {[
              'all', 
              'received', 
              'classified', 
              'dispatched', 
              'in_flight', 
              'customs_clearance', 
              'out_for_delivery', 
              'delivered'
            ].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive
                ]} numberOfLines={1} ellipsizeMode="tail">
                  {filter === 'all' ? 'Todos' : 
                   filter === 'received' ? 'Recibido' :
                   filter === 'classified' ? 'Clasificado' :
                   filter === 'dispatched' ? 'Despachado' :
                   filter === 'in_flight' ? 'En Vuelo' :
                   filter === 'customs_clearance' ? 'Aduanas' :
                   filter === 'out_for_delivery' ? 'En Entrega' :
                   filter === 'delivered' ? 'Entregado' : filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista de paquetes */}
          <FlatList
            data={filteredData}
            renderItem={renderTrackingItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.listContainer, { paddingBottom: 150 }]}
          />
        </View>
      </ImageBackground>

      {showReceptionForm && renderReceptionForm()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOA_COLORS.lightGray,
  },
  header: {
    backgroundColor: BOA_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  content: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BOA_COLORS.white,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: BOA_COLORS.dark,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  filterButton: {
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 5,
    marginRight: 14,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 180,
    marginBottom: 0,
    marginTop: 0,
  },
  filterButtonActive: {
    backgroundColor: BOA_COLORS.primary,
  },
  filterText: {
    color: BOA_COLORS.primary,
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 150,
  },
  filterTextActive: {
    color: BOA_COLORS.white,
  },
  listContainer: {
    padding: 20,
  },
  trackingCard: {
    backgroundColor: BOA_COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingInfo: {
    flex: 1,
    minWidth: 0,
  },
  trackingNumber: {
    fontSize: 17,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 2,
  },
  trackingDescription: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginBottom: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
    minWidth: 70,
    justifyContent: 'center',
  },
  statusText: {
    color: BOA_COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
  currentStatusSection: {
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDescription: {
    fontSize: 13,
    color: BOA_COLORS.dark,
    marginLeft: 4,
    flex: 1,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: 8,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    color: BOA_COLORS.gray,
    minWidth: 60,
  },
  lastEventSection: {
    marginBottom: 6,
  },
  lastEventTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 2,
  },
  lastEventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  lastEventDescription: {
    fontSize: 13,
    color: BOA_COLORS.dark,
    marginRight: 8,
    flex: 1,
  },
  lastEventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: 12,
    color: BOA_COLORS.gray,
    marginLeft: 2,
    maxWidth: 220,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: BOA_COLORS.lightGray,
  },
  actionText: {
    color: BOA_COLORS.primary,
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
  receptionModal: {
    backgroundColor: BOA_COLORS.white,
    flex: 1,
  },
  receptionHeader: {
    backgroundColor: BOA_COLORS.primary,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  receptionContent: {
    padding: 20,
  },
  input: {
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  priorityLabel: {
    fontSize: 16,
    color: BOA_COLORS.dark,
    marginBottom: 15,
  },
  priorityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: BOA_COLORS.gray,
  },
  priorityButtonActive: {
    backgroundColor: BOA_COLORS.primary,
    borderColor: BOA_COLORS.primary,
  },
  priorityText: {
    fontSize: 12,
    color: BOA_COLORS.gray,
    fontWeight: '500',
  },
  priorityTextActive: {
    color: BOA_COLORS.white,
  },
  receptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: BOA_COLORS.gray,
  },
  secondaryButtonText: {
    color: BOA_COLORS.gray,
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: BOA_COLORS.primary,
  },
  primaryButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  publicHeader: {
    padding: 20,
  },
  publicTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
    marginBottom: 10,
  },
  publicSubtitle: {
    fontSize: 14,
    color: BOA_COLORS.white,
  },
  publicContent: {
    flex: 1,
    justifyContent: 'center',
  },
  searchCard: {
    backgroundColor: BOA_COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  searchCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginBottom: 10,
  },
  searchCardText: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    textAlign: 'center',
  },
  mainSearchButton: {
    backgroundColor: BOA_COLORS.primary,
    padding: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  mainSearchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  featuresSection: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginBottom: 10,
  },
  featuresList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginTop: 5,
  },
  searchModal: {
    backgroundColor: BOA_COLORS.white,
    flex: 1,
  },
  searchHeader: {
    backgroundColor: BOA_COLORS.primary,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  searchContent: {
    padding: 20,
  },
  searchSubtitle: {
    fontSize: 14,
    color: BOA_COLORS.dark,
    marginBottom: 20,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: BOA_COLORS.primary,
    padding: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  orText: {
    fontSize: 16,
    color: BOA_COLORS.gray,
  },
  searchButton: {
    backgroundColor: BOA_COLORS.primary,
    padding: 12,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: BOA_COLORS.gray,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  searchTips: {
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 12,
    color: BOA_COLORS.gray,
  },
  exampleSection: {
    marginTop: 20,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginBottom: 10,
  },
  exampleList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exampleItem: {
    alignItems: 'center',
  },
  exampleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 5,
  },
  exampleStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
    marginLeft: 4,
  },
  exampleDescription: {
    fontSize: 10,
    color: BOA_COLORS.gray,
    textAlign: 'center',
    maxWidth: 80,
  },
}); 