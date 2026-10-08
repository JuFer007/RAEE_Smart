import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import { useAuth } from '../context/AuthContext';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';
import * as ImagePicker from 'expo-image-picker';

export default function FotoPerfilScreen({ navigation }) {
  const { usuario } = useAuth();
  const [foto, setFoto] = useState(null);

  const solicitarPermisos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Necesitamos acceso a tu galería para seleccionar una foto.');
      return false;
    }
    return true;
  };

  const seleccionarFoto = async () => {
    const tienePermiso = await solicitarPermisos();
    if (!tienePermiso) return;
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  };

  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Necesitamos acceso a la cámara para tomar una foto.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  };

  const guardarFoto = () => {
    Alert.alert('Éxito', 'Foto de perfil actualizada.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Foto de perfil" onBack={() => navigation.goBack()} />

        <View style={styles.cabeza}>
          <View style={styles.avatar}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.foto} />
            ) : (
              <Ionicons name="person" size={48} color={COLORS.white} />
            )}
          </View>
          <Text style={styles.nombre}>{usuario?.nombre || 'Usuario'}</Text>
        </View>

        <View style={styles.tarjeta}>
          <TouchableOpacity style={styles.opcion} onPress={seleccionarFoto} activeOpacity={0.7}>
            <View style={styles.icono}>
              <Ionicons name="images-outline" size={20} color={COLORS.primaryText} />
            </View>
            <Text style={styles.opcionTexto}>Seleccionar desde galería</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.mutSoft} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.opcion, styles.opcionUltima]} onPress={tomarFoto} activeOpacity={0.7}>
            <View style={styles.icono}>
              <Ionicons name="camera-outline" size={20} color={COLORS.primaryText} />
            </View>
            <Text style={styles.opcionTexto}>Tomar foto</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.mutSoft} />
          </TouchableOpacity>
        </View>

        <Boton titulo="Guardar foto" iconoDerecha="checkmark" onPress={guardarFoto} disabled={!foto} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },
  cabeza: { alignItems: 'center', marginTop: 8, marginBottom: 28 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  foto: { width: '100%', height: '100%' },
  nombre: { ...TIPOGRAFIA.h3, fontSize: 18 },
  tarjeta: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    paddingHorizontal: 13,
    marginBottom: ESPACIOS.lg,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineInner,
  },
  opcionUltima: { borderBottomWidth: 0 },
  icono: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcionTexto: { flex: 1, ...TIPOGRAFIA.small, fontSize: 14, color: COLORS.inkItem },
});
