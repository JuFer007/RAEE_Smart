import { useEffect, useRef, useState } from 'react';
import { SLIDES, PASOS, CATEGORIAS, PUNTOS } from './landingData';
import Icon from '../components/Icon';
import MapView from '../components/MapView';
import type { Punto } from '../types';
import './landing.css';

const INTERVALO_MS = 6000;

function TelefonoMock({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`telefono ${className}`.trim()}>
      <div className="telefono__pantalla">
        <img src={src} alt={alt} className="telefono__img" loading="lazy" />
      </div>
    </div>
  );
}

function ListaPuntos({ puntos }: { puntos: Punto[] }) {
  const listaRef = useRef<HTMLDivElement>(null);
  const pausaRef = useRef(false);
  const [reducir] = useState(
    () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
  );

  useEffect(() => {
    const el = listaRef.current;
    if (!el || reducir) return undefined;

    const VELOCIDAD = 16; // píxeles por segundo (lento y sutil)
    let raf = 0;
    let ultimo = performance.now();
    let ciclo = 0;
    let pos = el.scrollTop;

    const medir = () => {
      const primero = el.children[0];
      const segundo = el.children[1];
      ciclo = primero && segundo
        ? segundo.getBoundingClientRect().top - primero.getBoundingClientRect().top
        : 0;
    };

    const paso = (ahora: number) => {
      const dt = Math.min((ahora - ultimo) / 1000, 0.05);
      ultimo = ahora;
      if (!ciclo) medir();
      if (ciclo && el.scrollHeight > el.clientHeight + 4) {
        if (pausaRef.current) {
          pos = el.scrollTop; // sincroniza si el usuario interactúa
        } else {
          pos += VELOCIDAD * dt;
          if (pos >= ciclo) pos -= ciclo;
          el.scrollTop = pos;
        }
      }
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    window.addEventListener('resize', medir);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', medir);
    };
  }, [reducir]);

  const fila = (p: Punto) => (
    <li key={p.id}>
      <span className="puntos-lista__icono" aria-hidden="true">
        <Icon name="location" size={18} />
      </span>
      <div className="puntos-lista__info">
        <strong>{p.nombre}</strong>
        <span>{p.direccion}</span>
        <span className="puntos-lista__horario">
          <Icon name="clock" size={13} />
          {p.horario}
        </span>
      </div>
    </li>
  );

  return (
    <div
      className="puntos-lista"
      ref={listaRef}
      onMouseEnter={() => (pausaRef.current = true)}
      onMouseLeave={() => (pausaRef.current = false)}
      onFocus={() => (pausaRef.current = true)}
      onBlur={() => (pausaRef.current = false)}
    >
      <ul className="puntos-lista__grupo">{puntos.map(fila)}</ul>
      {!reducir && (
        <ul className="puntos-lista__grupo" aria-hidden="true">
          {puntos.map(fila)}
        </ul>
      )}
    </div>
  );
}

