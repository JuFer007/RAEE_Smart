import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIOS, TIPOGRAFIA } from '../theme';

export default function CategoriaCard({ nombre, categoria, icono, seleccionado, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[estilos.tarjeta, seleccionado && estilos.tarjetaActiva]}
    >
      <View style={[estilos.icono, seleccionado && estilos.iconoActivo]}>
        <Ionicons name={icono} size={19} color={seleccionado ? COLORS.white : COLORS.primary} />
      </View>
      <View style={estilos.textos}>
        <Text style={estilos.nombre}>{nombre}</Text>
        {categoria ? <Text style={estilos.categoria}>{categoria}</Text> : null}
      </View>
      <Ionicons
        name={seleccionado ? 'checkmark-circle' : 'ellipse-outline'}
        size={19}
        color={seleccionado ? COLORS.primary : COLORS.lineTab}
      />
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: COLORS.surface,
    borderRadius: RADIOS.md,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    padding: 10,
  },
  tarjetaActiva: { borderColor: '#4EAF79', backgroundColor: COLORS.primaryPale },
  icono: {
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoActivo: { backgroundColor: COLORS.primary },
  textos: { flex: 1 },
  nombre: { ...TIPOGRAFIA.small, fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: COLORS.inkItem },
  categoria: { ...TIPOGRAFIA.micro, fontSize: 9, marginTop: 3 },
});