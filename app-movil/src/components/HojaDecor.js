import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

/** Hojas decorativas de la esquina inferior derecha (auth, resultado, etc.). */
export default function HojaDecor({ style }) {
  return (
    <View style={[estilos.caja, { pointerEvents: 'none' }, style]}>
      <Ionicons name="leaf" size={88} color={COLORS.leafMid} style={estilos.grande} />
      <Ionicons name="leaf" size={52} color={COLORS.limePale} style={estilos.chica} />
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { position: 'absolute', right: -6, bottom: -10, width: 120, height: 110, opacity: 0.55 },
  grande: { position: 'absolute', right: -8, bottom: -14, transform: [{ rotate: '-18deg' }] },
  chica: { position: 'absolute', right: 52, bottom: 8, transform: [{ rotate: '24deg' }] },
});
