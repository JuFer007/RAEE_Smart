import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIOS, SOMBRAS, TIPOGRAFIA } from '../theme';

export default function ModalPermiso({
  visible,
  icono = 'lock-closed-outline',
  titulo,
  mensaje,
  textoBoton,
  onPermitir,
}) {
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
            <Ionicons name={icono} size={26} color={COLORS.white} />
          </View>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>
          <TouchableOpacity style={styles.boton} activeOpacity={0.85} onPress={onPermitir}>
            <Text style={styles.botonTexto}>{textoBoton}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(4,17,19,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  tarjeta: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.surface,
    borderRadius: RADIOS.lg,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
    ...SOMBRAS.flotante,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  titulo: { ...TIPOGRAFIA.h2, fontSize: 18, textAlign: 'center' },
  mensaje: { ...TIPOGRAFIA.small, fontSize: 13, lineHeight: 19, textAlign: 'center', color: COLORS.mut },
  boton: {
    width: '100%',
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: RADIOS.boton,
    paddingVertical: 13,
    alignItems: 'center',
  },
  botonTexto: { ...TIPOGRAFIA.button, color: COLORS.white },
});
