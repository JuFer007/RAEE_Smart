import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { COLORS, FUENTES, RADIOS, SOMBRAS } from '../theme';
import { useAuth } from '../context/AuthContext';

const BENEFICIOS = [
  { icono: 'list', texto: 'Monitorea las entregas de RAEE de tu distrito' },
  { icono: 'chart', texto: 'Reportes y estadísticas para la gestión municipal' },
  { icono: 'qr', texto: 'Certificados digitales verificables con QR' },
];

export default function Login() {
  const { autenticado, iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin.chiclayo@raee.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  if (autenticado) return <Navigate to="/panel" replace />;

  const enviar = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Ingresa tu correo y contraseña');
      return;
    }
    setCargando(true);
    setTimeout(() => {
      iniciarSesion({ email: email.trim() });
      navigate('/panel', { replace: true });
    }, 450);
  };

  return (
    <div style={styles.pantalla}>
      <div style={styles.lado}>
        <div style={styles.ladoFondo} />
        <img src="/logoRectangular.png" alt="RAEE Smart" style={styles.logo} />
        <h1 style={styles.ladoTitulo}>
          Panel municipal
          <br />
          RAEE Smart
        </h1>
        <p style={styles.ladoTexto}>
          Gestión inteligente de residuos de aparatos eléctricos y electrónicos en Chiclayo y Lambayeque.
        </p>

        <ul style={styles.beneficios}>
          {BENEFICIOS.map((b) => (
            <li key={b.texto} style={styles.beneficio}>
              <span style={styles.beneficioIcono}>
                <Icon name={b.icono} size={16} color={COLORS.primaryText} />
              </span>
              {b.texto}
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.ladoFormulario}>
        <form style={styles.formulario} onSubmit={enviar}>
          <span style={styles.eyebrow}>Acceso institucional</span>
          <h2 style={styles.formTitulo}>Inicia sesión</h2>
          <p style={styles.formTexto}>Ingresa con la cuenta de tu municipalidad.</p>

          <label style={styles.label}>
            Correo electrónico
            <div style={styles.campo}>
              <Icon name="users" size={17} color={COLORS.mutIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@raee.com"
                style={styles.input}
                autoComplete="username"
              />
            </div>
          </label>

          <label style={styles.label}>
            Contraseña
            <div style={styles.campo}>
              <Icon name="refresh" size={17} color={COLORS.mutIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                style={styles.input}
                autoComplete="current-password"
              />
            </div>
          </label>

          {error ? (
            <div style={styles.error}>
              <Icon name="alert" size={15} color={COLORS.danger} />
              {error}
            </div>
          ) : null}

          <button type="submit" style={styles.boton} disabled={cargando}>
            {cargando ? 'Ingresando…' : 'Ingresar al panel'}
            {!cargando && <Icon name="chevronRight" size={17} color={COLORS.white} />}
          </button>

          <p style={styles.demo}>
            Demo: <b>admin.chiclayo@raee.com</b> · contraseña <b>123456</b>
          </p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  pantalla: {
    display: 'grid',
    gridTemplateColumns: '1.05fr 1fr',
    minHeight: '100vh',
    background: COLORS.bg,
  },
  lado: {
    position: 'relative',
    overflow: 'hidden',
    padding: '54px 56px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: `linear-gradient(150deg, ${COLORS.gradA}, ${COLORS.gradB})`,
    color: COLORS.white,
  },
  ladoFondo: {
    position: 'absolute',
    width: 460,
    height: 460,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    top: -140,
    right: -120,
  },
  logo: { height: 54, width: 'fit-content', position: 'relative', zIndex: 1 },
  ladoTitulo: {
    fontFamily: FUENTES.manrope,
    fontSize: 38,
    lineHeight: '44px',
    fontWeight: 800,
    letterSpacing: '-1px',
    color: COLORS.white,
    margin: '26px 0 14px',
    position: 'relative',
    zIndex: 1,
  },
  ladoTexto: {
    fontFamily: FUENTES.dm,
    fontSize: 15,
    lineHeight: '23px',
    color: 'rgba(255,255,255,0.85)',
    maxWidth: 420,
    margin: 0,
    position: 'relative',
    zIndex: 1,
  },
  beneficios: {
    listStyle: 'none',
    padding: 0,
    margin: '32px 0 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    position: 'relative',
    zIndex: 1,
  },
  beneficio: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontFamily: FUENTES.dm,
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.92)',
  },
  beneficioIcono: {
    width: 34,
    height: 34,
    borderRadius: 11,
    background: COLORS.white,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },
  ladoFormulario: {
    display: 'grid',
    placeItems: 'center',
    padding: 40,
  },
  formulario: {
    width: '100%',
    maxWidth: 380,
    background: COLORS.surface,
    border: `1px solid ${COLORS.lineSoft}`,
    borderRadius: RADIOS.lg,
    padding: '34px 32px',
    boxShadow: SOMBRAS.flotante,
  },
  eyebrow: {
    fontFamily: FUENTES.dm,
    fontSize: 10.5,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.primaryText,
    fontWeight: 700,
  },
  formTitulo: {
    fontFamily: FUENTES.manrope,
    fontSize: 25,
    fontWeight: 800,
    letterSpacing: '-0.8px',
    color: COLORS.ink,
    margin: '8px 0 6px',
  },
  formTexto: { fontFamily: FUENTES.dm, fontSize: 13, color: COLORS.mut, margin: '0 0 24px' },
  label: {
    display: 'block',
    fontFamily: FUENTES.dm,
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.inkHeading,
    marginBottom: 16,
  },
  campo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 7,
    padding: '0 13px',
    height: 46,
    border: `1px solid ${COLORS.line}`,
    borderRadius: RADIOS.campo,
    background: COLORS.bgTop,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: FUENTES.dm,
    fontSize: 14,
    color: COLORS.ink,
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: FUENTES.dm,
    fontSize: 12.5,
    color: COLORS.danger,
    background: COLORS.dangerSoft,
    borderRadius: RADIOS.campo,
    padding: '10px 12px',
    marginBottom: 14,
  },
  boton: {
    width: '100%',
    height: 48,
    border: 'none',
    borderRadius: RADIOS.boton,
    background: `linear-gradient(135deg, ${COLORS.gradA}, ${COLORS.gradB})`,
    color: COLORS.white,
    fontFamily: FUENTES.dm,
    fontSize: 14.5,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: SOMBRAS.hero,
    marginTop: 4,
  },
  demo: {
    fontFamily: FUENTES.dm,
    fontSize: 11.5,
    color: COLORS.mut,
    textAlign: 'center',
    margin: '18px 0 0',
  },
};
