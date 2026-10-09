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

export default function CapturaFotoScreen({ route, navigation }) {
  const { usuario } = useAuth();
  const { ubicacion, cargando: cargandoUbicacion } = useLocation();
  const [analizando, setAnalizando] = useState(false);
  const [error, setError] = useState('');
  const identificarSolo = route.params?.modo === 'identificar';

  async function manejarFoto(uri) {
    if (!identificarSolo && !ubicacion && !USAR_DATOS_PRUEBA) {
      setError('Activa el GPS para registrar la entrega');
      return;
    }

    try {
      setError('');
      setAnalizando(true);

      if (identificarSolo) {
        const identificado = await entregaService.identificarAparato({ fotoUri: uri });
        navigation.replace('Resultado', { entrega: identificado, modo: 'identificar' });
        return;
      }

      const entrega = await entregaService.registrarEntrega({
        usuarioId: usuario.id,
        fotoUri: uri,
        latitud: ubicacion?.latitud,
        longitud: ubicacion?.longitud,
      });
      navigation.replace('Resultado', { entrega });
    } catch (_e) {
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
          subtitulo={
            identificarSolo
              ? 'Toma una foto y te decimos qué tipo de RAEE es'
              : 'Toma una foto clara del dispositivo'
          }
          onBack={() => navigation.goBack()}
          claro
        />
        {error ?           <Text style={[styles.error, { color: COLORS.danger }]}>{error}</Text> : null}
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
  error: { ...TIPOGRAFIA.micro, fontSize: 12, color: COLORS.danger, marginBottom: ESPACIOS.sm },
  cuerpo: { flex: 1, paddingBottom: ESPACIOS.lg },
  ubicacion: {
    ...TIPOGRAFIA.micro,
    fontSize: 11,
    color: COLORS.cameraMuted,
    textAlign: 'center',
    paddingBottom: ESPACIOS.md,
  },
});
