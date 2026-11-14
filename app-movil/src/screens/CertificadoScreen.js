import React, { useCallback, useState } from 'react';
import { View, Text, Share, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Encabezado from '../components/Encabezado';
import Boton from '../components/Boton';
import QRDisplay from '../components/QRDisplay';
import * as entregaService from '../services/entregaService';
import * as certificadoService from '../services/certificadoService';
import { obtenerEstado, obtenerInfoTipo, COLORS, ESPACIOS, RADIOS, TIPOGRAFIA, FUENTES } from '../theme';
import { formatearFechaHora } from '../utils/fecha';
import { USAR_DATOS_PRUEBA } from '../utils/datosPrueba';

const PASOS = [
  { clave: 'REGISTRADA', titulo: 'Registrada' },
  { clave: 'EN_PROCESO', titulo: 'En proceso' },
  { clave: 'CONFIRMADA', titulo: 'Certificada' },
];

const CODIGO_PRUEBA = 'RAEE-PRUEBA-CHC-000001';

export default function CertificadoScreen({ route, navigation }) {
  const { entrega, punto } = route.params || {};
  const entregaId = entrega?.id;
  const [entregaActual, setEntregaActual] = useState(entrega);
  const [certificado, setCertificado] = useState(null);
  const [cargando, setCargando] = useState(!USAR_DATOS_PRUEBA && Boolean(entregaId));
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    if (!entregaId || USAR_DATOS_PRUEBA) return;

    try {
      const actual = await entregaService.obtenerEntrega(entregaId);
      setEntregaActual(actual);
      setError('');

      if (actual.estado === 'CONFIRMADA') {
        try {
          setCertificado(await certificadoService.obtenerPorEntrega(entregaId));
        } catch (err) {
          if (!certificadoService.esNoEncontrado(err)) throw err;
          setCertificado(null);
        }
      } else {
        setCertificado(null);
      }
    } catch (err) {
      setError(err.normalizado || 'No pudimos consultar el estado del certificado');
    } finally {
      setCargando(false);
    }
  }, [entregaId]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  function actualizar() {
    setCargando(true);
    setError('');
    cargar();
  }

  const info = obtenerInfoTipo(entregaActual?.tipoRaee);
  const estado = entregaActual?.estado;
  const confirmada = estado === 'CONFIRMADA';
  const rechazada = estado === 'RECHAZADA';
  const nombrePunto =
    entregaActual?.puntoRecoleccionNombre || certificado?.puntoEntregaNombre || punto?.nombre || 'Punto por asignar';
  const direccionPunto = entregaActual?.puntoRecoleccionDireccion || punto?.direccion || nombrePunto;
  const codigoHash = certificado?.codigoHash || (USAR_DATOS_PRUEBA && confirmada ? CODIGO_PRUEBA : '');
  const codigoQr =
    certificado?.codigoQr ||
    entregaActual?.certificadoCodigoQr ||
    (USAR_DATOS_PRUEBA && confirmada ? CODIGO_PRUEBA : '');
  const fecha = certificado?.fechaEntrega || entregaActual?.fechaRegistro;
  const verificado = confirmada && Boolean(codigoHash) && Boolean(codigoQr);
  const nivel = confirmada ? 2 : estado === 'EN_PROCESO' ? 1 : 0;

  async function compartir() {
    if (!verificado) {
      setError('El certificado se genera cuando la entrega es confirmada');
      return;
    }
    try {
      await Share.share({
        message:
          `Certificado de entrega RAEE Smart\n` +
          `Categoría: ${certificado?.nombreCategoria || entregaActual?.nombreCategoriaVisible || info.nombre}\n` +
          `Fecha: ${formatearFechaHora(fecha)}\n` +
          `Punto: ${direccionPunto}\n` +
          `Código: ${codigoHash}`,
      });
    } catch (_e) {
      setError('No pudimos compartir el certificado en este dispositivo');
    }
  }

  async function descargar() {
    if (!verificado) {
      setError('El certificado se genera cuando la entrega es confirmada');
      return;
    }
    try {
      const html = htmlCertificado(
        certificado?.nombreCategoria || entregaActual?.nombreCategoriaVisible || info.nombre,
        fecha,
        nombrePunto,
        direccionPunto,
        codigoHash,
      );
      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
        return;
      }
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Certificado de entrega',
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (_e) {
      setError('No pudimos generar el certificado en este dispositivo');
    }
  }

  return (
    <View style={styles.fondo}>
      <View style={styles.contenido}>
        <Encabezado titulo="Certificado de entrega" onBack={() => navigation.goBack()} />

        <View style={styles.cuerpo}>
          <View
            style={[
              styles.tarjetaQr,
              verificado
                ? styles.tarjetaQrOk
                : rechazada
                  ? styles.tarjetaQrRechazada
                  : styles.tarjetaQrPendiente,
            ]}
          >
            <View style={styles.qrMarco}>
              {verificado ? (
                <>
                  <QRDisplay contenido={codigoQr} tamano={110} />
                  <View style={styles.qrInsignia}>
                    <Ionicons name="checkmark" size={13} color={COLORS.white} />
                  </View>
                </>
              ) : (
                <View style={styles.qrPendiente}>
                  <Ionicons
                    name={rechazada ? 'close-circle-outline' : 'hourglass-outline'}
                    size={40}
                    color={rechazada ? COLORS.danger : COLORS.warning}
                  />
                  <Text style={styles.qrPendienteTexto}>
                    {rechazada
                      ? 'La entrega fue rechazada por el punto de acopio'
                      : 'Tu certificado se generará aquí cuando el punto confirme la entrega'}
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.estado,
                verificado ? styles.estadoOk : rechazada ? styles.estadoRechazado : styles.estadoPendiente,
              ]}
            >
              {verificado
                ? '¡Entrega certificada!'
                : rechazada
                  ? 'Entrega rechazada'
                  : cargando
                    ? 'Consultando estado...'
                    : 'Pendiente de confirmación'}
            </Text>
            <Text style={styles.estadoDetalle}>
              {verificado
                ? 'Este código es único y sirve para comprobar la entrega.'
                : rechazada
                  ? 'Acércate al punto de acopio para más información.'
                  : 'Te avisaremos cuando el punto de acopio confirme la recepción.'}
            </Text>

            {!rechazada ? (
              <View style={styles.pasos}>
                {PASOS.map((paso, i) => {
                  const activo = i <= nivel;
                  const esUltimo = i === PASOS.length - 1;
                  return (
                    <View key={paso.clave} style={styles.pasoFila}>
                      <View style={styles.pasoPunto}>
                        <View style={[styles.pasoCirculo, !activo && styles.pasoCirculoInactivo]}>
                          <Ionicons
                            name={activo ? 'checkmark' : 'time-outline'}
                            size={12}
                            color={activo ? COLORS.white : COLORS.mutSoft}
                          />
                        </View>
                        {!esUltimo ? (
                          <View style={[styles.pasoLinea, i >= nivel && styles.pasoLineaInactiva]} />
                        ) : null}
                      </View>
                      <Text style={[styles.pasoTexto, !activo && styles.pasoTextoInactivo]}>{paso.titulo}</Text>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>

          {cargando ? <ActivityIndicator color={COLORS.primary} style={styles.cargando} /> : null}

          <Text style={styles.datosTitulo}>Datos del certificado</Text>
          <View style={styles.datos}>
            <Dato
              icono="qr-code-outline"
              etiqueta="Código"
              valor={codigoHash || (rechazada ? 'No disponible' : 'Se genera al confirmar')}
              mono
            />
            <Dato
              icono={info.icono}
              etiqueta="Categoría"
              valor={certificado?.nombreCategoria || entregaActual?.nombreCategoriaVisible || info.nombre}
            />
            <Dato icono="calendar-outline" etiqueta="Fecha" valor={formatearFechaHora(fecha)} />
            <Dato icono="location-outline" etiqueta="Punto" valor={direccionPunto} />
            <Dato icono="flag-outline" etiqueta="Estado" valor={obtenerEstado(estado).label} ultima />
          </View>

          {!USAR_DATOS_PRUEBA && entrega?.id ? (
            <Boton
              titulo="Actualizar estado"
              variante="fantasma"
              icono="refresh-outline"
              onPress={actualizar}
              cargando={cargando}
            />
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.botones}>
          <View style={styles.filaBotones}>
            <View style={styles.botonMitad}>
              <Boton
                titulo="Compartir certificado"
                icono="share-social-outline"
                onPress={compartir}
                deshabilitado={!verificado}
                style={styles.botonCompacto}
              />
            </View>
            <View style={styles.botonMitad}>
              <Boton
                titulo="Descargar certificado"
                variante="fantasma"
                icono="download-outline"
                onPress={descargar}
                deshabilitado={!verificado}
                style={[styles.botonCompacto, styles.botonDescarga]}
              />
            </View>
          </View>
          <Boton
            titulo="Volver al inicio"
            variante="secundario"
            icono="home-outline"
            onPress={() => navigation.navigate('Main', { screen: 'Inicio' })}
          />
        </View>
      </View>
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

function htmlCertificado(nombreCategoria, fecha, nombrePunto, direccionPunto, codigoHash) {
  const filas = [
    ['Categoría', nombreCategoria],
    ['Fecha de entrega', formatearFechaHora(fecha)],
    ['Punto de entrega', nombrePunto],
    ['Dirección', direccionPunto],
    ['Código de certificado', codigoHash],
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
    <p class="sub">RAEE Smart - Chiclayo</p>
    <table>${filas
      .filter(([, valor]) => valor)
      .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
      .join('')}</table>
    <p class="pie">Documento generado automáticamente por RAEE Smart.</p>
  </body></html>`;
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { flex: 1, paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.md },
  cuerpo: { flexShrink: 1, overflow: 'hidden' },

  tarjetaQr: {
    alignItems: 'center',
    borderRadius: RADIOS.lg,
    borderWidth: 1,
    paddingVertical: ESPACIOS.sm,
    paddingHorizontal: ESPACIOS.lg,
    marginBottom: ESPACIOS.sm,
  },
  tarjetaQrOk: { backgroundColor: COLORS.primaryPale, borderColor: COLORS.primaryRing },
  tarjetaQrPendiente: { backgroundColor: COLORS.warningSoft, borderColor: '#F2DFB4' },
  tarjetaQrRechazada: { backgroundColor: COLORS.dangerSoft, borderColor: '#F2C4C4' },

  qrMarco: { position: 'relative' },
  qrPendiente: {
    width: 110,
    height: 110,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.lineTab,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  qrPendienteTexto: { ...TIPOGRAFIA.micro, fontSize: 10.5, lineHeight: 15, textAlign: 'center', color: COLORS.mut },
  qrInsignia: {
    position: 'absolute',
    right: -6,
    bottom: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryBright,
    borderWidth: 3,
    borderColor: COLORS.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },

  estado: { ...TIPOGRAFIA.h3, fontSize: 16, marginTop: 8 },
  estadoOk: { color: COLORS.primaryText },
  estadoPendiente: { color: COLORS.warning },
  estadoRechazado: { color: COLORS.danger },
  estadoDetalle: {
    ...TIPOGRAFIA.micro,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    color: COLORS.mut,
    marginTop: 4,
  },

  pasos: { flexDirection: 'row', gap: ESPACIOS.sm, marginTop: ESPACIOS.sm },
  pasoFila: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pasoPunto: { flexDirection: 'row', alignItems: 'center' },
  pasoCirculo: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasoCirculoInactivo: { backgroundColor: COLORS.lineTab },
  pasoLinea: { width: 12, height: 2, borderRadius: 1, backgroundColor: COLORS.primary },
  pasoLineaInactiva: { backgroundColor: COLORS.lineTab },
  pasoTexto: { ...TIPOGRAFIA.micro, fontSize: 10, fontFamily: FUENTES.dmSemi, color: COLORS.inkItem },
  pasoTextoInactivo: { color: COLORS.mutSoft },

  cargando: { marginVertical: 4 },
  datosTitulo: { ...TIPOGRAFIA.h4, fontSize: 13, marginBottom: 8 },
  datos: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineCard,
    borderRadius: RADIOS.md,
    paddingHorizontal: 13,
    paddingVertical: 2,
    marginBottom: ESPACIOS.sm,
  },
  dato: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 9 },
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

  botones: { gap: 9, marginTop: ESPACIOS.lg },
  filaBotones: { flexDirection: 'row', gap: 9 },
  botonMitad: { flex: 1, minWidth: 0 },
  botonCompacto: { paddingHorizontal: 8 },
  botonDescarga: { backgroundColor: COLORS.primarySoft, minHeight: 50 },
  error: { ...TIPOGRAFIA.micro, fontSize: 12, color: COLORS.danger, marginBottom: ESPACIOS.sm },
});
