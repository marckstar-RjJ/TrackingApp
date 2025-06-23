import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';
import { Picker } from '@react-native-picker/picker';
import { BACKEND_URL } from '../utils/backend';

interface ShippingData {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderEmail: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientEmail: string;
  weight: string;
  cargoType: string;
  originCity: string;
  destinationCity: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDelivery: string;
  shippingType: string;
}

interface ShippingRegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  onShippingRegistered: (shippingData: ShippingData, trackingNumber: string) => void;
}

// Lista de departamentos/ciudades nacionales
const NATIONAL_CITIES = [
  'La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Tarija', 'Cobija', 'Trinidad', 'Oruro'
];

// Lista de destinos internacionales válidos
const INTERNATIONAL_CITIES = [
  'Miami', 'Madrid', 'Buenos Aires', 'São Paulo', 'Lima', 'La Habana', 'Caracas'
];

// Lista de tipos de carga permitidos para avión
const CARGO_TYPES = [
  'Documentos',
  'Ropa',
  'Electrónica',
  'Medicamentos',
  'Alimentos no perecederos',
  'Muestras comerciales',
  'Juguetes',
  'Libros',
  'Repuestos',
  'Material frágil',
];

// Conversión USD a Bs
const USD_TO_BS = 6.96;

// Función para redondear a múltiplo de 0.50
function roundToNearestHalf(num: number) {
  return Math.round(num * 2) / 2;
}

// Cálculo de costo nacional
function calculateNationalCost(weight: number): number {
  if (weight <= 1) return roundToNearestHalf(4);
  if (weight <= 10) return roundToNearestHalf(weight * 4);
  if (weight <= 25) return roundToNearestHalf(weight * 4);
  if (weight <= 100) return roundToNearestHalf(weight * 3.5);
  if (weight > 100 && weight < 300) return roundToNearestHalf(weight * 3.5);
  if (weight >= 300) return roundToNearestHalf(weight * 3);
  return roundToNearestHalf(weight * 4);
}

// Función para obtener la estimación de entrega
function getDeliveryEstimate(origin: string, destination: string, type: string): string {
  if (type === 'nacional') {
    if (origin === 'La Paz' && destination === 'Santa Cruz' || origin === 'Santa Cruz' && destination === 'La Paz') return '1 día hábil';
    if (origin === 'La Paz' && destination === 'Cochabamba' || origin === 'Cochabamba' && destination === 'La Paz') return '1 día hábil';
    if (origin === 'La Paz' && destination === 'Sucre' || origin === 'Sucre' && destination === 'La Paz') return '1–2 días hábiles';
    if (origin === 'La Paz' && destination === 'Tarija' || origin === 'Tarija' && destination === 'La Paz') return '1–2 días hábiles';
    if (origin === 'Santa Cruz' && destination === 'Cobija' || origin === 'Cobija' && destination === 'Santa Cruz') return '2 días hábiles';
    if (origin === 'Cochabamba' && destination === 'Trinidad' || origin === 'Trinidad' && destination === 'Cochabamba') return '1–2 días hábiles';
    if (origin === 'Santa Cruz' && destination === 'Oruro' || origin === 'Oruro' && destination === 'Santa Cruz') return '1 día hábil';
    // Todas las rutas principales nacionales
    if (NATIONAL_CITIES.includes(origin) && NATIONAL_CITIES.includes(destination)) return 'Máximo 48 h (2 días hábiles)';
  } else if (type === 'internacional') {
    if (destination === 'Miami') return '4–6 días hábiles';
    if (destination === 'Madrid') return '6–8 días hábiles';
    if (destination === 'Buenos Aires') return '3–5 días hábiles';
    if (destination === 'São Paulo') return '3–5 días hábiles';
    if (destination === 'Lima') return '2–3 días hábiles';
    if (destination === 'La Habana') return '5–7 días hábiles';
    if (destination === 'Caracas') return '5–7 días hábiles';
  }
  return '';
}

