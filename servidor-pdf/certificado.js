const fs = require('fs');
const path = require('path');
const { ErrorHttp, get } = require('./datos');
const { esc, fechaCorta, ahoraLima, render } = require('./utils');

const PLANTILLA = fs.readFileSync(path.join(__dirname, 'templates', 'certificado.html'), 'utf8');

const preparar = (datos) => {
  const { fecha, hora } = ahoraLima();
  const codigoHash = String(datos.codigoHash || '');
  const codigoQr = String(datos.codigoQr || '');
  return {
    entregaId: datos.entregaId ?? '—',
    hashArchivo: codigoHash,
    codigoHash: esc(codigoHash || '—'),
    codigoQr: esc(codigoQr || '—'),
    qr: datos.qrImagenBase64
      ? `<img src="data:image/png;base64,${datos.qrImagenBase64}" alt="Código QR del certificado">`
      : '<div class="qr-vacio">Código QR no disponible</div>',
    categoria: esc(datos.nombreCategoria || datos.tipoAparato || 'RAEE'),
    personaNombre: esc(datos.personaNombre || 'No registrado'),
    personaDni: esc(datos.personaDni || 'No registrado'),
    punto: esc(datos.puntoEntregaNombre || 'Punto de acopio'),
    fechaEntrega: fechaCorta(datos.fechaEntrega),
    fechaEmision: fechaCorta(datos.fechaEmision),
    fechaGeneracion: fecha,
    horaGeneracion: hora,
    anio: new Date().getFullYear(),
  };
};

async function datosPorEntrega(entregaId, token) {
  const id = String(entregaId ?? '').trim();
  if (!/^\d+$/.test(id)) throw new ErrorHttp(400, 'Debe indicar una entrega válida');
  return preparar(await get(`/certificados/entrega/${id}`, token));
}

async function datosPorHash(codigoHash) {
  const hash = String(codigoHash ?? '').trim();
  if (!hash) throw new ErrorHttp(400, 'Debe indicar un código de certificado');
  return preparar(await get(`/certificados/verificar/${encodeURIComponent(hash)}`));
}

const htmlCertificado = (datos, estilos, logo) =>
  render(PLANTILLA, { estilos, logo, ...datos });

module.exports = { datosPorEntrega, datosPorHash, htmlCertificado };
