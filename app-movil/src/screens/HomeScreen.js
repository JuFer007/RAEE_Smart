import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BotonIcono } from '../components/Encabezado';
import MapaPuntos from '../components/MapaPuntos';
import usePuntos from '../hooks/usePuntos';
import useLocation from '../hooks/useLocation';
import { useAuth } from '../context/AuthContext';
import { avisosNuevos } from '../utils/contenido';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';
import { avisosNuevosPrueba } from '../utils/usuarioPrueba';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

export default function HomeScreen({ navigation }) {
  const { usuario } = useAuth();
  const insets = useSafeAreaInsets();
  const { ubicacion } = useLocation();
  const { puntos, cargando, error } = usePuntos(ubicacion);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const nombre = (usuario?.nombre || '').trim().split(' ')[0] || 'vecino';
  const nuevos = USAR_DATOS_PRUEBA ? avisosNuevosPrueba() : avisosNuevos();
  const textoPuntos = error
    ? 'No pudimos cargar los puntos'
    : cargando && puntos.length === 0
      ? 'Cargando puntos cercanos…'
      : `${puntos.length} punto${puntos.length > 1 ? 's' : ''} disponible${puntos.length > 1 ? 's' : ''} cerca de ti`;

  function verTodos() {
    navigation.navigate('Mapa');
  }

  return (
    <View style={styles.fondo}>
      <View style={styles.contenido}>
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
            contador={nuevos}
            onPress={() => navigation.navigate('Notificaciones')}
          />
        </View>

        <View style={styles.saludo}>
          <Text style={styles.saludoTitulo}>{saludo}, {nombre}.</Text>
          <Text style={styles.saludoTexto}>Juntos por un Chiclayo más limpio</Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('CapturaFoto')}>
          <LinearGradient
            colors={[COLORS.gradA, COLORS.gradB]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.hero}
          >
            <View style={styles.heroIcono}>
              <Ionicons name="leaf" size={21} color={COLORS.white} />
            </View>

            <View style={styles.heroTextos}>
              <Text style={styles.heroTitulo}>Registrar entrega</Text>
              <Text style={styles.heroSub}>Identifica tu RAEE y obtén tu certificado digital</Text>
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
            onPress={() => navigation.navigate('CapturaFoto', { modo: 'identificar' })}
          />
          <AccionRapida
            icono="qr-code-outline"
            titulo="Certificados"
            detalle="Mis entregas"
            onPress={() => navigation.navigate('Historial')}
          />
          <AccionRapida
            icono="location-outline"
            titulo="Puntos"
            detalle="Mapa cercano"
            onPress={verTodos}
          />
        </View>

        <View style={styles.bloque}>
          <View style={styles.bloqueEncabezado}>
            <View>
              <Text style={styles.bloqueTitulo}>Puntos de acopio cercanos</Text>
              <Text style={styles.bloqueSub}>{textoPuntos}</Text>
            </View>
            <TouchableOpacity style={styles.verTodos} onPress={verTodos} activeOpacity={0.7}>
              <Text style={styles.verTodosTexto}>Ver todos</Text>
              <Ionicons name="chevron-forward" size={15} color={COLORS.primaryText} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.tarjetaMapa} activeOpacity={0.9} onPress={verTodos}>
            <MapaPuntos puntos={puntos} ubicacion={ubicacion} alto="100%" />
          </TouchableOpacity>
        </View>
      </View>
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
  contenido: { flex: 1, paddingHorizontal: ESPACIOS.page, paddingBottom: ESPACIOS.md },
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

  bloque: { flex: 1, minHeight: 0 },
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
    flex: 1,
    minHeight: 0,
    borderRadius: RADIOS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
  },
});