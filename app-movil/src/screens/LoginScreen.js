import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Campo from '../components/Campo';
import Boton from '../components/Boton';
import ModalRecuperar from '../components/ModalRecuperar';
import { useAuth } from '../context/AuthContext';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

export default function LoginScreen({ navigation }) {
  const { entrarEnModoPrueba } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(true);
  const [modalRecuperar, setModalRecuperar] = useState(false);

  return (
    <View style={styles.fondo}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Encabezado onBack={() => navigation.navigate('Bienvenida')} />

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
              onPress={() => {
                entrarEnModoPrueba();
                navigation.navigate('Main');
              }}
              style={styles.boton}
            />

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
      </ScrollView>

      <ModalRecuperar
        visible={modalRecuperar}
        emailInicial={email}
        onCancelar={() => setModalRecuperar(false)}
        onEnviar={(correo) => {
          setModalRecuperar(false);
          navigation.navigate('Recuperar', { email: correo });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bg, overflow: 'hidden' },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl, flexGrow: 1 },
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
