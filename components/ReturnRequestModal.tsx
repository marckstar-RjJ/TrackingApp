import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';

interface ReturnRequestModalProps {
    visible: boolean;
    onClose: () => void;
    currentUser: {
        email: string;
        name: string;
    } | null;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ visible, onClose, currentUser }) => {
    const [step, setStep] = useState(1);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [packageInfo, setPackageInfo] = useState({ cost: 0, status: '', elegible: false });
    const [isLoading, setIsLoading] = useState(false);
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (currentUser && visible) {
            const nameParts = currentUser.name.split(' ');
            const inferredFirstName = nameParts[0] || '';
            const inferredLastName = nameParts.slice(1).join(' ') || '';
            setFirstName(inferredFirstName);
            setLastName(inferredLastName);
        }
    }, [currentUser, visible]);

    const handleClose = () => {
        setStep(1);
        setTrackingNumber('');
        setPackageInfo({ cost: 0, status: '', elegible: false });
        setIsLoading(false);
        setReason('');
        onClose();
    };

    const handleCheckTracking = async () => {
        if (!trackingNumber.trim()) {
            Alert.alert('Error', 'Por favor, ingresa un número de tracking.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`https://b113-66-203-113-32.ngrok-free.app/api/packages/check-return/${trackingNumber}`);
            const data = await res.json();
            if (res.ok) {
                setPackageInfo({ cost: data.cost, status: data.status, elegible: data.elegible });
                setStep(2);
            } else {
                Alert.alert('Error', data.error || 'No se pudo verificar el paquete.');
            }
        } catch (error) {
            Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitRequest = async () => {
        if (!firstName.trim() || !lastName.trim() || !reason.trim()) {
            Alert.alert('Error', 'Por favor, completa todos los campos.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch('https://b113-66-203-113-32.ngrok-free.app/api/returns/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_email: currentUser?.email,
                    tracking_number: trackingNumber,
                    first_name: firstName,
                    last_name: lastName,
                    reason: reason,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setStep(4);
            } else {
                Alert.alert('Error en la Solicitud', data.error || 'No se pudo enviar la solicitud.');
            }
        } catch (error) {
            Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>Solicitar Devolución</Text>
            <Text style={styles.subtitle}>Ingresa el número de tracking del paquete que deseas devolver.</Text>
            <View style={styles.inputContainer}>
                <MaterialIcons name="confirmation-number" size={24} color={BOA_COLORS.gray} />
                <TextInput
                    style={styles.input}
                    placeholder="Ej: BOA-2024-001"
                    value={trackingNumber}
                    onChangeText={setTrackingNumber}
                    autoCapitalize="characters"
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleCheckTracking}>
                <Text style={styles.buttonText}>Verificar Paquete</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>Revisión del Paquete</Text>
            <View style={styles.infoBox}>
                <Text style={styles.infoText}>Costo del envío: <Text style={{fontWeight: 'bold'}}>Bs. {packageInfo.cost.toFixed(2)}</Text></Text>
                <Text style={styles.infoText}>Estado actual: <Text style={{fontWeight: 'bold'}}>{packageInfo.status}</Text></Text>
            </View>

            {packageInfo.elegible ? (
                <>
                    <Text style={styles.statusMessageSuccess}>¡Buenas noticias! Este paquete es elegible para devolución.</Text>
                    <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
                        <Text style={styles.buttonText}>Continuar con la Devolución</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.statusMessageError}>Este paquete no se puede devolver.</Text>
                    <Text style={styles.subtitle}>Solo se aceptan devoluciones de paquetes en estado 'pending' o 'received'.</Text>
                    <TouchableOpacity style={[styles.button, {backgroundColor: BOA_COLORS.gray}]} onPress={handleClose}>
                        <Text style={styles.buttonText}>Entendido</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
    
    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.title}>Completa tus Datos</Text>
            <View style={styles.userInfoBox}>
                <Text style={styles.infoText}>Nombre: <Text style={{fontWeight: 'normal'}}>{firstName}</Text></Text>
                <Text style={styles.infoText}>Apellido: <Text style={{fontWeight: 'normal'}}>{lastName}</Text></Text>
            </View>
            <Text style={styles.subtitle}>Escribe el motivo de tu devolución:</Text>
            <View style={styles.inputWrapper}>
                <TextInput style={[styles.inputStandalone, {height: 80, textAlignVertical: 'top'}]} placeholder="Ej: Ya no necesito el envío, cambié de opinión, etc." value={reason} onChangeText={setReason} multiline/>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSubmitRequest}>
                <Text style={styles.buttonText}>Enviar Solicitud</Text>
            </TouchableOpacity>
        </View>
    );
    
    const renderStep4 = () => (
        <View style={styles.stepContainer}>
            <MaterialIcons name="check-circle" size={80} color={BOA_COLORS.success} />
            <Text style={styles.title}>¡Solicitud Enviada!</Text>
            <Text style={styles.subtitle}>Tu solicitud de devolución ha sido enviada. Recibirás una notificación cuando sea revisada por un administrador.</Text>
            <TouchableOpacity style={styles.button} onPress={handleClose}>
                <Text style={styles.buttonText}>Finalizar</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal visible={visible} onRequestClose={handleClose} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
                    </TouchableOpacity>
                    {isLoading ? <ActivityIndicator size="large" color={BOA_COLORS.primary} /> : (
                        <>
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                            {step === 4 && renderStep4()}
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 15, padding: 20, paddingTop: 40 },
    closeButton: { position: 'absolute', top: 10, right: 10, padding: 5 },
    stepContainer: { alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', color: BOA_COLORS.dark, marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 16, color: BOA_COLORS.gray, marginBottom: 20, textAlign: 'center' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, marginBottom: 15 },
    input: { flex: 1, height: 50, fontSize: 16, marginLeft: 10 },
    inputWrapper: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
    },
    inputStandalone: {
        height: 50,
        fontSize: 16,
        paddingHorizontal: 15,
    },
    button: { backgroundColor: BOA_COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center', width: '100%' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    infoBox: {
        width: '100%',
        padding: 15,
        backgroundColor: '#f0f2f5',
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    infoText: {
        fontSize: 16,
        color: BOA_COLORS.dark,
        marginBottom: 5,
    },
    statusMessageSuccess: {
        fontSize: 16,
        color: BOA_COLORS.success,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    statusMessageError: {
        fontSize: 18,
        color: BOA_COLORS.danger,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    userInfoBox: {
        width: '100%',
        padding: 15,
        backgroundColor: '#f0f2f5',
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
}); 