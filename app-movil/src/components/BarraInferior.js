import React from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ALTURAS, COLORS, ESPACIOS, TIPOGRAFIA } from '../theme';

const ICONOS = {
  Inicio: { on: 'home', off: 'home-outline' },
  Mapa: { on: 'map', off: 'map-outline' },
  Historial: { on: 'time', off: 'time-outline' },
  Perfil: { on: 'person', off: 'person-outline' },
};

const INACTIVO = '#8BA39B';

export default function BarraInferior({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const safe = Math.max(insets.bottom, 8);

  return (
    <View
      style={[
        estilos.barra,
        { height: ALTURAS.barra + (Platform.OS === 'ios' ? safe : 0), paddingBottom: Platform.OS === 'ios' ? safe : 5 },
      ]}
    >
      {state.routes.map((route, index) => {
        const activo = state.index === index;
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title || route.name;
        const iconos = ICONOS[route.name] || { on: 'ellipse', off: 'ellipse-outline' };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={activo ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!activo && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={estilos.item}
          >
            <View style={[estilos.icono, activo && estilos.iconoActivo]}>
              <Ionicons
                name={activo ? iconos.on : iconos.off}
                size={activo ? 16 : 21}
                color={activo ? COLORS.white : INACTIVO}
              />
            </View>
            <Text style={[activo ? estilos.labelActivo : estilos.label, { color: activo ? COLORS.primaryNav : INACTIVO }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: COLORS.lineNav,
    paddingTop: ESPACIOS.sm,
    paddingHorizontal: 12,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  icono: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconoActivo: { backgroundColor: COLORS.primaryNav },
  label: { ...TIPOGRAFIA.tab, fontSize: 10 },
  labelActivo: { ...TIPOGRAFIA.tabActiva, fontSize: 10 },
});
