import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { BOA_COLORS } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';

interface HeaderProps {
  onLogin?: () => void;
  isLoggedIn?: boolean;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ onLogin, isLoggedIn, children }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.left}>
          <Image
            source={require('../assets/logo_boa.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>BOA</Text>
            <Text style={styles.subtitle}>Tracking System</Text>
          </View>
        </View>
        <View style={styles.right}>
          {children}
          {onLogin && (
            <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
              <MaterialIcons name={isLoggedIn ? 'logout' : 'login'} size={20} color={BOA_COLORS.white} />
              <Text style={styles.loginText}>{isLoggedIn ? 'Cerrar sesión' : 'Iniciar sesión'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'rgba(25, 118, 210, 0.9)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(25, 118, 210, 0.9)',
    paddingTop: Platform.OS === 'ios' ? 20 : 25,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minHeight: Platform.OS === 'ios' ? 80 : 85,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: BOA_COLORS.light,
    fontWeight: '300',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BOA_COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 10,
  },
  loginText: {
    color: BOA_COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
}); 