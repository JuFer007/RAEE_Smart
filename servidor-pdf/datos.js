const mock = require('./mock');
const { fechaCorta, fechaDesdeYMD } = require('./utils');

const backendUrl = () => process.env.BACKEND_URL || `http://localhost:${process.env.BACKEND_PORT || 8080}/api`;
const usarMock = () => process.env.USE_MOCK === 'true';

// Mismas categorías y estados que web-panel/src/theme.ts
const CATEGORIAS = {
  TELEVISOR: 'Televisor', TABLET: 'Tablet', CELULAR: 'Celular', EQUIPO_DE_SONIDO: 'Equipo de sonido',
  LAPTOP: 'Laptop', REFRIGERADORA: 'Refrigeradora', IMPRESORA: 'Impresora',
  PEQUENO_ELECTRODOMESTICO: 'Pequeño electrodoméstico',
};
const ESTADOS = {
  REGISTRADA: { label: 'Registrada', color: '#237DDB', bg: '#E4EEFD' },
  EN_PROCESO: { label: 'En proceso', color: '#9A6200', bg: '#FFF2D9' },
  CONFIRMADA: { label: 'Certificada', color: '#07884E', bg: '#E3F5E9' },
  RECHAZADA: { label: 'Rechazada', color: '#B3261E', bg: '#FBE9E7' },
};

