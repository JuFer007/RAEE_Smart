export const API_BASE_URL = 'http://192.168.1.100:8080/api';

export const FUENTES = {
  manrope: 'Manrope_800ExtraBold',
  manrope700: 'Manrope_700Bold',
  manrope600: 'Manrope_600SemiBold',
  dm: 'DMSans_400Regular',
  dmMed: 'DMSans_500Medium',
  dmSemi: 'DMSans_600SemiBold',
  dmBold: 'DMSans_700Bold',
};

export const COLORS = {
  page: '#E8F0ED',
  bg: '#F8FCFA',
  bgTop: '#FBFEFD',
  bgBottom: '#F4FAF7',
  surface: '#FFFFFF',

  ink: '#103B35',
  inkSoft: '#123D39',
  inkTitle: '#123E39',
  inkHeading: '#15443D',
  inkField: '#174640',
  inkItem: '#22584C',
  mut: '#709087',
  mutSoft: '#829B92',
  mutIcon: '#659080',

  primary: '#079150',
  primaryDeep: '#087C4B',
  primaryBright: '#0A9D5A',
  primaryText: '#07884E',
  primaryNav: '#088750',
  primaryLink: '#126D54',
  secondary: '#126155',
  secondaryBorder: '#A8D0C0',

  lime: '#41AE36',
  limeBright: '#4EB449',
  limePale: '#A0D86C',
  leafDark: '#258C50',
  leafMid: '#67BE52',

  line: '#D5E8DF',
  lineSoft: '#E1EEE7',
  lineCard: '#DEEDE5',
  lineNav: '#E3EEE8',
  lineTab: '#DCEBE4',
  lineInner: '#EDF4F0',

  primarySoft: '#E1F5E9',
  primarySoft2: '#E3F5E9',
  primaryPale: '#EEF9F2',
  primaryPale2: '#E5F6EB',
  primaryRing: '#DAF3E4',
  focus: '#8ED8AE',
  focusSoft: '#E1F4E8',

  mapBg: '#D9EBDE',
  mapBg2: '#D7EADC',
  mapRoad: '#A5D1AE',
  mapRoad2: '#B6DAC0',
  mapRoadLine: 'rgba(255,255,255,0.75)',
  mapPin: '#07854D',

  cameraBg: '#092B2B',
  cameraMuted: '#A9C0B9',
  cameraTip: '#8FA9A1',
  cameraCorner: '#7AE197',
  cameraGallery: '#244948',
  cameraFrame: '#A8774A',
  cameraFrameDark: '#8A5F37',
  cameraObject: '#15232A',

  white: '#FFFFFF',
  notif: '#EF773B',
  info: '#237DDB',
  warning: '#9A6200',
  warningSoft: '#FFF2D9',
  danger: '#B3261E',
  dangerSoft: '#FBE9E7',
};

export const ESPACIOS = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, page: 22 };

export const RADIOS = { sm: 9, campo: 11, boton: 13, md: 14, lg: 17, xl: 22, pill: 999 };

export const ALTURAS = { barra: 72, topbar: 48 };

export const TIPOGRAFIA = {
  display: {
    fontFamily: FUENTES.manrope,
    fontSize: 29,
    lineHeight: 34,
    letterSpacing: -1.2,
    color: COLORS.ink,
  },
  h1: { fontFamily: FUENTES.manrope, fontSize: 25, lineHeight: 30, letterSpacing: -0.8, color: COLORS.ink },
  h2: { fontFamily: FUENTES.manrope, fontSize: 20, fontWeight: '800', color: COLORS.ink },
  h3: { fontFamily: FUENTES.manrope, fontSize: 16, fontWeight: '700', color: COLORS.ink },
  h4: { fontFamily: FUENTES.manrope, fontSize: 14, fontWeight: '700', color: COLORS.inkHeading },
  topbar: { fontFamily: FUENTES.manrope700, fontSize: 16, fontWeight: '700', color: COLORS.inkSoft },
  body: { fontFamily: FUENTES.dm, fontSize: 14, color: COLORS.ink },
  bodySm: { fontFamily: FUENTES.dm, fontSize: 13, lineHeight: 21, color: COLORS.mut },
  small: { fontFamily: FUENTES.dm, fontSize: 12, color: COLORS.mut },
  tiny: { fontFamily: FUENTES.dm, fontSize: 11, color: COLORS.mutSoft },
  micro: { fontFamily: FUENTES.dm, fontSize: 10, color: COLORS.mutSoft },
  label: {
    fontFamily: FUENTES.dmBold,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.mut,
  },
  button: { fontFamily: FUENTES.dmBold, fontSize: 14, fontWeight: '700', color: COLORS.white },
  buttonSec: { fontFamily: FUENTES.dmBold, fontSize: 14, fontWeight: '700', color: COLORS.secondary },
  link: { fontFamily: FUENTES.dmBold, fontSize: 12, fontWeight: '700', color: COLORS.primaryText },
  linkSoft: { fontFamily: FUENTES.dm, fontSize: 12, color: COLORS.primaryLink },
  eyebrow: {
    fontFamily: FUENTES.dmBold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#4D8A6C',
  },
  tab: { fontFamily: FUENTES.dm, fontSize: 9 },
  tabActiva: { fontFamily: FUENTES.dmBold, fontSize: 9, fontWeight: '700' },
};

