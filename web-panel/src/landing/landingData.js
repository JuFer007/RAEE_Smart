// Datos de la landing de RAEE Smart (tomados de la app móvil: contenido.js y datosPrueba.js)

import carrusel1 from './img/hero/carrusel-1.jpg';
import carrusel2 from './img/hero/carrusel-2.jpg';
import carrusel3 from './img/hero/carrusel-3.jpg';
import carrusel4 from './img/hero/carrusel-4.jpg';
import capturaHome from './img/home.png';
import capturaDeteccion from './img/deteccionDeDispositivo.png';
import capturaMapa from './img/mapaConUbicaciones.jpeg';
import capturaPorque from './img/porqueReciclar.png';

export const SLIDES = [
  {
    id: 'portada',
    etiqueta: 'Chiclayo · Lambayeque',
    icono: 'leaf',
    fondo: carrusel1,
    captura: capturaHome,
    titulo: 'Recicla tus aparatos electrónicos y recibe tu certificado digital',
    texto:
      'Entrega celulares, laptops, televisores y más en los puntos de acopio de tu municipalidad. La app te guía en cada paso.',
    cta: { texto: 'Cómo funciona', href: '#como' },
  },
  {
    id: 'foto',
    etiqueta: 'Clasificación con IA',
    icono: 'scan',
    fondo: carrusel2,
    captura: capturaDeteccion,
    titulo: 'Una foto basta para identificar tu aparato',
    texto:
      'La app reconoce el tipo de RAEE y te muestra qué tan segura está. Si se equivoca, corriges la categoría a mano.',
    cta: { texto: 'Ver qué puedes entregar', href: '#reciclar' },
  },
  {
    id: 'puntos',
    etiqueta: 'Puntos de entrega',
    icono: 'location',
    fondo: carrusel3,
    captura: capturaMapa,
    titulo: 'Entrega en el punto de acopio más cercano',
    texto:
      'Mira los puntos en el mapa, con sus horarios y las campañas vigentes de cada municipalidad.',
    cta: { texto: 'Ver puntos de entrega', href: '#puntos' },
  },
  {
    id: 'impacto',
    etiqueta: 'Impacto ambiental',
    icono: 'leaf',
    fondo: carrusel4,
    captura: capturaPorque,
    titulo: 'Cada aparato reciclado deja de contaminar',
    texto:
      'Recuperamos metales como oro, plata y cobre, y evitamos que los componentes tóxicos lleguen al suelo y al agua.',
    cta: { texto: 'Ver qué reciclar', href: '#reciclar' },
  },
];

export const PASOS = [
  { icono: 'scan', titulo: 'Toma una foto', texto: 'Fotografía desde la app el aparato que quieres entregar.' },
  { icono: 'bolt', titulo: 'La IA lo clasifica', texto: 'Identifica el tipo de RAEE. Si se equivoca, corriges la categoría a mano.' },
  { icono: 'location', titulo: 'Elige un punto de entrega', texto: 'Mira en el mapa los puntos de acopio cercanos, con sus horarios y campañas.' },
  { icono: 'qr', titulo: 'Recibe tu certificado', texto: 'Cuando la municipalidad confirma la recepción, la app genera tu certificado digital con código QR.' },
];

export const CATEGORIAS = [
  { icono: 'tv', nombre: 'Televisor', texto: 'Televisores LED, LCD y plasma, monitores y proyectores.' },
  { icono: 'laptop', nombre: 'Laptop', texto: 'Laptops, netbooks, notebooks y sus cargadores.' },
  { icono: 'phone', nombre: 'Celular', texto: 'Smartphones, cargadores, cables y audífonos.' },
  { icono: 'tablet', nombre: 'Tablet', texto: 'Tablets, e-readers y consolas portátiles.' },
  { icono: 'snow', nombre: 'Refrigeradora', texto: 'Refrigeradoras, congeladoras y exhibidoras.' },
  { icono: 'print', nombre: 'Impresora', texto: 'Impresoras, multifuncionales, escáneres y tóner.' },
  { icono: 'music', nombre: 'Equipo de sonido', texto: 'Parlantes, minicomponentes, amplificadores y radios.' },
  { icono: 'bolt', nombre: 'Pequeño electrodoméstico', texto: 'Licuadoras, microondas, planchas, freidoras y aspiradoras.' },
];

export const PUNTOS = [
  { id: 1, nombre: 'Municipalidad de Chiclayo', direccion: 'Plaza de Armas de Chiclayo, Chiclayo', horario: 'Lunes a viernes · 8:00 a 16:30', lat: -6.7714, lng: -79.8409 },
  { id: 2, nombre: 'Municipalidad de José Leonardo Ortiz', direccion: 'Plaza de Armas de José Leonardo Ortiz', horario: 'Lunes a viernes · 8:00 a 16:30', lat: -6.76, lng: -79.837 },
  { id: 3, nombre: 'Municipalidad de La Victoria', direccion: 'Plaza de Armas de La Victoria', horario: 'Lunes a viernes · 8:00 a 15:00', lat: -6.781, lng: -79.832 },
  { id: 4, nombre: 'Municipalidad de Pimentel', direccion: 'Plaza de Armas de Pimentel', horario: 'Lunes a sábado · 9:00 a 17:00', lat: -6.8369, lng: -79.934 },
  { id: 5, nombre: 'Municipalidad de Santa Rosa', direccion: 'Plaza de Armas de Santa Rosa', horario: 'Lunes a sábado · 10:00 a 18:00', lat: -6.8667, lng: -79.95 },
  { id: 6, nombre: 'Municipalidad de Monsefú', direccion: 'Plaza de Armas de Monsefú', horario: 'Lunes a sábado · 9:00 a 17:00', lat: -6.8767, lng: -79.8692 },
  { id: 7, nombre: 'Municipalidad de Reque', direccion: 'Plaza de Armas de Reque', horario: 'Martes, jueves y sábado · 9:00 a 13:00', lat: -6.8631, lng: -79.8211 },
  { id: 8, nombre: 'Municipalidad de Eten', direccion: 'Plaza de Armas de Eten', horario: 'Lunes a viernes · 8:30 a 16:30', lat: -6.9072, lng: -79.8644 },
  { id: 9, nombre: 'Municipalidad de Puerto Eten', direccion: 'Plaza de Armas de Puerto Eten', horario: 'Lunes a viernes · 8:30 a 16:30', lat: -6.9417, lng: -79.8647 },
  { id: 10, nombre: 'Municipalidad de Pomalca', direccion: 'Plaza de Armas de Pomalca', horario: 'Lunes a viernes · 8:00 a 15:00', lat: -6.7667, lng: -79.7833 },
  { id: 11, nombre: 'Municipalidad de Tumán', direccion: 'Plaza de Armas de Tumán', horario: 'Lunes a viernes · 8:00 a 15:00', lat: -6.75, lng: -79.7167 },
  { id: 12, nombre: 'Municipalidad Provincial de Lambayeque', direccion: 'Plaza de Armas de Lambayeque, Lambayeque', horario: 'Lunes a viernes · 8:00 a 16:00', lat: -6.7011, lng: -79.9067 },
  { id: 13, nombre: 'Universidad Nacional Pedro Ruiz Gallo', direccion: 'Av. Juan XXIII 391, Lambayeque', horario: 'Lunes a viernes · horario por confirmar', lat: -6.7046, lng: -79.9065 },
  { id: 14, nombre: 'Museo Tumbas Reales de Sipán', direccion: 'Av. Juan Pablo Vizcardo y Guzmán 895, Lambayeque', horario: 'Horario por confirmar', lat: -6.7017, lng: -79.9069 },
];
