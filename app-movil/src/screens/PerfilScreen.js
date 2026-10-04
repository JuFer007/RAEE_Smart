import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado, { BotonIcono } from '../components/Encabezado';
import Boton from '../components/Boton';
import { useAuth } from '../context/AuthContext';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA } from '../theme';

const OPCIONES = [
  { icono: 'person-outline', titulo: 'Datos personales' },
  { icono: 'lock-closed-outline', titulo: 'Cambiar contraseña' },
  { icono: 'notifications-outline', titulo: 'Notificaciones' },
  { icono: 'help-circle-outline', titulo: 'Soporte', pantalla: 'Ayuda' },
];

export default function PerfilScreen({ navigation }) {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <View style={styles.fondo}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <Encabezado titulo="Perfil" derecha={<BotonIcono nombre="settings-outline" size={19} />} />

        <View style={styles.cabeza}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={33} color="#297568" />
          </View>
          <View style={styles.cabezaTextos}>
            <Text style={styles.nombre}>{usuario?.nombre}</Text>
            <Text style={styles.correo}>{usuario?.email}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Ayuda')} hitSlop={8}>
            <Ionicons name="chevron-forward" size={18} color="#8BA69C" />
          </TouchableOpacity>
        </View>

        <View style={styles.lista}>
          {OPCIONES.map((opcion, i) => (
            <TouchableOpacity
              key={opcion.titulo}
              style={[styles.fila, i === OPCIONES.length - 1 && styles.filaUltima]}
              activeOpacity={0.7}
              onPress={() => (opcion.pantalla ? navigation.navigate(opcion.pantalla) : null)}
            >
              <Ionicons name={opcion.icono} size={18} color="#166F57" />
              <Text style={styles.filaTitulo}>{opcion.titulo}</Text>
              <Ionicons name="chevron-forward" size={17} color={COLORS.mutSoft} />
            </TouchableOpacity>
          ))}
        </View>

        <Boton titulo="Cerrar sesión" variante="secundario" onPress={cerrarSesion} />

        <Text style={styles.version}>RAEE Smart · versión 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.sm, paddingBottom: ESPACIOS.xxl },
  cabeza: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 22 },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E2F1EC',
    borderWidth: 3,
    borderColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SOMBRAS.avatar,
  },
  cabezaTextos: { flex: 1 },
  nombre: { ...TIPOGRAFIA.h3, marginBottom: 4 },
  correo: { ...TIPOGRAFIA.micro, fontSize: 11, color: '#829B91' },
  lista: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineCard,
    borderRadius: RADIOS.md,
    paddingHorizontal: 13,
    marginBottom: 22,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineInner,
  },
  filaUltima: { borderBottomWidth: 0 },
  filaTitulo: { flex: 1, ...TIPOGRAFIA.small, fontSize: 12, color: '#285B51' },
  version: { ...TIPOGRAFIA.micro, fontSize: 10, textAlign: 'center', marginTop: ESPACIOS.lg },
});