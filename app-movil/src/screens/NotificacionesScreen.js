import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import useEntradaAnimada from '../hooks/useEntradaAnimada';
import useSalidaAnimada from '../hooks/useSalidaAnimada';
import { AVISOS } from '../utils/contenido';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';
import { NOTIFICACIONES_PRUEBA } from '../utils/usuarioPrueba';
import { formatearFechaHora } from '../utils/fecha';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA, FUENTES } from '../theme';

const ICONO_POR_TIPO = {
  ENTREGA: 'checkmark-circle-outline',
  CAMPANA: 'megaphone-outline',
  HORARIO: 'time-outline',
  GENERAL: 'sparkles-outline',
};

function iconoDe(aviso) {
  return ICONO_POR_TIPO[aviso.tipo] || 'notifications-outline';
}

export default function NotificacionesScreen({ navigation }) {
  const [leido, setLeido] = useState(false);
  const avisos = (USAR_DATOS_PRUEBA ? NOTIFICACIONES_PRUEBA : AVISOS).map((aviso) => ({
    ...aviso,
    leida: leido ? true : aviso.leida,
  }));
  const nuevos = avisos.filter((aviso) => !aviso.leida).length;
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
            {nuevos > 0 ? (
              <TouchableOpacity style={styles.marcar} onPress={() => setLeido(true)} activeOpacity={0.7}>
                <Ionicons name="checkmark-done-outline" size={15} color={COLORS.primaryText} />
                <Text style={styles.marcarTexto}>Leídas</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.lista}>
            {avisos.map((aviso) => (
              <View key={aviso.id} style={styles.tarjeta}>
                <View style={[styles.icono, !aviso.leida && styles.iconoNuevo]}>
                  <Ionicons
                    name={iconoDe(aviso)}
                    size={17}
                    color={aviso.leida ? COLORS.primaryText : COLORS.white}
                  />
                </View>

                <View style={styles.textos}>
                  <View style={styles.tituloFila}>
                    <Text style={styles.titulo}>{aviso.titulo}</Text>
                    {!aviso.leida ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeTexto}>Nuevo</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.detalle}>{aviso.detalle}</Text>
                  {aviso.fechaCreacion ? (
                    <Text style={styles.fecha}>{formatearFechaHora(aviso.fechaCreacion)}</Text>
                  ) : null}
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
  marcar: { flexDirection: 'row', alignItems: 'center', gap: 3, padding: 2 },
  marcarTexto: { ...TIPOGRAFIA.micro, fontSize: 11.5, fontFamily: FUENTES.dmSemi, color: COLORS.primaryText },

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
  fecha: { ...TIPOGRAFIA.micro, fontSize: 10, color: COLORS.mutSoft, marginTop: 5 },

  nota: { ...TIPOGRAFIA.micro, fontSize: 11, textAlign: 'center', marginTop: ESPACIOS.xl },
});