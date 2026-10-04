import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import Boton from '../components/Boton';
import { COLORS, TIPOGRAFIA, FUENTES } from '../theme';

export default function BienvenidaScreen({ navigation }) {
  return (
    <LinearGradient colors={['#F8FFFB', '#E7F6ED']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={styles.fondo}>
      <View style={styles.orbOne} />
      <View style={styles.orbTwo} />

      <View style={styles.contenido}>
        <View style={styles.marca}>
          <Logo />
        </View>

        <LinearGradient
          colors={['#D4F2DD', '#F7FFF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ilustracion}
        >
          <View style={styles.hojaUno} />
          <View style={styles.hojaDos} />
          <Ionicons name="leaf" size={54} color="#4EB449" style={styles.hoja} />
          <Ionicons name="sync" size={82} color="#11734C" />
          <View style={styles.lineaCiudad} />
        </LinearGradient>

        <Text style={styles.eyebrow}>Gestión inteligente de residuos electrónicos</Text>
        <Text style={styles.titulo}>
          Un futuro más limpio{'\n'}
          <Text style={styles.tituloVerde}>empieza contigo.</Text>
        </Text>
        <Text style={styles.copy}>
          Identifica, entrega y dale una segunda vida a tus aparatos electrónicos.
        </Text>

        <Boton
          titulo="Comenzar"
          iconoDerecha="arrow-forward"
          onPress={() => navigation.navigate('Login')}
        />

        <Text style={styles.link} onPress={() => navigation.navigate('Registro')}>
          ¿Aún no tienes una cuenta? <Text style={styles.linkFuerte}>Regístrate</Text>
        </Text>
      </View>

      <View style={styles.hojaGrande}>
        <Ionicons name="leaf" size={100} color="#A0D86C" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 44,
    paddingBottom: 25,
    overflow: 'hidden',
  },
  orbOne: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: '#C7E9D2',
    top: -60,
    right: -58,
  },
  orbTwo: {
    position: 'absolute',
    width: 95,
    height: 95,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: '#C7E9D2',
    bottom: -30,
    left: -35,
  },
  contenido: { flex: 1, alignItems: 'center' },
  marca: { alignSelf: 'flex-start', marginBottom: 46 },
  ilustracion: {
    width: 210,
    height: 200,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 31,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D2EBDC',
  },
  hojaUno: {
    position: 'absolute',
    bottom: 35,
    left: 25,
    width: 38,
    height: 48,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#67BE52',
    opacity: 0.8,
  },
  hojaDos: {
    position: 'absolute',
    bottom: 35,
    right: 25,
    width: 38,
    height: 62,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#258C50',
    opacity: 0.8,
  },
  hoja: { position: 'absolute', top: 22, right: 45, transform: [{ rotate: '-20deg' }] },
  lineaCiudad: {
    position: 'absolute',
    bottom: 28,
    width: 135,
    height: 23,
    borderTopWidth: 4,
    borderColor: '#8DCCA0',
    borderRadius: 70,
  },
  eyebrow: { ...TIPOGRAFIA.eyebrow, marginBottom: 12, textAlign: 'center' },
  titulo: { ...TIPOGRAFIA.display, textAlign: 'center', marginBottom: 14 },
  tituloVerde: { color: '#0C9250' },
  copy: {
    ...TIPOGRAFIA.body,
    color: '#608078',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 285,
    marginBottom: 27,
  },
  link: {
    ...TIPOGRAFIA.linkSoft,
    fontSize: 12,
    marginTop: 18,
    textAlign: 'center',
  },
  linkFuerte: { color: COLORS.primaryText, fontFamily: FUENTES.dmBold },
  hojaGrande: {
    position: 'absolute',
    bottom: -30,
    right: -20,
    opacity: 0.5,
    transform: [{ rotate: '30deg' }],
  },
});