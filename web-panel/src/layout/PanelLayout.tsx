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
    grupo: 'Principal',
    enlaces: [
      { to: '/panel/municipal', label: 'Dashboard', icono: 'dashboard', end: true },
      { to: '/panel/municipal/entregas', label: 'Entregas', icono: 'scan' },
      { to: '/panel/municipal/recepcion', label: 'Recepción', icono: 'inbox' },
    ],
  },
  {
    grupo: 'Gestión',
    enlaces: [
      { to: '/panel/municipal/puntos', label: 'Puntos de entrega', icono: 'location' },
      { to: '/panel/municipal/horarios', label: 'Horarios', icono: 'clock' },
      { to: '/panel/municipal/campanas', label: 'Campañas', icono: 'calendar' },
    ],
  },
  {
    grupo: 'Análisis',
    enlaces: [
      { to: '/panel/municipal/reportes', label: 'Reportes', icono: 'chart' },
      { to: '/panel/municipal/verificar-certificado', label: 'Certificados', icono: 'qr' },
    ],
  },
];

const TITULOS: Record<string, { titulo: string; grupo: string }> = {
  '/panel/municipal': { titulo: 'Dashboard', grupo: 'Principal' },
  '/panel/municipal/entregas': { titulo: 'Entregas', grupo: 'Principal' },
  '/panel/municipal/recepcion': { titulo: 'Recepción', grupo: 'Principal' },
  '/panel/municipal/puntos': { titulo: 'Puntos de entrega', grupo: 'Gestión' },
  '/panel/municipal/horarios': { titulo: 'Horarios', grupo: 'Gestión' },
  '/panel/municipal/campanas': { titulo: 'Campañas', grupo: 'Gestión' },
  '/panel/municipal/estadisticas': { titulo: 'Estadísticas', grupo: 'Análisis' },
  '/panel/municipal/reportes': { titulo: 'Reportes', grupo: 'Análisis' },
  '/panel/municipal/verificar-certificado': {
    titulo: 'Certificados',
    grupo: 'Análisis',
  },
};

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function dividirNombreMunicipalidad(nombre: string) {
  const posicion = nombre.search(/\s+de\s+/i);
  if (posicion < 0) return { primera: nombre, segunda: '' };
  return { primera: nombre.slice(0, posicion), segunda: nombre.slice(posicion + 1) };
}

export default function PanelLayout() {
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

  const actual = TITULOS[pathname] ?? { titulo: 'Panel municipal', grupo: 'Principal' };
  const fecha = capitalizar(
    new Date().toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );
  const inicial = usuario?.nombre?.trim().charAt(0).toUpperCase() || 'M';
  const nombreMunicipalidad = usuario?.municipalidadNombre || 'Municipalidad';
  const partesNombre = dividirNombreMunicipalidad(nombreMunicipalidad);

  return (
    <div className="app-shell">
      <div
        className={`panel-scrim${menuAbierto ? ' is-open' : ''}`}
        onClick={() => setMenuAbierto(false)}
        aria-hidden="true"
      />

      <aside className={`panel-sidebar panel-sidebar--municipal${menuAbierto ? ' is-open' : ''}`}>
        <div className="panel-brand">
          <img src="/logoRAEE_Smart.png" alt="" />
          <div>
            <strong>
              RAEE <span>Smart</span>
            </strong>
            <small>Panel municipal</small>
          </div>
        </div>

        <div className="panel-sidebar__municipalidad" title={nombreMunicipalidad}>
          <Icon name="building" size={14} />
          <span>
            {partesNombre.segunda ? (
              <>
                {partesNombre.primera}
                <br />
                {partesNombre.segunda}
              </>
            ) : (
              partesNombre.primera
            )}
          </span>
        </div>

        <nav className="panel-nav" aria-label="Menú del panel municipal">
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
          <button type="button" className="panel-sidebar__logout" onClick={salir}>
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
              <b>{usuario?.municipalidadNombre || 'Municipalidad'}</b>
              <small>{usuario?.rol === 'ADMIN' ? 'Administrador' : 'Usuario municipal'}</small>
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
