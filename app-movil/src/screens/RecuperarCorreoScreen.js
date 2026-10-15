import React, { useState } from 'react';
import { View, Text, Image, Keyboard, Pressable, StyleSheet } from 'react-native';
import Encabezado from '../components/Encabezado';
import Campo from '../components/Campo';
import Boton from '../components/Boton';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA } from '../theme';

export default function RecuperarCorreoScreen({ navigation, route }) {
  const [email, setEmail] = useState(route.params?.email || '');
  const [error, setError] = useState('');

  function continuar() {
    const correo = email.trim();
    if (!correo) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError('Escribe un correo electrónico válido.');
      return;
    }
    setError('');
    navigation.navigate('Recuperar', { email: correo });
  }

  return (
    <View style={styles.fondo}>
      <Pressable style={styles.contenido} onPress={Keyboard.dismiss}>
        <Encabezado
          onBack={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Login'))}
        />

        <View style={styles.bloque}>
          <Image
            source={require('../../assets/logoRectangular.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />

          <Text style={styles.titulo}>Recuperar contraseña</Text>
          <Text style={styles.subtitulo}>
            Ingresa el correo con el que te registraste y te enviaremos un código de 6 dígitos.
          </Text>

          <View style={styles.tarjeta}>
            <View style={styles.campo}>
              <Campo
                icono="mail-outline"
                placeholder="Correo electrónico"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (error) setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={Boolean(error)}
              />
              {error ? <Text style={styles.errorTexto}>{error}</Text> : null}
            </View>

            <Boton titulo="Recuperar" onPress={continuar} style={styles.boton} />
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

  titulo: { ...TIPOGRAFIA.h1, fontSize: 23, textAlign: 'center' },
  subtitulo: {
    ...TIPOGRAFIA.small,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
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

  boton: { marginTop: 2 },
});
