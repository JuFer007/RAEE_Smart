import type { EstadoInfo, TipoRaee } from './types';

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
  mapPin: '#07854D',

  white: '#FFFFFF',
  notif: '#EF773B',
  info: '#237DDB',
  warning: '#9A6200',
  warningSoft: '#FFF2D9',
  danger: '#B3261E',
  dangerSoft: '#FBE9E7',
  infoSoft: '#E4EEFD',

  overlay: 'rgba(11, 22, 19, 0.6)',
  gradA: '#087C4B',
  gradB: '#0A9D5A',
};

export const FUENTES = {
  manrope: "'Manrope', system-ui, sans-serif",
  dm: "'DM Sans', system-ui, sans-serif",
};

export const RADIOS = { sm: 9, campo: 11, boton: 13, md: 14, lg: 17, xl: 22, pill: 999 };

export const SOMBRAS = {
  hero: '0 11px 23px rgba(6, 135, 75, 0.18)',
  flotante: '0 8px 22px rgba(31, 91, 63, 0.14)',
  card: '0 1px 2px rgba(16, 59, 53, 0.04)',
};

export const TIPOS_RAEE: TipoRaee[] = [
  { tipo: 'TELEVISOR', nombre: 'Televisor', icono: 'tv' },
  { tipo: 'TABLET', nombre: 'Tablet', icono: 'tablet' },
  { tipo: 'CELULAR', nombre: 'Celular', icono: 'phone' },
  { tipo: 'EQUIPO_DE_SONIDO', nombre: 'Equipo de sonido', icono: 'music' },
  { tipo: 'LAPTOP', nombre: 'Laptop', icono: 'laptop' },
  { tipo: 'REFRIGERADORA', nombre: 'Refrigeradora', icono: 'snow' },
  { tipo: 'IMPRESORA', nombre: 'Impresora', icono: 'print' },
  { tipo: 'PEQUENO_ELECTRODOMESTICO', nombre: 'Pequeño electrodoméstico', icono: 'bolt' },
];

export const ESTADOS_ENTREGA: Record<string, EstadoInfo> = {
  REGISTRADA: { label: 'Registrada', color: COLORS.info, bg: COLORS.infoSoft },
  EN_PROCESO: { label: 'En proceso', color: COLORS.warning, bg: COLORS.warningSoft },
  CONFIRMADA: { label: 'Certificada', color: COLORS.primaryText, bg: COLORS.primarySoft2 },
  RECHAZADA: { label: 'Rechazada', color: COLORS.danger, bg: COLORS.dangerSoft },
};

export function obtenerInfoTipo(tipo: string): TipoRaee {
  return (
    TIPOS_RAEE.find((t) => t.tipo === tipo) || { tipo: tipo || 'OTRO', nombre: tipo || 'Aparato', icono: 'leaf' }
  );
}

export function obtenerEstado(estado: string): EstadoInfo {
  return (
    ESTADOS_ENTREGA[estado] || { label: estado || '—', color: COLORS.mut, bg: COLORS.bg }
  );
}
