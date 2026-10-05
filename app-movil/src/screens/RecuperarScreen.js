import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import ModalRecuperar from '../components/ModalRecuperar';
import { COLORS, ESPACIOS, RADIOS, SOMBRAS, TIPOGRAFIA, FUENTES } from '../theme';

const CANTIDAD = 6;

function ocultarEmail(correo) {
  const [usuario, dominio] = correo.split('@');
  if (!dominio) return correo;
  return `${usuario.slice(0, 2)}***@${dominio}`;
}

export default function RecuperarScreen({ navigation, route }) {
  const [email, setEmail] = useState(route.params?.email || '');
  const [codigo, setCodigo] = useState(Array(CANTIDAD).fill(''));
  const [modalCorreo, setModalCorreo] = useState(false);
  const refs = useRef([]);

  useEffect(() => {
    const t = setTimeout(() => refs.current[0]?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  function repartir(texto, desde) {
    const digitos = texto.replace(/\D/g, '').slice(0, CANTIDAD - desde).split('');
    if (!digitos.length) return;

    setCodigo((prev) => {
      const nuevo = [...prev];
      digitos.forEach((d, i) => {
        nuevo[desde + i] = d;
      });
      return nuevo;
    });

    const siguiente = Math.min(desde + digitos.length, CANTIDAD - 1);
    setTimeout(() => refs.current[siguiente]?.focus(), 10);
  }

  function cambiar(indice, texto) {
    if (texto.length > 1) {
      repartir(texto, indice);
      return;
    }

    const digito = texto.replace(/\D/g, '').slice(-1);
    setCodigo((prev) => {
      const nuevo = [...prev];
      nuevo[indice] = digito;
      return nuevo;
    });

    if (digito && indice < CANTIDAD - 1) {
      refs.current[indice + 1]?.focus();
    }
  }

  function alPulsarTecla(indice, evento) {
    if (evento.nativeEvent.key !== 'Backspace') return;
    if (codigo[indice] || indice === 0) return;

    refs.current[indice - 1]?.focus();
    setCodigo((prev) => {
      const nuevo = [...prev];
      nuevo[indice - 1] = '';
      return nuevo;
    });
  }

  const completo = codigo.every((d) => d !== '');

  return (
    <View style={styles.fondo}>
      <View style={styles.envoltorio}>
        <Encabezado onBack={() => navigation.navigate('Login')} />

        <View style={styles.bloque}>
          <Image
            source={require('../../assets/logoRectangular.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />

          <Text style={styles.titulo}>Recuperar contraseña</Text>
          <Text style={styles.subtitulo}>
            {email
              ? 'Ingresa el código de 6 dígitos que enviamos a tu correo'
              : 'Ingresa el código de 6 dígitos para continuar'}
          </Text>

          <View style={styles.tarjeta}>
            <TouchableOpacity
              style={styles.destino}
              activeOpacity={0.7}
              onPress={() => setModalCorreo(true)}
            >
              <Ionicons name="mail-outline" size={15} color={COLORS.primaryText} />
              <Text style={styles.destinoTexto} numberOfLines={1}>
                {email ? ocultarEmail(email) : 'Sin correo definido'}
              </Text>
              <Text style={styles.destinoCambiar}>Cambiar</Text>
            </TouchableOpacity>

            <View style={styles.cajas}>
              {codigo.map((digito, i) => (
                <View key={i} style={[styles.caja, digito !== '' && styles.cajaLlena]}>
                  <TextInput
                    ref={(el) => {
                      refs.current[i] = el;
                    }}
                    value={digito}
                    onChangeText={(t) => cambiar(i, t)}
                    onKeyPress={(e) => alPulsarTecla(i, e)}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={CANTIDAD}
                    selectTextOnFocus
                    style={styles.input}
                  />
                </View>
              ))}
            </View>

            <Boton
              titulo="Verificar código"
              variante={completo ? 'primario' : 'fantasma'}
              onPress={() => navigation.navigate('NuevaPassword', { codigo: codigo.join(''), email })}
              style={styles.boton}
            />

            <TouchableOpacity style={styles.reenviar} activeOpacity={0.7}>
              <Ionicons name="mail-outline" size={15} color={COLORS.primaryText} />
              <Text style={styles.reenviarTexto}>¿No recibiste el código? Reenviar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.volver}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.volverTexto}>Volver a iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ModalRecuperar
        visible={modalCorreo}
        emailInicial={email}
        onCancelar={() => setModalCorreo(false)}
        onEnviar={(correo) => {
          setModalCorreo(false);
          setEmail(correo);
          setCodigo(Array(CANTIDAD).fill(''));
          setTimeout(() => refs.current[0]?.focus(), 150);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bg, overflow: 'hidden' },
  envoltorio: { flex: 1, paddingHorizontal: ESPACIOS.page },

  bloque: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%', paddingBottom: ESPACIOS.md },
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
    gap: 14,
    padding: ESPACIOS.lg,
    borderRadius: RADIOS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    ...SOMBRAS.flotante,
  },

  destino: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: ESPACIOS.md,
    borderRadius: RADIOS.md,
    backgroundColor: COLORS.primaryPale,
    borderWidth: 1,
    borderColor: COLORS.primaryRing,
  },
  destinoTexto: { ...TIPOGRAFIA.small, fontSize: 12.5, color: COLORS.primaryDeep, flex: 1 },
  destinoCambiar: { ...TIPOGRAFIA.link, fontSize: 11.5 },

  cajas: { flexDirection: 'row', justifyContent: 'center', gap: ESPACIOS.sm },
  caja: {
    width: 44,
    height: 54,
    borderRadius: RADIOS.md,
    borderWidth: 1.5,
    borderColor: COLORS.lineTab,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cajaLlena: { borderColor: COLORS.primary, backgroundColor: COLORS.surface },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontFamily: FUENTES.manrope,
    fontSize: 22,
    color: COLORS.inkTitle,
    padding: 0,
  },

  boton: { marginTop: 2 },

  reenviar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 2 },
  reenviarTexto: { ...TIPOGRAFIA.linkSoft, fontSize: 12, color: COLORS.primaryText, fontFamily: FUENTES.dmMed },

  volver: { marginTop: ESPACIOS.lg, paddingVertical: ESPACIOS.xs },
  volverTexto: { ...TIPOGRAFIA.small, fontSize: 12.5, textAlign: 'center', color: COLORS.mut },
});