// Tabla de costos internacionales (USD)
const INTL_COST_TABLE: { [key: string]: { '1': number; '5': number; '10': number } } = {
  'Miami':   { '1': 30, '5': 100, '10': 160 },
  'Madrid':  { '1': 45, '5': 140, '10': 240 },
  'Buenos Aires': { '1': 23, '5': 70, '10': 115 },
  'São Paulo':    { '1': 26, '5': 78, '10': 125 },
  'Lima':    { '1': 22, '5': 65, '10': 105 },
  'La Habana': { '1': 40, '5': 115, '10': 180 },
  'Caracas':  { '1': 35, '5': 105, '10': 170 },
};

function calculateInternationalCost(weight: number, destination: string): { usd: number, bs: number } {
  let usd = 0;
  if (weight <= 1) usd = INTL_COST_TABLE[destination]?.['1'] || 50;
  else if (weight <= 5) usd = INTL_COST_TABLE[destination]?.['5'] || 150;
  else if (weight <= 10) usd = INTL_COST_TABLE[destination]?.['10'] || 250;
  else usd = (INTL_COST_TABLE[destination]?.['10'] || 250) + ((weight - 10) * 15); // Extra por kg
  const bs = roundToNearestHalf(usd * USD_TO_BS);
  return { usd, bs };
}

// Función para sumar días hábiles a una fecha
function addBusinessDays(date: Date, days: number): Date {
  let result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    // 0 = domingo, 6 = sábado
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      added++;
    }
  }
  return result;
}

// Función para extraer el número de días hábiles de la estimación textual
function parseBusinessDays(estimate: string): number {
  if (!estimate) return 2;
  // Busca explícitamente 'días hábiles'
  const match = estimate.match(/(\d+)(?:–(\d+))?\s*d[ií]as?\s*h[áa]biles?/i);
  if (match) {
    if (match[2]) return parseInt(match[2], 10); // Si es rango, toma el máximo
    return parseInt(match[1], 10);
  }
  // Si no encuentra, busca el primer número (pero solo si no hay días hábiles)
  const fallback = estimate.match(/(\d+)/);
  if (fallback) return parseInt(fallback[1], 10);
  return 2;
}

