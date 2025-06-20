import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  TextInput,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, isAdmin, isPublic } from '../utils/auth';
import { BOA_COLORS } from '../theme';

const { width } = Dimensions.get('window');

interface AlertItem {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  trackingNumber?: string;
  action?: string;
  createdBy?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface AlertSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export const AlertsScreen = ({ navigation, route }: any) => {
  const currentUser: User | null = route.params?.currentUser || null;
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings' | 'create'>('notifications');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'error' | 'success',
    priority: 'medium' as 'low' | 'medium' | 'high',
    trackingNumber: '',
  });

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 1,
      type: 'warning',
      title: 'Paquete retenido en aduana',
      message: 'El paquete BOA-2024-005 ha sido retenido en aduana. Se requiere documentación adicional.',
      timestamp: 'Hace 2 horas',
      isRead: false,
      trackingNumber: 'BOA-2024-005',
      action: 'Ver detalles',
      createdBy: 'Sistema',
      priority: 'high',
    },
    {
      id: 2,
      type: 'success',
      title: 'Paquete entregado exitosamente',
      message: 'El paquete BOA-2024-002 ha sido entregado al destinatario.',
      timestamp: 'Hace 1 día',
      isRead: true,
      trackingNumber: 'BOA-2024-002',
      createdBy: 'Sistema',
      priority: 'medium',
    },
    {
      id: 3,
      type: 'info',
      title: 'Actualización de estado',
      message: 'El paquete BOA-2024-001 ha llegado al centro de distribución.',
      timestamp: 'Hace 3 horas',
      isRead: false,
      trackingNumber: 'BOA-2024-001',
      action: 'Ver tracking',
      createdBy: 'Admin',
      priority: 'low',
    },
    {
      id: 4,
      type: 'error',
      title: 'Error en el envío',
      message: 'Se ha detectado un problema con el paquete BOA-2024-006. Contacte soporte.',
      timestamp: 'Hace 5 horas',
      isRead: false,
      trackingNumber: 'BOA-2024-006',
      action: 'Contactar soporte',
      createdBy: 'Sistema',
      priority: 'high',
    },
    {
      id: 5,
      type: 'warning',
      title: 'Retraso en la entrega',
      message: 'El paquete BOA-2024-003 experimentará un retraso de 24 horas.',
      timestamp: 'Hace 6 horas',
      isRead: true,
      trackingNumber: 'BOA-2024-003',
      createdBy: 'Admin',
      priority: 'medium',
    },
  ]);

  const [alertSettings, setAlertSettings] = useState<AlertSetting[]>([
    {
      id: 'push_notifications',
      title: 'Notificaciones Push',
      description: 'Recibe alertas instantáneas en tu dispositivo',
      enabled: true,
    },
    {
      id: 'email_notifications',
      title: 'Notificaciones por Email',
      description: 'Recibe alertas por correo electrónico',
      enabled: true,
    },
    {
      id: 'sms_notifications',
      title: 'Notificaciones SMS',
      description: 'Recibe alertas por mensaje de texto',
      enabled: false,
    },
    {
      id: 'delivery_alerts',
      title: 'Alertas de Entrega',
      description: 'Notificaciones cuando el paquete sea entregado',
      enabled: true,
    },
    {
      id: 'delay_alerts',
      title: 'Alertas de Retraso',
      description: 'Notificaciones sobre retrasos en la entrega',
      enabled: true,
    },
    {
      id: 'customs_alerts',
      title: 'Alertas de Aduana',
      description: 'Notificaciones sobre problemas en aduana',
      enabled: true,
    },
    {
      id: 'weekly_summary',
      title: 'Resumen Semanal',
      description: 'Recibe un resumen semanal de tus envíos',
      enabled: false,
    },
  ]);

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return BOA_COLORS.primary;
      case 'warning':
        return BOA_COLORS.warning;
      case 'error':
        return BOA_COLORS.danger;
      case 'success':
        return BOA_COLORS.success;
      default:
        return BOA_COLORS.gray;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'check-circle';
      default:
        return 'notifications';
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

  const handleMarkAsRead = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  const handleMarkAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
  };

  const handleDeleteAlert = (id: number) => {
    if (!isAdmin(currentUser)) {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden eliminar alertas');
      return;
    }

    Alert.alert(
      'Eliminar Alerta',
      '¿Estás seguro de que quieres eliminar esta alerta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => setAlerts(alerts.filter(alert => alert.id !== id))
        },
      ]
    );
  };

  const handleSettingToggle = (id: string) => {
    setAlertSettings(alertSettings.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const handleAlertAction = (alert: AlertItem) => {
    if (alert.action === 'Ver detalles') {
      Alert.alert('Detalles del Paquete', `Número: ${alert.trackingNumber}\nEstado: ${alert.title}`);
    } else if (alert.action === 'Ver tracking') {
      Alert.alert('Tracking', `Mostrando tracking para ${alert.trackingNumber}`);
    } else if (alert.action === 'Contactar soporte') {
      Alert.alert('Soporte', 'Conectando con el equipo de soporte...');
    }
  };

  const handleCreateAlert = () => {
    if (!isAdmin(currentUser)) {
      Alert.alert('Acceso Denegado', 'Solo los administradores pueden crear alertas');
      return;
    }
    setShowCreateForm(true);
  };

  const handleCreateAlertSubmit = () => {
    if (!newAlert.title || !newAlert.message) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const newAlertItem: AlertItem = {
      id: alerts.length + 1,
      type: newAlert.type,
      title: newAlert.title,
      message: newAlert.message,
      timestamp: 'Ahora',
      isRead: false,
      trackingNumber: newAlert.trackingNumber || undefined,
      createdBy: currentUser?.name,
      priority: newAlert.priority,
    };

    setAlerts([newAlertItem, ...alerts]);
    setNewAlert({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      trackingNumber: '',
    });
    setShowCreateForm(false);
    Alert.alert('Éxito', 'Alerta creada correctamente');
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  const renderAlertItem = ({ item }: { item: AlertItem }) => (
    <View style={[
      styles.alertCard,
      !item.isRead && styles.alertCardUnread
    ]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertTypeContainer}>
          <MaterialIcons 
            name={getAlertTypeIcon(item.type) as any} 
            size={20} 
            color={getAlertTypeColor(item.type)} 
          />
          <View style={styles.alertInfo}>
            <Text style={styles.alertTitle}>{item.title}</Text>
            <Text style={styles.alertTimestamp}>{item.timestamp}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteAlert(item.id)}
        >
          <MaterialIcons name="delete-outline" size={20} color={BOA_COLORS.gray} />
        </TouchableOpacity>
      </View>

      <Text style={styles.alertMessage}>{item.message}</Text>

      {item.trackingNumber && (
        <View style={styles.trackingInfo}>
          <MaterialIcons name="local-shipping" size={16} color={BOA_COLORS.primary} />
          <Text style={styles.trackingNumber}>{item.trackingNumber}</Text>
        </View>
      )}

      <View style={styles.alertMeta}>
        {item.createdBy && (
          <View style={styles.metaItem}>
            <MaterialIcons name="person" size={14} color={BOA_COLORS.gray} />
            <Text style={styles.metaText}>Creado por: {item.createdBy}</Text>
          </View>
        )}
        {item.priority && (
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={styles.alertActions}>
        {!item.isRead && (
          <TouchableOpacity 
            style={styles.markReadButton}
            onPress={() => handleMarkAsRead(item.id)}
          >
            <MaterialIcons name="check" size={16} color={BOA_COLORS.primary} />
            <Text style={[styles.actionButtonText, { color: BOA_COLORS.primary }]}>Marcar como leída</Text>
          </TouchableOpacity>
        )}
        {item.action && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleAlertAction(item)}
          >
            <Text style={[styles.actionButtonText, { color: BOA_COLORS.white }]}>{item.action}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSettingItem = ({ item }: { item: AlertSetting }) => (
    <View style={styles.settingCard}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingDescription}>{item.description}</Text>
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => handleSettingToggle(item.id)}
        trackColor={{ false: BOA_COLORS.lightGray, true: BOA_COLORS.primary }}
        thumbColor={BOA_COLORS.white}
      />
    </View>
  );

  const renderCreateForm = () => (
    <View style={styles.createForm}>
      <Text style={styles.formTitle}>Crear Nueva Alerta</Text>
      <TextInput
        style={styles.formInput}
        placeholder="Título de la alerta"
        value={newAlert.title}
        onChangeText={(text) => setNewAlert({...newAlert, title: text})}
      />
      <TextInput
        style={[styles.formInput, styles.textArea]}
        placeholder="Mensaje de la alerta"
        value={newAlert.message}
        onChangeText={(text) => setNewAlert({...newAlert, message: text})}
        multiline
        numberOfLines={3}
      />
      <TextInput
        style={styles.formInput}
        placeholder="Número de tracking (opcional)"
        value={newAlert.trackingNumber}
        onChangeText={(text) => setNewAlert({...newAlert, trackingNumber: text})}
      />
      
      <View style={styles.typeContainer}>
        <Text style={styles.typeLabel}>Tipo:</Text>
        {['info', 'warning', 'error', 'success'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              newAlert.type === type && styles.typeButtonActive
            ]}
            onPress={() => setNewAlert({...newAlert, type: type as any})}
          >
            <Text style={[
              styles.typeButtonText,
              newAlert.type === type && styles.typeButtonTextActive
            ]}>
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.priorityContainer}>
        <Text style={styles.priorityLabel}>Prioridad:</Text>
        {['low', 'medium', 'high'].map((priority) => (
          <TouchableOpacity
            key={priority}
            style={[
              styles.priorityButton,
              newAlert.priority === priority && styles.priorityButtonActive
            ]}
            onPress={() => setNewAlert({...newAlert, priority: priority as any})}
          >
            <Text style={[
              styles.priorityButtonText,
              newAlert.priority === priority && styles.priorityButtonTextActive
            ]}>
              {priority.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity 
          style={[styles.formButton, styles.cancelButton]}
          onPress={() => setShowCreateForm(false)}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.formButton, styles.submitButton]}
          onPress={handleCreateAlertSubmit}
        >
          <Text style={styles.submitButtonText}>Crear Alerta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}>
      <ImageBackground 
        source={require('../assets/fondo_mobile.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isAdmin(currentUser) ? 'Gestión de Alertas' : 'Alertas y Notificaciones'}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'notifications' && styles.tabActive]}
            onPress={() => setActiveTab('notifications')}
          >
            <MaterialIcons 
              name="notifications" 
              size={20} 
              color={activeTab === 'notifications' ? BOA_COLORS.white : BOA_COLORS.gray} 
            />
            <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>
              Notificaciones
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
            onPress={() => setActiveTab('settings')}
          >
            <MaterialIcons 
              name="settings" 
              size={20} 
              color={activeTab === 'settings' ? BOA_COLORS.white : BOA_COLORS.gray} 
            />
            <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
              Configuración
            </Text>
          </TouchableOpacity>
          {isAdmin(currentUser) && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'create' && styles.tabActive]}
              onPress={() => setActiveTab('create')}
            >
              <MaterialIcons 
                name="add-alert" 
                size={20} 
                color={activeTab === 'create' ? BOA_COLORS.white : BOA_COLORS.gray} 
              />
              <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>
                Crear
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {activeTab === 'notifications' ? (
          <View style={styles.content}>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
                <MaterialIcons name="done-all" size={16} color={BOA_COLORS.primary} />
                <Text style={styles.markAllText}>Marcar todas como leídas</Text>
              </TouchableOpacity>
            )}
            
            <FlatList
              data={alerts}
              renderItem={renderAlertItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : activeTab === 'settings' ? (
          <View style={styles.content}>
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Configuración de Notificaciones</Text>
              <Text style={styles.settingsSubtitle}>
                Personaliza cómo recibir las alertas de tus envíos
              </Text>
            </View>
            
            <FlatList
              data={alertSettings}
              renderItem={renderSettingItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : (
          <View style={styles.content}>
            {showCreateForm ? (
              renderCreateForm()
            ) : (
              <View style={styles.createPrompt}>
                <Text style={styles.createPromptTitle}>Crear Nueva Alerta</Text>
                <Text style={styles.createPromptText}>
                  Crea alertas personalizadas para notificar a los usuarios sobre eventos importantes.
                </Text>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateAlert}>
                  <MaterialIcons name="add-alert" size={24} color={BOA_COLORS.white} />
                  <Text style={styles.createButtonText}>Crear Alerta</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ImageBackground>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  badge: {
    backgroundColor: BOA_COLORS.danger,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: BOA_COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: BOA_COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  tabActive: {
    backgroundColor: BOA_COLORS.primary,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: BOA_COLORS.gray,
  },
  tabTextActive: {
    color: BOA_COLORS.white,
  },
  content: {
    flex: 1,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: BOA_COLORS.white,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOA_COLORS.primary,
  },
  markAllText: {
    marginLeft: 8,
    color: BOA_COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  alertCard: {
    backgroundColor: BOA_COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  alertCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: BOA_COLORS.primary,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  alertTypeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  alertInfo: {
    marginLeft: 10,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: BOA_COLORS.dark,
    marginBottom: 2,
  },
  alertTimestamp: {
    fontSize: 12,
    color: BOA_COLORS.gray,
  },
  deleteButton: {
    padding: 5,
  },
  alertMessage: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginBottom: 10,
    lineHeight: 20,
  },
  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackingNumber: {
    marginLeft: 8,
    fontSize: 14,
    color: BOA_COLORS.primary,
    fontWeight: '500',
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: BOA_COLORS.gray,
    marginLeft: 4,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    color: BOA_COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BOA_COLORS.primary,
  },
  actionButton: {
    backgroundColor: BOA_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  settingsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: BOA_COLORS.white,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginBottom: 5,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: BOA_COLORS.gray,
  },
  settingCard: {
    backgroundColor: BOA_COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: BOA_COLORS.dark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    lineHeight: 20,
  },
  createPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginBottom: 10,
    textAlign: 'center',
  },
  createPromptText: {
    fontSize: 16,
    color: BOA_COLORS.gray,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BOA_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  createForm: {
    backgroundColor: BOA_COLORS.white,
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginBottom: 15,
    textAlign: 'center',
  },
  formInput: {
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  typeLabel: {
    fontSize: 16,
    color: BOA_COLORS.dark,
    marginRight: 10,
  },
  typeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    borderWidth: 1,
    borderColor: BOA_COLORS.gray,
  },
  typeButtonActive: {
    backgroundColor: BOA_COLORS.primary,
    borderColor: BOA_COLORS.primary,
  },
  typeButtonText: {
    fontSize: 10,
    color: BOA_COLORS.gray,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: BOA_COLORS.white,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  priorityLabel: {
    fontSize: 16,
    color: BOA_COLORS.dark,
    marginRight: 10,
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
  priorityButtonText: {
    fontSize: 12,
    color: BOA_COLORS.gray,
    fontWeight: '500',
  },
  priorityButtonTextActive: {
    color: BOA_COLORS.white,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: BOA_COLORS.gray,
  },
  submitButton: {
    backgroundColor: BOA_COLORS.primary,
  },
  cancelButtonText: {
    color: BOA_COLORS.gray,
    fontSize: 16,
    fontWeight: '500',
  },
  submitButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
}); 