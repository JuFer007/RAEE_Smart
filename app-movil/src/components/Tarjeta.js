import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

export function Tarjeta({ children, style, plano = false }) {
  return <View style={[estilos.tarjeta, plano && estilos.plana, style]}>{children}</View>;
}

export function Chip({ texto, activo = false, onPress, icono }) {
  const Contenedor = onPress ? TouchableOpacity : View;
  return (
    <Contenedor
      onPress={onPress}
      activeOpacity={0.7}
      style={[estilos.chip, activo && estilos.chipActivo]}
    >
      <Text style={[estilos.chipTexto, activo && estilos.chipTextoActivo]}>{texto}</Text>
    </Contenedor>
  );
}

export function Etiqueta({ texto, color = COLORS.primaryText, fondo = COLORS.primarySoft }) {
  return (
    <View style={[estilos.etiqueta, { backgroundColor: fondo }]}>
      <Text style={[estilos.etiquetaTexto, { color }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: ESPACIOS.md,
  },
  plana: { borderColor: COLORS.lineCard },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: RADIOS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineTab,
  },
  chipActivo: { backgroundColor: '#0C9153', borderColor: '#0C9153' },
  chipTexto: { ...TIPOGRAFIA.micro, fontSize: 12, color: '#7D968D' },
  chipTextoActivo: { color: COLORS.white, fontFamily: 'DMSans_600SemiBold' },
  etiqueta: {
    alignSelf: 'flex-start',
    borderRadius: RADIOS.sm,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  etiquetaTexto: { ...TIPOGRAFIA.micro, fontSize: 10, fontWeight: '600' },
});