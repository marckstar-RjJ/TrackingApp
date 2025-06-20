import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';

const { width } = Dimensions.get('window');

interface HeroCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  title,
  subtitle,
  description,
  icon
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <View style={styles.gradientBackground}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={icon as any} size={40} color={BOA_COLORS.white} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <MaterialIcons name="star" size={16} color={BOA_COLORS.warning} />
              <Text style={styles.badgeText}>Premium</Text>
            </View>
            <View style={styles.badge}>
              <MaterialIcons name="security" size={16} color={BOA_COLORS.success} />
              <Text style={styles.badgeText}>Seguro</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradientBackground: {
    backgroundColor: 'rgba(25, 118, 210, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(66, 165, 245, 0.4)',
    borderRadius: 24,
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(66, 165, 245, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: BOA_COLORS.light,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: BOA_COLORS.light,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: BOA_COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 