import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import useEntradaAnimada from '../hooks/useEntradaAnimada';
import useSalidaAnimada from '../hooks/useSalidaAnimada';
import * as notificacionService from '../services/notificacionService';
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
  const [avisos, setAvisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [marcando, setMarcando] = useState(false);
  const [error, setError] = useState('');
  const [entrada, salir] = useEntradaAnimada({ eje: 'y', distancia: -22 });
  useSalidaAnimada(navigation, salir);

  const cargar = useCallback(async () => {
    try {
      setError('');
      setCargando(true);
      setAvisos(await notificacionService.listarNotificaciones());
    } catch (err) {
      setError(err.normalizado || 'No pudimos cargar tus notificaciones');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const nuevos = avisos.filter((aviso) => !aviso.leida).length;

  async function marcarTodas() {
    if (!nuevos || marcando) return;
    try {
      setMarcando(true);
      setError('');
      await notificacionService.marcarTodasLeidas();
      setAvisos((actuales) => actuales.map((aviso) => ({ ...aviso, leida: true })));
    } catch (err) {
      setError(err.normalizado || 'No pudimos marcar las notificaciones');
    } finally {
      setMarcando(false);
    }
  }

  async function marcarUna(aviso) {
    if (aviso.leida) return;
    try {
      await notificacionService.marcarLeida(aviso.id);
      setAvisos((actuales) =>
        actuales.map((item) => (item.id === aviso.id ? { ...item, leida: true } : item)),
      );
    } catch (err) {
      setError(err.normalizado || 'No pudimos marcar la notificación');
    }
  }

  return (
    <View style={styles.fondo}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={cargando} onRefresh={cargar} tintColor={COLORS.primary} />
        }
      >
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
              <TouchableOpacity
                style={styles.marcar}
                onPress={marcarTodas}
                activeOpacity={0.7}
                disabled={marcando}
              >
                <Ionicons name="checkmark-done-outline" size={15} color={COLORS.primaryText} />
                <Text style={styles.marcarTexto}>Leídas</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {error ? (
            <View style={styles.vacio}>
              <Ionicons name="cloud-offline-outline" size={30} color={COLORS.mut} />
              <Text style={styles.vacioTexto}>{error}</Text>
              <Boton titulo="Reintentar" variante="fantasma" ancho={false} onPress={cargar} />
            </View>
          ) : null}

          {cargando && !avisos.length ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.cargando} />
          ) : null}

          {!cargando && !error && !avisos.length ? (
            <View style={styles.vacio}>
              <Ionicons name="notifications-off-outline" size={30} color={COLORS.mut} />
              <Text style={styles.vacioTexto}>No tienes notificaciones por ahora</Text>
            </View>
          ) : null}

          <View style={styles.lista}>
            {avisos.map((aviso) => (
              <TouchableOpacity
                key={aviso.id}
                style={styles.tarjeta}
                onPress={() => marcarUna(aviso)}
                activeOpacity={aviso.leida ? 1 : 0.85}
                disabled={aviso.leida}
              >
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
              </TouchableOpacity>
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

  cargando: { marginVertical: ESPACIOS.xl },
  vacio: { alignItems: 'center', gap: ESPACIOS.md, marginVertical: ESPACIOS.xl },
  vacioTexto: { ...TIPOGRAFIA.small, fontSize: 12.5, textAlign: 'center', color: COLORS.mut },
  nota: { ...TIPOGRAFIA.micro, fontSize: 11, textAlign: 'center', marginTop: ESPACIOS.xl },
});
