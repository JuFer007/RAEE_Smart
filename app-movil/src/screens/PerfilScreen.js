import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import { useAuth } from '../context/AuthContext';
import { SECCIONES_MENU } from '../utils/menu';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';

const SECCIONES = SECCIONES_MENU;

export default function PerfilScreen({ navigation }) {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <View style={styles.fondo}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <Encabezado titulo="Perfil" />

        <View style={styles.cabeza}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={34} color={COLORS.white} />
          </View>
          <View style={styles.cabezaTextos}>
            <Text style={styles.nombre}>{usuario?.nombre}</Text>
            <Text style={styles.correo}>{usuario?.email}</Text>
          </View>
        </View>

        {SECCIONES.map((seccion) => (
          <View key={seccion.titulo}>
            <Text style={styles.seccion}>{seccion.titulo}</Text>

            <View style={styles.lista}>
              {seccion.opciones.map((opcion, i) => (
                <TouchableOpacity
                  key={opcion.titulo}
                  style={[styles.fila, i === seccion.opciones.length - 1 && styles.filaUltima]}
                  activeOpacity={0.7}
                  onPress={() => (opcion.pantalla ? navigation.navigate(opcion.pantalla) : null)}
                >
                  <Ionicons name={opcion.icono} size={20} color={COLORS.primaryText} />
                  <Text style={styles.filaTitulo}>{opcion.titulo}</Text>
                  <Ionicons name="chevron-forward" size={17} color={COLORS.mutSoft} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Boton titulo="Cerrar sesión" icono="log-out-outline" onPress={cerrarSesion} />

        <Text style={styles.version}>RAEE Smart · versión 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },
  cabeza: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 22 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cabezaTextos: { flex: 1 },
  seccion: { ...TIPOGRAFIA.label, color: COLORS.primaryText, marginBottom: ESPACIOS.sm, marginLeft: 2 },
  nombre: { ...TIPOGRAFIA.h3, fontSize: 17, marginBottom: 4 },
  correo: { ...TIPOGRAFIA.micro, fontSize: 13, color: '#829B91' },
  lista: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineCard,
    borderRadius: RADIOS.md,
    paddingHorizontal: 13,
    marginBottom: ESPACIOS.xl,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineInner,
  },
  filaUltima: { borderBottomWidth: 0 },
  filaTitulo: { flex: 1, ...TIPOGRAFIA.small, fontSize: 14, color: '#285B51' },
  version: { ...TIPOGRAFIA.micro, fontSize: 10, textAlign: 'center', marginTop: ESPACIOS.lg },
});