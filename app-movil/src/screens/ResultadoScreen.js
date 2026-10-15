import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import HojaDecor from '../components/HojaDecor';
import { Etiqueta } from '../components/Tarjeta';
import { obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

const UMBRAL_CONFIANZA = 0.7;

export default function ResultadoScreen({ route, navigation }) {
  const { entrega, modo, punto } = route.params || {};
  const info = obtenerInfoTipo(entrega?.tipoRaee);
  const confianza = Math.round((entrega?.confianzaIa || 0) * 100);
  const nombre = entrega?.nombreCategoriaVisible || info.nombre;
  const identificarSolo = modo === 'identificar';
  const bajaConfianza = (entrega?.confianzaIa || 0) < UMBRAL_CONFIANZA && !entrega?.clasificacionCorregida;

  function volverTomarFoto() {
    navigation.navigate('CapturaFoto', {
      ...(identificarSolo ? { modo: 'identificar' } : {}),
      ...(punto ? { punto } : {}),
    });
  }

  return (
    <View style={styles.fondo}>
      <HojaDecor />
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado
          titulo="Resultado de identificación"
          onBack={() => navigation.goBack()}
          derecha={
            entrega?.clasificacionCorregida ? (
              <Etiqueta texto="Corregido" color={COLORS.warning} fondo={COLORS.warningSoft} />
            ) : null
          }
        />

        <View style={styles.preview}>
          <Ionicons name={info.icono} size={96} color="#2F4650" />
        </View>

        <View style={styles.info}>
          <Text style={styles.nombre}>{nombre}</Text>
          <View style={styles.datos}>
            <Text style={styles.linea}>
              <Text style={styles.clave}>Categoría:  </Text>
              {nombre}
            </Text>
            <Text style={styles.linea}>
              <Text style={styles.clave}>Confianza:  </Text>
              <Text style={styles.valor}>{confianza}%</Text>
            </Text>
          </View>
        </View>

        {bajaConfianza ? (
          <View style={styles.aviso}>
            <Ionicons name="alert-circle-outline" size={18} color={COLORS.warning} />
            <Text style={styles.avisoTexto}>
              La confianza de la IA es baja. Confirma que la categoría es correcta o corrígela antes de continuar.
            </Text>
          </View>
        ) : null}

        <View style={styles.botones}>
          <Boton
            titulo={
              identificarSolo
                ? 'Registrar esta entrega'
                : bajaConfianza
                  ? 'Confirmar y continuar'
                  : 'Continuar'
            }
            icono={identificarSolo ? 'arrow-forward-circle-outline' : undefined}
            onPress={() => navigation.navigate('Entrega', { entrega, punto })}
          />
          <Boton
            titulo="Volver a tomar foto"
            variante="secundario"
            onPress={volverTomarFoto}
          />
          <Boton
            titulo="¿No es correcto? Corregir categoría"
            variante="enlace"
            onPress={() => navigation.navigate('Correccion', { entrega, modo, punto })}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop, overflow: 'hidden' },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },
  preview: {
    width: 156,
    height: 190,
    alignSelf: 'center',
    borderRadius: RADIOS.lg,
    backgroundColor: '#E4EEF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ESPACIOS.sm,
    marginBottom: 20,
  },
  info: { alignItems: 'center', marginBottom: 26 },
  nombre: { ...TIPOGRAFIA.h2, fontSize: 22, marginBottom: 12 },
  datos: { gap: 6 },
  linea: { ...TIPOGRAFIA.small, fontSize: 14, color: '#6D8980', textAlign: 'center' },
  clave: { color: '#345B51' },
  valor: { color: COLORS.primaryText, fontFamily: 'DMSans_700Bold' },

  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: COLORS.warningSoft,
    borderWidth: 1,
    borderColor: '#F2DFB4',
    borderRadius: RADIOS.md,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 20,
  },
  avisoTexto: { flex: 1, ...TIPOGRAFIA.small, fontSize: 12.5, lineHeight: 18, color: COLORS.warning },

  botones: { gap: 10 },
});
