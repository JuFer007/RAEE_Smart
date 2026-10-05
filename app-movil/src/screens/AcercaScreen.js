import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Logo from '../components/Logo';
import { APP, MUNICIPALIDAD, CREDITOS } from '../utils/contenido';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

export default function AcercaScreen({ navigation }) {
  function abrir(url) {
    Linking.openURL(url).catch(() => {});
  }

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Acerca de" onBack={() => navigation.goBack()} />

        <View style={styles.cabecera}>
          <Logo />
          <Text style={styles.nombre}>{APP.nombre}</Text>
          <Text style={styles.version}>Versión {APP.version}</Text>
          <Text style={styles.descripcion}>{APP.descripcion}</Text>
        </View>

        <Text style={styles.seccion}>Créditos</Text>
        <View style={styles.lista}>
          {CREDITOS.map((credito) => (
            <View key={credito.titulo} style={styles.fila}>
              <View style={styles.filaIcono}>
                <Ionicons name={credito.icono} size={17} color={COLORS.primaryText} />
              </View>
              <View style={styles.filaTextos}>
                <Text style={styles.filaTitulo}>{credito.titulo}</Text>
                <Text style={styles.filaDetalle}>{credito.detalle}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.seccion}>Municipalidad</Text>
        <View style={styles.muni}>
          <Text style={styles.muniNombre}>{MUNICIPALIDAD.nombre}</Text>
          <Text style={styles.muniDistrito}>{MUNICIPALIDAD.distrito}</Text>

          <TouchableOpacity
            style={styles.enlace}
            activeOpacity={0.85}
            onPress={() => abrir(MUNICIPALIDAD.sitio)}
          >
            <Ionicons name="globe-outline" size={16} color={COLORS.primaryText} />
            <Text style={styles.enlaceTexto} numberOfLines={1}>
              {MUNICIPALIDAD.sitio.replace('https://', '')}
            </Text>
            <Ionicons name="open-outline" size={14} color={COLORS.mutSoft} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.enlace}
            activeOpacity={0.85}
            onPress={() => abrir(MUNICIPALIDAD.portal)}
          >
            <Ionicons name="clipboard-outline" size={16} color={COLORS.primaryText} />
            <Text style={styles.enlaceTexto} numberOfLines={1}>
              Portal de trámites en gob.pe
            </Text>
            <Ionicons name="open-outline" size={14} color={COLORS.mutSoft} />
          </TouchableOpacity>
        </View>

        <Text style={styles.pie}>{APP.nombre} · versión {APP.version}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },

  cabecera: { alignItems: 'center', marginBottom: ESPACIOS.xl },
  nombre: { ...TIPOGRAFIA.h1, fontSize: 22, marginTop: ESPACIOS.md },
  version: { ...TIPOGRAFIA.micro, fontSize: 12, marginTop: 3 },
  descripcion: {
    ...TIPOGRAFIA.micro,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: ESPACIOS.md,
    paddingHorizontal: ESPACIOS.md,
  },

  seccion: { ...TIPOGRAFIA.label, color: COLORS.primaryText, marginBottom: ESPACIOS.sm, marginLeft: 2 },

  lista: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    paddingHorizontal: 13,
    marginBottom: ESPACIOS.xl,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineInner,
  },
  filaIcono: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaTextos: { flex: 1 },
  filaTitulo: { ...TIPOGRAFIA.small, fontSize: 12.5, color: COLORS.inkItem },
  filaDetalle: { ...TIPOGRAFIA.micro, fontSize: 11, marginTop: 3 },

  muni: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: 14,
    gap: 8,
  },
  muniNombre: { ...TIPOGRAFIA.h4, fontSize: 14 },
  muniDistrito: { ...TIPOGRAFIA.micro, fontSize: 11.5, marginTop: 3 },
  enlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: COLORS.primaryPale,
    borderRadius: RADIOS.sm,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  enlaceTexto: { ...TIPOGRAFIA.linkSoft, fontSize: 12, flex: 1 },

  pie: { ...TIPOGRAFIA.micro, fontSize: 10, textAlign: 'center', marginTop: ESPACIOS.xl },
});