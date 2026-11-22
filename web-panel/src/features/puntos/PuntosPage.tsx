import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import HorarioEditor from '../../components/HorarioEditor';
import Icon from '../../components/Icon';
import MapView from '../../components/MapView';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import PanelAlert from '../../components/PanelAlert';
import Button, { buttonClass } from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import {
  actualizarPunto,
  crearPunto,
  eliminarPunto,
  listarPuntos,
  type PuntoPayload,
} from '../../api/panel';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Punto } from '../../types';
import { obtenerMensajeError, pluralizar } from '../../utils/formato';
import {
  formatearHorario,
  horarioVacio,
  parsearHorario,
  validarHorario,
  type HorarioValor,
} from '../../utils/horario';
import { centroMunicipalidad, zoomMunicipalidad } from '../../utils/mapa';

interface FormularioPunto {
  nombre: string;
  direccion: string;
  latitud: string;
  longitud: string;
  horarioAtencion: HorarioValor;
  capacidadDiaria: string;
}

const FORMULARIO_VACIO: FormularioPunto = {
  nombre: '',
  direccion: '',
  latitud: '-6.771400',
  longitud: '-79.840900',
  horarioAtencion: horarioVacio(),
  capacidadDiaria: '',
};

type FiltroCapacidad = 'TODOS' | 'CON_CAPACIDAD' | 'SIN_CAPACIDAD';

