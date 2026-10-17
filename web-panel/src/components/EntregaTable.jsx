import React from 'react';
import Icon from './Icon';
import { COLORS, FUENTES, RADIOS, obtenerInfoTipo, obtenerEstado } from '../theme';
import { formatearFechaHora } from '../data/mockData';

function ChipEstado({ estado }) {
  const e = obtenerEstado(estado);
  return (
    <span style={{ ...styles.chip, background: e.bg, color: e.color }}>{e.label}</span>
  );
}

export default function EntregaTable({ entregas = [], maxFilas, onSeleccionar }) {
  const filas = typeof maxFilas === 'number' ? entregas.slice(0, maxFilas) : entregas;

  if (!filas.length) {
    return (
      <div style={styles.vacio}>
        <Icon name="leaf" size={30} color={COLORS.mut} />
        <p style={styles.vacioTexto}>No hay entregas para mostrar</p>
      </div>
    );
  }

  return (
    <div style={styles.envoltorio}>
      <table style={styles.tabla}>
        <thead>
          <tr>
            <th style={styles.th}>Aparato</th>
            <th style={styles.th}>Ciudadano</th>
            <th style={styles.th}>Punto de acopio</th>
            <th style={styles.th}>Fecha</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Peso</th>
            <th style={styles.th}>Estado</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Certificado</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((e) => {
            const info = obtenerInfoTipo(e.tipoRaee);
            return (
              <tr
                key={e.id}
                style={{ ...styles.tr, cursor: onSeleccionar ? 'pointer' : 'default' }}
                onClick={onSeleccionar ? () => onSeleccionar(e) : undefined}
              >
                <td style={styles.td}>
                  <div style={styles.aparato}>
                    <span style={styles.aparatoIcono}>
                      <Icon name={info.icono} size={17} color={COLORS.secondary} />
                    </span>
                    <div>
                      <p style={styles.aparatoNombre}>{e.nombreCategoriaVisible || info.nombre}</p>
                      <p style={styles.aparatoTipo}>
                        {info.nombre}
                        {e.clasificacionCorregida ? ' · corregido' : ''}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>
                  <p style={styles.celdaFuerte}>{e.usuarioNombre || '—'}</p>
                  <p style={styles.celdaSuave}>DNI {e.dni || '—'}</p>
                </td>
                <td style={styles.td}>
                  <p style={styles.celdaFuerte}>{e.puntoRecoleccionNombre || 'Por asignar'}</p>
                  <p style={styles.celdaSuave}>{e.puntoRecoleccionDireccion || '—'}</p>
                </td>
                <td style={styles.td}>
                  <span style={styles.celdaSuave}>{formatearFechaHora(e.fechaRegistro)}</span>
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <span style={styles.peso}>{e.pesoKg != null ? `${e.pesoKg} kg` : '—'}</span>
                </td>
                <td style={styles.td}>
                  <ChipEstado estado={e.estado} />
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  {e.certificadoCodigoQr ? (
                    <span style={styles.certificado}>
                      <Icon name="qr" size={13} color={COLORS.primaryText} />
                      {e.certificadoCodigoQr}
                    </span>
                  ) : (
                    <span style={styles.celdaSuave}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  envoltorio: {
    overflowX: 'auto',
    borderRadius: RADIOS.md,
    border: `1px solid ${COLORS.lineSoft}`,
    background: COLORS.surface,
  },
  tabla: { width: '100%', borderCollapse: 'collapse', minWidth: 880 },
  th: {
    textAlign: 'left',
    fontFamily: FUENTES.dm,
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: COLORS.mut,
    padding: '13px 16px',
    background: COLORS.primaryPale,
    borderBottom: `1px solid ${COLORS.lineSoft}`,
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: `1px solid ${COLORS.lineInner}` },
  td: { padding: '12px 16px', verticalAlign: 'middle' },
  aparato: { display: 'flex', alignItems: 'center', gap: 10 },
  aparatoIcono: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: COLORS.primarySoft,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  aparatoNombre: {
    fontFamily: FUENTES.dm,
    fontSize: 13.5,
    fontWeight: 600,
    color: COLORS.inkItem,
    margin: 0,
  },
  aparatoTipo: { fontFamily: FUENTES.dm, fontSize: 10.5, color: COLORS.mut, margin: '2px 0 0' },
  celdaFuerte: {
    fontFamily: FUENTES.dm,
    fontSize: 12.5,
    color: COLORS.inkItem,
    margin: 0,
    whiteSpace: 'nowrap',
  },
  celdaSuave: {
    fontFamily: FUENTES.dm,
    fontSize: 11,
    color: COLORS.mut,
    margin: 0,
    whiteSpace: 'nowrap',
  },
  peso: {
    fontFamily: FUENTES.dm,
    fontSize: 12.5,
    fontWeight: 600,
    color: COLORS.secondary,
    whiteSpace: 'nowrap',
  },
  chip: {
    display: 'inline-block',
    fontFamily: FUENTES.dm,
    fontSize: 11,
    fontWeight: 700,
    padding: '5px 10px',
    borderRadius: RADIOS.pill,
    whiteSpace: 'nowrap',
  },
  certificado: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontFamily: FUENTES.dm,
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.primaryText,
    whiteSpace: 'nowrap',
  },
  vacio: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '46px 20px',
    background: COLORS.surface,
    border: `1px solid ${COLORS.lineSoft}`,
    borderRadius: RADIOS.md,
  },
  vacioTexto: { fontFamily: FUENTES.dm, fontSize: 13, color: COLORS.mut, margin: 0 },
};
