import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import PanelAlert from '../../components/PanelAlert';
import Button, { buttonClass } from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import StatusDot from '../../components/ui/StatusDot';
import {
  actualizarMunicipalidad,
  cambiarEstadoMunicipalidad,
  crearMunicipalidad,
  listarMunicipalidades,
  type MunicipalidadPayload,
} from '../../api/panel';
import { useToast } from '../../context/ToastContext';
import type { Municipalidad } from '../../types';
import { obtenerMensajeError, pluralizar } from '../../utils/formato';

interface FormularioMunicipalidad {
  nombre: string;
  distrito: string;
  direccion: string;
  latitud: string;
  longitud: string;
  contactoEmail: string;
  activo: boolean;
  campanasHabilitadas: boolean;
}

const FORMULARIO_VACIO: FormularioMunicipalidad = {
  nombre: '',
  distrito: '',
  direccion: '',
  latitud: '-6.7714',
  longitud: '-79.8409',
  contactoEmail: '',
  activo: true,
  campanasHabilitadas: false,
};

export default function MunicipalidadesPage() {
  const { showToast } = useToast();
  const [municipalidades, setMunicipalidades] = useState<Municipalidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Municipalidad | null>(null);
  const [formulario, setFormulario] = useState<FormularioMunicipalidad>(FORMULARIO_VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorFormulario, setErrorFormulario] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      setMunicipalidades(await listarMunicipalidades());
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const filtradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es');
    if (!texto) return municipalidades;
    return municipalidades.filter((municipalidad) =>
      `${municipalidad.nombre} ${municipalidad.distrito} ${municipalidad.contactoEmail ?? ''}`
        .toLocaleLowerCase('es')
        .includes(texto),
    );
  }, [busqueda, municipalidades]);

  const activas = municipalidades.filter((municipalidad) => municipalidad.activo).length;
  const conCampanas = municipalidades.filter(
    (municipalidad) => municipalidad.campanasHabilitadas,
  ).length;

  const abrirNueva = () => {
    setEditando(null);
    setFormulario(FORMULARIO_VACIO);
    setErrores({});
    setErrorFormulario('');
    setModalAbierto(true);
  };

  const abrirEdicion = (municipalidad: Municipalidad) => {
    setEditando(municipalidad);
    setFormulario({
      nombre: municipalidad.nombre,
      distrito: municipalidad.distrito,
      direccion: municipalidad.direccion ?? '',
      latitud: municipalidad.latitud !== null && municipalidad.latitud !== undefined
        ? String(municipalidad.latitud)
        : '',
      longitud: municipalidad.longitud !== null && municipalidad.longitud !== undefined
        ? String(municipalidad.longitud)
        : '',
      contactoEmail: municipalidad.contactoEmail ?? '',
      activo: Boolean(municipalidad.activo),
      campanasHabilitadas: Boolean(municipalidad.campanasHabilitadas),
    });
    setErrores({});
    setErrorFormulario('');
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (guardando) return;
    setModalAbierto(false);
    setEditando(null);
    setErrorFormulario('');
  };

  const cambiarCampo = <K extends keyof FormularioMunicipalidad>(
    campo: K,
    valor: FormularioMunicipalidad[K],
  ) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
    setErrores((actual) => ({ ...actual, [campo]: '' }));
  };

  const validar = (): MunicipalidadPayload | null => {
    const nuevos: Record<string, string> = {};
    const latitud = Number(formulario.latitud);
    const longitud = Number(formulario.longitud);

    if (!formulario.nombre.trim()) {
      nuevos.nombre = 'El nombre es obligatorio.';
    } else if (formulario.nombre.trim().length > 150) {
      nuevos.nombre = 'El nombre no debe superar los 150 caracteres.';
    }

    if (!formulario.distrito.trim()) {
      nuevos.distrito = 'El distrito es obligatorio.';
    } else if (formulario.distrito.trim().length > 100) {
      nuevos.distrito = 'El distrito no debe superar los 100 caracteres.';
    }

    if (formulario.direccion.trim().length > 250) {
      nuevos.direccion = 'La dirección no debe superar los 250 caracteres.';
    }

    if (!formulario.latitud.trim() || Number.isNaN(latitud) || latitud < -90 || latitud > 90) {
      nuevos.latitud = 'Ingresa una latitud válida entre -90 y 90.';
    }

    if (
      !formulario.longitud.trim() ||
      Number.isNaN(longitud) ||
      longitud < -180 ||
      longitud > 180
    ) {
      nuevos.longitud = 'Ingresa una longitud válida entre -180 y 180.';
    }

    if (formulario.contactoEmail.trim().length > 150) {
      nuevos.contactoEmail = 'El correo no debe superar los 150 caracteres.';
    } else if (
      formulario.contactoEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.contactoEmail.trim())
    ) {
      nuevos.contactoEmail = 'Ingresa un correo válido.';
    }

    setErrores(nuevos);
    if (Object.keys(nuevos).length) return null;

    return {
      nombre: formulario.nombre.trim(),
      distrito: formulario.distrito.trim(),
      direccion: formulario.direccion.trim(),
      latitud,
      longitud,
      contactoEmail: formulario.contactoEmail.trim(),
      activo: formulario.activo,
      campanasHabilitadas: formulario.campanasHabilitadas,
    };
  };

  const guardar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErrorFormulario('');
    const payload = validar();
    if (!payload) return;

    setGuardando(true);
    try {
      if (editando) {
        const actualizada = await actualizarMunicipalidad(editando.id, payload);
        setMunicipalidades((actuales) =>
          actuales.map((municipalidad) =>
            municipalidad.id === actualizada.id ? actualizada : municipalidad,
          ),
        );
        showToast('Municipalidad actualizada correctamente.');
      } else {
        const creada = await crearMunicipalidad(payload);
        setMunicipalidades((actuales) => [...actuales, creada]);
        showToast('Municipalidad registrada correctamente.');
      }
      setModalAbierto(false);
      setEditando(null);
    } catch (err) {
      setErrorFormulario(obtenerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const alternarEstado = async (municipalidad: Municipalidad) => {
    setCambiandoEstado(municipalidad.id);
    try {
      const actualizada = await cambiarEstadoMunicipalidad(
        municipalidad.id,
        !municipalidad.activo,
      );
      setMunicipalidades((actuales) =>
        actuales.map((item) => (item.id === actualizada.id ? actualizada : item)),
      );
      showToast(
        actualizada.activo
          ? 'Municipalidad activada. Ya puede operar en la plataforma.'
          : 'Municipalidad desactivada. No podrá registrar nuevas entregas.',
      );
    } catch (err) {
      showToast(obtenerMensajeError(err), 'error');
    } finally {
      setCambiandoEstado(null);
    }
  };

  return (
    <section>
      <PageHeader
        title="Municipalidades"
        description="Registra y administra los gobiernos locales que operan en RAEE Smart."
        actions={
          <Button icon="plus" onClick={abrirNueva}>
            Nueva municipalidad
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

      <section className="ui-stats">
        <StatCard
          label="Municipalidades"
          value={municipalidades.length}
          description="Registradas en la plataforma"
          icon="building"
        />
        <StatCard
          label="Activas"
          value={activas}
          description="Operando actualmente"
          icon="checkCircle"
          tone="success"
        />
        <StatCard
          label="Con campañas"
          value={conCampanas}
          description="Habilitadas para campañas"
          icon="calendar"
        />
      </section>

      <Card>
        <div className="filter-bar">
          <div className="ui-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar por nombre, distrito o correo"
              aria-label="Buscar municipalidades"
            />
          </div>
          <span className="filter-bar__count">
            {pluralizar(filtradas.length, 'municipalidad', 'municipalidades')}
          </span>
        </div>

        {cargando ? (
          <div className="panel-loading">
            <span className="panel-spinner" />
            <span>Cargando municipalidades...</span>
          </div>
        ) : filtradas.length ? (
          <div className="ui-table-wrap">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Municipalidad</th>
                  <th>Contacto</th>
                  <th>Campañas</th>
                  <th>Estado</th>
                  <th aria-label="Acciones" />
                </tr>
              </thead>
              <tbody>
                {filtradas.map((municipalidad) => (
                  <tr key={municipalidad.id}>
                    <td>
                      <span className="ui-table__main">{municipalidad.nombre}</span>
                      <span className="ui-table__sub">
                        {municipalidad.distrito}
                        {municipalidad.direccion ? ` · ${municipalidad.direccion}` : ''}
                      </span>
                    </td>
                    <td className="ui-table__muted">
                      {municipalidad.contactoEmail || 'Sin correo de contacto'}
                    </td>
                    <td>
                      <StatusDot
                        tone={municipalidad.campanasHabilitadas ? 'success' : 'neutral'}
                        label={municipalidad.campanasHabilitadas ? 'Habilitadas' : 'No habilitadas'}
                      />
                    </td>
                    <td>
                      <StatusDot
                        tone={municipalidad.activo ? 'success' : 'neutral'}
                        label={municipalidad.activo ? 'Activa' : 'Inactiva'}
                      />
                    </td>
                    <td className="ui-table__actions">
                      <button
                        type="button"
                        className={buttonClass('ghost')}
                        onClick={() => abrirEdicion(municipalidad)}
                      >
                        <Icon name="edit" size={15} />
                        Editar
                      </button>
                      <button
                        type="button"
                        className={buttonClass('ghost')}
                        onClick={() => void alternarEstado(municipalidad)}
                        disabled={cambiandoEstado === municipalidad.id}
                      >
                        <Icon
                          name={municipalidad.activo ? 'x' : 'check'}
                          size={15}
                        />
                        {cambiandoEstado === municipalidad.id
                          ? 'Guardando...'
                          : municipalidad.activo
                            ? 'Desactivar'
                            : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={busqueda ? 'search' : 'building'}
            title={busqueda ? 'Sin resultados' : 'Aún no hay municipalidades'}
            description={
              busqueda
                ? 'Prueba con otro nombre o distrito.'
                : 'Registra la primera municipalidad para que sus puntos y campañas aparezcan en la plataforma.'
            }
            action={
              !busqueda ? (
                <Button icon="plus" onClick={abrirNueva}>
                  Nueva municipalidad
                </Button>
              ) : undefined
            }
            compact
          />
        )}
      </Card>

      <Modal
        abierto={modalAbierto}
        titulo={editando ? 'Editar municipalidad' : 'Nueva municipalidad'}
        descripcion={
          editando
            ? 'Actualiza los datos de contacto y la configuración operativa.'
            : 'Completa los datos del gobierno local que operará en la plataforma.'
        }
        ancho={600}
        onCerrar={cerrarModal}
      >
        <form className="panel-form" onSubmit={guardar} noValidate>
          {errorFormulario ? <PanelAlert>{errorFormulario}</PanelAlert> : null}

          <div className="panel-form__grid2">
            <div className="panel-field">
              <label htmlFor="muni-nombre">Nombre</label>
              <input
                id="muni-nombre"
                value={formulario.nombre}
                onChange={(evento) => cambiarCampo('nombre', evento.target.value)}
                placeholder="Municipalidad Provincial de Chiclayo"
                maxLength={150}
                autoFocus
              />
              {errores.nombre ? <small className="panel-field__error">{errores.nombre}</small> : null}
            </div>
            <div className="panel-field">
              <label htmlFor="muni-distrito">Distrito</label>
              <input
                id="muni-distrito"
                value={formulario.distrito}
                onChange={(evento) => cambiarCampo('distrito', evento.target.value)}
                placeholder="Chiclayo"
                maxLength={100}
              />
              {errores.distrito ? (
                <small className="panel-field__error">{errores.distrito}</small>
              ) : null}
            </div>
          </div>

          <div className="panel-field">
            <label htmlFor="muni-direccion">Dirección</label>
            <input
              id="muni-direccion"
              value={formulario.direccion}
              onChange={(evento) => cambiarCampo('direccion', evento.target.value)}
              placeholder="Av. José Balta 400"
              maxLength={250}
            />
            {errores.direccion ? (
              <small className="panel-field__error">{errores.direccion}</small>
            ) : null}
          </div>

          <div className="panel-form__grid2">
            <div className="panel-field">
              <label htmlFor="muni-latitud">Latitud</label>
              <input
                id="muni-latitud"
                type="number"
                step="0.000001"
                value={formulario.latitud}
                onChange={(evento) => cambiarCampo('latitud', evento.target.value)}
                placeholder="-6.7714"
              />
              {errores.latitud ? (
                <small className="panel-field__error">{errores.latitud}</small>
              ) : null}
            </div>
            <div className="panel-field">
              <label htmlFor="muni-longitud">Longitud</label>
              <input
                id="muni-longitud"
                type="number"
                step="0.000001"
                value={formulario.longitud}
                onChange={(evento) => cambiarCampo('longitud', evento.target.value)}
                placeholder="-79.8409"
              />
              {errores.longitud ? (
                <small className="panel-field__error">{errores.longitud}</small>
              ) : null}
            </div>
          </div>

          <div className="panel-field">
            <label htmlFor="muni-email">Correo de contacto</label>
            <input
              id="muni-email"
              type="email"
              value={formulario.contactoEmail}
              onChange={(evento) => cambiarCampo('contactoEmail', evento.target.value)}
              placeholder="contacto@municipalidad.gob.pe"
              maxLength={150}
            />
            {errores.contactoEmail ? (
              <small className="panel-field__error">{errores.contactoEmail}</small>
            ) : null}
          </div>

          <div className="form-switches">
            <label className="panel-check">
              <input
                type="checkbox"
                checked={formulario.activo}
                onChange={(evento) => cambiarCampo('activo', evento.target.checked)}
              />
              <span>
                <b>Municipalidad activa</b>
                <small>Puede operar y recibir entregas.</small>
              </span>
            </label>
            <label className="panel-check">
              <input
                type="checkbox"
                checked={formulario.campanasHabilitadas}
                onChange={(evento) => cambiarCampo('campanasHabilitadas', evento.target.checked)}
              />
              <span>
                <b>Habilitar campañas</b>
                <small>Permite publicar campañas de recolección.</small>
              </span>
            </label>
          </div>

          <div className="panel-form__acciones">
            <Button variant="secondary" onClick={cerrarModal} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Registrar municipalidad'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
