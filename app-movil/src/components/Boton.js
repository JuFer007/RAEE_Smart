import React from 'react';
import { Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

export default function Boton({
  titulo,
  onPress,
  variante = 'primario',
  icono,
  iconoDerecha,
  deshabilitado = false,
  disabled,
  cargando = false,
  ancho = true,
  style,
}) {
  const espera = deshabilitado || disabled;
  const color = colorTexto(variante);

  const contenido = cargando ? (
    <ActivityIndicator size="small" color={color} />
  ) : (
    <>
      {icono ? <Ionicons name={icono} size={17} color={color} /> : null}
      <Text style={[estilos.texto, { color }]}>{titulo}</Text>
      {iconoDerecha ? <Ionicons name={iconoDerecha} size={17} color={color} /> : null}
    </>
  );

  if (variante === 'enlace') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={espera || cargando}
        style={[estilos.enlace, style]}
        activeOpacity={0.7}
      >
        {contenido}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={espera || cargando}
      activeOpacity={0.85}
      style={[
        estilos.base,
        ancho && estilos.ancho,
        variante === 'secundario' && estilos.secundario,
        variante === 'fantasma' && estilos.fantasma,
        (espera || cargando) && estilos.deshabilitado,
        style,
      ]}
    >
      {contenido}
    </TouchableOpacity>
  );
}

function colorTexto(variante) {
  if (variante === 'secundario') return COLORS.secondary;
  if (variante === 'fantasma') return COLORS.primaryText;
  if (variante === 'enlace') return COLORS.primaryText;
  return COLORS.white;
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: RADIOS.boton,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: ESPACIOS.lg,
  },
  ancho: { width: '100%' },
  secundario: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.secondaryBorder,
  },
  fantasma: { backgroundColor: 'transparent', minHeight: 40 },
  deshabilitado: { opacity: 0.5 },
  texto: { ...TIPOGRAFIA.button },
  enlace: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingVertical: ESPACIOS.sm },
});