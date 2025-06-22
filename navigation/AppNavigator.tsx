import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { TrackingScreen } from '../screens/TrackingScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import InternalAlertsScreen from '../screens/InternalAlertsScreen';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';
import { User } from '../utils/auth';
import { TrackingDetailScreen } from '../screens/TrackingDetailScreen';
import { PackageHistoryScreen } from '../screens/PackageHistoryScreen';
import { PublicTrackingScreen } from '../screens/PublicTrackingScreen';
import { PublicTrackingQueryScreen } from '../screens/PublicTrackingQueryScreen';
import { UserPackagesScreen } from '../screens/UserPackagesScreen';
import { PreRegistrationScreen } from '../screens/PreRegistrationScreen';
import { AllPreRegistrationsScreen } from '../screens/AllPreRegistrationsScreen';
import { AdminClaimsScreen } from '../screens/AdminClaimsScreen';
import { UserClaimsScreen } from '../screens/UserClaimsScreen';
import { AdminReturnsScreen } from '../screens/AdminReturnsScreen';
import { UserReturnsScreen } from '../screens/UserReturnsScreen';

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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator principal que incluye todas las pantallas
function MainStack({ currentUser }: any) {
  const headerOptions = (title: string) => ({
    headerShown: true,
    title,
    headerStyle: {
      backgroundColor: BOA_COLORS.primary,
    },
    headerTintColor: BOA_COLORS.white,
    headerTitleStyle: {
      fontWeight: 'bold' as 'bold',
      fontSize: 18,
    },
    headerTitleAlign: 'center' as 'center',
    headerLeft: ({ onPress }: { onPress?: () => void }) => (
      <TouchableOpacity onPress={onPress} style={{ marginLeft: 16 }}>
        <MaterialIcons name="arrow-back" size={24} color={BOA_COLORS.white} />
      </TouchableOpacity>
    ),
  });

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        initialParams={{ currentUser }}
        key={currentUser ? `user-${currentUser.id}`: 'guest'}
      />
      <Stack.Screen 
        name="Tracking" 
        component={TrackingScreen}
        initialParams={{ currentUser }}
      />
      <Stack.Screen 
        name="Alerts" 
        component={AlertsScreen}
        initialParams={{ currentUser }}
      />
      <Stack.Screen
        name="InternalAlerts"
        component={InternalAlertsScreen}
        options={headerOptions('Alertas Internas')}
      />
      <Stack.Screen
        name="TrackingDetail"
        component={TrackingDetailScreen}
        options={{ 
          headerShown: true, 
          title: 'Detalle de Envío',
          headerStyle: {
            backgroundColor: BOA_COLORS.primary,
          },
          headerTintColor: BOA_COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold' as 'bold',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          headerLeft: ({ onPress }) => (
            <TouchableOpacity onPress={onPress} style={{ marginLeft: 16 }}>
              <MaterialIcons name="arrow-back" size={24} color={BOA_COLORS.white} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <MaterialIcons name="local-shipping" size={24} color={BOA_COLORS.white} />
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="PackageHistory"
        component={PackageHistoryScreen}
        options={headerOptions('Historial del Paquete')}
      />
      <Stack.Screen
        name="PublicTracking"
        component={PublicTrackingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PublicTrackingQuery"
        component={PublicTrackingQueryScreen}
        options={headerOptions('Consulta de Tracking')}
      />
      <Stack.Screen
        name="UserPackages"
        component={UserPackagesScreen}
        options={headerOptions('Mis Paquetes')}
      />
      <Stack.Screen
        name="PreRegistration"
        component={PreRegistrationScreen}
        options={headerOptions('Pre-Registro de Envío')}
      />
      <Stack.Screen
        name="AllPreRegistrations"
        component={AllPreRegistrationsScreen}
        options={headerOptions('Todos los Pre-Registros')}
      />
      <Stack.Screen
        name="AdminClaims"
        component={AdminClaimsScreen}
        options={headerOptions('Reclamos de Usuarios')}
      />
      <Stack.Screen
        name="AdminReturns"
        component={AdminReturnsScreen}
        options={headerOptions('Gestión de Devoluciones')}
      />
      <Stack.Screen
        name="UserClaims"
        component={UserClaimsScreen}
        options={headerOptions('Mis Reclamos')}
      />
      <Stack.Screen
        name="UserReturns"
        component={UserReturnsScreen}
        options={headerOptions('Mis Devoluciones')}
      />
    </Stack.Navigator>
  );
}

// Tab Navigator - solo se muestra cuando hay usuario logueado
function MainTabs({ currentUser }: any) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Tracking') {
            iconName = 'local-shipping';
          } else if (route.name === 'Alerts') {
            iconName = 'notifications';
          } else {
            iconName = 'home';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: BOA_COLORS.primary,
        tabBarInactiveTintColor: BOA_COLORS.gray,
        tabBarStyle: {
          backgroundColor: BOA_COLORS.white,
          borderTopWidth: 1,
          borderTopColor: BOA_COLORS.lightGray,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Inicio',
        }}
        initialParams={{ currentUser }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={TrackingScreen}
        options={{
          title: 'Seguimiento',
        }}
        initialParams={{ currentUser }}
      />
      <Tab.Screen 
        name="Alerts" 
        component={AlertsScreen}
        options={{
          title: 'Alertas',
        }}
        initialParams={{ currentUser }}
      />
    </Tab.Navigator>
  );
}

// Componente principal del navegador
export const AppNavigator = ({ 
  currentUser, 
  onLogin, 
  onLogout, 
  showLogin, 
  showRegister, 
  onLoginClose, 
  onLoginSuccess, 
  onShowRegister, 
  onRegisterClose, 
  onRegisterSuccess 
}: any) => {
  return (
    <NavigationContainer>
      {currentUser ? (
        // Usuario logueado - mostrar tabs
        <MainTabs 
          key={currentUser.id}
          currentUser={currentUser}
        />
      ) : (
        // Usuario no logueado - mostrar stack sin tabs
        <MainStack 
          key="guest"
          currentUser={currentUser}
        />
      )}
      <LoginModal
        visible={showLogin}
        onClose={onLoginClose}
        onLoginSuccess={onLoginSuccess}
        onShowRegister={onShowRegister}
      />
      <RegisterModal
        visible={showRegister}
        onClose={onRegisterClose}
        onRegisterSuccess={onRegisterSuccess}
      />
    </NavigationContainer>
  );
}; 