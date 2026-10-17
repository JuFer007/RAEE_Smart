import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import { COLORS, FUENTES, RADIOS, SOMBRAS } from '../theme';
import { useAuth } from '../context/AuthContext';

const ITEMS = [
  { to: '/panel', label: 'Resumen', icono: 'dashboard', end: true },
  { to: '/panel/entregas', label: 'Entregas', icono: 'list' },
  { to: '/panel/estadisticas', label: 'Estadísticas', icono: 'chart' },
  { to: '/panel/puntos', label: 'Puntos de acopio', icono: 'location' },
];

export default function Sidebar() {
  const { usuario } = useAuth();

  return (
    <aside style={styles.aside}>
      <div style={styles.marca}>
        <img src="/logoRectangular.png" alt="RAEE Smart" style={styles.logo} />
        <span style={styles.marcaTag}>Panel municipal</span>
      </div>

      <nav style={styles.nav}>
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({ ...styles.item, ...(isActive ? styles.itemActivo : {}) })}
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icono} size={19} color={isActive ? COLORS.primaryText : COLORS.mutIcon} />
                <span style={{ ...styles.itemTexto, color: isActive ? COLORS.primaryText : COLORS.inkItem }}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={styles.tarjeta}>
        <div style={styles.tarjetaIcono}>
          <Icon name="calendar" size={16} color={COLORS.primaryText} />
        </div>
        <p style={styles.tarjetaTitulo}>Campañas activas</p>
        <p style={styles.tarjetaTexto}>Gestiona jornadas de acopio y consulta su vigencia.</p>
        <NavLink to="/panel/estadisticas" style={styles.tarjetaLink}>
          Ver detalle
        </NavLink>
      </div>

      <div style={styles.pie}>
        <div style={styles.avatar}>{(usuario?.nombre || 'A').trim().charAt(0)}</div>
        <div style={{ minWidth: 0 }}>
          <p style={styles.pieNombre}>{usuario?.nombre || 'Administrador'}</p>
          <p style={styles.pieRol}>{usuario?.municipalidadNombre || 'RAEE Smart'}</p>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  aside: {
    width: 258,
    flexShrink: 0,
    background: COLORS.surface,
    borderRight: `1px solid ${COLORS.lineSoft}`,
    display: 'flex',
    flexDirection: 'column',
    padding: '22px 16px 18px',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  marca: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
    padding: '0 8px 20px',
  },
  logo: { height: 46, width: 'auto', objectFit: 'contain' },
  marcaTag: {
    fontFamily: FUENTES.dm,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: COLORS.mut,
  },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '11px 13px',
    borderRadius: RADIOS.boton,
    transition: 'background 0.15s ease',
  },
  itemActivo: {
    background: COLORS.primarySoft,
  },
  itemTexto: {
    fontFamily: FUENTES.dm,
    fontSize: 14,
    fontWeight: 600,
  },
  tarjeta: {
    margin: '14px 4px 0',
    background: COLORS.primaryPale,
    border: `1px solid ${COLORS.primaryRing}`,
    borderRadius: RADIOS.md,
    padding: 15,
    boxShadow: SOMBRAS.card,
  },
  tarjetaIcono: {
    width: 30,
    height: 30,
    borderRadius: 9,
    background: COLORS.primarySoft2,
    display: 'grid',
    placeItems: 'center',
    marginBottom: 9,
  },
  tarjetaTitulo: {
    fontFamily: FUENTES.manrope,
    fontSize: 13.5,
    fontWeight: 800,
    color: COLORS.ink,
    margin: '0 0 4px',
  },
  tarjetaTexto: {
    fontFamily: FUENTES.dm,
    fontSize: 11.5,
    lineHeight: '16px',
    color: COLORS.mut,
    margin: '0 0 10px',
  },
  tarjetaLink: {
    fontFamily: FUENTES.dm,
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.primaryText,
  },
  pie: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: '12px 8px 0',
    borderTop: `1px solid ${COLORS.lineSoft}`,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${COLORS.gradA}, ${COLORS.gradB})`,
    color: COLORS.white,
    fontFamily: FUENTES.manrope,
    fontWeight: 800,
    fontSize: 15,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  pieNombre: {
    fontFamily: FUENTES.dm,
    fontSize: 12.5,
    fontWeight: 600,
    color: COLORS.inkItem,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pieRol: {
    fontFamily: FUENTES.dm,
    fontSize: 10.5,
    color: COLORS.mut,
    margin: '2px 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};
