import React from 'react';
import Icon from './Icon';
import { COLORS, FUENTES, RADIOS } from '../theme';

export function BarChart({ datos = [], alto = 200 }) {
  const max = Math.max(1, ...datos.map((d) => d.total));
  return (
    <div style={{ ...styles.barZona, height: alto }}>
      {datos.map((d) => {
        const pct = (d.total / max) * 100;
        return (
          <div key={d.label} style={styles.barColumna}>
            <span style={styles.barValor}>{d.total}</span>
            <div style={styles.barPista}>
              <div
                style={{
                  ...styles.barRelleno,
                  height: `${Math.max(pct, d.total > 0 ? 4 : 0)}%`,
                }}
              />
            </div>
            <span style={styles.barLabel}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function BarList({ datos = [] }) {
  const max = Math.max(1, ...datos.map((d) => d.total));
  return (
    <div style={styles.lista}>
      {datos.map((d) => (
        <div key={d.label} style={styles.listaFila}>
          <span style={styles.listaIcono}>
            <Icon name={d.icono || 'leaf'} size={16} color={COLORS.secondary} />
          </span>
          <div style={styles.listaCuerpo}>
            <div style={styles.listaEncabezado}>
              <span style={styles.listaNombre}>{d.label}</span>
              <span style={styles.listaTotal}>{d.total}</span>
            </div>
            <div style={styles.listaPista}>
              <div style={{ ...styles.listaRelleno, width: `${(d.total / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Donut({ datos = [], size = 190, grosor = 26 }) {
  const total = datos.reduce((acc, d) => acc + d.total, 0) || 1;
  const radio = (size - grosor) / 2;
  const circunferencia = 2 * Math.PI * radio;
  let acumulado = 0;

  return (
    <div style={styles.donutFila}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radio} fill="none" stroke={COLORS.lineInner} strokeWidth={grosor} />
        {datos.map((d) => {
          const fraccion = d.total / total;
          const largo = fraccion * circunferencia;
          const offset = -acumulado;
          acumulado += largo;
          if (!d.total) return null;
          return (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={radio}
              fill="none"
              stroke={d.color}
              strokeWidth={grosor}
              strokeDasharray={`${largo} ${circunferencia - largo}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div style={styles.leyendaLista}>
        {datos.map((d) => (
          <div key={d.label} style={styles.leyendaItem}>
            <span style={{ ...styles.leyendaPunto, background: d.color }} />
            <span style={styles.leyendaLabel}>{d.label}</span>
            <span style={styles.leyendaTotal}>{d.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  barZona: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: 8,
  },
  barColumna: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValor: { fontFamily: FUENTES.dm, fontSize: 11, fontWeight: 700, color: COLORS.inkItem },
  barPista: {
    width: '100%',
    maxWidth: 34,
    flex: 1,
    minHeight: 0,
    display: 'flex',
    alignItems: 'flex-end',
    background: COLORS.primaryPale,
    borderRadius: RADIOS.sm,
    overflow: 'hidden',
  },
  barRelleno: {
    width: '100%',
    background: `linear-gradient(180deg, ${COLORS.gradB}, ${COLORS.gradA})`,
    borderRadius: RADIOS.sm,
    transition: 'height 0.4s ease',
  },
  barLabel: { fontFamily: FUENTES.dm, fontSize: 10.5, color: COLORS.mut },
  lista: { display: 'flex', flexDirection: 'column', gap: 14 },
  listaFila: { display: 'flex', alignItems: 'center', gap: 11 },
  listaIcono: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: COLORS.primarySoft,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  listaCuerpo: { flex: 1, minWidth: 0 },
  listaEncabezado: { display: 'flex', justifyContent: 'space-between', marginBottom: 5 },
  listaNombre: { fontFamily: FUENTES.dm, fontSize: 12.5, fontWeight: 600, color: COLORS.inkItem },
  listaTotal: { fontFamily: FUENTES.dm, fontSize: 12.5, fontWeight: 700, color: COLORS.secondary },
  listaPista: { height: 7, background: COLORS.primaryPale, borderRadius: RADIOS.pill, overflow: 'hidden' },
  listaRelleno: {
    height: '100%',
    background: `linear-gradient(90deg, ${COLORS.gradA}, ${COLORS.gradB})`,
    borderRadius: RADIOS.pill,
    transition: 'width 0.4s ease',
  },
  donutFila: { display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
  leyendaLista: { display: 'flex', flexDirection: 'column', gap: 10, minWidth: 150 },
  leyendaItem: { display: 'flex', alignItems: 'center', gap: 9 },
  leyendaPunto: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  leyendaLabel: { fontFamily: FUENTES.dm, fontSize: 12.5, color: COLORS.inkItem, flex: 1 },
  leyendaTotal: { fontFamily: FUENTES.dm, fontSize: 12.5, fontWeight: 700, color: COLORS.secondary },
};
