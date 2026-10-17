import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { COLORS, FUENTES, RADIOS } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ titulo, subtitulo, acciones }) {
  const { cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const salir = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <header style={styles.barra}>
      <div style={{ minWidth: 0 }}>
        <h1 style={styles.titulo}>{titulo}</h1>
        {subtitulo ? <p style={styles.subtitulo}>{subtitulo}</p> : null}
      </div>

      <div style={styles.acciones}>
        {acciones}
        <button type="button" style={styles.iconoBoton} title="Notificaciones">
          <Icon name="bell" size={19} color={COLORS.inkItem} />
          <span style={styles.punto} />
        </button>
        <button type="button" style={styles.salir} onClick={salir}>
          <Icon name="logout" size={17} color={COLORS.secondary} />
          Salir
        </button>
      </div>
    </header>
  );
}

const styles = {
  barra: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
    padding: '22px 28px 6px',
    maxWidth: 1360,
    width: '100%',
    margin: '0 auto',
  },
  titulo: {
    fontFamily: FUENTES.manrope,
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: '-0.6px',
    color: COLORS.ink,
  },
  subtitulo: {
    fontFamily: FUENTES.dm,
    fontSize: 13,
    color: COLORS.mut,
    margin: '5px 0 0',
  },
  acciones: { display: 'flex', alignItems: 'center', gap: 10 },
  iconoBoton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: RADIOS.campo,
    border: `1px solid ${COLORS.lineSoft}`,
    background: COLORS.surface,
    display: 'grid',
    placeItems: 'center',
  },
  punto: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: COLORS.notif,
    border: `1.5px solid ${COLORS.surface}`,
  },
  salir: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    height: 40,
    padding: '0 15px',
    borderRadius: RADIOS.campo,
    border: `1px solid ${COLORS.secondaryBorder}`,
    background: COLORS.surface,
    color: COLORS.secondary,
    fontFamily: FUENTES.dm,
    fontSize: 13,
    fontWeight: 700,
  },
};
