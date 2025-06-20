import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';

interface FooterProps {
  onLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onLogin }) => {
  const handleContact = () => {
    Linking.openURL('mailto:soporte@boa-tracking.com');
  };

  const handleWebsite = () => {
    Linking.openURL('https://boa-tracking.com');
  };

  return (
    <View style={styles.footer}>
      {/* Línea divisoria sutil */}
      <View style={styles.divider} />
      
      {/* Contenido principal compacto */}
      <View style={styles.footerContent}>
        {/* Logo y copyright */}
        <View style={styles.leftSection}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="local-shipping" size={16} color={BOA_COLORS.white} />
            <Text style={styles.logoText}>BOA Tracking</Text>
          </View>
          <Text style={styles.copyright}>
            © 2024 BOA Tracking
          </Text>
        </View>

        {/* Enlaces rápidos */}
        <View style={styles.rightSection}>
          {onLogin && (
            <TouchableOpacity style={styles.footerLink} onPress={onLogin}>
              <MaterialIcons name="login" size={14} color={BOA_COLORS.light} />
              <Text style={styles.linkText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.footerLink} onPress={handleContact}>
            <MaterialIcons name="support-agent" size={14} color={BOA_COLORS.light} />
            <Text style={styles.linkText}>Soporte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLink} onPress={handleWebsite}>
            <MaterialIcons name="language" size={14} color={BOA_COLORS.light} />
            <Text style={styles.linkText}>Web</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: 'rgba(21, 101, 192, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
    marginLeft: 6,
  },
  copyright: {
    fontSize: 11,
    color: BOA_COLORS.light,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: BOA_COLORS.light,
    marginLeft: 4,
  },
}); 