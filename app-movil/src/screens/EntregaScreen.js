import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import MapaPuntos from '../components/MapaPuntos';
import Boton from '../components/Boton';
import useLocation from '../hooks/useLocation';
import usePuntos from '../hooks/usePuntos';
import { esDemo } from '../utils/demo';
import { obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';
import { distanciaKm } from '../utils/fecha';

export default function EntregaScreen({ route, navigation }) {
  const { entrega } = route.params || {};
  const modoDemo = esDemo();
  const { ubicacion } = useLocation(!modoDemo);
  const { puntos } = usePuntos(ubicacion);
  const info = obtenerInfoTipo(entrega?.tipoRaee);
  const [seleccionado, setSeleccionado] = useState(entrega?.puntoRecoleccionId ?? null);

  const activo = puntos.find((p) => String(p.id) === String(seleccionado)) || puntos[0];
  const nombre = entrega?.nombreCategoriaVisible || info.nombre;

  function continuar() {
    navigation.navigate('Confirmacion', {
      entrega: {
        ...entrega,
        puntoRecoleccionId: activo?.id,
        puntoRecoleccionNombre: activo?.nombre,
        puntoRecoleccionDireccion: activo?.direccion,
      },
    });
  }

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Registrar entrega" onBack={() => navigation.goBack()} />

        <View style={styles.mapa}>
          <MapaPuntos
            puntos={puntos}
            ubicacion={ubicacion}
            seleccionado={activo}
            onSelect={(p) => setSeleccionado(p.id)}
            alto={240}
            radio={RADIOS.lg}
          />
        </View>

        <Text style={styles.label}>Ubicación del punto de entrega</Text>
        {activo ? (
          <View style={styles.lineaUbicacion}>
            <Ionicons name="location-outline" size={18} color={COLORS.primaryText} />
            <View style={styles.lineaTextos}>
              <Text style={styles.lineaTitulo}>{activo.direccion}</Text>
              <Text style={styles.lineaDetalle}>
                {activo.horarioAtencion}
                {activo.distanciaM != null ? ` · A ${distanciaKm(activo.distanciaM)}` : ''}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.lineaDetalle}>Buscando puntos de acopio cercanos...</Text>
        )}

        <Text style={[styles.label, styles.labelSeleccion]}>Selecciona un punto de acopio</Text>

        {puntos.map((p) => {
          const esActivo = activo && String(p.id) === String(activo.id);
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.lugar, esActivo && styles.lugarActivo]}
              activeOpacity={0.85}
              onPress={() => setSeleccionado(p.id)}
            >
              <View style={[styles.radio, esActivo && styles.radioActivo]} />
              <View style={styles.lugarTextos}>
                <Text style={styles.lugarNombre} numberOfLines={1}>
                  {p.nombre}
                </Text>
                <Text style={styles.lugarDetalle} numberOfLines={1}>
                  {p.direccion}
                  {p.distanciaM != null ? ` · ${distanciaKm(p.distanciaM)}` : ''}
                </Text>
              </View>
              {esActivo ? <Ionicons name="checkmark" size={19} color="#149657" /> : null}
            </TouchableOpacity>
          );
        })}

        <View style={styles.resumenAparato}>
          <Ionicons name={info.icono} size={16} color={COLORS.primary} />
          <Text style={styles.resumenTexto}>{nombre}</Text>
        </View>

        <Boton titulo="Continuar" onPress={continuar} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.sm, paddingBottom: ESPACIOS.xxl },
  mapa: { marginHorizontal: -ESPACIOS.page, marginBottom: ESPACIOS.xl },
  label: { ...TIPOGRAFIA.label, marginBottom: 9 },
  labelSeleccion: { marginTop: 23 },
  lineaUbicacion: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  lineaTextos: { flex: 1 },
  lineaTitulo: { ...TIPOGRAFIA.micro, fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: COLORS.inkItem },
  lineaDetalle: { ...TIPOGRAFIA.micro, fontSize: 10, color: COLORS.mutSoft, marginTop: 4 },
  lugar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    paddingVertical: 11,
    borderRadius: RADIOS.boton,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
  },
  lugarActivo: { borderColor: '#B7DEC6' },
  radio: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: COLORS.lineTab },
  radioActivo: { borderWidth: 3, borderColor: '#0B9253' },
  lugarTextos: { flex: 1 },
  lugarNombre: { ...TIPOGRAFIA.micro, fontSize: 12, fontFamily: 'DMSans_600SemiBold', color: COLORS.inkItem },
  lugarDetalle: { ...TIPOGRAFIA.micro, fontSize: 10, color: COLORS.mutSoft, marginTop: 4 },
  resumenAparato: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryPale,
    borderRadius: RADIOS.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginTop: 8,
    marginBottom: 16,
  },
  resumenTexto: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.inkItem },
});