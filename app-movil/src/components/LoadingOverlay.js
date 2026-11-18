import React from 'react';
import { View, Text, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA } from '../theme';

export default function LoadingOverlay({ visible = false, mensaje = 'Procesando...' }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.fondo}>
        <View style={styles.tarjeta}>
          <View style={styles.badge}>
            <Ionicons name="sparkles-outline" size={26} color={COLORS.white} />
          </View>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.titulo}>{mensaje}</Text>
          <Text style={styles.detalle}>Clasificando tu foto. No cierres la pantalla.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ESPACIOS.page,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: ESPACIOS.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIOS.xl,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    paddingVertical: ESPACIOS.xxl,
    paddingHorizontal: ESPACIOS.xl,
    ...SOMBRAS.flotante,
  },
  badge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ESPACIOS.xs,
  },
  titulo: { ...TIPOGRAFIA.h3, textAlign: 'center' },
  detalle: { ...TIPOGRAFIA.small, textAlign: 'center', lineHeight: 18 },
});