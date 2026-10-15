import React, { useState } from 'react';
import { View, Text, Image, Keyboard, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Campo from '../components/Campo';
import Boton from '../components/Boton';
import { useAuth } from '../context/AuthContext';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';
import { CREDENCIALES_PRUEBA } from '../utils/usuarioPrueba';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

export default function LoginScreen({ navigation }) {
  const { iniciarSesion } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');

  function limpiar(campo) {
    setErrores((prev) => (prev[campo] ? { ...prev, [campo]: '' } : prev));
    setErrorGeneral('');
  }

  function validar() {
    const e = {};
    const correo = email.trim();
    if (!correo) e.email = 'Ingresa tu correo electrónico.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) e.email = 'Escribe un correo electrónico válido.';
    if (!password) e.password = 'Ingresa tu contraseña.';
    return e;
  }

  async function entrar() {
    const e = validar();
    setErrores(e);
    setErrorGeneral('');
    if (Object.values(e).some(Boolean)) return;

    try {
      setCargando(true);
      await iniciarSesion(email.trim(), password);
      navigation.navigate('Main');
    } catch (err) {
      setErrorGeneral(err.normalizado || err.message || 'Intenta nuevamente en unos segundos.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.fondo}>
      <Pressable style={styles.contenido} onPress={Keyboard.dismiss}>
        <Encabezado
          onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Bienvenida'))}
        />

        <View style={styles.bloque}>
          <Image
            source={require('../../assets/logoRectangular.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />

          <Text style={styles.titulo}>Iniciar sesión</Text>
          <Text style={styles.subtitulo}>Entra y sigue dando segunda vida a tus electrónicos</Text>

          <View style={styles.tarjeta}>
            <View style={styles.campo}>
              <Campo
                icono="mail-outline"
                placeholder="Correo electrónico"
                value={email}
                onChangeText={(t) => { setEmail(t); limpiar('email'); }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={Boolean(errores.email)}
              />
              {errores.email ? <Text style={styles.errorTexto}>{errores.email}</Text> : null}
            </View>
            <View style={styles.campo}>
              <Campo
                icono="lock-closed-outline"
                placeholder="Contraseña"
                value={password}
                onChangeText={(t) => { setPassword(t); limpiar('password'); }}
                secureTextEntry
                autoCapitalize="none"
                error={Boolean(errores.password)}
              />
              {errores.password ? <Text style={styles.errorTexto}>{errores.password}</Text> : null}
            </View>

            <View style={styles.filaRecordar}>
              <TouchableOpacity
                style={styles.checkboxLinea}
                onPress={() => setRecordar(!recordar)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, recordar && styles.checkboxOn]}>
                  {recordar ? <Ionicons name="checkmark" size={12} color={COLORS.white} /> : null}
                </View>
                <Text style={styles.checkboxTexto}>Recordar sesión</Text>
              </TouchableOpacity>

              <Text style={styles.olvido} onPress={() => navigation.navigate('RecuperarCorreo', { email })}>
                ¿Olvidaste tu contraseña?
              </Text>
            </View>

            {errorGeneral ? <Text style={styles.errorGeneral}>{errorGeneral}</Text> : null}

            <Boton
              titulo="Iniciar sesión"
              onPress={entrar}
              deshabilitado={cargando}
              style={styles.boton}
            />

            {USAR_DATOS_PRUEBA ? (
              <Text style={styles.prueba}>
                Cuenta de prueba: {CREDENCIALES_PRUEBA.email} · {CREDENCIALES_PRUEBA.password}
              </Text>
            ) : null}

            <View style={styles.separador}>
              <View style={styles.linea} />
              <View style={styles.separadorO}>
                <Text style={styles.separadorTexto}>o</Text>
              </View>
              <View style={styles.linea} />
            </View>

            <Boton
              titulo="Crear cuenta"
              variante="secundario"
              icono="person-outline"
              onPress={() => navigation.navigate('Registro')}
            />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bg, overflow: 'hidden' },
  contenido: { flex: 1, paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md },
  bloque: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },

  logoImg: { width: 130, height: 63, marginBottom: ESPACIOS.md },

  titulo: { ...TIPOGRAFIA.h1, fontSize: 24, textAlign: 'center' },
  subtitulo: {
    ...TIPOGRAFIA.small,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: ESPACIOS.md,
    paddingHorizontal: ESPACIOS.lg,
  },

  tarjeta: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 12,
    padding: ESPACIOS.md,
    borderRadius: RADIOS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    ...SOMBRAS.flotante,
  },

  campo: { width: '100%' },
  errorTexto: {
    ...TIPOGRAFIA.micro,
    fontSize: 10.5,
    color: COLORS.danger,
    marginTop: 3,
    marginLeft: 4,
  },
  errorGeneral: {
    width: '100%',
    ...TIPOGRAFIA.small,
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.danger,
    textAlign: 'center',
  },

  filaRecordar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ESPACIOS.sm,
  },
  checkboxLinea: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.lineTab,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  checkboxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxTexto: { ...TIPOGRAFIA.small, fontSize: 12.5, color: '#4F6F67' },
  olvido: { ...TIPOGRAFIA.link, fontSize: 12 },

  boton: { marginTop: 2 },
  prueba: { ...TIPOGRAFIA.micro, fontSize: 10.5, color: '#869E95', textAlign: 'center' },

  separador: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linea: { flex: 1, height: 1, backgroundColor: COLORS.lineCard },
  separadorO: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.lineCard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  separadorTexto: { fontFamily: FUENTES.dm, fontSize: 11, color: COLORS.mutSoft },
});
