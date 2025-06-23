import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
  SafeAreaView,
  ImageBackground
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';
import { Picker } from '@react-native-picker/picker';

// Interfaces y datos
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
    shippingType: string;
}

// --- Lógica de cálculo (copiada del modal de admin) ---
const NATIONAL_CITIES = ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Tarija', 'Cobija', 'Trinidad', 'Oruro'];
const INTERNATIONAL_CITIES = ['Miami', 'Madrid', 'Buenos Aires', 'São Paulo', 'Lima', 'La Habana', 'Caracas'];
const CARGO_TYPES = ['Documentos', 'Ropa', 'Electrónica', 'Medicamentos', 'Alimentos no perecederos', 'Muestras comerciales', 'Juguetes', 'Libros', 'Repuestos', 'Material frágil'];
const USD_TO_BS = 6.96;
function roundToNearestHalf(num: number) { return Math.round(num * 2) / 2; }
function calculateNationalCost(weight: number): number {
    if (weight <= 1) return roundToNearestHalf(4);
    if (weight <= 10) return roundToNearestHalf(weight * 4);
    if (weight <= 25) return roundToNearestHalf(weight * 4);
    if (weight <= 100) return roundToNearestHalf(weight * 3.5);
    if (weight > 100 && weight < 300) return roundToNearestHalf(weight * 3.5);
    if (weight >= 300) return roundToNearestHalf(weight * 3);
    return roundToNearestHalf(weight * 4);
}
function getDeliveryEstimate(origin: string, destination: string, type: string): string {
    if (type === 'nacional') {
        if (['La Paz', 'Santa Cruz', 'Cochabamba'].includes(origin) && ['La Paz', 'Santa Cruz', 'Cochabamba'].includes(destination)) return '1 día hábil';
        return '1-2 días hábiles';
    } else {
        if (destination === 'Miami') return '4–6 días hábiles';
        if (destination === 'Madrid') return '6–8 días hábiles';
        return '3-5 días hábiles';
    }
}
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
  else usd = (INTL_COST_TABLE[destination]?.['10'] || 250) + ((weight - 10) * 15);
  const bs = roundToNearestHalf(usd * USD_TO_BS);
  return { usd, bs };
}
function addBusinessDays(date: Date, days: number): Date {
  let result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      added++;
    }
  }
  return result;
}
function parseBusinessDays(estimate: string): number {
  if (!estimate) return 2;
  const match = estimate.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  return 2;
}
// --- Fin Lógica de cálculo ---

