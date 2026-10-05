import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CameraCapture from '../components/CameraCapture';
import LoadingOverlay from '../components/LoadingOverlay';
import Encabezado from '../components/Encabezado';
import useLocation from '../hooks/useLocation';
import { useAuth } from '../context/AuthContext';
import * as entregaService from '../services/entregaService';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';
import { COLORS, ESPACIOS, TIPOGRAFIA } from '../theme';

export default function CapturaFotoScreen({ navigation }) {
  const { usuario } = useAuth();
  const { ubicacion, cargando: cargandoUbicacion } = useLocation();
  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState('');

  async function manejarFoto(uri) {
    if (!ubicacion && !USAR_DATOS_PRUEBA) {
      setError('Activa el GPS para registrar la entrega');
      return;
    }

    try {
      setError('');
      setAnalizando(true);
      const entrega = await entregaService.registrarEntrega({
        usuarioId: usuario.id,
        fotoUri: uri,
        latitud: ubicacion?.latitud,
        longitud: ubicacion?.longitud,
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
      <View style={styles.encabezado}>
        <Encabezado
          titulo="Identifica tu aparato"
          subtitulo="Toma una foto clara del dispositivo"
          onBack={() => navigation.goBack()}
          claro
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.cuerpo}>
        <CameraCapture onCaptura={manejarFoto} analizando={analizando} />
      </View>

      {cargandoUbicacion && !analizando ? (
        <Text style={styles.ubicacion}>Obteniendo tu ubicación...</Text>
      ) : null}

      {analizando ? <LoadingOverlay mensaje="Analizando con IA..." /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.cameraBg, paddingHorizontal: ESPACIOS.md },
  encabezado: { paddingBottom: 0 },
  error: { ...TIPOGRAFIA.micro, fontSize: 12, color: '#FFC9C2', marginBottom: ESPACIOS.sm },
  cuerpo: { flex: 1, paddingBottom: ESPACIOS.lg },
  ubicacion: {
    ...TIPOGRAFIA.micro,
    fontSize: 11,
    color: COLORS.cameraMuted,
    textAlign: 'center',
    paddingBottom: ESPACIOS.md,
  },
});
