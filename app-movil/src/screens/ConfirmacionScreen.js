import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Boton from '../components/Boton';
import { obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, TIPOGRAFIA, FUENTES } from '../theme';
import { formatearFechaHora } from '../utils/fecha';

export default function ConfirmacionScreen({ route, navigation }) {
  const { entrega } = route.params || {};
  const info = obtenerInfoTipo(entrega?.tipoRaee);
  const nombre = entrega?.nombreCategoriaVisible || info.nombre;

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <View style={styles.anillo}>
          <View style={styles.circulo}>
            <Ionicons name="checkmark" size={47} color={COLORS.white} />
          </View>
        </View>

        <Text style={styles.eyebrow}>Entrega registrada</Text>
        <Text style={styles.titulo}>¡Todo listo!</Text>
        <Text style={styles.copy}>
          Tu RAEE ha sido registrado correctamente. Gracias por contribuir a un Chiclayo más sostenible.
        </Text>

        <View style={styles.resumen}>
          <Fila icono={info.icono} etiqueta="Aparato" valor={nombre} />
          <Fila
            icono="location-outline"
            etiqueta="Punto de entrega"
            valor={entrega?.puntoRecoleccionNombre || 'Por asignar'}
          />
          <Fila icono="checkmark-outline" etiqueta="Fecha" valor={formatearFechaHora(entrega?.fechaRegistro)} ultima />
        </View>

        <Boton
          titulo="Ver certificado digital"
          icono="document-text-outline"
          onPress={() => navigation.navigate('Certificado', { entrega })}
        />
        <Boton titulo="Volver al inicio" variante="secundario" onPress={() => navigation.navigate('Main')} />
      </ScrollView>
    </View>
  );
}

function Fila({ icono, etiqueta, valor, ultima = false }) {
  return (
    <View style={[styles.fila, !ultima && styles.filaBorde]}>
      <Ionicons name={icono} size={18} color={COLORS.primaryText} />
      <View style={styles.filaTextos}>
        <Text style={styles.filaEtiqueta}>{etiqueta}</Text>
        <Text style={styles.filaValor} numberOfLines={1}>
          {valor}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: {
    flexGrow: 1,
    paddingHorizontal: ESPACIOS.page,
    paddingTop: 85,
    paddingBottom: ESPACIOS.xxl,
    alignItems: 'center',
  },
  anillo: {
    padding: 12,
    borderRadius: 70,
    backgroundColor: '#E1F4E8',
    marginBottom: 23,
  },
  circulo: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#109558',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: { ...TIPOGRAFIA.eyebrow, marginBottom: 12 },
  titulo: { ...TIPOGRAFIA.display, fontSize: 27, marginTop: -3, marginBottom: 10 },
  copy: {
    ...TIPOGRAFIA.bodySm,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 24,
  },
  resumen: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineCard,
    borderRadius: RADIOS.md,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginBottom: 21,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9 },
  filaBorde: { borderBottomWidth: 1, borderBottomColor: COLORS.lineInner },
  filaTextos: { flex: 1 },
  filaEtiqueta: { ...TIPOGRAFIA.micro, fontSize: 9, color: COLORS.mutSoft },
  filaValor: {
    ...TIPOGRAFIA.micro,
    fontSize: 11,
    fontFamily: FUENTES.dmSemi,
    color: '#265B50',
    marginTop: 2,
  },
});