export const PreRegistrationScreen = ({ route, navigation }: any) => {
    const { currentUser } = route.params;

    const [formData, setFormData] = useState<ShippingData>({
        senderName: '', senderPhone: '', senderAddress: '', senderEmail: '',
        recipientName: '', recipientPhone: '', recipientAddress: '', recipientEmail: '',
        weight: '', cargoType: CARGO_TYPES[0], originCity: NATIONAL_CITIES[0], destinationCity: NATIONAL_CITIES[1],
        description: '', priority: 'medium', shippingType: 'nacional',
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [showPreview, setShowPreview] = useState(false);
    const [noSenderEmail, setNoSenderEmail] = useState(false);
    const [noRecipientEmail, setNoRecipientEmail] = useState(false);
    const [cost, setCost] = useState(0);
    const [costUSD, setCostUSD] =useState(0);
    const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
    const [preregistrationTrackingNumber, setPreregistrationTrackingNumber] = useState('');

    useEffect(() => {
        const weightNum = parseFloat(formData.weight);
        if (!isNaN(weightNum) && weightNum > 0) {
            let deliveryEstimate = '';
            if (formData.shippingType === 'nacional') {
                setCost(calculateNationalCost(weightNum));
                setCostUSD(0);
                deliveryEstimate = getDeliveryEstimate(formData.originCity, formData.destinationCity, 'nacional');
            } else {
                const { usd, bs } = calculateInternationalCost(weightNum, formData.destinationCity);
                setCost(bs);
                setCostUSD(usd);
                deliveryEstimate = getDeliveryEstimate(formData.originCity, formData.destinationCity, 'internacional');
            }
            const days = parseBusinessDays(deliveryEstimate);
            const deliveryDate = addBusinessDays(new Date(), days);
            setEstimatedDeliveryDate(deliveryDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }));
        }
    }, [formData.weight, formData.originCity, formData.destinationCity, formData.shippingType]);
    
    const generatePreregistrationTrackingNumber = (): string => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `PRE-${year}${month}${day}-${random}`;
    };

    const API_URL = 'https://b113-66-203-113-32.ngrok-free.app/api/preregistrations';

    const handleNext = () => {
        if (currentStep === 1 && (!formData.senderName.trim() || !formData.senderPhone.trim() || !formData.senderAddress.trim())) {
            Alert.alert('Error', 'Por favor completa todos los campos del remitente.');
            return;
        }
        if (currentStep === 2 && (!formData.recipientName.trim() || !formData.recipientPhone.trim() || !formData.recipientAddress.trim())) {
            Alert.alert('Error', 'Por favor completa todos los campos del destinatario.');
            return;
        }
        if (currentStep === 3 && (!formData.originCity.trim() || !formData.destinationCity.trim())) {
            Alert.alert('Error', 'Por favor selecciona la ruta del envío.');
            return;
        }
        if (currentStep === 4 && (!formData.weight.trim() || isNaN(Number(formData.weight)) || Number(formData.weight) <= 0)) {
            Alert.alert('Error', 'El peso debe ser un número válido y mayor a 0.');
            return;
        }
        if (currentStep < 6) {
          setCurrentStep(currentStep + 1);
        } else {
          handlePreview();
        }
    };

    const handlePrevious = () => {
        setShowPreview(false);
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const handlePreview = () => {
        if (formData.description.trim().length < 10) {
            Alert.alert('Descripción Requerida', 'La descripción del contenido es obligatoria y debe tener al menos 10 caracteres.');
            return;
        }
        setPreregistrationTrackingNumber(generatePreregistrationTrackingNumber());
        setShowPreview(true);
    };

    const handleRegister = async () => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: currentUser.email,
                    sender_name: formData.senderName,
                    sender_phone: formData.senderPhone,
                    sender_address: formData.senderAddress,
                    sender_email: formData.senderEmail,
                    recipient_name: formData.recipientName,
                    recipient_phone: formData.recipientPhone,
                    recipient_address: formData.recipientAddress,
                    recipient_email: formData.recipientEmail,
                    weight: parseFloat(formData.weight),
                    cargo_type: formData.cargoType,
                    origin_city: formData.originCity,
                    destination_city: formData.destinationCity,
                    description: formData.description,
                    priority: formData.priority,
                    shipping_type: formData.shippingType,
                    cost: cost,
                    estimated_delivery_date: estimatedDeliveryDate,
                    preregistration_tracking_number: preregistrationTrackingNumber,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar el pre-registro.');
            }
            Alert.alert('Pre-registro Exitoso', 'Tu solicitud ha sido enviada. Un administrador la revisará y se pondrá en contacto contigo.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const updateFormData = (field: keyof ShippingData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const renderStepIndicator = () => (
      <View style={styles.stepIndicatorContainer}>
          {Array.from({ length: 6 }, (_, i) => i + 1).map(step => (
              <React.Fragment key={step}>
                  <View style={[styles.step, currentStep >= step && styles.stepActive, showPreview && styles.stepActive]}>
                      <Text style={[styles.stepText, (currentStep >= step || showPreview) && styles.stepTextActive]}>{step}</Text>
                  </View>
                  {step < 6 && <View style={[styles.stepLine, (currentStep > step || showPreview) && styles.stepLineActive]} />}
              </React.Fragment>
          ))}
      </View>
    );

    const renderStep1 = () => (
        <View style={styles.formContent}>
            <Text style={styles.stepTitle}>Paso 1: Datos del Remitente</Text>
            <TextInput style={styles.input} placeholder="Nombre completo" value={formData.senderName} onChangeText={v => updateFormData('senderName', v)} />
            <TextInput style={styles.input} placeholder="Teléfono" value={formData.senderPhone} onChangeText={v => updateFormData('senderPhone', v)} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Dirección de recojo" value={formData.senderAddress} onChangeText={v => updateFormData('senderAddress', v)} />
            <Pressable style={styles.checkboxContainer} onPress={() => setNoSenderEmail(!noSenderEmail)}>
                <MaterialIcons name={noSenderEmail ? 'check-box' : 'check-box-outline-blank'} size={24} color={BOA_COLORS.primary} />
                <Text style={styles.checkboxLabel}>El remitente no tiene correo electrónico</Text>
            </Pressable>
            {!noSenderEmail && <TextInput style={styles.input} placeholder="Correo electrónico (opcional)" value={formData.senderEmail} onChangeText={v => updateFormData('senderEmail', v)} keyboardType="email-address" />}
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.formContent}>
            <Text style={styles.stepTitle}>Paso 2: Datos del Destinatario</Text>
            <TextInput style={styles.input} placeholder="Nombre completo" value={formData.recipientName} onChangeText={v => updateFormData('recipientName', v)} />
            <TextInput style={styles.input} placeholder="Teléfono" value={formData.recipientPhone} onChangeText={v => updateFormData('recipientPhone', v)} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Dirección de entrega" value={formData.recipientAddress} onChangeText={v => updateFormData('recipientAddress', v)} />
            <Pressable style={styles.checkboxContainer} onPress={() => setNoRecipientEmail(!noRecipientEmail)}>
                <MaterialIcons name={noRecipientEmail ? 'check-box' : 'check-box-outline-blank'} size={24} color={BOA_COLORS.primary} />
                <Text style={styles.checkboxLabel}>El destinatario no tiene correo electrónico</Text>
            </Pressable>
            {!noRecipientEmail && <TextInput style={styles.input} placeholder="Correo electrónico (opcional)" value={formData.recipientEmail} onChangeText={v => updateFormData('recipientEmail', v)} keyboardType="email-address" />}
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.formContent}>
            <Text style={styles.stepTitle}>Paso 3: Ruta del Envío</Text>
            <View style={styles.inputGroup}>
                <TouchableOpacity style={[styles.typeButton, formData.shippingType === 'nacional' && styles.typeButtonActive]} onPress={() => updateFormData('shippingType', 'nacional')}>
                    <Text style={[styles.typeButtonText, formData.shippingType === 'nacional' && styles.typeButtonTextActive]}>Nacional</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeButton, formData.shippingType === 'internacional' && styles.typeButtonActive]} onPress={() => updateFormData('shippingType', 'internacional')}>
                    <Text style={[styles.typeButtonText, formData.shippingType === 'internacional' && styles.typeButtonTextActive]}>Internacional</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.label}>Origen</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={formData.originCity} onValueChange={(v) => updateFormData('originCity', v)} style={styles.picker}>
                    {(formData.shippingType === 'nacional' ? NATIONAL_CITIES : ['La Paz', 'Santa Cruz', 'Cochabamba']).map(city => <Picker.Item key={city} label={city} value={city} />)}
                </Picker>
            </View>
            <Text style={styles.label}>Destino</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={formData.destinationCity} onValueChange={(v) => updateFormData('destinationCity', v)} style={styles.picker}>
                    {(formData.shippingType === 'nacional' ? NATIONAL_CITIES : INTERNATIONAL_CITIES).filter(c => c !== formData.originCity).map(city => <Picker.Item key={city} label={city} value={city} />)}
                </Picker>
            </View>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.formContent}>
            <Text style={styles.stepTitle}>Paso 4: Peso y Tipo de Carga</Text>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput style={styles.input} placeholder="Ej: 2.5" value={formData.weight} onChangeText={v => updateFormData('weight', v)} keyboardType="numeric" />
            {cost > 0 && (
                <View style={styles.costPreview}>
                    <Text style={styles.costPreviewLabel}>Costo Estimado:</Text>
                    <Text style={styles.costPreviewValue}>
                        {`Bs. ${cost.toFixed(2)}`}
                        {costUSD > 0 && ` (USD ${costUSD.toFixed(2)})`}
                    </Text>
                </View>
            )}
            <Text style={styles.label}>Tipo de Carga</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={formData.cargoType} onValueChange={(v) => updateFormData('cargoType', v)} style={styles.picker}>
                    {CARGO_TYPES.map(type => <Picker.Item key={type} label={type} value={type} />)}
                </Picker>
            </View>
        </View>
    );

    const renderStep5 = () => (
        <View style={styles.formContent}>
            <Text style={styles.stepTitle}>Paso 5: Descripción y Prioridad</Text>
            <Text style={styles.label}>Descripción del Contenido</Text>
            <TextInput style={[styles.input, { height: 100 }]} placeholder="Detalla el contenido del paquete. Mínimo 10 caracteres." value={formData.description} onChangeText={v => updateFormData('description', v)} multiline />
            <Text style={styles.label}>Prioridad del Envío</Text>
            <View style={styles.inputGroup}>
                {(['low', 'medium', 'high'] as const).map(p => (
                    <TouchableOpacity key={p} style={[styles.priorityButton, formData.priority === p && styles.priorityButtonActive]} onPress={() => updateFormData('priority', p)}>
                        <Text style={[styles.priorityButtonText, formData.priority === p && styles.priorityButtonTextActive]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStep6 = () => (
        <View style={styles.formContent}>
            <Text style={styles.stepTitle}>Paso 6: Resumen</Text>
            <Text style={styles.confirmationText}>Revisa que todos los datos sean correctos antes de continuar.</Text>
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
            default: return null;
        }
    };
    
    const renderPreview = () => (
        <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Resumen del Pre-registro</Text>
            <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Nro. Pre-registro</Text>
                <Text style={styles.trackingNumberPreview}>{preregistrationTrackingNumber}</Text>
            </View>
            <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Remitente</Text>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Nombre:</Text><Text style={styles.previewValue}>{formData.senderName}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Teléfono:</Text><Text style={styles.previewValue}>{formData.senderPhone}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Dirección:</Text><Text style={styles.previewValue}>{formData.senderAddress}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Email:</Text><Text style={styles.previewValue}>{formData.senderEmail || 'N/A'}</Text></View>
            </View>
            <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Destinatario</Text>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Nombre:</Text><Text style={styles.previewValue}>{formData.recipientName}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Teléfono:</Text><Text style={styles.previewValue}>{formData.recipientPhone}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Dirección:</Text><Text style={styles.previewValue}>{formData.recipientAddress}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Email:</Text><Text style={styles.previewValue}>{formData.recipientEmail || 'N/A'}</Text></View>
            </View>
            <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Detalles del Envío</Text>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Ruta:</Text><Text style={styles.previewValue}>{`${formData.originCity} → ${formData.destinationCity}`}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Peso:</Text><Text style={styles.previewValue}>{`${formData.weight} kg`}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Carga:</Text><Text style={styles.previewValue}>{formData.cargoType}</Text></View>
                <View style={styles.previewRow}><Text style={styles.previewLabel}>Prioridad:</Text><Text style={styles.previewValue}>{formData.priority}</Text></View>
            </View>
            <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Costo y Entrega Estimada</Text>
                <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Costo Total:</Text>
                    <Text style={styles.previewValue}>{`Bs. ${cost.toFixed(2)}`}{costUSD > 0 && ` (USD ${costUSD.toFixed(2)})`}</Text>
                </View>
                <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Entrega Estimada:</Text>
                    <Text style={styles.previewValue}>{estimatedDeliveryDate}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={handleRegister}>
                <Text style={styles.confirmButtonText}>Confirmar y Enviar Pre-registro</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ImageBackground source={require('../assets/fondo_mobile.png')} style={styles.container} resizeMode="cover">
                
                <ScrollView contentContainerStyle={styles.content}>
                    {renderStepIndicator()}
                    {showPreview ? renderPreview() : renderCurrentStep()}
                    {!showPreview && (
                        <View style={styles.navigationButtons}>
                            {currentStep > 1 && (
                                <TouchableOpacity style={[styles.button, styles.prevButton]} onPress={handlePrevious}>
                                    <Text style={styles.buttonText}>Anterior</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNext}>
                                <Text style={styles.buttonText}>{currentStep === 6 ? 'Ver Resumen' : 'Siguiente'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: BOA_COLORS.primary },
    container: { flex: 1 },
    headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: 'rgba(25, 118, 210, 0.9)' },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: BOA_COLORS.white },
    content: { padding: 20, paddingBottom: 100 },
    stepIndicatorContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, paddingHorizontal: 10 },
    step: { width: 36, height: 36, borderRadius: 18, backgroundColor: BOA_COLORS.lightGray, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: BOA_COLORS.secondary },
    stepActive: { backgroundColor: BOA_COLORS.primary, borderColor: BOA_COLORS.primary },
    stepText: { color: BOA_COLORS.primary, fontWeight: 'bold' },
    stepTextActive: { color: BOA_COLORS.white },
    stepLine: { flex: 1, height: 3, backgroundColor: BOA_COLORS.lightGray },
    stepLineActive: { backgroundColor: BOA_COLORS.primary },
    formContent: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 20, marginBottom: 20 },
    stepTitle: { fontSize: 18, fontWeight: 'bold', color: BOA_COLORS.dark, marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: 'bold', color: BOA_COLORS.primary, marginBottom: 8 },
    input: { backgroundColor: BOA_COLORS.white, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    inputGroup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    checkboxLabel: { marginLeft: 8, color: BOA_COLORS.gray },
    pickerContainer: { backgroundColor: BOA_COLORS.white, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15, overflow: 'hidden' },
    picker: {},
    typeButton: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: BOA_COLORS.secondary, flex: 1, alignItems: 'center', marginHorizontal: 5 },
    typeButtonActive: { backgroundColor: BOA_COLORS.primary, borderColor: BOA_COLORS.primary },
    typeButtonText: { color: BOA_COLORS.primary, fontWeight: '500' },
    typeButtonTextActive: { color: BOA_COLORS.white },
    priorityButton: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: BOA_COLORS.secondary, flex: 1, alignItems: 'center', marginHorizontal: 5 },
    priorityButtonActive: { backgroundColor: BOA_COLORS.primary, borderColor: BOA_COLORS.primary },
    priorityButtonText: { color: BOA_COLORS.primary, fontWeight: '500' },
    priorityButtonTextActive: { color: BOA_COLORS.white },
    navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    button: { paddingVertical: 14, borderRadius: 8, flex: 1, alignItems: 'center' },
    prevButton: { backgroundColor: BOA_COLORS.gray, marginRight: 10 },
    nextButton: { backgroundColor: BOA_COLORS.success },
    buttonText: { color: BOA_COLORS.white, fontWeight: 'bold', fontSize: 16 },
    previewContainer: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 20, marginBottom: 20 },
    previewTitle: { fontSize: 20, fontWeight: 'bold', color: BOA_COLORS.primary, marginBottom: 15, textAlign: 'center' },
    previewSection: { marginBottom: 15 },
    previewSectionTitle: { fontSize: 16, fontWeight: 'bold', color: BOA_COLORS.dark, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: BOA_COLORS.lightGray, paddingBottom: 5 },
    previewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, paddingVertical: 2 },
    previewLabel: { color: BOA_COLORS.gray, fontSize: 14 },
    previewValue: { color: BOA_COLORS.dark, fontSize: 14, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 10 },
    confirmationText: {
        fontSize: 16,
        textAlign: 'center',
        color: BOA_COLORS.dark,
        marginBottom: 20,
    },
    costPreview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        marginTop: -10,
        marginBottom: 15,
    },
    costPreviewLabel: {
        fontSize: 16,
        color: BOA_COLORS.primary,
        fontWeight: '500',
    },
    costPreviewValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: BOA_COLORS.primary,
    },
    confirmButton: { backgroundColor: BOA_COLORS.primary, borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
    confirmButtonText: { color: BOA_COLORS.white, fontWeight: 'bold', fontSize: 18 },
    trackingNumberPreview: {
        fontSize: 18,
        fontWeight: 'bold',
        color: BOA_COLORS.success,
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: 1,
    },
}); 