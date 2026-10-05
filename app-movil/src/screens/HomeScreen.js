import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Image, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BotonIcono } from '../components/Encabezado';
import MapaPuntos from '../components/MapaPuntos';
import usePuntos from '../hooks/usePuntos';
import useLocation from '../hooks/useLocation';
import { useAuth } from '../context/AuthContext';
import * as entregaService from '../services/entregaService';
import { avisosNuevos } from '../utils/contenido';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

const META_ANUAL = 5;

export default function HomeScreen({ navigation }) {
  const { usuario } = useAuth();
  const insets = useSafeAreaInsets();
  const { ubicacion } = useLocation();
  const { puntos, recargar } = usePuntos(ubicacion);
  const [refrescando, setRefrescando] = useState(false);
  const [entregados, setEntregados] = useState(0);

  const nombre = (usuario?.nombre || '').trim().split(' ')[0] || 'Vecino';
  const progreso = { entregados, meta: META_ANUAL };
  const porcentaje = Math.min(100, Math.round((entregados / META_ANUAL) * 100));
  const metaCumplida = entregados >= META_ANUAL;
  const mensajeProgreso = metaCumplida
    ? '¡Meta cumplida este año!'
    : entregados === 0
      ? 'Empieza con tu primer aparato'
      : '¡Vas por buen camino!';

  const onRefresh = useCallback(async () => {
    setRefrescando(true);
    await recargar();
    setRefrescando(false);
  }, [recargar]);

  useEffect(() => {
    if (!usuario?.id) return undefined;

    let vigente = true;
    (async () => {
      try {
        const data = await entregaService.listarHistorial(usuario.id);
        if (!vigente) return;
        const anio = new Date().getFullYear();
        setEntregados((data || []).filter((e) => new Date(e.fechaRegistro).getFullYear() === anio).length);
      } catch (e) {
        if (vigente) setEntregados(0);
      }
    })();

    return () => {
      vigente = false;
    };
  }, [usuario?.id]);

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
        <View style={[styles.topbar, { marginTop: insets.top + 8 }]}>
          <BotonIcono nombre="menu-outline" size={22} onPress={() => navigation.navigate('Menu')} />
          <View style={styles.topbarLogo}>
            <Image
              source={require('../../assets/logoRectangular.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>
          <BotonIcono
            nombre="notifications-outline"
            size={20}
            contador={avisosNuevos()}
            onPress={() => navigation.navigate('Notificaciones')}
          />
        </View>

        <View style={styles.saludo}>
          <Text style={styles.saludoTitulo}>¡Hola, {nombre}!</Text>
          <Text style={styles.saludoTexto}>Juntos por un Chiclayo más limpio</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('CapturaFoto')}>
          <LinearGradient
            colors={['#087C4B', '#0A9D5A']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.hero}
          >
            <View style={styles.heroIcono}>
              <Ionicons name="leaf" size={20} color={COLORS.white} />
            </View>

            <View style={styles.heroTextos}>
              <Text style={styles.heroTitulo}>Entrega tus RAEE</Text>
              <Text style={styles.heroSub}>Recibe tu certificado digital al instante</Text>
            </View>

            <View style={styles.heroFlecha}>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.acciones}>
          <AccionRapida
            icono="scan-outline"
            titulo="Identificar"
            detalle="Tu aparato"
            onPress={() => navigation.navigate('CapturaFoto')}
          />
          <AccionRapida
            icono="location-outline"
            titulo="Registrar"
            detalle="Tu entrega"
            onPress={() => navigation.navigate('CapturaFoto')}
          />
          <AccionRapida
            icono="document-text-outline"
            titulo="Certificados"
            detalle="Ver todos"
            onPress={() => navigation.navigate('Historial')}
          />
        </View>

        <View style={styles.bloque}>
          <View style={styles.bloqueEncabezado}>
            <View>
              <Text style={styles.bloqueTitulo}>Puntos de acopio cercanos</Text>
              {puntos.length > 0 ? (
                <Text style={styles.bloqueSub}>
                  {puntos.length} punto{puntos.length > 1 ? 's' : ''} disponible{puntos.length > 1 ? 's' : ''}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.verTodos} onPress={verTodos} activeOpacity={0.7}>
              <Text style={styles.verTodosTexto}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={15} color={COLORS.primaryText} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.tarjetaMapa} activeOpacity={0.9} onPress={verTodos}>
            <MapaPuntos puntos={puntos} ubicacion={ubicacion} alto={156} />
          </TouchableOpacity>
        </View>

        <View style={styles.bloque}>
          <View style={styles.bloqueEncabezado}>
            <Text style={styles.bloqueTitulo}>Tu progreso</Text>
            <Text style={styles.progresoMeta}>{progreso.entregados} de {progreso.meta}</Text>
          </View>

          <View style={styles.tarjetaProgreso}>
            <View style={styles.barra}>
              <View style={[styles.barraRelleno, { width: `${porcentaje}%` }]} />
            </View>

            <View style={styles.progresoPie}>
              <Text style={styles.progresoTitulo}>{mensajeProgreso}</Text>
              <Text style={styles.progresoDetalle}>
                {progreso.entregados === 0
                  ? 'Registra tu primera entrega y empieza a sumar puntos.'
                  : `Has entregado ${progreso.entregados} aparato${progreso.entregados > 1 ? 's' : ''} este año.`}
              </Text>
            </View>

            <View style={styles.progresoInsignia}>
              <Ionicons name={metaCumplida ? 'trophy' : 'leaf'} size={17} color={COLORS.primaryText} />
              <Text style={styles.progresoInsigniaTexto}>{porcentaje}%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function AccionRapida({ icono, titulo, detalle, onPress }) {
  return (
    <TouchableOpacity style={styles.accionRapida} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.accionIcono}>
        <Ionicons name={icono} size={19} color={COLORS.primaryText} />
      </View>
      <Text style={styles.accionTitulo} numberOfLines={1}>
        {titulo}
      </Text>
      <Text style={styles.accionDetalle} numberOfLines={1}>
        {detalle}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingBottom: ESPACIOS.xxl },
  topbar: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: ESPACIOS.lg },
  topbarLogo: { flex: 1, alignItems: 'center' },
  logoImg: { width: 100, height: 48 },

  saludo: { marginBottom: ESPACIOS.lg },
  saludoTitulo: { ...TIPOGRAFIA.h1, fontSize: 24 },
  saludoTexto: { ...TIPOGRAFIA.small, fontSize: 13, marginTop: 5 },

  hero: {
    width: '100%',
    borderRadius: RADIOS.lg,
    padding: ESPACIOS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    ...SOMBRAS.hero,
  },
  heroIcono: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextos: { flex: 1 },
  heroTitulo: { ...TIPOGRAFIA.h4, fontSize: 16, color: COLORS.white },
  heroSub: { ...TIPOGRAFIA.micro, fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3 },
  heroFlecha: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  acciones: { flexDirection: 'row', gap: 9, marginVertical: ESPACIOS.xl },
  accionRapida: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    paddingVertical: 13,
    paddingHorizontal: 7,
    alignItems: 'center',
  },
  accionIcono: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  accionTitulo: {
    ...TIPOGRAFIA.micro,
    fontSize: 12,
    color: COLORS.inkItem,
    fontFamily: FUENTES.dmSemi,
  },
  accionDetalle: { ...TIPOGRAFIA.micro, fontSize: 10, marginTop: 2 },

  bloque: { marginBottom: ESPACIOS.xl },
  bloqueEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  bloqueTitulo: { ...TIPOGRAFIA.h4, fontSize: 15 },
  bloqueSub: { ...TIPOGRAFIA.micro, fontSize: 11, marginTop: 3 },
  verTodos: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  verTodosTexto: { ...TIPOGRAFIA.micro, fontSize: 12, fontWeight: '700', color: COLORS.primaryText },

  tarjetaMapa: {
    borderRadius: RADIOS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
  },

  progresoMeta: { ...TIPOGRAFIA.micro, fontSize: 12, color: COLORS.primaryText, fontWeight: '700' },
  tarjetaProgreso: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: ESPACIOS.lg,
  },
  barra: {
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.primarySoft,
    overflow: 'hidden',
  },
  barraRelleno: { height: '100%', borderRadius: 5, backgroundColor: COLORS.primary },
  progresoPie: { marginTop: ESPACIOS.md },
  progresoTitulo: { ...TIPOGRAFIA.micro, fontSize: 12.5, fontFamily: FUENTES.dmSemi, color: COLORS.inkItem },
  progresoDetalle: { ...TIPOGRAFIA.micro, fontSize: 11.5, marginTop: 4 },
  progresoInsignia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    marginTop: ESPACIOS.md,
    backgroundColor: COLORS.primaryPale,
    borderRadius: RADIOS.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  progresoInsigniaTexto: { ...TIPOGRAFIA.micro, fontSize: 12, fontFamily: FUENTES.dmSemi, color: COLORS.primaryText },
});