export default function PuntosPage() {
  const { usuario } = useAuth();
  const { showToast } = useToast();
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroCapacidad, setFiltroCapacidad] = useState<FiltroCapacidad>('TODOS');

  const [modalPunto, setModalPunto] = useState(false);
  const [puntoEditando, setPuntoEditando] = useState<Punto | null>(null);
  const [formulario, setFormulario] = useState<FormularioPunto>(FORMULARIO_VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorFormulario, setErrorFormulario] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [puntoHorario, setPuntoHorario] = useState<Punto | null>(null);
  const [horario, setHorario] = useState<HorarioValor>(horarioVacio());
  const [errorHorario, setErrorHorario] = useState('');
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  const [puntoEliminar, setPuntoEliminar] = useState<Punto | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setPuntos(await listarPuntos());
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es');
    return puntos.filter((punto) => {
      const coincideTexto =
        !texto ||
        `${punto.nombre} ${punto.direccion ?? ''} ${punto.horarioAtencion ?? ''}`
          .toLocaleLowerCase('es')
          .includes(texto);
      if (!coincideTexto) return false;
      if (filtroCapacidad === 'CON_CAPACIDAD') return Boolean(punto.capacidadDiaria);
      if (filtroCapacidad === 'SIN_CAPACIDAD') return !punto.capacidadDiaria;
      return true;
    });
  }, [busqueda, filtroCapacidad, puntos]);

  const centroBase = useMemo(() => centroMunicipalidad(usuario), [usuario]);
  const zoomBase = useMemo(() => zoomMunicipalidad(usuario), [usuario]);

  const latitudMapa = Number(formulario.latitud);
  const longitudMapa = Number(formulario.longitud);
  const marcadorValido =
    Number.isFinite(latitudMapa) &&
    Number.isFinite(longitudMapa) &&
    latitudMapa >= -90 &&
    latitudMapa <= 90 &&
    longitudMapa >= -180 &&
    longitudMapa <= 180;

  const centroFormulario = useMemo<[number, number]>(() => {
    if (marcadorValido) return [latitudMapa, longitudMapa];
    return centroBase;
  }, [centroBase, latitudMapa, longitudMapa, marcadorValido]);

  const abrirNuevo = () => {
    const [latitud, longitud] = centroBase;
    setPuntoEditando(null);
    setFormulario({
      ...FORMULARIO_VACIO,
      latitud: latitud.toFixed(6),
      longitud: longitud.toFixed(6),
    });
    setErrores({});
    setErrorFormulario('');
    setModalPunto(true);
  };

  const abrirEditar = (punto: Punto) => {
    setPuntoEditando(punto);
    setFormulario({
      nombre: punto.nombre,
      direccion: punto.direccion ?? '',
      latitud: String(punto.latitud),
      longitud: String(punto.longitud),
      horarioAtencion: parsearHorario(punto.horarioAtencion) ?? horarioVacio(),
      capacidadDiaria: punto.capacidadDiaria ? String(punto.capacidadDiaria) : '',
    });
    setErrores({});
    setErrorFormulario('');
    setModalPunto(true);
  };

  const cerrarModalPunto = () => {
    if (guardando) return;
    setModalPunto(false);
    setPuntoEditando(null);
    setErrorFormulario('');
  };

  const cambiarCampo = (campo: keyof FormularioPunto, valor: string) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => ({ ...actual, [campo]: '' }));
  };

  const cambiarHorario = (valor: HorarioValor) => {
    setFormulario((actual) => ({ ...actual, horarioAtencion: valor }));
    setErrores((actual) => ({ ...actual, horarioAtencion: '' }));
  };

  const validarFormulario = (): PuntoPayload | null => {
    const nuevosErrores: Record<string, string> = {};
    const latitud = Number(formulario.latitud);
    const longitud = Number(formulario.longitud);
    const capacidad = formulario.capacidadDiaria.trim()
      ? Number(formulario.capacidadDiaria)
      : null;

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del punto es obligatorio.';
    } else if (formulario.nombre.trim().length > 150) {
      nuevosErrores.nombre = 'El nombre no debe superar los 150 caracteres.';
    }

    if (!formulario.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es obligatoria.';
    } else if (formulario.direccion.trim().length > 200) {
      nuevosErrores.direccion = 'La dirección no debe superar los 200 caracteres.';
    }

    if (!formulario.latitud.trim() || !Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
      nuevosErrores.latitud = 'Ingresa una latitud válida entre -90 y 90.';
    }

    if (
      !formulario.longitud.trim() ||
      !Number.isFinite(longitud) ||
      longitud < -180 ||
      longitud > 180
    ) {
      nuevosErrores.longitud = 'Ingresa una longitud válida entre -180 y 180.';
    }

    const errorHorario = validarHorario(formulario.horarioAtencion, {
      obligatorio: true,
      permitirSinHorario: true,
    });
    if (errorHorario) {
      nuevosErrores.horarioAtencion = errorHorario;
    }

    if (capacidad !== null && (!Number.isInteger(capacidad) || capacidad < 1)) {
      nuevosErrores.capacidadDiaria = 'La capacidad debe ser un número entero mayor a 0.';
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return null;

    if (!usuario?.municipalidadId) {
      setErrorFormulario('No se pudo identificar tu municipalidad.');
      return null;
    }

    return {
      municipalidadId: usuario.municipalidadId,
      nombre: formulario.nombre.trim(),
      direccion: formulario.direccion.trim(),
      latitud,
      longitud,
      horarioAtencion: formatearHorario(formulario.horarioAtencion),
      capacidadDiaria: capacidad,
    };
  };

  const guardarPunto = async (evento: FormEvent) => {
    evento.preventDefault();
    setErrorFormulario('');
    const payload = validarFormulario();
    if (!payload) return;

    setGuardando(true);
    try {
      if (puntoEditando) {
        const actualizado = await actualizarPunto(puntoEditando.id, payload);
        setPuntos((actuales) =>
          actuales.map((punto) => (punto.id === actualizado.id ? actualizado : punto)),
        );
        showToast('Punto actualizado correctamente.');
      } else {
        const creado = await crearPunto(payload);
        setPuntos((actuales) => [creado, ...actuales]);
        showToast('Punto registrado correctamente.');
      }
      setModalPunto(false);
      setPuntoEditando(null);
    } catch (err) {
      setErrorFormulario(obtenerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const abrirHorario = (punto: Punto) => {
    setPuntoHorario(punto);
    setHorario(parsearHorario(punto.horarioAtencion) ?? horarioVacio());
    setErrorHorario('');
  };

  const guardarHorario = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!puntoHorario) return;

    const errorHorario = validarHorario(horario, {
      obligatorio: true,
      permitirSinHorario: true,
    });
    if (errorHorario) {
      setErrorHorario(errorHorario);
      return;
    }
    if (!usuario?.municipalidadId) {
      setErrorHorario('No se pudo identificar tu municipalidad.');
      return;
    }

    setGuardandoHorario(true);
    setErrorHorario('');
    try {
      const actualizado = await actualizarPunto(puntoHorario.id, {
        municipalidadId: usuario.municipalidadId,
        nombre: puntoHorario.nombre,
        direccion: puntoHorario.direccion ?? '',
        latitud: puntoHorario.latitud,
        longitud: puntoHorario.longitud,
        horarioAtencion: formatearHorario(horario),
        capacidadDiaria: puntoHorario.capacidadDiaria ?? null,
      });
      setPuntos((actuales) =>
        actuales.map((punto) => (punto.id === actualizado.id ? actualizado : punto)),
      );
      setPuntoHorario(null);
      showToast('Horario actualizado. Los ciudadanos serán notificados del cambio.');
    } catch (err) {
      setErrorHorario(obtenerMensajeError(err));
    } finally {
      setGuardandoHorario(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!puntoEliminar) return;
    setEliminando(true);
    try {
      await eliminarPunto(puntoEliminar.id);
      setPuntos((actuales) => actuales.filter((punto) => punto.id !== puntoEliminar.id));
      showToast('Punto eliminado correctamente.');
      setPuntoEliminar(null);
    } catch (err) {
      showToast(obtenerMensajeError(err), 'error');
      setPuntoEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <section className="points-page">
      <PageHeader
        title="Puntos de entrega"
        description="Ubica, actualiza y mantén visible la red de puntos de entrega de tu municipalidad."
        actions={
          <Button icon="plus" onClick={abrirNuevo}>
            Nuevo punto
          </Button>
        }
      />

      {error ? (
        <PanelAlert onCerrar={() => setError('')}>
          {error}{' '}
          <button type="button" className="panel-alert__link" onClick={() => void cargar()}>
            Reintentar
          </button>
        </PanelAlert>
      ) : null}

      <div className="points-layout">
        <div className="points-column">
          <div className="filter-bar">
            <div className="ui-search">
              <Icon name="search" size={16} />
              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar por nombre, dirección u horario"
                aria-label="Buscar puntos de acopio"
              />
            </div>
            <select
              className="ui-select"
              value={filtroCapacidad}
              onChange={(evento) => setFiltroCapacidad(evento.target.value as FiltroCapacidad)}
              aria-label="Filtrar por capacidad"
            >
              <option value="TODOS">Todos</option>
              <option value="CON_CAPACIDAD">Con capacidad</option>
              <option value="SIN_CAPACIDAD">Sin capacidad</option>
            </select>
            <span className="filter-bar__count">
              {pluralizar(filtrados.length, 'punto', 'puntos')}
            </span>
          </div>

          {cargando ? (
            <div className="panel-loading">
              <span className="panel-spinner" />
              <span>Cargando puntos de acopio...</span>
            </div>
          ) : filtrados.length ? (
            <div className="point-list">
              {filtrados.map((punto) => (
                <article key={punto.id} className="point-card">
                  <header>
                    <div>
                      <h3>{punto.nombre}</h3>
                      <p>{punto.direccion || 'Sin dirección registrada'}</p>
                    </div>
                    <button
                      type="button"
                      className="ui-icon-btn ui-icon-btn--danger"
                      onClick={(evento) => {
                        evento.stopPropagation();
                        setPuntoEliminar(punto);
                      }}
                      aria-label={`Eliminar ${punto.nombre}`}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </header>

                  <dl className="point-meta">
                    <div>
                      <dt>Horario</dt>
                      <dd>{punto.horarioAtencion || 'Por confirmar'}</dd>
                    </div>
                    <div>
                      <dt>Capacidad diaria</dt>
                      <dd>
                        {punto.capacidadDiaria
                          ? `${punto.capacidadDiaria} equipos`
                          : 'No definida'}
                      </dd>
                    </div>
                    <div>
                      <dt>Coordenadas</dt>
                      <dd>
                        {punto.latitud.toFixed(5)}, {punto.longitud.toFixed(5)}
                      </dd>
                    </div>
                  </dl>

                  <footer>
                    <button
                      type="button"
                      className={buttonClass('ghost')}
                      onClick={(evento) => {
                        evento.stopPropagation();
                        abrirEditar(punto);
                      }}
                    >
                      <Icon name="edit" size={15} />
                      Editar
                    </button>
                    <button
                      type="button"
                      className={buttonClass('ghost')}
                      onClick={(evento) => {
                        evento.stopPropagation();
                        abrirHorario(punto);
                      }}
                    >
                      <Icon name="clock" size={15} />
                      Horario
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={busqueda ? 'search' : 'location'}
              title={busqueda ? 'Sin resultados' : 'Aún no hay puntos de acopio'}
              description={
                busqueda
                  ? 'Prueba con otro nombre, dirección u horario.'
                  : 'Registra el primer punto para que los ciudadanos puedan ubicarlo en el mapa.'
              }
              action={
                !busqueda ? (
                  <Button icon="plus" onClick={abrirNuevo}>
                    Registrar punto
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>

        <aside className="points-map">
          <div className="points-map__header">
            <div>
              <h3>Mapa de puntos</h3>
              <p>{usuario?.municipalidadNombre}</p>
            </div>
          </div>
          <MapView puntos={filtrados} centro={centroBase} zoom={zoomBase} alto={560} />
        </aside>
      </div>

      <Modal
        abierto={modalPunto}
        titulo={puntoEditando ? 'Editar punto de acopio' : 'Nuevo punto de acopio'}
        descripcion="Completa la ubicación y el horario de atención del punto."
        ancho={700}
        onCerrar={cerrarModalPunto}
      >
        <form className="panel-form" onSubmit={guardarPunto} noValidate>
          {errorFormulario ? <PanelAlert>{errorFormulario}</PanelAlert> : null}

          <div className="panel-field">
            <label htmlFor="punto-nombre">Nombre del punto</label>
            <input
              id="punto-nombre"
              value={formulario.nombre}
              onChange={(evento) => cambiarCampo('nombre', evento.target.value)}
              placeholder="Ej. Municipalidad de Chiclayo"
              maxLength={150}
            />
            {errores.nombre ? <span className="panel-field__error">{errores.nombre}</span> : null}
          </div>

          <div className="panel-field">
            <label htmlFor="punto-direccion">Dirección</label>
            <input
              id="punto-direccion"
              value={formulario.direccion}
              onChange={(evento) => cambiarCampo('direccion', evento.target.value)}
              placeholder="Ej. Plaza de Armas de Chiclayo"
              maxLength={200}
            />
            {errores.direccion ? (
              <span className="panel-field__error">{errores.direccion}</span>
            ) : null}
          </div>

          <div className="panel-form__grid2">
            <div className="panel-field">
              <label htmlFor="punto-latitud">Latitud</label>
              <input
                id="punto-latitud"
                inputMode="decimal"
                value={formulario.latitud}
                onChange={(evento) => cambiarCampo('latitud', evento.target.value)}
              />
              {errores.latitud ? (
                <span className="panel-field__error">{errores.latitud}</span>
              ) : null}
            </div>

            <div className="panel-field">
              <label htmlFor="punto-longitud">Longitud</label>
              <input
                id="punto-longitud"
                inputMode="decimal"
                value={formulario.longitud}
                onChange={(evento) => cambiarCampo('longitud', evento.target.value)}
              />
              {errores.longitud ? (
                <span className="panel-field__error">{errores.longitud}</span>
              ) : null}
            </div>
          </div>

          <HorarioEditor
            id="punto-horario"
            valor={formulario.horarioAtencion}
            onChange={cambiarHorario}
            error={errores.horarioAtencion}
            obligatorio
          />

          <div className="panel-field">
            <label htmlFor="punto-capacidad">Capacidad diaria</label>
            <input
              id="punto-capacidad"
              type="number"
              min="1"
              value={formulario.capacidadDiaria}
              onChange={(evento) => cambiarCampo('capacidadDiaria', evento.target.value)}
              placeholder="Opcional"
            />
            {errores.capacidadDiaria ? (
              <span className="panel-field__error">{errores.capacidadDiaria}</span>
            ) : null}
          </div>

          <div className="panel-field">
            <label>Ubicación en el mapa</label>
            <MapView
              centro={centroFormulario}
              zoom={15}
              alto={280}
              marcador={marcadorValido ? { latitud: latitudMapa, longitud: longitudMapa } : null}
              onSeleccionar={(latitud, longitud) => {
                setFormulario((actual) => ({
                  ...actual,
                  latitud: latitud.toFixed(6),
                  longitud: longitud.toFixed(6),
                }));
                setErrores((actual) => ({ ...actual, latitud: '', longitud: '' }));
              }}
            />
          </div>

          <div className="panel-form__acciones">
            <Button variant="secondary" onClick={cerrarModalPunto} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : puntoEditando ? 'Guardar cambios' : 'Registrar punto'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={Boolean(puntoHorario)}
        titulo="Editar horario de atención"
        descripcion={puntoHorario?.nombre}
        ancho={460}
        onCerrar={() => {
          if (!guardandoHorario) setPuntoHorario(null);
        }}
      >
        <form className="panel-form" onSubmit={guardarHorario} noValidate>
          {errorHorario ? <PanelAlert>{errorHorario}</PanelAlert> : null}
          <HorarioEditor
            id="horario-punto"
            valor={horario}
            onChange={(valor) => {
              setHorario(valor);
              setErrorHorario('');
            }}
            error={errorHorario}
            ayuda="Al guardar se notificará a los ciudadanos sobre el cambio de horario."
            obligatorio
          />
          <div className="panel-form__acciones">
            <Button
              variant="secondary"
              onClick={() => setPuntoHorario(null)}
              disabled={guardandoHorario}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardandoHorario}>
              {guardandoHorario ? 'Guardando...' : 'Guardar horario'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        abierto={Boolean(puntoEliminar)}
        titulo="Eliminar punto de acopio"
        mensaje={`¿Seguro que deseas eliminar "${puntoEliminar?.nombre ?? ''}"? Esta acción no se puede deshacer.`}
        cargando={eliminando}
        onConfirmar={() => void confirmarEliminar()}
        onCerrar={() => {
          if (!eliminando) setPuntoEliminar(null);
        }}
      />
    </section>
  );
}
