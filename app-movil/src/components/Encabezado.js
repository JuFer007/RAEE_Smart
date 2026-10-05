import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Logo from './Logo';
import { ALTURAS, COLORS, ESPACIOS, FUENTES, TIPOGRAFIA } from '../theme';

export function BotonIcono({ nombre, onPress, punto = false, contador = 0, claro = false, size = 22 }) {
  const insignia = contador > 0 ? (contador > 9 ? '9+' : String(contador)) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={estilos.iconoBoton}
      activeOpacity={0.6}
      hitSlop={6}
    >
      <Ionicons name={nombre} size={size} color={claro ? COLORS.white : COLORS.inkSoft} />
      {insignia ? (
        <View style={[estilos.insignia, insignia.length > 1 && estilos.insigniaLarga]}>
          <Text style={estilos.insigniaTexto} allowFontScaling={false}>
            {insignia}
          </Text>
        </View>
      ) : punto ? (
        <View style={estilos.punto} />
      ) : null}
    </TouchableOpacity>
  );
}

/**
 * Cabecera de las pantallas.
 * - con `onBack`: flecha atrás + título alineado a la izquierda (+ subtítulo opcional)
 * - sin `onBack`: título a la izquierda
 * - sin título ni `onBack`: logo compacto
 */
export default function Encabezado({ titulo, subtitulo, onBack, derecha, claro = false }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[estilos.barra, { paddingTop: insets.top }]}>
      {onBack ? <BotonIcono nombre="chevron-back" size={26} onPress={onBack} claro={claro} /> : null}

      {titulo ? (
        <View style={[estilos.textos, !onBack && estilos.textosSinBack]}>
          <Text style={[estilos.titulo, claro && estilos.tituloClaro]} numberOfLines={1}>
            {titulo}
          </Text>
          {subtitulo ? (
            <Text style={[estilos.subtitulo, claro && estilos.subtituloClaro]} numberOfLines={2}>
              {subtitulo}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={estilos.textos}>{onBack ? null : <Logo compacto claro={claro} />}</View>
      )}

      {derecha || null}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    minHeight: ALTURAS.topbar,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: ESPACIOS.lg,
  },
  textos: { flex: 1 },
  textosSinBack: { paddingLeft: 2 },
  titulo: { ...TIPOGRAFIA.topbar, fontSize: 17 },
  tituloClaro: { color: COLORS.white },
  subtitulo: { ...TIPOGRAFIA.small, marginTop: 2 },
  subtituloClaro: { color: COLORS.cameraMuted },
  iconoBoton: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  insignia: {
    position: 'absolute',
    top: 3,
    right: 2,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: COLORS.notif,
    borderWidth: 2,
    borderColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insigniaLarga: { paddingHorizontal: 5 },
  insigniaTexto: { fontFamily: FUENTES.dmBold, fontSize: 9, lineHeight: 12, color: COLORS.white },
  punto: {
    position: 'absolute',
    top: 8,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.notif,
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
});
