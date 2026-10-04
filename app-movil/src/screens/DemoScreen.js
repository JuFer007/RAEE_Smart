import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { ENTREGA_DEMO } from '../utils/mockData';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA, FUENTES } from '../theme';

const GRUPOS = [
  {
    titulo: 'Abrir la app con navbar',
    items: [
      { nombre: 'Inicio', icono: 'home-outline' },
      { nombre: 'Mapa', icono: 'map-outline' },
      { nombre: 'Historial', icono: 'time-outline' },
      { nombre: 'Perfil', icono: 'person-outline' },
    ],
  },
  {
    titulo: 'Flujo de entrega',
    items: [
      { nombre: 'CapturaFoto', icono: 'camera-outline', nota: 'Cámara con IA' },
      { nombre: 'Resultado', icono: 'scan-outline', nota: 'Resultado y confianza' },
      { nombre: 'Entrega', icono: 'location-outline', nota: 'Elegir punto de acopio' },
      { nombre: 'Confirmacion', icono: 'checkmark-circle-outline', nota: 'Entrega registrada' },
      { nombre: 'Certificado', icono: 'qr-code-outline', nota: 'QR y datos finales' },
      { nombre: 'Correccion', icono: 'create-outline', nota: 'Reclasificar categoría' },
    ],
  },
  {
    titulo: 'Otras pantallas',
    items: [{ nombre: 'Ayuda', icono: 'help-circle-outline', nota: 'Soporte y FAQ' }],
  },
];

export default function DemoScreen({ navigation }) {
  const params = { entrega: ENTREGA_DEMO, esDemo: true };

  function abrir(nombre) {
    if (['Resultado', 'Entrega', 'Confirmacion', 'Certificado', 'Correccion'].includes(nombre)) {
      navigation.navigate(nombre, params);
      return;
    }
    navigation.navigate(nombre, nombre === 'CapturaFoto' ? { esDemo: true } : undefined);
  }

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <View style={styles.marca}>
          <Logo />
        </View>

        <Text style={styles.titulo}>Ver pantallas</Text>
        <Text style={styles.subtitulo}>Datos ficticios · sin conexión al backend</Text>

        {GRUPOS.map((grupo) => (
          <View key={grupo.titulo} style={styles.grupo}>
            <Text style={styles.grupoTitulo}>{grupo.titulo}</Text>
            <View style={styles.rejilla}>
              {grupo.items.map((item) => (
                <TouchableOpacity
                  key={item.nombre}
                  style={styles.tarjeta}
                  activeOpacity={0.85}
                  onPress={() => abrir(item.nombre)}
                >
                  <Ionicons name={item.icono} size={20} color={COLORS.primary} />
                  <Text style={styles.tarjetaTitulo}>{item.nombre}</Text>
                  {item.nota ? <Text style={styles.tarjetaNota}>{item.nota}</Text> : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { padding: ESPACIOS.page, paddingBottom: ESPACIOS.xxl },
  marca: { marginBottom: ESPACIOS.xl },
  titulo: { ...TIPOGRAFIA.h1 },
  subtitulo: { ...TIPOGRAFIA.small, fontSize: 12, marginTop: 4, marginBottom: ESPACIOS.lg },
  grupo: { marginBottom: ESPACIOS.lg },
  grupoTitulo: { ...TIPOGRAFIA.label, marginBottom: 9 },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tarjeta: {
    width: '31%',
    minHeight: 86,
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: 10,
    justifyContent: 'center',
    gap: 5,
  },
  tarjetaTitulo: { ...TIPOGRAFIA.micro, fontSize: 11, fontFamily: FUENTES.dmSemi, color: COLORS.inkItem },
  tarjetaNota: { ...TIPOGRAFIA.micro, fontSize: 9, color: COLORS.mutSoft },
});