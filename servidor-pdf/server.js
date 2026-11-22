const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { datosMunicipalidad, datosSuperadmin, datosMunicipalidades, ErrorHttp, ESTADOS } = require('./datos');
const { datosPorEntrega, datosPorHash, htmlCertificado } = require('./certificado');
const { barras, dona, conColores } = require('./graficos');
const { esc, render, ahoraLima } = require('./utils');

const app = express();

app.use(cors({
  origin: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,http://localhost:19006,http://localhost:8081').split(',').map((o) => o.trim()),
  exposedHeaders: ['Content-Disposition'],
}));
app.use(express.json({ limit: '1mb' }));
app.use('/recursos', express.static(path.join(__dirname, 'recursos')));

const leer = (archivo) => fs.readFileSync(path.join(__dirname, 'templates', archivo), 'utf8');
const ESTILOS = leer('estilos.css');
const LOGO = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, 'recursos', 'logo.png')).toString('base64')}`;

/* ---------- Autenticación: mismo JWT que emite el backend Spring ---------- */
function autenticar(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  if (process.env.USE_MOCK === 'true' && !process.env.JWT_SECRET) {
    req.usuario = { rol: 'ADMIN', token };
    return next();
  }
  try {
    const claims = jwt.verify(token, Buffer.from(process.env.JWT_SECRET || '', 'utf8'), {
      algorithms: ['HS256', 'HS384', 'HS512'],
    });
    req.usuario = { id: claims.usuarioId, rol: claims.rol, token };
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

const soloRoles = (...roles) => (req, res, next) =>
  roles.includes(req.usuario.rol) ? next() : res.status(403).json({ error: 'No autorizado para este reporte' });

/* ---------- PDF ---------- */
let navegador;
const obtenerNavegador = () =>
  (navegador ||= puppeteer
    .launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    })
    .catch((err) => {
      navegador = null;
      throw err;
    }));

async function htmlAPdf(html, opciones = {}) {
  const page = await (await obtenerNavegador()).newPage();
  try {
    await page.setContent(html, { waitUntil: 'load' });
    return Buffer.from(
      await page.pdf({
        format: 'A4',
        landscape: Boolean(opciones.landscape),
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate:
          '<div style="width:100%;font-size:8px;color:#709087;padding:0 12mm;display:flex;justify-content:space-between"><span>RAEE Smart</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>',
        margin: { top: '12mm', bottom: '16mm', left: '12mm', right: '12mm' },
      })
    );
  } finally {
    await page.close();
  }
}

function enviarPdf(res, pdf, prefijo) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${prefijo}_${Date.now()}.pdf"`);
  res.send(pdf);
}

function responderError(res, err) {
  const status = err.status || 500;
  if (status >= 500) console.error('Error generando reporte:', err);
  res.status(status).json({
    error: status >= 500 ? 'Error generando el documento' : err.message,
    ...(status >= 500 && process.env.NODE_ENV !== 'production' ? { details: err.message } : {}),
  });
}

/* ---------- Fragmentos HTML ---------- */
const pill = (estado) => {
  const e = ESTADOS[estado] || { label: estado, color: '#709087', bg: '#F8FCFA' };
  return `<span class="estado" style="color:${e.color};background:${e.bg}">${e.label}</span>`;
};

const kpis = (r) => ({ total: r.total, certificadas: r.certificadas, enProceso: r.enProceso, rechazadas: r.rechazadas, tasa: r.tasaCertificacion });

