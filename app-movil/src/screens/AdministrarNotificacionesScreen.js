import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import Encabezado from '../components/Encabezado';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

export default function AdministrarNotificacionesScreen({ navigation }) {
  const [push, setPush] = useState(true);
  const [campanas, setCampanas] = useState(true);
  const [entregas, setEntregas] = useState(true);
  const [recordatorios, setRecordatorios] = useState(false);

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Administrar notificaciones" onBack={() => navigation.goBack()} />

        <View style={styles.tarjeta}>
          <View style={styles.fila}>
            <View style={styles.textos}>
              <Text style={styles.titulo}>Notificaciones push</Text>
              <Text style={styles.subtitulo}>Recibir avisos en tu dispositivo</Text>
            </View>
            <Switch value={push} onValueChange={setPush} thumbColor={push ? COLORS.white : COLORS.lineSoft} trackColor={{ false: COLORS.lineCard, true: COLORS.ink }} />
          </View>
          <View style={styles.fila}>
            <View style={styles.textos}>
              <Text style={styles.titulo}>Campañas y horarios</Text>
              <Text style={styles.subtitulo}>Actualizaciones sobre recolección</Text>
            </View>
            <Switch value={campanas} onValueChange={setCampanas} thumbColor={campanas ? COLORS.white : COLORS.lineSoft} trackColor={{ false: COLORS.lineCard, true: COLORS.ink }} />
          </View>
          <View style={styles.fila}>
            <View style={styles.textos}>
              <Text style={styles.titulo}>Estado de entregas</Text>
              <Text style={styles.subtitulo}>Confirmaciones y certificados</Text>
            </View>
            <Switch value={entregas} onValueChange={setEntregas} thumbColor={entregas ? COLORS.white : COLORS.lineSoft} trackColor={{ false: COLORS.lineCard, true: COLORS.ink }} />
          </View>
          <View style={[styles.fila, styles.filaUltima]}>
            <View style={styles.textos}>
              <Text style={styles.titulo}>Recordatorios</Text>
              <Text style={styles.subtitulo}>Recordatorios para entregar RAEE</Text>
            </View>
            <Switch value={recordatorios} onValueChange={setRecordatorios} thumbColor={recordatorios ? COLORS.white : COLORS.lineSoft} trackColor={{ false: COLORS.lineCard, true: COLORS.ink }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },
  tarjeta: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    paddingHorizontal: 16,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineInner,
    gap: 12,
  },
  filaUltima: { borderBottomWidth: 0 },
  textos: { flex: 1 },
  titulo: { ...TIPOGRAFIA.small, fontSize: 14, color: COLORS.inkItem },
  subtitulo: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.mut, marginTop: 2 },
});
