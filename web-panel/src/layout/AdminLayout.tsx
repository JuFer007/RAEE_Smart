import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import './panel.css';

type EnlaceNav = {
  to: string;
  label: string;
  icono: string;
  end?: boolean;
};

const NAVEGACION: { grupo: string; enlaces: EnlaceNav[] }[] = [
  {
    grupo: 'Administración',
    enlaces: [
      { to: '/panel', label: 'Resumen general', icono: 'dashboard', end: true },
      { to: '/panel/municipalidades', label: 'Municipalidades', icono: 'building' },
    ],
  },
  {
    grupo: 'Análisis',
    enlaces: [
      { to: '/panel/reportes', label: 'Reportes consolidados', icono: 'file' },
      { to: '/panel/calidad-ia', label: 'Calidad de la IA', icono: 'sparkles' },
    ],
  },
];

const TITULOS: Record<string, { titulo: string; grupo: string }> = {
  '/panel': { titulo: 'Resumen general', grupo: 'Administración' },
  '/panel/municipalidades': { titulo: 'Municipalidades', grupo: 'Administración' },
  '/panel/reportes': { titulo: 'Reportes consolidados', grupo: 'Análisis' },
  '/panel/calidad-ia': { titulo: 'Calidad de la IA', grupo: 'Análisis' },
};

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function AdminLayout() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  const salir = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  const actual = TITULOS[pathname] ?? { titulo: 'Administración', grupo: 'Administración' };
  const fecha = capitalizar(
    new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );
  const inicial = usuario?.nombre?.trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className="app-shell">
      <div
        className={`panel-scrim${menuAbierto ? ' is-open' : ''}`}
        onClick={() => setMenuAbierto(false)}
        aria-hidden="true"
      />

      <aside className={`panel-sidebar${menuAbierto ? ' is-open' : ''}`}>
        <div className="panel-brand">
          <img src="/logoRAEE_Smart.png" alt="" />
          <div>
            <strong>
              RAEE <span>Smart</span>
            </strong>
            <small>Superadministración</small>
          </div>
        </div>

        <nav className="panel-nav" aria-label="Menú de superadministración">
          {NAVEGACION.map((grupo) => (
            <div key={grupo.grupo} className="panel-nav__grupo">
              <span className="panel-nav__titulo">{grupo.grupo}</span>
              {grupo.enlaces.map((enlace) => (
                <NavLink
                  key={enlace.to}
                  to={enlace.to}
                  end={enlace.end}
                  className={({ isActive }) =>
                    `panel-nav__link${isActive ? ' is-active' : ''}`
                  }
                  onClick={() => setMenuAbierto(false)}
                >
                  <Icon name={enlace.icono} size={17} />
                  <span className="panel-nav__label">{enlace.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="panel-sidebar__footer">
          <div className="panel-sidebar__usuario">
            <span>{inicial}</span>
            <div>
              <b>{usuario?.nombre}</b>
              <small>Superadministrador</small>
            </div>
          </div>
          <button type="button" className="panel-logout" onClick={salir}>
            <Icon name="logout" size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="panel-main">
        <header className="panel-header">
          <button
            type="button"
            className="panel-burger"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
          >
            <Icon name="menu" size={19} />
          </button>
          <div className="panel-header__titulo">
            <h1>{actual.titulo}</h1>
            <p>{fecha}</p>
          </div>
          <div className="panel-user">
            <span>{inicial}</span>
            <div>
              <b>{usuario?.nombre}</b>
              <small>Acceso global</small>
            </div>
          </div>
        </header>

        <main className="panel-content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
