import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';
import { BACKEND_URL } from '../utils/backend';

interface ReturnRequest {
    id: number;
    user_email: string;
    package_tracking_number: string;
    first_name: string;
    last_name: string;
    reason: string;
    status: string;
}

interface PackageDetails {
    // Definiremos los campos que necesitamos de la API de paquetes
    description: string;
    origin: string;
    destination: string;
    weight: number;
    status: string; // Estado actual del paquete
}

interface ReturnRequestDetailModalProps {
    visible: boolean;
    onClose: () => void;
    request: ReturnRequest | null;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
}

export const ReturnRequestDetailModal: React.FC<ReturnRequestDetailModalProps> = ({
    visible,
    onClose,
    request,
    onApprove,
    onReject,
}) => {
    const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (request) {
            fetchPackageDetails(request.package_tracking_number);
        }
    }, [request]);

    const fetchPackageDetails = async (trackingNumber: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/packages/${trackingNumber}`);
            const data = await res.json();
            if (res.ok) {
                setPackageDetails(data);
            } else {
                Alert.alert("Error", "No se pudieron obtener los detalles del paquete original.");
            }
        } catch (error) {
            Alert.alert("Error de Conexión", "No se pudo conectar con el servidor para obtener los detalles del paquete.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!request) return null;

    return (
        <Modal visible={visible} onRequestClose={onClose} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Detalles de la Solicitud</Text>
                    
                    {isLoading || !packageDetails ? (
                        <ActivityIndicator size="large" color={BOA_COLORS.primary} />
                    ) : (
                        <ScrollView>
                            <DetailSection title="Datos de la Solicitud">
                                <DetailRow label="Solicitante" value={request.user_email} />
                                <DetailRow label="Nombre" value={`${request.first_name} ${request.last_name}`} />
                                <DetailRow label="Motivo" value={request.reason} isLongText />
                            </DetailSection>

                            <DetailSection title="Detalles del Paquete Original">
                                <DetailRow label="Tracking" value={request.package_tracking_number} />
                                <DetailRow label="Estado Actual" value={packageDetails.status} />
                                <DetailRow label="Descripción" value={packageDetails.description} />
                                <DetailRow label="Peso" value={`${packageDetails.weight} kg`} />
                                <DetailRow label="Origen" value={packageDetails.origin} />
                                <DetailRow label="Destino" value={packageDetails.destination} />
                            </DetailSection>
                            
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={() => onApprove(request.id)}>
                                    <Text style={styles.buttonText}>Aprobar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={() => onReject(request.id)}>
                                    <Text style={styles.buttonText}>Rechazar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}

                    {!isLoading && (
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <MaterialIcons name="close" size={24} color={BOA_COLORS.gray} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

// Componentes auxiliares para el diseño
const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const DetailRow: React.FC<{label: string, value: string, isLongText?: boolean}> = ({ label, value, isLongText }) => (
    <View style={isLongText ? styles.rowContainerLong : styles.rowContainer}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

// Estilos actualizados
const styles = StyleSheet.create({
    // Estilos básicos para el modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '95%', backgroundColor: 'white', borderRadius: 15, padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    closeButton: { position: 'absolute', top: 10, right: 10 },
    actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
    button: { padding: 10, borderRadius: 5, width: '45%', alignItems: 'center' },
    approveButton: { backgroundColor: BOA_COLORS.success },
    rejectButton: { backgroundColor: BOA_COLORS.danger },
    buttonText: { color: 'white', fontWeight: 'bold' },
    sectionContainer: { marginBottom: 15, backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: BOA_COLORS.primary, marginBottom: 10 },
    rowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    rowContainerLong: { flexDirection: 'column', marginBottom: 5 },
    label: { fontWeight: 'bold', color: '#555' },
    value: { color: '#333', flexShrink: 1 },
}); 