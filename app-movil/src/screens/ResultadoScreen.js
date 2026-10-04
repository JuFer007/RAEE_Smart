import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import { Etiqueta } from '../components/Tarjeta';
import { obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

export default function ResultadoScreen({ route, navigation }) {
  const { entrega } = route.params || {};
  const info = obtenerInfoTipo(entrega?.tipoRaee);
  const confianza = Math.round((entrega?.confianzaIa || 0) * 100);
  const nombre = entrega?.nombreCategoriaVisible || info.nombre;

  return (
    <View style={styles.fondo}>
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

        <Text style={styles.centrado}>Tu aparato ha sido identificado</Text>

        <View style={styles.preview}>
          <Ionicons name={info.icono} size={96} color="#44616A" />
        </View>

        <View style={styles.info}>
          <Text style={styles.nombre}>{nombre}</Text>
          <Text style={styles.linea}>
            <Text style={styles.clave}>Categoría: </Text>
            {entrega?.clasificacionCorregida ? info.nombre : info.categoria}
          </Text>
          <Text style={styles.linea}>
            <Text style={styles.clave}>Confianza: </Text>
            <Text style={styles.valor}>{confianza}%</Text>
          </Text>
        </View>

        <Boton
          titulo="Continuar"
          iconoDerecha="arrow-forward"
          onPress={() => navigation.navigate('Entrega', { entrega })}
        />
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

        <View style={styles.nota}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#568D72" />
          <Text style={styles.notaTexto}>Identificación realizada con IA</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.sm, paddingBottom: ESPACIOS.xxl },
  centrado: { ...TIPOGRAFIA.bodySm, fontSize: 12, textAlign: 'center', marginBottom: 18 },
  preview: {
    width: 150,
    height: 177,
    alignSelf: 'center',
    borderRadius: RADIOS.lg,
    backgroundColor: '#E9F4F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },
  info: { alignItems: 'center', marginBottom: 22 },
  nombre: { ...TIPOGRAFIA.h2, marginBottom: 12 },
  linea: { ...TIPOGRAFIA.small, fontSize: 12, color: '#6D8980', marginVertical: 3 },
  clave: { color: '#345B51' },
  valor: { color: COLORS.primaryText, fontFamily: 'DMSans_700Bold' },
  nota: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 11 },
  notaTexto: { ...TIPOGRAFIA.micro, fontSize: 11, color: '#568D72' },
});