import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import Encabezado from '../components/Encabezado';
import Campo from '../components/Campo';
import Boton from '../components/Boton';
import { COLORS, ESPACIOS, RADIOS } from '../theme';

export default function CambiarPasswordScreen({ navigation }) {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleGuardar = async () => {
    if (!actual || !nueva || !confirmar) {
      Alert.alert('Campos incompletos', 'Completa todos los campos.');
      return;
    }
    if (nueva !== confirmar) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (nueva.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      Alert.alert('Éxito', 'Contraseña actualizada correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }, 800);
  };

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Cambiar contraseña" onBack={() => navigation.goBack()} />

        <View style={styles.tarjeta}>
          <Campo
            icono="lock-closed-outline"
            placeholder="Contraseña actual"
            value={actual}
            onChangeText={setActual}
            secureTextEntry
            autoCapitalize="none"
          />
          <Campo
            icono="lock-open-outline"
            placeholder="Nueva contraseña"
            value={nueva}
            onChangeText={setNueva}
            secureTextEntry
            autoCapitalize="none"
          />
          <Campo
            icono="shield-checkmark-outline"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChangeText={setConfirmar}
            secureTextEntry
            autoCapitalize="none"
          />
          <Boton
            titulo={cargando ? 'Guardando...' : 'Guardar cambios'}
            iconoDerecha="checkmark"
            onPress={handleGuardar}
            disabled={cargando}
          />
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
    padding: ESPACIOS.md,
    gap: ESPACIOS.sm,
  },
});