function HeroCarrusel() {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [hover, setHover] = useState(false);

  const reducirMovimiento =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (pausado || hover || reducirMovimiento) return undefined;
    const id = setInterval(() => setActual((i) => (i + 1) % SLIDES.length), INTERVALO_MS);
    return () => clearInterval(id);
  }, [pausado, hover, reducirMovimiento]);

  const ir = (i: number) => setActual((i + SLIDES.length) % SLIDES.length);

  return (
    <section
      id="inicio"
      className="hero"
      aria-roledescription="carrusel"
      aria-label="Presentación de RAEE Smart"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="hero__fondo" aria-hidden="true">
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`hero__fondo-img${i === actual ? ' is-active' : ''}`}
            style={{ backgroundImage: `url(${s.fondo})` }}
          />
        ))}
        <div className="hero__fondo-velo" />
      </div>

      <div className="wrap">
        <div className="slides" aria-live={pausado || hover ? 'polite' : 'off'}>
          {SLIDES.map((s, i) => {
            const activo = i === actual;
            return (
              <article
                key={s.id}
                className={`slide${activo ? ' is-active' : ''}`}
                role="group"
                aria-roledescription="diapositiva"
                aria-label={`${i + 1} de ${SLIDES.length}`}
                aria-hidden={!activo}
              >
                <div className="slide__texto">
                  <span className="etiqueta">
                    <Icon name={s.icono} size={15} />
                    {s.etiqueta}
                  </span>
                  {i === 0 ? <h1>{s.titulo}</h1> : <h2 className="slide__h">{s.titulo}</h2>}
                  <p className="lead">{s.texto}</p>
                  <div className="botones">
                    <a className="btn btn--primario" href={s.cta.href} tabIndex={activo ? 0 : -1}>
                      {s.cta.texto}
                      <Icon name="chevronRight" size={16} />
                    </a>
                  </div>
                </div>
                <div className="slide__visual">
                  <TelefonoMock src={s.captura} alt={`Captura: ${s.etiqueta}`} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="controles">
          <button type="button" className="ctl" onClick={() => ir(actual - 1)} aria-label="Diapositiva anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <div className="puntos" role="tablist" aria-label="Elegir diapositiva">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === actual}
                aria-label={`Ir a la diapositiva ${i + 1}`}
                className={`punto${i === actual ? ' is-active' : ''}`}
                onClick={() => ir(i)}
              />
            ))}
          </div>
          <button type="button" className="ctl" onClick={() => ir(actual + 1)} aria-label="Diapositiva siguiente">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
          <button
            type="button"
            className="ctl ctl--texto"
            onClick={() => setPausado((p) => !p)}
            aria-pressed={pausado}
          >
            {pausado ? 'Reanudar' : 'Pausar'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <div className="landing">
      <header className="cabecera cabecera--sobrepuesto">
        <div className="wrap cabecera__fila">
          <a href="#inicio" className="marca" onClick={cerrarMenu}>
            <img className="marca__img" src="/logoRectangular.png" alt="RAEE Smart" />
          </a>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <Icon name={menuAbierto ? 'x' : 'menu'} size={24} />
          </button>
          <nav id="menu-principal" className={`nav${menuAbierto ? ' is-open' : ''}`} aria-label="Principal">
            <a href="#que-es" onClick={cerrarMenu}>
              ¿Qué son los RAEE?
            </a>
            <a href="#como" onClick={cerrarMenu}>
              ¿Cómo funciona?
            </a>
            <a href="#reciclar" onClick={cerrarMenu}>
              ¿Qué reciclar?
            </a>
            <a href="#puntos" onClick={cerrarMenu}>
              Puntos de entrega
            </a>
            <a href="/panel" className="nav__panel">
              <Icon name="dashboard" size={17} />
              Panel municipal
            </a>
          </nav>
        </div>
      </header>

      <main>
        <HeroCarrusel />

        <section id="que-es" className="seccion">
          <div className="wrap dos-col">
            <div className="col-titulo">
              <h2>¿Qué son los RAEE?</h2>
              <p className="lead lead--suave">
                Residuos de aparatos eléctricos y electrónicos: todo aparato que funcionaba con enchufe o batería y que
                ya no usas.
              </p>
            </div>
            <div className="col-cuerpo">
              <div className="texto-largo">
                <p>
                  Contienen metales que se pueden recuperar, como oro, plata y cobre. Si terminan en la basura común, esos
                  recursos se pierden y los componentes tóxicos pueden contaminar el suelo y el agua.
                </p>
              </div>
              <ul className="ejemplos">
                {CATEGORIAS.map((c) => (
                  <li key={c.nombre}>
                    <span className="ejemplos__icono" aria-hidden="true">
                      <Icon name={c.icono} size={18} />
                    </span>
                    {c.nombre}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="como" className="seccion seccion--blanca">
          <div className="wrap">
            <h2>Cómo funciona, en cuatro pasos</h2>
            <ol className="pasos">
              {PASOS.map((p, i) => (
                <li key={p.titulo}>
                  <span className="paso__icono" aria-hidden="true">
                    <Icon name={p.icono} size={24} />
                  </span>
                  <span className="paso__etiqueta">Paso {i + 1}</span>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="reciclar" className="seccion">
          <div className="wrap">
            <h2>Qué puedes entregar</h2>
            <p className="lead lead--suave">La app reconoce ocho categorías de aparatos.</p>
            <ul className="categorias">
              {CATEGORIAS.map((c) => (
                <li key={c.nombre}>
                  <span className="categoria__icono" aria-hidden="true">
                    <Icon name={c.icono} size={24} />
                  </span>
                  <h3>{c.nombre}</h3>
                  <p>{c.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="puntos" className="seccion seccion--blanca">
          <div className="wrap">
            <h2>Puntos de entrega</h2>
            <p className="lead lead--suave">
              Algunos de los puntos de acopio en Chiclayo y Lambayeque. En la app ves todos en el mapa, con campañas
              vigentes.
            </p>
            <div className="puntos-grid">
              <div className="puntos-mapa">
                <MapView puntos={PUNTOS} alto={440} zoom={10} />
              </div>
              <ListaPuntos puntos={PUNTOS} />
            </div>
          </div>
        </section>
      </main>

      <footer className="pie">
        <div className="wrap pie__top">
          <div className="pie__marca">
            <div>
              <img className="pie__logo" src="/logoRectangular.png" alt="RAEE Smart" />
            </div>
            <p>
              Recicla tus aparatos eléctricos y electrónicos en puntos oficiales y obtén tu certificado digital como
              constancia.
            </p>
          </div>
          <nav className="pie__col" aria-label="Explorar">
            <h4>Explora</h4>
            <a href="#que-es">Qué son los RAEE</a>
            <a href="#como">Cómo funciona</a>
            <a href="#reciclar">Qué reciclar</a>
            <a href="#puntos">Puntos de entrega</a>
          </nav>
          <nav className="pie__col" aria-label="Panel">
            <h4>Panel municipal</h4>
            <a href="/panel">Acceso para municipalidades</a>
            <a href="/login">Iniciar sesión</a>
          </nav>
          <div className="pie__col">
            <h4>Contacto</h4>
            <a href="https://www.munichiclayo.gob.pe/" target="_blank" rel="noreferrer">
              Municipalidad Provincial de Chiclayo
            </a>
            <span>UTP · Chiclayo, 2026</span>
          </div>
        </div>
        <div className="wrap pie__bottom">
          <span>© 2026 RAEE Smart · Proyecto académico de Innovación y Transformación Digital</span>
        </div>
      </footer>
    </div>
  );
}
