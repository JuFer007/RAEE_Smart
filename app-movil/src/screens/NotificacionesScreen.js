import React from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import useEntradaAnimada from '../hooks/useEntradaAnimada';
import useSalidaAnimada from '../hooks/useSalidaAnimada';
import { AVISOS, avisosNuevos } from '../utils/contenido';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

export default function NotificacionesScreen({ navigation }) {
  const nuevos = avisosNuevos();
  const [entrada, salir] = useEntradaAnimada({ eje: 'y', distancia: -22 });
  useSalidaAnimada(navigation, salir);

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Notificaciones" onBack={() => navigation.goBack()} />

        <Animated.View style={entrada}>
          <View style={styles.resumen}>
            <Ionicons name="notifications" size={17} color={COLORS.primaryText} />
            <Text style={styles.resumenTexto}>
              {nuevos > 0
                ? `${nuevos} aviso${nuevos > 1 ? 's' : ''} nuevo${nuevos > 1 ? 's' : ''} para ti`
                : 'Estás al día con los avisos de RAEE Smart'}
            </Text>
          </View>

          <View style={styles.lista}>
            {AVISOS.map((aviso) => (
              <View key={aviso.titulo} style={styles.tarjeta}>
                <View style={[styles.icono, aviso.nuevo && styles.iconoNuevo]}>
                  <Ionicons
                    name={aviso.icono}
                    size={17}
                    color={aviso.nuevo ? COLORS.white : COLORS.primaryText}
                  />
                </View>

                <View style={styles.textos}>
                  <View style={styles.tituloFila}>
                    <Text style={styles.titulo}>{aviso.titulo}</Text>
                    {aviso.nuevo ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeTexto}>Nuevo</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.detalle}>{aviso.detalle}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.nota}>
            Los avisos de campañas y cambios de horario se publican en Horarios y campañas.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },

  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primaryPale,
    borderWidth: 1,
    borderColor: COLORS.primaryRing,
    borderRadius: RADIOS.md,
    padding: 12,
    marginBottom: ESPACIOS.lg,
  },
  resumenTexto: { ...TIPOGRAFIA.micro, fontSize: 12, color: COLORS.inkItem, flex: 1 },

  lista: { gap: 9 },
  tarjeta: {
    flexDirection: 'row',
    gap: 11,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: 13,
  },
  icono: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoNuevo: { backgroundColor: COLORS.notif },

  textos: { flex: 1 },
  tituloFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { ...TIPOGRAFIA.h4, fontSize: 13.5, flex: 1 },
  badge: {
    backgroundColor: COLORS.notif,
    borderRadius: RADIOS.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeTexto: { ...TIPOGRAFIA.micro, fontSize: 9.5, color: COLORS.white, fontWeight: '700' },
  detalle: { ...TIPOGRAFIA.micro, fontSize: 12, lineHeight: 17, marginTop: 4 },

  nota: { ...TIPOGRAFIA.micro, fontSize: 11, textAlign: 'center', marginTop: ESPACIOS.xl },
});