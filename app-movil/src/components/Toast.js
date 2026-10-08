import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

const DURACION_AUTOCERRAR = 3000;

export default function Toast({
  visible = false,
  mensaje = '',
  tipo = 'error',
  duracion = DURACION_AUTOCERRAR,
  onCerrar,
  posicion = 'top',
  accionTexto,
  onAccion,
}) {
  const [internoVisible, setInternoVisible] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(posicion === 'top' ? -20 : 20)).current;
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setInternoVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (duracion > 0 && !accionTexto) {
          timeoutRef.current = setTimeout(() => {
            cerrar();
          }, duracion);
        }
      });
    } else if (internoVisible) {
      cerrar();
    }
  }, [visible]);

  function cerrar() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: posicion === 'top' ? -12 : 12,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setInternoVisible(false);
      onCerrar?.();
    });
  }

  if (!internoVisible) return null;

  const config = getConfig(tipo);

  return (
    <View style={[styles.contenedor, posicion === 'top' ? styles.top : styles.bottom]} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: config.bg, borderColor: config.borde },
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          },
        ]}
      >
        <Ionicons name={config.icono} size={16} color={config.color} />
        <Text style={[styles.texto, { color: config.color }]} numberOfLines={3}>
          {mensaje}
        </Text>
        {accionTexto ? (
          <TouchableOpacity activeOpacity={0.8} onPress={onAccion} style={styles.accion}>
            <Text style={[styles.accionTexto, { color: config.color }]}>{accionTexto}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity activeOpacity={0.8} onPress={cerrar} style={styles.cerrar}>
            <Ionicons name="close" size={16} color={config.color} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

function getConfig(tipo) {
  switch (tipo) {
    case 'success':
      return {
        icono: 'checkmark-circle-outline',
        color: COLORS.primaryText,
        bg: COLORS.primaryPale,
        borde: COLORS.primaryRing,
      };
    case 'warning':
      return {
        icono: 'warning-outline',
        color: COLORS.warning,
        bg: COLORS.warningSoft,
        borde: 'rgba(154,98,0,0.15)',
      };
    case 'info':
      return {
        icono: 'information-circle-outline',
        color: COLORS.info,
        bg: 'rgba(35,125,219,0.08)',
        borde: 'rgba(35,125,219,0.15)',
      };
    case 'error':
    default:
      return {
        icono: 'alert-circle-outline',
        color: COLORS.danger,
        bg: COLORS.dangerSoft,
        borde: 'rgba(179,38,30,0.15)',
      };
  }
}

const styles = StyleSheet.create({
  contenedor: {
    position: 'absolute',
    left: ESPACIOS.page,
    right: ESPACIOS.page,
    zIndex: 9999,
  },
  top: {
    top: 60,
  },
  bottom: {
    bottom: 30,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: RADIOS.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    ...SOMBRAS.flotante,
  },
  texto: {
    ...TIPOGRAFIA.micro,
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  cerrar: {
    padding: 2,
  },
  accion: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  accionTexto: {
    ...TIPOGRAFIA.micro,
    fontSize: 11.5,
    fontFamily: FUENTES.dmBold,
  },
});
