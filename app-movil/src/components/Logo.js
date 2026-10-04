import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, RADIOS, TIPOGRAFIA, FUENTES } from '../theme';

export default function Logo({ compacto = false, claro = false }) {
  const tam = compacto ? 31 : 48;
  const texto = compacto ? 15 : 22;

  return (
    <View style={styles.marca}>
      <View
        style={[
          styles.mark,
          {
            width: tam,
            height: tam,
            borderRadius: tam / 2,
            borderWidth: compacto ? 2 : 3,
            backgroundColor: claro ? 'rgba(255,255,255,0.12)' : '#F7FFF9',
          },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: tam * 0.72, height: tam * 0.72 }}
          resizeMode="contain"
        />
        <View
          style={[
            styles.brote,
            {
              width: compacto ? 7 : 11,
              height: compacto ? 3 : 5,
              borderRadius: 5,
              top: compacto ? -1 : -2,
              right: -1,
            },
          ]}
        />
      </View>
      <View style={styles.textos}>
        <Text
          style={{
            fontFamily: FUENTES.manrope,
            fontSize: texto,
            letterSpacing: compacto ? -0.7 : -1,
            color: claro ? COLORS.white : COLORS.inkTitle,
          }}
        >
          RAEE
        </Text>
        <Text
          style={{
            fontFamily: FUENTES.manrope,
            fontSize: texto * 0.88,
            letterSpacing: compacto ? -0.5 : -0.8,
            color: claro ? COLORS.limePale : COLORS.lime,
          }}
        >
          Smart
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  marca: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#157748',
  },
  brote: {
    position: 'absolute',
    backgroundColor: '#65BD37',
    transform: [{ rotate: '-27deg' }],
  },
  textos: { lineHeight: 0.82 },
});