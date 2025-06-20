import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme/colors';
import { 
  InternalAlert, 
  checkInternalAlerts, 
  getAlertStatistics,
  resolveAlert 
} from '../utils/tracking';

const InternalAlertsScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<InternalAlert[]>([]);
  const [statistics, setStatistics] = useState(getAlertStatistics([]));
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [showResolved, setShowResolved] = useState(false);

  const loadAlerts = async () => {
    try {
      const res = await fetch('http://192.168.100.16:3000/api/packages');
      const data = await res.json();
      if (Array.isArray(data)) {
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
        const newAlerts = checkInternalAlerts(trackingItems);
    setAlerts(newAlerts);
    setStatistics(getAlertStatistics(newAlerts));
      } else {
        setAlerts([]);
        setStatistics(getAlertStatistics([]));
      }
    } catch (e) {
      setAlerts([]);
      setStatistics(getAlertStatistics([]));
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleResolveAlert = (alertId: string) => {
    Alert.alert(
      'Resolver Alerta',
      '¿Estás seguro de que quieres marcar esta alerta como resuelta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resolver',
          onPress: () => {
            const updatedAlerts = alerts.map(alert => 
              alert.id === alertId 
                ? { ...alert, isResolved: true, resolvedAt: new Date(), resolvedBy: 'Admin' }
                : alert
            );
            setAlerts(updatedAlerts);
            setStatistics(getAlertStatistics(updatedAlerts));
          }
        }
      ]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return BOA_COLORS.gray;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'warning';
      case 'high': return 'alert-circle';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const filteredAlerts = alerts.filter(alert => 
    (filter === 'all' || alert.severity === filter) &&
    (showResolved ? alert.isResolved : !alert.isResolved)
  );

  const StatCard = ({ title, value, color, icon }: { title: string; value: number; color: string; icon: string }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  const AlertCard = ({ alert }: { alert: InternalAlert }) => (
    <View style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
      <View style={styles.alertHeader}>
        <View style={styles.alertTitleRow}>
          <Ionicons 
            name={getSeverityIcon(alert.severity) as any} 
            size={20} 
            color={getSeverityColor(alert.severity)} 
          />
          <Text style={styles.alertTitle}>{alert.title}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
          <Text style={styles.severityText}>{alert.severity.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.alertDescription}>{alert.description}</Text>
      
      <View style={styles.alertInfo}>
        <Text style={styles.alertInfoText}>
          <Text style={styles.infoLabel}>Tracking:</Text> {alert.trackingNumber}
        </Text>
        <Text style={styles.alertInfoText}>
          <Text style={styles.infoLabel}>Destinatario:</Text> {alert.packageInfo.recipient}
        </Text>
        <Text style={styles.alertInfoText}>
          <Text style={styles.infoLabel}>Descripción:</Text> {alert.packageInfo.description}
        </Text>
        <Text style={styles.alertInfoText}>
          <Text style={styles.infoLabel}>Ruta:</Text> {alert.packageInfo.origin} → {alert.packageInfo.destination}
        </Text>
        <Text style={styles.alertInfoText}>
          <Text style={styles.infoLabel}>Última actualización:</Text> {alert.lastUpdate.toLocaleString()}
        </Text>
      </View>

      {!alert.isResolved && (
        <TouchableOpacity 
          style={styles.resolveButton}
          onPress={() => handleResolveAlert(alert.id)}
        >
          <Ionicons name="checkmark" size={16} color="white" />
          <Text style={styles.resolveButtonText}>Marcar como Resuelta</Text>
        </TouchableOpacity>
      )}

      {alert.isResolved && (
        <View style={styles.resolvedInfo}>
          <Ionicons name="checkmark-circle" size={16} color="#28a745" />
          <Text style={styles.resolvedText}>
            Resuelta por {alert.resolvedBy} el {alert.resolvedAt?.toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alertas Internas</Text>
        <Text style={styles.headerSubtitle}>Monitoreo de retrasos en paquetes</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Estadísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              title="Críticas" 
              value={statistics.critical} 
              color="#dc3545" 
              icon="warning" 
            />
            <StatCard 
              title="Altas" 
              value={statistics.high} 
              color="#fd7e14" 
              icon="alert-circle" 
            />
            <StatCard 
              title="Medias" 
              value={statistics.medium} 
              color="#ffc107" 
              icon="information-circle" 
            />
            <StatCard 
              title="Bajas" 
              value={statistics.low} 
              color="#28a745" 
              icon="checkmark-circle" 
            />
          </View>
        </View>

        {/* Filtros */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
              <TouchableOpacity
                key={sev}
                style={{
                  backgroundColor: filter === sev ? getSeverityColor(sev) : BOA_COLORS.lightGray,
                  borderRadius: 16,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  marginRight: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: filter === sev ? 2 : 1,
                  borderColor: filter === sev ? getSeverityColor(sev) : BOA_COLORS.lightGray,
                }}
                onPress={() => setFilter(sev as any)}
              >
                <Ionicons name={getSeverityIcon(sev)} size={18} color={filter === sev ? '#fff' : getSeverityColor(sev)} style={{ marginRight: 6 }} />
                <Text style={{ color: filter === sev ? '#fff' : getSeverityColor(sev), fontWeight: 'bold', textTransform: 'capitalize' }}>{sev === 'all' ? 'Todas' : sev}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={{ marginLeft: 10, padding: 8, borderRadius: 8, backgroundColor: showResolved ? BOA_COLORS.primary : BOA_COLORS.lightGray }}
            onPress={() => setShowResolved(!showResolved)}
          >
            <Ionicons name={showResolved ? 'eye' : 'eye-off'} size={20} color={showResolved ? '#fff' : BOA_COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Lista de Alertas */}
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>
            Alertas ({filteredAlerts.length})
          </Text>
          
          {filteredAlerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color={BOA_COLORS.gray} />
              <Text style={styles.emptyStateText}>
                {filter === 'all' ? 'No hay alertas activas' : `No hay alertas ${filter}`}
              </Text>
            </View>
          ) : (
            filteredAlerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BOA_COLORS.primary,
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: BOA_COLORS.gray,
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  alertsSection: {
    padding: 20,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginLeft: 8,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  alertDescription: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  alertInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  alertInfoText: {
    fontSize: 12,
    color: BOA_COLORS.gray,
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: '600',
    color: BOA_COLORS.primary,
  },
  resolveButton: {
    backgroundColor: BOA_COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  resolveButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  resolvedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    padding: 8,
    borderRadius: 6,
  },
  resolvedText: {
    fontSize: 12,
    color: '#155724',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: BOA_COLORS.gray,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default InternalAlertsScreen; 