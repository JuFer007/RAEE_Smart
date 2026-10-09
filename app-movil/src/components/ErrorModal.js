import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Boton from './Boton';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA } from '../theme';

export default function ErrorModal({
  visible = false,
  titulo = 'Error',
  mensaje = '',
  botonTexto = 'Entendido',
  onCerrar,
  icono = 'alert-circle-outline',
  tipo = 'error',
}) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCerrar}
    >
      <View style={styles.fondo}>
        <Pressable style={styles.overlay} onPress={onCerrar} />
        <View style={styles.centro}>
          <View style={styles.tarjeta}>
            <View style={[styles.badge, tipo === 'warning' && styles.badgeWarning]}>
              <Ionicons
                name={icono}
                size={22}
                color={tipo === 'warning' ? COLORS.warning : COLORS.danger}
              />
            </View>
            <Text style={styles.titulo}>{titulo}</Text>
            {mensaje ? <Text style={styles.subtitulo}>{mensaje}</Text> : null}
            <View style={styles.botones}>
              <Boton titulo={botonTexto} onPress={onCerrar} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  centro: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: ESPACIOS.page,
    zIndex: 1,
  },
  tarjeta: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIOS.xl,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    ...SOMBRAS.flotante,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: COLORS.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWarning: { backgroundColor: COLORS.warningSoft },
  titulo: {
    ...TIPOGRAFIA.h3,
    fontSize: 17,
    color: COLORS.inkField,
    textAlign: 'center',
  },
  subtitulo: {
    ...TIPOGRAFIA.micro,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.mut,
    textAlign: 'center',
    marginTop: -2,
  },
  botones: {
    width: '100%',
    gap: 8,
    marginTop: 6,
  },
});
