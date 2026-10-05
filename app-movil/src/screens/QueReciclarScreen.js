import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA, FUENTES, TIPOS_RAEE } from '../theme';

export default function QueReciclarScreen({ navigation }) {
  const grupos = useMemo(() => {
    const mapa = new Map();
    TIPOS_RAEE.forEach((item) => {
      if (!mapa.has(item.categoria)) mapa.set(item.categoria, []);
      mapa.get(item.categoria).push(item);
    });
    return [...mapa.entries()];
  }, []);

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Qué puedo reciclar" onBack={() => navigation.goBack()} />

        <View style={styles.intro}>
          <View style={styles.introIcono}>
            <Ionicons name="leaf" size={20} color={COLORS.primaryText} />
          </View>
          <Text style={styles.introTexto}>
            Estos son los aparatos que puedes entregar en los puntos de acopio. Si no aparece en la lista,
            pregúntalo en el punto: también pueden ser reciclados.
          </Text>
        </View>

        {grupos.map(([categoria, items]) => (
          <View key={categoria} style={styles.grupo}>
            <Text style={styles.categoria}>{categoria}</Text>

            <View style={styles.tarjetas}>
              {items.map((item) => (
                <View key={item.tipo} style={styles.tarjeta}>
                  <View style={styles.tarjetaCabeza}>
                    <View style={styles.icono}>
                      <Ionicons name={item.icono} size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.nombre}>{item.nombre}</Text>
                  </View>

                  <View style={styles.ejemplos}>
                    {item.ejemplos.map((ejemplo) => (
                      <View key={ejemplo} style={styles.ejemplo}>
                        <View style={styles.punto} />
                        <Text style={styles.ejemploTexto}>{ejemplo}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.nota}>
          <Ionicons name="information-circle-outline" size={17} color={COLORS.info} />
          <Text style={styles.notaTexto}>
            Los televisores, refrigeradoras y desktops se reciben completos. Si tienen cable, incluye el cable
            para poder reciclarlos.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },

  intro: {
    flexDirection: 'row',
    gap: 11,
    backgroundColor: COLORS.primaryPale,
    borderWidth: 1,
    borderColor: COLORS.primaryRing,
    borderRadius: RADIOS.md,
    padding: 13,
    marginBottom: ESPACIOS.lg,
  },
  introIcono: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTexto: { ...TIPOGRAFIA.micro, fontSize: 12, lineHeight: 17, flex: 1, color: COLORS.inkItem },

  grupo: { marginBottom: ESPACIOS.lg },
  categoria: {
    ...TIPOGRAFIA.label,
    color: COLORS.primaryText,
    marginBottom: ESPACIOS.sm,
    marginLeft: 2,
  },
  tarjetas: { gap: 9 },

  tarjeta: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: 13,
  },
  tarjetaCabeza: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  icono: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nombre: { ...TIPOGRAFIA.h4, fontSize: 14 },

  ejemplos: { gap: 6 },
  ejemplo: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  punto: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.focus,
    marginTop: 6,
  },
  ejemploTexto: { ...TIPOGRAFIA.micro, fontSize: 12, lineHeight: 17, flex: 1 },

  nota: {
    flexDirection: 'row',
    gap: 9,
    backgroundColor: '#E4EEFD',
    borderRadius: RADIOS.md,
    padding: 12,
  },
  notaTexto: { ...TIPOGRAFIA.micro, fontSize: 11.5, lineHeight: 16, flex: 1, color: COLORS.inkItem },
});