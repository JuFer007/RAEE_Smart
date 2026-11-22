import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import HorarioEditor from '../../components/HorarioEditor';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import PanelAlert from '../../components/PanelAlert';
import Button, { buttonClass } from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatusDot from '../../components/ui/StatusDot';
import type { StatusTone } from '../../components/ui/StatusDot';
import Tabs from '../../components/ui/Tabs';
import {
  actualizarCampana,
  cambiarEstadoCampana,
  crearCampana,
  eliminarCampana,
  listarCampanas,
  listarPuntos,
  type CampanaPayload,
} from '../../api/panel';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Campana, Punto } from '../../types';
import {
  fechaHoyISO,
  formatearFechaHora,
  formatearRango,
  obtenerMensajeError,
  pluralizar,
  sumarDias,
} from '../../utils/formato';
import {
  formatearHorario,
  horarioVacio,
  parsearHorario,
  validarHorario,
  type HorarioValor,
} from '../../utils/horario';

interface FormularioCampana {
  titulo: string;
  descripcion: string;
  lugar: string;
  puntoRecoleccionId: string;
  horario: HorarioValor;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
}

const hoy = fechaHoyISO();
const FORMULARIO_VACIO: FormularioCampana = {
  titulo: '',
  descripcion: '',
  lugar: '',
  puntoRecoleccionId: '',
  horario: horarioVacio(),
  fechaInicio: hoy,
  fechaFin: sumarDias(hoy, 14),
  activa: true,
};

type Filtro = 'TODAS' | 'ACTIVAS' | 'INACTIVAS' | 'FINALIZADAS';

const ETIQUETAS_ESTADO: Record<string, string> = {
  PROXIMA: 'Próxima',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  INACTIVA: 'Inactiva',
};

const TONOS_ESTADO: Record<string, StatusTone> = {
  PROXIMA: 'info',
  EN_CURSO: 'success',
  FINALIZADA: 'neutral',
  INACTIVA: 'neutral',
};

const MOTIVOS_DESACTIVACION = [
  'Finalizó anticipadamente',
  'Falta de personal o recursos',
  'Cambio de punto de acopio',
  'Error en fechas o datos',
  'Suspensión por seguridad o clima',
  'Otro',
];

function estadoCampana(campana: Campana): { label: string; tone: StatusTone } {
  if (!campana.activa) {
    return { label: 'Inactiva', tone: 'neutral' };
  }
  return {
    label: ETIQUETAS_ESTADO[campana.estado] ?? campana.estado,
    tone: TONOS_ESTADO[campana.estado] ?? 'neutral',
  };
}

