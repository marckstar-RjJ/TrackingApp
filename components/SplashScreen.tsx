import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Dimensions,
  Animated,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Tema de colores Boa
const BOA_COLORS = {
  primary: '#1976D2',
  secondary: '#42A5F5',
  white: '#FFFFFF',
  light: '#E3F2FD',
};

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [imageError, setImageError] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const dot1Anim = new Animated.Value(0);
  const dot2Anim = new Animated.Value(0);
  const dot3Anim = new Animated.Value(0);

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de los puntos de carga
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Anim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Repetir la animación
        animateDots();
      });
    };

    // Iniciar animación de puntos después de 500ms
    setTimeout(animateDots, 500);

    // Timer para cerrar la pantalla de splash
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground
      source={require('../assets/fondo_mobile.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Overlay para mejorar legibilidad */}
      <View style={styles.overlay} />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={imageError ? require('../assets/logo_boa.png') : require('../assets/logo_boa2.png')}
          style={styles.logo}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
        
        <Text style={styles.title}>BOA</Text>
        <Text style={styles.subtitle}>Tracking System</Text>
        
        <View style={styles.loadingContainer}>
          <Animated.View 
            style={[
              styles.loadingDot, 
              { 
                opacity: dot1Anim,
                transform: [{ scale: dot1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                })}]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.loadingDot, 
              { 
                opacity: dot2Anim,
                transform: [{ scale: dot2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                })}]
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.loadingDot, 
              { 
                opacity: dot3Anim,
                transform: [{ scale: dot3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                })}]
              }
            ]} 
          />
        </View>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(25, 118, 210, 0.3)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 280,
    height: 280,
    marginBottom: 40,
  },
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 22,
    color: BOA_COLORS.light,
    marginBottom: 50,
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BOA_COLORS.white,
    marginHorizontal: 4,
  },
}); 