import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Boton from '../components/Boton';
import { COLORS, TIPOGRAFIA, FUENTES } from '../theme';

const BANNER_RATIO = 1801 / 873;

export default function BienvenidaScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [anchoBanner, setAnchoBanner] = useState(0);

  return (
    <LinearGradient
      colors={['#F8FFFB', '#E3F5EA']}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={[styles.fondo, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 20 }]}
    >
      <View style={styles.contenido}>
        <Image source={require('../../assets/logobienvenida.png')} style={styles.logo} resizeMode="contain" />

        <Text style={styles.tagline}>
          Dale un mejor futuro{'\n'}a tus electrónicos
        </Text>

        <View style={styles.ilustracion} onLayout={(e) => setAnchoBanner(e.nativeEvent.layout.width)}>
          {anchoBanner > 0 && (
            <Image
              source={require('../../assets/banner.png')}
              style={[styles.banner, { width: anchoBanner, height: Math.round(anchoBanner / BANNER_RATIO) }]}
              resizeMode="contain"
            />
          )}
        </View>

        <View style={styles.acciones}>
          <Boton titulo="Comenzar" onPress={() => navigation.navigate('Registro')} />
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            ¿Ya tienes una cuenta? <Text style={styles.linkFuerte}>Iniciar sesión</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, paddingHorizontal: 28, overflow: 'hidden' },
  contenido: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly' },
  logo: { width: 118, height: 142 },
  tagline: {
    fontFamily: FUENTES.dmBold,
    fontSize: 22,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: COLORS.inkTitle,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 18,
  },

  ilustracion: { alignSelf: 'stretch', flex: 1, marginHorizontal: -28, marginVertical: 12, justifyContent: 'center' },
  banner: { maxWidth: '100%' },

  acciones: { width: '100%', alignItems: 'center', gap: 16 },
  link: { ...TIPOGRAFIA.linkSoft, fontSize: 13, textAlign: 'center' },
  linkFuerte: { color: COLORS.primaryText, fontFamily: FUENTES.dmBold },
});
