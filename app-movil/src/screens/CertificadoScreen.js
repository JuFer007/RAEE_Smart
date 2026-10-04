import React, { useState } from 'react';
import { View, Text, ScrollView, Share, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import Logo from '../components/Logo';
import QRDisplay from '../components/QRDisplay';
import { obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, TIPOGRAFIA } from '../theme';
import { formatearFechaHora } from '../utils/fecha';

export default function CertificadoScreen({ route, navigation }) {
  const { entrega, punto } = route.params || {};
  const [error, setError] = useState('');
  const info = obtenerInfoTipo(entrega?.tipoRaee);
  const nombrePunto = punto?.nombre || entrega?.puntoRecoleccionNombre || 'Punto por asignar';
  const direccionPunto = punto?.direccion || entrega?.puntoRecoleccionDireccion;
  const verificado = Boolean(entrega?.certificadoCodigoQr);

  async function compartir() {
    try {
      await Share.share({
        message: `Registré la entrega de mi ${info.nombre} en RAEE SMART. Certificado: ${
          entrega?.certificadoCodigoQr || 'en proceso'
        }`,
      });
    } catch (e) {
      setError('Tu navegador no permite compartir. Copia el código del certificado.');
    }
  }

  async function descargar() {
    if (!verificado) {
      setError('El certificado se genera cuando la entrega es confirmada');
      return;
    }
    try {
      await Print.printAsync({ html: htmlCertificado(entrega, info, nombrePunto, direccionPunto) });
    } catch (e) {
      setError('No pudimos generar el certificado en este dispositivo');
    }
  }

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Certificado de entrega" onBack={() => navigation.goBack()} />

        <View style={styles.carnet}>
          <View style={styles.carnetCabeza}>
            <Logo compacto />
            <View style={styles.verificado}>
              <Ionicons name="shield-checkmark" size={21} color={COLORS.primaryText} />
              <Text style={styles.verificadoTexto}>Verificado</Text>
            </View>
          </View>

          <QRDisplay contenido={entrega?.certificadoCodigoQr} tamano={155} />

          <View style={styles.carnetCheck}>
            <Ionicons name="checkmark-circle" size={19} color="#0B9253" />
            <Text style={styles.carnetCheckTexto}>
              {verificado ? '¡Entrega certificada!' : 'Entrega en proceso'}
            </Text>
          </View>

          <Text style={styles.datosTitulo}>Datos del certificado</Text>
          <View style={styles.datos}>
            <Dato etiqueta="Código QR" valor={entrega?.certificadoCodigoQr || 'Se genera al confirmar'} />
            <Dato etiqueta="Aparato" valor={entrega?.nombreCategoriaVisible || info.nombre} />
            <Dato etiqueta="Fecha" valor={formatearFechaHora(entrega?.fechaRegistro)} />
            <Dato etiqueta="Ubicación" valor={direccionPunto || nombrePunto} />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Boton titulo="Descargar certificado" icono="download-outline" onPress={descargar} />
        <Boton
          titulo="Compartir"
          variante="secundario"
          icono="share-social-outline"
          onPress={compartir}
        />
      </ScrollView>
    </View>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={styles.datoValor} numberOfLines={1}>
        {valor}
      </Text>
    </View>
  );
}

function htmlCertificado(entrega, info, nombrePunto, direccionPunto) {
  const filas = [
    ['Tipo de aparato', entrega.nombreCategoriaVisible || info.nombre],
    ['Categoría', info.categoria || info.nombre],
    ['Fecha de entrega', formatearFechaHora(entrega.fechaRegistro)],
    ['Punto de entrega', nombrePunto],
    ['Dirección', direccionPunto],
    ['Código de certificado', entrega.certificadoCodigoQr],
  ];

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:system-ui,sans-serif;color:#103B35;padding:32px}
    h1{font-size:20px;margin:0 0 4px}
    p.sub{color:#709087;margin:0 0 24px}
    table{width:100%;border-collapse:collapse}
    td{padding:10px 0;border-bottom:1px solid #DFE6E1;font-size:14px}
    td:last-child{text-align:right;font-weight:700}
    .pie{margin-top:28px;color:#709087;font-size:12px}
  </style></head><body>
    <h1>Certificado de entrega</h1>
    <p class="sub">RAEE Smart · Chiclayo</p>
    <table>${filas
      .filter(([, valor]) => valor)
      .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
      .join('')}</table>
    <p class="pie">Documento generado automáticamente por RAEE Smart.</p>
  </body></html>`;
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.sm, paddingBottom: ESPACIOS.xxl },
  carnet: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#DBECE3',
    borderRadius: RADIOS.lg,
    padding: 17,
    marginTop: 7,
    marginBottom: 20,
  },
  carnetCabeza: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  verificado: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verificadoTexto: { ...TIPOGRAFIA.micro, fontSize: 10, color: COLORS.primaryText },
  carnetCheck: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  carnetCheckTexto: { ...TIPOGRAFIA.small, fontSize: 13, color: '#0B9253', fontFamily: 'DMSans_600SemiBold' },
  datosTitulo: {
    ...TIPOGRAFIA.micro,
    fontSize: 10,
    color: COLORS.mutSoft,
    borderTopWidth: 1,
    borderTopColor: '#E5F0EA',
    paddingTop: 13,
    marginTop: 19,
  },
  datos: { marginTop: 10, gap: 9 },
  dato: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  datoEtiqueta: { ...TIPOGRAFIA.micro, fontSize: 10, color: COLORS.mutSoft },
  datoValor: { ...TIPOGRAFIA.micro, fontSize: 10, fontFamily: 'DMSans_600SemiBold', color: COLORS.inkItem, flexShrink: 1 },
  error: { ...TIPOGRAFIA.micro, fontSize: 11, color: COLORS.danger, marginBottom: ESPACIOS.sm },
});