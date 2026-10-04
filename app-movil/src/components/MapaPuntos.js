import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Svg, { Rect, Path, G, Circle } from 'react-native-svg';
import { COLORS, RADIOS } from '../theme';
import { proyectar } from '../utils/geo';

const ANCHO = 300;
const ALTO = 300;
const esWeb = Platform.OS === 'web';

export default function MapaPuntos({
  puntos = [],
  ubicacion,
  seleccionado,
  onSelect,
  alto = 142,
  radio = 0,
}) {
  const { pines, usuario } = useMemo(() => {
    const items = ubicacion ? [...puntos, { id: '__yo', ...ubicacion }] : puntos;
    const proyectados = proyectar(items, ANCHO, ALTO);
    return {
      pines: proyectados.filter((p) => p.id !== '__yo'),
      usuario: proyectados.find((p) => p.id === '__yo'),
    };
  }, [puntos, ubicacion]);

  return (
    <View style={[styles.marco, { height: alto, borderRadius: radio }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Rect width={ANCHO} height={ALTO} fill={COLORS.mapBg} />

        <G stroke={COLORS.mapRoad} strokeWidth={5} fill="none">
          <Path d="M-20 96L320 236" />
          <Path d="M40 -20L280 320" />
        </G>
        <G stroke={COLORS.mapRoad2} strokeWidth={7} fill="none">
          <Path d="M-20 178L320 66" />
          <Path d="M186 -20L150 320" />
        </G>
        <G stroke={COLORS.mapRoadLine} strokeWidth={3} fill="none">
          <Path d="M-20 136L320 276" />
          <Path d="M-20 226L320 118" />
          <Path d="M-20 46L320 186" />
          <Path d="M242 -20L206 320" />
          <Path d="M84 -20L48 320" />
        </G>
        <G fill={COLORS.mapRoad2} fillOpacity={0.35}>
          <Rect x={18} y={26} width={58} height={42} rx={6} />
          <Rect x={206} y={196} width={72} height={44} rx={6} />
          <Rect x={30} y={214} width={52} height={38} rx={6} />
        </G>

        {pines.map((p) => {
          const activo =
            seleccionado != null &&
            String(seleccionado.id ?? seleccionado) === String(p.id);
          return (
            <G
              key={p.id}
              transform={`translate(${p.x}, ${p.y})`}
              onPress={esWeb ? undefined : () => onSelect?.(p)}
            >
              <Path
                d="M0 0C-7-8-10-13-10-18a10 10 0 1 1 20 0C10-13 7-8 0 0z"
                fill={activo ? COLORS.primaryDeep : COLORS.mapPin}
                stroke={COLORS.white}
                strokeWidth={1.6}
                transform={activo ? 'scale(1.3)' : undefined}
              />
              <Circle cx={0} cy={-18} r={3.4} fill={COLORS.white} />
            </G>
          );
        })}

        {usuario ? (
          <G>
            <Circle cx={usuario.x} cy={usuario.y} r={13} fill={COLORS.info} fillOpacity={0.18} />
            <Circle cx={usuario.x} cy={usuario.y} r={6} fill={COLORS.info} stroke={COLORS.white} strokeWidth={2} />
          </G>
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  marco: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: COLORS.mapBg,
    borderRadius: RADIOS.md,
  },
});