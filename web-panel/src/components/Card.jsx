import React from 'react';
import { COLORS, FUENTES, RADIOS, SOMBRAS } from '../theme';

export function Card({ titulo, subtitulo, accion, children, padding = 20, style }) {
  return (
    <section style={{ ...styles.card, padding, ...style }}>
      {(titulo || accion) && (
        <div style={styles.encabezado}>
          <div style={{ minWidth: 0 }}>
            {titulo ? <h2 style={styles.titulo}>{titulo}</h2> : null}
            {subtitulo ? <p style={styles.subtitulo}>{subtitulo}</p> : null}
          </div>
          {accion ? <div style={styles.accion}>{accion}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

const styles = {
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.lineSoft}`,
    borderRadius: RADIOS.md,
    boxShadow: SOMBRAS.card,
    minWidth: 0,
  },
  encabezado: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 16,
  },
  titulo: {
    fontFamily: FUENTES.manrope,
    fontSize: 15.5,
    fontWeight: 800,
    letterSpacing: '-0.3px',
    color: COLORS.ink,
  },
  subtitulo: { fontFamily: FUENTES.dm, fontSize: 12, color: COLORS.mut, margin: '4px 0 0' },
  accion: { flexShrink: 0 },
};
