import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA, FUENTES } from '../theme';

const OPCIONES = [
  { icono: 'help-circle-outline', titulo: 'Preguntas frecuentes', faq: true },
  { icono: 'call-outline', titulo: 'Contáctanos' },
  { icono: 'book-outline', titulo: 'Términos y condiciones' },
  { icono: 'lock-closed-outline', titulo: 'Política de privacidad' },
];

const FAQ = [
  {
    q: '¿Qué puedo entregar?',
    a: 'Televisores, laptops, celulares, refrigeradoras, impresoras y pequeños electrodomésticos.',
  },
  {
    q: '¿Cómo obtengo mi certificado?',
    a: 'Al registrar la entrega la app identifica el aparato y genera un certificado con código QR.',
  },
];

export default function AyudaScreen({ navigation }) {
  const [verFaq, setVerFaq] = useState(false);

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Ayuda y soporte" onBack={() => navigation.goBack()} />

        <View style={styles.rejilla}>
          {OPCIONES.map((op) => (
            <TouchableOpacity
              key={op.titulo}
              style={styles.tarjeta}
              activeOpacity={0.85}
              onPress={() => (op.faq ? setVerFaq(!verFaq) : null)}
            >
              <View style={styles.tarjetaIcono}>
                <Ionicons name={op.icono} size={24} color="#137952" />
              </View>
              <Text style={styles.tarjetaTitulo}>{op.titulo}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {verFaq ? (
          <View style={styles.faq}>
            {FAQ.map((item) => (
              <View key={item.q} style={styles.pregunta}>
                <Text style={styles.preguntaTitulo}>{item.q}</Text>
                <Text style={styles.preguntaRespuesta}>{item.a}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tarjeta: {
    width: '48%',
    flexGrow: 1,
    minHeight: 128,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 8,
  },
  tarjetaTitulo: {
    ...TIPOGRAFIA.micro,
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
    fontFamily: FUENTES.dmSemi,
    color: '#10544B',
  },
  tarjetaIcono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faq: { marginTop: 12, gap: 8 },
  pregunta: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: 12,
  },
  preguntaTitulo: { ...TIPOGRAFIA.micro, fontSize: 13, fontFamily: FUENTES.dmSemi, color: COLORS.inkItem, marginBottom: 4 },
  preguntaRespuesta: { ...TIPOGRAFIA.micro, fontSize: 12, lineHeight: 17 },
});