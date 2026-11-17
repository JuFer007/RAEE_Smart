const { esc } = require('./utils');

const VERDE = '#079150';
const PALETA = ['#079150', '#41AE36', '#A0D86C', '#126155', '#67BE52', '#8ED8AE', '#237DDB', '#709087'];

const recortar = (txt, max) => (txt.length > max ? `${txt.slice(0, max - 1)}…` : txt);

// Barras horizontales en SVG: [{ nombre, cantidad }]
function barras(items, { color = VERDE, max = 8 } = {}) {
  const datos = items.slice(0, max);
  if (!datos.length || !datos.some((d) => d.cantidad)) return '<div class="vacio">Sin datos</div>';
  const tope = Math.max(...datos.map((d) => d.cantidad));
  const alto = 22;
  const filas = datos
    .map((d, i) => {
      const y = i * alto;
      const ancho = Math.max(2, (d.cantidad / tope) * 150);
      return `<text x="0" y="${y + 13}" font-size="9" fill="#123D39">${esc(recortar(d.nombre, 26))}</text>
        <rect x="135" y="${y + 4}" width="150" height="9" rx="2" fill="#EDF4F0"/>
        <rect x="135" y="${y + 4}" width="${ancho}" height="9" rx="2" fill="${color}"/>
        <text x="295" y="${y + 13}" font-size="9" font-weight="700" fill="#103B35">${d.cantidad}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 320 ${datos.length * alto}" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Helvetica, Arial, sans-serif">${filas}</svg>`;
}

// Dona en SVG con leyenda HTML: [{ label, cantidad, color }]
function dona(items, tituloCentro = 'entregas') {
  const total = items.reduce((s, i) => s + i.cantidad, 0);
  if (!total) return '<div class="vacio">Sin datos</div>';
  const r = 40;
  const c = 2 * Math.PI * r;
  let acumulado = 0;
  const arcos = items
    .filter((i) => i.cantidad)
    .map((i) => {
      const largo = (i.cantidad / total) * c;
      const arco = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${i.color}" stroke-width="16" stroke-dasharray="${largo} ${c - largo}" stroke-dashoffset="${-acumulado}"/>`;
      acumulado += largo;
      return arco;
    })
    .join('');
  const leyenda = items
    .filter((i) => i.cantidad)
    .map((i) => `<li><i style="background:${i.color}"></i><span>${esc(i.label)}</span><b>${i.cantidad}</b></li>`)
    .join('');
  return `<div class="dona">
    <svg viewBox="0 0 120 120" width="112" height="112" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Helvetica, Arial, sans-serif">
      <g transform="rotate(-90 60 60)">${arcos}</g>
      <text x="60" y="61" text-anchor="middle" font-size="18" font-weight="700" fill="#103B35">${total}</text>
      <text x="60" y="74" text-anchor="middle" font-size="8" fill="#709087">${esc(tituloCentro)}</text>
    </svg>
    <ul class="leyenda">${leyenda}</ul>
  </div>`;
}

const conColores = (items) => items.map((i, n) => ({ label: i.nombre, cantidad: i.cantidad, color: PALETA[n % PALETA.length] }));

module.exports = { barras, dona, conColores };
