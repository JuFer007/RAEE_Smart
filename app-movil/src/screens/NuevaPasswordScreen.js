import React, { useState } from 'react';
import { View, Text, Image, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import Encabezado from '../components/Encabezado';
import Campo from '../components/Campo';
import Boton from '../components/Boton';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

export default function NuevaPasswordScreen({ navigation, route }) {
  const [password, setPassword] = useState('');
  const [repetir, setRepetir] = useState('');

  const codigo = route.params?.codigo || '';
  const codigoOculto = codigo
    ? `${'\u2022'.repeat(Math.max(codigo.length - 2, 0))}${codigo.slice(-2)}`
    : '\u2014\u2014\u2014\u2014\u2014\u2014';

  return (
    <View style={styles.fondo}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.envoltorio}
      >
        <Encabezado onBack={() => navigation.navigate('Recuperar')} />

        <View style={styles.bloque}>
          <Image
            source={require('../../assets/logoRectangular.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />

          <Text style={styles.titulo}>Nueva contraseña</Text>
          <Text style={styles.subtitulo}>Define la contraseña que usarás para entrar a RAEE Smart</Text>

          <View style={styles.tarjeta}>
            <View style={styles.codigoCaja}>
              <Text style={styles.codigoEtiqueta}>Código verificado</Text>
              <Text style={styles.codigo}>{codigoOculto}</Text>
            </View>

            <View style={styles.campo}>
              <Campo
                icono="lock-closed-outline"
                placeholder="Nueva contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.campo}>
              <Campo
                icono="shield-checkmark-outline"
                placeholder="Confirmar contraseña"
                value={repetir}
                onChangeText={setRepetir}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <Boton
              titulo="Guardar contraseña"
              iconoDerecha="checkmark"
              onPress={() => navigation.navigate('Login')}
              style={styles.boton}
            />
          </View>

          <Text style={styles.volver} onPress={() => navigation.navigate('Recuperar')}>
            ¿El código es incorrecto? Solicitar otro
          </Text>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: ESPACIOS.md,
  },

  logoImg: { width: 148, height: 54, marginBottom: ESPACIOS.lg },

  titulo: { ...TIPOGRAFIA.h1, fontSize: 23, textAlign: 'center' },
  subtitulo: {
    ...TIPOGRAFIA.small,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: ESPACIOS.lg,
    paddingHorizontal: ESPACIOS.md,
  },

  tarjeta: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 10,
    padding: ESPACIOS.md,
    borderRadius: RADIOS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    ...SOMBRAS.flotante,
  },
  campo: { width: '100%' },

  codigoCaja: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ESPACIOS.sm,
    paddingVertical: 9,
    paddingHorizontal: ESPACIOS.md,
    marginBottom: 2,
    borderRadius: RADIOS.md,
    backgroundColor: COLORS.primaryPale,
    borderWidth: 1,
    borderColor: COLORS.primaryRing,
  },
  codigoEtiqueta: { ...TIPOGRAFIA.micro, fontSize: 10.5, color: COLORS.primaryText },
  codigo: { fontFamily: FUENTES.manrope, fontSize: 14, color: COLORS.primaryDeep, letterSpacing: 2 },

  boton: { width: '100%', marginTop: 3 },

  volver: {
    ...TIPOGRAFIA.small,
    fontSize: 12,
    color: COLORS.mut,
    textAlign: 'center',
    marginTop: ESPACIOS.lg,
  },
});
