import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Encabezado from '../components/Encabezado';
import { MUNICIPALIDAD } from '../utils/contenido';
import { COLORS, ESPACIOS, RADIOS, TIPOGRAFIA, FUENTES } from '../theme';

const OPCIONES = [
  { clave: 'faq', icono: 'help-circle-outline', titulo: 'Preguntas frecuentes' },
  { clave: 'contacto', icono: 'call-outline', titulo: 'Contáctanos' },
  { clave: 'terminos', icono: 'book-outline', titulo: 'Términos y condiciones' },
  { clave: 'privacidad', icono: 'lock-closed-outline', titulo: 'Política de privacidad' },
];

const FAQ = [
  {
    q: '¿Qué puedo entregar?',
    a: 'Televisores, laptops, celulares, refrigeradoras, impresoras y pequeños electrodomésticos.',
  },
  {
    q: '¿Cómo obtengo mi certificado?',
    a: 'Al registrar la entrega la app identifica el aparato y genera un certificado con código QR.',
  },
];

const CONTACTO = [
  { icono: 'call-outline', etiqueta: 'Teléfono', valor: '(074) 237301', url: 'tel:+5174237301' },
  { icono: 'logo-whatsapp', etiqueta: 'WhatsApp', valor: '+51 979 123 456', url: 'https://wa.me/51979123456' },
  { icono: 'mail-outline', etiqueta: 'Correo', valor: 'raee@munichiclayo.gob.pe', url: 'mailto:raee@munichiclayo.gob.pe' },
  { icono: 'location-outline', etiqueta: 'Dirección', valor: 'Av. Luis González 634, Chiclayo' },
  { icono: 'time-outline', etiqueta: 'Horario', valor: 'Lunes a viernes · 8:00 a 17:00' },
  { icono: 'globe-outline', etiqueta: 'Sitio web', valor: MUNICIPALIDAD.sitio.replace('https://', ''), url: MUNICIPALIDAD.sitio },
];

const TERMINOS = [
  {
    titulo: 'Aceptación',
    texto:
      'Al usar RAEE Smart aceptas estas condiciones y el uso responsable de la app para registrar la entrega de tus residuos de aparatos eléctricos y electrónicos (RAEE).',
  },
  {
    titulo: 'Registro de entregas',
    texto:
      'La información que registres debe ser veraz. Las entregas se validan en el punto de acopio y el certificado se emite cuando la recepción es confirmada.',
  },
  {
    titulo: 'Certificados digitales',
    texto:
      'El certificado con código QR acredita tu entrega. No es un documento tributario ni reemplaza comprobantes oficiales.',
  },
  {
    titulo: 'Uso permitido',
    texto:
      'No está permitido usar la app para fines ilícitos, registrar residuos peligrosos no admitidos ni alterar los datos de las entregas.',
  },
  {
    titulo: 'Cambios',
    texto:
      'La Municipalidad Provincial de Chiclayo puede actualizar estas condiciones; los cambios se reflejan en la app.',
  },
];

const PRIVACIDAD = [
  {
    titulo: 'Datos que recopilamos',
    texto:
      'Recopilamos tu nombre, correo, datos de las entregas, fotografías del aparato y tu ubicación aproximada mientras usas el mapa de puntos de acopio.',
  },
  {
    titulo: 'Uso de la información',
    texto:
      'Usamos tus datos para gestionar entregas, emitir certificados, mostrarte puntos cercanos y enviarte avisos relacionados con el servicio.',
  },
  {
    titulo: 'Ubicación',
    texto:
      'Tu ubicación se usa solo para ordenar los puntos de acopio por cercanía. Puedes denegar el permiso y seguir usando la app.',
  },
  {
    titulo: 'Compartición',
    texto:
      'No compartimos tus datos con terceros ajenos a la Municipalidad, salvo obligación legal.',
  },
  {
    titulo: 'Tus derechos',
    texto:
      'Puedes solicitar acceso, corrección o eliminación de tus datos escribiendo a raee@munichiclayo.gob.pe.',
  },
  {
    titulo: 'Seguridad',
    texto:
      'Aplicamos medidas razonables para proteger tu información. Las fotos y certificados se conservan solo el tiempo necesario.',
  },
];

