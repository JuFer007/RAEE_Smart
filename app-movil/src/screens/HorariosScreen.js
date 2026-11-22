import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import { SIN_CAMPANAS, TIPS_HORARIOS } from '../utils/contenido';
import * as puntoService from '../services/puntoService';
import * as campanaService from '../services/campanaService';
import { formatearFecha } from '../utils/fecha';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

function rangoFecha(campana) {
  const inicio = formatearFecha(campana.fechaInicio);
  const fin = formatearFecha(campana.fechaFin);
  return inicio === fin ? inicio : `${inicio} · ${fin}`;
}

export default function HorariosScreen({ route, navigation }) {
  const { punto: puntoUnico } = route.params || {};
  const [puntos, setPuntos] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoCampanas, setCargandoCampanas] = useState(true);
  const [error, setError] = useState(null);
  const [errorCampanas, setErrorCampanas] = useState(null);

  const cargar = useCallback(async () => {
    const municipalidadId =
      puntoUnico?.municipalidadId ||
      puntoUnico?.municipalidad?.id ||
      undefined;
    const [resPuntos, resCampanas] = await Promise.allSettled([
      puntoUnico ? Promise.resolve([puntoUnico]) : puntoService.listarPuntos(municipalidadId),
      campanaService.listarCampanas(municipalidadId),
    ]);

    if (resPuntos.status === 'fulfilled') {
      setPuntos(resPuntos.value || []);
      setError(null);
    } else {
      setError('No pudimos cargar los horarios');
    }

    if (resCampanas.status === 'fulfilled') {
      setCampanas(resCampanas.value || []);
      setErrorCampanas(null);
    } else {
      const motivo = resCampanas.reason?.normalizado || resCampanas.reason?.message;
      setErrorCampanas(motivo || 'No pudimos cargar las campañas');
    }

    setCargando(false);
    setCargandoCampanas(false);
  }, [puntoUnico]);

  function reintentar() {
    setCargando(true);
    setCargandoCampanas(true);
    setError(null);
    setErrorCampanas(null);
    cargar();
  }

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Horarios y campañas" onBack={() => navigation.goBack()} />

        <Text style={styles.bajada}>
          {puntoUnico
            ? `Revisa el horario de atención de ${puntoUnico.nombre || 'este punto de acopio'}.`
            : 'Revisa cuándo atiende cada punto de acopio y las campañas de recolección de la Municipalidad.'}
        </Text>

        <Text style={styles.seccion}>Días y horarios de atención</Text>

        {puntoUnico ? (
          <View style={styles.lista}>
            <View style={[styles.tarjeta, styles.tarjetaUnico]}>
              <View style={styles.tarjetaIcono}>
                <Ionicons name="location" size={16} color={COLORS.primary} />
              </View>
              <View style={styles.tarjetaTextos}>
                <Text style={styles.puntoNombre}>{puntoUnico.nombre}</Text>
                {puntoUnico.direccion ? (
                  <Text style={styles.puntoDireccion}>{puntoUnico.direccion}</Text>
                ) : null}
                <View style={styles.horario}>
                  <Ionicons name="time-outline" size={13} color={COLORS.primaryText} />
                  <Text style={styles.horarioTexto}>
                    {puntoUnico.horarioAtencion || 'Horario por confirmar'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : cargando ? (
          <View style={styles.estado}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.estadoTexto}>Cargando horarios...</Text>
          </View>
        ) : error ? (
          <TouchableOpacity style={[styles.estado, styles.estadoError]} activeOpacity={0.85} onPress={reintentar}>
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

        <Text style={[styles.seccion, styles.seccionCampanas]}>Campañas de la Municipalidad</Text>

        {cargandoCampanas ? (
          <View style={styles.estado}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.estadoTexto}>Cargando campañas...</Text>
          </View>
        ) : errorCampanas ? (
          <TouchableOpacity
            style={[styles.estado, styles.estadoError]}
            activeOpacity={0.85}
            onPress={reintentar}
          >
            <Ionicons name="cloud-offline-outline" size={18} color={COLORS.danger} />
            <Text style={styles.estadoTexto}>{errorCampanas} · Toca para reintentar</Text>
          </TouchableOpacity>
        ) : campanas.length === 0 ? (
          <View style={styles.vacio}>
            <Ionicons name="megaphone-outline" size={18} color={COLORS.mutSoft} />
            <Text style={styles.vacioTexto}>{SIN_CAMPANAS}</Text>
          </View>
        ) : (
          <View style={styles.lista}>
            {campanas.map((campana) => (
              <View key={campana.id} style={styles.tarjeta}>
                <View style={[styles.tarjetaIcono, styles.campanaIcono]}>
                  <Ionicons name="megaphone-outline" size={16} color={COLORS.warning} />
                </View>
                <View style={styles.tarjetaTextos}>
                  <Text style={styles.puntoNombre}>{campana.titulo}</Text>
                  {campana.municipalidadNombre ? (
                    <Text style={styles.campanaMunicipalidad}>{campana.municipalidadNombre}</Text>
                  ) : null}
                  <View style={styles.campanaLinea}>
                    <Ionicons name="calendar-outline" size={12} color={COLORS.warning} />
                    <Text style={styles.campanaFecha}>{rangoFecha(campana)}</Text>
                  </View>
                  {campana.lugar ? (
                    <View style={styles.campanaLinea}>
                      <Ionicons name="location-outline" size={12} color={COLORS.warning} />
                      <Text style={styles.campanaFecha}>{campana.lugar}</Text>
                    </View>
                  ) : null}
                  {campana.horario ? (
                    <View style={styles.campanaLinea}>
                      <Ionicons name="time-outline" size={12} color={COLORS.warning} />
                      <Text style={styles.campanaFecha}>{campana.horario}</Text>
                    </View>
                  ) : null}
                  {campana.descripcion ? (
                    <Text style={styles.campanaDetalle}>{campana.descripcion}</Text>
                  ) : null}
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
  seccionCampanas: { marginTop: ESPACIOS.xl },

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
  puntoDireccion: { ...TIPOGRAFIA.micro, fontSize: 12, color: COLORS.mutSoft, marginTop: 3 },
  horario: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  horarioTexto: { ...TIPOGRAFIA.micro, fontSize: 12, color: COLORS.primaryText, flex: 1 },
  tarjetaUnico: { borderColor: COLORS.primaryRing, backgroundColor: COLORS.primaryPale },
  campanaMunicipalidad: { ...TIPOGRAFIA.tiny, fontSize: 11, color: COLORS.mutSoft, marginTop: 3 },
  campanaLinea: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  campanaFecha: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.warning, flex: 1 },
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