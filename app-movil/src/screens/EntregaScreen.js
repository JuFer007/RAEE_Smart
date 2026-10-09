import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import MapaPuntos from '../components/MapaPuntos';
import Boton from '../components/Boton';
import SelectorMunicipalidad from '../components/SelectorMunicipalidad';
import useLocation from '../hooks/useLocation';
import usePuntos from '../hooks/usePuntos';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';
import { USAR_DATOS_PRUEBA, completarSimulacion } from '../utils/datosPrueba';
import { distanciaKm } from '../utils/fecha';

const PREFIJO_MUNICIPALIDAD = /^Municipalidad\s+(Provincial|Distrital)\s+de\s+/i;

function municipalidadDe(punto) {
  if (!punto) return '';
  return String(punto.municipalidadNombre || punto.nombre || '')
    .replace(PREFIJO_MUNICIPALIDAD, '')
    .trim();
}

export default function EntregaScreen({ route, navigation }) {
  const { entrega } = route.params || {};
  const { ubicacion } = useLocation();
  const { puntos } = usePuntos(ubicacion);
  const [seleccionado, setSeleccionado] = useState(entrega?.puntoRecoleccionId ?? null);
  const [municipalidad, setMunicipalidad] = useState('Todas');

  const municipalidades = useMemo(() => {
    const vistas = new Set();
    puntos.forEach((p) => {
      const nombre = municipalidadDe(p);
      if (nombre) vistas.add(nombre);
    });
    return ['Todas', ...Array.from(vistas).sort((a, b) => a.localeCompare(b, 'es'))];
  }, [puntos]);

  const visibles = useMemo(
    () =>
      municipalidad === 'Todas'
        ? puntos
        : puntos.filter((p) => municipalidadDe(p) === municipalidad),
    [puntos, municipalidad]
  );

  const activo = visibles.find((p) => String(p.id) === String(seleccionado)) || visibles[0] || null;
  const masCercanoId = ubicacion && puntos.length ? puntos[0].id : null;

  function continuar() {
    const entregaConPunto = {
      ...entrega,
      puntoRecoleccionId: activo?.id,
      puntoRecoleccionNombre: activo?.nombre,
      puntoRecoleccionDireccion: activo?.direccion,
    };

    navigation.navigate('Confirmacion', {
      entrega: USAR_DATOS_PRUEBA ? completarSimulacion(entregaConPunto) : entregaConPunto,
    });
  }

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Registrar entrega" onBack={() => navigation.goBack()} />

        {municipalidades.length > 1 ? (
          <View style={styles.selectorZona}>
            <Text style={styles.label}>Filtrar por municipalidad</Text>
            <SelectorMunicipalidad
              opciones={municipalidades}
              valor={municipalidad}
              onChange={setMunicipalidad}
            />
          </View>
        ) : null}

        <View style={styles.mapa}>
          <MapaPuntos
            puntos={visibles}
            ubicacion={ubicacion}
            seleccionado={activo}
            onSelect={(p) => setSeleccionado(p.id)}
            alto={170}
            radio={RADIOS.lg}
          />
        </View>

        <Text style={styles.label}>Ubicación del punto de entrega</Text>
        {activo ? (
          <View style={styles.caja}>
            <Ionicons name="location" size={18} color={COLORS.primaryText} />
            <Text style={styles.cajaTexto} numberOfLines={1}>
              {activo.direccion}
            </Text>
          </View>
        ) : (
          <Text style={styles.detalle}>Buscando puntos de acopio cercanos...</Text>
        )}

        {!ubicacion ? (
          <View style={styles.aviso}>
            <Ionicons name="navigate-circle-outline" size={14} color={COLORS.info} />
            <Text style={styles.avisoTexto}>
              Activa tu ubicación para ordenar los puntos por cercanía
            </Text>
          </View>
        ) : null}

        <Text style={[styles.label, styles.labelSeleccion]}>
          Selecciona un punto de acopio{visibles.length ? ` (${visibles.length})` : ''}
        </Text>

        {visibles.map((p) => {
          const esActivo = activo && String(p.id) === String(activo.id);
          const esMasCercano = masCercanoId != null && String(p.id) === String(masCercanoId);
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.lugar, esActivo && styles.lugarActivo]}
              activeOpacity={0.85}
              onPress={() => setSeleccionado(p.id)}
            >
              <View style={[styles.radio, esActivo && styles.radioActivo]} />
              <View style={styles.lugarTextos}>
                <View style={styles.lugarFila}>
                  <Text style={styles.lugarNombre} numberOfLines={1}>
                    {p.nombre}
                  </Text>
                  {esMasCercano ? (
                    <View style={styles.tag}>
                      <Text style={styles.tagTexto}>Más cercano</Text>
                    </View>
                  ) : null}
                </View>
                {p.distanciaM != null ? <Text style={styles.detalle}>A {distanciaKm(p.distanciaM)}</Text> : null}
              </View>
            </TouchableOpacity>
          );
        })}

        {!visibles.length ? (
          <Text style={styles.detalle}>No hay puntos de acopio para esta municipalidad.</Text>
        ) : null}

        <Boton titulo="Continuar" onPress={continuar} style={styles.boton} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },
  mapa: { marginBottom: ESPACIOS.xl },
  label: { ...TIPOGRAFIA.h4, fontSize: 14, marginBottom: 10 },
  labelSeleccion: { marginTop: 22 },

  selectorZona: { marginBottom: ESPACIOS.lg },

  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: RADIOS.campo,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
  },
  cajaTexto: { flex: 1, ...TIPOGRAFIA.small, fontSize: 13, color: COLORS.inkItem },

  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: COLORS.primaryPale,
    borderWidth: 1,
    borderColor: COLORS.primaryRing,
    borderRadius: RADIOS.md,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginTop: 10,
  },
  avisoTexto: { flex: 1, ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.inkItem },

  detalle: { ...TIPOGRAFIA.micro, fontSize: 12, color: COLORS.mutSoft, marginTop: 3 },
  lugar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: RADIOS.boton,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
  },
  lugarActivo: { borderColor: '#9BD3B2' },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.lineTab },
  radioActivo: { borderWidth: 5, borderColor: '#0B9253' },
  lugarTextos: { flex: 1 },
  lugarFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lugarNombre: { ...TIPOGRAFIA.small, fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: COLORS.inkItem, flexShrink: 1 },
  tag: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADIOS.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagTexto: { ...TIPOGRAFIA.micro, fontSize: 9.5, fontFamily: 'DMSans_700Bold', color: COLORS.primaryText },
  boton: { marginTop: 14 },
});
