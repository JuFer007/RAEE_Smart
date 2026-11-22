import React from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity, ScrollView, Keyboard, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ValoracionAppSection from './ValoracionAppSection';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA } from '../theme';

export default function CalificarAppModal({ visible, onClose }) {
  if (!visible) return null;

  function cerrar() {
    Keyboard.dismiss();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={cerrar}
    >
      <View style={styles.fondo}>
        <Pressable style={styles.overlay} onPress={() => Keyboard.dismiss()} />

        <View style={styles.contenedor}>
          <View style={styles.cabecera}>
            <View style={styles.titulos}>
              <Text style={styles.titulo}>Califica la app</Text>
              <Text style={styles.subtitulo}>Tu opinión nos ayuda a mejorar</Text>
            </View>
            <TouchableOpacity
              style={styles.cerrar}
              onPress={cerrar}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <Ionicons name="close" size={19} color={COLORS.inkSoft} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.cuerpo}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="never"
            onScrollBeginDrag={() => Keyboard.dismiss()}
          >
            <ValoracionAppSection mostrarTituloSeccion={false} mostrarEncabezado={false} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ESPACIOS.lg,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  contenedor: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '86%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIOS.xl,
    paddingTop: ESPACIOS.md,
    zIndex: 1,
    overflow: 'hidden',
    ...SOMBRAS.flotante,
  },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ESPACIOS.md,
    paddingHorizontal: ESPACIOS.xl,
    paddingBottom: ESPACIOS.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineNav,
  },
  titulos: { flex: 1 },
  titulo: { ...TIPOGRAFIA.h3, fontSize: 17, color: COLORS.inkField },
  subtitulo: { ...TIPOGRAFIA.small, fontSize: 12, marginTop: 2 },
  cerrar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuerpo: {
    paddingHorizontal: ESPACIOS.xl,
    paddingTop: ESPACIOS.md,
    paddingBottom: ESPACIOS.xl,
  },
});
