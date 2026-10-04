import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TIPOGRAFIA } from '../theme';

const INTERIOR = 72;

export default function CameraCapture({ onCaptura, analizando = false, hint, tip }) {
  const [listo, setListo] = useState(true);
  const camara = useRef(null);
  const [permiso, pedirPermiso] = useCameraPermissions();
  const esWeb = Platform.OS === 'web';

  useEffect(() => {
    if (!analizando) setListo(true);
  }, [analizando]);

  async function disparar() {
    if (!listo || analizando) return;

    if (esWeb) {
      setListo(false);
      onCaptura(null);
      return;
    }

    if (!permiso?.granted) {
      const respuesta = await pedirPermiso();
      if (!respuesta.granted) return;
    }

    const foto = await camara.current?.takePictureAsync({ quality: 0.7 });
    if (foto?.uri) {
      setListo(false);
      onCaptura(foto.uri);
    }
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.hint}>{hint}</Text>

      <View style={estilos.marco}>
        {esWeb || !permiso?.granted ? (
          <LinearGradient
            colors={['#9F7751', '#D9B182', '#A8774A']}
            locations={[0, 0.55, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={estilos.fondoSimulado}
          >
            <LinearGradient
              colors={['#334C5C', '#15232A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={estilos.objeto}
            >
              <Ionicons name="phone-portrait-outline" size={INTERIOR} color="#94A9B3" />
            </LinearGradient>
            {esWeb ? (
              <Text style={estilos.simuladoTexto}>
                Vista de cámara no disponible en el navegador. Pulsa el disparador para simular la captura.
              </Text>
            ) : null}
          </LinearGradient>
        ) : (
          <CameraView ref={camara} style={StyleSheet.absoluteFill} facing="back" />
        )}

        <View style={[estilos.esquina, estilos.tl]} />
        <View style={[estilos.esquina, estilos.tr]} />
        <View style={[estilos.esquina, estilos.bl]} />
        <View style={[estilos.esquina, estilos.br]} />
      </View>

      <View style={estilos.controles}>
        <View style={estilos.botonGaleria} />
        <TouchableOpacity
          onPress={disparar}
          activeOpacity={0.85}
          disabled={!listo || analizando}
          style={[estilos.disparador, (analizando || !listo) && { opacity: 0.5 }]}
        >
          <View style={estilos.disparadorInterno} />
        </TouchableOpacity>
        <View style={estilos.botonGaleria} />
      </View>

      <Text style={estilos.tip}>{tip}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1 },
  hint: {
    ...TIPOGRAFIA.small,
    color: COLORS.cameraMuted,
    textAlign: 'center',
    marginVertical: 13,
  },
  marco: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: COLORS.cameraFrame,
  },
  fondoSimulado: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.cameraFrame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  objeto: {
    width: 125,
    height: 239,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-13deg' }],
  },
  simuladoTexto: {
    ...TIPOGRAFIA.micro,
    color: '#F3E7D8',
    textAlign: 'center',
    lineHeight: 16,
  },
  esquina: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.cameraCorner,
  },
  tl: { top: 28, left: 25, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: 28, right: 25, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: 28, left: 25, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: 28, right: 25, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 23,
    paddingBottom: 13,
  },
  botonGaleria: { width: 31, height: 31, borderRadius: 7, backgroundColor: COLORS.cameraGallery },
  disparador: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disparadorInterno: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.white },
  tip: {
    ...TIPOGRAFIA.micro,
    color: COLORS.cameraTip,
    textAlign: 'center',
    paddingHorizontal: 22,
    lineHeight: 16,
  },
});