export const SOMBRAS = {
  hero: { boxShadow: '0px 11px 23px rgba(6, 135, 75, 0.18)' },
  flotante: { boxShadow: '0px 8px 22px rgba(31, 91, 63, 0.14)' },
  avatar: { boxShadow: '0px 0px 0px 1px #CAE3D7' },
};

export const TIPOS_RAEE = [
  {
    tipo: 'CELULAR',
    nombre: 'Smartphone',
    categoria: 'Telefonía',
    icono: 'phone-portrait-outline',
    ejemplos: ['Celulares y smartphones', 'Tablets', 'Teléfonos fijos', 'Cargadores, cables y audífonos'],
  },
  {
    tipo: 'LAPTOP',
    nombre: 'Laptop',
    categoria: 'Informática',
    icono: 'laptop-outline',
    ejemplos: ['Laptops y netbooks', 'Computadoras de escritorio', 'Tablets y agendas', 'Servidores y routers'],
  },
  {
    tipo: 'TELEVISOR',
    nombre: 'Televisor',
    categoria: 'Audio y video',
    icono: 'tv-outline',
    ejemplos: ['Televisores LCD, LED y plasma', 'Monitores de computadora', 'Proyectores', 'Equipos de audio'],
  },
  {
    tipo: 'REFRIGERADORA',
    nombre: 'Refrigeradora',
    categoria: 'Electrodomésticos',
    icono: 'snow-outline',
    ejemplos: ['Refrigeradoras y congeladoras', 'Aire acondicionado', 'Lavadoras y secadoras', 'Ventiladores'],
  },
  {
    tipo: 'IMPRESORA',
    nombre: 'Impresora',
    categoria: 'Informática',
    icono: 'print-outline',
    ejemplos: ['Impresoras y escáneres', 'Multifuncionales', 'Tóner y cartuchos', 'Equipos de oficina'],
  },
  {
    tipo: 'PEQUENO_ELECTRODOMESTICO',
    nombre: 'Electrodoméstico',
    categoria: 'Electrodomésticos',
    icono: 'flash-outline',
    ejemplos: ['Licuadoras y batidoras', 'Horneas eléctricas y microondas', 'Planchas y freidoras', 'Aspiradoras'],
  },
];

export const ESTADOS_ENTREGA = {
  REGISTRADA: { label: 'Registrada', color: COLORS.info, bg: '#E4EEFD' },
  EN_PROCESO: { label: 'En proceso', color: COLORS.warning, bg: COLORS.warningSoft },
  CONFIRMADA: { label: 'Certificada', color: COLORS.primaryText, bg: COLORS.primarySoft2 },
  RECHAZADA: { label: 'Rechazada', color: COLORS.danger, bg: COLORS.dangerSoft },
};

export function obtenerInfoTipo(tipo) {
  return (
    TIPOS_RAEE.find((t) => t.tipo === tipo) || {
      nombre: tipo || 'Aparato',
      categoria: 'Sin categoría',
      icono: 'help-circle-outline',
    }
  );
}

export function obtenerEstado(estado) {
  return ESTADOS_ENTREGA[estado] || { label: estado || '—', color: COLORS.mut, bg: COLORS.bg };
}