import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Logo from '../components/Logo';
import Encabezado from '../components/Encabezado';
import Campo from '../components/Campo';
import Boton from '../components/Boton';
import { COLORS, ESPACIOS, TIPOGRAFIA } from '../theme';

export default function RegistroScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');

  function registrar() {
    if (!nombre || !email || !password) {
      setError('Completa todos los campos para continuar');
      return;
    }
    if (password !== repetir) {
      setError('Las contraseñas no coinciden');
      return;
    }
    navigation.navigate('Main');
  }

  return (
    <View style={styles.fondo}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Encabezado onBack={() => navigation.navigate('Login')} />

        <View style={styles.encabezadoAuth}>
          <Logo />
          <Text style={styles.titulo}>Crear cuenta</Text>
          <Text style={styles.subtitulo}>Forma parte del cambio desde hoy.</Text>
        </View>

        <View style={styles.tarjeta}>
          <Campo icono="person-outline" placeholder="Nombre completo" value={nombre} onChangeText={setNombre} autoCapitalize="words" />
          <Campo icono="mail-outline" placeholder="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Campo icono="lock-closed-outline" placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
          <Campo icono="lock-closed-outline" placeholder="Confirmar contraseña" value={repetir} onChangeText={setRepetir} secureTextEntry autoCapitalize="none" />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Boton titulo="Registrarme" onPress={registrar} />

          <Text style={styles.cambio}>
            ¿Ya tienes una cuenta?{' '}
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              Iniciar sesión
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bg },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingBottom: ESPACIOS.xxl, flexGrow: 1 },
  encabezadoAuth: { alignItems: 'center', paddingTop: 10, paddingBottom: 27 },
  titulo: { ...TIPOGRAFIA.h1, marginTop: 30, marginBottom: 8 },
  subtitulo: { ...TIPOGRAFIA.small, fontSize: 13 },
  tarjeta: { gap: 12 },
  error: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.danger },
  cambio: { ...TIPOGRAFIA.small, fontSize: 12, textAlign: 'center', marginTop: 5 },
  link: { color: COLORS.primaryText, fontFamily: 'DMSans_700Bold' },
});