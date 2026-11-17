const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const render = (plantilla, vars) =>
  plantilla.replace(/{{(\w+)}}/g, (_, clave) => (clave in vars ? vars[clave] : ''));

const fechaCorta = (iso) =>
  iso ? new Date(iso).toLocaleDateString('es-PE', { timeZone: 'America/Lima' }) : '—';

const fechaDesdeYMD = (ymd) => (ymd ? ymd.split('-').reverse().join('/') : null);

const ahoraLima = () => {
  const d = new Date();
  return {
    fecha: d.toLocaleDateString('es-PE', { timeZone: 'America/Lima' }),
    hora: d.toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' }),
  };
};

module.exports = { esc, render, fechaCorta, fechaDesdeYMD, ahoraLima };
