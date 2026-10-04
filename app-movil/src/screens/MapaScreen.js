import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapaPuntos from '../components/MapaPuntos';
import Encabezado, { BotonIcono } from '../components/Encabezado';
import useLocation from '../hooks/useLocation';
import usePuntos from '../hooks/usePuntos';
import { esDemo } from '../utils/demo';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA } from '../theme';
import { distanciaKm } from '../utils/fecha';

export default function MapaScreen() {
  const modoDemo = esDemo();
  const { ubicacion } = useLocation(!modoDemo);
  const { puntos, cargando, error, recargar } = usePuntos(ubicacion);
  const [indice, setIndice] = useState(0);

  const activo = puntos[indice] || puntos[0];

  function mover(delta) {
    if (!puntos.length) return;
    setIndice((i) => (i + delta + puntos.length) % puntos.length);
  }

  return (
    <View style={styles.fondo}>
      <View style={styles.encabezadoZona}>
        <Encabezado titulo="Mapa de puntos de acopio" derecha={<BotonIcono nombre="search-outline" size={19} />} />
      </View>

      <View style={styles.mapaZona}>
        <MapaPuntos
          puntos={puntos}
          ubicacion={ubicacion}
          seleccionado={activo}
          onSelect={(p) => setIndice(puntos.findIndex((x) => String(x.id) === String(p.id)))}
          alto={999}
          radio={0}
        />

        {activo ? (
          <View style={styles.tarjetaFlotante}>
            <Ionicons name="location-outline" size={20} color={COLORS.primaryText} />
            <View style={styles.flotanteTextos}>
              <Text style={styles.flotanteNombre} numberOfLines={1}>
                {activo.nombre}
              </Text>
              <Text style={styles.flotanteDetalle} numberOfLines={1}>
                {activo.direccion}
              </Text>
              {activo.distanciaM != null ? (
                <Text style={styles.flotanteDistancia}>A {distanciaKm(activo.distanciaM)}</Text>
              ) : null}
            </View>
            <View style={styles.flanteControles}>
              <TouchableOpacity onPress={() => mover(-1)} hitSlop={8}>
                <Ionicons name="chevron-back" size={18} color={COLORS.mutSoft} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => mover(1)} hitSlop={8}>
                <Ionicons name="chevron-forward" size={18} color={COLORS.primaryText} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {cargando ? (
          <View style={styles.cargando}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.cargandoTexto}>Buscando puntos cercanos...</Text>
          </View>
        ) : null}

        {error ? (
          <TouchableOpacity style={styles.errorChip} onPress={recargar} activeOpacity={0.85}>
            <Ionicons name="refresh-outline" size={14} color={COLORS.danger} />
            <Text style={styles.errorChipTexto}>No pudimos cargar los puntos · Reintentar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  encabezadoZona: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.sm },
  mapaZona: { flex: 1, minHeight: 340, overflow: 'hidden' },
  tarjetaFlotante: {
    position: 'absolute',
    left: 34,
    right: 34,
    bottom: 93,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: RADIOS.md,
    padding: 12,
    ...SOMBRAS.flotante,
  },
  flotanteTextos: { flex: 1 },
  flotanteNombre: { ...TIPOGRAFIA.micro, fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#23574C' },
  flotanteDetalle: { ...TIPOGRAFIA.micro, fontSize: 10, color: '#7F9890', marginTop: 3 },
  flotanteDistancia: { ...TIPOGRAFIA.micro, fontSize: 10, color: '#7F9890', marginTop: 3 },
  flanteControles: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
    bottom: 24,
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