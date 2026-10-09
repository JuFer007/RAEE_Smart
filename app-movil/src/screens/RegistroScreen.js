import React, { useState } from 'react';
import { View, Text, Image, Keyboard, Pressable, StyleSheet } from 'react-native';
import Encabezado from '../components/Encabezado';
import Campo from '../components/Campo';
import Boton from '../components/Boton';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

export default function RegistroScreen({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repetir, setRepetir] = useState('');
  const [telefono, setTelefono] = useState('');
  const [dni, setDni] = useState('');

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
                onChangeText={setNombre}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.campo}>
              <Campo
                icono="mail-outline"
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.fila}>
              <View style={styles.campoMitad}>
                <Campo
                  icono="call-outline"
                  placeholder="Teléfono"
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  maxLength={9}
                />
              </View>
              <View style={styles.campoMitad}>
                <Campo
                  icono="id-card-outline"
                  placeholder="DNI"
                  value={dni}
                  onChangeText={setDni}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  maxLength={8}
                />
              </View>
            </View>
            <View style={styles.campo}>
              <Campo
                icono="lock-closed-outline"
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            <View style={styles.campo}>
              <Campo
                icono="lock-closed-outline"
                placeholder="Confirmar contraseña"
                value={repetir}
                onChangeText={setRepetir}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <Boton titulo="Registrarse" onPress={() => {}} deshabilitado style={styles.boton} />

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
});