function htmlMunicipalidad(d) {
  const r = d.resumen;
  const m = d.municipalidad;
  const { fecha, hora } = ahoraLima();

  const puntos = d.puntos
    .map((p) => `<tr>
      <td>${esc(p.nombre)}</td><td>${esc(p.direccion || '—')}</td><td>${esc(p.horario || '—')}</td>
      <td class="text-center">${p.cantidad}</td><td class="text-center">${p.certificadas}</td></tr>`)
    .join('');

  const entregas = d.entregas
    .map((e) => `<tr>
      <td>${e.id}</td><td>${e.fecha}</td>
      <td>${esc(e.categoria)}${e.corregida ? '<span class="chip">corregida</span>' : ''}</td>
      <td>${esc(e.punto)}</td><td class="text-center">${e.confianza}%</td>
      <td>${pill(e.estado)}</td><td>${e.fechaConfirmacion}</td><td class="mono">${esc(e.certificado)}</td></tr>`)
    .join('');

  const totales = `<tr class="fila-total">
    <td colspan="4" class="text-right">TOTAL: ${r.total} entregas${r.corregidas ? ` (${r.corregidas} reclasificadas)` : ''}</td>
    <td class="text-center">${r.confianzaPromedio}%</td>
    <td colspan="3">${r.certificadas} certificadas · ${r.rechazadas} rechazadas</td></tr>`;

  return render(leer('reporteMunicipalidad.html'), {
    estilos: ESTILOS,
    logo: LOGO,
    municipalidad: esc(m.nombre),
    subtitulo: esc([m.distrito, m.direccion].filter(Boolean).join(' · ') || `${d.puntos.length} punto(s) de acopio`),
    fechaGeneracion: fecha,
    horaGeneracion: hora,
    fechaInicio: d.filtros.fechaInicio,
    fechaFin: d.filtros.fechaFin,
    categoria: esc(d.filtros.categoria),
    ...kpis(r),
    graficoCategorias: barras(r.categorias),
    graficoEstados: dona(r.estados.map((e) => ({ label: e.label, cantidad: e.cantidad, color: e.color }))),
    puntos,
    entregas,
    totales,
    contacto: m.contactoEmail ? `Contacto: ${esc(m.contactoEmail)}` : `Reporte de ${esc(m.nombre)}`,
  });
}

function htmlSuperadmin(d) {
  const r = d.resumen;
  const { fecha, hora } = ahoraLima();

  const filas = d.municipalidades
    .map((m) => `<tr>
      <td>${esc(m.nombre)}</td><td>${esc(m.distrito || '—')}</td><td>${m.activa ? 'Activa' : 'Inactiva'}</td>
      <td class="text-center">${m.total}</td><td class="text-center">${m.certificadas}</td>
      <td class="text-center">${m.enProceso}</td><td class="text-center">${m.rechazadas}</td><td class="text-right">${m.tasa}%</td></tr>`)
    .join('');

  const totales = `<tr class="fila-total">
    <td colspan="3" class="text-right">TOTALES:</td>
    <td class="text-center">${r.total}</td><td class="text-center">${r.certificadas}</td>
    <td class="text-center">${r.enProceso}</td><td class="text-center">${r.rechazadas}</td><td class="text-right">${r.tasaCertificacion}%</td></tr>`;

  return render(leer('reporteSuperadmin.html'), {
    estilos: ESTILOS,
    logo: LOGO,
    fechaGeneracion: fecha,
    horaGeneracion: hora,
    fechaInicio: d.filtros.fechaInicio,
    fechaFin: d.filtros.fechaFin,
    categoria: esc(d.filtros.categoria),
    activas: d.activas,
    totalMunicipalidades: d.totalMunicipalidades,
    ...kpis(r),
    graficoMunicipalidades: barras(d.municipalidades.map((m) => ({ nombre: m.nombre.replace(/^Municipalidad (Provincial |Distrital )?de /, ''), cantidad: m.total })), { max: 10 }),
    graficoCategorias: dona(conColores(r.categorias)),
    municipalidades: filas,
    totales,
    aviso: d.sinDatos.length
      ? `<div class="aviso">No se pudieron obtener los datos de: ${d.sinDatos.map(esc).join(', ')}. Los totales no los incluyen.</div>`
      : '',
  });
}

function htmlMunicipalidades(d) {
  const { fecha, hora } = ahoraLima();

  const filas = d.municipalidades
    .map((m) => {
      const coordenadas =
        m.latitud !== null && m.latitud !== undefined && m.longitud !== null && m.longitud !== undefined
          ? `${m.latitud}, ${m.longitud}`
          : '—';
      const campanas = m.campanasHabilitadas
        ? '<span class="estado" style="color:#07884E;background:#E3F5E9">Habilitadas</span>'
        : '<span class="estado" style="color:#709087;background:#F8FCFA">No habilitadas</span>';
      const estado = m.activa
        ? '<span class="estado" style="color:#07884E;background:#E3F5E9">Activa</span>'
        : '<span class="estado" style="color:#709087;background:#F8FCFA">Inactiva</span>';
      return `<tr>
        <td>${esc(m.nombre)}</td><td>${esc(m.distrito)}</td><td>${esc(m.direccion)}</td>
        <td>${esc(m.contactoEmail)}</td><td class="mono">${esc(coordenadas)}</td>
        <td>${campanas}</td><td>${estado}</td></tr>`;
    })
    .join('');

  return render(leer('reporteMunicipalidades.html'), {
    estilos: ESTILOS,
    logo: LOGO,
    fechaGeneracion: fecha,
    horaGeneracion: hora,
    total: d.total,
    activas: d.activas,
    inactivas: d.inactivas,
    conCampanas: d.conCampanas,
    municipalidades: filas,
  });
}

