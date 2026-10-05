import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import MapaPuntos from '../components/MapaPuntos';
import Boton from '../components/Boton';
import useLocation from '../hooks/useLocation';
import usePuntos from '../hooks/usePuntos';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';
import { USAR_DATOS_PRUEBA, completarSimulacion } from '../utils/datosPrueba';
import { distanciaKm } from '../utils/fecha';

export default function EntregaScreen({ route, navigation }) {
  const { entrega } = route.params || {};
  const { ubicacion } = useLocation();
  const { puntos } = usePuntos(ubicacion);
  const [seleccionado, setSeleccionado] = useState(entrega?.puntoRecoleccionId ?? null);

  const activo = puntos.find((p) => String(p.id) === String(seleccionado)) || puntos[0];

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

        <View style={styles.mapa}>
          <MapaPuntos
            puntos={puntos}
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
                {p.distanciaM != null ? <Text style={styles.detalle}>A {distanciaKm(p.distanciaM)}</Text> : null}
              </View>
            </TouchableOpacity>
          );
        })}

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
  lugarNombre: { ...TIPOGRAFIA.small, fontSize: 13, fontFamily: 'DMSans_600SemiBold', color: COLORS.inkItem },
  boton: { marginTop: 14 },
});
