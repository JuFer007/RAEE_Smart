import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Mapa from '../components/Mapa';
import Encabezado from '../components/Encabezado';
import Toast from '../components/Toast';
import useEntradaAnimada from '../hooks/useEntradaAnimada';
import useLocation from '../hooks/useLocation';
import usePuntos from '../hooks/usePuntos';
import useToast from '../hooks/useToast';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';
import { distanciaKm } from '../utils/fecha';

export default function MapaScreen({ navigation }) {
  const { ubicacion } = useLocation();
  const { puntos, cargando, error, recargar } = usePuntos(ubicacion);
  const [indice, setIndice] = useState(0);
  const [entrada] = useEntradaAnimada({ eje: 'y', distancia: -18, escala: 0.99 });
  const { toast, mostrar, ocultar } = useToast();

  const activo = puntos[indice] || puntos[0];

  function mover(delta) {
    if (!puntos.length) return;
    setIndice((i) => (i + delta + puntos.length) % puntos.length);
  }

  function seleccionar(p) {
    const i = puntos.findIndex((x) => String(x.id) === String(p.id));
    if (i >= 0) setIndice(i);
  }

  return (
    <View style={styles.fondo}>
      <View style={styles.encabezadoZona}>
        <Encabezado
          titulo="Mapa de acopio"
          derecha={
            <View style={styles.chipCabecera}>
              <Ionicons name="location" size={12} color={COLORS.primaryText} />
              <Text style={styles.chipCabeceraTexto}>
                {cargando && !puntos.length ? '—' : puntos.length}
              </Text>
            </View>
          }
        />
      </View>

      <View style={styles.mapaZona}>
        <Mapa
          puntos={puntos}
          ubicacion={ubicacion}
          seleccionado={activo}
          onSelect={seleccionar}
          radio={0}
        />

        {!ubicacion && !cargando ? (
          <View style={styles.avisoUbicacion}>
            <Ionicons name="navigate-circle-outline" size={14} color={COLORS.info} />
            <Text style={styles.avisoUbicacionTexto}>Activa tu ubicación para ver qué punto te queda más cerca</Text>
          </View>
        ) : null}

        {cargando ? (
          <View style={styles.cargando}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.cargandoTexto}>Buscando puntos cercanos…</Text>
          </View>
        ) : null}

        {error ? (
          <TouchableOpacity
            style={styles.errorChip}
            onPress={recargar}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh-outline" size={14} color={COLORS.danger} />
            <Text style={styles.errorChipTexto}>No pudimos cargar los puntos · Reintentar</Text>
          </TouchableOpacity>
        ) : null}

        {activo ? (
          <Animated.View style={[styles.tarjetaFlotante, entrada]}>
            <View style={styles.tarjetaCabecera}>
              <View style={styles.tarjetaContador}>
                <Text style={styles.tarjetaContadorTexto}>
                  {indice + 1}/{puntos.length}
                </Text>
              </View>
              <View style={styles.tarjetaCabeceraTexto}>
                <Text style={styles.flotanteNombre} numberOfLines={1}>
                  {activo.nombre}
                </Text>
                {activo.distanciaM != null ? (
                  <View style={styles.distancia}>
                    <Ionicons name="walk-outline" size={11} color={COLORS.primaryText} />
                    <Text style={styles.distanciaTexto}>A {distanciaKm(activo.distanciaM)}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.navegacion}>
                <BotonCircular nombre="chevron-back" onPress={() => mover(-1)} />
                <BotonCircular nombre="chevron-forward" onPress={() => mover(1)} />
              </View>
            </View>

            <View style={styles.tarjetaLinea}>
              <Ionicons name="pin-outline" size={13} color={COLORS.mutIcon} />
              <Text style={styles.tarjetaDetalle} numberOfLines={2}>
                {activo.direccion}
              </Text>
            </View>

            {activo.horarioAtencion ? (
              <View style={styles.tarjetaLinea}>
                <Ionicons name="time-outline" size={13} color={COLORS.mutIcon} />
                <Text style={styles.tarjetaDetalle} numberOfLines={2}>
                  {activo.horarioAtencion}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.tarjetaAccion}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Horarios')}
            >
              <Ionicons name="calendar-outline" size={14} color={COLORS.white} />
              <Text style={styles.tarjetaAccionTexto}>Ver horarios de atención</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
            </TouchableOpacity>
          </Animated.View>
        ) : null}
        <Toast
          visible={toast.visible}
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onCerrar={ocultar}
          duracion={toast.duracion}
          accionTexto={toast.accionTexto}
          onAccion={toast.onAccion}
        />
      </View>
    </View>
  );
}

function BotonCircular({ nombre, onPress }) {
  return (
    <TouchableOpacity style={styles.botonCircular} activeOpacity={0.7} onPress={onPress}>
      <Ionicons name={nombre} size={16} color={COLORS.primaryText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  encabezadoZona: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md },

  chipCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryPale,
    borderWidth: 1,
    borderColor: COLORS.primaryRing,
    borderRadius: RADIOS.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipCabeceraTexto: { ...TIPOGRAFIA.micro, fontSize: 11.5, fontFamily: FUENTES.dmBold, color: COLORS.primaryText },

  mapaZona: { flex: 1, minHeight: 340, overflow: 'hidden' },

  avisoUbicacion: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    left: ESPACIOS.page,
    right: ESPACIOS.page,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  avisoUbicacionTexto: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.inkItem, flex: 1 },

  tarjetaFlotante: {
    position: 'absolute',
    left: ESPACIOS.page,
    right: ESPACIOS.page,
    bottom: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIOS.lg,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    padding: 14,
    gap: 9,
    ...SOMBRAS.flotante,
  },
  tarjetaCabecera: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tarjetaContador: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIOS.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  tarjetaContadorTexto: { ...TIPOGRAFIA.micro, fontSize: 11, fontFamily: FUENTES.dmBold, color: COLORS.white },
  tarjetaCabeceraTexto: { flex: 1 },
  flotanteNombre: { ...TIPOGRAFIA.micro, fontSize: 13, fontFamily: FUENTES.dmBold, color: COLORS.inkItem },
  distancia: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  distanciaTexto: { ...TIPOGRAFIA.micro, fontSize: 10.5, fontFamily: FUENTES.dmSemi, color: COLORS.primaryText },

  navegacion: { flexDirection: 'row', gap: 6 },
  botonCircular: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tarjetaLinea: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  tarjetaDetalle: { ...TIPOGRAFIA.micro, fontSize: 11.5, lineHeight: 16, color: COLORS.mut, flex: 1 },

  tarjetaAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: COLORS.primary,
    borderRadius: RADIOS.boton,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginTop: 2,
  },
  tarjetaAccionTexto: { ...TIPOGRAFIA.micro, fontSize: 12, fontFamily: FUENTES.dmBold, color: COLORS.white, flex: 1 },

  cargando: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: RADIOS.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  cargandoTexto: { ...TIPOGRAFIA.micro, fontSize: 10 },

  errorChip: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.dangerSoft,
    borderRadius: RADIOS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorChipTexto: { ...TIPOGRAFIA.micro, fontSize: 10, color: COLORS.danger },
});