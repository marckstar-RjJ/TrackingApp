import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';
import { ReturnRequestDetailModal } from '../components/ReturnRequestDetailModal';

interface ReturnRequest {
    id: number;
    user_email: string;
    package_tracking_number: string;
    first_name: string;
    last_name: string;
    reason: string;
    status: string;
    rejection_comment?: string;
    created_at: string;
}

const FILTERS = [
    { label: 'Pendientes', value: 'pending' },
    { label: 'Aprobadas', value: 'approved' },
    { label: 'Rechazadas', value: 'rejected' },
    { label: 'Todas', value: 'all' },
];

export const AdminReturnsScreen = () => {
    const [requests, setRequests] = useState<ReturnRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
    const [rejectionComment, setRejectionComment] = useState('');
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const fetchRequests = useCallback(async (status: string) => {
        setIsLoading(true);
        try {
            let url = `http://192.168.100.16:3000/api/returns/requests`;
            if (status !== 'all') {
                url += `?status=${status}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (response.ok) {
                setRequests(data);
            } else {
                Alert.alert('Error', 'No se pudieron cargar las solicitudes.');
            }
        } catch (error) {
            Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchRequests(filter);
        }, [fetchRequests, filter])
    );

    const openRejectionModal = (request: ReturnRequest) => {
        setSelectedRequest(request);
        setRejectionModalVisible(true);
    };

    const openDetailModal = (request: ReturnRequest) => {
        setSelectedRequest(request);
        setDetailModalVisible(true);
    };

    const handleApprove = async (id: number) => {
        Alert.alert(
            "Confirmar Aprobación",
            "¿Estás seguro de que deseas aprobar esta devolución? El paquete original será eliminado.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Aprobar",
                    onPress: async () => {
                        try {
                            const res = await fetch(`http://192.168.100.16:3000/api/returns/requests/${id}/approve`, { method: 'PUT' });
                            if (res.ok) {
                                Alert.alert('Éxito', 'La devolución ha sido aprobada.');
                                fetchRequests(filter);
                            } else { /* ... */ }
                        } catch (error) { /* ... */ }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionComment.trim()) {
            Alert.alert("Error", "Debes seleccionar una solicitud y escribir un motivo de rechazo.");
            return;
        }
        try {
            const res = await fetch(`http://192.168.100.16:3000/api/returns/requests/${selectedRequest.id}/reject`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: rejectionComment }),
            });
            if (res.ok) {
                Alert.alert('Éxito', 'La solicitud ha sido rechazada.');
                setRejectionModalVisible(false);
                fetchRequests(filter);
            } else { /* ... */ }
        } catch (error) { /* ... */ }
    };

    const handleApproveFromModal = (id: number) => {
        setDetailModalVisible(false);
        handleApprove(id);
    };

    const handleRejectFromModal = (id: number) => {
        setDetailModalVisible(false);
        openRejectionModal(requests.find(r => r.id === id)!);
    };

    const renderItem = ({ item }: { item: ReturnRequest }) => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Solicitud de Devolución</Text>
            <Text style={styles.cardText}>Usuario: {item.user_email}</Text>
            <Text style={styles.cardText}>Tracking Original: {item.package_tracking_number}</Text>
            <Text style={styles.cardText}>Fecha: {new Date(item.created_at).toLocaleDateString()}</Text>

            {item.status === 'pending' && (
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={[styles.button, styles.detailsButton]} onPress={() => openDetailModal(item)}>
                        <MaterialIcons name="pageview" size={20} color="white" />
                        <Text style={styles.buttonText}>Ver Detalles</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <ImageBackground source={require('../assets/fondo_mobile.png')} style={styles.container}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Gestión de Devoluciones</Text>
                </View>
                <View style={styles.filterContainer}>
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f.value}
                            style={[styles.filterButton, filter === f.value && styles.filterButtonActive]}
                            onPress={() => setFilter(f.value)}
                        >
                            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>{f.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No hay solicitudes con este filtro.</Text>
                        </View>
                    }
                />
                {isLoading && (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={BOA_COLORS.primary} />
                    </View>
                )}

                <ReturnRequestDetailModal 
                    visible={detailModalVisible}
                    onClose={() => setDetailModalVisible(false)}
                    request={selectedRequest}
                    onApprove={handleApproveFromModal}
                    onReject={handleRejectFromModal}
                />

                <Modal
                    visible={rejectionModalVisible}
                    onRequestClose={() => setRejectionModalVisible(false)}
                    transparent
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.rejectionModalContainer}>
                            <Text style={styles.rejectionModalTitle}>Motivo del Rechazo</Text>
                            <Text style={styles.rejectionModalSubtitle}>
                                Por favor, escribe un motivo claro. El usuario podrá ver este comentario.
                            </Text>
                            
                            <TextInput
                                style={styles.rejectionInput}
                                value={rejectionComment}
                                onChangeText={setRejectionComment}
                                placeholder="Ej: El paquete ya ha sido clasificado y no es elegible para devolución."
                                multiline
                                numberOfLines={4}
                            />

                            <View style={styles.rejectionActions}>
                                <TouchableOpacity
                                    style={[styles.rejectionButton, styles.cancelButton]}
                                    onPress={() => setRejectionModalVisible(false)}
                                >
                                    <Text style={styles.rejectionButtonText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.rejectionButton, styles.confirmButton]}
                                    onPress={handleReject}
                                >
                                    <Text style={[styles.rejectionButtonText, { color: 'white' }]}>Confirmar Rechazo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loaderContainer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 10 },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: 15,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    cardTitle: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 10,
        color: BOA_COLORS.primary,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 46, 96, 0.1)',
        paddingBottom: 8,
    },
    cardText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
        fontWeight: '500',
    },
    actionsContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
    button: { padding: 10, backgroundColor: BOA_COLORS.primary, borderRadius: 5 },
    approveButton: { backgroundColor: BOA_COLORS.success },
    rejectButton: { backgroundColor: BOA_COLORS.danger },
    buttonText: { fontSize: 16, fontWeight: 'bold', color: 'white' },
    detailsButton: {
        backgroundColor: BOA_COLORS.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectionModalContainer: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
    },
    rejectionModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: BOA_COLORS.dark,
        marginBottom: 10,
    },
    rejectionModalSubtitle: {
        fontSize: 14,
        color: BOA_COLORS.gray,
        textAlign: 'center',
        marginBottom: 20,
    },
    rejectionInput: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    rejectionActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
    },
    rejectionButton: {
        paddingVertical: 12,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f2f5',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    confirmButton: {
        backgroundColor: BOA_COLORS.danger,
    },
    rejectionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: BOA_COLORS.dark,
    },
    emptyContainer: {
        marginTop: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: BOA_COLORS.dark,
        fontWeight: 'bold',
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.4)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0, 46, 96, 0.8)', // Un azul oscuro semitransparente
        paddingVertical: 10,
    },
    filterButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterButtonActive: {
        backgroundColor: 'white',
    },
    filterText: {
        color: 'white',
        fontWeight: 'bold',
    },
    filterTextActive: {
        color: BOA_COLORS.primary,
    },
}); 