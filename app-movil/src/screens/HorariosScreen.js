import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import { CAMPANAS, SIN_CAMPANAS, TIPS_HORARIOS } from '../utils/contenido';
import * as puntoService from '../services/puntoService';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

export default function HorariosScreen({ navigation }) {
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setError(null);
      const data = await puntoService.listarPuntos();
      setPuntos(data || []);
    } catch (e) {
      setError('No pudimos cargar los horarios');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Horarios y campañas" onBack={() => navigation.goBack()} />

        <Text style={styles.bajada}>
          Revisa cuándo atiende cada punto de acopio y las campañas de recolección de la Municipalidad.
        </Text>

        <Text style={styles.seccion}>Días y horarios de atención</Text>

        {cargando ? (
          <View style={styles.estado}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.estadoTexto}>Cargando horarios...</Text>
          </View>
        ) : error ? (
          <TouchableOpacity style={[styles.estado, styles.estadoError]} activeOpacity={0.85} onPress={cargar}>
            <Ionicons name="cloud-offline-outline" size={18} color={COLORS.danger} />
            <Text style={styles.estadoTexto}>{error} · Toca para reintentar</Text>
          </TouchableOpacity>
        ) : puntos.length === 0 ? (
          <View style={styles.estado}>
            <Ionicons name="location-outline" size={18} color={COLORS.mutSoft} />
            <Text style={styles.estadoTexto}>Todavía no hay puntos de acopio publicados.</Text>
          </View>
        ) : (
          <View style={styles.lista}>
            {puntos.map((punto) => (
              <View key={punto.id} style={styles.tarjeta}>
                <View style={styles.tarjetaIcono}>
                  <Ionicons name="location" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.tarjetaTextos}>
                  <Text style={styles.puntoNombre}>{punto.nombre}</Text>
                  <View style={styles.horario}>
                    <Ionicons name="time-outline" size={13} color={COLORS.primaryText} />
                    <Text style={styles.horarioTexto}>{punto.horarioAtencion || 'Horario por confirmar'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {!cargando && !error ? <Text style={styles.tips}>{TIPS_HORARIOS}</Text> : null}

        <Text style={styles.seccion}>Campañas de la Municipalidad</Text>

        {CAMPANAS.length === 0 ? (
          <View style={styles.vacio}>
            <Ionicons name="megaphone-outline" size={18} color={COLORS.mutSoft} />
            <Text style={styles.vacioTexto}>{SIN_CAMPANAS}</Text>
          </View>
        ) : (
          <View style={styles.lista}>
            {CAMPANAS.map((campana) => (
              <View key={campana.titulo} style={styles.tarjeta}>
                <View style={[styles.tarjetaIcono, styles.campanaIcono]}>
                  <Ionicons name={campana.icono || 'megaphone-outline'} size={16} color={COLORS.warning} />
                </View>
                <View style={styles.tarjetaTextos}>
                  <Text style={styles.puntoNombre}>{campana.titulo}</Text>
                  {campana.fecha ? <Text style={styles.campanaFecha}>{campana.fecha}</Text> : null}
                  {campana.detalle ? <Text style={styles.campanaDetalle}>{campana.detalle}</Text> : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },

  bajada: { ...TIPOGRAFIA.micro, fontSize: 13, lineHeight: 19, marginBottom: ESPACIOS.xl },
  seccion: { ...TIPOGRAFIA.label, color: COLORS.primaryText, marginBottom: ESPACIOS.sm, marginLeft: 2 },

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
  tarjetaIcono: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campanaIcono: { backgroundColor: COLORS.warningSoft },
  tarjetaTextos: { flex: 1 },
  puntoNombre: { ...TIPOGRAFIA.h4, fontSize: 13.5 },
  horario: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  horarioTexto: { ...TIPOGRAFIA.micro, fontSize: 12, color: COLORS.primaryText, flex: 1 },
  campanaFecha: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.warning, marginTop: 4 },
  campanaDetalle: { ...TIPOGRAFIA.micro, fontSize: 12, lineHeight: 17, marginTop: 4 },

  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: 15,
    marginBottom: ESPACIOS.md,
  },
  estadoError: { borderColor: '#F0C8C4', backgroundColor: COLORS.dangerSoft },
  estadoTexto: { ...TIPOGRAFIA.micro, fontSize: 12, flex: 1 },

  tips: { ...TIPOGRAFIA.micro, fontSize: 11, marginTop: ESPACIOS.sm, marginLeft: 2, marginBottom: ESPACIOS.xl },

  vacio: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.bgBottom,
    borderWidth: 1,
    borderColor: COLORS.lineInner,
    borderRadius: RADIOS.md,
    padding: 14,
  },
  vacioTexto: { ...TIPOGRAFIA.micro, fontSize: 12, lineHeight: 17, flex: 1 },
});