const nombreCertificado = (codigoHash) =>
  `certificado_${String(codigoHash || 'raee').replace(/[^A-Za-z0-9_-]/g, '_')}`;

async function responderCertificado(res, datos) {
  const pdf = await htmlAPdf(htmlCertificado(datos, ESTILOS, LOGO), { landscape: true });
  enviarPdf(res, pdf, nombreCertificado(datos.hashArchivo));
}

/* ---------- Endpoints ---------- */
app.post('/generar-reporte-municipalidad', autenticar, soloRoles('MUNICIPALIDAD', 'ADMIN'), async (req, res) => {
  try {
    const { municipalidadId, fechaInicio, fechaFin, categoria } = req.body || {};
    if (!municipalidadId) throw new ErrorHttp(400, 'Debe indicar la municipalidad');

    const datos = await datosMunicipalidad(municipalidadId, { fechaInicio, fechaFin, categoria }, req.usuario.token, req.usuario.rol);
    if (datos.resumen.total === 0) throw new ErrorHttp(404, 'No hay entregas para los filtros seleccionados');

    console.log(`Generando reporte de la municipalidad ${municipalidadId}...`);
    enviarPdf(res, await htmlAPdf(htmlMunicipalidad(datos)), `reporte_entregas_municipalidad_${municipalidadId}`);
  } catch (err) {
    responderError(res, err);
  }
});

app.post('/generar-reporte-superadmin', autenticar, soloRoles('ADMIN'), async (req, res) => {
  try {
    const { fechaInicio, fechaFin, categoria } = req.body || {};
    const datos = await datosSuperadmin({ fechaInicio, fechaFin, categoria }, req.usuario.token);
    if (datos.resumen.total === 0) throw new ErrorHttp(404, 'No hay entregas para los filtros seleccionados');

    console.log('Generando reporte consolidado...');
    enviarPdf(res, await htmlAPdf(htmlSuperadmin(datos)), 'reporte_entregas_consolidado');
  } catch (err) {
    responderError(res, err);
  }
});

app.post('/generar-reporte-municipalidades', autenticar, soloRoles('ADMIN'), async (req, res) => {
  try {
    const datos = await datosMunicipalidades(req.usuario.token);
    if (!datos.municipalidades.length) throw new ErrorHttp(404, 'No hay municipalidades registradas');

    console.log('Generando reporte de municipalidades...');
    enviarPdf(res, await htmlAPdf(htmlMunicipalidades(datos)), 'reporte_municipalidades');
  } catch (err) {
    responderError(res, err);
  }
});

app.post('/generar-certificado', autenticar, async (req, res) => {
  try {
    const datos = await datosPorEntrega(req.body?.entregaId, req.usuario.token);
    await responderCertificado(res, datos);
  } catch (err) {
    responderError(res, err);
  }
});

app.get('/certificado/entrega/:entregaId/pdf', autenticar, async (req, res) => {
  try {
    const datos = await datosPorEntrega(req.params.entregaId, req.usuario.token);
    await responderCertificado(res, datos);
  } catch (err) {
    responderError(res, err);
  }
});

app.get('/certificado/:codigoHash/pdf', async (req, res) => {
  try {
    const datos = await datosPorHash(req.params.codigoHash);
    await responderCertificado(res, datos);
  } catch (err) {
    responderError(res, err);
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'RAEE PDF Service', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Servicio de generación de PDF de RAEE Smart',
    endpoints: [
      'POST /generar-reporte-municipalidad',
      'POST /generar-reporte-superadmin',
      'POST /generar-reporte-municipalidades',
      'POST /generar-certificado',
      'GET /certificado/entrega/:entregaId/pdf',
      'GET /certificado/:codigoHash/pdf',
    ],
  });
});

const PORT = process.env.PORT_PDF || 3007;
app.listen(PORT, () => console.log(`Servidor de reportes RAEE corriendo en puerto ${PORT}`));

process.on('SIGINT', async () => {
  if (navegador) await (await navegador).close();
  process.exit(0);
});
