import React, { useState } from 'react';
import { View, Text, Image, Keyboard, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Campo from '../components/Campo';
import Boton from '../components/Boton';
import ModalRecuperar from '../components/ModalRecuperar';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';
import { CREDENCIALES_PRUEBA } from '../utils/usuarioPrueba';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

export default function LoginScreen({ navigation }) {
  const { iniciarSesion } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(true);
  const [modalRecuperar, setModalRecuperar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const { toast, ocultar } = useToast();

  function validar() {
    const correo = email.trim();
    if (!correo && !password) return 'Ingresa tu correo y tu contraseña.';
    if (!correo) return 'Ingresa tu correo electrónico.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'Escribe un correo electrónico válido.';
    if (!password) return 'Ingresa tu contraseña.';
    return null;
  }

  async function entrar() {
    const mensaje = validar();
    if (mensaje) {
      toast.warning(mensaje);
      return;
    }

    try {
      setCargando(true);
      await iniciarSesion(email.trim(), password);
      navigation.navigate('Main');
    } catch (e) {
      toast.error(e.normalizado || e.message || 'Intenta nuevamente en unos segundos.');
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
            <Campo
              icono="mail-outline"
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Campo
              icono="lock-closed-outline"
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

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

              <Text style={styles.olvido} onPress={() => setModalRecuperar(true)}>
                ¿Olvidaste tu contraseña?
              </Text>
            </View>

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

      <ModalRecuperar
        visible={modalRecuperar}
        emailInicial={email}
        onCancelar={() => setModalRecuperar(false)}
        onEnviar={(correo) => {
          setModalRecuperar(false);
          navigation.navigate('Recuperar', { email: correo });
        }}
      />

      <Toast
        visible={toast.visible}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={ocultar}
        duracion={toast.duracion}
        accionTexto={toast.accionTexto}
        onAccion={toast.onAccion}
      />
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
