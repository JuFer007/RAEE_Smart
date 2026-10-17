import React from 'react';
import Icon from './Icon';
import { COLORS, FUENTES, RADIOS, SOMBRAS } from '../theme';

const TONOS = {
  primary: { color: COLORS.primaryText, bg: COLORS.primarySoft },
  info: { color: COLORS.info, bg: COLORS.infoSoft },
  warning: { color: COLORS.warning, bg: COLORS.warningSoft },
  danger: { color: COLORS.danger, bg: COLORS.dangerSoft },
};

export default function StatsCard({ titulo, valor, detalle, icono = 'leaf', tono = 'primary', tendencia }) {
  const t = TONOS[tono] || TONOS.primary;

  return (
    <article style={styles.card}>
      <div style={{ ...styles.icono, background: t.bg }}>
        <Icon name={icono} size={20} color={t.color} />
      </div>
      <p style={styles.titulo}>{titulo}</p>
      <p style={styles.valor}>{valor}</p>
      <div style={styles.pie}>
        {tendencia ? (
          <span
            style={{
              ...styles.tendencia,
              color: tendencia.sube ? COLORS.primaryText : COLORS.danger,
              background: tendencia.sube ? COLORS.primarySoft : COLORS.dangerSoft,
            }}
          >
            <Icon name={tendencia.sube ? 'arrowUp' : 'arrowDown'} size={12} />
            {tendencia.texto}
          </span>
        ) : null}
        {detalle ? <span style={styles.detalle}>{detalle}</span> : null}
      </div>
    </article>
  );
}

const styles = {
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.lineSoft}`,
    borderRadius: RADIOS.md,
    padding: 18,
    boxShadow: SOMBRAS.card,
    minWidth: 0,
  },
  icono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    marginBottom: 14,
  },
  titulo: {
    fontFamily: FUENTES.dm,
    fontSize: 12.5,
    color: COLORS.mut,
    margin: 0,
  },
  valor: {
    fontFamily: FUENTES.manrope,
    fontSize: 27,
    fontWeight: 800,
    letterSpacing: '-0.8px',
    color: COLORS.ink,
    margin: '6px 0 10px',
    lineHeight: 1,
  },
  pie: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  tendencia: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontFamily: FUENTES.dm,
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: RADIOS.pill,
  },
  detalle: {
    fontFamily: FUENTES.dm,
    fontSize: 11.5,
    color: COLORS.mutSoft,
  },
};
