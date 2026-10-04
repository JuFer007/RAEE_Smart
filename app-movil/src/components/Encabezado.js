import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from './Logo';
import { ALTURAS, COLORS, ESPACIOS, TIPOGRAFIA } from '../theme';

export function BotonIcono({ nombre, onPress, punto = false, claro = false, size = 20 }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={estilos.iconoBoton}
      activeOpacity={0.6}
      hitSlop={6}
    >
      <Ionicons name={nombre} size={size} color={claro ? COLORS.white : '#123D39'} />
      {punto ? <View style={estilos.punto} /> : null}
    </TouchableOpacity>
  );
}

export default function Encabezado({ titulo, onBack, derecha, claro = false }) {
  return (
    <View style={estilos.barra}>
      {onBack ? (
        <BotonIcono nombre="arrow-back" onPress={onBack} claro={claro} />
      ) : (
        <Logo compacto claro={claro} />
      )}

      {titulo ? (
        <Text style={[estilos.titulo, claro && estilos.tituloClaro]} numberOfLines={1}>
          {titulo}
        </Text>
      ) : null}

      {derecha || <View style={estilos.espaciador} />}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    height: ALTURAS.topbar,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: ESPACIOS.xl,
  },
  titulo: { ...TIPOGRAFIA.topbar, flex: 1, textAlign: 'center' },
  tituloClaro: { color: COLORS.white },
  iconoBoton: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  punto: {
    position: 'absolute',
    top: 8,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.notif,
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  espaciador: { width: 39 },
});