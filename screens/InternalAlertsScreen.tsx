import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet, ImageBackground, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { BOA_COLORS } from '../theme';

const InternalAlertsScreen = () => {
  const [internalAlerts, setInternalAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'active' o 'solved'

  const fetchInternalAlerts = useCallback(async (status: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://b113-66-203-113-32.ngrok-free.app/api/alerts/type/internal_monitoring?status=${status}`);
      if (!res.ok) {
        setInternalAlerts([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const alerts = data.map(alert => {
          const lastUpdate = new Date(alert.created_at);
          const timeSinceLastUpdate = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
          return {
            ...alert,
            trackingNumber: alert.package_tracking,
            lastUpdate: alert.created_at,
            timeSinceLastUpdate: timeSinceLastUpdate,
          };
        });
        setInternalAlerts(alerts);
      } else {
        setInternalAlerts([]);
      }
    } catch (error) {
      console.error("Error fetching internal alerts:", error);
      setInternalAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInternalAlerts(filter);
    }, [fetchInternalAlerts, filter])
  );

  const handleCopyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copiado', 'El número de tracking ha sido copiado al portapapeles.');
  };

  const handleSolveAlert = async (alertId: number) => {
    try {
      const res = await fetch(`https://b113-66-203-113-32.ngrok-free.app/api/alerts/${alertId}/solve`, {
        method: 'PUT',
      });
      if (res.ok) {
        Alert.alert('Éxito', 'La alerta ha sido marcada como solucionada.');
        fetchInternalAlerts(filter); // Recargar las alertas
      } else {
        const errorData = await res.json();
        Alert.alert('Error', errorData.error || 'No se pudo solucionar la alerta.');
      }
    } catch (error) {
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#fbc02d';
      default:
        return '#1976d2';
    }
  };

  const renderActiveAlert = (alert: any) => (
    <View key={alert.id} style={[styles.alertContainer, { backgroundColor: getAlertColor(alert.severity) }]}>
      <Text style={styles.alertTitle}>{alert.title}</Text>
      <Text style={styles.alertDescription}>{alert.description}</Text>
      
      <View style={styles.activeTrackingContainer}>
        <Text style={styles.alertInfo}>Tracking: {alert.trackingNumber}</Text>
        <TouchableOpacity onPress={() => handleCopyToClipboard(alert.trackingNumber)}>
          <MaterialIcons name="content-copy" size={20} color="#fff" style={{ marginLeft: 8 }}/>
        </TouchableOpacity>
      </View>

      <Text style={styles.alertInfo}>
        Última actualización: {alert.lastUpdate ? new Date(alert.lastUpdate).toLocaleString() : 'N/A'}
      </Text>
      {alert.timeSinceLastUpdate !== undefined && (
        <Text style={styles.alertInfo}>
          Retraso: {alert.timeSinceLastUpdate.toFixed(1)} horas
        </Text>
      )}

      <TouchableOpacity 
        style={styles.solveButton}
        onPress={() => handleSolveAlert(alert.id)}
      >
        <MaterialIcons name="check-circle" size={18} color={BOA_COLORS.success} />
        <Text style={styles.solveButtonText}>Marcar como Solucionado</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSolvedAlert = (alert: any) => (
    <View key={alert.id} style={styles.solvedAlertContainer}>
        <View style={styles.solvedAlertHeader}>
            <MaterialIcons name="check-circle" size={22} color={BOA_COLORS.success} />
            <Text style={styles.solvedAlertTitle}>{alert.title}</Text>
        </View>
        <Text style={styles.solvedAlertDescription}>{alert.description}</Text>
        <View style={styles.solvedTrackingContainer}>
            <Text style={styles.solvedAlertInfo}>Tracking: {alert.trackingNumber}</Text>
            <TouchableOpacity onPress={() => handleCopyToClipboard(alert.trackingNumber)}>
                <MaterialIcons name="content-copy" size={20} color={BOA_COLORS.gray} style={{ marginLeft: 8 }}/>
            </TouchableOpacity>
        </View>
        {alert.solved_at && (
          <Text style={styles.solvedAlertInfo}>
            Solucionado: {new Date(alert.solved_at).toLocaleString()}
          </Text>
        )}
        <Text style={styles.solvedAlertInfo}>
          Creada: {new Date(alert.created_at).toLocaleString()}
        </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.filterContainer}>
            <TouchableOpacity 
                style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
                onPress={() => setFilter('active')}
            >
                <Text style={[styles.filterButtonText, filter === 'active' && styles.filterButtonTextActive]}>Activas</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.filterButton, filter === 'solved' && styles.filterButtonActive]}
                onPress={() => setFilter('solved')}
            >
                <Text style={[styles.filterButtonText, filter === 'solved' && styles.filterButtonTextActive]}>Solucionadas</Text>
            </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {isLoading ? (
            <ActivityIndicator size="large" color={BOA_COLORS.white} style={{ marginTop: 50 }}/>
          ) : internalAlerts.length > 0 ? (
            internalAlerts.map(alert => 
                filter === 'active' ? renderActiveAlert(alert) : renderSolvedAlert(alert)
            )
          ) : (
            <View style={styles.noAlertsContainer}>
              <MaterialIcons name="check-circle" size={64} color={BOA_COLORS.success} />
              <Text style={styles.noAlertsText}>No hay alertas internas en este momento.</Text>
            </View>
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
  backgroundImage: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 60,
  },
  alertContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  alertTitle: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  alertDescription: {
    color: '#fff',
    marginBottom: 8,
  },
  alertInfo: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  solveButton: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  solveButtonText: {
    color: BOA_COLORS.success,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noAlertsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
  },
  noAlertsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginTop: 10,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(25, 118, 210, 0.9)',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterButtonTextActive: {
    color: BOA_COLORS.primary,
  },
  solvedAlertContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: BOA_COLORS.success,
  },
  solvedAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  solvedAlertTitle: {
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    fontSize: 16,
    marginLeft: 8,
  },
  solvedAlertDescription: {
    color: BOA_COLORS.gray,
    marginBottom: 8,
  },
  solvedAlertInfo: {
      color: BOA_COLORS.dark,
      fontSize: 13,
  },
  activeTrackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    padding: 8,
    borderRadius: 8,
  },
  solvedTrackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 8,
  },
});

export default InternalAlertsScreen; 