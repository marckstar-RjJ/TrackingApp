import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Badge, Button } from 'react-native-elements';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS, STATUS_COLORS, STATUS_ICONS } from '../theme';

interface TrackingItem {
  id: number;
  trackingNumber: string;
  status: string;
  location: string;
  lastUpdate: string;
  estimatedDelivery: string;
  progress: number;
}

interface TrackingCardProps {
  item: TrackingItem;
  onViewDetails: (id: number) => void;
  onUpdate: (id: number) => void;
}

export const TrackingCard: React.FC<TrackingCardProps> = ({ 
  item, 
  onViewDetails, 
  onUpdate 
}) => {
  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || BOA_COLORS.gray;
  };

  const getStatusIcon = (status: string) => {
    return STATUS_ICONS[status as keyof typeof STATUS_ICONS] || 'info';
  };

  return (
    <Card containerStyle={styles.trackingCard}>
      <View style={styles.trackingHeader}>
        <View style={styles.trackingInfo}>
          <View style={styles.trackingNumberContainer}>
            <MaterialIcons name="qr-code" size={16} color={BOA_COLORS.gray} />
            <Text style={styles.trackingNumber}>{item.trackingNumber}</Text>
          </View>
          <Badge
            value={item.status}
            status="primary"
            badgeStyle={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}
            textStyle={styles.statusText}
          />
        </View>
        <MaterialIcons 
          name={getStatusIcon(item.status) as any} 
          size={24} 
          color={getStatusColor(item.status)} 
        />
      </View>

      <View style={styles.trackingDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color={BOA_COLORS.gray} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialIcons name="access-time" size={16} color={BOA_COLORS.gray} />
          <Text style={styles.detailText}>{item.lastUpdate}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="event" size={16} color={BOA_COLORS.gray} />
          <Text style={styles.detailText}>Entrega: {item.estimatedDelivery}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${item.progress}%`,
                backgroundColor: getStatusColor(item.status)
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{item.progress}% completado</Text>
      </View>

      <View style={styles.cardActions}>
        <Button
          title="Ver Detalles"
          type="outline"
          buttonStyle={styles.detailButton}
          titleStyle={styles.detailButtonText}
          icon={
            <MaterialIcons name="visibility" size={16} color={BOA_COLORS.primary} />
          }
          onPress={() => onViewDetails(item.id)}
        />
        <Button
          title="Actualizar"
          type="clear"
          titleStyle={styles.updateButtonText}
          icon={
            <MaterialIcons name="refresh" size={16} color={BOA_COLORS.secondary} />
          }
          onPress={() => onUpdate(item.id)}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  trackingCard: {
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trackingInfo: {
    flex: 1,
  },
  trackingNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: BOA_COLORS.dark,
    marginLeft: 5,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  trackingDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 3,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: BOA_COLORS.gray,
    textAlign: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailButton: {
    borderColor: BOA_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  detailButtonText: {
    color: BOA_COLORS.primary,
    fontSize: 14,
  },
  updateButtonText: {
    color: BOA_COLORS.secondary,
    fontSize: 14,
  },
}); 