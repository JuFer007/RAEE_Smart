import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { usuario, cargando, iniciarSesion, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordarSesion, setRecordarSesion] = useState(true);
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(
    parametros.get('motivo') === 'expirada'
      ? 'Tu sesión expiró. Inicia sesión nuevamente.'
      : '',
  );
  const [enviando, setEnviando] = useState(false);

  if (!cargando && usuario?.municipalidadId) {
    return <Navigate to="/panel/municipal" replace />;
  }

  if (!cargando && usuario?.rol === 'ADMIN' && !usuario.municipalidadId) {
    return <Navigate to="/panel" replace />;
  }

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setError('');
    setAviso('');

    if (!email.trim() || !password.trim()) {
      setError('Ingresa tu usuario y contraseña.');
      return;
    }

    setEnviando(true);
    try {
      const sesion = await iniciarSesion(email, password, recordarSesion);
      if (!sesion.municipalidadId && sesion.rol !== 'ADMIN') {
        cerrarSesion();
        setError('Esta cuenta no tiene acceso al panel municipal.');
        return;
      }

      navigate(sesion.municipalidadId ? '/panel/municipal' : '/panel', {
        replace: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="wrap">
        <main className="left">
          <img className="logo" src="/login/logo.png" alt="RAEE Smart" />
          <span className="badge">Acceso al panel municipal</span>
          <h1>
            Iniciar <em>sesión</em>
          </h1>
          <p className="sub">
            Ingresa con la cuenta de tu municipalidad para dar seguimiento a las
            entregas de RAEE.
          </p>

          <form onSubmit={enviar} noValidate>
            <div className="field">
              <label htmlFor="login-usuario">Usuario</label>
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
              <input
                id="login-usuario"
                type="email"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                placeholder="Ingresa tu usuario"
                autoComplete="username"
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">Contraseña</label>
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                id="login-password"
                type={verPassword ? 'text' : 'password'}
                value={password}
                onChange={(evento) => setPassword(evento.target.value)}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye"
                onClick={() => setVerPassword((visible) => !visible)}
                aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  {verPassword ? <path d="m4 4 16 16" /> : null}
                </svg>
              </button>
            </div>

            <div className="row">
              <label className="chk">
                <input
                  type="checkbox"
                  checked={recordarSesion}
                  onChange={(evento) => setRecordarSesion(evento.target.checked)}
                />
                Recordar sesión
              </label>
              <a
                href="#"
                onClick={(evento) => {
                  evento.preventDefault();
                  setError('');
                  setAviso('La recuperación de contraseña estará disponible próximamente.');
                }}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <div className={`msg${aviso ? ' ok' : ''}`} role="alert">
              {error || aviso}
            </div>

            <button className="btn" type="submit" disabled={enviando || cargando}>
              <svg
                className="btn__icono"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
                <path d="M10 8l4 4-4 4M14 12H4" />
              </svg>
              <span>{enviando ? 'Ingresando...' : 'Iniciar sesión'}</span>
            </button>
          </form>

          <p className="foot">Juntos por un Chiclayo más limpio</p>
        </main>

        <aside className="right" aria-hidden="true">
          <div className="marca" />
          <div className="stage">
            <div className="cluster">
              <div className="telefono p1">
                <div className="telefono__pantalla">
                  <img className="telefono__img" src="/login/telefono-1.jpg" alt="" />
                </div>
              </div>
              <div className="telefono p2">
                <div className="telefono__pantalla">
                  <img className="telefono__img" src="/login/telefono-2.jpg" alt="" />
                </div>
              </div>
              <div className="telefono p3">
                <div className="telefono__pantalla">
                  <img className="telefono__img" src="/login/telefono-3.jpg" alt="" />
                </div>
              </div>
            </div>
          </div>
          <div className="cap">
            <span className="chip">
              <i />
              Reportes y estadísticas
            </span>
            <span className="chip">
              <i />
              Certificado digital con QR
            </span>
            <span className="chip">
              <i />
              Puntos de acopio cercanos
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
