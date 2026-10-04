import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA } from '../theme';

export default function LoadingOverlay({ mensaje = 'Procesando...' }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.tarjeta}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.mensaje}>{mensaje}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(232, 240, 237, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  tarjeta: {
    alignItems: 'center',
    gap: ESPACIOS.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIOS.lg,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    paddingVertical: ESPACIOS.xxl,
    paddingHorizontal: ESPACIOS.xxl,
    ...SOMBRAS.flotante,
  },
  mensaje: { ...TIPOGRAFIA.body, fontWeight: '600' },
});