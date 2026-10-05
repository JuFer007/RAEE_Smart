import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Campo from './Campo';
import Boton from './Boton';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA } from '../theme';

export default function ModalRecuperar({ visible, emailInicial = '', onCancelar, onEnviar }) {
  const [email, setEmail] = useState(emailInicial);

  useEffect(() => {
    if (visible) setEmail(emailInicial);
  }, [visible, emailInicial]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancelar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fondo}
      >
        <Pressable style={styles.overlay} onPress={onCancelar} />

        <View style={styles.centro}>
          <View style={styles.tarjeta}>
            <View style={styles.badge}>
              <Ionicons name="key-outline" size={22} color={COLORS.primaryText} />
            </View>

            <Text style={styles.titulo}>Recuperar contraseña</Text>
            <Text style={styles.subtitulo}>
              Ingresa el correo con el que te registraste y te enviaremos un código de 6 dígitos.
            </Text>

            <Campo
              icono="mail-outline"
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Boton titulo="Recuperar" onPress={() => onEnviar(email.trim())} style={styles.boton} />
            <Boton titulo="Cancelar" variante="fantasma" onPress={onCancelar} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 45, 33, 0.45)',
  },
  centro: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: ESPACIOS.page,
    pointerEvents: 'box-none',
  },
  tarjeta: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
    padding: ESPACIOS.lg,
    borderRadius: RADIOS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    ...SOMBRAS.flotante,
  },
  badge: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: RADIOS.lg,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  titulo: { ...TIPOGRAFIA.h3, fontSize: 18, textAlign: 'center' },
  subtitulo: {
    ...TIPOGRAFIA.small,
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 2,
  },
  boton: { marginTop: 4 },
});