export const ShippingRegistrationModal: React.FC<ShippingRegistrationModalProps> = ({
  visible,
  onClose,
  onShippingRegistered,
}) => {
  const [formData, setFormData] = useState<ShippingData>({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    senderEmail: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    recipientEmail: '',
    weight: '',
    cargoType: '',
    originCity: '',
    destinationCity: '',
    description: '',
    priority: 'medium',
    estimatedDelivery: '',
    shippingType: 'nacional',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [noSenderEmail, setNoSenderEmail] = useState(false);
  const [noRecipientEmail, setNoRecipientEmail] = useState(false);
  const [cost, setCost] = useState(0);
  const [costUSD, setCostUSD] = useState(0);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

  // URL del backend (ajusta si es necesario)
  const API_URL = `${BACKEND_URL}/packages`;

  const generateTrackingNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BOA-${year}${month}${day}-${random}`;
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      'senderName', 'senderPhone', 'senderAddress',
      'recipientName', 'recipientPhone', 'recipientAddress',
      'weight', 'cargoType', 'originCity', 'destinationCity'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof ShippingData]?.trim()) {
        Alert.alert('Error', `Por favor completa el campo: ${field}`);
        return false;
      }
    }

    if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
      Alert.alert('Error', 'El peso debe ser un número válido mayor a 0');
      return false;
    }

    // No validar trackingNumber ni descripción como requeridos
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.senderName.trim() || !formData.senderPhone.trim() || !formData.senderAddress.trim()) {
        Alert.alert('Error', 'Por favor completa todos los campos del remitente');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.recipientName.trim() || !formData.recipientPhone.trim() || !formData.recipientAddress.trim()) {
        Alert.alert('Error', 'Por favor completa todos los campos del destinatario');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Solo validar tipo de envío y ciudades
      if (!formData.shippingType.trim() || !formData.originCity.trim() || !formData.destinationCity.trim()) {
        Alert.alert('Error', 'Por favor completa todos los campos de la ruta');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Solo validar peso
      if (!formData.weight.trim()) {
        Alert.alert('Error', 'Por favor ingresa el peso del paquete');
        return;
      }
      if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
        Alert.alert('Error', 'El peso debe ser un número válido mayor a 0');
        return;
      }
      setCurrentStep(5);
    } else if (currentStep === 5) {
      if (!formData.cargoType.trim()) {
        Alert.alert('Error', 'Por favor completa el tipo de carga');
        return;
      }
      if (!formData.description.trim() || formData.description.trim().length < 10) {
        Alert.alert('Error', 'La descripción del contenido debe tener al menos 10 caracteres y ser específica.');
        return;
      }
      setCurrentStep(6);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePreview = () => {
    if (!validateForm()) return;
    
    const newTrackingNumber = generateTrackingNumber();
    setTrackingNumber(newTrackingNumber);
    setShowPreview(true);
  };

  // Actualizo la estimación cada vez que cambian tipo, origen o destino
  useEffect(() => {
    if (formData.originCity && formData.destinationCity) {
      setFormData(prev => ({ ...prev, estimatedDelivery: getDeliveryEstimate(formData.originCity, formData.destinationCity, formData.shippingType) }));
    }
  }, [formData.originCity, formData.destinationCity, formData.shippingType]);

  // Calcular costo automáticamente cuando cambian peso, tipo o destino
  useEffect(() => {
    const peso = parseFloat(formData.weight);
    if (!peso || peso <= 0) {
      setCost(0);
      setCostUSD(0);
      return;
    }
    if (formData.shippingType === 'nacional') {
      setCost(calculateNationalCost(peso));
      setCostUSD(0);
    } else if (formData.shippingType === 'internacional' && formData.destinationCity) {
      const { usd, bs } = calculateInternationalCost(peso, formData.destinationCity);
      setCost(bs);
      setCostUSD(usd);
    }
  }, [formData.weight, formData.shippingType, formData.destinationCity]);

  // Calcular fecha estimada cuando cambia la estimación
  useEffect(() => {
    if (formData.estimatedDelivery) {
      const days = parseBusinessDays(formData.estimatedDelivery);
      const baseDate = new Date();
      // Log para depuración
      console.log('[BoA] Texto de estimación:', formData.estimatedDelivery);
      console.log('[BoA] Días hábiles calculados:', days);
      const fecha = addBusinessDays(baseDate, days);
      setEstimatedDeliveryDate(fecha.toISOString().split('T')[0]);
      console.log('[BoA] Fecha base (sistema):', baseDate.toISOString());
      console.log('[BoA] Fecha estimada calculada:', fecha.toISOString());
    } else {
      setEstimatedDeliveryDate('');
    }
  }, [formData.estimatedDelivery]);

  // Función para registrar el paquete en la base de datos
  const registerPackage = async (data: ShippingData, trackingNum: string) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_number: trackingNum,
          description: data.description,
          sender_name: data.senderName,
          sender_email: data.senderEmail || 'no-email@boa.com',
          sender_phone: data.senderPhone,
          recipient_name: data.recipientName,
          recipient_email: data.recipientEmail || 'no-email@boa.com',
          recipient_phone: data.recipientPhone,
          origin: data.originCity,
          destination: data.destinationCity,
          weight: data.weight,
          priority: data.priority || 'normal',
          estimated_delivery_date: estimatedDeliveryDate,
          cost: cost,
        })
      });
      const result = await res.json();
      if (res.ok && result && result.id) {
        return { success: true, tracking_number: trackingNum };
      } else {
        return { success: false, error: result.error || 'Error desconocido' };
      }
    } catch (e) {
      return { success: false, error: 'No se pudo conectar con el servidor' };
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    const newTrackingNumber = trackingNumber || generateTrackingNumber();
    // Llamar a la API para guardar el envío
    const response = await registerPackage(formData, newTrackingNumber);
    if (response.success) {
    Alert.alert(
      'Envío Registrado',
      `El envío ha sido registrado exitosamente.\nNúmero de seguimiento: ${newTrackingNumber}`,
      [
        {
          text: 'Imprimir Etiqueta',
          onPress: () => handlePrintLabel(newTrackingNumber)
        },
        {
          text: 'OK',
          onPress: () => {
            onShippingRegistered(formData, newTrackingNumber);
            handleClose();
          }
        }
      ]
    );
    } else {
      Alert.alert('Error', response.error || 'No se pudo registrar el envío.');
    }
  };

  const handlePrintLabel = (trackingNum: string) => {
    // Simulación de impresión - en producción se conectaría con impresora
    Alert.alert(
      'Imprimiendo Etiqueta',
      `Etiqueta con código QR para: ${trackingNum}\n\nRemitente: ${formData.senderName}\nDestinatario: ${formData.recipientName}\nOrigen: ${formData.originCity}\nDestino: ${formData.destinationCity}`,
      [
        {
          text: 'OK',
          onPress: () => {
            onShippingRegistered(formData, trackingNum);
            handleClose();
          }
        }
      ]
    );
  };

  const handleClose = () => {
    setFormData({
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      senderEmail: '',
      recipientName: '',
      recipientPhone: '',
      recipientAddress: '',
      recipientEmail: '',
      weight: '',
      cargoType: '',
      originCity: '',
      destinationCity: '',
      description: '',
      priority: 'medium',
      estimatedDelivery: '',
      shippingType: 'nacional',
    });
    setCurrentStep(1);
    setShowPreview(false);
    setTrackingNumber('');
    setNoSenderEmail(false);
    setNoRecipientEmail(false);
    setCost(0);
    setCostUSD(0);
    setEstimatedDeliveryDate('');
    onClose();
  };

  const updateFormData = (field: keyof ShippingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5, 6].map(step => (
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
          <Text style={[
            styles.stepLabel,
            currentStep >= step ? styles.stepLabelActive : styles.stepLabelInactive
          ]}>
            {step === 1 ? 'Remitente' : step === 2 ? 'Destinatario' : step === 3 ? 'Ruta' : step === 4 ? 'Peso' : step === 5 ? 'Detalles' : 'Confirmar'}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Información del Remitente</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre completo del remitente"
        value={formData.senderName}
        onChangeText={(value) => updateFormData('senderName', value)}
        placeholderTextColor={BOA_COLORS.gray}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Teléfono del remitente"
        value={formData.senderPhone}
        onChangeText={(value) => updateFormData('senderPhone', value)}
        placeholderTextColor={BOA_COLORS.gray}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico del remitente"
        value={noSenderEmail ? 'no-email@boa.com' : formData.senderEmail}
        onChangeText={(value) => {
          setNoSenderEmail(false);
          updateFormData('senderEmail', value);
        }}
        placeholderTextColor={BOA_COLORS.gray}
        editable={!noSenderEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity
          onPress={() => {
            setNoSenderEmail(!noSenderEmail);
            if (!noSenderEmail) updateFormData('senderEmail', 'no-email@boa.com');
          }}
          style={{ marginRight: 8, width: 22, height: 22, borderWidth: 1, borderColor: BOA_COLORS.gray, borderRadius: 4, backgroundColor: noSenderEmail ? BOA_COLORS.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}
        >
          {noSenderEmail && <MaterialIcons name="check" size={18} color="#fff" />}
        </TouchableOpacity>
        <Text style={{ color: BOA_COLORS.gray, fontSize: 13 }}>No conozco el email del remitente</Text>
      </View>
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Dirección completa del remitente"
        value={formData.senderAddress}
        onChangeText={(value) => updateFormData('senderAddress', value)}
        placeholderTextColor={BOA_COLORS.gray}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Información del Destinatario</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre completo del destinatario"
        value={formData.recipientName}
        onChangeText={(value) => updateFormData('recipientName', value)}
        placeholderTextColor={BOA_COLORS.gray}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Teléfono del destinatario"
        value={formData.recipientPhone}
        onChangeText={(value) => updateFormData('recipientPhone', value)}
        placeholderTextColor={BOA_COLORS.gray}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico del destinatario"
        value={noRecipientEmail ? 'no-email@boa.com' : formData.recipientEmail}
        onChangeText={(value) => {
          setNoRecipientEmail(false);
          updateFormData('recipientEmail', value);
        }}
        placeholderTextColor={BOA_COLORS.gray}
        editable={!noRecipientEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <TouchableOpacity
          onPress={() => {
            setNoRecipientEmail(!noRecipientEmail);
            if (!noRecipientEmail) updateFormData('recipientEmail', 'no-email@boa.com');
          }}
          style={{ marginRight: 8, width: 22, height: 22, borderWidth: 1, borderColor: BOA_COLORS.gray, borderRadius: 4, backgroundColor: noRecipientEmail ? BOA_COLORS.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}
        >
          {noRecipientEmail && <MaterialIcons name="check" size={18} color="#fff" />}
        </TouchableOpacity>
        <Text style={{ color: BOA_COLORS.gray, fontSize: 13 }}>No conozco el email del destinatario</Text>
      </View>
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Dirección completa del destinatario"
        value={formData.recipientAddress}
        onChangeText={(value) => updateFormData('recipientAddress', value)}
        placeholderTextColor={BOA_COLORS.gray}
        multiline
        numberOfLines={3}
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Ruta del Envío</Text>
      <Text style={styles.label}>Tipo de envío:</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: formData.shippingType === 'nacional' ? BOA_COLORS.primary : BOA_COLORS.lightGray,
            padding: 10,
            borderRadius: 8,
            marginRight: 5,
            alignItems: 'center',
          }}
          onPress={() => setFormData(prev => ({ ...prev, shippingType: 'nacional', originCity: '', destinationCity: '' }))}
        >
          <Text style={{ color: formData.shippingType === 'nacional' ? BOA_COLORS.white : BOA_COLORS.dark }}>Nacional</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: formData.shippingType === 'internacional' ? BOA_COLORS.primary : BOA_COLORS.lightGray,
            padding: 10,
            borderRadius: 8,
            marginLeft: 5,
            alignItems: 'center',
          }}
          onPress={() => setFormData(prev => ({ ...prev, shippingType: 'internacional', originCity: '', destinationCity: '' }))}
        >
          <Text style={{ color: formData.shippingType === 'internacional' ? BOA_COLORS.white : BOA_COLORS.dark }}>Internacional</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>Ciudad de origen:</Text>
      <View style={{ borderWidth: 1, borderColor: BOA_COLORS.gray, borderRadius: 8, marginBottom: 10 }}>
        <Picker
          selectedValue={formData.originCity}
          onValueChange={(value: string) => updateFormData('originCity', value)}
        >
          <Picker.Item label="Selecciona ciudad de origen" value="" />
          {(formData.shippingType === 'nacional' ? NATIONAL_CITIES : NATIONAL_CITIES).map(city => (
            <Picker.Item key={city} label={city} value={city} />
          ))}
        </Picker>
      </View>
      <Text style={styles.label}>Ciudad de destino:</Text>
      <View style={{ borderWidth: 1, borderColor: BOA_COLORS.gray, borderRadius: 8, marginBottom: 20 }}>
        <Picker
          selectedValue={formData.destinationCity}
          onValueChange={(value: string) => updateFormData('destinationCity', value)}
        >
          <Picker.Item label="Selecciona ciudad de destino" value="" />
          {(formData.shippingType === 'nacional' ? NATIONAL_CITIES : INTERNATIONAL_CITIES).map(city => (
            <Picker.Item key={city} label={city} value={city} />
          ))}
        </Picker>
      </View>
      {/* Estimación de entrega dinámica */}
      {formData.originCity && formData.destinationCity && formData.estimatedDelivery && (
        <View style={{ marginTop: 10, backgroundColor: BOA_COLORS.lightGray, borderRadius: 8, padding: 10 }}>
          <Text style={{ color: BOA_COLORS.primary, fontWeight: 'bold' }}>Estimación de Entrega:</Text>
          <Text style={{ color: BOA_COLORS.dark }}>{formData.estimatedDelivery}</Text>
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Peso del Paquete</Text>
      <Text style={styles.label}>¿Cuánto pesa el paquete?</Text>
        <TextInput
        style={styles.input}
          placeholder="Peso (kg)"
          value={formData.weight}
          onChangeText={(value) => updateFormData('weight', value)}
          placeholderTextColor={BOA_COLORS.gray}
          keyboardType="numeric"
        />
      {/* Costo estimado dinámico */}
      {formData.weight && parseFloat(formData.weight) > 0 && (
        <View style={{ marginTop: 18, backgroundColor: BOA_COLORS.lightGray, borderRadius: 8, padding: 10 }}>
          <Text style={{ color: BOA_COLORS.primary, fontWeight: 'bold' }}>Costo estimado:</Text>
          {formData.shippingType === 'nacional' ? (
            <Text style={{ color: BOA_COLORS.dark, fontSize: 16 }}>Bs {cost.toFixed(2)}</Text>
          ) : (
            <>
              <Text style={{ color: BOA_COLORS.dark, fontSize: 16 }}>${costUSD.toFixed(2)} USD</Text>
              <Text style={{ color: BOA_COLORS.gray, fontSize: 15 }}>≈ Bs {cost.toFixed(2)}</Text>
            </>
          )}
      </View>
      )}
      </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Detalles Adicionales</Text>
      <Text style={styles.label}>Tipo de carga:</Text>
      <View style={{ borderWidth: 1, borderColor: BOA_COLORS.gray, borderRadius: 8, marginBottom: 15 }}>
        <Picker
          selectedValue={formData.cargoType}
          onValueChange={(value: string) => updateFormData('cargoType', value)}
        >
          <Picker.Item label="Selecciona tipo de carga" value="" />
          {CARGO_TYPES.map(type => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción del contenido"
        value={formData.description}
        onChangeText={(value) => updateFormData('description', value)}
        placeholderTextColor={BOA_COLORS.gray}
        multiline
        numberOfLines={3}
      />
      <Text style={{ color: BOA_COLORS.gray, fontSize: 13, marginBottom: 10 }}>
        Describe el contenido con detalle: tipo, cantidad, si es frágil, etc. (mínimo 10 caracteres)
      </Text>
      <Text style={styles.label}>Prioridad:</Text>
      <View style={styles.priorityButtons}>
        {(['low', 'medium', 'high'] as const).map(priority => (
          <TouchableOpacity
            key={priority}
            style={[
              styles.priorityButton,
              formData.priority === priority && styles.priorityButtonActive
            ]}
            onPress={() => updateFormData('priority', priority)}
          >
            <Text style={[
              styles.priorityButtonText,
              formData.priority === priority && styles.priorityButtonTextActive
            ]}>
              {priority === 'low' ? 'Baja' : priority === 'medium' ? 'Media' : 'Alta'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Paso 6: Confirmación tipo factura/baucher
  const renderStep6 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { textAlign: 'center' }]}>Confirmar Registro</Text>
      <View style={{ backgroundColor: BOA_COLORS.lightGray, borderRadius: 12, padding: 18, marginTop: 2 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 16, color: BOA_COLORS.primary, marginBottom: 10, textAlign: 'center' }}>Detalle del Envío</Text>
        {/* Remitente */}
        <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Remitente:</Text>
        <Text>Nombre: {formData.senderName}</Text>
        <Text>Teléfono: {formData.senderPhone}</Text>
        <Text>Email: {formData.senderEmail}</Text>
        <Text>Dirección: {formData.senderAddress}</Text>
        {/* Destinatario */}
        <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Destinatario:</Text>
        <Text>Nombre: {formData.recipientName}</Text>
        <Text>Teléfono: {formData.recipientPhone}</Text>
        <Text>Email: {formData.recipientEmail}</Text>
        <Text>Dirección: {formData.recipientAddress}</Text>
        {/* Detalles de envío */}
        <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Detalles del Envío:</Text>
        <Text>Peso: {formData.weight} kg</Text>
        <Text>Tipo de carga: {formData.cargoType}</Text>
        <Text>Descripción: {formData.description}</Text>
        <Text>Prioridad: {formData.priority === 'low' ? 'Baja' : formData.priority === 'medium' ? 'Media' : 'Alta'}</Text>
        <Text>Tipo de envío: {formData.shippingType === 'nacional' ? 'Nacional' : 'Internacional'}</Text>
        <Text>Origen: {formData.originCity}</Text>
        <Text>Destino: {formData.destinationCity}</Text>
        <Text>Estimación de entrega: {formData.estimatedDelivery}</Text>
        <Text>Fecha estimada de entrega: {estimatedDeliveryDate ? new Date(estimatedDeliveryDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No disponible'}</Text>
        {/* Costo */}
        <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Costo del Envío:</Text>
        {formData.shippingType === 'nacional' ? (
          <Text style={{ fontSize: 16, color: BOA_COLORS.primary }}>Bs {cost.toFixed(2)}</Text>
        ) : (
          <>
            <Text style={{ fontSize: 16, color: BOA_COLORS.primary }}>${costUSD.toFixed(2)} USD</Text>
            <Text style={{ fontSize: 15, color: BOA_COLORS.dark }}>≈ Bs {cost.toFixed(2)}</Text>
          </>
        )}
        {trackingNumber && (
          <View style={{ marginTop: 10, alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', color: BOA_COLORS.primary }}>N° de Seguimiento:</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: BOA_COLORS.primary }}>{trackingNumber}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Registro de Envío</Text>
            <Pressable style={styles.close} onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
            </Pressable>
          </View>

          {renderStepIndicator()}

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderCurrentStep()}
          </ScrollView>

          <View style={styles.footer}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
                <Text style={styles.secondaryButtonText}>Anterior</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < 6 ? (
              <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.primaryButtonText}>Siguiente</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
                <Text style={styles.primaryButtonText}>Registrar Envío</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '95%',
    maxWidth: 500,
    backgroundColor: BOA_COLORS.white,
    borderRadius: 18,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BOA_COLORS.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
  },
  close: {
    padding: 4,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: BOA_COLORS.lightGray,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  stepActive: {
    backgroundColor: BOA_COLORS.primary,
  },
  stepInactive: {
    backgroundColor: BOA_COLORS.gray,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: BOA_COLORS.white,
  },
  stepNumberInactive: {
    color: BOA_COLORS.white,
  },
  stepLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: BOA_COLORS.primary,
    fontWeight: 'bold',
  },
  stepLabelInactive: {
    color: BOA_COLORS.gray,
  },
  content: {
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 20,
  },
  input: {
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: BOA_COLORS.dark,
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginBottom: 10,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BOA_COLORS.lightGray,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: BOA_COLORS.primary,
    borderColor: BOA_COLORS.primary,
  },
  priorityButtonText: {
    fontSize: 14,
    color: BOA_COLORS.dark,
  },
  priorityButtonTextActive: {
    color: BOA_COLORS.white,
    fontWeight: 'bold',
  },
  previewCard: {
    backgroundColor: BOA_COLORS.lightGray,
    borderRadius: 12,
    padding: 15,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  previewSection: {
    marginBottom: 15,
  },
  previewSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginBottom: 5,
  },
  previewText: {
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginBottom: 2,
  },
  trackingPreview: {
    backgroundColor: BOA_COLORS.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  trackingLabel: {
    fontSize: 12,
    color: BOA_COLORS.white,
    marginBottom: 5,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: BOA_COLORS.lightGray,
  },
  primaryButton: {
    backgroundColor: BOA_COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
  },
  primaryButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: BOA_COLORS.primary,
    flex: 1,
    marginRight: 10,
  },
  secondaryButtonText: {
    color: BOA_COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 