import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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

interface PublicTrackingScreenProps {
  navigation: any;
  route: any;
}

interface PackageData {
  trackingNumber: string;
  description: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  weight: string;
  priority: 'low' | 'medium' | 'high';
  originCity: string;
  destinationCity: string;
}

export const PublicTrackingScreen: React.FC<PublicTrackingScreenProps> = ({ navigation, route }) => {
  const [formData, setFormData] = useState<PackageData>({
    trackingNumber: '',
    description: '',
    senderName: '',
    senderPhone: '',
    recipientName: '',
    recipientPhone: '',
    weight: '',
    priority: 'medium',
    originCity: '',
    destinationCity: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const generateTrackingNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BOA-${year}${month}${day}-${random}`;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.description.trim() || !formData.weight.trim()) {
          Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
          return false;
        }
        if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
          Alert.alert('Error', 'El peso debe ser un número válido mayor a 0');
          return false;
        }
        break;
      case 2:
        if (!formData.senderName.trim() || !formData.senderPhone.trim()) {
          Alert.alert('Error', 'Por favor completa todos los datos del remitente');
          return false;
        }
        break;
      case 3:
        if (!formData.recipientName.trim() || !formData.recipientPhone.trim()) {
          Alert.alert('Error', 'Por favor completa todos los datos del destinatario');
          return false;
        }
        break;
      case 4:
        if (!formData.originCity.trim() || !formData.destinationCity.trim()) {
          Alert.alert('Error', 'Por favor completa las ciudades de origen y destino');
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = () => {
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    
    // Simular procesamiento
    setTimeout(() => {
      const trackingNumber = generateTrackingNumber();
      
      Alert.alert(
        '¡Paquete Registrado Exitosamente!',
        `Tu paquete ha sido registrado en nuestro sistema.\n\nNúmero de seguimiento: ${trackingNumber}\n\nPuedes usar este número para hacer seguimiento de tu envío.`,
        [
          {
            text: 'Ver Tracking',
            onPress: () => {
              // Crear un objeto trackingItem con datos simulados
              const trackingItem = {
                trackingNumber: trackingNumber,
                events: [
                  {
                    id: '1',
                    eventType: 'received',
                    pointName: 'Centro de Recepción',
                    description: 'Paquete registrado en el sistema',
                    timestamp: new Date(),
                    operator: 'Sistema',
                    location: formData.originCity
                  }
                ]
              };

              navigation.navigate('TrackingDetail', { 
                trackingItem: trackingItem,
                currentUser: null,
                isPublicUser: true 
              });
            }
          },
          {
            text: 'Registrar Otro',
            onPress: () => {
              // Limpiar formulario
              setFormData({
                trackingNumber: '',
                description: '',
                senderName: '',
                senderPhone: '',
                recipientName: '',
                recipientPhone: '',
                weight: '',
                priority: 'medium',
                originCity: '',
                destinationCity: '',
              });
              setCurrentStep(1);
            }
          },
          { text: 'OK' }
        ]
      );
      
      setIsLoading(false);
    }, 2000);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            currentStep >= step ? styles.stepActive : styles.stepInactive
          ]}>
            <Text style={[
              styles.stepNumber,
              currentStep >= step ? styles.stepNumberActive : styles.stepNumberInactive
            ]}>
              {step}
            </Text>
          </View>
          {step < 4 && (
            <View style={[
              styles.stepLine,
              currentStep > step ? styles.stepLineActive : styles.stepLineInactive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Información del Paquete</Text>
      <Text style={styles.stepSubtitle}>Describe tu envío</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Descripción del paquete"
        placeholderTextColor={BOA_COLORS.gray}
        value={formData.description}
        onChangeText={(text) => setFormData({...formData, description: text})}
        multiline
        numberOfLines={3}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Peso (kg)"
        placeholderTextColor={BOA_COLORS.gray}
        value={formData.weight}
        onChangeText={(text) => setFormData({...formData, weight: text})}
        keyboardType="numeric"
      />
      
      <Text style={styles.label}>Prioridad:</Text>
      <View style={styles.priorityContainer}>
        {[
          { value: 'low', label: 'Baja', color: BOA_COLORS.success },
          { value: 'medium', label: 'Media', color: BOA_COLORS.warning },
          { value: 'high', label: 'Alta', color: BOA_COLORS.danger }
        ].map((priority) => (
          <TouchableOpacity
            key={priority.value}
            style={[
              styles.priorityButton,
              formData.priority === priority.value && styles.priorityButtonActive,
              { borderColor: priority.color }
            ]}
            onPress={() => setFormData({...formData, priority: priority.value as any})}
          >
            <Text style={[
              styles.priorityButtonText,
              formData.priority === priority.value && { color: priority.color }
            ]}>
              {priority.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Datos del Remitente</Text>
      <Text style={styles.stepSubtitle}>Información de quien envía</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre completo del remitente"
        placeholderTextColor={BOA_COLORS.gray}
        value={formData.senderName}
        onChangeText={(text) => setFormData({...formData, senderName: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Teléfono del remitente"
        placeholderTextColor={BOA_COLORS.gray}
        value={formData.senderPhone}
        onChangeText={(text) => setFormData({...formData, senderPhone: text})}
        keyboardType="phone-pad"
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Datos del Destinatario</Text>
      <Text style={styles.stepSubtitle}>Información de quien recibe</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre completo del destinatario"
        placeholderTextColor={BOA_COLORS.gray}
        value={formData.recipientName}
        onChangeText={(text) => setFormData({...formData, recipientName: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Teléfono del destinatario"
        placeholderTextColor={BOA_COLORS.gray}
        value={formData.recipientPhone}
        onChangeText={(text) => setFormData({...formData, recipientPhone: text})}
        keyboardType="phone-pad"
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Ruta del Envío</Text>
      <Text style={styles.stepSubtitle}>Origen y destino</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Ciudad de origen"
        placeholderTextColor={BOA_COLORS.gray}
        value={formData.originCity}
        onChangeText={(text) => setFormData({...formData, originCity: text})}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Ciudad de destino"
        placeholderTextColor={BOA_COLORS.gray}
        value={formData.destinationCity}
        onChangeText={(text) => setFormData({...formData, destinationCity: text})}
      />
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen del Envío</Text>
        <Text style={styles.summaryText}>Descripción: {formData.description}</Text>
        <Text style={styles.summaryText}>Peso: {formData.weight} kg</Text>
        <Text style={styles.summaryText}>Remitente: {formData.senderName}</Text>
        <Text style={styles.summaryText}>Destinatario: {formData.recipientName}</Text>
        <Text style={styles.summaryText}>Ruta: {formData.originCity} → {formData.destinationCity}</Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}>
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={styles.container}
        resizeMode="cover"
      >
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color={BOA_COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Registro de Paquete</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Sección de bienvenida */}
            <View style={styles.welcomeSection}>
              <MaterialIcons name="add-box" size={48} color={BOA_COLORS.primary} />
              <Text style={styles.welcomeTitle}>Registra tu Paquete</Text>
              <Text style={styles.welcomeSubtitle}>
                Completa la información para registrar tu envío en nuestro sistema
              </Text>
            </View>

            {/* Indicador de pasos */}
            {renderStepIndicator()}

            {/* Contenido del paso actual */}
            {renderCurrentStep()}
          </ScrollView>

          {/* Footer con botones */}
          <View style={styles.footer}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
                <Text style={styles.secondaryButtonText}>Anterior</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < 4 ? (
              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.primaryButtonText}>Siguiente</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.disabledButton]} 
                onPress={handleRegister}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Registrando...' : 'Registrar Paquete'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(25, 118, 210, 0.9)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: BOA_COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  stepActive: {
    backgroundColor: BOA_COLORS.primary,
    borderColor: BOA_COLORS.primary,
  },
  stepInactive: {
    backgroundColor: BOA_COLORS.white,
    borderColor: BOA_COLORS.gray,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: BOA_COLORS.white,
  },
  stepNumberInactive: {
    color: BOA_COLORS.gray,
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: BOA_COLORS.primary,
  },
  stepLineInactive: {
    backgroundColor: BOA_COLORS.gray,
  },
  stepContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: BOA_COLORS.gray,
    marginBottom: 20,
  },
  input: {
    backgroundColor: BOA_COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: BOA_COLORS.dark,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BOA_COLORS.lightGray,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 12,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: BOA_COLORS.white,
  },
  priorityButtonActive: {
    backgroundColor: BOA_COLORS.light,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BOA_COLORS.gray,
  },
  summaryCard: {
    backgroundColor: BOA_COLORS.light,
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: BOA_COLORS.dark,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BOA_COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BOA_COLORS.lightGray,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: BOA_COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginRight: 8,
  },
  primaryButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: BOA_COLORS.gray,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: BOA_COLORS.gray,
  },
});