export default function AyudaScreen({ navigation }) {
  const [activa, setActiva] = useState(null);

  function alternar(clave) {
    setActiva((actual) => (actual === clave ? null : clave));
  }

  function abrir(url) {
    if (url) Linking.openURL(url).catch(() => {});
  }

  return (
    <View style={styles.fondo}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <Encabezado titulo="Ayuda y soporte" onBack={() => navigation.goBack()} />

        <View style={styles.rejilla}>
          {OPCIONES.map((op) => {
            const abierta = activa === op.clave;
            return (
              <TouchableOpacity
                key={op.clave}
                style={[styles.tarjeta, abierta && styles.tarjetaActiva]}
                activeOpacity={0.85}
                onPress={() => alternar(op.clave)}
              >
                <View style={[styles.tarjetaIcono, abierta && styles.tarjetaIconoActivo]}>
                  <Ionicons name={op.icono} size={24} color={abierta ? COLORS.white : '#137952'} />
                </View>
                <Text style={styles.tarjetaTitulo}>{op.titulo}</Text>
                <Ionicons
                  name={abierta ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  color={COLORS.mutSoft}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        {activa === 'faq' ? (
          <View style={styles.detalle}>
            {FAQ.map((item) => (
              <View key={item.q} style={styles.pregunta}>
                <Text style={styles.preguntaTitulo}>{item.q}</Text>
                <Text style={styles.preguntaRespuesta}>{item.a}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {activa === 'contacto' ? (
          <View style={styles.detalle}>
            <View style={styles.listaContacto}>
              {CONTACTO.map((c, i) => (
                <TouchableOpacity
                  key={c.etiqueta}
                  style={[styles.filaContacto, i === CONTACTO.length - 1 && styles.filaUltima]}
                  activeOpacity={c.url ? 0.7 : 1}
                  onPress={() => abrir(c.url)}
                  disabled={!c.url}
                >
                  <View style={styles.filaIcono}>
                    <Ionicons name={c.icono} size={16} color={COLORS.primaryText} />
                  </View>
                  <View style={styles.filaTextos}>
                    <Text style={styles.filaEtiqueta}>{c.etiqueta}</Text>
                    <Text style={styles.filaValor}>{c.valor}</Text>
                  </View>
                  {c.url ? <Ionicons name="open-outline" size={14} color={COLORS.mutSoft} /> : null}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {activa === 'terminos' || activa === 'privacidad' ? (
          <View style={styles.detalle}>
            {(activa === 'terminos' ? TERMINOS : PRIVACIDAD).map((s) => (
              <View key={s.titulo} style={styles.legal}>
                <Text style={styles.legalTitulo}>{s.titulo}</Text>
                <Text style={styles.legalTexto}>{s.texto}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: COLORS.bgTop },
  contenido: { paddingHorizontal: ESPACIOS.page, paddingTop: ESPACIOS.md, paddingBottom: ESPACIOS.xxl },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tarjeta: {
    width: '48%',
    flexGrow: 1,
    minHeight: 128,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  tarjetaActiva: { borderColor: COLORS.primaryRing, backgroundColor: COLORS.primaryPale },
  tarjetaTitulo: {
    ...TIPOGRAFIA.micro,
    fontSize: 13,
    lineHeight: 17,
    textAlign: 'center',
    fontFamily: FUENTES.dmSemi,
    color: '#10544B',
  },
  tarjetaIcono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarjetaIconoActivo: { backgroundColor: COLORS.primaryBright },

  detalle: { marginTop: 12, gap: 8 },
  pregunta: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: 12,
  },
  preguntaTitulo: { ...TIPOGRAFIA.micro, fontSize: 13, fontFamily: FUENTES.dmSemi, color: COLORS.inkItem, marginBottom: 4 },
  preguntaRespuesta: { ...TIPOGRAFIA.micro, fontSize: 12, lineHeight: 17 },

  listaContacto: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    paddingHorizontal: 13,
  },
  filaContacto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lineInner,
  },
  filaUltima: { borderBottomWidth: 0 },
  filaIcono: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaTextos: { flex: 1 },
  filaEtiqueta: { ...TIPOGRAFIA.micro, fontSize: 10, color: COLORS.mutSoft },
  filaValor: { ...TIPOGRAFIA.small, fontSize: 12.5, color: COLORS.inkItem, marginTop: 2 },

  legal: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.lineSoft,
    borderRadius: RADIOS.md,
    padding: 12,
  },
  legalTitulo: { ...TIPOGRAFIA.micro, fontSize: 13, fontFamily: FUENTES.dmSemi, color: COLORS.inkItem, marginBottom: 4 },
  legalTexto: { ...TIPOGRAFIA.micro, fontSize: 12, lineHeight: 18 },
});
