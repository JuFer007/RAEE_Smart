import React, { useState } from 'react';
import { View, Text, ScrollView, Share, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import QRDisplay from '../components/QRDisplay';
import { obtenerEstado, obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, TIPOGRAFIA, FUENTES } from '../theme';
import { formatearFechaHora } from '../utils/fecha';

const PASOS = [
  { clave: 'REGISTRADA', titulo: 'Registrada' },
  { clave: 'CONFIRMADA', titulo: 'Certificada' },
];

export default function CertificadoScreen({ route, navigation }) {
  const { entrega, punto } = route.params || {};
  const [error, setError] = useState('');
  const info = obtenerInfoTipo(entrega?.tipoRaee);
  const nombrePunto = punto?.nombre || entrega?.puntoRecoleccionNombre || 'Punto por asignar';
  const direccionPunto = punto?.direccion || entrega?.puntoRecoleccionDireccion;
  const verificado = Boolean(entrega?.certificadoCodigoQr);
  const nombre = entrega?.nombreCategoriaVisible || info.nombre;

  async function compartir() {
    try {
      await Share.share({
        message: `Registré la entrega de mi ${nombre} en RAEE SMART. Certificado: ${
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

        <View style={[styles.tarjetaQr, verificado ? styles.tarjetaQrOk : styles.tarjetaQrPendiente]}>
          <View style={styles.qrMarco}>
            <QRDisplay contenido={entrega?.certificadoCodigoQr} tamano={158} />
            {verificado ? (
              <View style={styles.qrInsignia}>
                <Ionicons name="checkmark" size={17} color={COLORS.white} />
              </View>
            ) : null}
          </View>

          <Text style={[styles.estado, verificado ? styles.estadoOk : styles.estadoPendiente]}>
            {verificado ? '¡Entrega certificada!' : 'Entrega en proceso'}
          </Text>
          <Text style={styles.estadoDetalle}>
            {verificado
              ? 'Este código es único y sirve para comprobar la entrega.'
              : 'Te avisaremos cuando el punto de acopio confirme la recepción.'}
          </Text>

          <View style={styles.pasos}>
            {PASOS.map((paso, i) => {
              const activo = paso.clave === 'CONFIRMADA' ? verificado : true;
              const esUltimo = i === PASOS.length - 1;
              return (
                <View key={paso.clave} style={styles.pasoFila}>
                  <View style={styles.pasoPunto}>
                    <View style={[styles.pasoCirculo, !activo && styles.pasoCirculoInactivo]}>
                      <Ionicons name={activo ? 'checkmark' : 'time-outline'} size={12} color={activo ? COLORS.white : COLORS.mutSoft} />
                    </View>
                    {!esUltimo ? <View style={[styles.pasoLinea, !activo && styles.pasoLineaInactiva]} /> : null}
                  </View>
                  <Text style={[styles.pasoTexto, !activo && styles.pasoTextoInactivo]}>{paso.titulo}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.datosTitulo}>Datos del certificado</Text>
        <View style={styles.datos}>
          <Dato icono="qr-code-outline" etiqueta="Código" valor={entrega?.certificadoCodigoQr || 'Se genera al confirmar'} mono />
          <Dato icono={info.icono} etiqueta="Aparato" valor={nombre} />
          <Dato icono="pricetag-outline" etiqueta="Categoría" valor={info.categoria} />
          <Dato icono="calendar-outline" etiqueta="Fecha" valor={formatearFechaHora(entrega?.fechaRegistro)} />
          <Dato icono="location-outline" etiqueta="Punto" valor={direccionPunto || nombrePunto} />
          <Dato icono="flag-outline" etiqueta="Estado" valor={obtenerEstado(entrega?.estado).label} ultima />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.botones}>
          <Boton
            titulo="Descargar certificado"
            icono="download-outline"
            onPress={descargar}
            deshabilitado={!verificado}
          />
          <Boton
            titulo="Compartir"
            variante="secundario"
            icono="share-social-outline"
            onPress={compartir}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function Dato({ icono, etiqueta, valor, ultima = false, mono = false }) {
  return (
    <View style={[styles.dato, !ultima && styles.datoBorde]}>
      <View style={styles.datoIcono}>
        <Ionicons name={icono} size={13} color={COLORS.primaryText} />
      </View>
      <Text style={styles.datoEtiqueta}>{etiqueta}</Text>
      <Text style={[styles.datoValor, mono && styles.datoValorMono]} numberOfLines={2}>
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
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },

  tarjetaQr: {
    alignItems: 'center',
    borderRadius: RADIOS.lg,
    borderWidth: 1,
    paddingVertical: ESPACIOS.lg,
    paddingHorizontal: ESPACIOS.lg,
    marginBottom: ESPACIOS.xl,
  },
  tarjetaQrOk: { backgroundColor: COLORS.primaryPale, borderColor: COLORS.primaryRing },
  tarjetaQrPendiente: { backgroundColor: COLORS.warningSoft, borderColor: '#F2DFB4' },

  qrMarco: { position: 'relative' },
  qrInsignia: {
    position: 'absolute',
    right: -8,
    bottom: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryBright,
    borderWidth: 3,
    borderColor: COLORS.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },

  estado: { ...TIPOGRAFIA.h3, fontSize: 17, marginTop: 12 },
  estadoOk: { color: COLORS.primaryText },
  estadoPendiente: { color: COLORS.warning },
  estadoDetalle: {
    ...TIPOGRAFIA.micro,
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'center',
    color: COLORS.mut,
    marginTop: 5,
  },

  pasos: { flexDirection: 'row', gap: ESPACIOS.xl, marginTop: ESPACIOS.lg },
  pasoFila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pasoPunto: { flexDirection: 'row', alignItems: 'center' },
  pasoCirculo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasoCirculoInactivo: { backgroundColor: COLORS.lineTab },
  pasoLinea: { width: 22, height: 2, borderRadius: 1, backgroundColor: COLORS.primary },
  pasoLineaInactiva: { backgroundColor: COLORS.lineTab },
  pasoTexto: { ...TIPOGRAFIA.micro, fontSize: 11, fontFamily: FUENTES.dmSemi, color: COLORS.inkItem },
  pasoTextoInactivo: { color: COLORS.mutSoft },

  datosTitulo: { ...TIPOGRAFIA.h4, fontSize: 14, marginBottom: 10 },
  datos: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineCard,
    borderRadius: RADIOS.md,
    paddingHorizontal: 13,
    paddingVertical: 4,
    marginBottom: ESPACIOS.lg,
  },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 11 },
  datoBorde: { borderBottomWidth: 1, borderBottomColor: COLORS.lineInner },
  datoIcono: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datoEtiqueta: { ...TIPOGRAFIA.micro, fontSize: 11.5, width: 68, color: COLORS.mut },
  datoValor: { flex: 1, ...TIPOGRAFIA.micro, fontSize: 11.5, lineHeight: 16, fontFamily: FUENTES.dmSemi, color: COLORS.inkItem },
  datoValorMono: { letterSpacing: 0.3, fontFamily: 'monospace' },

  botones: { gap: 10 },
  error: { ...TIPOGRAFIA.micro, fontSize: 12, color: COLORS.danger, marginBottom: ESPACIOS.sm },
});