import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import { DATOS_RAEE, CONSECJOS } from '../utils/contenido';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

export default function PorQueReciclarScreen({ navigation }) {
  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Por qué reciclar RAEE" onBack={() => navigation.goBack()} />

        <Text style={styles.bajada}>
          Un aparato roto no desaparece: si no se entrega, sus materiales siguen en la basura y terminan
          quemados o enterrados. Reciclar es la única forma de sacar esos metales de forma segura.
        </Text>

        <Text style={styles.seccion}>El problema en números</Text>

        <View style={styles.cifras}>
          {DATOS_RAEE.map((dato) => (
            <View key={dato.cifra} style={styles.cifra}>
              <Text style={styles.cifraValor}>{dato.cifra}</Text>
              <Text style={styles.cifraTitulo}>{dato.titulo}</Text>
              <Text style={styles.cifraDetalle}>{dato.detalle}</Text>
              <View style={styles.fuente}>
                <Ionicons name="shield-checkmark-outline" size={11} color={COLORS.mutSoft} />
                <Text style={styles.fuenteTexto}>{dato.fuente}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.seccion}>Qué puedes hacer</Text>

        <View style={styles.consejos}>
          {CONSECJOS.map((consejo) => (
            <View key={consejo.titulo} style={styles.consejo}>
              <View style={styles.consejoIcono}>
                <Ionicons name={consejo.icono} size={17} color={COLORS.primaryText} />
              </View>
              <View style={styles.consejoTextos}>
                <Text style={styles.consejoTitulo}>{consejo.titulo}</Text>
                <Text style={styles.consejoDetalle}>{consejo.detalle}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.cierre}>
          <Ionicons name="earth-outline" size={18} color={COLORS.primaryText} />
          <Text style={styles.cierreTexto}>
            Cada entrega registrada cuenta para tu certificado y para la meta de puntos del distrito. Chiclayo
            avanza cuando los residuos llegan al lugar correcto.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },

  bajada: { ...TIPOGRAFIA.micro, fontSize: 13, lineHeight: 19, marginBottom: ESPACIOS.xl },

  seccion: { ...TIPOGRAFIA.label, color: COLORS.primaryText, marginBottom: ESPACIOS.sm, marginLeft: 2 },

  cifras: { gap: 9, marginBottom: ESPACIOS.xl },
  cifra: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: 13,
  },
  cifraValor: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 24,
    lineHeight: 28,
    color: COLORS.primaryText,
  },
  cifraTitulo: { ...TIPOGRAFIA.h4, fontSize: 13.5, marginTop: 4 },
  cifraDetalle: { ...TIPOGRAFIA.micro, fontSize: 12, lineHeight: 17, marginTop: 4 },
  fuente: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 9 },
  fuenteTexto: { ...TIPOGRAFIA.micro, fontSize: 10 },

  consejos: { gap: 9, marginBottom: ESPACIOS.lg },
  consejo: {
    flexDirection: 'row',
    gap: 11,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: 12,
  },
  consejoIcono: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consejoTextos: { flex: 1 },
  consejoTitulo: { ...TIPOGRAFIA.h4, fontSize: 13.5 },
  consejoDetalle: { ...TIPOGRAFIA.micro, fontSize: 12, lineHeight: 17, marginTop: 3 },

  cierre: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.primaryPale,
    borderWidth: 1,
    borderColor: COLORS.primaryRing,
    borderRadius: RADIOS.md,
    padding: 13,
  },
  cierreTexto: { ...TIPOGRAFIA.micro, fontSize: 12, lineHeight: 17, flex: 1, color: COLORS.inkItem },
});