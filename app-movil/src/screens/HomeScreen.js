import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Encabezado, { BotonIcono } from '../components/Encabezado';
import MapaPuntos from '../components/MapaPuntos';
import usePuntos from '../hooks/usePuntos';
import useLocation from '../hooks/useLocation';
import { useAuth } from '../context/AuthContext';
import { esDemo } from '../utils/demo';
import { PROGRESO_DEMO, USUARIO_DEMO } from '../utils/mockData';
import { formatearFecha, distanciaKm } from '../utils/fecha';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

export default function HomeScreen({ navigation }) {
  const { usuario } = useAuth();
  const modoDemo = esDemo();
  const { ubicacion } = useLocation(!modoDemo);
  const { puntos, recargar } = usePuntos(ubicacion);
  const [refrescando, setRefrescando] = useState(false);

  const nombre = (usuario?.nombre || USUARIO_DEMO.nombre || '').split(' ')[0];
  const cercano = puntos[0];
  const progreso = PROGRESO_DEMO;

  const onRefresh = useCallback(async () => {
    setRefrescando(true);
    await recargar();
    setRefrescando(false);
  }, [recargar]);

  function verTodos() {
    navigation.navigate('Mapa');
  }

  return (
    <View style={styles.fondo}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <Encabezado derecha={<BotonIcono nombre="notifications-outline" punto />} />

        <View style={styles.saludo}>
          <Text style={styles.saludoTexto}>Juntos por un Chiclayo más limpio</Text>
          <Text style={styles.saludoTitulo}>¡Hola, {nombre}!</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('CapturaFoto')}>
          <LinearGradient
            colors={['#087C4B', '#0A9D5A']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.hero}
          >
            <View style={styles.heroTextos}>
              <Text style={styles.heroTitulo}>Entrega tus RAEE</Text>
              <Text style={styles.heroSub}>y recibe tu certificado digital</Text>
            </View>
            <Ionicons name="arrow-forward" size={21} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.acciones}>
          <AccionRapida
            icono="scan-outline"
            titulo="Identificar"
            linea2="aparato"
            onPress={() => navigation.navigate('CapturaFoto')}
          />
          <AccionRapida
            icono="location-outline"
            titulo="Registrar"
            linea2="entrega"
            onPress={() => navigation.navigate('CapturaFoto')}
          />
          <AccionRapida
            icono="document-text-outline"
            titulo="Mis"
            linea2="certificados"
            onPress={() => navigation.navigate('Historial')}
          />
        </View>

        <View style={styles.bloque}>
          <View style={styles.bloqueEncabezado}>
            <Text style={styles.bloqueTitulo}>Puntos de acopio cercanos</Text>
            <TouchableOpacity style={styles.verTodos} onPress={verTodos} activeOpacity={0.7}>
              <Text style={styles.verTodosTexto}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={15} color={COLORS.primaryText} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.tarjetaMapa} activeOpacity={0.9} onPress={verTodos}>
            <MapaPuntos puntos={puntos} ubicacion={ubicacion} alto={142} />

            {cercano ? (
              <View style={styles.lugarFila}>
                <Ionicons name="location-outline" size={17} color={COLORS.primaryText} />
                <View style={styles.lugarTextos}>
                  <Text style={styles.lugarNombre} numberOfLines={1}>
                    {cercano.nombre}
                  </Text>
                  <Text style={styles.lugarDetalle} numberOfLines={1}>
                    {cercano.direccion}
                    {cercano.distanciaM != null ? ` · ${distanciaKm(cercano.distanciaM)}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={COLORS.primaryText} />
              </View>
            ) : (
              <View style={styles.lugarFila}>
                <Text style={styles.lugarDetalle}>Buscando puntos cercanos...</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bloque}>
          <View style={styles.bloqueEncabezado}>
            <Text style={styles.bloqueTitulo}>Tu progreso</Text>
          </View>

          <View style={styles.tarjetaProgreso}>
            <View style={styles.anillo}>
              <Text style={styles.anilloTexto}>
                {progreso.entregados}
                <Text style={styles.anilloTotal}>/{progreso.meta}</Text>
              </Text>
            </View>
            <View style={styles.progresoTextos}>
              <Text style={styles.progresoTitulo}>¡Vas por buen camino!</Text>
              <Text style={styles.progresoDetalle}>
                Has entregado {progreso.entregados} aparatos este año.
              </Text>
            </View>
            <Ionicons name="leaf" size={28} color={COLORS.limeBright} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function AccionRapida({ icono, titulo, linea2, onPress }) {
  return (
    <TouchableOpacity style={styles.accionRapida} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.accionIcono}>
        <Ionicons name={icono} size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.accionTexto}>
        {titulo}
        {'\n'}
        {linea2}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingBottom: ESPACIOS.xxl },
  saludo: { marginVertical: 12 },
  saludoTexto: { ...TIPOGRAFIA.micro, fontSize: 11, marginBottom: 5 },
  saludoTitulo: { ...TIPOGRAFIA.h1 },
  hero: {
    width: '100%',
    borderRadius: 15,
    padding: 17,
    paddingLeft: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SOMBRAS.hero,
  },
  heroTextos: { flex: 1 },
  heroTitulo: { ...TIPOGRAFIA.h4, fontSize: 14, color: COLORS.white },
  heroSub: { ...TIPOGRAFIA.micro, fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  acciones: { flexDirection: 'row', gap: 8, marginVertical: 20 },
  accionRapida: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.boton,
    paddingVertical: 12,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  accionIcono: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  accionTexto: { ...TIPOGRAFIA.micro, fontSize: 10, lineHeight: 14, textAlign: 'center', color: '#18544B', fontFamily: FUENTES.dmSemi },
  bloque: { marginBottom: 23 },
  bloqueEncabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  bloqueTitulo: { ...TIPOGRAFIA.h4 },
  verTodos: { flexDirection: 'row', alignItems: 'center' },
  verTodosTexto: { ...TIPOGRAFIA.micro, fontSize: 11, fontWeight: '700', color: COLORS.primaryText },
  tarjetaMapa: { borderRadius: RADIOS.md, overflow: 'hidden', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.lineSoft },
  lugarFila: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12 },
  lugarTextos: { flex: 1 },
  lugarNombre: { ...TIPOGRAFIA.micro, fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#23574C' },
  lugarDetalle: { ...TIPOGRAFIA.micro, fontSize: 10, color: '#7F9890', marginTop: 3 },
  tarjetaProgreso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: COLORS.primaryPale,
    borderWidth: 1,
    borderColor: '#D5EFDF',
    borderRadius: RADIOS.md,
    padding: 12,
  },
  anillo: {
    height: 49,
    width: 49,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#76C994',
    borderLeftColor: '#E2F3E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anilloTexto: { ...TIPOGRAFIA.h3, fontSize: 15, color: '#15794D' },
  anilloTotal: { fontSize: 8, fontFamily: FUENTES.dm },
  progresoTextos: { flex: 1 },
  progresoTitulo: { ...TIPOGRAFIA.micro, fontSize: 11, fontFamily: 'DMSans_600SemiBold', color: '#1C594B' },
  progresoDetalle: { ...TIPOGRAFIA.micro, fontSize: 10, color: '#709087', marginTop: 4 },
});