class ErrorHttp extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function get(ruta, token) {
  const r = await fetch(`${backendUrl()}${ruta}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new ErrorHttp([401, 403, 404].includes(r.status) ? r.status : 502, `Backend respondió ${r.status}`);
  return r.json();
}

const fuente = {
  entregas: (id, t) => (usarMock() ? mock.entregas(id) : get(`/reportes/municipalidad/${id}`, t)),
  puntos: (id, t) => (usarMock() ? mock.puntos(id) : get(`/municipalidades/${id}/puntos`, t)),
  municipalidades: (t) => (usarMock() ? mock.municipalidades() : get('/admin/municipalidades', t)),
};

function parsearFiltros({ fechaInicio, fechaFin, categoria }) {
  const f = {};
  if (fechaInicio) f.desde = new Date(`${fechaInicio}T00:00:00-05:00`);
  if (fechaFin) f.hasta = new Date(`${fechaFin}T23:59:59-05:00`);
  if ((f.desde && isNaN(f.desde)) || (f.hasta && isNaN(f.hasta))) {
    throw new ErrorHttp(400, 'Fechas inválidas, use el formato AAAA-MM-DD');
  }
  if (categoria && String(categoria).toUpperCase() !== 'TODAS') {
    f.categoria = String(categoria).toUpperCase();
    if (!CATEGORIAS[f.categoria]) throw new ErrorHttp(400, `Categoría inválida: ${categoria}`);
  }
  f.etiquetas = {
    fechaInicio: fechaDesdeYMD(fechaInicio) || 'Inicio',
    fechaFin: fechaDesdeYMD(fechaFin) || 'Hoy',
    categoria: f.categoria ? CATEGORIAS[f.categoria] : 'Todas las categorías',
  };
  return f;
}

const filtrar = (entregas, f) =>
  entregas.filter((e) => {
    const fecha = new Date(e.fechaRegistro);
    return (!f.desde || fecha >= f.desde) && (!f.hasta || fecha <= f.hasta) && (!f.categoria || e.tipoRaee === f.categoria);
  });

const pct = (n, total) => (total ? Math.round((n / total) * 1000) / 10 : 0);
const confianzaPct = (c) => (c <= 1 ? c * 100 : c);

function resumir(entregas) {
  const total = entregas.length;
  const porEstado = {};
  const porCategoria = {};
  let sumaConfianza = 0;
  let corregidas = 0;
  entregas.forEach((e) => {
    porEstado[e.estado] = (porEstado[e.estado] || 0) + 1;
    porCategoria[e.tipoRaee] = (porCategoria[e.tipoRaee] || 0) + 1;
    sumaConfianza += confianzaPct(e.confianzaIa || 0);
    if (e.clasificacionCorregida) corregidas++;
  });
  const certificadas = porEstado.CONFIRMADA || 0;
  return {
    total,
    certificadas,
    enProceso: (porEstado.EN_PROCESO || 0) + (porEstado.REGISTRADA || 0),
    rechazadas: porEstado.RECHAZADA || 0,
    corregidas,
    tasaCertificacion: pct(certificadas, total),
    confianzaPromedio: total ? Math.round(sumaConfianza / total) : 0,
    estados: Object.keys(ESTADOS).map((k) => ({ ...ESTADOS[k], cantidad: porEstado[k] || 0 })),
    categorias: Object.entries(porCategoria)
      .map(([tipo, cantidad]) => ({ nombre: CATEGORIAS[tipo] || tipo, cantidad, porcentaje: pct(cantidad, total) }))
      .sort((a, b) => b.cantidad - a.cantidad),
  };
}

async function datosMunicipalidad(id, query, token, rol) {
  const f = parsearFiltros(query);
  const [todas, puntosInfo] = await Promise.all([
    fuente.entregas(id, token),
    fuente.puntos(id, token).catch(() => []),
  ]);

  // /api/admin/** solo lo lee el ADMIN; el rol municipal toma el nombre del endpoint público de puntos
  let municipalidad = { nombre: puntosInfo[0]?.municipalidadNombre || `Municipalidad #${id}` };
  if (rol === 'ADMIN') {
    const lista = await fuente.municipalidades(token).catch(() => []);
    const m = lista.find((x) => String(x.id) === String(id));
    if (m) municipalidad = { ...municipalidad, ...m };
  }

  const entregas = filtrar(todas, f).sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro));

  const puntos = new Map(
    puntosInfo.map((p) => [p.id, { nombre: p.nombre, direccion: p.direccion, horario: p.horarioAtencion, cantidad: 0, certificadas: 0 }])
  );
  entregas.forEach((e) => {
    if (!puntos.has(e.puntoRecoleccionId)) {
      puntos.set(e.puntoRecoleccionId, { nombre: e.puntoRecoleccionNombre, direccion: e.puntoRecoleccionDireccion, horario: null, cantidad: 0, certificadas: 0 });
    }
    const p = puntos.get(e.puntoRecoleccionId);
    p.cantidad++;
    if (e.estado === 'CONFIRMADA') p.certificadas++;
  });

  return {
    municipalidad,
    filtros: f.etiquetas,
    resumen: resumir(entregas),
    puntos: [...puntos.values()].sort((a, b) => b.cantidad - a.cantidad),
    entregas: entregas.map((e) => ({
      id: e.id,
      fecha: fechaCorta(e.fechaRegistro),
      categoria: e.nombreCategoriaVisible || CATEGORIAS[e.tipoRaee] || e.tipoRaee,
      corregida: !!e.clasificacionCorregida,
      punto: e.puntoRecoleccionNombre || '—',
      confianza: Math.round(confianzaPct(e.confianzaIa || 0)),
      estado: e.estado,
      fechaConfirmacion: fechaCorta(e.fechaConfirmacion),
      certificado: e.certificadoCodigoQr ? e.certificadoCodigoQr.split('/').pop().slice(0, 8).toUpperCase() : '—',
    })),
  };
}

async function datosSuperadmin(query, token) {
  const f = parsearFiltros(query);
  const lista = await fuente.municipalidades(token);
  const sinDatos = [];
  let global = [];

  const filas = await Promise.all(
    lista.map(async (m) => {
      let entregas = [];
      try {
        entregas = filtrar(await fuente.entregas(m.id, token), f);
      } catch {
        sinDatos.push(m.nombre);
      }
      global = global.concat(entregas);
      const r = resumir(entregas);
      return {
        nombre: m.nombre, distrito: m.distrito, activa: !!m.activo,
        total: r.total, certificadas: r.certificadas, enProceso: r.enProceso, rechazadas: r.rechazadas, tasa: r.tasaCertificacion,
      };
    })
  );

  return {
    filtros: f.etiquetas,
    resumen: resumir(global),
    totalMunicipalidades: lista.length,
    activas: lista.filter((m) => m.activo).length,
    municipalidades: filas.sort((a, b) => b.total - a.total),
    sinDatos,
  };
}

module.exports = { datosMunicipalidad, datosSuperadmin, ErrorHttp, ESTADOS };
