import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CameraCapture from '../components/CameraCapture';
import LoadingOverlay from '../components/LoadingOverlay';
import Encabezado, { BotonIcono } from '../components/Encabezado';
import useLocation from '../hooks/useLocation';
import { useAuth } from '../context/AuthContext';
import * as entregaService from '../services/entregaService';
import { esDemo } from '../utils/demo';
import { ENTREGA_DEMO } from '../utils/mockData';
import { COLORS, ESPACIOS, TIPOGRAFIA } from '../theme';

export default function CapturaFotoScreen({ navigation, route }) {
  const { usuario } = useAuth();
  const insets = useSafeAreaInsets();
  const modoDemo = route.params?.esDemo || esDemo();
  const { ubicacion, cargando: cargandoUbicacion } = useLocation(!modoDemo);
  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState('');

  async function manejarFoto(uri) {
    if (modoDemo) {
      navigation.replace('Resultado', { entrega: ENTREGA_DEMO, esDemo: true });
      return;
    }

    if (!ubicacion) {
      setError('Activa el GPS para registrar la entrega');
      return;
    }

    try {
      setError('');
      setAnalizando(true);
      const entrega = await entregaService.registrarEntrega({
        usuarioId: usuario.id,
        fotoUri: uri,
        latitud: ubicacion.latitud,
        longitud: ubicacion.longitud,
      });
      navigation.replace('Resultado', { entrega });
    } catch (e) {
      setError('No se pudo identificar el aparato. Intenta nuevamente.');
    } finally {
      setAnalizando(false);
    }
  }

  return (
    <View style={styles.fondo}>
      <View style={[styles.encabezado, { paddingTop: insets.top + ESPACIOS.sm }]}>
        <Encabezado
          titulo="Identifica tu aparato"
          claro
          derecha={<BotonIcono nombre="help-circle-outline" size={19} claro />}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.cuerpo}>
        <CameraCapture
          onCaptura={manejarFoto}
          analizando={analizando}
          hint="Toma una foto clara del dispositivo"
          tip="Asegúrate de que el aparato esté centrado y bien iluminado."
        />
      </View>

      {cargandoUbicacion && !analizando ? (
        <Text style={styles.ubicacion}>Obteniendo tu ubicación...</Text>
      ) : null}

      {analizando ? <LoadingOverlay mensaje="Analizando con IA..." /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.cameraBg, paddingHorizontal: ESPACIOS.page },
  encabezado: { paddingBottom: 0 },
  error: { ...TIPOGRAFIA.micro, fontSize: 11, color: '#FFC9C2', marginBottom: ESPACIOS.sm },
  cuerpo: { flex: 1, paddingBottom: ESPACIOS.lg },
  ubicacion: {
    ...TIPOGRAFIA.micro,
    fontSize: 11,
    color: COLORS.cameraMuted,
    textAlign: 'center',
    paddingBottom: ESPACIOS.md,
  },
});