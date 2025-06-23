import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { BOA_COLORS } from '../theme/colors';
import { Alert as RNAlert } from 'react-native';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { BACKEND_URL } from '../utils/backend';

interface UserPackagesScreenProps {
  navigation: any;
  route: any;
}

export const UserPackagesScreen: React.FC<UserPackagesScreenProps> = ({ navigation, route }) => {
  const { currentUser } = route.params || {};
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.email) {
      fetchUserPreRegistrations();
    } else {
      Alert.alert("Error", "No se ha podido identificar al usuario.");
      setIsLoading(false);
    }
  }, [currentUser]);

  const fetchUserPreRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/preregistrations/${currentUser.email}`);
      const data = await response.json();
      if (response.ok) {
        setPackages(data);
      } else {
        Alert.alert("Error", data.error || "No se pudieron cargar los pre-registros.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error de Conexión", "No se pudo conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackagePress = (pkg: any) => {
    navigation.navigate('TrackingDetail', { 
      trackingItem: { 
        ...pkg,
        trackingNumber: pkg.status === 'Aprobado' ? pkg.approved_tracking_number : pkg.preregistration_tracking_number,
        status: pkg.status === 'Aprobado' ? 'Aprobado' : 'Pre-registrado',
        estimatedDelivery: pkg.estimated_delivery_date,
        events: [{
          id: pkg.id,
          eventType: pkg.status === 'Aprobado' ? 'Preregistro Aprobado' : 'Pre-Registro',
          description: pkg.status === 'Aprobado' 
            ? 'El preregistro ha sido aprobado y convertido en paquete oficial'
            : 'Envío pre-registrado por el cliente.',
          location: pkg.origin_city,
          timestamp: new Date(pkg.status === 'Aprobado' ? pkg.approved_at : pkg.created_at),
          operator: 'Sistema'
        }]
      }, 
      currentUser 
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDelete = (pkg: any) => {
    RNAlert.alert(
      '¿Borrar pre-registro?',
      '¿Estás seguro de que deseas borrar este pre-registro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(pkg.id);
            try {
              const res = await fetch(`${BACKEND_URL}/preregistrations/${pkg.id}`, { method: 'DELETE' });
              if (res.ok) {
                setPackages((prev) => prev.filter((p: any) => p.id !== pkg.id));
              } else {
                Alert.alert('Error', 'No se pudo borrar el pre-registro.');
              }
            } catch (e) {
              Alert.alert('Error', 'No se pudo conectar con el servidor.');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const handleCopyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copiado', 'El número de tracking ha sido copiado al portapapeles.');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${datePart} ${timePart} hs`;
  };

  const handleDownloadTrackingOrder = async (pkg: any) => {
    console.log('🔽 Iniciando descarga de PDF para:', pkg.approved_tracking_number);
    
    if (pkg.status !== 'Aprobado' || !pkg.approved_tracking_number) {
      Alert.alert('No disponible', 'La orden de tracking solo está disponible para preregistros aprobados.');
      return;
    }

    setIsGeneratingPdf(true);
    
    try {
      console.log('📄 Generando HTML para PDF...');
      
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
              .container { padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
              .header h1 { color: #1976D2; margin: 0; }
              .header p { margin: 5px 0; font-size: 14px; color: #777; }
              .status-badge { 
                display: inline-block; 
                padding: 5px 15px; 
                border-radius: 20px; 
                font-size: 12px; 
                font-weight: bold; 
                margin-top: 5px;
                background-color: #4CAF50;
                color: white;
              }
              .section { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
              .section h2 { color: #1976D2; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 0; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
              .info-item { background-color: #f9f9f9; padding: 10px; border-radius: 5px; }
              .info-item strong { display: block; color: #555; margin-bottom: 5px; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #aaa; }
              .tracking-number { 
                font-size: 18px; 
                font-weight: bold; 
                color: #1976D2; 
                background-color: #e3f2fd; 
                padding: 10px; 
                border-radius: 5px; 
                text-align: center;
                margin: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Orden de Tracking</h1>
                <p>Paquete Aprobado</p>
                <div class="tracking-number">${pkg.approved_tracking_number}</div>
                <div class="status-badge">APROBADO</div>
              </div>
              
              <div class="section">
                <h2>Información del Envío</h2>
                <div class="info-grid">
                  <div class="info-item"><strong>Descripción:</strong> ${pkg.description}</div>
                  <div class="info-item"><strong>Tipo de Carga:</strong> ${pkg.cargo_type || 'No especificado'}</div>
                  <div class="info-item"><strong>Peso:</strong> ${pkg.weight || 'No especificado'} kg</div>
                  <div class="info-item"><strong>Prioridad:</strong> ${pkg.priority}</div>
                  <div class="info-item"><strong>Tipo de Envío:</strong> ${pkg.shipping_type || 'Estándar'}</div>
                  <div class="info-item"><strong>Costo Estimado:</strong> Bs ${pkg.cost || 'No calculado'}</div>
                </div>
              </div>

              <div class="section">
                <h2>Origen y Destino</h2>
                <div class="info-grid">
                  <div class="info-item"><strong>Ciudad de Origen:</strong> ${pkg.origin_city}</div>
                  <div class="info-item"><strong>Ciudad de Destino:</strong> ${pkg.destination_city}</div>
                </div>
              </div>

              <div class="section">
                <h2>Remitente y Destinatario</h2>
                <div class="info-grid">
                  <div class="info-item"><strong>Remitente:</strong> ${pkg.sender_name}</div>
                  <div class="info-item"><strong>Destinatario:</strong> ${pkg.recipient_name}</div>
                  <div class="info-item"><strong>Email Remitente:</strong> ${pkg.sender_email || 'No especificado'}</div>
                  <div class="info-item"><strong>Email Destinatario:</strong> ${pkg.recipient_email || 'No especificado'}</div>
                </div>
              </div>

              <div class="footer">
                <p>Gracias por confiar en Boa Tracking. Su paquete ha sido aprobado y está en proceso.</p>
                <p>Fecha de generación: ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </body>
        </html>
      `;

      console.log('🔄 Generando PDF...');
      const { uri } = await Print.printToFileAsync({ html });
      console.log('✅ PDF generado en:', uri);
      
      console.log('📤 Compartiendo PDF...');
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      console.log('✅ PDF compartido exitosamente');
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      Alert.alert("Error", "No se pudo generar el PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPreregistrationOrder = async (pkg: any) => {
    console.log('🟠 Iniciando descarga de PDF de preregistro para:', pkg.preregistration_tracking_number);
    
    setIsGeneratingPdf(true);
    
    try {
      console.log('📄 Generando HTML para PDF de preregistro...');
      
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 15px; }
              .container { max-width: 100%; }
              .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 8px; margin-bottom: 15px; }
              .header h1 { color: #1976D2; margin: 0; font-size: 20px; }
              .header p { margin: 3px 0; font-size: 12px; color: #777; }
              .status-badge { 
                display: inline-block; 
                padding: 3px 10px; 
                border-radius: 15px; 
                font-size: 10px; 
                font-weight: bold; 
                margin-top: 3px;
                background-color: #FF9800;
                color: white;
              }
              .section { margin-bottom: 12px; border: 1px solid #ddd; border-radius: 6px; padding: 10px; }
              .section h2 { color: #1976D2; border-bottom: 1px solid #eee; padding-bottom: 3px; margin-top: 0; font-size: 14px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
              .info-item { background-color: #f9f9f9; padding: 6px; border-radius: 4px; font-size: 11px; }
              .info-item strong { display: block; color: #555; margin-bottom: 2px; font-size: 10px; }
              .footer { text-align: center; margin-top: 15px; font-size: 10px; color: #aaa; }
              .tracking-number { 
                font-size: 16px; 
                font-weight: bold; 
                color: #1976D2; 
                background-color: #e3f2fd; 
                padding: 8px; 
                border-radius: 4px; 
                text-align: center;
                margin: 8px 0;
              }
              .important-notice {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 10px;
                margin: 12px 0;
                text-align: center;
              }
              .important-notice h3 {
                color: #856404;
                margin: 0 0 6px 0;
                font-size: 13px;
              }
              .important-notice p {
                color: #856404;
                margin: 0;
                font-size: 11px;
              }
              .contact-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 4px;
              }
              .contact-item {
                background-color: #f9f9f9;
                padding: 4px 6px;
                border-radius: 3px;
                font-size: 10px;
              }
              .contact-item strong {
                display: inline;
                color: #555;
                font-size: 9px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Confirmación de Pre-Registro</h1>
                <p>Pre-Registro Pendiente de Aprobación</p>
                <div class="tracking-number">${pkg.preregistration_tracking_number}</div>
                <div class="status-badge">PENDIENTE</div>
              </div>
              
              <div class="important-notice">
                <h3>⚠️ IMPORTANTE</h3>
                <p>Debe acercarse a las oficinas de Boa Tracking con el paquete para confirmar y proceder con el envío.</p>
              </div>
              
              <div class="section">
                <h2>Información del Envío</h2>
                <div class="info-grid">
                  <div class="info-item"><strong>Descripción:</strong> ${pkg.description}</div>
                  <div class="info-item"><strong>Tipo de Carga:</strong> ${pkg.cargo_type || 'No especificado'}</div>
                  <div class="info-item"><strong>Peso:</strong> ${pkg.weight || 'No especificado'} kg</div>
                  <div class="info-item"><strong>Prioridad:</strong> ${pkg.priority}</div>
                  <div class="info-item"><strong>Tipo de Envío:</strong> ${pkg.shipping_type || 'Estándar'}</div>
                  <div class="info-item"><strong>Costo Estimado:</strong> Bs ${pkg.cost || 'No calculado'}</div>
                </div>
              </div>

              <div class="section">
                <h2>Origen y Destino</h2>
                <div class="info-grid">
                  <div class="info-item"><strong>Ciudad de Origen:</strong> ${pkg.origin_city}</div>
                  <div class="info-item"><strong>Ciudad de Destino:</strong> ${pkg.destination_city}</div>
                </div>
              </div>

              <div class="section">
                <h2>Remitente y Destinatario</h2>
                <div class="info-grid">
                  <div class="info-item"><strong>Remitente:</strong> ${pkg.sender_name}</div>
                  <div class="info-item"><strong>Destinatario:</strong> ${pkg.recipient_name}</div>
                  <div class="info-item"><strong>Email Remitente:</strong> ${pkg.sender_email || 'No especificado'}</div>
                  <div class="info-item"><strong>Email Destinatario:</strong> ${pkg.recipient_email || 'No especificado'}</div>
                </div>
              </div>

              <div class="section">
                <h2>Información de Contacto</h2>
                <div class="contact-grid">
                  <div class="contact-item"><strong>Tel. Remitente:</strong> ${pkg.sender_phone || 'No especificado'}</div>
                  <div class="contact-item"><strong>Tel. Destinatario:</strong> ${pkg.recipient_phone || 'No especificado'}</div>
                  <div class="contact-item"><strong>Dir. Remitente:</strong> ${pkg.sender_address || 'No especificado'}</div>
                  <div class="contact-item"><strong>Dir. Destinatario:</strong> ${pkg.recipient_address || 'No especificado'}</div>
                </div>
              </div>

              <div class="footer">
                <p>Gracias por confiar en Boa Tracking. Su pre-registro está siendo revisado.</p>
                <p><strong>Fecha de pre-registro:</strong> ${new Date(pkg.created_at).toLocaleDateString()} | <strong>Generado:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </body>
        </html>
      `;

      console.log('🔄 Generando PDF de preregistro...');
      const { uri } = await Print.printToFileAsync({ html });
      console.log('✅ PDF de preregistro generado en:', uri);
      
      console.log('📤 Compartiendo PDF de preregistro...');
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      console.log('✅ PDF de preregistro compartido exitosamente');
      
    } catch (error) {
      console.error('❌ Error generando PDF de preregistro:', error);
      Alert.alert("Error", "No se pudo generar el PDF de preregistro.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={BOA_COLORS.white} style={{ marginTop: 50 }} />;
    }

    if (packages.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inbox" size={64} color={BOA_COLORS.lightGray} />
          <Text style={styles.emptyText}>No tienes pre-registros.</Text>
          <Text style={styles.emptySubtitle}>Cuando crees un pre-registro, aparecerá aquí.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => navigation.navigate('PreRegistration', { currentUser })}>
            <Text style={styles.emptyButtonText}>Crear Pre-registro</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.packagesContainer}>
        {packages.map((pkg: any) => (
          <View key={pkg.id} style={styles.packageCard}>
            <TouchableOpacity onPress={() => handlePackagePress(pkg)}>
              <View style={styles.packageHeader}>
                <View style={styles.packageInfo}>
                  <View style={styles.trackingRow}>
                    <Text style={styles.packageNumber}>{pkg.preregistration_tracking_number}</Text>
                    <TouchableOpacity onPress={() => handleCopyToClipboard(pkg.preregistration_tracking_number)} style={styles.copyIconBtn}>
                      <MaterialIcons name="content-copy" size={18} color={BOA_COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.packageDescription}>{pkg.description}</Text>
                </View>
                <MaterialIcons name="assignment" size={32} color={BOA_COLORS.primary} />
              </View>

              <View style={styles.packageStatus}>
                <View style={styles.statusRow}>
                  <MaterialIcons name="info" size={16} color={BOA_COLORS.gray} />
                  <Text style={[styles.statusText, { 
                    color: pkg.status === 'Aprobado' ? BOA_COLORS.success : BOA_COLORS.warning 
                  }]}>
                    {pkg.status === 'Aprobado' ? 'Aprobado' : 'Pre-registrado'}
                  </Text>
                </View>

                <View style={styles.statusRow}>
                  <MaterialIcons name="person" size={16} color={BOA_COLORS.gray} />
                  <Text style={styles.locationText}>De: {pkg.sender_name}</Text>
                </View>

                <View style={styles.statusRow}>
                  <MaterialIcons name="person-pin" size={16} color={BOA_COLORS.gray} />
                  <Text style={styles.locationText}>Para: {pkg.recipient_name}</Text>
                </View>

                <View style={styles.statusRow}>
                  <MaterialIcons name="schedule" size={16} color={BOA_COLORS.gray} />
                  <Text style={styles.dateText}>{new Date(pkg.created_at).toLocaleDateString()}</Text>
                </View>

                {pkg.status === 'Aprobado' && pkg.approved_tracking_number && (
                  <View style={styles.statusRow}>
                    <MaterialIcons name="local-shipping" size={16} color={BOA_COLORS.gray} />
                    <Text style={[styles.locationText, { color: BOA_COLORS.success, fontWeight: 'bold' }]}>
                      Tracking Real: {pkg.approved_tracking_number}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            {pkg.status === 'Aprobado' && pkg.approved_tracking_number && (
              <View style={styles.approvedInfo}>
                <View style={styles.approvedHeader}>
                  <MaterialIcons name="check-circle" size={18} color={BOA_COLORS.info} style={styles.approvedIcon} />
                  <Text style={styles.approvedTextLabel}>Tracking Aprobado</Text>
                </View>
                <TouchableOpacity 
                  style={styles.copyContainer}
                  onPress={() => handleCopyToClipboard(pkg.approved_tracking_number || '')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.approvedTextValue}>{pkg.approved_tracking_number}</Text>
                  <MaterialIcons name="content-copy" size={16} color={BOA_COLORS.success} />
                </TouchableOpacity>
                {pkg.approved_at && (
                  <Text style={styles.approvedDate}>
                    {formatDateTime(pkg.approved_at)}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.actionRow}>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { marginRight: 8 }]}
                  onPress={() => handlePackagePress(pkg)}
                >
                  <MaterialIcons name="visibility" size={20} color={BOA_COLORS.white} />
                  <Text style={styles.actionButtonText}>Ver Detalles</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton, { marginRight: 0, opacity: deletingId === pkg.id ? 0.5 : 1 }]}
                  onPress={() => handleDelete(pkg)}
                  disabled={deletingId === pkg.id}
                >
                  <MaterialIcons name="delete" size={20} color={BOA_COLORS.white} />
                  <Text style={styles.actionButtonText}>Borrar</Text>
                </TouchableOpacity>
              </View>
              
              {pkg.status === 'Aprobado' && pkg.approved_tracking_number && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.downloadButton, { marginTop: 8, opacity: isGeneratingPdf ? 0.5 : 1 }]}
                  onPress={() => {
                    console.log('🟢 Botón de descarga presionado para:', pkg.approved_tracking_number);
                    handleDownloadTrackingOrder(pkg);
                  }}
                  disabled={isGeneratingPdf}
                >
                  <MaterialIcons name="file-download" size={20} color={BOA_COLORS.white} />
                  <Text style={styles.actionButtonText}>
                    {isGeneratingPdf ? 'Generando PDF...' : 'Descargar Orden de Tracking'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Botón para preregistros pendientes */}
              {pkg.status !== 'Aprobado' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.preregistrationButton, { marginTop: 8, opacity: isGeneratingPdf ? 0.5 : 1 }]}
                  onPress={() => {
                    console.log('🟠 Botón de preregistro presionado para:', pkg.preregistration_tracking_number);
                    handleDownloadPreregistrationOrder(pkg);
                  }}
                  disabled={isGeneratingPdf}
                >
                  <MaterialIcons name="file-download" size={20} color={BOA_COLORS.white} />
                  <Text style={styles.actionButtonText}>
                    {isGeneratingPdf ? 'Generando PDF...' : 'Descargar Orden de Pre-Registro'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BOA_COLORS.primary }]}>
      <ImageBackground
        source={require('../assets/fondo_mobile.png')}
        style={styles.container}
        resizeMode="cover"
      >
        {/* Loader global para carga y borrado */}
        <FullScreenLoader visible={isLoading || !!deletingId || isGeneratingPdf} message={deletingId ? 'Borrando...' : isGeneratingPdf ? 'Generando PDF...' : 'Cargando...'} />
        
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <View style={styles.headerCard}>
              <MaterialIcons name="assignment" size={32} color={BOA_COLORS.primary} />
              <Text style={styles.headerTitleCard}>Mis Pre-Registros</Text>
              {!isLoading && (
              <Text style={styles.headerSubtitle}>
                  {packages.length} pre-registros encontrados
              </Text>
              )}
            </View>
          </View>
          {renderContent()}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(25, 118, 210, 0.9)',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.white,
  },
    headerTitleCard: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginTop: 8,
  },
  headerRight: {
    width: 40,
  },
  content: { padding: 20, paddingBottom: 60 },
  headerSection: { marginBottom: 24 },
  headerCard: { 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    borderRadius: 12, 
    padding: 20, 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: BOA_COLORS.gray, 
    textAlign: 'center' 
  },
  packagesContainer: {
    gap: 20,
  },
  packageCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  packageHeader: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: BOA_COLORS.lightGray,
    paddingBottom: 12,
    marginBottom: 12,
  },
  packageInfo: {
    flex: 1,
  },
  trackingRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4,
  },
  packageNumber: { 
    fontSize: 16,
    fontWeight: 'bold', 
    color: BOA_COLORS.accent,
  },
  packageDescription: { 
    fontSize: 14,
    color: BOA_COLORS.gray,
    marginTop: 4,
  },
  packageStatus: {
    marginBottom: 12,
    gap: 8,
  },
  statusRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  statusText: { 
    fontSize: 14,
    fontWeight: 'bold', 
    marginLeft: 8,
  },
  locationText: { 
    fontSize: 14, 
    color: BOA_COLORS.dark, 
    marginLeft: 8,
    flex: 1,
  },
  dateText: { 
    fontSize: 14, 
    color: BOA_COLORS.dark,
    marginLeft: 8,
  },
  actionRow: { 
    borderTopWidth: 1,
    borderTopColor: BOA_COLORS.lightGray,
    paddingTop: 12,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: BOA_COLORS.danger,
  },
  downloadButton: {
    backgroundColor: BOA_COLORS.success,
  },
  preregistrationButton: {
    backgroundColor: '#FF9800',
  },
  actionButton: { 
    backgroundColor: BOA_COLORS.primary,
    borderRadius: 8,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 14,
    flex: 1,
  },
  actionButtonText: { 
    color: BOA_COLORS.white, 
    fontWeight: 'bold', 
    fontSize: 16,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BOA_COLORS.dark,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: BOA_COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
  },
    emptyButton: {
    backgroundColor: BOA_COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 24,
  },
  emptyButtonText: {
    color: BOA_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  copyIconBtn: {
    marginLeft: 6,
    padding: 4,
  },
  approvedInfo: {
    marginTop: 15,
    backgroundColor: 'rgba(45, 156, 219, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: -5, // Para compensar el padding de la tarjeta
  },
  approvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  approvedIcon: {
    marginRight: 6,
  },
  approvedTextLabel: {
    color: BOA_COLORS.info,
    fontSize: 13,
    fontWeight: '600',
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    marginBottom: 6,
  },
  approvedTextValue: {
    fontSize: 16,
    color: BOA_COLORS.primary, // Cambiado a azul para contraste en fondo blanco
    fontWeight: 'bold',
    marginRight: 8,
  },
  approvedDate: {
    fontSize: 12,
    color: BOA_COLORS.darkGray,
    fontStyle: 'italic',
    marginLeft: 24,
  },
}); 