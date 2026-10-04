import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, TIPOGRAFIA } from '../theme';

export default function QRDisplay({ contenido, tamano = 155 }) {
  return (
    <View style={styles.zona}>
      <QRCode value={contenido || 'RAEE-SMART'} size={tamano} color={COLORS.ink} />
      {contenido ? null : <Text style={styles.pendiente}>Certificado pendiente</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  zona: { alignItems: 'center', marginVertical: 25 },
  pendiente: { ...TIPOGRAFIA.micro, color: COLORS.mutSoft, marginTop: 8 },
});