export default function CampanasPage() {
  const { usuario } = useAuth();
  const { showToast } = useToast();
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('TODAS');

  const [modalCampana, setModalCampana] = useState(false);
  const [campanaEditando, setCampanaEditando] = useState<Campana | null>(null);
  const [formulario, setFormulario] = useState<FormularioCampana>(FORMULARIO_VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorFormulario, setErrorFormulario] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [campanaEliminar, setCampanaEliminar] = useState<Campana | null>(null);
  const [campanaReactivar, setCampanaReactivar] = useState<Campana | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);

  const [campanaMotivo, setCampanaMotivo] = useState<Campana | null>(null);
  const [motivoCategoria, setMotivoCategoria] = useState(MOTIVOS_DESACTIVACION[0]);
  const [motivoDetalle, setMotivoDetalle] = useState('');
  const [erroresMotivo, setErroresMotivo] = useState<Record<string, string>>({});
  const [guardandoMotivo, setGuardandoMotivo] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [campanasData, puntosData] = await Promise.all([
        listarCampanas(),
        listarPuntos(),
      ]);
      setCampanas(campanasData);
      setPuntos(puntosData);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const conteos = useMemo(
    () => ({
      TODAS: campanas.length,
      ACTIVAS: campanas.filter((campana) => campana.activa).length,
      INACTIVAS: campanas.filter((campana) => !campana.activa).length,
      FINALIZADAS: campanas.filter((campana) => campana.estado === 'FINALIZADA').length,
    }),
    [campanas],
  );

  const filtradas = useMemo(() => {
    switch (filtro) {
      case 'ACTIVAS':
        return campanas.filter((campana) => campana.activa);
      case 'INACTIVAS':
        return campanas.filter((campana) => !campana.activa);
      case 'FINALIZADAS':
        return campanas.filter((campana) => campana.estado === 'FINALIZADA');
      default:
        return campanas;
    }
  }, [campanas, filtro]);

  const abrirNueva = () => {
    setCampanaEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setErrores({});
    setErrorFormulario('');
    setModalCampana(true);
  };

  const abrirEditar = (campana: Campana) => {
    setCampanaEditando(campana);
    setFormulario({
      titulo: campana.titulo,
      descripcion: campana.descripcion ?? '',
      lugar: campana.lugar ?? '',
      puntoRecoleccionId: campana.puntoRecoleccionId
        ? String(campana.puntoRecoleccionId)
        : '',
      horario: parsearHorario(campana.horario) ?? horarioVacio(),
      fechaInicio: campana.fechaInicio.slice(0, 10),
      fechaFin: campana.fechaFin.slice(0, 10),
      activa: campana.activa,
    });
    setErrores({});
    setErrorFormulario('');
    setModalCampana(true);
  };

  const cerrarModal = () => {
    if (guardando || campanaMotivo) return;
    setModalCampana(false);
    setCampanaEditando(null);
    setErrorFormulario('');
  };

  const cambiarCampo = <K extends keyof FormularioCampana>(
    campo: K,
    valor: FormularioCampana[K],
  ) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => ({ ...actual, [campo]: '' }));
  };

  const seleccionarPunto = (id: string) => {
    const punto = puntos.find((item) => String(item.id) === id);
    setFormulario((actual) => ({
      ...actual,
      puntoRecoleccionId: id,
      lugar: actual.lugar.trim() ? actual.lugar : punto?.direccion ?? '',
      horario:
        actual.horario.dias.length || actual.horario.sinHorario
          ? actual.horario
          : parsearHorario(punto?.horarioAtencion) ?? horarioVacio(),
    }));
    setErrores((actual) => ({ ...actual, puntoRecoleccionId: '' }));
  };

  const validarFormulario = (): CampanaPayload | null => {
    const nuevosErrores: Record<string, string> = {};

    if (!formulario.titulo.trim()) {
      nuevosErrores.titulo = 'El título de la campaña es obligatorio.';
    } else if (formulario.titulo.trim().length > 150) {
      nuevosErrores.titulo = 'El título no debe superar los 150 caracteres.';
    }

    if (formulario.descripcion.trim().length > 500) {
      nuevosErrores.descripcion = 'La descripción no debe superar los 500 caracteres.';
    }

    if (formulario.lugar.trim().length > 200) {
      nuevosErrores.lugar = 'El lugar no debe superar los 200 caracteres.';
    }

    const errorHorario = validarHorario(formulario.horario, {
      obligatorio: false,
      permitirSinHorario: false,
      permitirVacio: true,
    });
    if (errorHorario) {
      nuevosErrores.horario = errorHorario;
    }

    if (!formulario.puntoRecoleccionId) {
      nuevosErrores.puntoRecoleccionId = 'Selecciona un punto de acopio.';
    }

    if (!formulario.fechaInicio) {
      nuevosErrores.fechaInicio = 'La fecha de inicio es obligatoria.';
    }

    if (!formulario.fechaFin) {
      nuevosErrores.fechaFin = 'La fecha de fin es obligatoria.';
    } else if (formulario.fechaInicio && formulario.fechaFin < formulario.fechaInicio) {
      nuevosErrores.fechaFin = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return null;

    if (!usuario?.municipalidadId) {
      setErrorFormulario('No se pudo identificar tu municipalidad.');
      return null;
    }

    return {
      municipalidadId: usuario.municipalidadId,
      titulo: formulario.titulo.trim(),
      descripcion: formulario.descripcion.trim(),
      lugar: formulario.lugar.trim(),
      puntoRecoleccionId: Number(formulario.puntoRecoleccionId),
      horario: formatearHorario(formulario.horario),
      fechaInicio: formulario.fechaInicio,
      fechaFin: formulario.fechaFin,
      activa: formulario.activa,
    };
  };

  const guardarCampana = async (evento: FormEvent) => {
    evento.preventDefault();
    setErrorFormulario('');
    const payload = validarFormulario();
    if (!payload) return;

    setGuardando(true);
    try {
      if (campanaEditando) {
        const actualizada = await actualizarCampana(campanaEditando.id, payload);
        setCampanas((actuales) =>
          actuales.map((campana) =>
            campana.id === actualizada.id ? actualizada : campana,
          ),
        );
        showToast('Campaña actualizada correctamente.');
      } else {
        const creada = await crearCampana(payload);
        setCampanas((actuales) => [creada, ...actuales]);
        showToast('Campaña creada correctamente.');
      }
      setModalCampana(false);
      setCampanaEditando(null);
    } catch (err) {
      setErrorFormulario(obtenerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarCambioEstado = async (
    campana: Campana,
    activa: boolean,
    motivo?: string,
  ) => {
    setCambiandoEstado(campana.id);
    try {
      const actualizada = await cambiarEstadoCampana(campana.id, activa, motivo);
      setCampanas((actuales) =>
        actuales.map((item) => (item.id === actualizada.id ? actualizada : item)),
      );
      setCampanaEditando((actual) =>
        actual && actual.id === actualizada.id ? actualizada : actual,
      );
      if (modalCampana && campanaEditando?.id === actualizada.id) {
        setFormulario((actual) => ({ ...actual, activa: actualizada.activa }));
      }
      showToast(
        actualizada.activa
          ? 'Campaña activada.'
          : 'Campaña desactivada. Motivo registrado.',
      );
      return actualizada;
    } catch (err) {
      showToast(obtenerMensajeError(err), 'error');
      return null;
    } finally {
      setCambiandoEstado(null);
    }
  };

  const abrirMotivoDesactivacion = (campana: Campana) => {
    setCampanaMotivo(campana);
    setMotivoCategoria(MOTIVOS_DESACTIVACION[0]);
    setMotivoDetalle('');
    setErroresMotivo({});
  };

  const cerrarMotivo = () => {
    if (guardandoMotivo) return;
    setCampanaMotivo(null);
    setErroresMotivo({});
  };

  const alternarActiva = (campana: Campana) => {
    if (campana.activa) {
      abrirMotivoDesactivacion(campana);
      return;
    }
    setCampanaReactivar(campana);
  };

  const cambiarActivaFormulario = (marcada: boolean) => {
    if (!campanaEditando) {
      cambiarCampo('activa', marcada);
      return;
    }
    if (marcada) {
      setCampanaReactivar(campanaEditando);
      return;
    }
    abrirMotivoDesactivacion(campanaEditando);
  };

  const motivoCompleto = motivoDetalle.trim()
    ? `${motivoCategoria}: ${motivoDetalle.trim()}`
    : motivoCategoria;

  const confirmarDesactivacion = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!campanaMotivo) return;

    const nuevosErrores: Record<string, string> = {};
    if (!motivoCategoria) {
      nuevosErrores.categoria = 'Selecciona un motivo.';
    }
    if (!motivoDetalle.trim()) {
      nuevosErrores.detalle = 'Describe el motivo de la desactivación.';
    } else if (motivoCompleto.length > 300) {
      nuevosErrores.detalle = 'El motivo no debe superar los 300 caracteres.';
    }
    setErroresMotivo(nuevosErrores);
    if (Object.keys(nuevosErrores).length) return;

    setGuardandoMotivo(true);
    try {
      const actualizada = await ejecutarCambioEstado(campanaMotivo, false, motivoCompleto);
      if (actualizada) {
        setCampanaMotivo(null);
        setErroresMotivo({});
      }
    } finally {
      setGuardandoMotivo(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!campanaEliminar) return;
    setEliminando(true);
    try {
      await eliminarCampana(campanaEliminar.id);
      setCampanas((actuales) =>
        actuales.filter((campana) => campana.id !== campanaEliminar.id),
      );
      showToast('Campaña eliminada correctamente.');
      setCampanaEliminar(null);
    } catch (err) {
      showToast(obtenerMensajeError(err), 'error');
      setCampanaEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <section className="campaigns-page">
      <PageHeader
        title="Campañas de recolección"
        description="Programa jornadas de acopio, asígnalas a un punto y controla su visibilidad."
        actions={
          <Button icon="plus" onClick={abrirNueva}>
            Nueva campaña
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

      <div className="campaigns-toolbar">
        <Tabs
          ariaLabel="Filtrar campañas"
          value={filtro}
          onChange={(value) => setFiltro(value as Filtro)}
          items={[
            { id: 'TODAS', label: 'Todas', count: conteos.TODAS },
            { id: 'ACTIVAS', label: 'Activas', count: conteos.ACTIVAS },
            { id: 'INACTIVAS', label: 'Inactivas', count: conteos.INACTIVAS },
            { id: 'FINALIZADAS', label: 'Finalizadas', count: conteos.FINALIZADAS },
          ]}
        />
        <span className="campaigns-toolbar__count">
          {pluralizar(filtradas.length, 'campaña', 'campañas')}
        </span>
      </div>

      {cargando ? (
        <div className="panel-loading">
          <span className="panel-spinner" />
          <span>Cargando campañas...</span>
        </div>
      ) : filtradas.length ? (
        <div className="campaign-list">
          {filtradas.map((campana) => {
            const estado = estadoCampana(campana);
            return (
              <article
                key={campana.id}
                className={`campaign-row${campana.activa ? '' : ' is-inactive'}`}
              >
                <div className="campaign-row__body">
                  <header>
                    <div className="campaign-row__heading">
                      <h3>{campana.titulo}</h3>
                      <StatusDot tone={estado.tone} label={estado.label} />
                    </div>
                    <button
                      type="button"
                      className={`panel-switch${campana.activa ? ' is-on' : ''}`}
                      role="switch"
                      aria-checked={campana.activa}
                      aria-label={`${campana.activa ? 'Desactivar' : 'Activar'} ${campana.titulo}`}
                      disabled={cambiandoEstado === campana.id}
                      onClick={() => alternarActiva(campana)}
                    >
                      <span />
                    </button>
                  </header>

                  {campana.descripcion ? (
                    <p className="campaign-row__description">{campana.descripcion}</p>
                  ) : null}

                  {!campana.activa ? (
                    <div className="campaign-motivo">
                      <Icon name="alert" size={15} />
                      <div>
                        <b>
                          {campana.motivoDesactivacion
                            ? 'Motivo de desactivación'
                            : 'Sin motivo registrado'}
                        </b>
                        {campana.motivoDesactivacion ? (
                          <span>{campana.motivoDesactivacion}</span>
                        ) : null}
                        {campana.fechaDesactivacion ? (
                          <small>
                            {formatearFechaHora(campana.fechaDesactivacion)}
                            {campana.desactivadaPor ? ` · ${campana.desactivadaPor}` : ''}
                          </small>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {!campana.puntoRecoleccionId ? (
                    <div className="inline-warning">
                      <Icon name="alert" size={15} />
                      <span>Esta campaña no tiene un punto asignado.</span>
                      <button type="button" onClick={() => abrirEditar(campana)}>
                        Asignar punto
                      </button>
                    </div>
                  ) : null}

                  <dl className="campaign-meta">
                    <div>
                      <dt>
                        <Icon name="calendar" size={14} /> Fechas
                      </dt>
                      <dd>{formatearRango(campana.fechaInicio, campana.fechaFin)}</dd>
                    </div>
                    <div>
                      <dt>
                        <Icon name="location" size={14} /> Punto
                      </dt>
                      <dd>{campana.puntoRecoleccionNombre || 'Sin punto asignado'}</dd>
                    </div>
                    <div>
                      <dt>
                        <Icon name="clock" size={14} /> Horario
                      </dt>
                      <dd>{campana.horario || 'Por confirmar'}</dd>
                    </div>
                    <div>
                      <dt>
                        <Icon name="map" size={14} /> Lugar
                      </dt>
                      <dd>{campana.lugar || 'Por confirmar'}</dd>
                    </div>
                  </dl>
                </div>

                <footer className="campaign-row__actions">
                  <button
                    type="button"
                    className={buttonClass('secondary')}
                    onClick={() => abrirEditar(campana)}
                  >
                    <Icon name="edit" size={15} />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="ui-text-danger"
                    onClick={() => setCampanaEliminar(campana)}
                  >
                    <Icon name="trash" size={15} />
                    Eliminar
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon="calendar"
          title={
            filtro === 'TODAS' ? 'Aún no hay campañas' : 'No hay campañas en este filtro'
          }
          description={
            filtro === 'TODAS'
              ? 'Crea la primera campaña para informar a los ciudadanos sobre la próxima jornada de acopio.'
              : 'Prueba con otro filtro o crea una nueva campaña.'
          }
          action={
            <Button icon="plus" onClick={abrirNueva}>
              Nueva campaña
            </Button>
          }
        />
      )}

      <Modal
        abierto={modalCampana}
        titulo={campanaEditando ? 'Editar campaña' : 'Nueva campaña'}
        descripcion="Define el punto de acopio, las fechas y la visibilidad de la campaña."
        ancho={740}
        onCerrar={cerrarModal}
      >
        <form className="panel-form" onSubmit={guardarCampana} noValidate>
          {errorFormulario ? <PanelAlert>{errorFormulario}</PanelAlert> : null}

          {!puntos.length ? (
            <PanelAlert variante="info">
              Primero registra un punto de acopio para poder crear campañas.
            </PanelAlert>
          ) : null}

          <div className="panel-field">
            <label htmlFor="campana-titulo">Título</label>
            <input
              id="campana-titulo"
              value={formulario.titulo}
              onChange={(evento) => cambiarCampo('titulo', evento.target.value)}
              placeholder="Ej. Jornada de acopio de RAEE"
              maxLength={150}
            />
            {errores.titulo ? (
              <span className="panel-field__error">{errores.titulo}</span>
            ) : null}
          </div>

          <div className="panel-field">
            <label htmlFor="campana-descripcion">Descripción</label>
            <textarea
              id="campana-descripcion"
              rows={3}
              value={formulario.descripcion}
              onChange={(evento) => cambiarCampo('descripcion', evento.target.value)}
              placeholder="Detalla qué residuos se recibirán y cualquier indicación para los vecinos."
              maxLength={500}
            />
            <span className="panel-field__contador">
              {formulario.descripcion.length}/500
            </span>
            {errores.descripcion ? (
              <span className="panel-field__error">{errores.descripcion}</span>
            ) : null}
          </div>

          <div className="panel-field">
            <label htmlFor="campana-punto">Punto de acopio</label>
            <select
              id="campana-punto"
              value={formulario.puntoRecoleccionId}
              onChange={(evento) => seleccionarPunto(evento.target.value)}
            >
              <option value="">Selecciona un punto</option>
              {puntos.map((punto) => (
                <option key={punto.id} value={punto.id}>
                  {punto.nombre}
                  {punto.direccion ? ` - ${punto.direccion}` : ''}
                </option>
              ))}
            </select>
            {errores.puntoRecoleccionId ? (
              <span className="panel-field__error">{errores.puntoRecoleccionId}</span>
            ) : null}
          </div>

          <div className="panel-form__grid2">
            <div className="panel-field">
              <label htmlFor="campana-fecha-inicio">Fecha de inicio</label>
              <input
                id="campana-fecha-inicio"
                type="date"
                value={formulario.fechaInicio}
                onChange={(evento) => cambiarCampo('fechaInicio', evento.target.value)}
              />
              {errores.fechaInicio ? (
                <span className="panel-field__error">{errores.fechaInicio}</span>
              ) : null}
            </div>

            <div className="panel-field">
              <label htmlFor="campana-fecha-fin">Fecha de fin</label>
              <input
                id="campana-fecha-fin"
                type="date"
                value={formulario.fechaFin}
                onChange={(evento) => cambiarCampo('fechaFin', evento.target.value)}
              />
              {errores.fechaFin ? (
                <span className="panel-field__error">{errores.fechaFin}</span>
              ) : null}
            </div>
          </div>

          <div className="panel-form__grid2">
            <div className="panel-field">
              <label htmlFor="campana-lugar">Lugar</label>
              <input
                id="campana-lugar"
                value={formulario.lugar}
                onChange={(evento) => cambiarCampo('lugar', evento.target.value)}
                placeholder="Se completa desde el punto"
                maxLength={200}
              />
              {errores.lugar ? (
                <span className="panel-field__error">{errores.lugar}</span>
              ) : null}
            </div>

            <HorarioEditor
              id="campana-horario"
              valor={formulario.horario}
              onChange={(valor) => cambiarCampo('horario', valor)}
              error={errores.horario}
              permitirSinHorario={false}
              ayuda="Se completa desde el punto de acopio; puedes ajustarlo."
            />
          </div>

          <label className="panel-check">
            <input
              type="checkbox"
              checked={formulario.activa}
              onChange={(evento) => cambiarActivaFormulario(evento.target.checked)}
            />
            <span>
              <b>Visible para los ciudadanos</b>
              <small>La campaña aparecerá en el portal público mientras esté vigente.</small>
            </span>
          </label>

          <div className="panel-form__acciones">
            <Button variant="secondary" onClick={cerrarModal} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando
                ? 'Guardando...'
                : campanaEditando
                  ? 'Guardar cambios'
                  : 'Crear campaña'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={Boolean(campanaMotivo)}
        titulo="Desactivar campaña"
        descripcion={`Registra por qué se retira "${campanaMotivo?.titulo ?? ''}" antes de su fecha de fin.`}
        ancho={520}
        onCerrar={cerrarMotivo}
      >
        <form className="panel-form" onSubmit={confirmarDesactivacion} noValidate>
          <div className="panel-field">
            <label htmlFor="motivo-categoria">Motivo</label>
            <select
              id="motivo-categoria"
              value={motivoCategoria}
              onChange={(evento) => {
                setMotivoCategoria(evento.target.value);
                setErroresMotivo((actual) => ({ ...actual, categoria: '' }));
              }}
            >
              {MOTIVOS_DESACTIVACION.map((motivo) => (
                <option key={motivo} value={motivo}>
                  {motivo}
                </option>
              ))}
            </select>
            {erroresMotivo.categoria ? (
              <span className="panel-field__error">{erroresMotivo.categoria}</span>
            ) : null}
          </div>

          <div className="panel-field">
            <label htmlFor="motivo-detalle">Detalle</label>
            <textarea
              id="motivo-detalle"
              rows={3}
              value={motivoDetalle}
              onChange={(evento) => {
                setMotivoDetalle(evento.target.value);
                setErroresMotivo((actual) => ({ ...actual, detalle: '' }));
              }}
              placeholder="Explica brevemente la situación para el registro interno."
              maxLength={300}
            />
            <span className="panel-field__contador">{motivoCompleto.length}/300</span>
            {erroresMotivo.detalle ? (
              <span className="panel-field__error">{erroresMotivo.detalle}</span>
            ) : null}
          </div>

          <div className="panel-form__acciones">
            <Button variant="secondary" onClick={cerrarMotivo} disabled={guardandoMotivo}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardandoMotivo}>
              {guardandoMotivo ? 'Desactivando...' : 'Desactivar campaña'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        abierto={Boolean(campanaEliminar)}
        titulo="Eliminar campaña"
        mensaje={`¿Seguro que deseas eliminar "${campanaEliminar?.titulo ?? ''}"? Esta acción no se puede deshacer.`}
        cargando={eliminando}
        onConfirmar={() => void confirmarEliminar()}
        onCerrar={() => {
          if (!eliminando) setCampanaEliminar(null);
        }}
      />

      <ConfirmDialog
        abierto={Boolean(campanaReactivar)}
        titulo="Reactivar campaña"
        mensaje={`¿Reactivar "${campanaReactivar?.titulo ?? ''}"? Volverá a mostrarse a los ciudadanos si está dentro de su vigencia.`}
        textoConfirmar="Reactivar"
        textoCargando="Reactivando..."
        variante="exito"
        icono="check"
        cargando={cambiandoEstado !== null}
        onConfirmar={() => {
          if (!campanaReactivar) return;
          void ejecutarCambioEstado(campanaReactivar, true).then(() =>
            setCampanaReactivar(null),
          );
        }}
        onCerrar={() => {
          if (cambiandoEstado === null) setCampanaReactivar(null);
        }}
      />
    </section>
  );
}
