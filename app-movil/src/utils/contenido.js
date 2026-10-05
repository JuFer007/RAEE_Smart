export const APP = {
  nombre: 'RAEE Smart',
  version: '1.0.0',
  descripcion:
    'App de la Municipalidad Provincial de Chiclayo para registrar la entrega de tus residuos electrónicos y recibir un certificado digital.',
};

export const MUNICIPALIDAD = {
  nombre: 'Municipalidad Provincial de Chiclayo',
  distrito: 'Chiclayo, Lambayeque',
  sitio: 'https://www.munichiclayo.gob.pe/',
  portal: 'https://www.gob.pe/munichiclayo',
};

export const CREDITOS = [
  { icono: 'business-outline', titulo: 'Municipalidad Provincial de Chiclayo', detalle: 'Puntos de acopio y contenido oficial' },
  { icono: 'code-slash-outline', titulo: 'Equipo de desarrollo RAEE Smart', detalle: 'Aplicación móvil y servicio de entrega' },
  { icono: 'globe-outline', titulo: 'Global E-waste Monitor 2024 · OMS', detalle: 'Datos y cifras sobre residuos electrónicos' },
  { icono: 'color-palette-outline', titulo: 'Ionicons · Expo', detalle: 'Iconografía y plataforma de la app' },
];

export const DATOS_RAEE = [
  {
    cifra: '62 millones t',
    titulo: 'de RAEE se generaron en el mundo en 2022',
    detalle: 'Equivale a 7.8 kg por persona al año.',
    fuente: 'Global E-waste Monitor 2024 (UIT / UNITAR)',
  },
  {
    cifra: '22.3%',
    titulo: 'se recolectó y recicló formalmente',
    detalle: 'Casi 8 de cada 10 kilos se quedaron sin tratamiento adecuado.',
    fuente: 'Global E-waste Monitor 2024 (UIT / UNITAR)',
  },
  {
    cifra: 'US$ 62 000 M',
    titulo: 'en recursos naturales se pierden al año',
    detalle: 'Oro, plata, cobre y tierras raras que sí se pueden recuperar.',
    fuente: 'Global E-waste Monitor 2024 (UIT / UNITAR)',
  },
  {
    cifra: '82 millones t',
    titulo: 'se producirán en 2030 si no cambiamos',
    detalle: 'Un aumento del 32% frente a las cifras de 2022.',
    fuente: 'Global E-waste Monitor 2024 (UIT / UNITAR)',
  },
];

export const CONSECJOS = [
  {
    icono: 'home-outline',
    titulo: 'Guárdalos en casa, no los tires a la basura',
    detalle: 'Un celular, un televisor o un cargador tirado a la puerta de tu casa termina en un vertedero.',
  },
  {
    icono: 'battery-charging-outline',
    titulo: 'Protege las baterías de ion-litio',
    detalle: 'Guarda celulares y computadoras con la batería a carga parcial y sin perforar la carcasa.',
  },
  {
    icono: 'shield-checkmark-outline',
    titulo: 'Borra tus datos antes de entregar',
    detalle: 'Restablece el aparato o elimina tus cuentas para que nadie acceda a tu información.',
  },
  {
    icono: 'leaf-outline',
    titulo: 'Prefiere reparar antes de reemplazar',
    detalle: 'Un aparato reparado evita la extracción de más minas y genera menos residuos.',
  },
  {
    icono: 'people-outline',
    titulo: 'Entrega solo en puntos y campañas oficiales',
    detalle: 'Así el residuo se recibe y se trata con seguridad en una planta autorizada.',
  },
];

export const AVISOS = [
  {
    icono: 'sparkles-outline',
    titulo: 'Bienvenido a RAEE Smart',
    detalle: 'Registra la entrega de tus aparatos, obtén tu certificado digital y suma puntos por cada entrega.',
    nuevo: true,
  },
  {
    icono: 'camera-outline',
    titulo: 'Toma una foto del aparato al entregarlo',
    detalle: 'La foto ayuda a identificar el tipo de RAEE y agiliza la certificación en el punto de acopio.',
    nuevo: true,
  },
  {
    icono: 'map-outline',
    titulo: 'Revisa los horarios de los puntos',
    detalle: 'Cada punto de acopio tiene su propio horario de atención. Consérvalo en Horarios y campañas.',
  },
  {
    icono: 'leaf-outline',
    titulo: 'Un residuo electrónico no va a la basura común',
    detalle: 'Puedes dejarlo en el punto de acopio más cercano a tu casa desde la pestaña Mapa.',
  },
];

export function avisosNuevos() {
  return AVISOS.filter((aviso) => aviso.nuevo).length;
}

export const CAMPANAS = [];

export const SIN_CAMPANAS =
  'Por ahora no hay campañas programadas. Consulta los horarios de los puntos de acopio para entregar tus residuos.';

export const TIPS_HORARIOS = 'Los horarios pueden cambiar en días festivos.';