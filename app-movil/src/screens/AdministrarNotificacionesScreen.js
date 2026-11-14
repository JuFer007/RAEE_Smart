import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, StyleSheet, Switch } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import * as notificacionService from '../services/notificacionService';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

const PREFERENCIAS_POR_DEFECTO = {
  push: true,
  campanas: true,
  entregas: true,
  recordatorios: false,
};

export default function AdministrarNotificacionesScreen({ navigation }) {
  const [preferencias, setPreferencias] = useState(PREFERENCIAS_POR_DEFECTO);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      const data = await notificacionService.obtenerPreferencias();
      setPreferencias({ ...PREFERENCIAS_POR_DEFECTO, ...data });
      setError('');
    } catch (err) {
      setError(err.normalizado || 'No pudimos cargar tus preferencias');
    } finally {
      setCargando(false);
    }
  }, []);

  function reintentar() {
    setCargando(true);
    setError('');
    cargar();
  }

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  async function alternar(clave, valor) {
    const anteriores = preferencias;
    const siguientes = { ...preferencias, [clave]: valor };
    setPreferencias(siguientes);
    setGuardando(true);
    try {
      const actualizadas = await notificacionService.actualizarPreferencias(siguientes);
      setPreferencias({ ...PREFERENCIAS_POR_DEFECTO, ...actualizadas });
    } catch (err) {
      setPreferencias(anteriores);
      Alert.alert(
        'No se pudo guardar',
        err.normalizado || 'Intenta nuevamente en unos segundos.',
      );
    } finally {
      setGuardando(false);
    }
  }

  const deshabilitado = cargando || guardando;

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Administrar notificaciones" onBack={() => navigation.goBack()} />

        {cargando ? <ActivityIndicator size="large" color={COLORS.primary} style={styles.cargando} /> : null}

        {error ? (
          <View style={styles.errorCaja}>
            <Text style={styles.errorTexto}>{error}</Text>
            <Boton titulo="Reintentar" variante="fantasma" ancho={false} onPress={reintentar} />
          </View>
        ) : null}

        {!cargando && !error ? (
          <View style={styles.tarjeta}>
            <View style={styles.fila}>
              <View style={styles.textos}>
                <Text style={styles.titulo}>Notificaciones push</Text>
                <Text style={styles.subtitulo}>Recibir avisos en tu dispositivo</Text>
              </View>
              <Switch
                value={preferencias.push}
                onValueChange={(valor) => alternar('push', valor)}
                disabled={deshabilitado}
                thumbColor={preferencias.push ? COLORS.white : COLORS.lineSoft}
                trackColor={{ false: COLORS.lineCard, true: COLORS.ink }}
              />
            </View>
            <View style={styles.fila}>
              <View style={styles.textos}>
                <Text style={styles.titulo}>Campañas y horarios</Text>
                <Text style={styles.subtitulo}>Actualizaciones sobre recolección</Text>
              </View>
              <Switch
                value={preferencias.campanas}
                onValueChange={(valor) => alternar('campanas', valor)}
                disabled={deshabilitado}
                thumbColor={preferencias.campanas ? COLORS.white : COLORS.lineSoft}
                trackColor={{ false: COLORS.lineCard, true: COLORS.ink }}
              />
            </View>
            <View style={styles.fila}>
              <View style={styles.textos}>
                <Text style={styles.titulo}>Estado de entregas</Text>
                <Text style={styles.subtitulo}>Confirmaciones y certificados</Text>
              </View>
              <Switch
                value={preferencias.entregas}
                onValueChange={(valor) => alternar('entregas', valor)}
                disabled={deshabilitado}
                thumbColor={preferencias.entregas ? COLORS.white : COLORS.lineSoft}
                trackColor={{ false: COLORS.lineCard, true: COLORS.ink }}
              />
            </View>
            <View style={[styles.fila, styles.filaUltima]}>
              <View style={styles.textos}>
                <Text style={styles.titulo}>Recordatorios</Text>
                <Text style={styles.subtitulo}>Recordatorios para entregar RAEE</Text>
              </View>
              <Switch
                value={preferencias.recordatorios}
                onValueChange={(valor) => alternar('recordatorios', valor)}
                disabled={deshabilitado}
                thumbColor={preferencias.recordatorios ? COLORS.white : COLORS.lineSoft}
                trackColor={{ false: COLORS.lineCard, true: COLORS.ink }}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },
  cargando: { marginTop: ESPACIOS.xxl },
  errorCaja: { alignItems: 'center', gap: ESPACIOS.md, marginTop: ESPACIOS.xl },
  errorTexto: { ...TIPOGRAFIA.small, fontSize: 12.5, textAlign: 'center', color: COLORS.mut },
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
