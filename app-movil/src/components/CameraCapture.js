import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ModalPermiso from './ModalPermiso';
import { COLORS, RADIOS, TIPOGRAFIA } from '../theme';

const INTERIOR = 72;

export default function CameraCapture({ onCaptura, analizando = false, tip, etiqueta = null }) {
  const [listo, setListo] = useState(true);
  const [camaraLista, setCamaraLista] = useState(false);
  const [errorCamara, setErrorCamara] = useState('');
  const camara = useRef(null);
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [analizandoPrev, setAnalizandoPrev] = useState(analizando);
  const esWeb = Platform.OS === 'web';
  const mostrarPermiso = !esWeb && permiso != null && !permiso.granted;
  const esperandoCamara = !esWeb && permiso?.granted && !camaraLista;
  const disparadorDeshabilitado = !listo || analizando || esperandoCamara;

  if (analizando !== analizandoPrev) {
    setAnalizandoPrev(analizando);
    if (!analizando) setListo(true);
  }

  async function pedir() {
    await pedirPermiso();
  }

  function seleccionarFotoWeb() {
    if (typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    const limpiar = () => input.remove();
    input.addEventListener('change', () => {
      const archivo = input.files?.[0];
      if (!archivo) {
        limpiar();
        return;
      }
      const lector = new FileReader();
      lector.onload = () => {
        limpiar();
        if (typeof lector.result === 'string') {
          setListo(false);
          onCaptura(lector.result);
        }
      };
      lector.onerror = limpiar;
      lector.readAsDataURL(archivo);
    });
    input.addEventListener('cancel', limpiar);

    document.body.appendChild(input);
    input.click();
  }

  async function disparar() {
    if (disparadorDeshabilitado) return;

    setErrorCamara('');

    if (esWeb) {
      seleccionarFotoWeb();
      return;
    }

    if (!permiso?.granted) {
      const respuesta = await pedirPermiso();
      if (!respuesta.granted) return;
    }

    if (!camaraLista) return;

    try {
      const foto = await camara.current?.takePictureAsync({ quality: 0.7 });
      if (foto?.uri) {
        setListo(false);
        onCaptura(foto.uri);
      }
    } catch (_e) {
      setErrorCamara('No se pudo tomar la foto. Intenta nuevamente.');
    }
  }

  return (
    <View style={estilos.contenedor}>
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
                Vista de cámara no disponible en el navegador. Pulsa el disparador para seleccionar una foto.
              </Text>
            ) : null}
          </LinearGradient>
        ) : (
          <CameraView
            ref={camara}
            style={StyleSheet.absoluteFill}
            facing="back"
            onCameraReady={() => {
              setErrorCamara('');
              setCamaraLista(true);
            }}
            onMountError={() => setErrorCamara('No se pudo iniciar la cámara. Revisa los permisos e inténtalo de nuevo.')}
          />
        )}

        <View style={[estilos.esquina, estilos.tl]} />
        <View style={[estilos.esquina, estilos.tr]} />
        <View style={[estilos.esquina, estilos.bl]} />
        <View style={[estilos.esquina, estilos.br]} />

        <View style={estilos.controles}>
          <View style={estilos.botonGaleria}>
            <Ionicons name="images-outline" size={20} color={COLORS.white} />
          </View>
          <TouchableOpacity
            onPress={disparar}
            activeOpacity={0.85}
            disabled={disparadorDeshabilitado}
            style={[estilos.disparador, disparadorDeshabilitado && { opacity: 0.5 }]}
          >
            <View style={estilos.disparadorInterno} />
          </TouchableOpacity>
          <View style={estilos.botonGaleria} />
        </View>
        {errorCamara ? <Text style={estilos.errorCamara}>{errorCamara}</Text> : null}
        {esperandoCamara ? (
          <Text style={estilos.etiqueta}>Preparando cámara...</Text>
        ) : etiqueta ? (
          <Text style={estilos.etiqueta}>{etiqueta}</Text>
        ) : null}
      </View>

      {tip ? <Text style={estilos.tip}>{tip}</Text> : null}

      <ModalPermiso
        visible={mostrarPermiso}
        icono="camera-outline"
        titulo="Permiso de cámara"
        mensaje="Necesitamos acceso a tu cámara para tomarle una foto al aparato e identificar qué tipo de RAEE es."
        textoBoton="Permitir cámara"
        onPermitir={pedir}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1 },
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
    width: 34,
    height: 34,
    borderColor: COLORS.cameraCorner,
  },
  tl: { top: 48, left: 34, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: 48, right: 34, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: 150, left: 34, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: 150, right: 34, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  controles: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  botonGaleria: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(9,43,43,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disparador: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
    paddingTop: 10,
    lineHeight: 16,
  },
  errorCamara: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADIOS.sm,
    paddingVertical: 7,
    paddingHorizontal: 10,
    ...TIPOGRAFIA.micro,
    fontSize: 11,
    color: COLORS.danger,
    textAlign: 'center',
  },
  etiqueta: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    ...TIPOGRAFIA.micro,
    fontSize: 11,
    color: COLORS.cameraMuted,
    textAlign: 'center',
  },
});