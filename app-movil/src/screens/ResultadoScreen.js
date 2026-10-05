import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import HojaDecor from '../components/HojaDecor';
import { Etiqueta } from '../components/Tarjeta';
import { obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

export default function ResultadoScreen({ route, navigation }) {
  const { entrega } = route.params || {};
  const info = obtenerInfoTipo(entrega?.tipoRaee);
  const confianza = Math.round((entrega?.confianzaIa || 0) * 100);
  const nombre = entrega?.nombreCategoriaVisible || info.nombre;

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
              {entrega?.clasificacionCorregida ? info.nombre : info.categoria}
            </Text>
            <Text style={styles.linea}>
              <Text style={styles.clave}>Confianza:  </Text>
              <Text style={styles.valor}>{confianza}%</Text>
            </Text>
          </View>
        </View>

        <View style={styles.botones}>
          <Boton titulo="Continuar" onPress={() => navigation.navigate('Entrega', { entrega })} />
          <Boton
            titulo="Volver a tomar foto"
            variante="secundario"
            onPress={() => navigation.navigate('CapturaFoto')}
          />
          <Boton
            titulo="¿No es correcto? Corregir categoría"
            variante="enlace"
            onPress={() => navigation.navigate('Correccion', { entrega })}
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
  botones: { gap: 10 },
});
