import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SplashScreen } from './components/SplashScreen';
import { AppNavigator } from './navigation/AppNavigator';
import { User } from './utils/auth';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleLogin = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setShowLogin(false);
  };

  const handleLoginClose = () => {
    setShowLogin(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleShowRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleRegisterClose = () => {
    setShowRegister(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  // Mostrar pantalla de splash
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Aplicación principal
  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('./assets/fondo_mobile.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
        <AppNavigator
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          showLogin={showLogin}
          showRegister={showRegister}
          onLoginClose={handleLoginClose}
          onLoginSuccess={handleLoginSuccess}
          onShowRegister={handleShowRegister}
          onRegisterClose={handleRegisterClose}
          onRegisterSuccess={handleRegisterSuccess}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
