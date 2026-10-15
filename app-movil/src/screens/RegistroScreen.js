import React, { useState, useEffect } from 'react';
import { View, Text, Image, Keyboard, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Campo from '../components/Campo';
import Boton from '../components/Boton';
import { useAuth } from '../context/AuthContext';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

export default function RegistroScreen({ navigation }) {
  const { registrar } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repetir, setRepetir] = useState('');
  const [telefono, setTelefono] = useState('');
  const [dni, setDni] = useState('');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);
  const [creada, setCreada] = useState(false);

  useEffect(() => {
    if (!creada) return undefined;
    const t = setTimeout(() => navigation.navigate('Main'), 1200);
    return () => clearTimeout(t);
  }, [creada, navigation]);

  function limpiar(campo) {
    setErrores((prev) => (prev[campo] ? { ...prev, [campo]: '' } : prev));
    setErrorGeneral('');
  }

  function validar() {
    const e = {};
    if (!nombre.trim()) e.nombre = 'Ingresa tu nombre completo.';
    if (!email.trim()) e.email = 'Ingresa tu correo electrónico.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Escribe un correo electrónico válido.';
    if (!telefono.trim()) e.telefono = 'Ingresa tu teléfono.';
    else if (!/^\d{9}$/.test(telefono.trim())) e.telefono = 'El teléfono debe tener 9 dígitos.';
    if (!dni.trim()) e.dni = 'Ingresa tu DNI.';
    else if (!/^\d{8}$/.test(dni.trim())) e.dni = 'El DNI debe tener 8 dígitos.';
    if (!password) e.password = 'Ingresa una contraseña.';
    else if (password.length < 6) e.password = 'Usa al menos 6 caracteres.';
    if (!repetir) e.repetir = 'Confirma tu contraseña.';
    else if (repetir !== password) e.repetir = 'Las contraseñas no coinciden.';
    return e;
  }

  async function enviar() {
    const e = validar();
    setErrores(e);
    setErrorGeneral('');
    if (Object.values(e).some(Boolean)) return;

    try {
      setCargando(true);
      await registrar({ nombre, email, password, telefono, dni });
      setCreada(true);
    } catch (err) {
      setErrorGeneral(err.normalizado || err.message || 'No pudimos crear tu cuenta. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <View style={styles.fondo}>
      <Pressable style={styles.envoltorio} onPress={Keyboard.dismiss}>
        <Encabezado
          onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Bienvenida'))}
        />

        <View style={styles.bloque}>
          <Image
            source={require('../../assets/logoRectangular.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />

          <Text style={styles.titulo}>Crear cuenta</Text>
          <Text style={styles.subtitulo}>Únete y dale segunda vida a tus electrónicos</Text>

          <View style={styles.tarjeta}>
            <View style={styles.campo}>
              <Campo
                icono="person-outline"
                placeholder="Nombre completo"
                value={nombre}
                onChangeText={(t) => { setNombre(t); limpiar('nombre'); }}
                autoCapitalize="words"
                error={Boolean(errores.nombre)}
              />
              {errores.nombre ? <Text style={styles.errorTexto}>{errores.nombre}</Text> : null}
            </View>
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
            <View style={styles.fila}>
              <View style={styles.campoMitad}>
                <Campo
                  icono="call-outline"
                  placeholder="Teléfono"
                  value={telefono}
                  onChangeText={(t) => { setTelefono(t.replace(/\D/g, '')); limpiar('telefono'); }}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  maxLength={9}
                  error={Boolean(errores.telefono)}
                />
                {errores.telefono ? <Text style={styles.errorTexto}>{errores.telefono}</Text> : null}
              </View>
              <View style={styles.campoMitad}>
                <Campo
                  icono="id-card-outline"
                  placeholder="DNI"
                  value={dni}
                  onChangeText={(t) => { setDni(t.replace(/\D/g, '')); limpiar('dni'); }}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  maxLength={8}
                  error={Boolean(errores.dni)}
                />
                {errores.dni ? <Text style={styles.errorTexto}>{errores.dni}</Text> : null}
              </View>
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
            <View style={styles.campo}>
              <Campo
                icono="lock-closed-outline"
                placeholder="Confirmar contraseña"
                value={repetir}
                onChangeText={(t) => { setRepetir(t); limpiar('repetir'); }}
                secureTextEntry
                autoCapitalize="none"
                error={Boolean(errores.repetir)}
              />
              {errores.repetir ? <Text style={styles.errorTexto}>{errores.repetir}</Text> : null}
            </View>

            {errorGeneral ? <Text style={styles.errorGeneral}>{errorGeneral}</Text> : null}

            <Boton
              titulo="Registrarse"
              onPress={enviar}
              deshabilitado={cargando}
              cargando={cargando}
              style={styles.boton}
            />

            <Text style={styles.cambio}>
              ¿Ya tienes una cuenta?{' '}
              <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                Iniciar sesión
              </Text>
            </Text>
          </View>

          <Text style={styles.terminos}>
            Al registrarte aceptas los{' '}
            <Text style={styles.link}>términos y condiciones</Text> y la{' '}
            <Text style={styles.link}>política de privacidad</Text>.
          </Text>
        </View>
      </Pressable>

      {creada ? (
        <View style={styles.overlay}>
          <View style={styles.successCard}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={44} color={COLORS.white} />
            </View>
            <Text style={styles.successTitulo}>Cuenta creada</Text>
            <Text style={styles.successSubtitulo}>Tu cuenta se creó correctamente. Te llevamos al inicio...</Text>
            <Boton
              titulo="Ir al inicio"
              onPress={() => navigation.navigate('Main')}
              style={styles.successBoton}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bg, overflow: 'hidden' },
  envoltorio: { flex: 1 },
  bloque: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: ESPACIOS.page,
    paddingVertical: ESPACIOS.sm,
  },

  logoImg: { width: 130, height: 52, marginBottom: ESPACIOS.sm },

  titulo: { ...TIPOGRAFIA.h1, fontSize: 24, textAlign: 'center' },
  subtitulo: {
    ...TIPOGRAFIA.small,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: ESPACIOS.sm,
    paddingHorizontal: ESPACIOS.lg,
  },

  tarjeta: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    padding: ESPACIOS.md,
    borderRadius: RADIOS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    ...SOMBRAS.flotante,
  },
  campo: { width: '100%' },
  fila: { width: '100%', flexDirection: 'row', gap: 9 },
  campoMitad: { width: '48%' },

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

  boton: { width: '100%', marginTop: 3 },
  cambio: {
    width: '100%',
    ...TIPOGRAFIA.small,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    color: COLORS.inkField,
    marginTop: 4,
  },
  link: { color: COLORS.primaryText, fontFamily: FUENTES.dmBold },

  terminos: {
    ...TIPOGRAFIA.tiny,
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: ESPACIOS.md,
    paddingHorizontal: ESPACIOS.lg,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ESPACIOS.page,
  },
  successCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: RADIOS.lg,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 22,
    gap: 12,
    ...SOMBRAS.flotante,
  },
  successCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#109558',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  successTitulo: { ...TIPOGRAFIA.h2, fontSize: 20, textAlign: 'center' },
  successSubtitulo: { ...TIPOGRAFIA.small, fontSize: 13, lineHeight: 19, textAlign: 'center', color: COLORS.mut },
  successBoton: { width: '100%', marginTop: 8 },
});
