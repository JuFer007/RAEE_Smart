import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Logo from '../components/Logo';
import Encabezado from '../components/Encabezado';
import Campo from '../components/Campo';
import Boton from '../components/Boton';
import { COLORS, ESPACIOS, TIPOGRAFIA } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function entrar() {
    if (!email || !password) {
      setError('Completa tu correo y contraseña para continuar');
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
        <Encabezado onBack={() => navigation.navigate('Bienvenida')} />

        <View style={styles.encabezadoAuth}>
          <Logo />
          <Text style={styles.titulo}>Iniciar sesión</Text>
          <Text style={styles.subtitulo}>Accede para gestionar tus entregas.</Text>
        </View>

        <View style={styles.tarjeta}>
          <Campo icono="mail-outline" placeholder="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Campo icono="lock-closed-outline" placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />

          <View style={styles.checkboxLinea}>
            <View style={styles.checkbox} />
            <Text style={styles.checkboxTexto}>Recordar sesión</Text>
            <Text style={styles.linkOlvido}>¿Olvidaste tu contraseña?</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Boton titulo="Iniciar sesión" onPress={entrar} />

          <View style={styles.separador}>
            <View style={styles.linea} />
            <Text style={styles.separadorTexto}>o</Text>
            <View style={styles.linea} />
          </View>

          <Boton
            titulo="Crear cuenta"
            variante="secundario"
            icono="person-add-outline"
            onPress={() => navigation.navigate('Registro')}
          />

          <Text style={styles.demo} onPress={() => navigation.navigate('Demo')}>
            Ver todas las pantallas (demo)
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
  checkboxLinea: { flexDirection: 'row', alignItems: 'center', gap: 5, marginVertical: 8, paddingHorizontal: 2 },
  checkbox: { width: 14, height: 14, borderRadius: 4, borderWidth: 1, borderColor: COLORS.lineTab },
  checkboxTexto: { ...TIPOGRAFIA.micro, fontSize: 11, color: '#6D8982' },
  linkOlvido: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.primaryText, marginLeft: 'auto', fontFamily: 'DMSans_700Bold' },
  error: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.danger },
  separador: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 5 },
  linea: { flex: 1, height: 1, backgroundColor: '#D7E8E0' },
  separadorTexto: { ...TIPOGRAFIA.micro, fontSize: 11, color: '#8CA49C' },
  demo: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.primaryText, textAlign: 'center', marginTop: 4 },
});