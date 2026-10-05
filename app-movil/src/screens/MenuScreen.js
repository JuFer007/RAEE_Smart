import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import useEntradaAnimada from '../hooks/useEntradaAnimada';
import useSalidaAnimada from '../hooks/useSalidaAnimada';
import { SECCIONES_MENU } from '../utils/menu';
import { APP } from '../utils/contenido';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

export default function MenuScreen({ navigation }) {
  const [entrada, salir] = useEntradaAnimada({ eje: 'x', distancia: -34 });
  useSalidaAnimada(navigation, salir);

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Menú" onBack={() => navigation.goBack()} />

        <Animated.View style={entrada}>
        {SECCIONES_MENU.map((seccion) => (
          <View key={seccion.titulo}>
            <Text style={styles.seccion}>{seccion.titulo}</Text>

            <View style={styles.lista}>
              {seccion.opciones.map((opcion, i) => (
                <TouchableOpacity
                  key={opcion.titulo}
                  style={[styles.fila, i === seccion.opciones.length - 1 && styles.filaUltima]}
                  activeOpacity={0.7}
                  onPress={() => (opcion.pantalla ? navigation.navigate(opcion.pantalla) : null)}
                >
                  <View style={styles.filaIcono}>
                    <Ionicons name={opcion.icono} size={17} color={COLORS.primaryText} />
                  </View>
                  <Text style={styles.filaTitulo}>{opcion.titulo}</Text>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.mutSoft} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
        <Text style={styles.version}>{APP.nombre} · versión {APP.version}</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },

  cabecera: {
    alignItems: 'center',
    marginBottom: ESPACIOS.xl,
  },
  logo: { width: 150, height: 55 },
  version: { ...TIPOGRAFIA.micro, fontSize: 11, marginTop: ESPACIOS.md },

  seccion: { ...TIPOGRAFIA.label, color: COLORS.primaryText, marginBottom: ESPACIOS.sm, marginLeft: 2 },

  lista: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    paddingHorizontal: 13,
    marginBottom: ESPACIOS.xl,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineInner,
  },
  filaUltima: { borderBottomWidth: 0 },
  filaIcono: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaTitulo: { flex: 1, ...TIPOGRAFIA.small, fontSize: 13.5, color: COLORS.inkItem },
});