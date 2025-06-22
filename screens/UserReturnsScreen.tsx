import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { BOA_COLORS } from '../theme';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

interface Return {
    id: number;
    return_tracking_number: string | null;
    original_tracking_number: string;
    created_at: string;
    status: 'pending' | 'approved' | 'rejected';
    user_email: string;
    first_name: string;
    last_name: string;
    rejection_comment?: string;
}

export const UserReturnsScreen = ({ route }: any) => {
    const { currentUser } = route.params;
    const [returns, setReturns] = useState<Return[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserReturns = useCallback(async () => {
        if (!currentUser?.email) return;
        setIsLoading(true);
        try {
            const response = await fetch(`http://192.168.100.16:3000/api/returns/user/${currentUser.email}`);
            const data = await response.json();
            if (response.ok) {
                setReturns(data);
            } else {
                Alert.alert("Error", "No se pudieron cargar tus devoluciones.");
            }
        } catch (error) {
            Alert.alert("Error de Conexión", "No se pudo conectar al servidor.");
        } finally {
            setIsLoading(false);
        }
    }, [currentUser.email]);

    useFocusEffect(useCallback(() => { fetchUserReturns(); }, [fetchUserReturns]));

    const generatePdfForReturn = async (item: Return) => {
        let htmlContent = '';
        const title = item.status === 'approved' ? 'Orden de Devolución Aprobada' : 'Comprobante de Solicitud';

        if (item.status === 'approved') {
            htmlContent = `
                <h1>${title}</h1>
                <p>Por favor, imprima esta orden y adjúntela a su paquete.</p>
                <hr/>
                <p><strong>Nº de Tracking de Devolución:</strong> ${item.return_tracking_number}</p>
                <p><strong>Nº de Tracking Original:</strong> ${item.original_tracking_number}</p>
                <p><strong>Cliente:</strong> ${item.first_name} ${item.last_name}</p>
                <hr/>
                <h3>Instrucciones</h3>
                <p>1. Empaquete el producto de forma segura.</p>
                <p>2. Pegue esta etiqueta de forma visible en el exterior del paquete.</p>
                <p>3. Entregue el paquete en la sucursal de Boa Tracking más cercana.</p>
            `;
        } else if (item.status === 'pending') {
            htmlContent = `
                <h1>${title}</h1>
                <p>Este documento confirma que hemos recibido su solicitud de devolución. Actualmente se encuentra en revisión.</p>
                <hr/>
                <p><strong>Nº de Tracking Original:</strong> ${item.original_tracking_number}</p>
                <p><strong>Cliente:</strong> ${item.first_name} ${item.last_name}</p>
                <p><strong>Fecha de Solicitud:</strong> ${new Date(item.created_at).toLocaleDateString()}</p>
                <hr/>
                <p style="font-weight: bold; color: #D32F2F;">IMPORTANTE: Este documento NO es una etiqueta de envío. Recibirá la orden final una vez que su solicitud sea aprobada.</p>
            `;
        }

        const html = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        h1 { color: #002E60; }
                        p { font-size: 14px; }
                        strong { font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">${htmlContent}</div>
                </body>
            </html>
        `;

        try {
            const { uri } = await Print.printToFileAsync({ html });
            await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            Alert.alert("Error", "No se pudo generar el PDF.");
        }
    };

    const renderItem = ({ item }: { item: Return }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                    <MaterialIcons name="local-shipping" size={24} color={BOA_COLORS.primary} />
                    <Text style={styles.trackingNumber}>Devolución</Text>
                </View>
                <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.detailText}>Tracking Original: {item.original_tracking_number}</Text>
                <Text style={styles.detailText}>Fecha Solicitud: {new Date(item.created_at).toLocaleDateString()}</Text>
                {item.return_tracking_number && (
                    <Text style={styles.detailText}>Nuevo Tracking: {item.return_tracking_number}</Text>
                )}
                {item.status === 'rejected' && item.rejection_comment && (
                    <View style={styles.rejectionInfo}>
                        <MaterialIcons name="info-outline" size={20} color={BOA_COLORS.danger} />
                        <Text style={styles.rejectionText}><Text style={{fontWeight: 'bold'}}>Motivo del Rechazo:</Text> {item.rejection_comment}</Text>
                    </View>
                )}
            </View>
            
            {item.status === 'approved' && (
                <TouchableOpacity style={styles.button} onPress={() => generatePdfForReturn(item)}>
                    <MaterialIcons name="picture-as-pdf" size={20} color="white" />
                    <Text style={styles.buttonText}>Descargar Orden Final</Text>
                </TouchableOpacity>
            )}

            {item.status === 'pending' && (
                <TouchableOpacity style={[styles.button, {backgroundColor: BOA_COLORS.warning}]} onPress={() => generatePdfForReturn(item)}>
                    <MaterialIcons name="receipt" size={20} color="white" />
                    <Text style={styles.buttonText}>Generar Comprobante</Text>
                </TouchableOpacity>
            )}
            
            {item.status === 'rejected' && (
                 <View style={[styles.button, styles.buttonDisabled]}>
                    <MaterialIcons name="cancel" size={20} color="white" />
                    <Text style={styles.buttonText}>Solicitud Rechazada</Text>
                </View>
            )}
        </View>
    );

    return (
        <ImageBackground source={require('../assets/fondo_mobile.png')} style={styles.container}>
            <SafeAreaView style={{flex: 1}}>
                {isLoading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={BOA_COLORS.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={returns}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No tienes solicitudes de devolución.</Text></View>}
                        contentContainerStyle={{ padding: 10 }}
                    />
                )}
            </SafeAreaView>
        </ImageBackground>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved': return BOA_COLORS.success;
        case 'pending': return BOA_COLORS.warning;
        case 'rejected': return BOA_COLORS.danger;
        default: return BOA_COLORS.gray;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 12,
        marginVertical: 8,
        marginHorizontal: 5,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 46, 96, 0.1)',
        paddingBottom: 10,
        marginBottom: 10,
    },
    trackingNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: BOA_COLORS.primary,
        marginLeft: 10,
        flexShrink: 1,
    },
    cardBody: {
        marginBottom: 15,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
        fontWeight: '500',
    },
    button: {
        backgroundColor: BOA_COLORS.secondary,
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 12,
    },
    emptyText: {
        fontSize: 16,
        color: BOA_COLORS.dark,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    buttonDisabled: {
        backgroundColor: BOA_COLORS.gray,
    },
    rejectionInfo: {
        marginTop: 10,
        backgroundColor: 'rgba(211, 47, 47, 0.08)',
        borderRadius: 8,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(211, 47, 47, 0.2)',
    },
    rejectionText: {
        color: BOA_COLORS.danger,
        marginLeft: 10,
        flex: 1,
        fontSize: 14,
    },
}); 